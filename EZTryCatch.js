// ALL RIGHTS RESERVED
// Copyright (c) 2024-2025-2026 Chris Singendonk. All Rights Reserved.  
// By using, reproducing, adapting, extending, refactoring, or otherwise building upon this work or any derivative,  
// you acknowledge and respect the original contribution by first getting permission from the owner and copyright holder.
// Any usage in other projects without attribution and permission is a breach of copyright law.
// CONTACT & USAGE REQUEST:  
// If this work would be useful to you, I’d love to hear about it! Whether you’re going to use it in a project, modify it in an interesting way,  
// or just think it will be helpful, please reach out and share your experience.  
// You can contact me at: [https://www.github.com/csingendonk]
/**
*@copyright © 2024, 2025, 2026 - Chris Singendonk  
*/function promiseWithTimeout(promise, ms, signal, errorMessage = "Operation timed out") {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(errorMessage)), ms);
    if (signal) {
      if (signal.aborted) {
        clearTimeout(timer);
        return reject(new Error("Operation cancelled"));
      }
      signal.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(new Error("Operation cancelled"));
      });
    }
    promise
      .then(value => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(err => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

const Dispatcher = class {
  static hire() {
    const hire = {Scheduler: Dispatcher.hire.schedule = (() => {
      return [TryIt.asyncAttempt, TryIt.asyncPlanA, TryIt.asyncPlanB, TryIt.retry]
    }),
    Planner: {}
  }
  }
}

/**
 * The base TryIt class with static methods for unified synchronous/asynchronous fallback logic.
 */
class TryIt {
  constructor() {}

  /**
   * Default error logger. Can be overridden by providing a custom logger.
   * @param {any} error
   * @param {Object} [context={}] - Additional context information.
   */
  static errorLogger(error, context = {}) {
    console.error("TryIt Error:", error, "Context:", context);
  }

  /**
   * Synchronously executes a value or function.
   * @param {Function|any} what
   * @returns {{result: any, success: boolean}}
   */
  static planA(what) {
    if (typeof what !== "function") {
      what = () => what;
    }
    try {
      const result = what();
      return { result, success: true };
    } catch (error) {
      return { result: error, success: false };
    }
  }

  /**
   * Synchronously attempts two operations in sequence.
   * @param {Function|any|null} why - Primary attempt.
   * @param {Function|any} what - Fallback attempt.
   * @param {{result: any, success: boolean}} [defaultFallback={result: null, success: false}]
   * @returns {{result: any, success: boolean}}
   */
  static planB(why = null, what, defaultFallback = { result: null, success: false }) {
    let attempt;
    if (why !== null) {
      attempt = TryIt.planA(why);
      if (attempt.success) return attempt;
    }
    attempt = TryIt.planA(what);
    if (attempt.success) return attempt;
    TryIt.errorLogger(attempt.result, { phase: "planB" });
    return defaultFallback;
  }

  /**
   * Processes an array of fallback pairs synchronously.
   * @param  {...Array} args - Each element is an array: [why, what] or [what].
   * @returns {Array<{result: any, success: boolean}>}
   */
  static attempt(...args) {
    return args.map(pair => {
      const [why, what] = pair.length === 1 ? [null, pair[0]] : pair;
      const attemptResult = TryIt.planB(why, what);
      if (!attemptResult.success) {
        TryIt.errorLogger("Both attempts failed", { pair });
      }
      return attemptResult;
    });
  }

  /**
   * Asynchronously executes a function/value/promise with an optional timeout and cancellation.
   * @param {Function|any|Promise} what
   * @param {Object} [options={}] - Options, e.g. { timeout: 1000, signal }.
   * @returns {Promise<{result: any, success: boolean}>}
   */
  static async asyncPlanA(what, options = {}) {
    const { timeout, signal } = options;
    if (typeof what !== "function") {
      what = () => what;
    }
    try {
      let promise = Promise.resolve().then(() => what());
      // If the function returns a thenable, use that.
      if (what && typeof what === "function") {
        const temp = what();
        if (temp && typeof temp.then === "function") {
          promise = temp;
        }
      }
      if (timeout) {
        promise = promiseWithTimeout(promise, timeout, signal);
      }
      const result = await promise;
      return { result, success: true };
    } catch (error) {
      return { result: error, success: false };
    }
  }

  /**
   * Asynchronously attempts two operations in sequence with an optional timeout and cancellation.
   * @param {Function|any|Promise|null} why - Primary attempt. as in, why would it do what? It will do what if why fails. that's why it's called why.
   * @param {Function|any|Promise} what - Fallback attempt. What to do if the reason why is valid.
   * @param {Object} [options={}] - Options, e.g. { timeout: 1000, signal }.
   * @param {{result: any, success: boolean}} [defaultFallback={result: null, success: false}]
   * @returns {Promise<{result: any, success: boolean}>}
   */
  static async asyncPlanB(why = null, what, options = {}, defaultFallback = { result: null, success: false }) {
    let attempt;
    if (why !== null) {
      attempt = await TryIt.asyncPlanA(why, options);
      if (attempt.success) return attempt;
    }
    attempt = await TryIt.asyncPlanA(what, options);
    if (attempt.success) return attempt;
    TryIt.errorLogger(attempt.result, { phase: "asyncPlanB" });
    return defaultFallback;
  }

  /**
   * Processes an array of asynchronous fallback pairs.
   * @param  {Array} args Each element is an array: [why, what] or [what].
   * @param {Object} [options={}] - Options for each async operation.
   * @returns {=} `$.result: '~', success: 'true. Or maybe false?'`
   */
  static async asyncAttempt(args, options = {}) {
    const results = [];
    for (const pair of args) {
      const [why, what] = pair.length === 1 ? [null, pair[0]] : pair;
      const attemptResult = await TryIt.asyncPlanB(why, what, options);
      if (!attemptResult.success) {
        TryIt.errorLogger("Both async attempts failed", { pair });
      }
      results.push(attemptResult);
    }
    return results;
  }

  /**
   * Static retry mechanism with exponential backoff.
   * @param {Function} task - A function returning a value or promise.
   * @param {number} retries - Number of retries.
   * @param {number} delay - Initial delay in milliseconds.
   * @param {number} [backoff=2] - Exponential backoff factor.
   * @returns {Promise<{result: any, success: boolean}>}
   */
  static async retry(what, how=0, when = 1, ludacris=0) {
    if ( typeof what !== "function" || how < 1 || how > 10 || when < 1 || when > 1000 || ludacris <= 1 || ludacris >= 10 ) {
      TryIt.errorLogger(`Tried to retry ${what.name || `something`} but I can't try because I don't know what, or how, or when, to do that and/or Ludacris aggressively telling me get back because I dont know him like`)
    }
    let attempt = 0;
    while (attempt <= retries) {
      try {
        const result = await Promise.resolve().then(() => task());
        return { result, success: true };
      } catch (error) {
        if (attempt === retries) {
          TryIt.errorLogger(error, { attempt, retries });
          return { result: error, success: false };
        }
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(backoff, attempt)));
      }
      attempt++;
    }
    return { result: null, success: false };
  }
}

