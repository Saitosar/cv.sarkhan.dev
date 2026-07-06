import { describe, it, expect } from 'vitest';
import { buildChatPrompt } from '../prompts/chat';
import { buildATSScorePrompt } from '../prompts/ats-score';
import { buildGeneratePrompt } from '../prompts/generate';
import { buildTailorPrompt } from '../prompts/tailor';
import { buildAnalyzePrompt } from '../prompts/analyze';
import { buildSuggestPrompt } from '../prompts/suggest';
import { buildPrompt } from '../prompts';

describe('Prompt builders', () => {
  const resumeData = { fullName: 'Jane Doe', jobTitle: 'Engineer' };
  const jobDescription = 'Senior full-stack engineer with React and Node.js';

  it('buildChatPrompt includes all sections', () => {
    const prompt = buildChatPrompt({
      message: 'hello',
      resumeData,
      jobDescription,
      history: [{ role: 'user', content: 'hi' }],
    });

    expect(prompt).toContain('[CURRENT RESUME CONTEXT]');
    expect(prompt).toContain('[TARGET JOB DESCRIPTION]');
    expect(prompt).toContain('[CONVERSATION HISTORY]');
    expect(prompt).toContain('[USER MESSAGE]');
    expect(prompt).toContain('hello');
  });

  it('buildChatPrompt includes only user message when no context', () => {
    const prompt = buildChatPrompt({ message: 'just a message' });
    expect(prompt).toContain('just a message');
    expect(prompt).not.toContain('[CURRENT RESUME CONTEXT]');
  });

  it('buildATSScorePrompt requests JSON', () => {
    const prompt = buildATSScorePrompt({ resumeData });
    expect(prompt).toContain('Return ONLY valid JSON');
    expect(prompt).toContain('"overall"');
  });

  it('buildGeneratePrompt includes target role', () => {
    const prompt = buildGeneratePrompt({ resumeData, targetRole: 'Manager' });
    expect(prompt).toContain('Manager');
  });

  it('buildTailorPrompt requires job description', () => {
    const prompt = buildTailorPrompt({ resumeData, jobDescription, jobTitle: 'Lead' });
    expect(prompt).toContain('Lead');
    expect(prompt).toContain(jobDescription);
    expect(prompt).toContain('atsScore');
  });

  it('buildAnalyzePrompt includes motivational output', () => {
    const prompt = buildAnalyzePrompt({ resumeData });
    expect(prompt).toContain('mentorship_tone_example');
  });

  it('buildSuggestPrompt keeps it brief', () => {
    const prompt = buildSuggestPrompt({ message: 'improve summary', section: 'summary' });
    expect(prompt).toContain('**Focus Section:** summary');
    expect(prompt).toContain('under 200 words');
  });

  it('dispatcher builds prompts correctly', () => {
    expect(buildPrompt('chat', { message: 'hi' })).toContain('hi');
    expect(buildPrompt('ats-score', { resumeData })).toContain('ATS compatibility');
    expect(buildPrompt('generate', { resumeData })).toContain('User Data');
    expect(buildPrompt('tailor', { resumeData, jobDescription })).toContain('Mission');
    expect(buildPrompt('analyze', { resumeData })).toContain('Resume Evaluator');
    expect(buildPrompt('suggest', { message: 'help' })).toContain('User Question');
  });

  it('dispatcher throws on unknown task', () => {
    expect(() => buildPrompt('unknown' as never, {})).toThrow('Unknown task type');
  });
});
