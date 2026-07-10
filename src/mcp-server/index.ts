// src/mcp-server/index.ts
//
// Standalone MCP server entry point.
// Since we now use the SDK's server instance directly in server.ts, 
// we can either import it or just let server.ts be the entry point.

// To keep the project structure, we'll make server.ts a module 
// and index.ts the runner.

import { server } from './server';

async function start() {
  console.error('MCP Server starting...');
  // The server.connect(transport) is already called in server.ts main()
  // But for a cleaner architecture, we should move it here.
}

start().catch(console.error);