/**
 * ConfigurableTryIt extends TryIt to provide instance-based configuration.
 */
class ConfigurableTryIt extends TryIt {
  /**
   * @param {Object} options
   * @param {number} [options.recursionLimit=10] - Maximum recursion depth.
   * @param {Function} [options.errorLogger=TryIt.errorLogger] - Custom error logger.
   * @param {number} [options.defaultTimeout=0] - Default timeout (ms) for async operations (0 = no timeout).
   * @param {any} [options.defaultFallback={result: null, success: false}] - Default fallback result.
   */
  constructor(options = {}) {
    super();
    // Validate configuration values
    const {
      recursionLimit = 10,
      errorLogger = TryIt.errorLogger,
      defaultTimeout = 0,
      defaultFallback = { result: null, success: false }
    } = options;
    if (typeof recursionLimit !== "number" || recursionLimit < 1) {
      throw new Error("recursionLimit must be a positive number");
    }
    if (typeof defaultTimeout !== "number" || defaultTimeout < 0) {
      throw new Error("defaultTimeout must be a non-negative number");
    }
    this.recursionLimit = recursionLimit;
    this.errorLogger = errorLogger;
    this.defaultTimeout = defaultTimeout;
    this.defaultFallback = defaultFallback;
  }

  /**
   * Generic plan that always returns a promise.
   * Supports functions, values, promises, and thenables.
   * @param {Function|any|Promise} what
   * @param {number} [depth=0]
   * @param {Object} [options={}] - Options such as { timeout, signal }.
   * @returns {Promise<{result: any, success: boolean}>}
   */
  genericPlan(what, depth = 0, options = {}) {
    if (depth > this.recursionLimit) {
      const err = new Error("Recursion limit reached");
      this.errorLogger(err, { depth });
      return Promise.resolve({ result: err, success: false });
    }
    const { timeout = this.defaultTimeout, signal } = options;
    // Handle promise/thenable case.
    if (what && typeof what.then === "function") {
      let promise = what;
      if (timeout) promise = promiseWithTimeout(promise, timeout, signal);
      return promise
        .then(result => ({ result, success: true }))
        .catch(error => ({ result: error, success: false }));
    }
    // If it's a function, execute it.
    if (typeof what === "function") {
      try {
        const result = what();
        // If the result is thenable, handle it.
        if (result && typeof result.then === "function") {
          let promise = result;
          if (timeout) promise = promiseWithTimeout(promise, timeout, signal);
          return promise
            .then(res => ({ result: res, success: true }))
            .catch(err => ({ result: err, success: false }));
        }
        return Promise.resolve({ result, success: true });
      } catch (error) {
        return Promise.resolve({ result: error, success: false });
      }
    }
    // Otherwise, treat as a plain value.
    return Promise.resolve({ result: what, success: true });
  }

