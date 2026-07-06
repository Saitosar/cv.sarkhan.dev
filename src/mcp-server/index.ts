// src/mcp-server/index.ts
//
// Standalone MCP server entry point using stdio transport.

import { createInterface } from 'node:readline';
import { MCPServer } from './server';
import { MCP_ERROR_CODES, type JSONRPCRequest, type JSONRPCResponse } from './types';

const server = new MCPServer();

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

function writeResponse(response: JSONRPCResponse): void {
  const line = JSON.stringify(response);
  process.stdout.write(line + '\n');
}

export function parseError(id: JSONRPCRequest['id'], message: string): JSONRPCResponse {
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code: MCP_ERROR_CODES.PARSE_ERROR,
      message,
    },
  };
}

export function invalidRequestError(id: JSONRPCRequest['id'], message: string): JSONRPCResponse {
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code: MCP_ERROR_CODES.INVALID_REQUEST,
      message,
    },
  };
}

rl.on('line', (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    writeResponse(parseError(null, `JSON parse error: ${errMsg}`));
    return;
  }

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    writeResponse(invalidRequestError(null, 'Invalid JSON-RPC request. Expected object.'));
    return;
  }

  const request = parsed as Partial<JSONRPCRequest>;

  if (request.jsonrpc !== '2.0') {
    writeResponse(invalidRequestError(request.id ?? null, 'Missing or invalid jsonrpc version. Expected "2.0".'));
    return;
  }

  if (typeof request.method !== 'string' || !request.method.trim()) {
    writeResponse(invalidRequestError(request.id ?? null, 'Missing or invalid method.'));
    return;
  }

  const validRequest: JSONRPCRequest = {
    jsonrpc: '2.0',
    id: request.id ?? null,
    method: request.method,
    params: typeof request.params === 'object' && request.params !== null && !Array.isArray(request.params)
      ? (request.params as Record<string, unknown>)
      : undefined,
  };

  const response = server.handleRequest(validRequest);
  writeResponse(response);
});

process.on('SIGTERM', () => {
  rl.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  rl.close();
  process.exit(0);
});
