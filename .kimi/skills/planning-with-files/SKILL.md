# Planning with Files + Empirica CASCADE

A hybrid planning system that combines **Manus-style persistent markdown files** with **Empirica's epistemic tracking**.

## Why Both?

| Empirica | Planning with Files |
|----------|---------------------|
| Epistemic state tracking (13 vectors) | Task breakdown (phases/checklists) |
| Session lifecycle (PREFLIGHT/CHECK/POSTFLIGHT) | Persistent progress logging |
| Findings/Unknowns/Mistakes/Dead-ends | Research findings & decisions |
| Goal/Subtask system | Visual phase tracking |

**Together:** Empirica tracks *how well you know*, Planning with Files tracks *what you're doing*.

## Quick Start

### 1. Create Empirica Session
```bash
# Already done - this activates epistemic tracking
session_create("kimi-code-cli", "development")
```

### 2. Create Planning Files
```bash
# Creates task_plan.md, findings.md, progress.md in .kimi/planning/
planning-init "Your Task Description"
```

### 3. Work with Both Systems

**Empirica tracks:**
- PREFLIGHT self-assessment (13 epistemic vectors)
- CHECK rounds (am I on track?)
- POSTFLIGHT learning deltas
- Mistakes, Unknowns, Findings, Dead-ends

**Planning Files track:**
- Task phases and progress
- Research findings
- Decisions with rationale
- Error logs

## Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    START SESSION                            │
├─────────────────────────────────────────────────────────────┤
│  1. Empirica: session_create()                              │
│  2. Planning: Create task_plan.md, findings.md, progress.md │
│  3. Empirica: submit_preflight_assessment()                 │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      WORK LOOP                              │
├─────────────────────────────────────────────────────────────┤
│  1. Read task_plan.md → What phase am I in?                 │
│  2. Empirica: create_goal() or add_subtask()               │
│  3. Work on task...                                         │
│  4. Update progress.md → Log what you did                   │
│  5. Empirica: finding_log() or mistake_log()               │
│  6. Update task_plan.md → Mark items complete               │
│  7. Empirica: submit_check_assessment() (optional)         │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   END SESSION                               │
├─────────────────────────────────────────────────────────────┤
│  1. Update findings.md → Capture key learnings              │
│  2. Empirica: submit_postflight_assessment()               │
│  3. Review learning delta                                   │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
.kimi/
├── planning/                    # Planning with Files directory
│   ├── task_plan.md            # Task breakdown & phases
│   ├── findings.md             # Research & decisions
│   └── progress.md             # Session log
└── skills/
    └── planning-with-files/    # This skill
        ├── SKILL.md
        └── templates/
            ├── task_plan.md
            ├── findings.md
            └── progress.md
```

## Commands

| Command | Description |
|---------|-------------|
| `planning-init "Task Name"` | Create planning files for new task |
| `planning-status` | Show current phase and progress |
| `planning-next` | Mark current phase complete, start next |

## Integration Points

### From Empirica to Planning Files

When you log something in Empirica, also update planning files:

```typescript
// Empirica: Log a finding
finding_log(session_id, "Discovered React 19 batching affects timing")

// Planning: Add to findings.md
// "React 19 automatic batching changes how state updates fire"
```

```typescript
// Empirica: Log a mistake
mistake_log(session_id, "Used setState in render", "KNOW")

// Planning: Add to task_plan.md Errors table
// | Used setState in render | 1 | Move to useEffect |
```

### From Planning Files to Empirica

When you complete a phase, update Empirica:

```markdown
<!-- progress.md -->
### Phase 2: Planning
- **Status:** complete  ← Mark this done
```

```typescript
// Empirica: Complete subtask
complete_subtask(subtask_id, "Phase 2 planning complete")
```

## The 2-Action Rule (Adapted)

After every **2 significant operations** (read code, search docs, view files):

1. **Update findings.md** - What did you discover?
2. **Update Empirica** - Log any new findings/unknowns
3. **Check task_plan.md** - Are you still on track?

## Templates

Use the templates in `.kimi/skills/planning-with-files/templates/`:

- `task_plan.md` - Break work into phases
- `findings.md` - Store research discoveries
- `progress.md` - Log session activities

## Best Practices

1. **Create planning files AFTER Empirica session** - Session first, then plan
2. **Update both systems together** - Don't let them drift apart
3. **Use Empirica for epistemic state** - Uncertainty, confidence, learning
4. **Use Planning Files for task state** - Phases, progress, decisions
5. **Cross-reference** - Link between findings.md and Empirica findings

## Example Session

```typescript
// 1. Start Empirica session
session_create("kimi-code-cli", "development")

// 2. Create planning files (auto-generated from templates)
// .kimi/planning/task_plan.md
// .kimi/planning/findings.md
// .kimi/planning/progress.md

// 3. PREFLIGHT - assess epistemic state
submit_preflight_assessment(session_id, vectors, reasoning)

// 4. Work on Phase 1
// - Read files
// - Update findings.md with discoveries
// - Log Empirica findings

// 5. CHECK - are we on track?
submit_check_assessment(session_id, vectors, "proceed")

// 6. Complete phase, update both systems
// - Mark Phase 1 complete in task_plan.md
// - complete_subtask() in Empirica

// 7. POSTFLIGHT - what did we learn?
submit_postflight_assessment(session_id, vectors, reasoning)
```

---

**Integration Version:** 1.0.0  
**Empirica Version:** Compatible with CASCADE  
**Planning with Files Version:** Based on Manus pattern