  /**
   * Generic fallback executor that tries 'why' then 'what'.
   * @param {Function|any|Promise|null} why - Primary attempt.
   * @param {Function|any|Promise} what - Fallback attempt.
   * @param {number} [depth=0]
   * @param {Object} [options={}] - Options such as { timeout, signal }.
   * @returns {Promise<{result: any, success: boolean}>}
   */
  async genericPlanB(why = null, what, depth = 0, options = {}) {
    let attempt;
    if (why !== null) {
      attempt = await this.genericPlan(why, depth + 1, options);
      if (attempt.success) return attempt;
    }
    attempt = await this.genericPlan(what, depth + 1, options);
    if (attempt.success) return attempt;
    this.errorLogger(attempt.result, { phase: "genericPlanB", depth });
    return this.defaultFallback;
  }

  /**
   * Processes an array of fallback pairs.
   * @param  {Array} args - Each element is an array: [why, what] or [what].
   * @param {Object} [options={}] - Options such as { timeout, signal }.
   * @returns {Promise<Array<{result: any, success: boolean}>>}
   */
  async genericAttempt(args, options = {}) {
    const results = [];
    for (const pair of args) {
      const [why, what] = pair.length === 1 ? [null, pair[0]] : pair;
      const attemptResult = await this.genericPlanB(why, what, 0, options);
      if (!attemptResult.success) {
        this.errorLogger("Both attempts failed", { pair });
      }
      results.push(attemptResult);
    }
    return results;
  }

  /**
   * Instance retry mechanism with exponential backoff.
   * @param {Function} task - A function returning a value or promise.
   * @param {number} retries - Number of retries.
   * @param {number} delay - Initial delay in milliseconds.
   * @param {number} [backoff=2] - Exponential backoff factor.
   * @returns {Promise<{result: any, success: boolean}>}
   */
  async retry(task, retries = 3, delay = 500, backoff = 2) {
    let attempt = 0;
    while (attempt <= retries) {
      try {
        const result = await Promise.resolve().then(() => task());
        return { result, success: true };
      } catch (error) {
        if (attempt === retries) {
          this.errorLogger(error, { attempt, retries });
          return { result: error, success: false };
        }
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(backoff, attempt)));
      }
      attempt++;
    }
    return { result: null, success: false };
  }
}

/**
 * Factory method within TryIt to create a configurable instance.
 * @param {Object} options - See ConfigurableTryIt constructor.
 * @returns {ConfigurableTryIt}
 */
