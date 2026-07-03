# Job Search

**Status:** Draft  
**Last Updated:** 2026-07-03  
**Owner:** CTO (Sarkhan)

## Overview

Поиск вакансий через Firecrawl API + AI scoring. Pro-фича.

## Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as Agent
    participant FC as Firecrawl
    participant AI as AI Model
    
    U->>A: "Find me Senior Dev jobs in Berlin"
    A->>FC: Search job boards
    FC-->>A: Raw job listings
    A->>AI: Score jobs against resume
    AI-->>A: Ranked matches with scores
    A->>U: "Top 5 matches: Senior Dev at X (92% match)..."
    U->>A: "Show me the one at Company X"
    A->>AI: Optimize resume for this job
    AI-->>A: Tailored resume + ATS score
    A-->>U: "Your resume now scores 85/100 for this role"
```

## Implementation

```typescript
// POST /api/search-jobs
export async function POST(req: Request) {
  const { query, location, resume } = await req.json();
  
  // Search via Firecrawl
  const jobs = await firecrawl.search({
    query: `${query} ${location} job`,
    sites: ['linkedin.com/jobs', 'indeed.com', 'glassdoor.com'],
    limit: 20,
  });
  
  // Score each job against resume
  const scored = await Promise.all(
    jobs.map(async (job) => {
      const score = await routeWithFallback('scoring', `
        Score this job match against the candidate's resume (0-100).
        Consider: skills match, experience level, industry, location.
        
        Resume: ${JSON.stringify(resume)}
        Job: ${JSON.stringify(job)}
        
        Return: { score, matched_skills, missing_skills, reasoning }
      `);
      return { ...job, score: JSON.parse(score) };
    })
  );
  
  // Sort by score
  scored.sort((a, b) => b.score.score - a.score.score);
  
  return Response.json({ jobs: scored.slice(0, 10) });
}
```
