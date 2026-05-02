#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  Ollama Entrypoint — Auto-pull Gemma 3 4B on first boot
#  This script starts the Ollama server, waits for it to be
#  ready, pulls the configured model if missing, then keeps
#  the server running in the foreground.
# ═══════════════════════════════════════════════════════════════

set -e

MODEL="${OLLAMA_MODEL:-gemma3:4b}"

echo "══════════════════════════════════════════════"
echo "  FixIt Ollama — Starting server..."
echo "══════════════════════════════════════════════"

# Start Ollama server in background
ollama serve &
SERVER_PID=$!

# Wait for server to become responsive
echo "  Waiting for Ollama server to start..."
MAX_RETRIES=30
for i in $(seq 1 $MAX_RETRIES); do
    if curl -sf http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "  ✅ Ollama server is ready."
        break
    fi
    if [ $i -eq $MAX_RETRIES ]; then
        echo "  ❌ Ollama server failed to start after ${MAX_RETRIES} attempts."
        exit 1
    fi
    echo "  ... attempt $i/$MAX_RETRIES"
    sleep 2
done

# Pull model if not already present
if curl -sf http://localhost:11434/api/tags | grep -q "${MODEL%%:*}"; then
    echo "  ✅ Model '${MODEL}' already cached."
else
    echo "  📥 Pulling model '${MODEL}' (first run only, ~2.5 GB)..."
    ollama pull "${MODEL}"
    echo "  ✅ Model '${MODEL}' pulled successfully."
fi

echo "══════════════════════════════════════════════"
echo "  FixIt Ollama — Ready (model: ${MODEL})"
echo "══════════════════════════════════════════════"

# Keep server running in foreground
wait $SERVER_PID
