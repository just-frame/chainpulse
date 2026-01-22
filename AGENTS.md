# Project Agents

Index of specialized agents for this project.

---

## Available Agents

| Agent | File | Purpose |
|-------|------|---------|
| **QA Agent** | [`agents/QA_AGENT.md`](agents/QA_AGENT.md) | UI/UX, security, and code quality review |

---

## How to Use

Reference the agent file when spawning:

```
"Run the QA agent on this project"
"Review this using agents/QA_AGENT.md"
```

Or for Claude Code, the agent specs are auto-loaded from this directory.

---

## Adding New Agents

1. Create `agents/[AGENT_NAME].md`
2. Add entry to this index
3. Follow the template structure:
   - Purpose
   - When to use
   - Trigger phrases
   - Detailed spec
   - Output format
   - Customization options

---

## Agent Ideas (Not Yet Created)

- **Implementation Agent** - Build features end-to-end
- **Research Agent** - Investigate APIs and compare options
- **Performance Agent** - Bundle size, render performance, Core Web Vitals
- **Copy Agent** - Review UI text for clarity and tone
