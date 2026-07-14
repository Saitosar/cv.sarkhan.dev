// src/mcp-server/__tests__/index.test.ts
import { describe, it, expect } from 'vitest';

describe('MCP Server Index', () => {
  it('should import without errors', async () => {
    await expect(import('../index')).resolves.toBeDefined();
  });
});