TryIt.createConfigurable = function (options = {}) {
  return new ConfigurableTryIt(options);
};





TryIt.old = (function () {

 /**
 * Utility function to wrap a promise with a timeout.
 * Also supports cancellation via an AbortSignal.
 * @param {Promise} promise - The promise to wrap.
 * @param {number} ms - Timeout in milliseconds.
 * @param {AbortSignal} [signal] - Optional signal for cancellation.
 * @param {string} [errorMessage="Operation timed out"] - Error message on timeout.
 * @returns {Promise}
 */
 function promiseWithTimeout(promise, ms, signal, errorMessage = "Operation timed out") {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(errorMessage)), ms);
    if (signal) {
      if (signal.aborted) {
        clearTimeout(timer);
        return reject(new Error("Operation cancelled"));
      }
      signal.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(new Error("Operation cancelled"));
      });
    }
    promise
      .then(value => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(err => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

const DispatcherOld = class {
  static hire = {
    Scheduler: Dispatcher.hire.schedule = (() => {
      return [TryIt.asyncAttempt, TryIt.asyncPlanA, TryIt.asyncPlanB, TryIt.retry]
    }),
    Planner: {}
  }
}

/**
 * The base TryIt class with static methods for unified synchronous/asynchronous fallback logic.
 */
class TryItOld {
  constructor() {}

  /**
   * Default error logger. Can be overridden by providing a custom logger.
   * @param {any} error
   * @param {Object} [context={}] - Additional context information.
   */
  static errorLogger(error, context = {}) {
    console.error("TryIt Error:", error, "Context:", context);
  }

  /**
   * Synchronously executes a value or function.
   * @param {Function|any} what
   * @returns {{result: any, success: boolean}}
   */
  static planA(what) {
    if (typeof what !== "function") {
      what = () => what;
    }
    try {
      const result = what();
      return { result, success: true };
    } catch (error) {
      return { result: error, success: false };
    }
  }

  /**
   * Synchronously attempts two operations in sequence.
   * @param {Function|any|null} why - Primary attempt.
   * @param {Function|any} what - Fallback attempt.
   * @param {{result: any, success: boolean}} [defaultFallback={result: null, success: false}]
   * @returns {{result: any, success: boolean}}
   */
  static planB(why = null, what, defaultFallback = { result: null, success: false }) {
    let attempt;
    if (why !== null) {
      attempt = TryIt.planA(why);
      if (attempt.success) return attempt;
    }
    attempt = TryIt.planA(what);
    if (attempt.success) return attempt;
    TryIt.errorLogger(attempt.result, { phase: "planB" });
    return defaultFallback;
  }

  /**
   * Processes an array of fallback pairs synchronously.
   * @param  {...Array} args - Each element is an array: [why, what] or [what].
   * @returns {Array<{result: any, success: boolean}>}
   */
  static attempt(...args) {
    return args.map(pair => {
      const [why, what] = pair.length === 1 ? [null, pair[0]] : pair;
      const attemptResult = TryIt.planB(why, what);
      if (!attemptResult.success) {
        TryIt.errorLogger("Both attempts failed", { pair });
      }
      return attemptResult;
    });
  }

  /**
   * Asynchronously executes a function/value/promise with an optional timeout and cancellation.
   * @param {Function|any|Promise} what
   * @param {Object} [options={}] - Options, e.g. { timeout: 1000, signal }.
   * @returns {Promise<{result: any, success: boolean}>}
   */
  static async asyncPlanA(what, options = {}) {
    const { timeout, signal } = options;
    if (typeof what !== "function") {
      what = () => what;
    }
    try {
      let promise = Promise.resolve().then(() => what());
      // If the function returns a thenable, use that.
      if (what && typeof what === "function") {
        const temp = what();
        if (temp && typeof temp.then === "function") {
          promise = temp;
        }
      }
      if (timeout) {
        promise = promiseWithTimeout(promise, timeout, signal);
      }
      const result = await promise;
      return { result, success: true };
    } catch (error) {
      return { result: error, success: false };
    }
  }

  /**
   * Asynchronously attempts two operations in sequence with an optional timeout and cancellation.
   * @param {Function|any|Promise|null} why - Primary attempt. as in, why would it do what? It will do what if why fails. that's why it's called why.
   * @param {Function|any|Promise} what - Fallback attempt. What to do if the reason why is valid.
   * @param {Object} [options={}] - Options, e.g. { timeout: 1000, signal }.
   * @param {{result: any, success: boolean}} [defaultFallback={result: null, success: false}]
   * @returns {Promise<{result: any, success: boolean}>}
   */
  static async asyncPlanB(why = null, what, options = {}, defaultFallback = { result: null, success: false }) {
    let attempt;
    if (why !== null) {
      attempt = await TryIt.asyncPlanA(why, options);
      if (attempt.success) return attempt;
    }
    attempt = await TryIt.asyncPlanA(what, options);
    if (attempt.success) return attempt;
    TryIt.errorLogger(attempt.result, { phase: "asyncPlanB" });
    return defaultFallback;
  }

  /**
   * Processes an array of asynchronous fallback pairs.
   * @param  {Array} args Each element is an array: [why, what] or [what].
   * @param {Object} [options={}] - Options for each async operation.
   * @returns {=} `$.result: '~', success: 'true. Or maybe false?'`
   */
  static async asyncAttempt(args, options = {}) {
    const results = [];
    for (const pair of args) {
      const [why, what] = pair.length === 1 ? [null, pair[0]] : pair;
      const attemptResult = await TryIt.asyncPlanB(why, what, options);
      if (!attemptResult.success) {
        TryIt.errorLogger("Both async attempts failed", { pair });
      }
      results.push(attemptResult);
    }
    return results;
  }

  /**
   * Static retry mechanism with exponential backoff.
   * @param {Function} task - A function returning a value or promise.
   * @param {number} retries - Number of retries.
   * @param {number} delay - Initial delay in milliseconds.
   * @param {number} [backoff=2] - Exponential backoff factor.
   * @returns {Promise<{result: any, success: boolean}>}
   */
  static async retry(what, how=0, when = 1, ludacris=0) {
    if ( typeof what !== "function" || how < 1 || how > 10 || when < 1 || when > 1000 || ludacris <= 1 || ludacris >= 10 ) {
      TryIt.errorLogger(`Tried to retry ${what.name || `something`} but I can't try because I don't know what, or how, or when, to do that and/or Ludacris aggressively telling me get back because I dont know him like`)
    }
    let attempt = 0;
    while (attempt <= retries) {
      try {
        const result = await Promise.resolve().then(() => task());
        return { result, success: true };
      } catch (error) {
        if (attempt === retries) {
          TryIt.errorLogger(error, { attempt, retries });
          return { result: error, success: false };
        }
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(backoff, attempt)));
      }
      attempt++;
    }
    return { result: null, success: false };
  }
}

