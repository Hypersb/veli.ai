// Extract visible Gmail message text and render a local risk badge overlay.

(function () {
  const BADGE_ID = "veil-v3-risk-badge";
  let lastFingerprint = "";

  function getOpenMessageContainer() {
    return document.querySelector("div.a3s.aiL");
  }

  function getVisibleEmailText() {
    const container = getOpenMessageContainer();
    if (!container) return "";

    const text = (container.innerText || "").trim();
    if (text.length < 20) return "";

    return text;
  }

  function labelToColor(label) {
    if (label === "Safe") return "#1f9d55";
    if (label === "Suspicious") return "#f3b63f";
    return "#d64545";
  }

  function upsertBadge(result) {
    let badge = document.getElementById(BADGE_ID);
    if (!badge) {
      badge = document.createElement("div");
      badge.id = BADGE_ID;
      badge.style.position = "fixed";
      badge.style.top = "12px";
      badge.style.right = "12px";
      badge.style.zIndex = "2147483647";
      badge.style.padding = "10px 12px";
      badge.style.borderRadius = "10px";
      badge.style.fontFamily = "Segoe UI, sans-serif";
      badge.style.fontSize = "12px";
      badge.style.fontWeight = "600";
      badge.style.color = "#ffffff";
      badge.style.boxShadow = "0 10px 24px rgba(0,0,0,0.25)";
      document.body.appendChild(badge);
    }

    badge.style.background = labelToColor(result.label);
    badge.textContent = `Veil: ${result.label} (${result.confidence}%) | Action: ${result.action}`;
  }

  async function scanCurrentEmail() {
    const text = getVisibleEmailText();
    if (!text) return;

    const fingerprint = `${text.slice(0, 120)}::${text.length}`;
    if (fingerprint === lastFingerprint) return;
    lastFingerprint = fingerprint;

    try {
      const result = await window.VeilInference.run(text);
      upsertBadge(result);

      chrome.runtime.sendMessage({
        type: "VEIL_SCAN_RESULT",
        payload: {
          label: result.label,
          confidence: result.confidence,
          action: result.action,
          explanation: result.explanation,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Veil extension scan failed:", error);
    }
  }

  const observer = new MutationObserver(() => {
    scanCurrentEmail();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Initial scan after page hydration.
  setTimeout(scanCurrentEmail, 1200);
})();
