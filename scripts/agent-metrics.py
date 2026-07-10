#!/usr/bin/env python3
"""CV Agent Metrics Collector — собирает метрики эффективности агентов за последние 24 часа для cv.sarkhan.dev."""

import json, subprocess, os, datetime
from pathlib import Path

REPO = "/root/cv.sarkhan.dev"
ERROR_LOG = f"{REPO}/.hermes/error-log.md"
OUTPUT = f"{REPO}/.hermes/metrics-{datetime.date.today().isoformat()}.json"

def run(cmd, cwd=REPO):
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, cwd=cwd, timeout=30)
        return r.stdout.strip()
    except:
        return ""

# 1. Git metrics — commits in last 24h
commits = run(["git", "log", "--since=24 hours", "--oneline"])
commit_count = len(commits.split("\n")) if commits else 0

# 2. Files changed
git_dir = run(["git", "rev-parse", "--git-dir"])
files_changed = run(["git", "diff", "--name-only", "@{1 day ago}"]).split("\n") if git_dir else []

# 3. Error log entries
errors = []
if os.path.exists(ERROR_LOG):
    with open(ERROR_LOG) as f:
        errors = [l for l in f if l.strip().startswith("-")]

# 4. Test results
test_output = run(["npx", "vitest", "run", "--reporter=json"])
tests = {}
if test_output:
    try:
        t = json.loads(test_output)
        tests = {"total": t.get("total", 0), "pass": t.get("pass", 0), "fail": t.get("fail", 0)}
    except:
        pass

# 5. Audit reports
audits = []
audit_dir = Path(f"{REPO}/documentation/98-audits")
if audit_dir.exists():
    for f in sorted(audit_dir.glob("audit*"), key=os.path.getmtime, reverse=True)[:3]:
        audits.append(f.name)

# 6. Build status
build = run(["npm", "run", "build"])
build_ok = "Compiled successfully" in build or "exit code 0" in build or "ready" in build.lower()

# 7. Agent profile health — check all CV agent profiles exist
agent_profiles_dir = Path("/root/.hermes/profiles")
cv_agents = ["cv-orchestrator", "cv-architect", "cv-developer", "cv-designer", "cv-qa", "cv-auditor", "cv-ecosystem", "cv-writer"]
agents_active = {}
for agent in cv_agents:
    soul_path = agent_profiles_dir / agent / "SOUL.md"
    config_path = agent_profiles_dir / agent / "config.yaml"
    agents_active[agent] = "active" if soul_path.exists() and config_path.exists() else "missing"

metrics = {
    "date": datetime.date.today().isoformat(),
    "commits_24h": commit_count,
    "files_changed": len(files_changed),
    "errors_24h": len(errors),
    "tests": tests,
    "build_ok": build_ok,
    "recent_audits": audits,
    "agents_active": agents_active
}

with open(OUTPUT, "w") as f:
    json.dump(metrics, f, indent=2)

print(json.dumps(metrics, indent=2))
