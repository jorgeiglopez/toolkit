#!/bin/bash
# say backend: macOS built-in `say` command.
# No install step and no process to manage, so this is the guaranteed
# fallback speak.sh falls back to when no other backend's `check` passes.
# Contract: see ../backends/README.md.

case "$1" in
  check)
    command -v say >/dev/null 2>&1
    ;;
  speak)
    say -r "${2:-200}"
    ;;
  *)
    echo "usage: $(basename "$0") {check|speak <rate>}" >&2
    exit 1
    ;;
esac
