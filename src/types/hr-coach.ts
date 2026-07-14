// src/types/hr-coach.ts

import type { ChatMode } from './chat';

export interface ChatModeConfig {
  id: ChatMode;
  label: string;
  agentName: string;
  avatarIcon: string;
  color: string;
  borderColor: string;
  bgColor: string;
  description: string;
}

export const CHAT_MODES: Record<ChatMode, ChatModeConfig> = {
  aether: {
    id: 'aether',
    label: 'Aether',
    agentName: 'Aether Coach',
    avatarIcon: 'smart_toy',
    color: '#d2bbff',
    borderColor: 'rgba(210, 187, 255, 0.3)',
    bgColor: 'rgba(96, 1, 209, 0.1)',
    description: 'AI Career Expert — supportive, actionable, ATS-focused',
  },
};
