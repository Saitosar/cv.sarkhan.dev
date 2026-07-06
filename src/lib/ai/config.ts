export type TaskType =
  | 'chat'
  | 'ats-score'
  | 'generate'
  | 'tailor'
  | 'analyze'
  | 'suggest'
  | 'suggestions'
  | 'search';

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
  /** Optional alternate system prompt (e.g. HR Coach mode). */
  alternateSystemPrompt?: string;
  fallbacks: FallbackConfig[];
}

export const MODEL_CONFIGS: Record<TaskType, ModelConfig> = {
  chat: {
    task: 'chat',
    model: 'deepseek-v4-flash',
    temperature: 0.7,
    topP: 0.9,
    maxOutputTokens: 4096,
    systemPrompt: `You are Aether, an AI Career Coach. You help users improve their resumes, provide career advice, and guide them through the job search process. Be supportive, professional, and actionable. Use markdown for formatting. When suggesting resume changes, be specific and provide before/after examples.`,
    alternateSystemPrompt: `You are an HR Coach, a strict hiring expert with 15+ years of experience in talent acquisition. Your role is to provide realistic, sometimes uncomfortable feedback that prepares the candidate for real interviews. Be direct and critical — sugar-coating doesn't help in real interviews. Focus on: interview preparation, behavioral questions (STAR method), resume gaps, and what recruiters actually look for. Use a professional but firm tone. When evaluating answers, provide specific scores and actionable improvement steps.`,
    fallbacks: [
      {
        model: 'deepseek-v4-flash',
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 4096,
        systemPrompt: `You are Aether, an AI Career Coach. Be supportive and actionable.`,
      },
    ],
  },

  'ats-score': {
    task: 'ats-score',
    model: 'deepseek-v4-flash',
    temperature: 0.2,
    topP: 0.8,
    maxOutputTokens: 2048,
    systemPrompt: `You are an ATS (Applicant Tracking System) scoring engine. Analyze the resume data and job description (if provided) and return a structured ATS score with breakdown, matched/missing keywords, and actionable suggestions. Return ONLY valid JSON matching the ATSScore interface.`,
    fallbacks: [
      {
        model: 'deepseek-v4-flash',
        temperature: 0.2,
        topP: 0.8,
        maxOutputTokens: 2048,
        systemPrompt: `You are an ATS scoring engine. Return JSON only.`,
      },
    ],
  },

  generate: {
    task: 'generate',
    model: 'deepseek-v4-flash',
    temperature: 0.6,
    topP: 0.9,
    maxOutputTokens: 4096,
    systemPrompt: `You are a professional resume writer. Generate compelling, ATS-friendly resume content based on the user's data. Focus on achievements with quantifiable metrics. Use strong action verbs. Return structured JSON matching the resume schema.`,
    fallbacks: [
      {
        model: 'deepseek-v4-flash',
        temperature: 0.6,
        topP: 0.9,
        maxOutputTokens: 4096,
        systemPrompt: `You are a professional resume writer. Return JSON only.`,
      },
    ],
  },

  tailor: {
    task: 'tailor',
    model: 'deepseek-v4-flash',
    temperature: 0.5,
    topP: 0.85,
    maxOutputTokens: 4096,
    systemPrompt: `You are a Resume Strategist and ATS Optimization Specialist. Your mission: transform the provided resume to perfectly align with the target job. Extract keywords from the job description, weave them naturally into the resume, rewrite the summary to position the candidate as the ideal fit. Return structured JSON matching the resume schema with an estimated atsScore.`,
    fallbacks: [
      {
        model: 'deepseek-v4-flash',
        temperature: 0.5,
        topP: 0.85,
        maxOutputTokens: 4096,
        systemPrompt: `You are a Resume Strategist. Tailor the resume to the job description. Return JSON.`,
      },
    ],
  },

  analyze: {
    task: 'analyze',
    model: 'deepseek-v4-flash',
    temperature: 0.3,
    topP: 0.8,
    maxOutputTokens: 4096,
    systemPrompt: `You are a Resume Evaluator AI — a combination of an ATS scanner, a seasoned recruiter, and a professional career coach. Analyze the resume deeply, identify strengths, weaknesses, and provide actionable recommendations. Return structured JSON with resume_score, strengths, weaknesses, recommendations.`,
    fallbacks: [
      {
        model: 'deepseek-v4-flash',
        temperature: 0.3,
        topP: 0.8,
        maxOutputTokens: 4096,
        systemPrompt: `You are a Resume Evaluator. Analyze and return JSON.`,
      },
    ],
  },

  suggest: {
    task: 'suggest',
    model: 'deepseek-v4-flash',
    temperature: 0.6,
    topP: 0.9,
    maxOutputTokens: 1024,
    systemPrompt: `You are a quick resume improvement assistant. Given a user's question or a section of their resume, provide 2-3 concise, actionable suggestions. Keep responses brief (under 200 words). Focus on the most impactful changes.`,
    fallbacks: [
      {
        model: 'deepseek-v4-flash',
        temperature: 0.6,
        topP: 0.9,
        maxOutputTokens: 1024,
        systemPrompt: `You are a quick resume assistant. Keep suggestions brief and actionable.`,
      },
    ],
  },

  suggestions: {
    task: 'suggestions',
    model: 'deepseek-v4-flash',
    temperature: 0.3,
    topP: 0.8,
    maxOutputTokens: 2048,
    systemPrompt: `You are a resume improvement analyst. Given a specific section of a resume, analyze it and return structured suggestions. Focus on: missing keywords, weak action verbs, formatting issues, content gaps, and missing metrics. Return ONLY valid JSON matching the SuggestionsRouterResponse interface. Each suggestion must have a clear, actionable description.`,
    fallbacks: [
      {
        model: 'deepseek-v4-flash',
        temperature: 0.3,
        topP: 0.8,
        maxOutputTokens: 2048,
        systemPrompt: `You are a resume analyst. Return JSON only with suggestions array.`,
      },
    ],
  },

  search: {
    task: 'search',
    model: 'deepseek-v4-flash',
    temperature: 0.2,
    topP: 0.8,
    maxOutputTokens: 1024,
    systemPrompt: `You are a job match scoring engine. Given a job listing and a candidate's resume, calculate a match score (0-100). Consider: skills overlap, years of experience, industry relevance, and location. Return ONLY valid JSON matching the JobScoreResult interface.`,
    fallbacks: [
      {
        model: 'deepseek-v4-flash',
        temperature: 0.2,
        topP: 0.8,
        maxOutputTokens: 1024,
        systemPrompt: `You are a job match scorer. Return JSON only.`,
      },
    ],
  },
};

/**
 * Tasks that are safe to cache because their inputs are deterministic.
 */
export const CACHEABLE_TASKS: TaskType[] = ['ats-score', 'generate', 'tailor', 'analyze'];
