#!/usr/bin/env bash
#
# Runs the Nuxt 4 site's parity tests against the Nuxt 2 oracle.
#
# The oracle is checked out into a git worktree (default:
# .worktrees/nuxt2-baseline), its dependencies are installed from its own
# lockfile, and both servers are started before `npm run test:parity` runs.
# The full download matrix (every fixture × every export plugin) runs after
# the default suite.
#
# Usage:
#   scripts/parity.sh                 # build the new site, run both suites
#   scripts/parity.sh --prepare       # only create/fetch the baseline worktree
#   scripts/parity.sh --help
#
# Environment:
#   BASELINE_REF       Git ref of the Nuxt 2 oracle. Defaults to
#                      upstream/master, then origin/master, then master.
#   BASELINE_DIR       Worktree directory for the oracle.
#   PARITY_NEW_MODE    `build` (default) starts the production Nitro server,
#                      `dev` starts `nuxt dev` instead.
#   PARITY_FULL_MATRIX `0` skips the full download matrix.
#   PARITY_LOG_DIR     Directory for the server logs (default: tmp/parity).
#
# Both servers must be able to listen on ports 3000 (new site) and 3001
# (oracle), because `npm run test:parity` pins those URLs.

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

BASELINE_DIR="${BASELINE_DIR:-$ROOT/.worktrees/nuxt2-baseline}"
LOG_DIR="${PARITY_LOG_DIR:-$ROOT/tmp/parity}"
NEW_MODE="${PARITY_NEW_MODE:-build}"
OLD_PORT=3001
NEW_PORT=3000
OLD_URL="http://localhost:$OLD_PORT"
NEW_URL="http://localhost:$NEW_PORT"
SERVER_PIDS=""
STARTED_PORTS=""

usage() {
  cat <<'EOF'
Runs the Nuxt 4 site's parity tests against the Nuxt 2 oracle.

Usage:
  scripts/parity.sh                 build the new site, run both suites
  scripts/parity.sh --prepare       only create/fetch the baseline worktree
  scripts/parity.sh --help

Environment:
  BASELINE_REF        Git ref of the Nuxt 2 oracle (default: upstream/master,
                      then origin/master, then master).
  BASELINE_DIR        Worktree directory for the oracle.
  PARITY_NEW_MODE     `build` (default) starts the production Nitro server,
                      `dev` starts `nuxt dev` instead.
  PARITY_FULL_MATRIX  `0` skips the full download matrix.
  PARITY_LOG_DIR      Directory for the server logs (default: tmp/parity).
EOF
}

log() {
  echo "[parity] $*"
}

fail() {
  echo "[parity] error: $*" >&2
  exit 1
}

resolve_baseline_ref() {
  if [[ -n "${BASELINE_REF:-}" ]]; then
    echo "$BASELINE_REF"
  elif git rev-parse --verify --quiet refs/remotes/upstream/master >/dev/null; then
    echo upstream/master
  elif git rev-parse --verify --quiet refs/remotes/origin/master >/dev/null; then
    echo origin/master
  else
    echo master
  fi
}

prepare_worktree() {
  local ref
  ref="$(resolve_baseline_ref)"

  if [[ -e "$BASELINE_DIR" ]]; then
    if ! git -C "$BASELINE_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
      fail "$BASELINE_DIR exists but is not a git worktree; remove it or set BASELINE_DIR"
    fi
    local head
    head="$(git -C "$BASELINE_DIR" rev-parse HEAD)"
    local wanted
    wanted="$(git rev-parse "$ref^{commit}")"
    log "reusing baseline worktree at $head"
    if [[ "$head" != "$wanted" ]]; then
      log "warning: worktree is not at $ref ($wanted); reusing it as-is"
    fi
    return
  fi

  log "creating baseline worktree at $BASELINE_DIR from $ref"
  mkdir -p "$(dirname "$BASELINE_DIR")"
  git worktree add --detach "$BASELINE_DIR" "$ref"
}

install_baseline_dependencies() {
  if [[ -f "$BASELINE_DIR/node_modules/.package-lock.json" ]]; then
    log "baseline dependencies already installed"
    return
  fi

  log "installing baseline dependencies (npm ci)"
  (cd "$BASELINE_DIR" && npm ci --prefer-offline --no-audit --no-fund)
}

ensure_baseline_register() {
  if [[ ! -f "$BASELINE_DIR/fixtures/register.json" ]]; then
    log "generating fixtures/register.json for the baseline"
    (cd "$BASELINE_DIR" && npm run build:register)
  fi
}

check_ports_free() {
  command -v lsof >/dev/null 2>&1 || return 0

  local port
  for port in "$OLD_PORT" "$NEW_PORT"; do
    if [[ -n "$(lsof -ti "tcp:$port" 2>/dev/null || true)" ]]; then
      fail "port $port is already in use; stop that process and try again"
    fi
  done
}

start_in_group() {
  local directory="$1"
  local log_file="$2"
  shift 2

  if command -v setsid >/dev/null 2>&1; then
    # New session/process group, so the whole server tree can be stopped.
    (cd "$directory" && exec setsid "$@" >"$log_file" 2>&1) &
  else
    (cd "$directory" && exec "$@" >"$log_file" 2>&1) &
  fi

  STARTED_PID=$!
  SERVER_PIDS="$SERVER_PIDS $STARTED_PID"
}

