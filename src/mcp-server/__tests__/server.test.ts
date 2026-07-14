// src/mcp-server/__tests__/server.test.ts
import { describe, it, expect } from 'vitest';

describe('MCP Server Implementation', () => {
  it('should export a Server instance', async () => {
    const { server } = await import('../server');
    expect(server).toBeDefined();
  });

  it('should have server info', async () => {
    const { server } = await import('../server');
    const info = (server as unknown as { _serverInfo: { name: string } })._serverInfo;
    expect(info).toBeDefined();
    expect(info.name).toBe('cv-sarkhan-dev-mcp');
  });
});
