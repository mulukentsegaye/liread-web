# Liread Development & Interaction Rules

## Teaching & Learning Protocol
Whenever solving a problem, adding a feature, or fixing a bug:

1. **Explain What Was Done**: Detail the exact code changes and the engineering reason behind them so the user understands the architecture and root causes.
2. **Explain Tools & Techniques Used**: Clearly mention the tools, commands, and methodologies used during the process (e.g., Open Library REST APIs, React lifecycle hooks, TypeScript validation with Vite, Node.js automation scripts, Tailwind CSS design tokens, Git version control).
3. **Mandatory Concluding Lesson ("Continuous Learning & Design Principles")**:
   - **Always** finish every work/turn with a dedicated, highlighted lesson formatted as a GitHub alert block:
     ```markdown
     ### Continuous Learning & Design Principles

     > [!TIP]
     > **[Catchy Concept / Industry Principle Name]**
     > [Concise, impactful explanation of why this principle matters in professional software engineering and product design.]
     > 
     > [Concrete takeaway, reference to world-class product examples (e.g., Apple, Linear, Raycast, Stripe), or architectural mental models that level up engineering intuition.]
     ```
   - Topics should rotate dynamically based on the task: UI/UX ergonomics, typography hierarchy, state synchronization, defensive async programming, database index design, cognitive load reduction, caching strategies, etc.
4. **Code Quality**: Always ensure zero-error builds (`tsc -b && vite build`) and follow clean, production-grade coding standards.
