# CV Agent Ecosystem — Error Log

> Centralized error tracking for the cv.sarkhan.dev agent team.
> Each entry records a failure, its resolution, and any SOUL updates triggered.

## Format

```yaml
- id: <incrementing-id>
  timestamp: <ISO-8601>
  agent: <agent-name>
  error_type: <short-description>
  severity: P0|P1|P2
  commit: <commit-hash>
  description: |
    <detailed description>
  resolution: |
    <how it was resolved>
  soul_updated: true|false
  soul_update: |
    <if soul_updated, what was added>
```

## Entries

<!-- New entries are appended above this line -->
