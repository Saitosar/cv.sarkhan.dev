| Finding | Priority | Test File | Test Case | Current Status | Expected Failure |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Hardcoded JWT Secret | P0 | `tests/unit/security.test.ts` | `should not have hardcoded fallback secrets` | ❌ FAIL | Yes |
| 404 on /login | P0 | `tests/e2e/auth.spec.ts` | `should return 404 for /login` | ✅ PASS (Received 200) | **FAIL** (Must be 404) |
| 404 on /register | P0 | `tests/e2e/auth.spec.ts` | `should return 404 for /register` | ✅ PASS (Received 200) | **FAIL** (Must be 404) |
| Chat HTTP 500 | P0 | `tests/e2e/ai_chat.spec.ts` | `should return 500 on chat request` | ✅ PASS (Received 404) | **FAIL** (Must be 500) |
| Missing Material Symbols | P0 | `tests/e2e/ui_ux.spec.ts` | `should not render Material Symbols as plain text` | ✅ PASS | **FAIL** (Must detect text) |
| Invisible Drag Handle | P1 | `tests/e2e/ui_ux.spec.ts` | `SplitScreen handles visibility/size` | ❌ FAIL (Not found) | Yes |
