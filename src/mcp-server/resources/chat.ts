// src/mcp-server/resources/chat.ts
//
// chat://history resource — returns a placeholder chat history stub.

import { RESOURCES } from '../config';
import type { ChatMessage, SectionType } from '@/types/chat';
import type { MCPResource, MCPResourceContent } from '../types';

export const chatResource: MCPResource = {
  uri: RESOURCES.CHAT_HISTORY,
  name: 'Chat History',
  mimeType: 'application/json',
  description: 'Stub chat history for the current resume session.',
};

export function readChatHistory(): MCPResourceContent[] {
  const messages: ChatMessage[] = [
    {
      id: 'msg-1',
      role: 'assistant',
      content: 'Hi! I can help you improve your resume, analyze ATS score, or search for jobs. What would you like to do?',
      timestamp: Date.now() - 1000 * 60 * 5,
      section: 'general' as SectionType,
      source: 'aether',
      hasActions: true,
    },
    {
      id: 'msg-2',
      role: 'user',
      content: 'Can you analyze my experience section?',
      timestamp: Date.now() - 1000 * 60 * 4,
      section: 'experience' as SectionType,
    },
    {
      id: 'msg-3',
      role: 'assistant',
      content: 'Your experience section is strong. Consider adding more measurable outcomes to every bullet point.',
      timestamp: Date.now() - 1000 * 60 * 3,
      section: 'experience' as SectionType,
      source: 'aether',
    },
  ];

  return [
    {
      uri: RESOURCES.CHAT_HISTORY,
      text: JSON.stringify(messages, null, 2),
      mimeType: 'application/json',
    },
  ];
}
