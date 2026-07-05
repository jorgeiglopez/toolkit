---
name: check-exit-code
description: "Never trust the exit code of a command piped into tail, head, grep, or any filter: $? reflects the filter, not the command. Use when running or interpreting gate/build/test commands (verify, CI mirrors, test suites) whose pass/fail status matters, especially through pipes or background-task wrappers that report an exit code."
---

# Check exit code

Goal: never declare a gate GREEN based on a piped command's exit code.

## The pitfall

In a pipeline, `$?` is the exit status of the **last** command, not the one you care about:

```sh
npm run verify | tail -15   # exit 0 because tail succeeded, even if verify FAILED
```

Background-task runners and wrappers that pipe your command report "exit code 0" for the same reason. Real failure seen in the wild: `npm run verify | tail -15` returned 0 while step 4 had died with `ERR_MODULE_NOT_FOUND`. The error text was in the tail output, but the exit code lied.

## The rule

Never pipe a command whose exit code matters. Pick one:

1. **Redirect, then inspect** (preferred, portable):
   ```sh
   npm run verify > out.log 2>&1; echo "EXIT=$?"
   tail -30 out.log
   ```
2. **`set -o pipefail`** so a failure anywhere in the pipe propagates to `$?`.
3. **Ask the pipe directly**: `${PIPESTATUS[0]}` (bash) or `$pipestatus[1]` (zsh) holds the first command's status.

## Interpreting wrapper output

- An "exit code 0" from a background/wrapper run of a *piped* command is the filter's status, not your command's. Re-run capturing the real status before trusting it.
- Exit code and log must agree. If the tail shows an error but the code says 0, believe the error and get the real code.
