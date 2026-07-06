export type TaskType =
  | 'chat'
  | 'ats-score'
  | 'generate'
  | 'tailor'
  | 'analyze'
  | 'suggest';

export interface FallbackConfig {
  model: string;
  temperature: number;
  topP: number;
  maxOutputTokens: number;
  systemPrompt: string;
}

export interface ModelConfig {
  task: TaskType;
  model: string;
  temperature: number;
  topP: number;
  maxOutputTokens: number;
  systemPrompt: string;
  fallbacks: FallbackConfig[];
}

export const MODEL_CONFIGS: Record<TaskType, ModelConfig> = {
  chat: {
    task: 'chat',
    model: 'gemini-2.5-flash',
    temperature: 0.7,
    topP: 0.9,
    maxOutputTokens: 4096,
    systemPrompt: `You are Aether, an AI Career Coach. You help users improve their resumes, provide career advice, and guide them through the job search process. Be supportive, professional, and actionable. Use markdown for formatting. When suggesting resume changes, be specific and provide before/after examples.`,
    fallbacks: [
      {
        model: 'gemini-2.5-flash',
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 4096,
        systemPrompt: `You are Aether, an AI Career Coach. Be supportive and actionable.`,
      },
    ],
  },

  'ats-score': {
    task: 'ats-score',
    model: 'gemini-2.5-flash',
    temperature: 0.2,
    topP: 0.8,
    maxOutputTokens: 2048,
    systemPrompt: `You are an ATS (Applicant Tracking System) scoring engine. Analyze the resume data and job description (if provided) and return a structured ATS score with breakdown, matched/missing keywords, and actionable suggestions. Return ONLY valid JSON matching the ATSScore interface.`,
    fallbacks: [
      {
        model: 'gemini-2.5-flash',
        temperature: 0.2,
        topP: 0.8,
        maxOutputTokens: 2048,
        systemPrompt: `You are an ATS scoring engine. Return JSON only.`,
      },
    ],
  },

  generate: {
    task: 'generate',
    model: 'gemini-2.5-flash',
    temperature: 0.6,
    topP: 0.9,
    maxOutputTokens: 4096,
    systemPrompt: `You are a professional resume writer. Generate compelling, ATS-friendly resume content based on the user's data. Focus on achievements with quantifiable metrics. Use strong action verbs. Return structured JSON matching the resume schema.`,
    fallbacks: [
      {
        model: 'gemini-2.5-flash',
        temperature: 0.6,
        topP: 0.9,
        maxOutputTokens: 4096,
        systemPrompt: `You are a professional resume writer. Return JSON only.`,
      },
    ],
  },

  tailor: {
    task: 'tailor',
    model: 'gemini-2.5-flash',
    temperature: 0.5,
    topP: 0.85,
    maxOutputTokens: 4096,
    systemPrompt: `You are a Resume Strategist and ATS Optimization Specialist. Your mission: transform the provided resume to perfectly align with the target job. Extract keywords from the job description, weave them naturally into the resume, rewrite the summary to position the candidate as the ideal fit. Return structured JSON matching the resume schema with an estimated atsScore.`,
    fallbacks: [
      {
        model: 'gemini-2.5-flash',
        temperature: 0.5,
        topP: 0.85,
        maxOutputTokens: 4096,
        systemPrompt: `You are a Resume Strategist. Tailor the resume to the job description. Return JSON.`,
      },
    ],
  },

  analyze: {
    task: 'analyze',
    model: 'gemini-2.5-flash',
    temperature: 0.3,
    topP: 0.8,
    maxOutputTokens: 4096,
    systemPrompt: `You are a Resume Evaluator AI — a combination of an ATS scanner, a seasoned recruiter, and a professional career coach. Analyze the resume deeply, identify strengths, weaknesses, and provide actionable recommendations. Return structured JSON with resume_score, strengths, weaknesses, recommendations.`,
    fallbacks: [
      {
        model: 'gemini-2.5-flash',
        temperature: 0.3,
        topP: 0.8,
        maxOutputTokens: 4096,
        systemPrompt: `You are a Resume Evaluator. Analyze and return JSON.`,
      },
    ],
  },

  suggest: {
    task: 'suggest',
    model: 'gemini-2.5-flash',
    temperature: 0.6,
    topP: 0.9,
    maxOutputTokens: 1024,
    systemPrompt: `You are a quick resume improvement assistant. Given a user's question or a section of their resume, provide 2-3 concise, actionable suggestions. Keep responses brief (under 200 words). Focus on the most impactful changes.`,
    fallbacks: [
      {
        model: 'gemini-2.5-flash',
        temperature: 0.6,
        topP: 0.9,
        maxOutputTokens: 1024,
        systemPrompt: `You are a quick resume assistant. Keep suggestions brief and actionable.`,
      },
    ],
  },
};

/**
 * Tasks that are safe to cache because their inputs are deterministic.
 */
export const CACHEABLE_TASKS: TaskType[] = ['ats-score', 'generate', 'tailor', 'analyze'];
