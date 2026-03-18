# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] — 2026-03-18

### Added

- **Zero-backend architecture** — ML inference runs entirely inside Next.js serverless functions on Vercel. No Railway, no Render, no external server ever again.
- `scripts/export_model.py` — train and export model weights to `frontend/public/model.json`
- `scripts/create_placeholder_model.py` — generate a working model without the Kaggle dataset
- `frontend/lib/classifier.ts` — complete TF-IDF + Logistic Regression pipeline in TypeScript
- `POST /api/predict` — Next.js API route, rate-limited at 15 req/min
- `GET /api/health` — health check endpoint
- `GET /api/version` — model metrics endpoint
- Text heatmap — highlights spam/safe words directly in the email text
- Scan history panel — last 10 scans, persisted in `localStorage:veil_history`
- Dark mode — system preference detection + manual toggle, persisted in `localStorage:veil_theme`
- URL risk analysis — classifies extracted URLs as Dangerous / Suspicious / Unknown
- Heuristic flag explanations — expandable badges showing rule name and description
- Share Result — copies a shareable URL encoding the scan outcome
- `/result` page — read-only shared result view from URL params
- `/api-docs` page — full API documentation with curl/Python/JS examples
- Keyboard shortcuts — `Ctrl+Enter` to scan, `Ctrl+K` to focus, `Escape` to clear
- Feedback collection — `localStorage:veil_feedback`, up to 50 entries
- Live scan counter on homepage — seeded at 12,847, increments per scan
- FAQ section on homepage
- API link in both navbars and footers
- `LICENSE` (MIT, 2026)
- `.github/workflows/ci.yml` — TypeScript + ESLint + build CI

### Changed

- **Eliminated FastAPI backend** — scanner now calls `/api/predict` (relative URL)
- `frontend/lib/api.ts` — complete rewrite; no more `localhost:8000`, no `NEXT_PUBLIC_API_URL`
- `frontend/lib/classifier.ts` — new file replacing the Python backend's `classifier.py`
- Removed "Educational portfolio project" from all footers
- Removed FastAPI and Pydantic from all tech-stack displays
- Updated footer copyright to "© 2026 Veil — AI-powered email security"
- Updated `package.json` version to `2.0.0`, added `typecheck` script
- Enabled TypeScript strict mode in `tsconfig.json`
- `README.md` — complete rewrite with V2 architecture documentation

### Fixed

- **Scanner was completely broken** (no backend) — now fixed via serverless ML inference
- Quick demo examples now populate the textarea correctly with the specified text
- Character counter now updates in real time with colour warnings at 8,000 and 9,500 chars
- Scan history entries now show time-ago format ("just now", "5 minutes ago", etc.)
- Clear history button no longer requires expanding the history panel first

## [1.0.0] — 2025-12-18

- Initial project setup with FastAPI backend + Next.js 15 frontend
- Basic spam classification using TF-IDF + Logistic Regression
- Scanner page at `/scanner`
- Landing page at `/`