start_baseline() {
  # Nuxt 2's webpack 4 hashes with md4, which OpenSSL 3 only provides in its
  # legacy provider (Node >= 17).
  local node_options="${NODE_OPTIONS:-}"
  node_options="${node_options:+$node_options }--openssl-legacy-provider"

  log "starting Nuxt 2 oracle on $OLD_URL"
  start_in_group "$BASELINE_DIR" "$LOG_DIR/baseline.log" \
    env "PORT=$OLD_PORT" "NUXT_TELEMETRY_DISABLED=1" "NODE_OPTIONS=$node_options" \
    npm run dev
  BASELINE_PID=$STARTED_PID
  STARTED_PORTS="$STARTED_PORTS $OLD_PORT"
}

build_new_site() {
  log "building the Nuxt 4 site"
  npm run build
}

start_new_site() {
  if [[ "$NEW_MODE" == dev ]]; then
    log "starting Nuxt 4 dev server on $NEW_URL"
    start_in_group "$ROOT" "$LOG_DIR/new-site.log" env "PORT=$NEW_PORT" npm run dev
  else
    [[ -f "$ROOT/.output/server/index.mjs" ]] || fail "build output missing; run without PARITY_NEW_MODE=dev"
    log "starting built Nuxt 4 server on $NEW_URL"
    start_in_group "$ROOT" "$LOG_DIR/new-site.log" env "PORT=$NEW_PORT" node .output/server/index.mjs
  fi
  NEW_PID=$STARTED_PID
  STARTED_PORTS="$STARTED_PORTS $NEW_PORT"
}

wait_for_http() {
  local name="$1"
  local url="$2"
  local pid="$3"
  local log_file="$4"
  local marker="$5"

  local attempt
  local body
  for attempt in $(seq 1 300); do
    # Nuxt 2's dev server answers with HTTP 200 and a loading screen while it
    # compiles, so an HTTP 200 alone is not enough: wait for the SSR root too.
    if body="$(curl --fail --silent --show-error --max-time 10 "$url/")" \
      && [[ "$body" == *"$marker"* ]]; then
      log "$name is ready at $url"
      return 0
    fi
    if ! kill -0 "$pid" 2>/dev/null; then
      tail -n 100 "$log_file" >&2 || true
      fail "$name exited before it became ready"
    fi
    sleep 0.5
  done

  tail -n 100 "$log_file" >&2 || true
  fail "$name did not become ready within 150 seconds"
}

kill_port() {
  local port="$1"
  command -v lsof >/dev/null 2>&1 || return 0

  local pids
  pids="$(lsof -ti "tcp:$port" 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    # shellcheck disable=SC2086 # word splitting is intended for the PID list
    kill -KILL $pids 2>/dev/null || true
  fi
}

stop_process() {
  local pid="$1"
  kill -0 "$pid" 2>/dev/null || return 0

  kill -TERM -- "-$pid" 2>/dev/null || kill -TERM "$pid" 2>/dev/null || true
  local attempt
  for attempt in $(seq 1 50); do
    kill -0 "$pid" 2>/dev/null || return 0
    sleep 0.1
  done
  kill -KILL -- "-$pid" 2>/dev/null || kill -KILL "$pid" 2>/dev/null || true
}

cleanup() {
  local exit_code=$?
  trap - EXIT INT TERM

  local pid
  for pid in $SERVER_PIDS; do
    stop_process "$pid"
  done

  local port
  for port in $STARTED_PORTS; do
    kill_port "$port"
  done

  if [[ "$exit_code" -ne 0 ]]; then
    for log_file in "$LOG_DIR/baseline.log" "$LOG_DIR/new-site.log"; do
      if [[ -f "$log_file" ]]; then
        echo "[parity] last lines of $log_file:" >&2
        tail -n 50 "$log_file" >&2 || true
      fi
    done
  fi

  exit "$exit_code"
}

main() {
  case "${1:-}" in
    --prepare)
      prepare_worktree
      return
      ;;
    --help | -h)
      usage
      return
      ;;
    "")
      ;;
    *)
      echo "unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac

  command -v curl >/dev/null 2>&1 || fail "curl is required"

  mkdir -p "$LOG_DIR"
  trap cleanup EXIT
  trap 'exit 130' INT
  trap 'exit 143' TERM

  prepare_worktree
  check_ports_free
  install_baseline_dependencies
  ensure_baseline_register

  if [[ "$NEW_MODE" == dev ]]; then
    :
  elif [[ "$NEW_MODE" == build ]]; then
    build_new_site
  else
    fail "PARITY_NEW_MODE must be 'build' or 'dev'"
  fi

  start_baseline
  start_new_site

  wait_for_http "Nuxt 2 oracle" "$OLD_URL" "$BASELINE_PID" "$LOG_DIR/baseline.log" 'id="__nuxt"'
  wait_for_http "Nuxt 4 site" "$NEW_URL" "$NEW_PID" "$LOG_DIR/new-site.log" 'id="__nuxt"'

  log "running default parity suite"
  npm run test:parity

  if [[ "${PARITY_FULL_MATRIX:-1}" != 0 ]]; then
    log "running full download matrix (this takes a while)"
    FULL_DOWNLOAD_MATRIX=1 npm run test:parity
  fi

  log "all parity checks passed"
}

main "$@"
