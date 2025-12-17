---
name: git-context-commits
description: Enforce descriptive git commit messages that preserve AI-assisted coding context. Use when committing changes, saving progress, making checkpoints, or completing vibe coding tasks. Ensures commits capture WHAT was done, WHY it was done, and the conversation context for future reference.
---

# Git Context Commits

## Purpose

Enforce structured, descriptive git commit messages that preserve the full context of AI-assisted coding sessions. This skill ensures that each commit serves as a documentation checkpoint, capturing not just code changes but the intent, decisions, and reasoning behind them.

## When to Use

This skill activates when:
- User asks to commit changes or save progress
- Completing a coding task or feature
- Creating a checkpoint in vibe coding sessions
- Any git commit operation

## Commit Message Structure

### Required Format

```
<type>(<scope>): <short summary>

## What Changed
- Bullet points of specific changes made
- File modifications, additions, deletions
- Technical implementation details

## Why / Intent
- The goal or problem being solved
- User's original request or requirement
- Reasoning behind implementation choices

## Context
- Key decisions made during implementation
- Alternatives considered (if any)
- Dependencies or prerequisites
- Related issues or follow-up tasks

---
AI-Assisted: Yes
Session-Context: <brief session identifier or task reference>
```

### Commit Types

| Type | Description |
|------|-------------|
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `refactor` | Code restructuring without behavior change |
| `style` | Formatting, whitespace, naming |
| `docs` | Documentation changes |
| `test` | Adding or modifying tests |
| `chore` | Build, config, tooling changes |
| `wip` | Work in progress checkpoint |

### Example Commit Messages

**Feature Addition:**
```
feat(auth): add OAuth2 login with Google provider

## What Changed
- Added GoogleOAuthProvider component in src/auth/providers/
- Created OAuth callback handler at /api/auth/callback/google
- Updated AuthContext to support OAuth tokens
- Added environment variables for Google client credentials

## Why / Intent
User requested social login to reduce friction in signup flow.
Chose Google as primary provider due to user base demographics.

## Context
- Considered Auth0 but opted for direct implementation for simplicity
- Token refresh logic follows existing JWT pattern
- Needs follow-up: Add Apple Sign-In for iOS users

---
AI-Assisted: Yes
Session-Context: Implementing social login feature
```

**Bug Fix:**
```
fix(editor): resolve crash when loading large files

## What Changed
- Added chunked loading in FileLoader.cs:142
- Implemented virtual scrolling for frame list
- Added memory threshold check before loading

## Why / Intent
Users reported crashes when opening GIFs > 500 frames.
Root cause: Loading all frames into memory at once.

## Context
- Tested with 2000-frame file, memory usage reduced 80%
- Chunked loading threshold set to 100 frames
- Virtual scrolling reuses existing ListView component

---
AI-Assisted: Yes
Session-Context: Fixing large file memory issue
```

**Work-in-Progress:**
```
wip(feature): partial implementation of export presets

## What Changed
- Created PresetManager class structure
- Added preset selection UI (incomplete)
- Stubbed out preset save/load methods

## Why / Intent
Building export preset system per user request.
Committing checkpoint before switching to bug fix.

## Context
- Next steps: Implement preset serialization
- UI needs styling pass
- Will continue in next session

---
AI-Assisted: Yes
Session-Context: Export presets feature - checkpoint 1
```

## Guidelines for AI-Assisted Commits

### DO:
- Capture the user's original request in "Why / Intent"
- List ALL files modified in "What Changed"
- Note any decisions or tradeoffs discussed
- Include session context for continuity
- Use `wip` type for incomplete work checkpoints

### DON'T:
- Use vague messages like "fixed stuff" or "updates"
- Omit the reasoning behind changes
- Skip the context section for complex changes
- Forget to mark AI-assisted commits

### Context Preservation Tips

1. **Reference the Task**: Include what the user asked for
2. **Document Decisions**: Note why specific approaches were chosen
3. **Flag Incomplete Work**: Use `wip` and list remaining tasks
4. **Link Related Changes**: Reference previous commits if part of a series
5. **Note Dependencies**: Mention if changes require other work

## Quick Reference

### Minimal Commit (Simple Changes)
```
<type>(<scope>): <summary>

- Change 1
- Change 2

AI-Assisted: Yes
```

### Full Commit (Complex Changes)
```
<type>(<scope>): <summary>

## What Changed
- Detailed changes

## Why / Intent
- Reasoning

## Context
- Decisions and notes

---
AI-Assisted: Yes
Session-Context: <reference>
```

## Integration with Workflow

When committing during vibe coding:

1. **Before Commit**: Review all staged changes
2. **Gather Context**: Recall the user's request and decisions made
3. **Structure Message**: Use the format above
4. **Validate**: Ensure message would help future-you understand the change
5. **Commit**: Execute with the structured message

This skill ensures your git history becomes a valuable documentation resource, not just a series of cryptic snapshots.