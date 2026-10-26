# Liread Development & Interaction Rules

## Teaching & Learning Protocol
Whenever solving a problem, adding a feature, or fixing a bug:

1. **Explain What Was Done**: Detail the exact code changes and the engineering reason behind them so the user understands the architecture and root causes.
2. **Explain Tools & Techniques Used**: Clearly mention the tools, commands, and methodologies used during the process (e.g., Open Library REST APIs, React lifecycle hooks, TypeScript validation with Vite, Node.js automation scripts, Tailwind CSS design tokens, Git version control).
3. **Code Quality**: Always ensure zero-error builds (`tsc -b && vite build`) and follow clean, production-grade coding standards.

## Security & Confidentiality Rules (Strictly Enforced)
1. **NEVER Stage or Push Environment Files**: Under no circumstances should any agent stage, commit, or push `.env`, `.env.example`, `.env.local`, or any file matching `*.env*`.
2. **Zero Hardcoded Secrets**: Never hardcode confidential chat IDs, personal user IDs, channel IDs, API tokens, service role keys, or database passwords in source code or template files.
3. **Vercel & Production Credentials**: Vercel does NOT require or read `.env` from Git. All environment variables must be configured securely through the Vercel Project Dashboard (`Settings -> Environment Variables`) and uncommitted local `.env`.
4. **Pre-commit Audit**: Always verify `git status` and staged diffs before committing to guarantee no confidential data, environment variables, or unintended files are tracked.
