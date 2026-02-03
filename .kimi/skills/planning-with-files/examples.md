# Planning with Files + Empirica: Examples

## Example 1: Adding a New Feature

### Step 1: Start Empirica Session
```typescript
session_create("kimi-code-cli", "development")
// Returns: session_id = "abc-123-def-456"
```

### Step 2: Initialize Planning Files
```bash
.kimi/skills/planning-with-files/scripts/init-planning.sh "Add user authentication"
```

This creates:
- `.kimi/planning/task_plan.md`
- `.kimi/planning/findings.md`
- `.kimi/planning/progress.md`

### Step 3: Submit PREFLIGHT Assessment
```typescript
submit_preflight_assessment({
  session_id: "abc-123-def-456",
  vectors: {
    engagement: 0.9,
    know: 0.7,        // I know auth patterns
    do: 0.6,          // But need to implement
    context: 0.5,     // New to this codebase
    clarity: 0.8,
    coherence: 0.7,
    signal: 0.8,
    density: 0.6,
    state: 0.7,
    change: 0.5,
    completion: 0.0,
    impact: 0.9,
    uncertainty: 0.4
  },
  reasoning: "Adding auth to React Native app. Familiar with patterns but need to integrate with existing codebase."
})
```

### Step 4: Work Through Phase 1 (Requirements)

**Update task_plan.md:**
```markdown
### Phase 1: Requirements & Discovery
- [x] Understand user intent
- [x] Identify constraints and requirements
- [x] Document findings in findings.md
- [x] Submit PREFLIGHT assessment
- **Status:** complete
```

**Update findings.md with research:**
```markdown
## Research Findings
- Expo SDK 55 includes expo-secure-store for token storage
- Backend API requires JWT tokens in Authorization header
- Existing user model has email/password fields

## Technical Decisions
| Decision | Rationale | Empirica Logged |
|----------|-----------|-----------------|
| Use expo-secure-store | Native secure storage, SDK 55 compatible | ✓ |
| JWT for auth | Backend already supports it | ✓ |
```

**Log to Empirica:**
```typescript
finding_log({
  session_id: "abc-123-def-456",
  finding: "expo-secure-store is the best option for token storage in Expo SDK 55",
  impact: 0.8
})
```

**Update progress.md:**
```markdown
### Phase 1: Requirements & Discovery
- **Status:** complete
- **Started:** 2026-02-04 10:00

#### Actions Taken
- Reviewed existing auth implementation
- Researched Expo secure storage options
- Documented API requirements

#### Empirica Updates
- [x] PREFLIGHT submitted
- [x] Goal created: auth-implementation-001
```

### Step 5: Submit CHECK Assessment (Mid-Task)
```typescript
submit_check_assessment({
  session_id: "abc-123-def-456",
  vectors: {
    // Updated vectors showing progress
    know: 0.85,       // Learned more
    context: 0.7,     // Better codebase understanding
    clarity: 0.9,     // Clear path forward
    // ... others
  },
  decision: "proceed"
})
```

### Step 6: Work Through Phase 2 (Planning)

**Update task_plan.md:**
```markdown
### Phase 2: Planning & Structure
- [x] Define technical approach
- [x] Create project structure if needed
- [x] Document decisions with rationale
- [x] Submit CHECK assessment (mid-task checkpoint)
- **Status:** complete
```

**Create Empirica Goal and Subtasks:**
```typescript
create_goal({
  session_id: "abc-123-def-456",
  objective: "Implement user authentication with JWT tokens",
  success_criteria: [
    "Login screen with email/password",
    "Token storage in secure storage",
    "Auth context for app-wide state",
    "Protected routes"
  ]
})

add_subtask({
  goal_id: "auth-goal-001",
  description: "Create auth service with login/logout",
  importance: "critical"
})
```

### Step 7: Handle an Error

**You encounter an error:**
```
Error: Cannot find native module 'ExpoSecureStore'
```

**Update task_plan.md:**
```markdown
## Errors & Mistakes
| Error | Attempt | Resolution | Empirica Logged |
|-------|---------|------------|-----------------|
| ExpoSecureStore not found | 1 | Need to rebuild dev client | ✓ |
```

**Log to Empirica:**
```typescript
mistake_log({
  session_id: "abc-123-def-456",
  mistake: "Added expo-secure-store but didn't rebuild development client",
  why_wrong: "Native modules require native rebuild in Expo development builds",
  prevention: "Always run 'eas build' after adding native modules",
  cost_estimate: "15 minutes",
  root_cause_vector: "DO"
})
```

**Update progress.md:**
```markdown
## Error Log
| Timestamp | Error | Attempt | Resolution | Empirica Mistake ID |
|-----------|-------|---------|------------|---------------------|
| 2026-02-04 11:30 | ExpoSecureStore not found | 1 | Rebuild dev client | mistake-001 |
```

### Step 8: Complete and POSTFLIGHT

**Update progress.md with final state:**
```markdown
## Empirica Session Summary

### Learning Delta
| Vector | Before | After | Change |
|--------|--------|-------|--------|
| KNOW   | 0.7    | 0.9   | +0.2   |
| DO     | 0.6    | 0.85  | +0.25  |
| CONTEXT| 0.5    | 0.8   | +0.3   |
| CLARITY| 0.8    | 0.95  | +0.15  |
| UNCERTAINTY | 0.4 | 0.2 | -0.2   |

### Key Findings
- expo-secure-store best practice: always rebuild after adding
- JWT refresh pattern: store refresh token, use access token short-term
```

**Submit POSTFLIGHT:**
```typescript
submit_postflight_assessment({
  session_id: "abc-123-def-456",
  vectors: {
    // Final state
    engagement: 0.95,
    know: 0.9,
    do: 0.85,
    context: 0.8,
    clarity: 0.95,
    coherence: 0.9,
    signal: 0.9,
    density: 0.85,
    state: 0.9,
    change: 0.8,
    completion: 1.0,
    impact: 0.95,
    uncertainty: 0.2
  },
  reasoning: "Successfully implemented auth. Learned native module rebuild requirement. Clear understanding of JWT flow in React Native now."
})
```

---

## Example 2: Refactoring Session

### Quick Session (No Complex Planning)

For simple refactors, you might skip detailed phases but still track:

```typescript
// Just create session and work
session_create("kimi-code-cli", "development")

// Work on refactor...

// Log key finding
finding_log({
  session_id: "...",
  finding: "Extracted Button component - reduces duplication by 40%",
  impact: 0.7
})

// Submit POSTFLIGHT
submit_postflight_assessment({...})
```

---

## Integration Checklist

- [ ] Created Empirica session
- [ ] Initialized planning files (init-planning.sh)
- [ ] Submitted PREFLIGHT assessment
- [ ] Updated task_plan.md with phases
- [ ] Working through phases...
- [ ] Logging findings to both systems
- [ ] Updated progress.md regularly
- [ ] Submitted CHECK assessment (if long task)
- [ ] Submitted POSTFLIGHT assessment
- [ ] Reviewed learning delta