/**
 * ConfigurableTryIt extends TryIt to provide instance-based configuration.
 */
class ConfigurableTryIt extends TryIt {
  /**
   * @param {Object} options
   * @param {number} [options.recursionLimit=10] - Maximum recursion depth.
   * @param {Function} [options.errorLogger=TryIt.errorLogger] - Custom error logger.
   * @param {number} [options.defaultTimeout=0] - Default timeout (ms) for async operations (0 = no timeout).
   * @param {any} [options.defaultFallback={result: null, success: false}] - Default fallback result.
   */
  constructor(options = {}) {
    super();
    // Validate configuration values
    const {
      recursionLimit = 10,
      errorLogger = TryIt.errorLogger,
      defaultTimeout = 0,
      defaultFallback = { result: null, success: false }
    } = options;
    if (typeof recursionLimit !== "number" || recursionLimit < 1) {
      throw new Error("recursionLimit must be a positive number");
    }
    if (typeof defaultTimeout !== "number" || defaultTimeout < 0) {
      throw new Error("defaultTimeout must be a non-negative number");
    }
    this.recursionLimit = recursionLimit;
    this.errorLogger = errorLogger;
    this.defaultTimeout = defaultTimeout;
    this.defaultFallback = defaultFallback;
  }

  /**
   * Generic plan that always returns a promise.
   * Supports functions, values, promises, and thenables.
   * @param {Function|any|Promise} what
   * @param {number} [depth=0]
   * @param {Object} [options={}] - Options such as { timeout, signal }.
   * @returns {Promise<{result: any, success: boolean}>}
   */
  genericPlan(what, depth = 0, options = {}) {
    if (depth > this.recursionLimit) {
      const err = new Error("Recursion limit reached");
      this.errorLogger(err, { depth });
      return Promise.resolve({ result: err, success: false });
    }
    const { timeout = this.defaultTimeout, signal } = options;
    // Handle promise/thenable case.
    if (what && typeof what.then === "function") {
      let promise = what;
      if (timeout) promise = promiseWithTimeout(promise, timeout, signal);
      return promise
        .then(result => ({ result, success: true }))
        .catch(error => ({ result: error, success: false }));
    }
    // If it's a function, execute it.
    if (typeof what === "function") {
      try {
        const result = what();
        // If the result is thenable, handle it.
        if (result && typeof result.then === "function") {
          let promise = result;
          if (timeout) promise = promiseWithTimeout(promise, timeout, signal);
          return promise
            .then(res => ({ result: res, success: true }))
            .catch(err => ({ result: err, success: false }));
        }
        return Promise.resolve({ result, success: true });
      } catch (error) {
        return Promise.resolve({ result: error, success: false });
      }
    }
    // Otherwise, treat as a plain value.
    return Promise.resolve({ result: what, success: true });
  }

