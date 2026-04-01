// Maintain latest scan result in extension storage without external network calls.

const STORAGE_KEY = "veil_last_scan";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message !== "object") {
    sendResponse({ ok: false, error: "Invalid message payload." });
    return false;
  }

  if (message.type === "VEIL_SCAN_RESULT") {
    chrome.storage.local.set({ [STORAGE_KEY]: message.payload }, () => {
      if (chrome.runtime.lastError) {
        sendResponse({ ok: false, error: chrome.runtime.lastError.message });
        return;
      }
      sendResponse({ ok: true });
    });
    return true;
  }

  if (message.type === "VEIL_GET_LAST_SCAN") {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      if (chrome.runtime.lastError) {
        sendResponse({ ok: false, error: chrome.runtime.lastError.message });
        return;
      }
      sendResponse({ ok: true, data: result[STORAGE_KEY] || null });
    });
    return true;
  }

  sendResponse({ ok: false, error: "Unsupported message type." });
  return false;
});
