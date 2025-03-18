// ALL RIGHTS RESERVED
// © 2024, 2025, 2026 - Chris Singendonk  
// Copyright (c) 2024-2026 Chris Singendonk. All Rights Reserved.  
// By using, reproducing, adapting, extending, refactoring, or otherwise building upon this work or any derivative,  
// you acknowledge and respect the original contribution.  
// Think of it this way: You’ve spent countless hours designing a gravity-defying, tune-playing flying car.  
// You share your work freely, knowing that collaboration is the key to progress. Others join in, improving the design, pushing it further than you ever could alone.  
// But somewhere along the way, the updates stop reaching you. Your team moves forward, building on what you started, but without your knowledge.  
// They launch new models, refine the technology, solve problems you never even knew existed—while you, the original creator, are left staring at your old blueprints,  
// unable to grow, to learn, or to contribute to what has become of your own work.  
// This is why attribution matters. Not just as a form of respect, but as a means of keeping creators connected to their creations.  
// Innovation isn’t just about the product—it’s about the people behind it, learning, improving, and evolving together.  
// Acknowledgment ensures that those who plant the seeds of progress aren’t left in the dark while others harvest the rewards.  
// CONTACT & USAGE REQUEST:  
// If this work has been useful to you, I’d love to hear about it! Whether you’re using it in a project, modifying it in an interesting way,  
// or just found it helpful, please reach out and share your experience.  
// You can contact me at: [https://www.github.com/csingendonk]
/**
 * ALL RIGHTS RESERVED
 *@author: Chris Singendonk (github.com/csingendonk)
 *@license none All rights reserved.
 *@Do_not_use_or_reproduce_Without_explicit_permission_and_proper_attribution_from_and_to_the_author
 *@note (Not for use without explicit permission and proper attribution.) 
 */
 const DOMLogger = (() =>
  {
    function _a1(b) {

      const eventNames = [ "click", "submit", "change", "keydown", "focus", "blur", "contextmenu", "dblclick", "scroll", "input", "mousemove", "mousedown", "mouseup", "pointerdown", "pointerup", "pointermove", "wheel", "touchstart", "touchmove", "touchend", "paste", "copy", "cut" ];
      const settings = {};
      eventNames.forEach(n =>  
      {
        settings[ n ] = {
          on: true,
          log: true,
          toast: false,
          toasttype: "info",
          toasttime: 100
        };
      }
      );
      return settings;
    }
  
    function _a2(b) {

      const methods = [ 'info', 'warn', 'error', 'debug', 'trace', 'assert', 'clear', 'count', 'countReset', 'time', 'timeEnd', 'timeLog', 'table', 'group', 'groupCollapsed', 'groupEnd', 'dir', 'dirxml', 'profile', 'profileEnd', 'timeStamp', 'memory' ];
      const settings = {};
      methods.forEach((m) =>
      {
        settings[ m ] = {
          on: true,
          log: true,
          toast: true
  
        };
  
      }
      );
      return settings;
    }
    const LoggerState = {
      isPaused: false,
      isInternal: false,
      isInitialized: false,
      logs: [],
      loggers: {
        DOMEventLogger: {
          on: true,
          events: _a1(true),
          isPaused: false,
          isInternal: false,
          isInitialized: false,
          updateActiveEvents: null,
          activeEvents: [],
          instanceState: {
            isPaused: false,
            isInternal: false,
            isInitialized: false,
            activeEvents: []
          }
        },
        PerformanceEventLogger: {
          on: true,
          isPaused: true,
          isInternal: false,
          isInitialized: false,
          events: {
            FCP: {
              on: false,
              log: true,
              toast: true
            },
            CLS: {
              on: false,
              log: false,
              toast: false
            }
          },
          activeEvents: []//["FCP","CLS"]
        },
        ConsoleInterceptor: {
          on: true,
          methods: _a2(true),
          isPaused: false,
          isInternal: false,
          isInitialized: false,
          activeMethods: []
        },
        XHRInterceptor: {
          on: true
        },
        FetchInterceptor: {
          on: true,
          blockingMode: 'blocking'
        }
      },
      // For the UI:
      theme: null,
      toasts: [],
      toasterSettings: {
        on: true
      },
      panel: document.querySelector('log-panel'),
      toaster: document.querySelector('toaster-')
    };
    window.LoggerState = LoggerState;
  
    const config = {
      events: Array.from(Object.keys(LoggerState.loggers.DOMEventLogger.events))
    };
  
    function safeStringify(obj, depth = 2) {
      const cache = new Set();
      function serializer(key, value) {
        if (typeof value === "object" && value !== null) {
          if (cache.has(value))
            return "[Circular]";
          cache.add(value);
          if (depth <= 0)
            return `${key}:${value}`;
        }
        return value;
      }
      try
      {
        return JSON.stringify(obj, serializer, 2);
      } catch (error) {
        return `[Unable to stringify object: ${error.message}]`;
      }
    }
  
    function toastit(message, category = "info", timeout = 500) {
      if (ToasterBase && typeof ToasterBase.toastit === "function") {
        ToasterBase.toastit(message, category, timeout);
      } else
      {
        console.log(`TOAST [${category}]: ${message}`);
      }
    }
  
    function themeSet(themeName = "light", elmnt = null) {
      const darkTheme = {
        backgroundColor: "rgba(15, 15, 15, 0.9)",
        color: "rgb(245, 250, 255)"
      };
      const lightTheme = {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        color: "rgb(0, 0, 0)"
      };
      const themeRule = themeName.includes("dark") ? darkTheme : lightTheme;
      const applyStyle = (element, style) =>
      {
        Object.assign(element.style, style);
        Array.from(element.children).forEach(child => applyStyle(child, style));
      }
        ;
      applyStyle(elmnt, themeRule);
    }
  
    function addLog(log) {
      const logEntry = {
        type: log.type || "Unknown",
        message: log.message || "No message provided",
        status: log.status || "N/A",
        duration: log.duration || "N/A",
        timestamp: new Date().toISOString(),
        details: log.details || {}
      };
      LoggerState.logs.push(logEntry);
      const logPanel = document.querySelector("log-panel") || LoggerState.panel;
      if (logPanel && typeof logPanel.appendLog === "function") {
        logPanel.appendLog(logEntry);
      } else
      {
        console.log("LOG ENTRY:", logEntry);
      }
    }
  
    function formatDetails(details) {
      try
      {
        let str = safeStringify(details);
        str = str.replace(`<`, `\\<`).replace(`>`, `\\>`).replace(`\\n`, '\n').replace(`"`, '\'').replace(`'`, `\"`).replace('`', `\'`);
        return str;
      } catch (e) {
        try
        {
          return JSON.stringify(details);
        } catch (error) {
          return `${details} : ${error}`;
        }
      }
    }
  
    function createLogElement(logEntry) {
      const logItem = document.createElement("div");
      logItem.className = "log-item";
      logItem.innerHTML = `
      <span class="logitemtop" style="display: inline-flex; width:100%;">
        <p style="flex: 1;">
          <strong>${logEntry.type}:</strong> ${logEntry.message}<br>
          <strong>Status:</strong> ${logEntry.status}<br>
          <strong>Duration:</strong> ${logEntry.duration}<br>
          <strong>Time:</strong> ${new Date(logEntry.timestamp).toLocaleTimeString()}<br>
        </p>
        <div class="logitembtns">
          <button class="details-btn" title="View Details">🔍</button>
          <button class="copy-btn" title="Copy Log">📝</button>
          <button class="remove-btn" title="Remove Entry">🗑️</button>
        </div>
      </span>
      <div class="details">
        <p>${logEntry.details ? formatDetails(logEntry.details) : ""}</p>
      </div>
    `;
      if (LoggerState.theme) {
        logItem.classList.add(LoggerState.theme);
        themeSet(LoggerState.theme, logItem);
      }
      const copyBtn = logItem.querySelector(".copy-btn");
      const detailsBtn = logItem.querySelector(".details-btn");
      const removeBtn = logItem.querySelector(".remove-btn");
      const detailsDiv = logItem.querySelector(".details");
      copyBtn.addEventListener("click", e =>
      {
        e.stopPropagation();
        const logText = `${logEntry.type}: ${logEntry.message}\nStatus: ${logEntry.status}\nDuration: ${logEntry.duration}\nTime: ${new Date(logEntry.timestamp).toLocaleTimeString()}\n\nDetails:\n${formatDetails(logEntry.details)}`;
        navigator.clipboard.writeText(logText).then(() =>
        {
          copyBtn.textContent = '✔️';
          toastit("Log copied to clipboard!", "success", 2000);
          setTimeout(() =>
          {
            copyBtn.textContent = '📝';
          }
            , 1000);
        }
        ).catch(() =>
        {
          toastit("Failed to copy log.", "error", 2000);
        }
        );
      }
      );
      detailsBtn.addEventListener("click", e =>
      {
        e.stopPropagation();
        detailsDiv.classList.toggle("visible");
        detailsBtn.textContent = detailsDiv.classList.contains("visible") ? "🔍 " : "⤵️";
      }
      );
      removeBtn.addEventListener("click", e =>
      {
        e.stopPropagation();
        logItem.remove();
      }
      );
      return logItem;
    }
  
    window.__isLogging__ = false;
  
    const ToasterBase = (() =>
    {
      const DEFAULT_TOAST_TIMEOUT = 500;
      const defaultStyleText = `
      .toaster- { position: fixed; top: 1vh; right: 1vmin; bottom: 9vh; display: flex; flex-direction: column; align-items: flex-end; z-index: 999999; max-height: 90vh; max-width: 90vw; overflow-y: clip; gap: 10px; pointer-events: none; }

     .toast { pointer-events: auto; background: rgba(50, 50, 50, 0.9); color: #fff; padding: 10px 16px; margin-bottom: 8px; border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.4); font-size: 14px; font-family: monospace; min-width: 100%; word-wrap: break-word; white-space: pre-wrap; opacity: 0; transform: translateX(100%) scale(0.8); transition: opacity 0.3s ease, transform 0.3s ease; display: flex; align-items: center; gap: 8px; }

     .toast.show { opacity: 0.8; transform: translateX(0) scale(1); }

     .toast:hover, .toast:focus, .toast:active { outline: none; box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5); z-index: 9; transform: translateX(-1%) scale(1.01); transition: transform 0.1s ease; cursor: pointer; opacity: 1; }

     .toast.error { background: rgba(255, 50, 50, 0.9); }

     .toast.success { background: rgba(0, 128, 0, 0.9); }

     .toast.info { background: rgba(0, 0, 255, 0.9); }

     .toast.warning { background: rgba(255, 165, 0, 0.9); }

     .toast.network { background: rgba(255, 165, 0, 0.9); }

     .toast.blocked { background: rgba(128, 0, 128, 0.9); }

     .icon { font-size: 16px; }
    `;
      class ToasterClass extends HTMLElement
      {
        constructor () {
          super();
          this.attachShadow({
            mode: "open"
          });
          this.shadowRoot.innerHTML = `<style>${defaultStyleText}</style><div class="toaster-"></div>`;
          this.defaults = {
            timeout: DEFAULT_TOAST_TIMEOUT,
            on: true
          };
          this.on = this.defaults.on;
          this.timeout = this.defaults.timeout;
          this.toasts = new Set();
        }
        connectedCallback() {
          let ta = this.getAttribute("timeout");
          if (!ta)
            this.setAttribute("timeout", DEFAULT_TOAST_TIMEOUT.toString());
          ta = this.getAttribute("timeout");
          this.timeout = parseFloat(ta);
        }
        toastit(message = "no message", category = "info", timeoutMs = DEFAULT_TOAST_TIMEOUT) {
          if (LoggerState.isPaused) {
            console.log(`Toasts are off, "${message}" was not toasted`);
            return false;
          }
          const toast = this.createToastElement(message, category);
          this.shadowRoot.querySelector(".toaster-").appendChild(toast);
          requestAnimationFrame(() => toast.classList.add("show"));
          const removeAfter = parseInt(this.defaults.timeout, 10);
          const finalTimeout = timeoutMs === 0 ? Number.MAX_SAFE_INTEGER : (timeoutMs || removeAfter);
          setTimeout(() => this.hideAndRemoveToast(toast), finalTimeout);
          return toast;
        }
        hideAndRemoveToast(toast) {
          toast.classList.remove("show");
          setTimeout(() =>
          {
            try
            {
              toast.remove();
              this.toasts.delete(toast);
            } catch (e) {
              console.error("Error removing toast:", e);
            }
          }
            , 300);
        }
        createToastElement(message, category) {
          const toast = document.createElement("div");
          toast.classList.add("toast", category);
          const icon = document.createElement("span");
          icon.className = "icon";
          icon.textContent = this.getCategoryIcon(category);
          const messageSpan = document.createElement("span");
          messageSpan.textContent = message;
          toast.appendChild(icon);
          toast.appendChild(messageSpan);
          this.toasts.add(toast);
          toast.addEventListener("click", () => this.hideAndRemoveToast(toast));
          return toast;
        }
        getCategoryIcon(category) {
          switch (category) {
          case "error":
            return "❗";
          case "success":
            return "✔️";
          case "warning":
            return "⚠️";
          case "network":
            return "🛜";
          case "blocked":
            return "🚫";
          case "info":
          default:
            return "💡";
          }
        }
        setCustomStyle(newCssText) {
          this.shadowRoot.querySelector("style").textContent = newCssText;
        }
        addCustomStyle(additionalCssText) {
          this.shadowRoot.querySelector("style").textContent += "\n" + additionalCssText;
        }
        resetStyle() {
          this.shadowRoot.querySelector("style").textContent = defaultStyleText;
        }
      }
      if (!customElements.get("toaster-")) {
        customElements.define("toaster-", ToasterClass);
      }
  
      function createToaster() {
        let existing = document.querySelector("toaster-");
        if (existing != null) {
          return existing;
        }
        const container = document.createElement("toaster-");
        container.setAttribute("timeout", DEFAULT_TOAST_TIMEOUT.toString());
        document.documentElement.appendChild(container);
        return container;
      }
      const toaster = createToaster();
      function toastitWrapper(message, category = "info", timeoutMs = DEFAULT_TOAST_TIMEOUT) {
        if (!toaster) { return };
        toaster.toastit(message, category, timeoutMs);
      }
      return {
        init: () => { },
        toastit: (message = `Toast!`, category = `info`, timeoutMs = 500) => { toastitWrapper(message, category, timeoutMs); },
        setCustomStyle(newCssText) {
          ToasterClass.setCustomStyle(newCssText);
        },
        addCustomStyle(additionalCssText) {
          ToasterClass.addCustomStyle(additionalCssText);
        },
        resetStyle() {
          ToasterClass.resetStyle();
        }
      };
    }
    )();
  
    window.nothing = {
      notta: `*`,
      empty: null
    };
    let houdini = (whereto) =>
    {
      if (typeof whereto !== 'string' && whereto.split == undefined) {
        whereto = `DOMLogger`;
      } else
      {
        whereto = `DOMLogger`;
      }
      function gtfo(whereto) {
        const gtfoplz = function (whereto) {
          window[ whereto ] = undefined || null;
  
        };
        gtfoplz(whereto);
        console.log('gtfo please');
      }
      gtfo(whereto);
      console.warn('gtfo');
    };
    window.nothing.empty = houdini(window.nothing.notta);
  
  
    /* ============================================================================
     DOMEventLogger Module   Integrated with Settings from LogPanel
  ============================================================================ */
    const DOMEventLogger = (() =>
    {
      let state = LoggerState.loggers.DOMEventLogger.instanceState;
      let config = {
        events: [ "click", "submit", "change", "keydown", "focus", "blur", "contextmenu", "dblclick", "scroll", "input", "mousemove", "mousedown", "mouseup", "pointerdown", "pointerup", "pointermove", "wheel", "touchstart", "touchmove", "touchend", "paste", "copy", "cut" ],
        logLevel: "INFO",
        filter: logEntry => true
      };
  
      // Update active events based on LoggerState settings.
      const updateActiveEvents = () =>
      {
        const actives = [];
        config.events.forEach(evnm =>
        {
          const setting = LoggerState.loggers.DOMEventLogger.events[ evnm ];
          if (setting && setting.on === true) {
            actives.push(evnm);
          }
        }
        );
        state.activeEvents = actives;
        return actives;
      };
  
      window.LoggerState.loggers.DOMEventLogger.updateActiveEvents = updateActiveEvents;
      updateActiveEvents();
      window.updateActiveEvents = updateActiveEvents;
  
      // Helper: truncate long strings.
      function truncate(str, maxLength = 100) {
        return (typeof str === "string" && str.length > maxLength) ? str.substring(0, maxLength) + "..." : (typeof str === "string" ? str : "");
      }
  
      // Process a log entry only if its event type is enabled in settings.
      function processLog(logEntry, toastMsg, duration = 3000) {
        const eventType = logEntry.details && logEntry.details.eventType;
        // Only log if event type is active
        if (!eventType || state.activeEvents.includes(eventType)) {
          // Also check per-event  log  flag.
          const eventSetting = eventType ? LoggerState.loggers.DOMEventLogger.events[ eventType ] : null;
          if (eventSetting && eventSetting.log !== true)
            return;
          if (window.__isLogging__)
            return;
          window.__isLogging__ = true;
          try
          {
            addLog(logEntry);
            if (eventSetting && eventSetting.toast !== false) {
              ToasterBase.toastit(toastMsg, "info", duration);
            }
          } finally
          {
            window.__isLogging__ = false;
          }
        }
      }
  
      let mutationObserver;
      const groupEvents = [];
      let groupCount = 0;
      let debounceTimeout;
  
      function logDOMActivity() {
        // Mutation Observer for DOM mutations
        mutationObserver = new MutationObserver(mutations =>
        {
          if (state.isPaused || LoggerState.isInternal)
            return;
          mutations.forEach(mutation =>
          {
            try
            {
              if (mutation.target.closest && mutation.target.closest("log-panel, toaster-"))
                return;
              const details = {
                type: mutation.type,
                target: mutation.target.tagName,
                targetId: mutation.target.id || "none",
                targetClass: mutation.target.className || "none",
                snippet: mutation.target.outerHTML ? truncate(mutation.target.outerHTML, 100) : "[HTML]",
                eventType: mutation.type // use mutation type as eventType
              };
              if (mutation.type === "childList") {
                details.addedNodes = Array.from(mutation.addedNodes).filter(node => node.nodeType === Node.ELEMENT_NODE && !(node.closest && node.closest("log-panel, toaster-"))).map(node => node.nodeName);
                details.removedNodes = Array.from(mutation.removedNodes).filter(node => node.nodeType === Node.ELEMENT_NODE && !(node.closest && node.closest("log-panel, toaster-"))).map(node => node.nodeName);
                details.addedCount = details.addedNodes.length;
                details.removedCount = details.removedNodes.length;
                if (!details.addedCount && !details.removedCount)
                  return;
              } else if (mutation.type === "attributes") {
                details.attributeName = mutation.attributeName;
                details.oldValue = mutation.oldValue;
                details.newValue = mutation.target.getAttribute(mutation.attributeName);
              }
              const entry = {
                type: "DOM",
                message: `DOM ${mutation.type} mutation detected`,
                timestamp: new Date().toISOString(),
                details
              };
              processLog(entry, `DOM Change: ${details.eventType} on ${details.target}`, 5000);
            } catch (err) {
              console.error("Error processing mutation:", err);
            }
          }
          );
        }
        );
        mutationObserver.observe(document, {
          childList: true,
          attributes: true,
          characterData: true,
          subtree: true,
          attributeOldValue: true,
          characterDataOldValue: true
        });
        config.events.forEach(eventType =>
        {
          document.addEventListener(eventType, (event) =>
          {
            // Check global and per-event settings
            const domSettings = LoggerState.loggers.DOMEventLogger;
            const eventSetting = domSettings.events[ `${(eventType != null ? eventType : event.type)}` ];
            if (!domSettings.on || !eventSetting || eventSetting.on !== true || (eventSetting.toast !== true && eventSetting.log !== true)) {
              return;
            } else
            {
              if (eventSetting.log !== true && eventSetting.toast === true) {
                ToasterBase.toastit(`${eventType} toasted, but not butte.. erm, logged.`);
                return null;
              }
            }
  
  
            try
            {
              if (state.isPaused || LoggerState.isInternal)
                return;
              if (event.target.closest && event.target.closest("log-panel, toaster-"))
                return;
              const details = {
                eventType: event.type,
                target: event.target.tagName,
                targetId: event.target.id || "none",
                targetClass: event.target.className || "none",
                snippet: event.target.outerHTML ? truncate(event.target.outerHTML, 100) : "N/A",
                timeStamp: Date.now()
              };
              let groupers = [ "mousemove", "pointermove", "touchmove", "wheel", "drag", "scroll" ];
              togroupornottogroup = (() =>
              {
                let o = false;
                groupers.forEach((kc) =>
                {
                  if (event.type.includes(kc)) {
                    o = true;
                  };
                });
                return o;
              })();
              if (groupers.includes(event.type) || togroupornottogroup) {
                if (groupEvents.length >= 2) {
                  let ge = [ ...groupEvents.reverse() ];
                  const zero = ge.pop();
                  ge = undefined;
                  groupEvents.length = 0;
                  groupEvents.push(zero);
                  groupEvents.push(details);
                } else
                {
                  groupEvents.push(details);
                }
                groupCount++;
                if (event.type.includes("move")) {
                  Object.assign(details, {
                    x: event.clientX,
                    y: event.clientY,
                    X: event.screenX,
                    Y: event.screenY
                  });
                }
                clearTimeout(debounceTimeout);
                debounceTimeout = setTimeout(() =>
                {
                  processLog({
                    type: "Interaction (Grouped)",
                    message: `${event.type} events grouped`,
                    timestamp: new Date().toISOString(),
                    details: {
                      count: groupCount,
                      events: groupEvents
                    }
                  }, `Grouped ${event.type} events: ${groupCount}`, 3000);
                  groupCount = 0;
                  groupEvents.length = 0;
                }
                  , 1000);
                return;
              }
              if ([ "click", "mousedown", "mouseup", "pointerdown", "pointerup", "touchstart", "touchend" ].includes(event.type)) {
                details.clientX = event.clientX;
                details.clientY = event.clientY;
                details.screenX = event.screenX;
                details.screenY = event.screenY;
              }
              if ([ "keydown", "keyup" ].includes(event.type)) {
                details.key = event.key;
                details.keyCode = event.keyCode;
              }
              if (event.type === "input" && event.target.value !== undefined) {
                details.inputValue = event.target.value;
              }
              const entry = {
                type: "Interaction",
                message: `User ${event.type} event detected`,
                timestamp: new Date().toISOString(),
                details
              };
              processLog(entry, `User Action: ${event.type} on ${details.target}`, 3000);
              console.dirxml(entry);
            } catch (err) {
              console.error("Error processing interaction:", err);
            }
          }
            , true);
        }
        );
      }
  
      function init() {
        try
        {
          if (!state.isInitialized) {
            state.isInitialized = true;
            updateActiveEvents();
            logDOMActivity();
          }
        } catch (error) {
          console.error("Error initializing DOM logging:", error);
          toastit("Failed to initialize DOM logging", "error", 5000);
        }
      }
      function destroy() {
        if (mutationObserver)
          mutationObserver.disconnect();
        state.isInitialized = false;
      }
      function reinit() {
        destroy();
        state.isPaused = false;
        init();
      }
      function updateConfig(newconfig) {
        if (newconfig) {
          config = {
            ...config,
            ...newconfig
          };
        }
      }
      return {
        init,
        reinit,
        destroy,
        pause: () =>
        {
          state.isPaused = true;
        }
        ,
        resume: () =>
        {
          state.isPaused = false;
        }
        ,
        getState: () => state,
        updateConfig
      };
    }
    )();
    window.DOMEventLogger = DOMEventLogger;
  
    /* ============================================================================
     PerformanceEventLogger Module
  ============================================================================ */
    const PerformanceEventLogger = (() =>
    {
      "use strict";
      let config = {
        toastits: false
      };
      let firstHiddenTime = -1;
      const getFirstHiddenTime = () => firstHiddenTime;
      const onPageshow = cb =>
      {
        addEventListener("pageshow", event =>
        {
          if (event.persisted) {
            firstHiddenTime = event.timeStamp;
            cb(event);
          }
        }
          , true);
      }
        ;
      const getNavigationEntry = () =>
      {
        const entries = performance.getEntriesByType && performance.getEntriesByType("navigation");
        const navEntry = entries && entries[ 0 ];
        if (navEntry && navEntry.responseStart > 0 && navEntry.responseStart < performance.now()) {
          return navEntry;
        }
      }
        ;
      const getActivationStart = () =>
      {
        const navEntry = getNavigationEntry();
        return (navEntry && navEntry.activationStart) || 0;
      }
        ;
      const createMetric = (name, initialValue) =>
      {
        const navEntry = getNavigationEntry();
        let navigationType = "navigate";
        if (getFirstHiddenTime() >= 0) {
          navigationType = "back-forward-cache";
        } else if (navEntry) {
          if (document.prerendering || getActivationStart() > 0) {
            navigationType = "prerender";
          } else if (document.wasDiscarded) {
            navigationType = "restore";
          } else if (navEntry.type) {
            navigationType = navEntry.type.replace(/_/g, "-");
          }
        }
        return {
          name,
          value: initialValue === undefined ? -1 : initialValue,
          rating: "good",
          delta: 0,
          entries: [],
          id: `metric-${Date.now()}-${Math.floor(8999999999999 * Math.random()) + 1e12}`,
          navigationType
        };
      }
        ;
      const throttleMetricUpdate = (cb, metric, thresholds) =>
      {
        let lastValue = 0;
        return () =>
        {
          if (metric.value >= 0) {
            const delta = metric.value - (lastValue || 0);
            if (delta || lastValue === 0) {
              lastValue = metric.value;
              metric.rating = metric.value > thresholds[ 1 ] ? "poor" : metric.value > thresholds[ 0 ] ? "needs-improvement" : "good";
              cb(metric);
            }
          }
        }
          ;
      }
        ;
      let logFunction = metricData =>
      {
        console.log("Performance Metric:", metricData);
      }
        ;
      function setLogFunction(fn) {
        logFunction = fn;
      }
      const reportMetric = metricData =>
      {
        const message = `${metricData.name}: ${metricData.value} (Rating: ${metricData.rating})`;
        logFunction({
          type: "Performance",
          message,
          details: metricData
        });
        if (config.toastits) {
          toastit(message, "performance", 5000);
        }
      }
        ;
      const FCP_THRESHOLDS = [ 1800, 3000 ];
      const observeFCP = () =>
      {
        let fcpMetric = createMetric("FCP");
        const updateFCP = throttleMetricUpdate(reportMetric, fcpMetric, FCP_THRESHOLDS);
        const observer = new PerformanceObserver(list =>
        {
          list.getEntries().forEach(entry =>
          {
            if (entry.name === "first-contentful-paint" && entry.startTime < getFirstHiddenTime()) {
              fcpMetric.value = Math.max(entry.startTime - getActivationStart(), 0);
              fcpMetric.entries.push(entry);
              updateFCP();
              observer.disconnect();
            }
          }
          );
        }
        );
        observer.observe({
          type: "paint",
          buffered: true
        });
        requestAnimationFrame(() =>
        {
          requestAnimationFrame(() =>
          {
            if (fcpMetric.value < 0) {
              fcpMetric.value = performance.now() - performance.timing.navigationStart;
              updateFCP();
            }
          }
          );
        }
        );
      }
        ;
      const CLS_THRESHOLDS = [ 0.1, 0.25 ];
      const observeCLS = () =>
      {
        let clsMetric = createMetric("CLS", 0);
        const updateCLS = throttleMetricUpdate(reportMetric, clsMetric, CLS_THRESHOLDS);
        const observer = new PerformanceObserver(list =>
        {
          list.getEntries().forEach(entry =>
          {
            if (!entry.hadRecentInput) {
              clsMetric.value += entry.value;
              clsMetric.entries.push(entry);
              updateCLS();
            }
          }
          );
        }
        );
        if (observer) {
          observer.observe({
            type: "layout-shift",
            buffered: true
          });
        }
      }
        ;
      onPageshow(() =>
      {
        firstHiddenTime = performance.now();
      }
      );
      const initPerformance = () =>
      {
        observeFCP();
        observeCLS();
      }
        ;
      return {
        init: initPerformance,
        setLogFunction,
        updateConfig: newConfig =>
        {
          config = {
            ...config,
            ...newConfig
          };
        }
      };
    }
    )();
  
    /* ============================================================================
     ConsoleInterceptor Module
  ============================================================================ */
    const ConsoleInterceptor = (() =>
    {
      const methods = [ 'log', 'info', 'warn', 'error', 'debug', 'trace', 'assert', 'clear', 'count', 'countReset', 'time', 'timeEnd', 'timeLog', 'table', 'group', 'groupCollapsed', 'groupEnd', 'dir', 'dirxml', 'profile', 'profileEnd', 'timeStamp', 'memory' ];
      const typeMap = {
        log: "Log",
        info: "Info",
        warn: "Warning",
        error: "Error",
        debug: "Debug",
        trace: "Trace",
        assert: "Assert",
        clear: "Clear",
        count: "Count",
        countReset: "CountReset",
        time: "Time",
        timeEnd: "TimeEnd",
        timeLog: "TimeLog",
        table: "Table",
        group: "Group",
        groupCollapsed: "GroupCollapsed",
        groupEnd: "GroupEnd",
        dir: "Dir",
        dirxml: "DirXML",
        profile: "Profile",
        profileEnd: "ProfileEnd",
        timeStamp: "TimeStamp",
        memory: "Memory"
      };
      function formatTable(data) {
        if (!data)
          return "[Empty table data]";
        if (Array.isArray(data) || typeof data === "object") {
          try
          {
            return safeStringify(data);
          } catch (error) {
            return `[Invalid table data: ${error.message}]`;
          }
        }
        return `[Invalid table data type: ${typeof data}]`;
      }
      function createLogEntry(method, args) {
        const details = {
          console: {
            method,
            arguments: Array.from(args)
          }
        };
        let message;
        try
        {
          if (method === "table") {
            details.tableData = formatTable(args[ 0 ]);
            message = `[Table Data] ${details.tableData}`;
          } else if (method === "trace") {
            details.stackTrace = new Error().stack.split("\n").slice(2);
            message = `Stack Trace:\n${details.stackTrace.join("\n")}`;
          } else
          {
            message = args.map(arg =>
            {
              if (arg === null)
                return "null";
              if (arg === undefined)
                return "undefined";
              if (typeof arg === "object") {
                try
                {
                  return safeStringify(arg);
                } catch (error) {
                  return `[Complex Object: ${error.message}]`;
                }
              }
              return String(arg);
            }
            ).join(" ");
          }
        } catch (error) {
          message = "[Error formatting message]";
          details.formatError = error.message;
        }
        return {
          type: typeMap[ method ] || method,
          message,
          timestamp: new Date().toISOString(),
          details
        };
      }
      const originalConsole = Object.assign({}, console);
      function interceptConsole() {
        methods.forEach(method =>
        {
          if (originalConsole[ method ]) {
            console[ method ] = function (...args) {
              if (window.__isLogging__)
                return;
              window.__isLogging__ = true;
              try
              {
                try
                {
                  originalConsole[ method ](safeStringify([ ...args ]));
                } catch (err) {
                  originalConsole[ method ](...args);
                }
                originalConsole[ method ].apply(console, args);
                if (LoggerState.isPaused)
                  return;
                const logEntry = createLogEntry(method, args);
                addLog(logEntry);
                const toastDuration = method === "error" ? 15000 : 10000;
                toastit(`${logEntry.type}: ${logEntry.message}`, logEntry.type.toLowerCase(), toastDuration);
              } catch (error) {
                if (method !== "error" && method !== "log") {
                  originalConsole.error("Console interceptor error:", error);
                  try
                  {
                    addLog({
                      type: "Error",
                      message: `Console interceptor error: ${error.message}`,
                      timestamp: new Date().toISOString(),
                      details: {
                        error: {
                          name: error.name,
                          message: error.message,
                          stack: error.stack,
                          method,
                          args: args.map(String)
                        }
                      }
                    });
                  } catch (innerError) {
                    originalConsole.error("Failed to log console interceptor error:", innerError);
                  }
                }
              } finally
              {
                window.__isLogging__ = false;
              }
            }
              ;
          }
        }
        );
        const originalConsoleLog = console.log;
        console.log = function (...args) {
          originalConsoleLog.apply(console, args);
          const processItem = item =>
          {
            if (typeof item === 'string')
              return item;
            if (typeof item === 'object') {
              try
              {
                return safeStringify(item);
              } catch (e) {
                return String(item);
              }
            }
            return String(item);
          }
            ;
          let finalMessage = args.map(processItem).join(' | ');
          const logEntry = {
            type: "Interception",
            message: finalMessage,
            timestamp: new Date().toISOString(),
            details: {
              data: args
            }
          };
          toastit(finalMessage, "info", 3000);
          addLog(logEntry);
        }
          ;
      }
      return {
        interceptConsole
      };
    }
    )();
  
    /* ============================================================================
     XHRInterceptor Module   Wrap XMLHttpRequest
  ============================================================================ */
    const XHRInterceptor = (() =>
    {
      const originalXHR = window.XMLHttpRequest;
      class InterceptedXHR extends originalXHR
      {
        constructor (...args) {
          super(...args);
          this.addEventListener("load", () =>
          {
            if (LoggerState.isInternal)
              return;
            const duration = Math.round(performance.now() - this._startTime);
            const responseHeaders = parseXHRHeaders(this.getAllResponseHeaders());
            const responseBody = this.responseText;
            const logEntry = {
              type: "XHR",
              message: `${this._method} ${this._url}`,
              status: this.status,
              duration: `${duration}ms`,
              timestamp: new Date().toISOString(),
              details: {
                request: {
                  headers: this._requestHeaders || {},
                  body: this._requestBody || null
                },
                response: {
                  headers: responseHeaders,
                  body: responseBody
                }
              }
            };
            if (!LoggerState.isPaused) {
              const category = (this.status >= 200 && this.status < 300) ? "success" : "error";
              toastit(`${logEntry.type}: ${logEntry.message} (${logEntry.status})`, category, 10000);
              addLog(logEntry);
            } else
            {
              LoggerState.logs.push(logEntry);
            }
          }
          );
          this.addEventListener("error", () =>
          {
            if (LoggerState.isInternal)
              return;
            const logEntry = {
              type: "Error",
              message: `XHR Error: ${this._url}`,
              status: "Failed",
              duration: "N/A",
              timestamp: new Date().toISOString(),
              details: {
                request: {
                  headers: this._requestHeaders || {},
                  body: this._requestBody || null
                },
                response: {
                  headers: {},
                  body: null
                }
              }
            };
            if (!LoggerState.isPaused) {
              toastit(logEntry.message, "error", 5000);
              addLog(logEntry);
            } else
            {
              LoggerState.logs.push(logEntry);
            }
          }
          );
        }
        open(method, url, ...args) {
          this._startTime = performance.now();
          this._method = method;
          this._url = url;
          return super.open(method, url, ...args);
        }
        setRequestHeader(header, value) {
          if (!this._requestHeaders) {};
          this._requestHeaders[ header ] = value;
          return super.setRequestHeader(header, value);
        }
        send(body) {
          this._requestBody = body;
          return super.send(body);
        }
      }
      function parseXHRHeaders(headersString) {
        const headers = {};
        const headerPairs = headersString.trim().split(/[\r\n]+/);
        headerPairs.forEach(line =>
        {
          const parts = line.split(': ');
          const header = parts.shift();
          const value = parts.join(': ');
          headers[ header ] = value;
        }
        );
        return headers;
      }
      function init() {
        window.XMLHttpRequest = InterceptedXHR;
      }
      function destroy() {
        window.XMLHttpRequest = originalXHR;
      }
      function reinit() {
        destroy();
        init();
      }
      return {
        init,
        destroy,
        reinit
      };
    }
    )();
    const FetchInterceptor = (() =>
    {
      let config = {
        legacyIntercept: true,
        blockingMode: 'blocking'
      };
      const originalFetch = window.fetch;
      async function interceptedFetch(...args) {
        if (LoggerState.isInternal)
          return originalFetch.apply(this, args);
        const url = args[ 0 ];
        const method = (args[ 1 ]?.method || "GET");
        const startTime = performance.now();
        let requestHeaders = {};
        if (args[ 1 ]?.headers) {
          if (args[ 1 ].headers instanceof Headers) {
            args[ 1 ].headers.forEach((value, key) =>
            {
              requestHeaders[ key ] = value;
            }
            );
          } else
          {
            Object.assign(requestHeaders, args[ 1 ].headers);
          }
        }
        const requestBody = args[ 1 ]?.body || null;
        if (config.legacyIntercept) {
          const shouldProceed = confirm(`Allow fetch request to ${url}?`);
          if (!shouldProceed) {
            return new Response(null, {
              status: 403,
              statusText: 'Request blocked'
            });
          }
        }
        try
        {
          const response = await originalFetch.apply(this, args);
          const duration = Math.round(performance.now() - startTime);
          const clonedResponse = response.clone();
          let responseBody;
          try
          {
            responseBody = await clonedResponse.text();
          } catch (e) {
            responseBody = "Unable to read response body.";
          }
          let responseHeaders = {};
          clonedResponse.headers.forEach((value, key) =>
          {
            responseHeaders[ key ] = value;
          }
          );
          const logEntry = {
            type: "Fetch",
            message: `${method} ${url}`,
            status: response.status,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
            details: {
              request: {
                headers: requestHeaders,
                body: requestBody
              },
              response: {
                headers: responseHeaders,
                body: responseBody
              }
            }
          };
          if (!LoggerState.isPaused) {
            const category = response.status >= 200 && response.status < 300 ? "network" : "error";
            toastit(`${logEntry.type}: ${logEntry.message} (${logEntry.status})`, category, 10000);
            addLog(logEntry);
          } else
          {
            LoggerState.logs.push(logEntry);
          }
          return response;
        } catch (error) {
          const logEntry = {
            type: "Error",
            message: `Fetch Error: ${error.message}`,
            status: "Failed",
            duration: "N/A",
            timestamp: new Date().toISOString(),
            details: {
              request: {
                headers: requestHeaders,
                body: requestBody
              },
              response: {
                headers: {},
                body: null
              }
            }
          };
          if (!LoggerState.isPaused) {
            toastit(logEntry.message, "error", 5000);
            addLog(logEntry);
          } else
          {
            LoggerState.logs.push(logEntry);
          }
          throw error;
        }
      }
      function init() {
        window.fetch = interceptedFetch;
        const cfi = setInterval(() => {
          if (window.fetch != interceptedFetch) {
            console.log(safeStringify(Object.assign({}, window.fetch)));
            init();
            console.count(`cfi`);
            console.log(cfi);
            clearInterval(cfi);
          }
    }, 1);
      }
      function destroy() {
        window.fetch = originalFetch;
      }
      function reinit() {
        destroy();
        init();
      }
      function updateConfig(newConfig) {
        config = {
          ...config,
          ...newConfig
        };
      }
  
      return {
        init,
        destroy,
        reinit,
        updateConfig
      };
    }
    )();
  
    class LogPanel extends HTMLElement
    {
      constructor () {
        super();
        this.settings = {};
        this.isPaused = false;
        this.persistLogsEnabled = false;
        this._init();
        this._initSettingsSync();
      }
  
      static get observedAttributes() {
        return [ "theme", "data-theme", "search", "minimized" ];
      }
  
      _init() {
        this.attachShadow({ mode: "open" });
        const _styles = document.createElement("style");
        _styles.textContent = `
      :host {
        position: fixed;
        bottom: 5vh;
        right: 5vw;
        z-index: 999998;
        display: block;
        --panel-bg: rgba(255, 255, 255, 0.95);
        --panel-color: #333;
        --panel-border: 1px solid rgba(41, 72, 41, 0.3);
        --panel-shadow: 0 2px 12px rgba(0,0,0,0.15);
        --panel-backdrop: blur(8px);
        --panel-transition: all 0.3s ease;
        --controls-color: rgba(0, 153, 0, 0.8);
        --controls-hover: rgba(0, 102, 0, 1);
        --compact-padding: 0.5rem;
        --compact-font-size: 0.85rem;
      }
      .panel {
        background: var(--panel-bg);
        color: var(--panel-color);
        border: var(--panel-border);
        box-shadow: var(--panel-shadow);
        backdrop-filter: var(--panel-backdrop);
        border-radius: 4px;
        padding: var(--compact-padding);
        transition: var(--panel-transition);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        width: clamp(280px, 30vw, 500px);
        max-height: 80vh;
        max-width: 500px;
        min-width: 280px;
        resize: both;
        position: fixed;
        bottom: 1%;
        right: 1%;
        min-height: 3rem;
        font-size: var(--compact-font-size);
      }
      div.panel.hidden { max-height: min-content; }
      .log-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;
        user-select: none;
        padding: 0.25rem 0.5rem;
        border-bottom: 1px solid rgba(0, 150, 0, 0.3);
      }
      .controls { display: flex; gap: 0.25rem; }
      .controls button {
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 0.8rem;
        padding: 0.2rem 0.3rem;
        color: var(--controls-color);
        border-radius: 3px;
        transition: all 0.2s ease;
      }
      .controls button:hover {
        color: var(--controls-hover);
        background: rgba(0, 255, 0, 0.1);
      }
      .filter-area {
        padding: 0.25rem 0.5rem;
        border-bottom: 1px solid rgba(0, 150, 0, 0.3);
      }
      .filter-area input[type="text"] {
        width: 100%;
        padding: 0.25rem 0.5rem;
        border: 1px solid rgba(0, 150, 0, 0.3);
        border-radius: 3px;
        background: rgba(255, 255, 255, 0.9);
        color: var(--panel-color);
        font-size: 0.8rem;
      }
      .log-content {
        padding: 0.25rem 0.5rem;
        overflow-y: auto;
        flex: 1;
      }
      .log-item {
        padding: 0.3rem 0.4rem;
        border-bottom: 1px solid rgba(0, 150, 0, 0.3);
        background: rgba(240, 240, 240, 0.95);
        margin-bottom: 0.3rem;
        border-radius: 3px;
        font-size: 0.8rem;
        white-space: normal;
        word-wrap: break-word;
      }
      .details {
        padding: 0.3rem 0.4rem;
        background: rgba(230, 230, 230, 0.9);
        border-radius: 3px;
        margin-top: 0.3rem;
        font-size: 0.75rem;
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow: hidden;
        transition: max-height 0.3s ease;
        max-height: 0;
      }
      .details.visible { 
        max-height: 100%; 
        overflow-x: hidden;
        overflow-y: auto;
        max-width: 90%;
        margin: 1% auto;
      }
      .details pre {
        display: contents;
        position: relative;
        white-space: pre-wrap;
        word-break: break-word;
        margin: 0;
        padding: 0.25rem;
      }
      @media (max-width: 768px) {
        .panel { width: 90vw; right: 5vw; font-size: 0.8rem; }
        .filter-area input[type="text"] { font-size: 0.75rem; }
        .controls button { font-size: 0.75rem; }
      }
      @supports not (backdrop-filter: blur(8px)) {
        .panel { background: rgba(255, 255, 255, 0.9); }
      }
      * { box-sizing: content-box; }
    `;
        const _panel = document.createElement("div");
        _panel.classList.add("panel");
        let domeventSettingsHTML = "";
        Object.keys(LoggerState.loggers.DOMEventLogger.events).forEach(key =>
        {
          domeventSettingsHTML += `<details>
          <summary>${key}</summary>
          <div style="display:flex; flex-direction:column; gap: 4px;">
            <label><input type="checkbox" id="${key}_enabled" ${LoggerState.loggers.DOMEventLogger.events[ key ].on ? "checked" : ""}> Enable</label>
            <label><input type="checkbox" id="${key}_log" ${LoggerState.loggers.DOMEventLogger.events[ key ].log ? "checked" : ""}> Log</label>
            <label><input type="checkbox" id="${key}_toast" ${LoggerState.loggers.DOMEventLogger.events[ key ].toast ? "checked" : ""}> Toast</label>
          </div>
        </details>`;
        });
  
        let consoleSettingsHTML = "";
        Object.keys(LoggerState.loggers.ConsoleInterceptor.methods).forEach(key =>
        {
          consoleSettingsHTML += `<label>${key}: <input type="checkbox" id="console_${key}" ${LoggerState.loggers.ConsoleInterceptor.methods[ key ].on ? "checked" : ""}></label>`;
        });
  
        _panel.innerHTML = `
      <div class="log-header">
        <strong>DOM Logs</strong>
        <div class="controls">
          <button id="pauseLogs" title="Pause Logs">||</button>
          <button id="clearLogs" title="Clear Logs">Clear</button>
          <button id="copyLogs" title="Copy Logs">📝</button>
          <button id="exportLogs" title="Export Logs">📤</button>
          <button id="toggleTheme" title="Toggle Theme">🖌️</button>
          <button id="persistLogs" title="Persist Logs">🗄️</button>
          <button id="minimizePanel" title="Minimize">➖</button>
          <button id="closePanel" title="Close Logs">✖️</button>
        </div>
      </div>
      <div class="filter-area" style="display:flex; justify-content:space-between; align-items:center;">
        <input type="text" id="logSearch" placeholder="Search logs...">
        <select id="logsort">
          <option value="default">Sort By...</option>
        </select>
      </div>
      <details id="settingsMenu" class="settings-menu">
        <summary style="color:#999;" title="Settings">⚙️</summary>
        <div class="settings-options" style="color:#999; background-color:var(--panel-bg);">
          <fieldset>
            <legend>DOM Events</legend>
            <details>
              <summary><input type="checkbox" id="domEvents_global" ${LoggerState.loggers.DOMEventLogger.on ? "checked" : ""}> Global Enable</summary>
              <div style="display:flex;flex-wrap:wrap;overflow:hidden;max-width:100%;">
              ${domeventSettingsHTML}
              </div>
            </details>
          </fieldset>
          <fieldset>
            <legend>Console</legend>
            <details>
            <summary>
            <label><input type="checkbox" id="console_global" ${LoggerState.loggers.ConsoleInterceptor.on ? "checked" : ""}> Global Enable Console Interception</label></summary>
            <div style="display:flex;flex-wrap:wrap;overflow:hidden;max-width:100%;">
            ${consoleSettingsHTML}
            </div>
          </fieldset>
          <fieldset>
            <legend>Performance Metrics</legend>
            <label><input type="checkbox" id="fcpToggle" ${LoggerState.loggers.PerformanceEventLogger.events.FCP.on ? "checked" : ""}> Log FCP</label>
            <label><input type="checkbox" id="clsToggle" ${LoggerState.loggers.PerformanceEventLogger.events.CLS.on ? "checked" : ""}> Log CLS</label>
          </fieldset>
          <fieldset>
            <legend>XHR & Fetch</legend>
            <label><input type="checkbox" id="xhrToggle" ${LoggerState.loggers.XHRInterceptor.on ? "checked" : ""}> Enable XHR Logging</label>
            <label><input type="checkbox" id="fetchToggle" ${LoggerState.loggers.FetchInterceptor.on ? "checked" : ""}> Enable Fetch Logging</label>
            <label>
              Fetch Confirmation Mode:
              <select id="fetchModeSelect">
                <option value="blocking" ${LoggerState.loggers.FetchInterceptor.blockingMode === "blocking" ? "selected" : ""}>Blocking</option>
                <option value="non-blocking" ${LoggerState.loggers.FetchInterceptor.blockingMode === "non-blocking" ? "selected" : ""}>Non-blocking</option>
              </select>
            </label>
          </fieldset>
          <fieldset>
            <legend>Log Filters</legend>
            <div class="filter-checkboxes">
              <label><input type="checkbox" data-type="Fetch" checked> Fetch</label>
              <label><input type="checkbox" data-type="XHR" checked> XHR</label>
              <label><input type="checkbox" data-type="Error" checked> Error</label>
              <label><input type="checkbox" data-type="Log" checked> Log</label>
              <label><input type="checkbox" data-type="Info" checked> Info</label>
              <label><input type="checkbox" data-type="Warning" checked> Warning</label>
              <label><input type="checkbox" data-type="Debug" checked> Debug</label>
              <label><input type="checkbox" data-type="DOM" checked> DOM</label>
            </div>
          </fieldset>
        </div>
      </details>
      <div class="log-content"></div>
    `;
        this.shadowRoot.appendChild(_styles);
        this.shadowRoot.appendChild(_panel);
        this.panelEl = this.shadowRoot.querySelector(".panel");
        this.headerEl = this.shadowRoot.querySelector(".log-header");
        this.logContent = this.shadowRoot.querySelector(".log-content");
        this.filtersEl = this.shadowRoot.querySelector(".filter-area");
        this.searchInput = this.shadowRoot.querySelector("#logSearch");
        this.filterCheckboxes = Array.from(this.shadowRoot.querySelectorAll(".filter-checkboxes input[type='checkbox']"));
        this.searchInput.addEventListener("input", () => this.applyFilters());
        this.filterCheckboxes.forEach(cb => cb.addEventListener("change", () => this.applyFilters()));
        this.attachSettingsListeners();
        this.addControlsListeners();
        this.makeDraggable(this.headerEl);
      }
  
      // _initSettingsSync() {
      //   window.postMessage({ type: "getSettings" }, "*");
      //   window.addEventListener("message", (event) => {
      //     if (event.source !== window || !event.data) return;
      //     if (event.data.type === "gotSettings" && event.data.settings) {
      //       Object.keys(event.data.settings).forEach((key) => {
      //         const checkbox = this.shadowRoot.querySelector(`#${key}`);
      //         if (checkbox) {
      //           checkbox.checked = event.data.settings[key];
      //         }
      //       });
      //     } else if (event.data.type === "settingsUpdated" && event.data.settings) {
      //       Object.keys(event.data.settings).forEach((key) => {
      //         const checkbox = this.shadowRoot.querySelector(`#${key}`);
      //         if (checkbox) {
      //           checkbox.checked = event.data.settings[key];
      //         }
      //       });
      //     }
      //   });
      // }
  
      attachSettingsListeners() {
        const domGlobal = this.shadowRoot.querySelector('#domEvents_global');
        if (domGlobal) {
          domGlobal.addEventListener('change', e =>
          {
            LoggerState.loggers.DOMEventLogger.on = e.target.checked;
            window.postMessage({ type: "setSetting", setting: "domEvents_global", value: e.target.checked }, "*");
            console.log("Global DOM Events toggled:", e.target.checked);
          });
        }
        const consoleGlobal = this.shadowRoot.querySelector('#console_global');
        if (consoleGlobal) {
          consoleGlobal.addEventListener('change', e =>
          {
            LoggerState.loggers.ConsoleInterceptor.on = e.target.checked;
            window.postMessage({ type: "setSetting", setting: "console_global", value: e.target.checked }, "*");
            console.log("Global Console Interception toggled:", e.target.checked);
          });
        }
        config.events.forEach(eventType =>
        {
          const enabledCheckbox = this.shadowRoot.querySelector(`#${eventType}_enabled`);
          const logCheckbox = this.shadowRoot.querySelector(`#${eventType}_log`);
          const toastCheckbox = this.shadowRoot.querySelector(`#${eventType}_toast`);
          if (enabledCheckbox) {
            enabledCheckbox.addEventListener('change', e =>
            {
              LoggerState.loggers.DOMEventLogger.events[ eventType ].on = e.target.checked;
              updateDOMActiveEvents();
              window.postMessage({ type: "setSetting", setting: `${eventType}_enabled`, value: e.target.checked }, "*");
              console.log(`${eventType} enabled set to:`, e.target.checked);
            });
          }
          if (logCheckbox) {
            logCheckbox.addEventListener('change', e =>
            {
              LoggerState.loggers.DOMEventLogger.events[ eventType ].log = e.target.checked;
              window.postMessage({ type: "setSetting", setting: `${eventType}_log`, value: e.target.checked }, "*");
              console.log(`${eventType} log set to:`, e.target.checked);
            });
          }
          if (toastCheckbox) {
            toastCheckbox.addEventListener('change', e =>
            {
              LoggerState.loggers.DOMEventLogger.events[ eventType ].toast = e.target.checked;
              window.postMessage({ type: "setSetting", setting: `${eventType}_toast`, value: e.target.checked }, "*");
              console.log(`${eventType} toast set to:`, e.target.checked);
            });
          }
        });
        const fcpToggle = this.shadowRoot.querySelector('#fcpToggle');
        const clsToggle = this.shadowRoot.querySelector('#clsToggle');
        const xhrToggle = this.shadowRoot.querySelector('#xhrToggle');
        const fetchToggle = this.shadowRoot.querySelector('#fetchToggle');
        const fetchModeSelect = this.shadowRoot.querySelector('#fetchModeSelect');
        if (fcpToggle) {
          fcpToggle.addEventListener('change', e =>
          {
            if (!LoggerState.loggers.PerformanceEventLogger.events.FCP) {
              LoggerState.loggers.PerformanceEventLogger.events.FCP = { on: false };
            }
            LoggerState.loggers.PerformanceEventLogger.events.FCP.on = e.target.checked;
            console.log("FCP Logging toggled:", e.target.checked);
          });
        }
        if (clsToggle) {
          clsToggle.addEventListener('change', e =>
          {
            if (!LoggerState.loggers.PerformanceEventLogger.events.CLS) {
              LoggerState.loggers.PerformanceEventLogger.events.CLS = { on: false };
            }
            LoggerState.loggers.PerformanceEventLogger.events.CLS.on = e.target.checked;
            console.log("CLS Logging toggled:", e.target.checked);
          });
        }
        if (xhrToggle) {
          xhrToggle.addEventListener('change', e =>
          {
            LoggerState.loggers.XHRInterceptor.on = e.target.checked;
            console.log("XHR Logging toggled:", e.target.checked);
          });
        }
        if (fetchToggle) {
          fetchToggle.addEventListener('change', e =>
          {
            LoggerState.loggers.FetchInterceptor.on = e.target.checked;
            console.log("Fetch Logging toggled:", e.target.checked);
          });
        }
        if (fetchModeSelect) {
          fetchModeSelect.addEventListener('change', e =>
          {
            LoggerState.loggers.FetchInterceptor.blockingMode = e.target.value;
            FetchInterceptor.updateConfig({ blockingMode: e.target.value });
            console.log("Fetch Confirmation Mode set to:", e.target.value);
          });
        }
        const filterCheckboxes = this.shadowRoot.querySelectorAll('.filter-checkboxes input[type="checkbox"]');
        filterCheckboxes.forEach(cb =>
        {
          cb.addEventListener('change', e =>
          {
            const type = e.target.getAttribute("data-type");
            console.log(`Log filter for ${type} set to`, e.target.checked);
          });
        });
      }
  
      addControlsListeners() {
        const pauseBtn = this.shadowRoot.querySelector("#pauseLogs");
        const clearBtn = this.shadowRoot.querySelector("#clearLogs");
        const copyBtn = this.shadowRoot.querySelector("#copyLogs");
        const exportBtn = this.shadowRoot.querySelector("#exportLogs");
        const toggleThemeBtn = this.shadowRoot.querySelector("#toggleTheme");
        const persistBtn = this.shadowRoot.querySelector("#persistLogs");
        const minimizeBtn = this.shadowRoot.querySelector("#minimizePanel");
        const closeBtn = this.shadowRoot.querySelector("#closePanel");
        this.controls = { pauseBtn, clearBtn, copyBtn, exportBtn, toggleThemeBtn, persistBtn, minimizeBtn, closeBtn };
        pauseBtn.addEventListener("click", e =>
        {
          e.stopPropagation();
          LoggerState.isPaused = !LoggerState.isPaused;
          pauseBtn.textContent = LoggerState.isPaused ? ">" : "||";
          toastit(LoggerState.isPaused ? "Logging Paused" : "Logging Resumed", LoggerState.isPaused ? "blocked" : "success", 3000);
        });
        clearBtn.addEventListener("click", e =>
        {
          e.stopPropagation();
          LoggerState.logs = [];
          this.logContent.innerHTML = "";
          this.persistLogs();
          toastit("All logs cleared.", "success", 5000);
        });
        copyBtn.addEventListener("click", e =>
        {
          e.stopPropagation();
          copyLogsToClipboard();
        });
        exportBtn.addEventListener("click", e =>
        {
          e.stopPropagation();
          exportLogsAsJSON();
        });
        toggleThemeBtn.addEventListener("click", e =>
        {
          e.stopPropagation();
          toggleTheme();
        });
        persistBtn.addEventListener("click", e =>
        {
          e.stopPropagation();
          this.persistLogs();
          toastit("Logs persisted.", "success", 10000);
        });
        minimizeBtn.addEventListener("click", e =>
        {
          e.stopPropagation();
          this.panelEl.classList.toggle("hidden");
          if (this.panelEl.classList.contains("hidden"))
            this._minimize();
          else
            this._maximize();
        });
        closeBtn.addEventListener("click", e =>
        {
          e.stopPropagation();
          this.remove();
        });
      }
  
      makeDraggable(handle) {
        let offsetX = 0;
        let offsetY = 0;
        this.isDragging = false;
        let originalWidth, originalHeight;
        let animationFrameId = null;
        const mouseMoveHandler = (e) =>
        {
          if (!this.isDragging) return;
          if (animationFrameId !== null) return;
          animationFrameId = requestAnimationFrame(() =>
          {
            this.panelEl.style.transition = "none";
            let newX = Math.max(0, e.clientX - offsetX);
            let newY = Math.max(0, e.clientY - offsetY);
            let newWidth = Math.min(originalWidth, window.innerWidth - newX);
            let newHeight = Math.min(originalHeight, window.innerHeight - newY);
            newWidth = newWidth < 50 ? 50 : newWidth;
            newHeight = newHeight < 50 ? 50 : newHeight;
            this.panelEl.style.left = `${newX}px`;
            this.panelEl.style.top = `${newY}px`;
            this.panelEl.style.width = `${newWidth}px`;
            this.panelEl.style.height = `${newHeight}px`;
            this.panelEl.style.position = "fixed";
            animationFrameId = null;
          });
        };
        const mouseUpHandler = () =>
        {
          this.isDragging = false;
          this.panelEl.style.userSelect = "";
          document.removeEventListener("mousemove", mouseMoveHandler);
          document.removeEventListener("mouseup", mouseUpHandler);
          this.panelEl.style.transition = "all 0.3s ease-in-out";
        };
        handle.addEventListener("mousedown", e =>
        {
          this.isDragging = true;
          const rect = this.panelEl.getBoundingClientRect();
          offsetX = e.clientX - rect.left;
          offsetY = e.clientY - rect.top;
          originalWidth = rect.width;
          originalHeight = rect.height;
          this.panelEl.style.userSelect = "none";
          document.addEventListener("mousemove", mouseMoveHandler);
          document.addEventListener("mouseup", mouseUpHandler);
        });
        this._initResizeObserver();
      }
  
      _initResizeObserver() {
        let resizeTimeout;
        const observer = new ResizeObserver(entries =>
        {
          for (let entry of entries) {
            if (!resizeTimeout) {
              resizeTimeout = requestAnimationFrame(() =>
              {
                entry.target.style.transition = "none";
                const rect = entry.target.getBoundingClientRect();
                const maxWidth = window.innerWidth - rect.left;
                const maxHeight = window.innerHeight - rect.top;
                const newWidth = entry.contentRect.width > maxWidth ? maxWidth : entry.contentRect.width;
                const newHeight = entry.contentRect.height > maxHeight ? maxHeight : entry.contentRect.height;
                if (entry.contentRect.width > maxWidth) {
                  entry.target.style.width = `${newWidth}px`;
                }
                if (entry.contentRect.height > maxHeight) {
                  entry.target.style.height = `${newHeight}px`;
                }
                resizeTimeout = null;
                entry.target.style.transition = "all 0.3s ease-in-out";
              });
            }
          }
        });
        this.panelEl.style.resize = 'both';
        this.panelEl.style.overflow = 'hidden';
        this.panelEl.style.minWidth = '250px';
        this.panelEl.style.minHeight = '10rem';
        observer.observe(this.panelEl);
      }
      passesFilter(logEntry) {
        const searchTerm = (this.searchInput?.value || "").toLowerCase();
        // Get the types that are checked.
        const allowedTypes = DOMEventLogger.getState().activeEvents;
        const entrytext = [ logEntry.message, logEntry.type, logEntry.details ].join();
        // Check if the log type is allowed and if its message contains the search term.
        return allowedTypes.includes(logEntry.type) &&
          entrytext.toLowerCase().split('').includes(searchTerm);
      }
  
      // Re-render the entire log list based on the current filters.
      applyFilters() {
        const logContent = this.logContent || this.shadowRoot.querySelector(`.log-content`);
        if (!logContent) return;
        logContent.innerHTML = "";
        const logs = LoggerState.logs;
        // Render logs in reverse order (newest on top).
        for (let i = logs.length - 1; i >= 0; i--) {
          if (this.passesFilter(logs[ i ])) {
            this.appendLog(logs[ i ]);
          }
        }
      }
  
      appendLog(logEntry) {
        const logEl = createLogElement(logEntry);
        this.logContent.prepend(logEl);
      }
  
      theme(themeName) {
        const darkTheme = { backgroundColor: "rgba(15, 15, 15, 0.9)", color: "rgb(245, 250, 255)" };
        const lightTheme = { backgroundColor: "rgba(255, 255, 255, 0.9)", color: "rgb(0, 0, 0)" };
        const themeRule = themeName.includes("dark") ? darkTheme : lightTheme;
        const applyStyle = (element, style) =>
        {
          Object.assign(element.style, style);
          Array.from(element.children).forEach(child => applyStyle(child, style));
        };
        applyStyle(this.panelEl, themeRule);
      }
  
      _minimize() {
        this.logContent.style.display = "none";
        this.filtersEl.style.display = "none";
        this.controls.persistBtn.style.display = "none";
        this.controls.exportBtn.style.display = "none";
        this.controls.copyBtn.style.display = "none";
        this.controls.toggleThemeBtn.style.display = "none";
        this.controls.minimizeBtn.textContent = "+";
        this.headerEl.style.borderBottom = "2px ridge rgba(9, 255, 0, 0.4)";
        this.panelEl.style.width = "fit-content";
        this.panelEl.style.maxWidth = "90%";
        this.panelEl.style.minWidth = "auto";
        this.panelEl.style.height = "auto";
        this.panelEl.style.minHeight = "max-content";
        this.panelEl.style.maxHeight = "max-content";
      }
  
      _maximize() {
        this.logContent.style.display = "initial";
        this.filtersEl.style.display = "initial";
        this.controls.persistBtn.style.display = "inline-block";
        this.controls.exportBtn.style.display = "inline-block";
        this.controls.copyBtn.style.display = "inline-block";
        this.controls.toggleThemeBtn.style.display = "inline-block";
        this.controls.minimizeBtn.textContent = "?";
        this.headerEl.style.borderBottom = "2px groove #ccc";
        this.panelEl.style.maxWidth = "90%";
        this.panelEl.style.minWidth = "250px";
        this.panelEl.style.minHeight = "10rem";
        this.panelEl.style.maxHeight = "98%";
      }
  
      attributeChangedCallback(name, oldValue, newValue) {
        if (newValue === oldValue) return;
        if (name === "theme" || name === "data-theme") {
          this.theme(newValue);
        }
        if (name === "search") {
          this.searchInput.value = newValue;
          this.applyFilters();
        }
        if (name === "minimized") {
          this.controls.minimizeBtn && this.controls.minimizeBtn.click();
        }
      }
  
      disconnectedCallback() {
        this.searchInput.removeEventListener("input", () => this.applyFilters());
        this.filterCheckboxes.forEach(cb => cb.removeEventListener("change", () => this.applyFilters()));
      }
  
      persistLogs() {
        try
        {
          window.postMessage({ type: "saveLogs", logs: LoggerState.logs }, "*");
        } catch (error) {
          console.error("Error persisting logs:", error);
        }
      }
  
      connectedCallback() {
        // Initialization already handled in the constructor.
      }
  
      _initSettingsSync() {
        window.postMessage({ type: "getSettings" }, "*");
        window.addEventListener("message", (event) =>
        {
          if (event.source !== window || !event.data) return;
  
          if (event.data.type === "gotSettings" && event.data.settings) {
            Object.keys(event.data.settings).forEach((key) =>
            {
              const value = event.data.settings[ key ];
              // Update the UI checkbox
              const checkbox = this.shadowRoot.querySelector(`#${key}`);
              if (checkbox) {
                checkbox.checked = value;
              }
              // Update the underlying LoggerState based on key naming conventions
              if (key === "domEvents_global") {
                LoggerState.loggers.DOMEventLogger.on = value;
              } else if (key === "console_global") {
                LoggerState.loggers.ConsoleInterceptor.on = value;
              } else if (key.endsWith("_enabled")) {
                const evt = key.slice(0, -8); // remove "_enabled"
                if (LoggerState.loggers.DOMEventLogger.events[ evt ] !== undefined) {
                  LoggerState.loggers.DOMEventLogger.events[ evt ].on = value;
                }
              } else if (key.endsWith("_log")) {
                const evt = key.slice(0, -4); // remove "_log"
                if (LoggerState.loggers.DOMEventLogger.events[ evt ] !== undefined) {
                  LoggerState.loggers.DOMEventLogger.events[ evt ].log = value;
                }
              } else if (key.endsWith("_toast")) {
                const evt = key.slice(0, -6); // remove "_toast"
                if (LoggerState.loggers.DOMEventLogger.events[ evt ] !== undefined) {
                  LoggerState.loggers.DOMEventLogger.events[ evt ].toast = value;
                }
              }
            });
            if (typeof updateDOMActiveEvents === "function") {
              updateDOMActiveEvents();
            }
          } else if (event.data.type === "settingsUpdated" && event.data.settings) {
            // Do the same update when settings are updated externally
            Object.keys(event.data.settings).forEach((key) =>
            {
              const value = event.data.settings[ key ];
              const checkbox = this.shadowRoot.querySelector(`#${key}`);
              if (checkbox) {
                checkbox.checked = value;
              }
              if (key === "domEvents_global") {
                LoggerState.loggers.DOMEventLogger.on = value;
              } else if (key === "console_global") {
                LoggerState.loggers.ConsoleInterceptor.on = value;
              } else if (key.endsWith("_enabled")) {
                const evt = key.slice(0, -8);
                if (LoggerState.loggers.DOMEventLogger.events[ evt ] !== undefined) {
                  LoggerState.loggers.DOMEventLogger.events[ evt ].on = value;
                }
              } else if (key.endsWith("_log")) {
                const evt = key.slice(0, -4);
                if (LoggerState.loggers.DOMEventLogger.events[ evt ] !== undefined) {
                  LoggerState.loggers.DOMEventLogger.events[ evt ].log = value;
                }
              } else if (key.endsWith("_toast")) {
                const evt = key.slice(0, -6);
                if (LoggerState.loggers.DOMEventLogger.events[ evt ] !== undefined) {
                  LoggerState.loggers.DOMEventLogger.events[ evt ].toast = value;
                }
              }
            });
            if (typeof updateDOMActiveEvents === "function") {
              updateDOMActiveEvents();
            }
          }
        });
      }
  
    }
  
    customElements.define("log-panel", LogPanel);
  
    function persistLogs() {
      try
      {
        window.postMessage({ type: "saveLogs", logs: LoggerState.logs }, "*");
      } catch (error) {
        console.error("Error persisting logs:", error);
      }
    }
  
    function getLogPanel(piece = 'host') {
      try
      {
        const loghost = document.querySelector("log-panel");
        if (!loghost || !loghost.shadowRoot) return null;
        if (piece === 'host') return loghost;
        const panel = loghost.shadowRoot.querySelector(".panel") || loghost.shadowRoot.querySelector('div');
        if (!panel) return null;
        const makeobj = () =>
        {
          const _p = {
            panelhead: panel.querySelector(".log-header"),
            panelbody: panel.querySelector(".log-content"),
            panelinputsarea: panel.querySelector(".filter-area")
          };
          return Object.assign(loghost, { panel, ..._p });
        };
        const logpanel = makeobj();
        switch (piece) {
        case 'host': return loghost;
        case 'top':
        case 'head': return logpanel.panelhead;
        case 'body': return logpanel.panelbody;
        case 'opts': return logpanel.panelinputsarea;
        default: return loghost;
        }
      } catch (error) {
        console.error('Error in getLogPanel:', error);
        return null;
      }
    }
  
    renderLog = (logEntry) =>
    {
      const logPanel = getLogPanel();
      if (logPanel && typeof logPanel.appendLog === "function") {
        logPanel.appendLog(logEntry);
      } else
      {
        const fallback = document.getElementById("logPanel");
        if (fallback) {
          fallback.prepend(createLogElement(logEntry));
        }
      }
    };
  
    function copyLogsToClipboard() {
      if (!LoggerState.logs.length) {
        toastit("No logs to copy", "error", 200);
        return;
      }
      const logText = LoggerState.logs.map(log => `${log.type}: ${log.message}\nStatus: ${log.status}, Duration: ${log.duration}, Timestamp: ${log.timestamp}\n` + (log.details ? formatDetails(log.details) : "")).join("\n\n");
      navigator.clipboard.writeText(logText).then(() =>
      {
        toastit("Logs copied to clipboard", "success", 200);
      }).catch(() =>
      {
        toastit("Failed to copy logs", "error", 200);
      });
    }
  
    function exportLogsAsJSON() {
      if (!LoggerState.logs.length) {
        toastit("No logs to export", "error", 200);
        return;
      }
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(LoggerState.logs));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "logs_" + new Date().toISOString() + ".json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toastit("Logs exported as JSON", "success", 200);
    }
  
    function convertLogsToCSV(logsArray) {
      const header = [ "Type", "Message", "Status", "Duration", "Timestamp", "Request Headers", "Request Body", "Response Headers", "Response Body" ].join(",");
      const rows = logsArray.map(log =>
      {
        const reqHeaders = log.details?.request?.headers != null ? JSON.stringify(log.details.request.headers) : "";
        const reqBody = log.details?.request?.body != null ? JSON.stringify(log.details.request.body) : "";
        const resHeaders = log.details?.response?.headers != null ? JSON.stringify(log.details.response.headers) : "";
        const resBody = log.details?.response?.body != null ? JSON.stringify(log.details.response.body) : "";
        return [ `"${log.type}"`, `"${log.message}"`, `"${log.status}"`, `"${log.duration}"`, `"${log.timestamp}"`, `"${reqHeaders}"`, `"${reqBody}"`, `"${resHeaders}"`, `"${resBody}"` ].join(",");
      });
      return [ header, ...rows ].join("\n");
    }
  
    function exportLogsAsCSV() {
      if (!LoggerState.logs.length) {
        toastit("No logs to export", "error", 2000);
        return;
      }
      const csvContent = convertLogsToCSV(LoggerState.logs);
      const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "logs_" + new Date().toISOString() + ".csv");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toastit("Logs exported as CSV", "success", 2000);
    }
  
    function toggleTheme() {
      const logPanel = document.querySelector("log-panel");
      const currentTheme = logPanel.getAttribute("data-theme") || "light";
      const newTheme = currentTheme === "light" ? "dark" : "light";
      logPanel.setAttribute("data-theme", newTheme);
      logPanel.theme(newTheme);
      LoggerState.theme = newTheme;
      toastit("Switched to " + newTheme + " mode", "success", 2000);
    }
  
    function togglePauseLogs(flag = true) {
      if (!flag) return;
      LoggerState.isPaused = !LoggerState.isPaused;
    }
  
    DOMEventLogger.init();
    ConsoleInterceptor.interceptConsole();
    XHRInterceptor.init();
    FetchInterceptor.init();
    if (!document.querySelector("log-panel")) {
      document.documentElement.appendChild(document.createElement("log-panel"));
    }
    console.log("Crossing a frozen lake is like programming... every sign that it's gunna break but it works just fine if you test it first.\n\nSometimes though, it breaks only a little, enough to make you question your decisions that got you there, but ultimately holds together.\nRegardless, if you see this it means nothing really. Best best of luck to you.");
  
  }
  )();
  const FUCKOFF = (function (_) { return DOMLogger || _; })();
  
  Object.assign(window, FUCKOFF);
  window.DOMLogger = FUCKOFF;
  
  class BasicVersion {
    constructor() {
      return(() => {
  
      /* ─── INTERNAL STATE ────────────────────────────────────────────── */
      let isInternal = false;
      let isPaused = false;
      let logs = [];
  
      /* ─── TOAST NOTIFICATIONS (via Shadow DOM) ───────────────────────── */
      function createToasterClass() {
        if (document.getElementById("shadow-toast-host")) return;
        const hostEl = document.createElement("div");
        hostEl.id = "shadow-toast-host";
        document.documentElement.appendChild(hostEl);
        const shadow = hostEl.attachShadow({ mode: "open" });
  
        const toastStyle = document.createElement("style");
        toastStyle.textContent = `
        .toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          z-index: 999999;
          pointer-events: none;
        }
        .toast {
          pointer-events: auto;
          background: rgba(50, 50, 50, 0.9);
          color: #fff;
          padding: 10px 16px;
          margin-bottom: 8px;
          border-radius: 6px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.4);
          font-size: 14px;
          font-family: monospace;
          max-width: 300px;
          word-wrap: break-word;
          white-space: pre-wrap;
          opacity: 0;
          transform: translateX(100%) scale(0.8);
          transition: opacity 0.3s ease, transform 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .toast.show {
          opacity: 1;
          transform: translateX(0) scale(1);
        }
        .toast.network { background: rgba(255, 165, 0, 0.9); }
        .toast.error   { background: rgba(255, 50, 50, 0.9); }
        .toast.blocked { background: rgba(128, 0, 128, 0.9); }
        .toast.success { background: rgba(0, 128, 0, 0.9); }
        .toast.info    { background: rgba(0, 0, 255, 0.9); }
        .icon {
          font-size: 16px;
        }
      `;
        shadow.appendChild(toastStyle);
        const container = document.createElement("div");
        container.className = "toast-container";
        shadow.appendChild(container);
        return container;
      }
      const ToasterClass = createToasterClass();
  
      function toastit(message, category = "network", timeoutMs = 500) {
        if (!ToasterClass) return;
        const toast = document.createElement("div");
        toast.className = `toast ${category}`;
        const icon = document.createElement("span");
        icon.className = "icon";
        switch (category) {
        case "network": icon.textContent = "🌐"; break;
        case "error": icon.textContent = "❌"; break;
        case "blocked": icon.textContent = "⛔"; break;
        case "success": icon.textContent = "✅"; break;
        case "info": icon.textContent = "ℹ️"; break;
        default: icon.textContent = "💬";
        }
        const messageSpan = document.createElement("span");
        messageSpan.textContent = message;
        toast.appendChild(icon);
        toast.appendChild(messageSpan);
        ToasterClass.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add("show"));
        setTimeout(() =>
        {
          toast.classList.remove("show");
          setTimeout(() => toast.remove(), 300);
        }, timeoutMs);
      }
      /* ─── STYLE & UI: LOG PANEL ────────────────────────────────────────── */
      function injectStyles() {
        const light = {
          background: "#ffffff",
          color: "#000000",
          border: "1px solid #0f0",
          boxShadow: "0 0 20px rgba(0, 255, 0, 0.1)",
          backdropFilter: "blur(5px)",
          transition: "all 0.2s ease-in",
          searchBg: "#ffffff",
          searchColor: "#000500",
          searchBorder: "1px solid #0f0",
          logItemBg: "rgba(240, 240, 240, 0.95)",
          detailsBg: "rgba(230, 230, 230, 0.85)",
          controlsColor: "#090",
          controlsHoverColor: "#020",
          borderColor: "#010"
        };
        const dark = {
          background: "rgba(0, 0, 0, 0.9)",
          color: "rgba(255, 255, 255, 1)",
          border: "1px solid rgba(100, 100, 0, 0.5)",
          boxShadow: "0 0 20px rgba(0, 255, 0, 0.1)",
          backdropFilter: "blur(5px)",
          transition: "all 0.2s ease-in",
          searchBg: "rgba(0, 0, 0, 0.9)",
          searchColor: "#rgba(100, 200, 100, 1)",
          searchBorder: "1px solid #99ff9988",
          logItemBg: "rgba(0, 0, 0, 0.95)",
          detailsBg: "rgba(0, 0, 0, 0.85)",
          controlsColor: "#0f0",
          controlsHoverColor: "#fff",
          borderColor: "#0f0"
        };
        const styles = `
      :root {
        --panel-bg: ${light.background};
        --panel-color: ${light.color};
        --panel-border: ${light.border};
        --panel-shadow: ${light.boxShadow};
        --panel-backdrop: ${light.backdropFilter};
        --panel-transition: ${light.transition};
        --search-bg: ${light.searchBg};
        --search-color: ${light.searchColor};
        --search-border: ${light.searchBorder};
        --log-item-bg: ${light.logItemBg};
        --details-bg: ${light.detailsBg};
        --controls-color: ${light.controlsColor};
        --controls-hover: ${light.controlsHoverColor};
        --border-color: ${light.borderColor};
      }
      :root[data-theme="dark"] {
        --panel-bg: ${dark.background};
        --panel-color: ${dark.color};
        --panel-border: ${dark.border};
        --panel-shadow: ${dark.boxShadow};
        --panel-backdrop: ${dark.backdropFilter};
        --panel-transition: ${dark.transition};
        --search-bg: ${dark.searchBg};
        --search-color: ${dark.searchColor};
        --search-border: ${dark.searchBorder};
        --log-item-bg: ${dark.logItemBg};
        --details-bg: ${dark.detailsBg};
        --controls-color: ${dark.controlsColor};
        --controls-hover: ${dark.controlsHoverColor};
        --border-color: ${dark.borderColor};
      }
        /* Log Panel Container */
        #logPanel {
          position: fixed;
          right: 2vw;
          min-width: min-content;
          max-width: 80vw;
          min-height: 1.5rem;
          background: var(--panel-bg);
          color: var(--panel-color);
          font-family: monospace;
          padding: 0.5%;
          border-radius: 8px;
          box-shadow: var(--panel-shadow);
          z-index: 999999;
          overflow: hidden auto !important;
          backdrop-filter: var(--panel-backdrop);
          border: var(--panel-border);
          transition: var(--panel-transition);
          cursor: pointer;
        }
        #logPanel.hidden {
          height: 1.5rem;
          overflow: hidden;
          min-width: max-content;
        }
        #logPanel .log-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 10px;
          cursor: move;
        }
        #logPanel .controls button {
          background: transparent;
          border: none;
          color: var(--controls-color);
          cursor: pointer;
          font-size: 16px;
          margin-left: 8px;
        }
        #logPanel .controls button:hover {
          color: var(--controls-hover);
        }
        /* Filter/Search Area */
        #logPanel .filter-area {
          margin-bottom: 10px;
        }
        #logPanel .filter-area input[type="text"] {
          width: 100%;
          padding: 5px;
          margin-bottom: 5px;
          border: var(--search-border);
          border-radius: 4px;
          background: var(--search-bg);
          color: var(--search-color);
        }
        #logPanel .filter-area .filter-checkboxes label {
          margin-right: 10px;
          font-size: 12px;
          cursor: pointer;
        }
        /* Log Content */
        #logPanel .log-content {
          max-height: 50vh;
          overflow-y: auto;
          max-width: 75vw;
          scrollbar-width: thin;
        }
        .log-item {
          padding: 8px;
          border-bottom: 1px solid var(--border-color);
          background: var(--log-item-bg);
          max-width: 100%;
          overflow-wrap: break-word;
          word-wrap: break-word;
          word-break: break-all;
        }
        .details {
          margin-top: 8px;
          padding: 8px;
          background: var(--details-bg);
          border-radius: 4px;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }
        .details.visible {
          max-height: 500px;
        }
        .details pre {
          white-space: pre-wrap;
          word-wrap: break-word;
          margin: 0;
        }
      `;
        const styleSheet = document.createElement("style");
  
  
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
      }
  
      // Global references for filtering:
      let searchInput, filterCheckboxes, logContent;
  
      function createLogPanel() {injectStyles();
        const panel = document.createElement("div");
        panel.id = "logPanel";
        panel.innerHTML = `
        <div class="log-header">
            <strong>📜 Advanced Logs</strong>
            <div class="controls">
                <button id="minimizePanel" title="Minimize">➖</button>
                <button id="pauseLogs" title="Pause Logs">⏸️</button>
                <button id="clearLogs" title="Clear Logs">🗑️</button>
                <button id="exportLogs" title="Export Logs">📤</button>
                <button id="toggleTheme" title="Toggle Theme">🌓</button>
                <button id="toggleLogs" title="Close Logs">❌</button>
            </div>
        </div>
        <div class="filter-area">
            <input type="text" id="logSearch" placeholder="Search logs...">
            <div class="filter-checkboxes">
                <label><input type="checkbox" data-type="Fetch" checked> Fetch</label>
                <label><input type="checkbox" data-type="XHR" checked> XHR</label>
                <label><input type="checkbox" data-type="Error" checked> Error</label>
                <label><input type="checkbox" data-type="Log" checked> Log</label>
                <label><input type="checkbox" data-type="Info" checked> Info</label>
                <label><input type="checkbox" data-type="Warning" checked> Warning</label>
                <label><input type="checkbox" data-type="Debug" checked> Debug</label>
            </div>
        </div>
        <div class="log-content"></div>
      `;
  
        document.documentElement.appendChild(panel);
        makeDraggable(panel, panel.querySelector('.log-header'));
        addLogPanelEventListeners(panel);
  
        // Cache the search and filter elements and log content container.
        searchInput = panel.querySelector("#logSearch");
        filterCheckboxes = Array.from(panel.querySelectorAll(".filter-checkboxes input[type='checkbox']"));
        logContent = panel.querySelector(".log-content");
  
        // Add event listeners so that changes re-render the log list.
        searchInput.addEventListener("input", applyFilters);
        filterCheckboxes.forEach(checkbox =>
        {
          checkbox.addEventListener("change", applyFilters);
        });
  
        return panel;
      }
  
      // Allow the panel to be dragged by its header.
      function makeDraggable(element, handle) {
        let offsetX, offsetY, isDragging = false;
        handle.addEventListener("mousedown", (e) =>
        {
          isDragging = true;
          const rect = element.getBoundingClientRect();
          offsetX = e.clientX - rect.left;
          offsetY = e.clientY - rect.top;
          document.body.style.userSelect = 'none';
        });
        document.addEventListener("mousemove", (e) =>
        {
          if (!isDragging) return;
          element.style.left = `${e.clientX - offsetX}px`;
          element.style.top = `${e.clientY - offsetY}px`;
          element.style.position = "fixed";
        });
        document.addEventListener("mouseup", () =>
        {
          isDragging = false;
          document.body.style.userSelect = '';
        });
      }
  
      // Attach event listeners to the log panel’s controls.
      function addLogPanelEventListeners(panel) {
        const minimizeBtn = panel.querySelector("#minimizePanel");
        const toggleBtn = panel.querySelector("#toggleLogs");
        const clearBtn = panel.querySelector("#clearLogs");
        const exportBtn = panel.querySelector("#exportLogs");
        const pauseBtn = panel.querySelector("#pauseLogs");
        const toggleThemeBtn = panel.querySelector("#toggleTheme");
  
        minimizeBtn.addEventListener("click", (e) =>
        {
          e.stopPropagation();
          panel.classList.toggle("hidden");
          minimizeBtn.textContent = panel.classList.contains("hidden") ? "🔼" : "➖";
        });
        toggleBtn.addEventListener("click", (e) =>
        {
          e.stopPropagation();
          panel.remove();
        });
        clearBtn.addEventListener("click", (e) =>
        {
          e.stopPropagation();
          logs = [];
          logContent.innerHTML = "";
          persistLogs();
          toastit("All logs cleared.", "success");
        });
        exportBtn.addEventListener("click", (e) =>
        {
          e.stopPropagation();
          if (logs.length === 0) {
            toastit("No logs to export.", "error");
            return;
          }
          const format = prompt("Enter export format (json/csv):", "json");
          if (!format) return;
          const chosenFormat = format.trim().toLowerCase();
          if (chosenFormat === "json") {
            try
            {
              const dataStr = "data:text/json;charset=utf-8," +
                encodeURIComponent(JSON.stringify(logs, null, 2));
              const downloadAnchor = document.createElement("a");
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", "logs_" + new Date().toISOString() + ".json");
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
              toastit("Logs exported as JSON.", "success");
            } catch (error) {
              toastit("Failed to export logs as JSON.", "error");
            }
          } else if (chosenFormat === "csv") {
            try
            {
              const csvContent = convertLogsToCSV(logs);
              const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
              const downloadAnchor = document.createElement("a");
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", "logs_" + new Date().toISOString() + ".csv");
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
              toastit("Logs exported as CSV.", "success");
            } catch (error) {
              toastit("Failed to export logs as CSV.", "error");
            }
          } else
          {
            toastit("Unsupported export format.", "error");
          }
        });
        pauseBtn.addEventListener("click", (e) =>
        {
          e.stopPropagation();
          isPaused = !isPaused;
          pauseBtn.textContent = isPaused ? "▶️" : "⏸️";
          toastit(isPaused ? "Logging Paused" : "Logging Resumed",
            isPaused ? "blocked" : "success");
        });
        toggleThemeBtn.addEventListener("click", (e) =>
        {
          e.stopPropagation();
          const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
          const newTheme = currentTheme === "light" ? "dark" : "light";
          document.documentElement.setAttribute("data-theme", newTheme);
          toastit(`Switched to ${newTheme} mode.`, "success");
        });
      }
  
      /* ─── FILTERING: APPLY SEARCH & TYPE FILTERS ────────────────────────── */
      // Returns true if the log entry matches the current search text and filter checkboxes.
      function passesFilter(logEntry) {
        const searchTerm = (searchInput?.value || "").toLowerCase();
        // Get the types that are checked.
        const allowedTypes = filterCheckboxes
          .filter(cb => cb.checked)
          .map(cb => cb.getAttribute("data-type"));
        // Check if the log type is allowed and if its message contains the search term.
        return allowedTypes.includes(logEntry.type) &&
          logEntry.message.toLowerCase().includes(searchTerm);
      }
  
      // Re-render the entire log list based on the current filters.
      function applyFilters() {
        if (!logContent) return;
        logContent.innerHTML = "";
        // Render logs in reverse order (newest on top).
        for (let i = logs.length - 1; i >= 0; i--) {
          if (passesFilter(logs[ i ])) {
            // Use the helper to create the log element, then append.
            const logEl = createLogElement(logs[ i ]);
            logContent.appendChild(logEl);
  
          }
        }
      }
  
      /* ─── UTILITY: CONVERT LOGS TO CSV ──────────────────────────────────── */
      function convertLogsToCSV(logs) {
        const header = [ "Type", "Message", "Status", "Duration", "Timestamp",
          "Request Headers", "Request Body", "Response Headers", "Response Body" ].join(",");
        const rows = logs.map(log =>
        {
          const reqHeaders = log.details?.request?.headers ? JSON.stringify(log.details.request.headers) : "";
          const reqBody = log.details?.request?.body ? JSON.stringify(log.details.request.body) : "";
          const resHeaders = log.details?.response?.headers ? JSON.stringify(log.details.response.headers) : "";
          const resBody = log.details?.response?.body ? JSON.stringify(log.details.response.body) : "";
          return [
            `"${log.type}"`,
            `"${log.message}"`,
            `"${log.status}"`,
            `"${log.duration}"`,
            `"${log.timestamp}"`,
            `"${reqHeaders}"`,
            `"${reqBody}"`,
            `"${resHeaders}"`,
            `"${resBody}"`
          ].join(",");
        });
        return [ header, ...rows ].join("\n");
      }
  
      /* ─── RENDERING A LOG ENTRY ────────────────────────────────────────── */
      // Create and return a DOM element for a log entry.
      function createLogElement(logEntry) {
        const logItem = document.createElement("div");
        logItem.className = "log-item";
        logItem.innerHTML = `
        <strong>${logEntry.type}:</strong> ${logEntry.message}<br>
        <strong>Status:</strong> ${logEntry.status || "N/A"}<br>
        <strong>Duration:</strong> ${logEntry.duration || "N/A"}<br>
        <strong>Time:</strong> ${new Date(logEntry.timestamp).toLocaleTimeString()}
        <button class="details-btn" title="View Details">🔍</button>
        <button class="copy-btn" title="Copy Log">📋</button>
        <div class="details">
          <pre></pre>
        </div>
      `;
        const copyBtn = logItem.querySelector(".copy-btn");
        const detailsBtn = logItem.querySelector(".details-btn");
        const detailsDiv = logItem.querySelector(".details");
  
        copyBtn.addEventListener("click", (e) =>
        {
          e.stopPropagation();
          let logText = `${logEntry.type}: ${logEntry.message}\nStatus: ${logEntry.status}\nDuration: ${logEntry.duration}\nTime: ${new Date(logEntry.timestamp).toLocaleTimeString()}`;
          if (logEntry.details) {
            logText += `\n\nDetails:\n${JSON.stringify(logEntry.details, null, 2)}`;
          }
          navigator.clipboard.writeText(logText).then(() =>
          {
            toastit("Log copied to clipboard!", "success");
          }).catch(() =>
          {
            toastit("Failed to copy log.", "error");
          });
        });
        detailsBtn.addEventListener("click", (e) =>
        {
          e.stopPropagation();
          detailsDiv.classList.toggle("visible");
          detailsBtn.textContent = detailsDiv.classList.contains("visible") ? "🔽" : "🔍";
          if (detailsDiv.classList.contains("visible") && logEntry.details) {
            detailsDiv.querySelector("pre").textContent = JSON.stringify(logEntry.details, null, 2);
          }
        });
        return logItem;
      }
  
      // Render a single log entry (used when adding a new log)
      function renderLog(logEntry) {
        if (!passesFilter(logEntry)) return;
        const logEl = createLogElement(logEntry);
        // Prepend to the log content (newest on top)
        logContent.prepend(logEl);
      }
  
      // Add a log entry to the logs array and update the UI.
      function addLog(logEntry) {
        logs.push(logEntry);
        persistLogs();
        // Render the new log only if it passes the current filters.
        if (passesFilter(logEntry)) {
          renderLog(logEntry);
        }
      }
  
      /* ─── PERSISTENCE: SAVE & LOAD LOGS ───────────────────────────────── */
      function persistLogs() {
        try
        {
          isInternal = true;
          chrome.runtime.sendMessage({ type: "saveLogs", logs: logs });
        } catch (error) {
          toastit("Failed to save logs.", "error");
        } finally
        {
          isInternal = false;
        }
      }
  
      function loadPersistedLogs() {
        try
        {
          let persisted = chrome.runtime.sendMessage({ type: "saveLogs" }) === "success";
          if (persisted) {
            logs = JSON.parse(persisted);
            logs.forEach(log => renderLog(log));
          }
        } catch (error) {
          toastit("Failed to load persisted logs.", "error");
        }
      }
  
      /* ─── INTERCEPTORS ──────────────────────────────────────────────────── */
      function interceptFetch() {
        const originalFetch = window.fetch;
        window.fetch = async function (...args) {
          if (isInternal) return originalFetch.apply(this, args);
          const url = args[ 0 ];
          const method = (args[ 1 ]?.method || "GET");
          const startTime = performance.now();
          let requestHeaders = {};
          if (args[ 1 ]?.headers) {
            if (args[ 1 ].headers instanceof Headers) {
              args[ 1 ].headers.forEach((value, key) =>
              {
                requestHeaders[ key ] = value;
              });
            } else
            {
              Object.assign(requestHeaders, args[ 1 ].headers);
            }
          }
          const requestBody = args[ 1 ]?.body || null;
          try
          {
            const response = await originalFetch.apply(this, args);
            const duration = Math.round(performance.now() - startTime);
            const clonedResponse = response.clone();
            let responseBody;
            try
            {
              responseBody = await clonedResponse.text();
            } catch (e) {
              responseBody = "Unable to read response body.";
            }
            let responseHeaders = {};
            clonedResponse.headers.forEach((value, key) =>
            {
              responseHeaders[ key ] = value;
            });
            const logEntry = {
              type: "Fetch",
              message: `${method} ${url}`,
              status: response.status,
              duration: `${duration}ms`,
              timestamp: new Date().toISOString(),
              details: {
                request: { headers: requestHeaders, body: requestBody },
                response: { headers: responseHeaders, body: responseBody }
              }
            };
            if (!isPaused) {
              toastit(`${logEntry.type}: ${logEntry.message} (${logEntry.status})`, "network");
              addLog(logEntry);
            }
            return response;
          } catch (error) {
            const logEntry = {
              type: "Error",
              message: `Fetch Error: ${error.message}`,
              status: "Failed",
              duration: "N/A",
              timestamp: new Date().toISOString(),
              details: {
                request: { headers: requestHeaders, body: requestBody },
                response: { headers: {}, body: null }
              }
            };
            if (!isPaused) {
              toastit(logEntry.message, "error");
              addLog(logEntry);
            }
            throw error;
          }
        };
      }
  
      function interceptXHR() {
        const originalXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = class extends originalXHR
        {
          constructor (...args) {
            super(...args);
            this.addEventListener("load", () =>
            {
              if (isInternal) return;
              const duration = Math.round(performance.now() - this._startTime);
              const responseHeaders = parseXHRHeaders(this.getAllResponseHeaders());
              const responseBody = this.responseText;
              const logEntry = {
                type: "XHR",
                message: `${this._method} ${this._url}`,
                status: this.status,
                duration: `${duration}ms`,
                timestamp: new Date().toISOString(),
                details: {
                  request: { headers: this._requestHeaders || {}, body: this._requestBody || null },
                  response: { headers: responseHeaders, body: responseBody }
                }
              };
              if (!isPaused) {
                const category = this.status >= 200 && this.status < 300 ? "success" : "error";
                toastit(`${logEntry.type}: ${logEntry.message} (${logEntry.status})`, category);
                addLog(logEntry);
              }
            });
            this.addEventListener("error", () =>
            {
              if (isInternal) return;
              const logEntry = {
                type: "Error",
                message: `XHR Error: ${this._url}`,
                status: "Failed",
                duration: "N/A",
                timestamp: new Date().toISOString(),
                details: {
                  request: { headers: this._requestHeaders || {}, body: this._requestBody || null },
                  response: { headers: {}, body: null }
                }
              };
              if (!isPaused) {
                toastit(logEntry.message, "error");
                addLog(logEntry);
              }
            });
          }
          open(method, url, ...args) {
            this._startTime = performance.now();
            this._method = method;
            this._url = url;
            super.open(method, url, ...args);
          }
          setRequestHeader(header, value) {
            if (!this._requestHeaders) this._requestHeaders = {};
            this._requestHeaders[ header ] = value;
            super.setRequestHeader(header, value);
          }
          send(body) {
            this._requestBody = body;
            super.send(body);
          }
        };
  
        // Helper: convert header string into an object.
        function parseXHRHeaders(headersString) {
          const headers = {};
          const headerPairs = headersString.trim().split(/[\r\n]+/);
          headerPairs.forEach(line =>
          {
            const parts = line.split(': ');
            const header = parts.shift();
            const value = parts.join(': ');
            headers[ header ] = value;
          });
          return headers;
        }
      }
  
      function interceptConsole() {
        const originalConsole = { ...console };
  
        const consoleMethods = [ 'log', 'info', 'warn', 'error', 'debug' ];
        const typeMap = {
          log: { type: 'Log', category: 'Info' },
          info: { type: 'Info', category: 'Info' },
          warn: { type: 'Warning', category: 'Warning' },
          error: { type: 'Error', category: 'Error' },
          debug: { type: 'Debug', category: 'Info' }
        };
  
        const createLogEntry = (method, args) =>
        {
          const message = args
            .map(arg => (typeof arg === "object" ? JSON.stringify(arg) : String(arg)))
            .join(" ");
          return {
            type: typeMap[ method ].type,
            message,
            status: "Intercepted",
            duration: "Undetermined",
            timestamp: new Date().toISOString(),
            details: { console: { method, arguments: args } }
          };
        };
  
        consoleMethods.forEach(method =>
        {
          console[ method ] = function (...args) {
            originalConsole[ method ].apply(console, args);
            if (!isPaused) {
              const logEntry = createLogEntry(method, args);
              toastit(`${logEntry.type}: ${logEntry.message}`, typeMap[ method ].category);
              addLog(logEntry);
            }
          };
        });
      }
  
      /* ─── INITIALIZATION ──────────────────────────────────────────────── */
      function init() {
        try
        {
          interceptFetch();
          interceptXHR();
          interceptConsole();
          createLogPanel();
          loadPersistedLogs();
          console.log("Advanced enhanced logging system initialized successfully.");
        } catch (error) {
          console.error("Failed to initialize logging system:", error);
          toastit("Failed to initialize logging system.", "error");
        }
      }
  
      // Run immediately
      init();
  
      // Optionally expose parts of the API:
      window.AdvancedLogger = { addLog };
      return Object.assign(window, { AdvancedLogger });
    })();
  class LogPanel extends HTMLElement
  {
    constructor () {
      super();
      this.attachShadow({ mode: "open" });
      this.logger = null;
      this.panel = null;
    }
  
    connectedCallback() {
      // Initialize the advanced logger and get reference to window.AdvancedLogger
      this.logger = initAdvancedLogger();
  
      // Get reference to the created log panel
      this.panel = document.querySelector('#logPanel');
  
      // Move the panel into shadow DOM
      if (this.panel) {
        this.shadowRoot.appendChild(this.panel);
      }
  
      // Expose control methods to match the logger's API
      window.LogPanel = {
        addLog: this.logger.addLog,
        clearLogs: () =>
        {
          const clearBtn = this.panel.querySelector('#clearLogs');
          clearBtn?.click();
        },
        togglePause: () =>
        {
          const pauseBtn = this.panel.querySelector('#pauseLogs');
          pauseBtn?.click();
        },
        exportLogs: () =>
        {
          const exportBtn = this.panel.querySelector('#exportLogs');
          exportBtn?.click();
        },
        toggleTheme: () =>
        {
          const themeBtn = this.panel.querySelector('#toggleTheme');
          themeBtn?.click();
        }
      };
    }
  
    disconnectedCallback() {

      // Cleanup when element is removed
      this.panel?.remove();
    }
  }
  
  customElements.define('log-panel', LogPanel);
  }}
