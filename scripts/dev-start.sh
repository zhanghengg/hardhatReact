#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEV_DIR="$ROOT_DIR/.dev"
mkdir -p "$DEV_DIR"

HARDHAT_PORT=8545
VITE_PORT=5173

log() { echo -e "[dev-start] $*"; }

is_listening() {
  local port="$1"
  lsof -iTCP:"${port}" -sTCP:LISTEN -P -n >/dev/null 2>&1
}

wait_for_port() {
  local port="$1"; local name="$2"; local timeout="${3:-15}"; local waited=0
  while ! is_listening "$port"; do
    sleep 0.5
    waited=$((waited+1))
    if [ $((waited/2)) -ge "$timeout" ]; then
      log "Timeout waiting for ${name} on :${port}"
      return 1
    fi
  done
  return 0
}

start_hardhat() {
  if is_listening "$HARDHAT_PORT"; then
    log "Hardhat already listening on :$HARDHAT_PORT, skipping start"
    return 0
  fi
  log "Starting Hardhat node on :$HARDHAT_PORT ..."
  (
    cd "$ROOT_DIR/contracts"
    nohup npx hardhat node --hostname 127.0.0.1 --port "$HARDHAT_PORT" \
      >"$DEV_DIR/hardhat.log" 2>&1 & echo $! >"$DEV_DIR/hardhat.pid"
  )
  if wait_for_port "$HARDHAT_PORT" "Hardhat" 15; then
    log "Hardhat started (PID $(cat "$DEV_DIR/hardhat.pid"))"
  else
    log "Failed to start Hardhat; see $DEV_DIR/hardhat.log"
    exit 1
  fi
}

start_vite() {
  if is_listening "$VITE_PORT"; then
    log "Vite already listening on :$VITE_PORT, skipping start"
    return 0
  fi
  log "Starting Vite dev server on :$VITE_PORT ..."
  (
    cd "$ROOT_DIR/frontend"
    # Ensure node_modules exist
    if [ ! -d node_modules ]; then
      log "node_modules not found; running npm install (this may take a while)"
      npm install
    fi
    nohup npm run dev -- --port "$VITE_PORT" \
      >"$DEV_DIR/vite.log" 2>&1 & echo $! >"$DEV_DIR/vite.pid"
  )
  if wait_for_port "$VITE_PORT" "Vite" 15; then
    log "Vite started (PID $(cat "$DEV_DIR/vite.pid"))"
  else
    log "Failed to start Vite; see $DEV_DIR/vite.log"
    exit 1
  fi
}

start_hardhat
deploy_contracts() {
  # 1) Compile to refresh artifacts & ABI
  (
    cd "$ROOT_DIR/contracts"
    npx hardhat compile >"$DEV_DIR/compile.log" 2>&1 || {
      log "Compile failed; see $DEV_DIR/compile.log"; exit 1; }
  )

  # 2) Compute artifact hash for Counter to detect code changes
  local artifact="$ROOT_DIR/contracts/artifacts/contracts/Counter.sol/Counter.json"
  if [ ! -f "$artifact" ]; then
    log "Artifact not found: $artifact"; exit 1; fi
  local hasher
  if command -v shasum >/dev/null 2>&1; then
    hasher='shasum -a 256'
  elif command -v sha256sum >/dev/null 2>&1; then
    hasher='sha256sum'
  else
    log "No sha256 tool found (need shasum or sha256sum)"; exit 1
  fi
  local cur_hash
  cur_hash=$(cat "$artifact" | $hasher | awk '{print $1}')
  local hash_file="$DEV_DIR/counter.artifact.sha256"
  local prev_hash=""
  [ -f "$hash_file" ] && prev_hash=$(cat "$hash_file") || true

  # 3) Try to read saved address from frontend
  local constants_ts="$ROOT_DIR/frontend/src/constants.ts"
  local saved_addr=""
  if [ -f "$constants_ts" ]; then
    saved_addr=$(grep -Eo '0x[0-9a-fA-F]{40}' "$constants_ts" | head -n1 || true)
  fi

  # 4) If address exists, probe chain code via JSON-RPC eth_getCode
  local code="0x"
  if [ -n "$saved_addr" ]; then
    code=$(curl -s -X POST "http://127.0.0.1:$HARDHAT_PORT" -H 'Content-Type: application/json' \
      --data '{"jsonrpc":"2.0","id":1,"method":"eth_getCode","params":["'"$saved_addr"'", "latest"]}' \
      | sed -n 's/.*"result"\s*:\s*"\(0x[^"]*\)".*/\1/p') || true
    [ -z "$code" ] && code="0x"
  fi

  # 5) Decide whether to deploy
  local need_deploy=0
  if [ -z "$saved_addr" ] || [ "$code" = "0x" ]; then
    need_deploy=1
    log "No live contract detected on chain (addr=$saved_addr, code=$code)"
  fi
  if [ "$cur_hash" != "$prev_hash" ]; then
    need_deploy=1
    log "Artifact changed, will deploy (prev=${prev_hash:-none}, cur=$cur_hash)"
  fi

  if [ "$need_deploy" -eq 1 ]; then
    log "Deploying contracts to localhost..."
    (
      cd "$ROOT_DIR/contracts"
      nohup npx hardhat run scripts/deploy.ts --network localhost \
        >"$DEV_DIR/deploy.log" 2>&1 || {
          log "Deploy failed; see $DEV_DIR/deploy.log"; exit 1; }
    )
    echo "$cur_hash" > "$hash_file"
    log "Deploy finished. See $DEV_DIR/deploy.log"
  else
    log "Skip deploy: on-chain code exists and artifact unchanged"
  fi
}

# Ensure Hardhat is up, then deploy, then start Vite
if ! is_listening "$HARDHAT_PORT"; then
  wait_for_port "$HARDHAT_PORT" "Hardhat" 15 || { log "Hardhat not ready; aborting"; exit 1; }
fi
deploy_contracts
start_vite

log "Done. Logs: $DEV_DIR/hardhat.log, $DEV_DIR/vite.log"
