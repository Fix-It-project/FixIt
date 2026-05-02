#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#  FixIt Stage 1 — WSL2 Setup Script
#  Installs Ollama + Gemma 3 4B + ZeroClaw inside WSL2.
#
#  Usage (inside WSL2):
#    chmod +x setup-wsl.sh
#    ./setup-wsl.sh
#
#  Prerequisites:
#    - WSL2 with Ubuntu 22.04+ installed
#    - NVIDIA GPU drivers installed on Windows host
#      (WSL2 auto-detects via nvidia-container-toolkit)
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ZEROCLAW_WORKSPACE="$HOME/.zeroclaw"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'  # No Color

info()  { echo -e "${GREEN}[FixIt]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ── 0. Detect Windows host IP for reaching FixIt FastAPI ──────
WINDOWS_HOST_IP=$(cat /etc/resolv.conf 2>/dev/null | grep nameserver | head -1 | awk '{print $2}' || echo "localhost")
info "Windows host IP (for reaching FastAPI): ${WINDOWS_HOST_IP}"

# ── 1. System dependencies ───────────────────────────────────
info "Installing system dependencies..."
sudo apt-get update -qq
sudo apt-get install -y -qq build-essential pkg-config libssl-dev git curl wget

# ── 2. Install Ollama ────────────────────────────────────────
if command -v ollama &>/dev/null; then
    info "Ollama already installed: $(ollama --version 2>/dev/null || echo 'version check failed')"
else
    info "Installing Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
    info "Ollama installed successfully."
fi

# ── 3. Start Ollama server (background) ─────────────────────
if curl -s http://127.0.0.1:11434/api/tags &>/dev/null; then
    info "Ollama server already running on :11434"
else
    info "Starting Ollama server in background..."
    nohup ollama serve &>/dev/null &
    sleep 3
    if curl -s http://127.0.0.1:11434/api/tags &>/dev/null; then
        info "Ollama server started."
    else
        warn "Ollama server may not have started. Check manually: ollama serve"
    fi
fi

# ── 4. Check GPU ─────────────────────────────────────────────
info "Checking GPU availability..."
if command -v nvidia-smi &>/dev/null; then
    GPU_NAME=$(nvidia-smi --query-gpu=gpu_name --format=csv,noheader 2>/dev/null | head -1)
    GPU_MEM=$(nvidia-smi --query-gpu=memory.total --format=csv,noheader 2>/dev/null | head -1)
    info "GPU detected: ${GPU_NAME} (${GPU_MEM})"
    info "CUDA acceleration will be used for Gemma 3 4B inference."
else
    warn "nvidia-smi not found. Ollama will use CPU inference (slower)."
    warn "Ensure NVIDIA drivers are installed on your Windows host."
fi

# ── 5. Pull Gemma 3 4B ──────────────────────────────────────
info "Pulling Gemma 3 4B model (this may take a few minutes)..."
ollama pull gemma3:4b

info "Verifying model..."
ollama list | grep -q "gemma3:4b" && info "✅ gemma3:4b model ready." || error "Model pull failed!"

# ── 6. Install Rust ──────────────────────────────────────────
if command -v rustc &>/dev/null; then
    info "Rust already installed: $(rustc --version)"
else
    info "Installing Rust toolchain..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
    info "Rust installed: $(rustc --version)"
fi

# Ensure cargo is in PATH for the rest of this script
export PATH="$HOME/.cargo/bin:$PATH"

# ── 7. Clone & Build ZeroClaw ────────────────────────────────
ZEROCLAW_SRC="$HOME/zeroclaw-src"

if command -v zeroclaw &>/dev/null; then
    info "ZeroClaw already installed: $(zeroclaw --version 2>/dev/null || echo 'installed')"
else
    info "Cloning ZeroClaw..."
    if [ -d "$ZEROCLAW_SRC" ]; then
        cd "$ZEROCLAW_SRC" && git pull --ff-only
    else
        git clone https://github.com/zeroclaw-labs/zeroclaw.git "$ZEROCLAW_SRC"
    fi

    info "Building ZeroClaw (release mode — this takes 3-5 minutes)..."
    cd "$ZEROCLAW_SRC"
    cargo build --release --locked 2>&1 | tail -5
    cargo install --path . --force --locked 2>&1 | tail -3

    info "ZeroClaw installed: $(zeroclaw --version 2>/dev/null || echo 'build complete')"
fi

# ── 8. Configure ZeroClaw workspace ─────────────────────────
info "Setting up ZeroClaw workspace at ${ZEROCLAW_WORKSPACE}..."
mkdir -p "${ZEROCLAW_WORKSPACE}/workspace/skills/fixit-diagnose"
mkdir -p "${ZEROCLAW_WORKSPACE}/state"

# Copy config.toml
cp "${SCRIPT_DIR}/config.toml" "${ZEROCLAW_WORKSPACE}/config.toml"
info "Copied config.toml"

# Copy IDENTITY.md
cp "${SCRIPT_DIR}/IDENTITY.md" "${ZEROCLAW_WORKSPACE}/workspace/IDENTITY.md"
info "Copied IDENTITY.md"

# Copy skill
cp "${SCRIPT_DIR}/skills/fixit-diagnose/SKILL.md" \
   "${ZEROCLAW_WORKSPACE}/workspace/skills/fixit-diagnose/SKILL.md"
info "Copied fixit-diagnose skill"

# ── 9. Set the FixIt API host for WSL2 → Windows ────────────
# Update config.toml with the correct Windows host IP
FIXIT_API_URL="http://${WINDOWS_HOST_IP}:8000"
info "FixIt API URL (WSL2 → Windows): ${FIXIT_API_URL}"

# Write environment hint
cat > "${ZEROCLAW_WORKSPACE}/.env" <<EOF
# Auto-generated by setup-wsl.sh
FIXIT_API_HOST=${FIXIT_API_URL}
OLLAMA_HOST=http://127.0.0.1:11434
EOF
info "Wrote .env with FIXIT_API_HOST=${FIXIT_API_URL}"

# ── 10. Verify connectivity ─────────────────────────────────
info ""
info "═══════════════════════════════════════════════════"
info "  Setup Complete! Verifying services..."
info "═══════════════════════════════════════════════════"
echo ""

# Check Ollama
if curl -s http://127.0.0.1:11434/api/tags | grep -q "gemma3"; then
    info "✅ Ollama + Gemma 3 4B — OK"
else
    warn "⚠️  Ollama may not be running. Start with: ollama serve"
fi

# Check FixIt API (via Windows host)
if curl -s --connect-timeout 3 "${FIXIT_API_URL}/health" | grep -q "ok"; then
    info "✅ FixIt Recommendation API — OK (${FIXIT_API_URL})"
else
    warn "⚠️  FixIt API not reachable at ${FIXIT_API_URL}"
    warn "   Make sure to run 'python run.py' on Windows first."
    warn "   If the IP is wrong, update FIXIT_API_HOST in ${ZEROCLAW_WORKSPACE}/.env"
fi

echo ""
info "═══════════════════════════════════════════════════"
info "  Next Steps:"
info "═══════════════════════════════════════════════════"
echo ""
info "  1. Start FixIt API on Windows:"
info "     cd \"FixIt Recommendation System\" && python run.py"
echo ""
info "  2. Start Ollama (if not running):"
info "     ollama serve"
echo ""
info "  3. Start ZeroClaw gateway:"
info "     zeroclaw gateway --port 3000"
echo ""
info "  4. Test from Windows (Postman or curl):"
info "     POST http://localhost:3000/v1/chat/completions"
echo ""
info "  5. Fallback (if ZeroClaw issues):"
info "     cd ollama-fallback && npm start"
echo ""
