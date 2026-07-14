# Technical Audit Report: cv.sarkhan.dev
**Date:** 2026-07-10
**Status:** Critical Audit Completed

## 1. Secrets & Code Quality
### FINDING: Hardcoded Fallback Secrets (P0)
- **Issue:** In `src/lib/auth/jwt.ts`, the `SESSION_SECRET` has a hardcoded fallback: `'fallback-secret-do-not-use-in-prod'`.
- **Risk:** If the environment variable is missing, the application uses a known secret, allowing anyone to forge session tokens.
- **Recommendation:** Remove fallback. Throw a hard error if `SESSION_SECRET` is missing during startup.

### FINDING: Documentation-Code Mismatch on Secrets (P2)
- **Issue:** `documentation/roadmap.md` and other docs list expected `.env` variables (e.g., `STRIPE_SECRET_KEY`, `TELEGRAM_BOT_TOKEN`), but some are used with the `!` non-null assertion operator in code (e.g., `process.env.TELEGRAM_BOT_TOKEN!`) without validation at the entry point.
- **Risk:** Runtime crashes (500 errors) when variables are missing, as seen in `documentation/ux-fix-plan.md`.

---

## 2. Security Audit
### Auth Implementation (P1)
- **Finding:** The JWT implementation in `src/lib/auth/jwt.ts` is a custom manual implementation using `crypto.createHmac`.
- **Risk:** While functionally correct for HMAC-SHA256, it lacks standard JWT features (like key rotation) and uses a manual Base64URL implementation.
- **Recommendation:** Migrate to `jose` or `jsonwebtoken` for industry-standard security.

### Billing Implementation (P1)
- **Finding:** In `src/app/api/billing/webhook/route.ts`, the `pre_checkout_query` is answered based on a hardcoded amount (`300 XTR`).
- **Risk:** Rigid pricing logic in the webhook. If prices change in the Telegram BotFather UI, the webhook will reject payments.
- **Recommendation:** Move plan pricing to a database table or a centralized config file.

### MCP Server Implementation (P1)
- **Finding:** The documentation (`documentation/05-mcp-server/02-mcp-security-auth.md`) describes a robust bcrypt-hashed token system with rate limiting. However, there is no evidence of a matching `mcp-server` implementation in the `src` directory (only tests are present in `src/mcp-server/__tests__`).
- **Risk:** The "TO BE" security design for MCP is not yet fully mirrored in the active codebase (potential gap between spec and implementation).

---

## 3. Architecture Verification
### TO BE Compliance (P1)
- **Overall:** The project generally follows the "TO BE" architecture (`documentation/01-architecture/01-to-be-overview.md`).
- **AI Router:** Implemented in `src/lib/ai/router.ts`. It supports fallback chains and caching, matching the spec.
- **Split-Screen:** The UI logic is present (per `CLAUDE.md`), but the architecture for the "Privacy-First Storage" (LocalStorage $\to$ Postgres migration) needs explicit verification in the Auth/User services.
- **Model Diversity:** The spec requires a variety of models (Gemini, DeepSeek, Kimi). The current `AIRouter` implementation primarily uses `getGemini()` as a wrapper, which might be limiting actual model diversity if it's just a proxy for one provider.

---

## 4. Test Coverage
### Coverage Analysis (P2)
The project has a high volume of test files, covering:
- **Auth:** `src/app/api/auth/__tests__/telegram.test.ts`
- **Billing:** `src/app/api/billing/__tests__/telegram-stars.test.ts`
- **AI Router:** `src/lib/ai/__tests__/router.test.ts`
- **MCP:** `src/mcp-server/__tests__/server.test.ts`
- **Telegram:** `src/lib/telegram/__tests__/validate.test.ts`

**Finding:** While the tests exist, there are no integrated "smoke tests" that verify the full flow from Telegram $\to$ Auth $\to$ Billing $\to$ MCP.

---

## Summary of Priorities
| Priority | Component | Issue | Action |
| :--- | :--- | :--- | :--- |
| **P0** | Auth | Hardcoded JWT Secret | Remove fallback immediately |
| **P1** | Billing | Hardcoded Pricing | Move prices to DB/Config |
| **P1** | MCP | Spec vs Implementation | Verify `mcp-server` core logic matches spec |
| **P1** | AI Router | Model Proxying | Ensure `getGemini` actually routes to diverse models |
| **P2** | Tests | Integration Gaps | Add end-to-end flow tests |
