# Fix GitHub Issue

You are tasked with fixing or implementing GitHub issue **#$ARGUMENTS**.

## Instructions

Follow these steps carefully:

### Step 1: Fetch and Analyze the Issue

First, fetch the issue details from GitHub:

```bash
gh issue view $ARGUMENTS --json title,body,labels,assignees,comments,state
```

Analyze the issue to understand:
- What is the problem or feature request?
- What are the acceptance criteria?
- Which parts of the codebase are likely affected?

### Step 2: Investigate the Codebase

Search the codebase to find:
- Relevant files that need modification
- Related code patterns to follow
- Tests that may need updating

Use the TodoWrite tool to track all tasks needed to complete this issue.

### Step 3: Implement the Fix/Feature

Make the necessary code changes. After completing each significant milestone, post a checkpoint comment:

```bash
gh issue comment $ARGUMENTS --body "## Checkpoint: [Milestone Name]

**Completed:**
- [List of completed items]

**Files Modified:**
- [List of files changed]

**Next Steps:**
- [What remains to be done]"
```

### Step 4: Post Completion Comment

Once all work is complete, post a final summary comment:

```bash
gh issue comment $ARGUMENTS --body "## Implementation Complete

**Summary of Changes:**
[Describe what was changed and why]

**Files Modified:**
[List all files that were modified]

**Testing:**
[Describe testing performed and results]

**Notes:**
[Any additional notes for reviewers or users]

---
Ready for review and merge."
```
## Important Guidelines

- Always read and understand code before modifying it
- Follow existing code patterns and conventions in the codebase
- Keep changes focused on the issue - avoid scope creep
- Post checkpoint comments after significant progress (not too frequently)
- If you encounter blockers or need clarification, mention it in a comment
- Ensure all tests pass before marking as complete