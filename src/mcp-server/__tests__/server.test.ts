import { spawn } from 'node:child_process';
import { describe } from 'vitest';
import { expect, it, beforeEach } from 'vitest';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

// This is a simplified test helper to test the MCP server over stdio
async function callMcpTool(serverProcess: any, toolName: string, args: any) {
  const request = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: args,
    },
  };
  
  serverProcess.stdin.write(JSON.stringify(request) + '\n');
  
  return new Promise((resolve) => {
    serverProcess.stdout.on('data', (data) => {
      try {
        const response = JSON.parse(data.toString());
        resolve(response);
      } catch (e) {
        // ignore non-json or partial outputs
      }
    });
  });
}

describe('MCP Server Implementation', () => {
  let serverProcess: any;

  beforeEach(() => {
    serverProcess = spawn('node', ['src/mcp-server/server.js']); // Assuming compiled to JS
  });

  it('should allow get_resume with valid token', async () => {
    const res = await callMcpTool(serverProcess, 'get_resume', { token: 'cv_pro_test_token' });
    expect(res.result.content[0].text).toContain('"success":true');
  });

  it('should reject get_resume with invalid token', async () => {
    const res = await callMcpTool(serverProcess, 'get_resume', { token: 'wrong_token' });
    expect(res.isError).toBe(true);
    expect(JSON.parse(res.content[0].text).error).toBe('unauthorized');
  });

  it('should validate resume sections in update_resume', async () => {
    const res = await callMcpTool(serverProcess, 'update_resume', { 
      token: 'cv_pro_test_token', 
      sections: { basics: { email: 'not-an-email' } } 
    });
    expect(res.isError).toBe(true);
    expect(JSON.parse(res.content[0].text).error).toBe('invalid_params');
  });

  it('should analyze resume fit', async () => {
    const res = await callMcpTool(serverProcess, 'analyze_resume', { 
      token: 'cv_pro_test_token', 
      jobDescription: 'Looking for a TypeScript expert' 
    });
    expect(res.result.content[0].text).toContain('"overall_score":85');
  });
});