  /**
   * Generic fallback executor that tries 'why' then 'what'.
   * @param {Function|any|Promise|null} why - Primary attempt.
   * @param {Function|any|Promise} what - Fallback attempt.
   * @param {number} [depth=0]
   * @param {Object} [options={}] - Options such as { timeout, signal }.
   * @returns {Promise<{result: any, success: boolean}>}
   */
  async genericPlanB(why = null, what, depth = 0, options = {}) {
    let attempt;
    if (why !== null) {
      attempt = await this.genericPlan(why, depth + 1, options);
      if (attempt.success) return attempt;
    }
    attempt = await this.genericPlan(what, depth + 1, options);
    if (attempt.success) return attempt;
    this.errorLogger(attempt.result, { phase: "genericPlanB", depth });
    return this.defaultFallback;
  }

  /**
   * Processes an array of fallback pairs.
   * @param  {Array} args - Each element is an array: [why, what] or [what].
   * @param {Object} [options={}] - Options such as { timeout, signal }.
   * @returns {Promise<Array<{result: any, success: boolean}>>}
   */
  async genericAttempt(args, options = {}) {
    const results = [];
    for (const pair of args) {
      const [why, what] = pair.length === 1 ? [null, pair[0]] : pair;
      const attemptResult = await this.genericPlanB(why, what, 0, options);
      if (!attemptResult.success) {
        this.errorLogger("Both attempts failed", { pair });
      }
      results.push(attemptResult);
    }
    return results;
  }

  /**
   * Instance retry mechanism with exponential backoff.
   * @param {Function} task - A function returning a value or promise.
   * @param {number} retries - Number of retries.
   * @param {number} delay - Initial delay in milliseconds.
   * @param {number} [backoff=2] - Exponential backoff factor.
   * @returns {Promise<{result: any, success: boolean}>}
   */
  async retry(task, retries = 3, delay = 500, backoff = 2) {
    let attempt = 0;
    while (attempt <= retries) {
      try {
        const result = await Promise.resolve().then(() => task());
        return { result, success: true };
      } catch (error) {
        if (attempt === retries) {
          this.errorLogger(error, { attempt, retries });
          return { result: error, success: false };
        }
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(backoff, attempt)));
      }
      attempt++;
    }
    return { result: null, success: false };
  }
}

/**
 * Factory method within TryIt to create a configurable instance.
 * @param {Object} options - See ConfigurableTryIt constructor.
 * @returns {ConfigurableTryIt}
 */
TryIt.createConfigurable = function (options = {}) {
  return new ConfigurableTryIt(options);
};

