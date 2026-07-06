// src/mcp-server/server.ts
//
// MCPServer class — hand-rolled JSON-RPC 2.0 MCP server.

import {
  serverCapabilities,
  serverInfo,
  PROTOCOL_VERSION,
  RESOURCES,
  TOOLS,
} from './config';
import { resumeResource, readResume } from './resources/resume';
import { atsResource, readATSScore } from './resources/ats';
import { chatResource, readChatHistory } from './resources/chat';
import { getResumeTool, callGetResume } from './tools/get-resume';
import { getATSScoreTool, callGetATSScore } from './tools/get-ats-score';
import { searchJobsTool, callSearchJobs } from './tools/search-jobs';
import { analyzeResumeSectionTool, callAnalyzeResumeSection } from './tools/analyze-resume';
import {
  MCP_ERROR_CODES,
  MCPError,
  type InitializeResult,
  type JSONRPCRequest,
  type JSONRPCResponse,
  type MCPToolResult,
  type ResourcesListResult,
  type ResourcesReadResult,
  type ToolsListResult,
} from './types';

export class MCPServer {
  private initialized = false;
  private readonly resources = new Map<string, ResourceHandler>();
  private readonly tools = new Map<string, ToolHandler>();

  constructor() {
    this.registerResource(RESOURCES.RESUME_CURRENT, resumeResource, readResume);
    this.registerResource(RESOURCES.ATS_SCORE, atsResource, readATSScore);
    this.registerResource(RESOURCES.CHAT_HISTORY, chatResource, readChatHistory);

    this.registerTool(TOOLS.GET_RESUME, getResumeTool, callGetResume);
    this.registerTool(TOOLS.GET_ATS_SCORE, getATSScoreTool, callGetATSScore);
    this.registerTool(TOOLS.SEARCH_JOBS, searchJobsTool, callSearchJobs);
    this.registerTool(TOOLS.ANALYZE_RESUME_SECTION, analyzeResumeSectionTool, callAnalyzeResumeSection);
  }

  initialize(): InitializeResult {
    this.initialized = true;
    return {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: serverCapabilities,
      serverInfo,
    };
  }

  handleRequest(request: JSONRPCRequest): JSONRPCResponse {
    try {
      if (!this.initialized && request.method !== 'initialize') {
        throw new MCPError(
          MCP_ERROR_CODES.SERVER_NOT_INITIALIZED,
          'Server not initialized. Call initialize first.'
        );
      }

      switch (request.method) {
        case 'initialize':
          return this.respond(request.id, this.initialize());

        case 'resources/list':
          return this.respond(request.id, this.listResources());

        case 'resources/read': {
          const uri = this.extractUri(request.params);
          return this.respond(request.id, this.readResource(uri));
        }

        case 'tools/list':
          return this.respond(request.id, this.listTools());

        case 'tools/call': {
          const { name, arguments: toolArgs } = this.extractToolCall(request.params);
          return this.respond(request.id, this.callTool(name, toolArgs));
        }

        default:
          throw new MCPError(MCP_ERROR_CODES.METHOD_NOT_FOUND, `Method not found: ${request.method}`);
      }
    } catch (error) {
      return this.errorResponse(request.id, error);
    }
  }

  private listResources(): ResourcesListResult {
    return {
      resources: Array.from(this.resources.values()).map((handler) => handler.definition),
    };
  }

  private readResource(uri: string): ResourcesReadResult {
    const handler = this.resources.get(uri);
    if (!handler) {
      throw new MCPError(MCP_ERROR_CODES.INVALID_PARAMS, `Unknown resource URI: ${uri}`);
    }
    return { contents: handler.reader() };
  }

  private listTools(): ToolsListResult {
    return {
      tools: Array.from(this.tools.values()).map((handler) => handler.definition),
    };
  }

  private callTool(name: string, args: Record<string, unknown>): MCPToolResult {
    const handler = this.tools.get(name);
    if (!handler) {
      throw new MCPError(MCP_ERROR_CODES.INVALID_PARAMS, `Unknown tool: ${name}`);
    }

    try {
      const result = handler.caller(args);
      return {
        content: [{ type: 'text', text: result.text }],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
          },
        ],
        isError: true,
      };
    }
  }

  private extractUri(params?: Record<string, unknown>): string {
    const uri = params?.uri;
    if (typeof uri !== 'string' || !uri.trim()) {
      throw new MCPError(MCP_ERROR_CODES.INVALID_PARAMS, 'Missing or invalid "uri" parameter.');
    }
    return uri;
  }

  private extractToolCall(params?: Record<string, unknown>): {
    name: string;
    arguments: Record<string, unknown>;
  } {
    const name = params?.name;
    const args = params?.arguments;

    if (typeof name !== 'string' || !name.trim()) {
      throw new MCPError(MCP_ERROR_CODES.INVALID_PARAMS, 'Missing or invalid "name" parameter.');
    }

    if (args !== undefined && (typeof args !== 'object' || args === null || Array.isArray(args))) {
      throw new MCPError(MCP_ERROR_CODES.INVALID_PARAMS, 'Invalid "arguments" parameter. Expected object.');
    }

    return { name, arguments: (args as Record<string, unknown>) ?? {} };
  }

  private respond(id: JSONRPCRequest['id'], result: unknown): JSONRPCResponse {
    return {
      jsonrpc: '2.0',
      id,
      result,
    };
  }

  private errorResponse(id: JSONRPCRequest['id'], error: unknown): JSONRPCResponse {
    if (error instanceof MCPError) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: error.code,
          message: error.message,
          data: error.data,
        },
      };
    }

    const message = error instanceof Error ? error.message : String(error);
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: MCP_ERROR_CODES.INTERNAL_ERROR,
        message,
      },
    };
  }

  private registerResource(
    uri: string,
    definition: ResourceHandler['definition'],
    reader: ResourceHandler['reader']
  ): void {
    this.resources.set(uri, { definition, reader });
  }

  private registerTool(name: string, definition: ToolHandler['definition'], caller: ToolHandler['caller']): void {
    this.tools.set(name, { definition, caller });
  }
}

interface ResourceHandler {
  definition: { uri: string; name: string; mimeType?: string; description?: string };
  reader: () => Array<{ uri: string; text: string; mimeType?: string }>;
}

interface ToolHandler {
  definition: { name: string; description: string; inputSchema: { type: 'object'; properties: Record<string, unknown>; required?: string[] } };
  caller: (args: Record<string, unknown>) => { text: string };
}
