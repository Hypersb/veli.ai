# Veil V3 Chrome Extension

The extension scans Gmail locally in the browser and never sends email content to an external service.

## Build

1. Generate the local model artifacts first:
   - `frontend/public/model.onnx`
   - `chrome-extension/model.onnx`
   - `chrome-extension/model.json`
2. Copy the extension folder to a stable location if desired.
3. Open Chrome and go to `chrome://extensions`.
4. Enable Developer mode.
5. Click `Load unpacked` and select the `chrome-extension` folder.

## Install Notes

- The extension is restricted to `https://mail.google.com/*`.
- It uses the packaged ONNX model and local browser inference logic.
- The runtime is loaded in the browser context when the extension starts; cache it once if you want the best offline experience after the first load.

## Files

- `manifest.json` wires Gmail content scripts and the popup.
- `content.js` extracts visible email text and renders the badge.
- `background.js` stores the latest scan result locally.
- `inference.js` performs the shared scan logic.
