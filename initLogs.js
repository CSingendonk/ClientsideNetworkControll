// initLogs.js
// A self-contained advanced logging system that injects a UI and intercepts network and console calls.
/**
 * @author: Chris Singendonk
 * @license ALL RIGHTS RESERVED
 * @copyright Chris Singendonk 2024 - 2025
 */
(function initAdvancedLogger() {

  /* ─── INTERNAL STATE ────────────────────────────────────────────── */
  let isInternal = false;
  let isPaused = false;
  let logs = [];

  /* ─── TOAST NOTIFICATIONS (via Shadow DOM) ───────────────────────── */
  function createToastContainer() {
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
  const toastContainer = createToastContainer();

  function showToast(message, category = "network", timeoutMs = 5000) {
    if (!toastContainer) return;
    const toast = document.createElement("div");
    toast.className = `toast ${category}`;
    const icon = document.createElement("span");
    icon.className = "icon";
    switch (category) {
      case "network": icon.textContent = "🌐"; break;
      case "error":   icon.textContent = "❌"; break;
      case "blocked": icon.textContent = "⛔"; break;
      case "success": icon.textContent = "✅"; break;
      case "info":    icon.textContent = "ℹ️"; break;
      default:        icon.textContent = "💬";
    }
    const messageSpan = document.createElement("span");
    messageSpan.textContent = message;
    toast.appendChild(icon);
    toast.appendChild(messageSpan);
    toastContainer.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
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
    }
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

  function createLogPanel() {
    injectStyles();
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
    
    document.body.appendChild(panel);
    makeDraggable(panel, panel.querySelector('.log-header'));
    addLogPanelEventListeners(panel);

    // Cache the search and filter elements and log content container.
    searchInput = panel.querySelector("#logSearch");
    filterCheckboxes = Array.from(panel.querySelectorAll(".filter-checkboxes input[type='checkbox']"));
    logContent = panel.querySelector(".log-content");

    // Add event listeners so that changes re-render the log list.
    searchInput.addEventListener("input", applyFilters);
    filterCheckboxes.forEach(checkbox => {
      checkbox.addEventListener("change", applyFilters);
    });

    return panel;
  }

  // Allow the panel to be dragged by its header.
  function makeDraggable(element, handle) {
    let offsetX, offsetY, isDragging = false;
    handle.addEventListener("mousedown", (e) => {
      isDragging = true;
      const rect = element.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      document.body.style.userSelect = 'none';
    });
    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      element.style.left = `${e.clientX - offsetX}px`;
      element.style.top = `${e.clientY - offsetY}px`;
      element.style.position = "fixed";
    });
    document.addEventListener("mouseup", () => {
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

    minimizeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      panel.classList.toggle("hidden");
      minimizeBtn.textContent = panel.classList.contains("hidden") ? "🔼" : "➖";
    });
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      panel.remove();
    });
    clearBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      logs = [];
      logContent.innerHTML = "";
      persistLogs();
      showToast("All logs cleared.", "success");
    });
    exportBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (logs.length === 0) {
        showToast("No logs to export.", "error");
        return;
      }
      const format = prompt("Enter export format (json/csv):", "json");
      if (!format) return;
      const chosenFormat = format.trim().toLowerCase();
      if (chosenFormat === "json") {
        try {
          const dataStr = "data:text/json;charset=utf-8," +
            encodeURIComponent(JSON.stringify(logs, null, 2));
          const downloadAnchor = document.createElement("a");
          downloadAnchor.setAttribute("href", dataStr);
          downloadAnchor.setAttribute("download", "logs_" + new Date().toISOString() + ".json");
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          downloadAnchor.remove();
          showToast("Logs exported as JSON.", "success");
        } catch (error) {
          showToast("Failed to export logs as JSON.", "error");
        }
      } else if (chosenFormat === "csv") {
        try {
          const csvContent = convertLogsToCSV(logs);
          const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
          const downloadAnchor = document.createElement("a");
          downloadAnchor.setAttribute("href", dataStr);
          downloadAnchor.setAttribute("download", "logs_" + new Date().toISOString() + ".csv");
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          downloadAnchor.remove();
          showToast("Logs exported as CSV.", "success");
        } catch (error) {
          showToast("Failed to export logs as CSV.", "error");
        }
      } else {
        showToast("Unsupported export format.", "error");
      }
    });
    pauseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      isPaused = !isPaused;
      pauseBtn.textContent = isPaused ? "▶️" : "⏸️";
      showToast(isPaused ? "Logging Paused" : "Logging Resumed",
                isPaused ? "blocked" : "success");
    });
    toggleThemeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
      const newTheme = currentTheme === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", newTheme);
      showToast(`Switched to ${newTheme} mode.`, "success");
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
      if (passesFilter(logs[i])) {
        // Use the helper to create the log element, then append.
        const logEl = createLogElement(logs[i]);
        logContent.appendChild(logEl);
      }
    }
  }

  /* ─── UTILITY: CONVERT LOGS TO CSV ──────────────────────────────────── */
  function convertLogsToCSV(logs) {
    const header = ["Type", "Message", "Status", "Duration", "Timestamp",
      "Request Headers", "Request Body", "Response Headers", "Response Body"].join(",");
    const rows = logs.map(log => {
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
    return [header, ...rows].join("\n");
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

    copyBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      let logText = `${logEntry.type}: ${logEntry.message}\nStatus: ${logEntry.status}\nDuration: ${logEntry.duration}\nTime: ${new Date(logEntry.timestamp).toLocaleTimeString()}`;
      if (logEntry.details) {
        logText += `\n\nDetails:\n${JSON.stringify(logEntry.details, null, 2)}`;
      }
      navigator.clipboard.writeText(logText).then(() => {
        showToast("Log copied to clipboard!", "success");
      }).catch(() => {
        showToast("Failed to copy log.", "error");
      });
    });
    detailsBtn.addEventListener("click", (e) => {
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
    try {
      isInternal = true;
      chrome.runtime.sendMessage({ type: "saveLogs", logs: logs });
    } catch (error) {
      showToast("Failed to save logs.", "error");
    } finally {
      isInternal = false;
    }
  }

  function loadPersistedLogs() {
    try {
      let persisted = chrome.runtime.sendMessage({ type: "saveLogs" }) === "success";
      if (persisted) {
        logs = JSON.parse(persisted);
        logs.forEach(log => renderLog(log));
      }
    } catch (error) {
      showToast("Failed to load persisted logs.", "error");
    }
  }

  /* ─── INTERCEPTORS ──────────────────────────────────────────────────── */
  function interceptFetch() {
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      if (!confirm(`Allow ${args[0]} to access this browser?`)) {
        return false;
      };
      if (isInternal) return originalFetch.apply(this, args);
      const url = args[0];
      const method = (args[1]?.method || "GET");
      const startTime = performance.now();
      let requestHeaders = {};
      if (args[1]?.headers) {
        if (args[1].headers instanceof Headers) {
          args[1].headers.forEach((value, key) => {
            requestHeaders[key] = value;
          });
        } else {
          Object.assign(requestHeaders, args[1].headers);
        }
      }
      const requestBody = args[1]?.body || null;
      try {
        const response = await originalFetch.apply(this, args);
        const duration = Math.round(performance.now() - startTime);
        const clonedResponse = response.clone();
        let responseBody;
        try {
          responseBody = await clonedResponse.text();
        } catch (e) {
          responseBody = "Unable to read response body.";
        }
        let responseHeaders = {};
        clonedResponse.headers.forEach((value, key) => {
          responseHeaders[key] = value;
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
          showToast(`${logEntry.type}: ${logEntry.message} (${logEntry.status})`, "network");
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
          showToast(logEntry.message, "error");
          addLog(logEntry);
        }
        throw error;
      }
    };
  }

  function interceptXHR() {
    const originalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = class extends originalXHR {
      constructor(...args) {
        super(...args);
      if (!confirm(`Allow ${args[0]} to access this browser?`)) {
        return false;
      };
        this.addEventListener("load", () => {
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
            showToast(`${logEntry.type}: ${logEntry.message} (${logEntry.status})`, category);
            addLog(logEntry);
          }
        });
        this.addEventListener("error", () => {
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
            showToast(logEntry.message, "error");
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
        this._requestHeaders[header] = value;
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
      headerPairs.forEach(line => {
        const parts = line.split(': ');
        const header = parts.shift();
        const value = parts.join(': ');
        headers[header] = value;
      });
      return headers;
    }
  }

  function interceptConsole() {
    const originalConsole = { ...console };

    const consoleMethods = ['log', 'info', 'warn', 'error', 'debug'];
    const typeMap = {
      log: { type: 'Log', category: 'Info' },
      info: { type: 'Info', category: 'Info' },
      warn: { type: 'Warning', category: 'Warning' },
      error: { type: 'Error', category: 'Error' },
      debug: { type: 'Debug', category: 'Info' }
    };

    const createLogEntry = (method, args) => {
      const message = args
        .map(arg => (typeof arg === "object" ? JSON.stringify(arg) : String(arg)))
        .join(" ");
      return {
        type: typeMap[method].type,
        message,
        status: "Intercepted",
        duration: "Undetermined",
        timestamp: new Date().toISOString(),
        details: { console: { method, arguments: args } }
      };
    };

    consoleMethods.forEach(method => {
      console[method] = function(...args) {
        originalConsole[method].apply(console, args);
        if (!isPaused) {
          const logEntry = createLogEntry(method, args);
          showToast(`${logEntry.type}: ${logEntry.message}`, typeMap[method].category);
          addLog(logEntry);
        }
      };
    });
  }  

  /* ─── INITIALIZATION ──────────────────────────────────────────────── */
  function init() {
    try {
      interceptFetch();
      interceptXHR();
      interceptConsole();
      createLogPanel();
      loadPersistedLogs();
      console.log("Advanced enhanced logging system initialized successfully.");
    } catch (error) {
      console.error("Failed to initialize logging system:", error);
      showToast("Failed to initialize logging system.", "error");
    }
  }

  // Run immediately
  init();

  // Optionally expose parts of the API:
  window.AdvancedLogger = { addLog };
  return Object.assign(window, { AdvancedLogger });
})();
class LogPanel extends HTMLElement {
  constructor() {
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
    
    // Move the panel into our shadow DOM
    if (this.panel) {
      this.shadowRoot.appendChild(this.panel);
    }

    // Expose control methods to match the logger's API
    window.LogPanel = {
      addLog: this.logger.addLog,
      clearLogs: () => {
        const clearBtn = this.panel.querySelector('#clearLogs');
        clearBtn?.click();
      },
      togglePause: () => {
        const pauseBtn = this.panel.querySelector('#pauseLogs');
        pauseBtn?.click();
      },
      exportLogs: () => {
        const exportBtn = this.panel.querySelector('#exportLogs');
        exportBtn?.click();
      },
      toggleTheme: () => {
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

window.customElements.define('log-panel', LogPanel);
