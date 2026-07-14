import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Security: JWT Secrets', () => {
  it('should not have hardcoded fallback secrets in jwt.ts', () => {
    const jwtPath = path.resolve(__dirname, '../../src/lib/auth/jwt.ts');
    const content = fs.readFileSync(jwtPath, 'utf8');
    
    const fallbackSecret = 'fallback-secret-do-not-use-in-prod';
    expect(content).not.toContain(fallbackSecret);
  });
});
