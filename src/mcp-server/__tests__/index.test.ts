// src/mcp-server/__tests__/index.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MCP_ERROR_CODES } from '../types';
import type { JSONRPCRequest, JSONRPCResponse } from '../types';

// Mock node:readline with proper default export
vi.mock('node:readline', () => {
  const mockOn = vi.fn();
  const mockClose = vi.fn();
  return {
    createInterface: vi.fn(() => ({
      on: mockOn,
      close: mockClose,
    })),
    default: {
      createInterface: vi.fn(() => ({
        on: mockOn,
        close: mockClose,
      })),
    },
  };
});

// Capture stdout writes
const stdoutWrites: string[] = [];
const originalWrite = process.stdout.write;

describe('MCP Server Index (stdin parsing)', () => {
  beforeEach(() => {
    stdoutWrites.length = 0;
    process.stdout.write = vi.fn((chunk: string) => {
      stdoutWrites.push(chunk.toString());
      return true;
    });
  });

  afterEach(() => {
    process.stdout.write = originalWrite;
  });

  it('should parse valid JSON-RPC initialize request', async () => {
    const { MCPServer } = await import('../server');
    const server = new MCPServer();

    const request: JSONRPCRequest = {
      jsonrpc: '2.0' as const,
      id: 1,
      method: 'initialize',
    };

    const response = server.handleRequest(request);
    expect(response.jsonrpc).toBe('2.0');
    expect(response.id).toBe(1);
    expect(response.result).toBeDefined();
    expect((response.result as { serverInfo: { name: string } }).serverInfo.name).toBe('cv-mcp-server');
  });

  it('should reject invalid JSON with parse error', async () => {
    const { parseError } = await import('../index');
    const response = parseError(null, 'JSON parse error: Unexpected token');
    expect(response.jsonrpc).toBe('2.0');
    expect(response.id).toBeNull();
    expect(response.error).toBeDefined();
    expect(response.error!.code).toBe(MCP_ERROR_CODES.PARSE_ERROR);
    expect(response.error!.message).toContain('JSON parse error');
  });

  it('should reject non-object JSON with invalid request error', async () => {
    const { invalidRequestError } = await import('../index');
    const response = invalidRequestError(null, 'Invalid JSON-RPC request. Expected object.');
    expect(response.jsonrpc).toBe('2.0');
    expect(response.id).toBeNull();
    expect(response.error).toBeDefined();
    expect(response.error!.code).toBe(MCP_ERROR_CODES.INVALID_REQUEST);
    expect(response.error!.message).toContain('Invalid JSON-RPC request');
  });

  it('should reject request with wrong jsonrpc version', async () => {
    const { invalidRequestError } = await import('../index');
    const response = invalidRequestError(1, 'Missing or invalid jsonrpc version. Expected "2.0".');
    expect(response.jsonrpc).toBe('2.0');
    expect(response.id).toBe(1);
    expect(response.error!.code).toBe(MCP_ERROR_CODES.INVALID_REQUEST);
    expect(response.error!.message).toContain('jsonrpc version');
  });

  it('should reject request with missing method', async () => {
    const { invalidRequestError } = await import('../index');
    const response = invalidRequestError(1, 'Missing or invalid method.');
    expect(response.error!.code).toBe(MCP_ERROR_CODES.INVALID_REQUEST);
    expect(response.error!.message).toContain('method');
  });

  it('should handle empty lines gracefully', async () => {
    const { MCPServer } = await import('../server');
    const server = new MCPServer();
    const response = server.handleRequest({
      jsonrpc: '2.0' as const,
      id: 1,
      method: 'initialize',
    });
    expect(response.result).toBeDefined();
  });

  it('should handle SIGTERM gracefully', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    await vi.importActual('../index');
    expect(() => process.emit('SIGTERM')).not.toThrow();
    expect(exitSpy).toHaveBeenCalledWith(0);
    exitSpy.mockRestore();
  });

  it('should handle SIGINT gracefully', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    await vi.importActual('../index');
    expect(() => process.emit('SIGINT')).not.toThrow();
    expect(exitSpy).toHaveBeenCalledWith(0);
    exitSpy.mockRestore();
  });

  it('should write response as JSON line', async () => {
    const { MCPServer } = await import('../server');
    const server = new MCPServer();

    const request = { jsonrpc: '2.0' as const, id: 1, method: 'initialize' };
    const response = server.handleRequest(request);

    const jsonLine = JSON.stringify(response);
    expect(jsonLine).toContain('"jsonrpc":"2.0"');
    expect(jsonLine).toContain('"result"');

    const parsed = JSON.parse(jsonLine);
    expect(parsed.id).toBe(1);
  });
});
