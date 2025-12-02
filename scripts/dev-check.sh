#!/usr/bin/env bash
set -euo pipefail

PORT_HARDHAT=8545
PORT_VITE=5173
RPC="http://127.0.0.1:${PORT_HARDHAT}"

log() { echo -e "[dev-check] $*"; }

check_port() {
  local port="$1"; local name="$2"
  if lsof -iTCP:"${port}" -sTCP:LISTEN -P -n >/dev/null 2>&1; then
    local pid
    pid=$(lsof -t -iTCP:"${port}" -sTCP:LISTEN -P -n | head -n1 || true)
    log "${name} listening on 127.0.0.1:${port} (PID ${pid})"
  else
    log "${name} NOT listening on 127.0.0.1:${port}"
  fi
}

check_hardhat_rpc() {
  if command -v curl >/dev/null 2>&1; then
    local v chain
    v=$(curl -s -X POST "${RPC}" -H 'Content-Type: application/json' \
      --data '{"jsonrpc":"2.0","id":1,"method":"web3_clientVersion","params":[]}') || true
    chain=$(curl -s -X POST "${RPC}" -H 'Content-Type: application/json' \
      --data '{"jsonrpc":"2.0","id":2,"method":"eth_chainId","params":[]}') || true
    if [[ "$v" == *"HardhatNetwork"* ]]; then
      log "RPC ok: ${v} | ${chain}"
    else
      log "RPC check failed or not Hardhat: ${v} | ${chain}"
    fi
  else
    log "curl not found; skipping RPC probe"
  fi
}

check_port "$PORT_HARDHAT" "Hardhat"
check_port "$PORT_VITE" "Vite/React"

# If Hardhat seems up, probe JSON-RPC
if lsof -iTCP:"${PORT_HARDHAT}" -sTCP:LISTEN -P -n >/dev/null 2>&1; then
  check_hardhat_rpc
fi
