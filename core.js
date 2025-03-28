// ALL RIGHTS RESERVED
// COPYRIGHT 2024 2025 CHRIS SINGENDONK   

const originalFetch = window.fetch;
(function () {
setInterval(() => {
  if (originalFetch != window.fetch) {
    
 let blocking = true;

  // Function to pause page execution and wait for user action
  function pauseExecution() {
    const shit = confirm(`block?`);
        if (shit !== false) {
           return true
         }
    return new Promise(resolve => {
      const unblock = () => {
        blocking = false;
        resolve();
        document.removeEventListener('userAction', unblock);
      };
      document.addEventListener('userAction', unblock);
      blocking = true;
    });
  }

  // Override fetch to intercept network requests
  const originalFetch = window.fetch;
  window.fetch = function(input, init) {
    const fuck = confirm(`Continue ${input} ${init}?`)
    if (fuck !== true) {
      return true; 
    }
    return new Promise(async (resolve, reject) => {
      // Pause execution if blocking is true
      if (blocking) {
        await pauseExecution();  // Wait until the user interacts
      }

      const url = typeof input === 'string' ? input : input.url;
      const allow = confirm(`Allow network request to: ${url}?`);

      if (allow) {
        originalFetch(input, init).then(resolve).catch(reject);
      } else {
        reject(new Error('Request blocked by user.'));
      }
    });
  };

  // Override XMLHttpRequest to intercept network requests
  const originalXHR = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) {
    const cunt = confirm(`Open ${url} ${method} request?`);
    if (cunt !== true) {
      return true;
    }
    this._url = url;  // Store URL for later use
    originalXHR.apply(this, arguments);
  };

  const originalSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function() {
    return new Promise(async (resolve, reject) => {
      // Pause execution if blocking is true
      if (blocking) {
        await pauseExecution();  // Wait until the user interacts
      }

      const allow = confirm(`Allow XMLHttpRequest to: ${this._url}?`);

      if (allow) {
        originalSend.apply(this, arguments);
        resolve();
      } else {
        reject(new Error('Request blocked by user.'));
      }
    });
  };

  // Intercept WebSocket requests
  const originalWebSocket = window.WebSocket;
  window.WebSocket = function(url, protocols) {
    const socket = new originalWebSocket(url, protocols);

    // Show confirmation dialog before establishing connection
    const allow = confirm(`Allow WebSocket connection to: ${url}?`);

    if (allow) {
      return socket;
    } else {
      socket.close(); // Close the connection if denied
      throw new Error("WebSocket connection blocked.");
    }
  };
}},1)})();

// help me
