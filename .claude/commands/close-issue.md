# Close Issue

Close a GitHub issue by committing all staged and unstaged changes with a commit message that references and closes the issue.

## Arguments

Issue number: $ARGUMENTS

## Instructions

1. First, invoke the `git-context-commits` skill to ensure proper commit message formatting
2. Stage all changes (tracked and untracked files that are relevant)
3. Create a commit with a descriptive message that:
   - Summarizes what was done
   - Includes `Closes #$ARGUMENTS` or `Fixes #$ARGUMENTS` in the commit message to automatically close the issue when pushed
4. Show the user the commit that was created
5. Ask the user if they want to push the changes to close the issue on GitHub

**Important**: The commit message must include the GitHub closing keyword (Closes, Fixes, or Resolves) followed by the issue number to automatically close the issue when the commit is pushed to the default branch.