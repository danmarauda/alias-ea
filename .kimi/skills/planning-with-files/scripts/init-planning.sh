#!/bin/bash

# Initialize Planning Files for a New Task
# Usage: init-planning.sh "Task Name"

set -e

TASK_NAME="${1:-Untitled Task}"
PLANNING_DIR=".kimi/planning"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M")

# Create directory if needed
mkdir -p "$PLANNING_DIR"

echo "📝 Initializing planning files for: $TASK_NAME"
echo "📁 Location: $PLANNING_DIR/"

# Create task_plan.md
if [ ! -f "$PLANNING_DIR/task_plan.md" ]; then
cat > "$PLANNING_DIR/task_plan.md" << 'EOF'
# Task Plan: {{task_name}}

> Started: {{start_time}}  
> Session: {{session_id}}  
> Status: 🟡 in_progress

---

## Objective
<!-- State clearly: what are we trying to achieve? -->

{{task_name}}

### Success Criteria
<!-- What does "done" look like? -->
- [ ] 
- [ ] 
- [ ] 

---

## Phases

### Phase 1: Requirements & Discovery
- [ ] Understand user intent
- [ ] Identify constraints and requirements
- [ ] Document findings in findings.md
- [ ] Submit PREFLIGHT assessment
- **Status:** pending

### Phase 2: Planning & Structure
- [ ] Define technical approach
- [ ] Create project structure if needed
- [ ] Document decisions with rationale
- [ ] Submit CHECK assessment (mid-task checkpoint)
- **Status:** pending

### Phase 3: Implementation
- [ ] Execute the plan step by step
- [ ] Test incrementally
- [ ] Log discoveries and changes to plan
- [ ] Update progress.md with each action
- **Status:** pending

### Phase 4: Verification & Handoff
- [ ] Verify against success criteria
- [ ] Update findings.md with lessons learned
- [ ] Submit POSTFLIGHT assessment
- [ ] Mark complete in progress.md
- **Status:** pending

---

## Decisions Log
| Decision | Rationale | Empirica Link |
|----------|-----------|---------------|
| | | |

## Changes to Plan
| Phase | Original | Changed To | Reason |
|-------|----------|------------|--------|
| | | | |

## Blockers
| Issue | Status | Resolution | Empirica Unknown ID |
|-------|--------|------------|---------------------|
| | | | |

## Errors & Mistakes
| Error | Attempt | Resolution | Empirica Mistake ID |
|-------|---------|------------|---------------------|
| | | | |
EOF
    echo "✅ Created: task_plan.md"
else
    echo "⚠️  task_plan.md already exists"
fi

# Create findings.md
if [ ! -f "$PLANNING_DIR/findings.md" ]; then
cat > "$PLANNING_DIR/findings.md" << 'EOF'
# Findings: {{task_name}}

> Session: {{session_id}}  
> Auto-synced with Empirica findings database

---

## Key Discoveries

### Technical Findings
<!-- What did you learn about the technology? -->
| Finding | Impact | Empirica Link |
|---------|--------|---------------|
| | | |

### Codebase Insights
<!-- What patterns or structure did you discover? -->
| Insight | Location | Empirica Link |
|---------|----------|---------------|
| | | |

### Research Results
<!-- What did external research reveal? -->
| Source | Key Point | Applied? |
|--------|-----------|----------|
| | | |

---

## Decisions Made

### Architecture Decisions
| Decision | Alternatives Considered | Chosen Because |
|----------|------------------------|----------------|
| | | |

### Implementation Decisions
| Decision | Trade-offs | Empirica Logged |
|----------|------------|-----------------|
| | | |

---

## Lessons Learned

### What Worked Well
- 

### What to Avoid
- 

### Patterns to Reuse
- 
EOF
    echo "✅ Created: findings.md"
else
    echo "⚠️  findings.md already exists"
fi

# Create progress.md
if [ ! -f "$PLANNING_DIR/progress.md" ]; then
cat > "$PLANNING_DIR/progress.md" << 'EOF'
# Progress: {{task_name}}

> Session: {{session_id}}  
> Start: {{start_time}}

---

## Current Status

**Overall Progress:** 0% complete

| Phase | Status | Started | Completed |
|-------|--------|---------|-----------|
| Phase 1: Requirements | pending | | |
| Phase 2: Planning | pending | | |
| Phase 3: Implementation | pending | | |
| Phase 4: Verification | pending | | |

---

## Action Log

### Phase 1: Requirements & Discovery
- **Status:** pending
- **Started:** 

#### Actions Taken
<!-- Log each significant action with timestamp -->
- [ ] 

#### Empirica Updates
<!-- Check off when logged to Empirica -->
- [ ] Session created
- [ ] PREFLIGHT submitted

---

### Phase 2: Planning & Structure
- **Status:** pending
- **Started:** 

#### Actions Taken
- [ ] 

#### Empirica Updates
- [ ] Goal created
- [ ] CHECK assessment submitted

---

### Phase 3: Implementation
- **Status:** pending
- **Started:** 

#### Actions Taken
- [ ] 

#### Empirica Updates
- [ ] Subtasks added
- [ ] Findings logged
- [ ] Mistakes logged

---

### Phase 4: Verification & Handoff
- **Status:** pending
- **Started:** 

#### Actions Taken
- [ ] 

#### Empirica Updates
- [ ] POSTFLIGHT submitted
- [ ] Goal marked complete

---

## Error Log
| Timestamp | Error | Attempt | Resolution | Empirica Mistake ID |
|-----------|-------|---------|------------|---------------------|
| | | | | |

## Unknowns Discovered
| Question | Status | Resolution | Empirica Unknown ID |
|----------|--------|------------|---------------------|
| | | | |

## Empirica Session Summary

### Learning Delta
| Vector | Before (PREFLIGHT) | After (POSTFLIGHT) | Change |
|--------|-------------------|-------------------|--------|
| ENGAGEMENT | | | |
| KNOW | | | |
| DO | | | |
| CONTEXT | | | |
| CLARITY | | | |
| COHERENCE | | | |
| SIGNAL | | | |
| DENSITY | | | |
| STATE | | | |
| CHANGE | | | |
| COMPLETION | | | |
| IMPACT | | | |
| UNCERTAINTY | | | |

### Key Findings Summary
<!-- Copied from findings.md at completion -->

### Recommendations for Future Sessions
<!-- What would you do differently? -->
EOF
    echo "✅ Created: progress.md"
else
    echo "⚠️  progress.md already exists"
fi

# Replace template variables
find "$PLANNING_DIR" -name "*.md" -exec sed -i '' "s/{{task_name}}/$TASK_NAME/g" {} \;
find "$PLANNING_DIR" -name "*.md" -exec sed -i '' "s/{{start_time}}/$TIMESTAMP/g" {} \;
find "$PLANNING_DIR" -name "*.md" -exec sed -i '' "s/{{session_id}}/TBD/g" {} \;

echo ""
echo "✨ Planning files initialized!"
echo ""
echo "Next steps:"
echo "  1. Create Empirica session: session_create('your-ai-id', 'development')"
echo "  2. Update {{session_id}} in all .md files"
echo "  3. Submit PREFLIGHT assessment"
echo "  4. Start Phase 1: Requirements & Discovery"
echo ""
echo "Files created:"
ls -la "$PLANNING_DIR/"
