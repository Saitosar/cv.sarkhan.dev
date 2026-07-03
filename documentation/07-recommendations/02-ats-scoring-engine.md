# ATS Scoring Engine

**Status:** Draft  
**Last Updated:** 2026-07-03  
**Owner:** CTO (Sarkhan)

## Overview

Динамический ATS-аудит: сравнение резюме с вакансией, подсветка на Canvas, рекомендации.

## Scoring Dimensions

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Keywords | 35% | Match between resume keywords and job description |
| Formatting | 25% | Bullet points, action verbs, section structure |
| Completeness | 20% | All required sections present, no gaps |
| Readability | 20% | Clear language, concise descriptions, no jargon |

## Canvas Visualization

```mermaid
flowchart LR
    A[Resume Canvas] --> B{ATS Analysis}
    B --> C[Green: Good match]
    B --> D[Yellow: Needs improvement]
    B --> E[Red: Missing/weak]
    
    C --> F[Score badge: 85/100]
    D --> G[Tooltip: "Add more keywords"]
    E --> H[Tooltip: "Missing: Kubernetes, Python"]
```

## Implementation

```typescript
// POST /api/ats-score
export async function POST(req: Request) {
  const { resume, jobDescription } = await req.json();
  
  const analysis = await routeWithFallback('scoring', `
    Analyze this resume against the job description.
    
    Resume: ${JSON.stringify(resume)}
    Job Description: ${jobDescription}
    
    Return JSON:
    {
      "overall_score": 0-100,
      "dimensions": {
        "keywords": { "score": 0-100, "matched": [...], "missing": [...] },
        "formatting": { "score": 0-100, "issues": [...] },
        "completeness": { "score": 0-100, "missing_sections": [...] },
        "readability": { "score": 0-100, "suggestions": [...] }
      },
      "section_scores": {
        "summary": { "score": 0-100, "suggestion": "..." },
        "experience": { "score": 0-100, "suggestion": "..." },
        "skills": { "score": 0-100, "suggestion": "..." }
      },
      "recommendations": ["..."],
      "optimized_resume": { ... }
    }
  `);
  
  return Response.json(JSON.parse(analysis));
}
```

## Canvas Highlighting

```typescript
// Client-side: apply ATS highlights to canvas
function applyATSHighlights(analysis: ATSAnalysis) {
  for (const [section, score] of Object.entries(analysis.section_scores)) {
    const element = canvas.querySelector(`[data-section="${section}"]`);
    
    if (score.score >= 80) {
      element.classList.add('ats-green');
    } else if (score.score >= 50) {
      element.classList.add('ats-yellow');
      element.setAttribute('data-tooltip', score.suggestion);
    } else {
      element.classList.add('ats-red');
      element.setAttribute('data-tooltip', score.suggestion);
    }
  }
}
```
