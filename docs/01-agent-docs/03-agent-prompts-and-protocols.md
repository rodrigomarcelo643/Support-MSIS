# 03 • Agent Prompts & Operational Protocols

## 1. Interaction Patterns & Prompt Ingestion

When ingesting requests from users or external orchestration pipelines, agents must follow this verification cycle:

```text
[User Prompt Received] 
        ↓
[Visual Evidence Analysis] (Inspect attached screenshots & UI states)
        ↓
[Root Cause Localization] (Trace components via Git Diff & Grep)
        ↓
[Minimal Target Edit] (Modify only required components)
        ↓
[Static & Rollup Build Verification] (Execute: pnpm.cmd run build)
        ↓
[Concise User Status Report] (Highlight rationale, files changed, and fixes)
```

---

## 2. Handling Visual & Screenshot Feedback
When users upload UI screenshots highlighting formatting bugs:
1. **Analyze Sliced / Clipped Elements:** Look for `overflow-hidden` or `overflow-y-auto` placed incorrectly on card wrappers, pushing headers or titles past the bounding container.
2. **Inspect Spacing & Flex Directions:** Ensure responsive classes (`sm:flex-row`, `items-center`) are not accidentally wrapping sibling sections that should stack vertically (e.g. filter bars placed inline with full tables).
3. **Verify Mobile Breakpoints:** Confirm that elements do not hide essential data on mobile unless explicitly designed as an adaptive card fallback.
