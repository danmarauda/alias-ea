#!/bin/bash

# Check if planning files are complete
# Usage: check-complete.sh

set -e

PLANNING_DIR=".kimi/planning"

if [ ! -d "$PLANNING_DIR" ]; then
    echo "❌ Planning directory not found: $PLANNING_DIR"
    echo "   Run init-planning.sh first"
    exit 1
fi

echo "🔍 Checking planning files in $PLANNING_DIR/"
echo ""

# Check each file exists
FILES=("task_plan.md" "findings.md" "progress.md")
ALL_EXIST=true

for file in "${FILES[@]}"; do
    if [ -f "$PLANNING_DIR/$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        ALL_EXIST=false
    fi
done

echo ""

# Count pending items
if [ -f "$PLANNING_DIR/task_plan.md" ]; then
    PENDING=$(grep -c "^- \[ \]" "$PLANNING_DIR/task_plan.md" || echo "0")
    COMPLETED=$(grep -c "^- \[x\]" "$PLANNING_DIR/task_plan.md" || echo "0")
    echo "📊 Task Plan Progress:"
    echo "   Pending: $PENDING"
    echo "   Completed: $COMPLETED"
fi

# Check phase status
if [ -f "$PLANNING_DIR/task_plan.md" ]; then
    echo ""
    echo "📋 Phase Status:"
    grep "### Phase" "$PLANNING_DIR/task_plan.md" | while read -r line; do
        echo "   $line"
    done
fi

# Summary
echo ""
if [ "$ALL_EXIST" = true ]; then
    echo "✨ All planning files present"
    
    # Check for session ID
    if grep -q "{{session_id}}" "$PLANNING_DIR"/*.md; then
        echo "⚠️  Remember to update {{session_id}} with actual Empirica session ID"
    fi
else
    echo "⚠️  Some planning files are missing"
fi
