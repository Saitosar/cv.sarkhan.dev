import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { 
  validateToken, 
  updateResumeInDB, 
  getResumeFromDB, 
  analyzeResumeFit, 
  sendTelegramNotification,
  logMcpCall 
} from './lib/auth';
import { RESUME_SCHEMA } from './types';
import { z } from 'zod';

export const server = new Server(
  { name: 'cv-sarkhan-dev-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'update_resume',
      description: 'Update resume sections. Returns updated resume on success.',
      inputSchema: {
        type: 'object',
        properties: {
          token: { type: 'string', description: 'Pro API token for authentication' },
          sections: {
            type: 'object',
            description: 'Resume sections to update.',
            properties: {
              basics: { type: 'object' },
              skills: { type: 'array', items: { type: 'object' } },
              experience: { type: 'array', items: { type: 'object' } },
              education: { type: 'array', items: { type: 'object' } },
              projects: { type: 'array', items: { type: 'object' } },
              certificates: { type: 'array', items: { type: 'object' } },
              languages: { type: 'array', items: { type: 'object' } },
            },
          },
          context: { type: 'string', description: 'Optional context for the update' },
        },
        required: ['token', 'sections'],
      },
    },
    {
      name: 'get_resume',
      description: 'Retrieve the full resume as a JSON Resume object.',
      inputSchema: {
        type: 'object',
        properties: {
          token: { type: 'string', description: 'Pro API token for authentication' },
        },
        required: ['token'],
      },
    },
    {
      name: 'analyze_resume',
      description: 'Analyze resume fit against a job description. Returns match score, gaps, and recommendations.',
      inputSchema: {
        type: 'object',
        properties: {
          token: { type: 'string', description: 'Pro API token for authentication' },
          jobDescription: { type: 'string', description: 'Full job description text' },
        },
        required: ['token', 'jobDescription'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const startTime = Date.now();

  try {
    if (!args || typeof args !== 'object') {
      throw new Error('Invalid arguments');
    }

    const token = args.token as string;
    if (!token) {
      return {
        isError: true,
        content: [{ type: 'text', text: JSON.stringify({ error: 'unauthorized', message: 'Token is required' }) }],
      };
    }

    const auth = await validateToken(token);
    if (!auth.valid) {
      const duration = Date.now() - startTime;
      await logMcpCall(auth.user?.id || 'unknown', token.substring(0, 16), name, auth.error || 'unauthorized', duration);
      
      return {
        isError: true,
        content: [{ 
          type: 'text', 
          text: JSON.stringify({ 
            error: auth.error, 
            retryAfter: auth.retryAfter, 
            upgrade_url: 'https://cv.sarkhan.dev/pro' 
          }) 
        }],
      };
    }

    const userId = auth.user!.id;

    switch (name) {
      case 'update_resume': {
        const sections = args.sections;
        const context = args.context as string;
        
        // Validation
        const validation = RESUME_SCHEMA.partial().safeParse(sections);
        if (!validation.success) {
          return {
            isError: true,
            content: [{ type: 'text', text: JSON.stringify({ error: 'invalid_params', details: validation.error.format() }) }],
          };
        }

        const resume = await updateResumeInDB(userId, sections, context);
        await sendTelegramNotification(userId, 'resume_updated', { context });
        
        const duration = Date.now() - startTime;
        await logMcpCall(userId, token.substring(0, 16), name, 'success', duration);

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, resume, updated_at: new Date().toISOString() }) }],
        };
      }

      case 'get_resume': {
        const resume = await getResumeFromDB(userId);
        
        const duration = Date.now() - startTime;
        await logMcpCall(userId, token.substring(0, 16), name, 'success', duration);

        return {
          content: [{ 
            type: 'text', 
            text: JSON.stringify({ 
              success: true, 
              resume, 
              meta: { version: '1.0.0', last_updated: resume.updated_at, locale: 'ru-RU' } 
            }) 
          }],
        };
      }

      case 'analyze_resume': {
        const jobDescription = args.jobDescription as string;
        if (!jobDescription) {
          return {
            isError: true,
            content: [{ type: 'text', text: JSON.stringify({ error: 'invalid_params', message: 'jobDescription is required' }) }],
          };
        }

        const analysis = await analyzeResumeFit(userId, jobDescription);
        
        const duration = Date.now() - startTime;
        await logMcpCall(userId, token.substring(0, 16), name, 'success', duration);

        return {
          content: [{ type: 'text', text: JSON.stringify({ success: true, analysis }) }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (err) {
    const duration = Date.now() - startTime;
    return {
      isError: true,
      content: [{ type: 'text', text: JSON.stringify({ error: 'internal_error', message: (err as Error).message, duration: duration }) }],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
