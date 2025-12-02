#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEV_DIR="$ROOT_DIR/.dev"

HARDHAT_PORT=8545
VITE_PORT=5173

log() { echo -e "[dev-stop] $*"; }

kill_by_pidfile() {
  local name="$1"; local pidfile="$2"
  if [[ -f "$pidfile" ]]; then
    local pid
    pid=$(cat "$pidfile" || true)
    if [[ -n "${pid}" ]] && ps -p "$pid" >/dev/null 2>&1; then
      log "Stopping ${name} (PID ${pid})"
      kill "$pid" || true
      sleep 0.5
      if ps -p "$pid" >/dev/null 2>&1; then
        log "PID ${pid} still alive, sending SIGKILL"
        kill -9 "$pid" || true
      fi
    else
      log "PID file present but process not running: ${pidfile}"
    fi
    rm -f "$pidfile"
  else
    log "PID file not found: ${pidfile} (will try by port)"
  fi
}

kill_by_port() {
  local port="$1"; local name="$2"
  if lsof -t -iTCP:"${port}" -sTCP:LISTEN -P -n >/dev/null 2>&1; then
    local pids
    pids=$(lsof -t -iTCP:"${port}" -sTCP:LISTEN -P -n | tr '\n' ' ')
    log "Killing ${name} on :${port} (PIDs: ${pids})"
    kill ${pids} || true
    sleep 0.5
    if lsof -t -iTCP:"${port}" -sTCP:LISTEN -P -n >/dev/null 2>&1; then
      log "Force killing ${name} on :${port}"
      kill -9 ${pids} || true
    fi
  else
    log "${name} not listening on :${port}"
  fi
}

mkdir -p "$DEV_DIR"

kill_by_pidfile "Hardhat" "$DEV_DIR/hardhat.pid"
kill_by_pidfile "Vite" "$DEV_DIR/vite.pid"

# Fallback by port if needed
kill_by_port "$HARDHAT_PORT" "Hardhat"
kill_by_port "$VITE_PORT" "Vite"

log "Done."
