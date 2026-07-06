// src/mcp-server/types.ts
//
// MCP-specific types implementing a subset of the Model Context Protocol.
// This is a hand-rolled JSON-RPC 2.0 server with no external SDK dependencies.

// ── JSON-RPC 2.0 envelope ──

export type JSONRPCVersion = '2.0';

export interface JSONRPCRequest {
  jsonrpc: JSONRPCVersion;
  id: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

export interface JSONRPCNotification {
  jsonrpc: JSONRPCVersion;
  method: string;
  params?: Record<string, unknown>;
}

export interface JSONRPCResponse {
  jsonrpc: JSONRPCVersion;
  id: string | number | null;
  result?: unknown;
  error?: JSONRPCErrorObject;
}

export interface JSONRPCErrorObject {
  code: number;
  message: string;
  data?: unknown;
}

// ── MCP capability announcements ──

export interface ServerCapabilities {
  resources?: Record<string, never>;
  tools?: Record<string, never>;
}

export interface ServerInfo {
  name: string;
  version: string;
}

export interface InitializeResult {
  protocolVersion: string;
  capabilities: ServerCapabilities;
  serverInfo: ServerInfo;
}

// ── MCP resource definitions ──

export interface MCPResource {
  uri: string;
  name: string;
  mimeType?: string;
  description?: string;
}

export interface MCPResourceContent {
  uri: string;
  text: string;
  mimeType?: string;
}

export interface ResourcesListResult {
  resources: MCPResource[];
}

export interface ResourcesReadResult {
  contents: MCPResourceContent[];
}

// ── MCP tool definitions ──

export interface MCPToolParameter {
  type: string;
  description?: string;
  items?: unknown;
  properties?: Record<string, unknown>;
  required?: string[];
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, MCPToolParameter | unknown>;
    required?: string[];
  };
}

export interface MCPToolResult {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

export interface ToolsListResult {
  tools: MCPTool[];
}

export type MCPMethod =
  | 'initialize'
  | 'resources/list'
  | 'resources/read'
  | 'tools/list'
  | 'tools/call';

// ── MCP errors (JSON-RPC standard + MCP conventions) ──

export const MCP_ERROR_CODES = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  SERVER_NOT_INITIALIZED: -32002,
} as const;

export class MCPError extends Error {
  readonly code: number;
  readonly data?: unknown;

  constructor(code: number, message: string, data?: unknown) {
    super(message);
    this.name = 'MCPError';
    this.code = code;
    this.data = data;
  }
}
