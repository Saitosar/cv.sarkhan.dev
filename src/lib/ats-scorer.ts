/**
 * Client-side ATS Scoring System
 * Analyzes resume without AI to provide instant feedback
 */

import type { ResumeFormData } from './validators';

export interface ATSScore {
  overall: number; // 0-100
  breakdown: {
    keywords: number;
    formatting: number;
    completeness: number;
    readability: number;
  };
  suggestions: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
}

// Common ATS-friendly action verbs
const ACTION_VERBS = [
  'achieved', 'improved', 'increased', 'decreased', 'reduced',
  'developed', 'created', 'designed', 'implemented', 'launched',
  'led', 'managed', 'coordinated', 'supervised', 'mentored',
  'optimized', 'streamlined', 'automated', 'modernized',
  'delivered', 'executed', 'established', 'generated',
];

// Extract keywords from job description
function extractKeywords(text: string): string[] {
  if (!text) return [];

  const normalized = text.toLowerCase();
  // Remove common words
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];

  const words = normalized
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.includes(word));

  // Return unique words, sorted by frequency
  const frequency: Record<string, number> = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

// Check keyword matching
function scoreKeywordMatch(resumeData: ResumeFormData, targetKeywords: string[]): {
  score: number;
  matched: string[];
  missing: string[];
} {
  if (targetKeywords.length === 0) {
    return { score: 100, matched: [], missing: [] };
  }

  // Combine all text from resume
  const resumeText = [
    resumeData.fullName,
    resumeData.jobTitle,
    resumeData.summary,
    ...(resumeData.experience || []).map(e => `${e.position} ${e.company} ${e.description}`),
    ...(resumeData.skills || []).map(s => s.value),
    ...(resumeData.education || []).map(e => `${e.degree} ${e.institution} ${e.field}`),
  ].join(' ').toLowerCase();

  const matched = targetKeywords.filter(keyword =>
    resumeText.includes(keyword)
  );

  const missing = targetKeywords.filter(keyword =>
    !resumeText.includes(keyword)
  );

  const score = Math.round((matched.length / targetKeywords.length) * 100);

  return { score, matched, missing };
}

// Check formatting (ATS-friendly)
function scoreFormatting(resumeData: ResumeFormData): { score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 100;

  // Check for basic contact info
  if (!resumeData.contact?.email) {
    issues.push('Missing email address');
    score -= 15;
  }

  if (!resumeData.contact?.phone) {
    issues.push('Missing phone number');
    score -= 10;
  }

  // Check experience descriptions
  const hasActionVerbs = (resumeData.experience || []).some(exp => {
    const desc = exp.description?.toLowerCase() || '';
    return ACTION_VERBS.some(verb => desc.includes(verb));
  });

  if (!hasActionVerbs && (resumeData.experience || []).length > 0) {
    issues.push('Use action verbs (achieved, developed, led) in descriptions');
    score -= 15;
  }

  // Check for dates in experience
  const hasDates = (resumeData.experience || []).every(exp =>
    exp.startDate?.year && (exp.endDate?.year || exp.endDate?.isCurrent)
  );

  if (!hasDates && (resumeData.experience || []).length > 0) {
    issues.push('Add dates to all work experience');
    score -= 10;
  }

  return { score: Math.max(0, score), issues };
}

// Check completeness
function scoreCompleteness(resumeData: ResumeFormData): { score: number; missing: string[] } {
  const missing: string[] = [];
  let score = 100;

  const requiredFields = [
    { field: resumeData.fullName, name: 'Full name', weight: 15 },
    { field: resumeData.jobTitle, name: 'Job title', weight: 15 },
    { field: resumeData.summary, name: 'Professional summary', weight: 20 },
    { field: (resumeData.experience || []).length > 0, name: 'Work experience', weight: 25 },
    { field: (resumeData.skills || []).length > 0, name: 'Skills', weight: 15 },
    { field: resumeData.contact?.email, name: 'Email', weight: 10 },
  ];

  requiredFields.forEach(({ field, name, weight }) => {
    if (!field) {
      missing.push(name);
      score -= weight;
    }
  });

  return { score: Math.max(0, score), missing };
}

// Check readability
function scoreReadability(resumeData: ResumeFormData): { score: number; suggestions: string[] } {
  const suggestions: string[] = [];
  let score = 100;

  // Check summary length
  if (resumeData.summary) {
    const wordCount = resumeData.summary.split(/\s+/).length;
    if (wordCount < 30) {
      suggestions.push('Summary is too short (minimum 30 words recommended)');
      score -= 15;
    } else if (wordCount > 150) {
      suggestions.push('Summary is too long (maximum 150 words recommended)');
      score -= 10;
    }
  }

  // Check for quantifiable achievements
  const hasNumbers = (resumeData.experience || []).some(exp => {
    const desc = exp.description || '';
    return /\d+%|\$\d+|\d+\s*(users|customers|projects)/i.test(desc);
  });

  if (!hasNumbers && (resumeData.experience || []).length > 0) {
    suggestions.push('Add quantifiable achievements (e.g., "increased sales by 40%")');
    score -= 20;
  }

  // Check bullet points format
  const hasBullets = (resumeData.experience || []).some(exp => {
    const desc = exp.description || '';
    return desc.includes('•') || desc.includes('-') || desc.includes('*');
  });

  if ((resumeData.experience || []).length > 0 && !hasBullets) {
    suggestions.push('Use bullet points for better readability');
    score -= 10;
  }

  return { score: Math.max(0, score), suggestions };
}

// Main scoring function
export function calculateATSScore(
  resumeData: ResumeFormData,
  targetJobDescription?: string
): ATSScore {
  const targetKeywords = targetJobDescription
    ? extractKeywords(targetJobDescription)
    : [];

  const keywordResult = scoreKeywordMatch(resumeData, targetKeywords);
  const formattingResult = scoreFormatting(resumeData);
  const completenessResult = scoreCompleteness(resumeData);
  const readabilityResult = scoreReadability(resumeData);

  // Weighted average
  const overall = Math.round(
    (keywordResult.score * 0.3 +
      formattingResult.score * 0.25 +
      completenessResult.score * 0.25 +
      readabilityResult.score * 0.2)
  );

  const suggestions: string[] = [
    ...formattingResult.issues,
    ...completenessResult.missing.map(item => `Add ${item}`),
    ...readabilityResult.suggestions,
  ];

  // Add keyword suggestions if target job provided
  if (keywordResult.missing.length > 0 && targetJobDescription) {
    suggestions.unshift(
      `Include these keywords: ${keywordResult.missing.slice(0, 5).join(', ')}`
    );
  }

  return {
    overall,
    breakdown: {
      keywords: keywordResult.score,
      formatting: formattingResult.score,
      completeness: completenessResult.score,
      readability: readabilityResult.score,
    },
    suggestions: suggestions.slice(0, 5), // Top 5 suggestions
    matchedKeywords: keywordResult.matched,
    missingKeywords: keywordResult.missing.slice(0, 10),
  };
}
