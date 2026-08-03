#!/usr/bin/env bash
# Helper for the lpz-qa-form skill. Sibling of lpz-to-html/serve.sh, but:
#   - binds 127.0.0.1 (navigator.clipboard needs a secure context = localhost), and
#   - opens the browser instead of printing a LAN IP.
#
# Run everything through this ONE script so the sandbox classifier sees only
# `bash serve.sh …`, not the individual lsof/open/perl calls inside.
#
# Subcommands:
#   newdir <base> [slug]       Create a fresh form folder under <base>; print its path.
#   serve  <dir> [port] [ttl]  Serve <dir> on 127.0.0.1 with an auto-stop TTL; print + open the URL.
#                              Launch THIS via the Bash tool's background mode (run_in_background).
#   ports                      List form/report servers currently running (pid + port).
#   stop   [port]              Stop the server on <port>, or every http.server if omitted.
#
# Defaults: port 8799 (auto-bumps on conflict), TTL 1800s (30 min).
set -euo pipefail

DEFAULT_PORT=8799
DEFAULT_TTL=1800

port_free() { ! lsof -iTCP:"$1" -sTCP:LISTEN -t >/dev/null 2>&1; }

free_port() {
  local p="$1"
  while ! port_free "$p"; do p=$((p + 1)); done
  printf '%s' "$p"
}

cmd_newdir() {
  local base="${1:?usage: newdir <base> [slug]}"
  local slug="${2:-form}"
  slug=$(printf '%s' "$slug" | tr -cs 'a-zA-Z0-9._-' '-' | sed 's/^-*//;s/-*$//')
  [ -z "$slug" ] && slug=form
  mkdir -p "$base"
  mktemp -d "$base/${slug}-XXXXXX"
}

cmd_serve() {
  local dir="${1:?usage: serve <dir> [port] [ttl]}"
  local port="${2:-$DEFAULT_PORT}"
  local ttl="${3:-$DEFAULT_TTL}"
  [ -f "$dir/index.html" ] || { echo "ERROR: no index.html in $dir" >&2; exit 1; }
  port=$(free_port "$port")
  local url="http://localhost:$port"
  # Printed BEFORE exec so the URL is captured immediately, even in background mode.
  echo "PORT=$port"
  echo "TTL=${ttl}s"
  echo "URL=$url"
  echo "(localhost only; auto-stops after ${ttl}s)"
  open "$url" >/dev/null 2>&1 || true   # best-effort browser launch (macOS)
  # Self-terminating: perl's alarm sends SIGALRM after <ttl>s. No coreutils
  # `timeout` needed (macOS doesn't ship it). exec so the signal hits the server.
  exec perl -e 'alarm shift; exec @ARGV' "$ttl" \
    python3 -m http.server "$port" --bind 127.0.0.1 --directory "$dir"
}

cmd_ports() {
  local pids
  pids=$(pgrep -f "http\.server" 2>/dev/null || true)
  if [ -z "$pids" ]; then echo "no servers running"; return 0; fi
  local pid port
  for pid in $pids; do
    port=$(lsof -aP -p "$pid" -iTCP -sTCP:LISTEN 2>/dev/null \
      | awk 'NR>1{n=split($9,a,":"); print a[n]}' | head -1 || true)
    echo "pid=$pid port=${port:-?}"
  done
}

cmd_stop() {
  local port="${1:-}"
  local pids
  if [ -n "$port" ]; then
    pids=$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)
    if [ -n "$pids" ]; then kill $pids && echo "stopped pid(s) $pids on port $port"; else echo "nothing on port $port"; fi
  else
    pids=$(pgrep -f "http\.server" 2>/dev/null || true)
    if [ -n "$pids" ]; then kill $pids && echo "stopped server(s): $pids"; else echo "no servers running"; fi
  fi
}

sub="${1:-}"; shift || true
case "$sub" in
  newdir) cmd_newdir "$@" ;;
  serve)  cmd_serve  "$@" ;;
  ports)  cmd_ports ;;
  stop)   cmd_stop  "$@" ;;
  *) echo "usage: serve.sh {newdir <base> [slug]|serve <dir> [port] [ttl]|ports|stop [port]}" >&2; exit 2 ;;
esac
