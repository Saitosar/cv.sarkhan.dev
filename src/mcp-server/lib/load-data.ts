// src/mcp-server/lib/load-data.ts
//
// Shared helper to load the resume/ATS data file from disk.
// Keeps all disk I/O in one place for the standalone MCP server.

import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { RESUME_DATA_PATH } from '../config';
import type { ResumeStoreData } from '@/types/resume';
import type { ATSScore } from '@/types/ats';

interface ResumeDataFile {
  resume: ResumeStoreData;
  ats: ATSScore;
}

let cache: ResumeDataFile | null = null;
let cacheMtimeMs = 0;

export function loadResumeData(): ResumeDataFile {
  const path = resolve(RESUME_DATA_PATH);
  const { mtimeMs } = readStats(path);

  if (cache && cacheMtimeMs === mtimeMs) {
    return cache;
  }

  const raw = readFileSync(path, 'utf-8');
  const parsed = JSON.parse(raw) as ResumeDataFile;
  cache = parsed;
  cacheMtimeMs = mtimeMs;
  return parsed;
}

function readStats(path: string): { mtimeMs: number } {
  try {
    return statSync(path);
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to stat resume data file at ${path}: ${err}`);
  }
}
