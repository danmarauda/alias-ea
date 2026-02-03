# Planning with Files + Empirica: Quick Reference

## Commands

```bash
# Initialize planning for a new task
.kimi/skills/planning-with-files/scripts/init-planning.sh "Your task name"

# Start Empirica session
session_create("your-ai-id", "development")

# Check completion
.kimi/skills/planning-with-files/scripts/check-complete.sh
```

## Empirica Assessment Lifecycle

```
PREFLIGHT (start) → [work...] → CHECK (midpoint) → [work...] → POSTFLIGHT (end)
```

### When to Submit
- **PREFLIGHT**: After requirements phase, before implementing
- **CHECK**: If task takes >30 min, or at natural midpoints
- **POSTFLIGHT**: When task is complete

## File Update Patterns

| When | Update | Empirica Action |
|------|--------|-----------------|
| Task starts | task_plan.md Phase 1 status | Create session, PREFLIGHT |
| Requirements done | task_plan.md Phase 1 complete | Log findings |
| Planning done | task_plan.md Phase 2 complete | Create goal |
| Implementation | progress.md actions | Update goal progress |
| Error encountered | progress.md errors | Log mistake |
| Task complete | All files finalize | POSTFLIGHT |

## Vector Quick Reference

High impact on work quality:
- `clarity` - How clear is the path forward?
- `coherence` - How well do pieces fit together?
- `context` - How well do I understand this codebase?

Progress indicators:
- `completion` - 0.0 to 1.0 as task progresses
- `change` - How much am I learning as I go?
- `uncertainty` - Inverse confidence (lower is better)

## Template Variables

Use in all files:
- `{{task_name}}` - Name of task
- `{{session_id}}` - Empirica session ID
- `{{start_time}}` - Task start timestamp

## Example Integration

```typescript
// 1. Create session
const session = await session_create("kimi-code-cli", "development");

// 2. Submit PREFLIGHT
await submit_preflight_assessment({
  session_id: session.session_id,
  vectors: { know: 0.6, do: 0.5, context: 0.4, /*...*/ },
  reasoning: "New feature request for React Native app"
});

// 3. Work and log findings
await finding_log({
  session_id: session.session_id,
  finding: "expo-image is better than Image from react-native",
  impact: 0.7
});

// 4. Complete
await submit_postflight_assessment({
  session_id: session.session_id,
  vectors: { know: 0.9, do: 0.85, context: 0.8, /*...*/ },
  reasoning: "Implemented successfully. Learned image optimization patterns."
});
```
