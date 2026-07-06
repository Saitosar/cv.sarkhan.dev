import type { TaskType } from '../config';
import { buildChatPrompt, type ChatPromptInput } from './chat';
import { buildATSScorePrompt, type ATSScorePromptInput } from './ats-score';
import { buildGeneratePrompt, type GeneratePromptInput } from './generate';
import { buildTailorPrompt, type TailorPromptInput } from './tailor';
import { buildAnalyzePrompt, type AnalyzePromptInput } from './analyze';
import { buildSuggestPrompt, type SuggestPromptInput } from './suggest';
import { buildSuggestionsPrompt, type SuggestionsPromptInput } from './suggestions';
import { buildSearchPrompt, type SearchPromptInput } from './search';

export interface GenericPromptInput {
  message?: string;
  resumeData?: Record<string, unknown>;
  jobDescription?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  section?: string;
  sectionContent?: string;
  targetRole?: string;
  jobTitle?: string;
}

export function buildPrompt(task: TaskType, input: GenericPromptInput): string {
  switch (task) {
    case 'chat':
      return buildChatPrompt(input as unknown as ChatPromptInput);
    case 'ats-score':
      return buildATSScorePrompt(input as unknown as ATSScorePromptInput);
    case 'generate':
      return buildGeneratePrompt(input as unknown as GeneratePromptInput);
    case 'tailor':
      return buildTailorPrompt(input as unknown as TailorPromptInput);
    case 'analyze':
      return buildAnalyzePrompt(input as unknown as AnalyzePromptInput);
    case 'suggest':
      return buildSuggestPrompt(input as unknown as SuggestPromptInput);
    case 'suggestions':
      return buildSuggestionsPrompt(input as unknown as SuggestionsPromptInput);
    case 'search':
      return buildSearchPrompt(input as unknown as SearchPromptInput);
    default:
      throw new Error(`Unknown task type: ${task}`);
  }
}
