# FixIt Stage 1 — Setup & Deployment Guide

> **ZeroClaw + Gemma 3 4B Integration with FixIt Recommendation System**
>
> This guide walks you through setting up the full AI diagnostic pipeline
> on your Windows + WSL2 development environment.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: WSL2 + Ollama + Gemma 3 4B](#step-1-wsl2--ollama--gemma-3-4b)
4. [Step 2: ZeroClaw Setup](#step-2-zeroclaw-setup)
5. [Step 3: Start All Services](#step-3-start-all-services)
6. [Step 4: Test with Postman](#step-4-test-with-postman)
7. [Ollama Fallback (Demo Insurance)](#ollama-fallback-demo-insurance)
8. [WSL2 ↔ Windows Networking](#wsl2--windows-networking)
9. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Windows Host                              │
│                                                              │
│  ┌──────────────────────┐    ┌──────────────────────────┐   │
│  │  FixIt FastAPI        │    │  Ollama Fallback         │   │
│  │  (Recommendation API) │    │  (Express on :3001)      │   │
│  │  http://localhost:8000│    │  http://localhost:3001    │   │
│  └──────────────────────┘    └──────────────────────────┘   │
│           ▲                              ▲                   │
│           │ HTTP POST                    │ HTTP POST          │
│  ─ ─ ─ ─ ┼ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┼ ─ ─ ─ ─ ─ ─ ─   │
│           │        WSL2                  │                    │
│  ┌────────┴─────────────┐    ┌──────────┴───────────────┐   │
│  │  ZeroClaw Gateway     │    │  Ollama Server           │   │
│  │  (Rust Agent on :3000)│◄──►│  + Gemma 3 4B            │   │
│  │                       │    │  http://localhost:11434   │   │
│  └───────────────────────┘    └──────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Client (Postman / React Native App)                  │    │
│  │  → POST to :3000 (ZeroClaw) or :3001 (Fallback)      │    │
│  └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

| Service | Port | Runs On | Description |
|---------|------|---------|-------------|
| Ollama + Gemma 3 4B | 11434 | WSL2 | Local LLM inference engine |
| ZeroClaw Gateway | 3000 | WSL2 | AI agent orchestrator |
| FixIt FastAPI | 8000 | Windows | Existing recommendation API |
| Ollama Fallback | 3001 | Windows | Demo insurance (no Rust) |

---

## Prerequisites

- **Windows 10/11** with WSL2 enabled
- **NVIDIA RTX 3050-Ti** (or any CUDA-capable GPU)
- **NVIDIA GPU drivers** installed on Windows (WSL2 auto-detects CUDA)
- **Python 3.10+** (for FixIt FastAPI)
- **Node.js 18+** (for the fallback server)
- **Git** installed on both Windows and WSL2

### Verify WSL2

```powershell
# PowerShell — check WSL2 is installed
wsl --list --verbose
# Should show Ubuntu or similar with VERSION 2
```

### Verify GPU in WSL2

```bash
# Inside WSL2
nvidia-smi
# Should show your RTX 3050-Ti with driver version
```

---

## Step 1: WSL2 + Ollama + Gemma 3 4B

### Option A: Automated Setup (Recommended)

```bash
# Inside WSL2 — navigate to the project
cd /mnt/d/Zewail\ City/Graduation\ Project/FixIt\ Recommendation\ System/FixIt\ Recommendation\ System

# Run the setup script
chmod +x zeroclaw/setup-wsl.sh
./zeroclaw/setup-wsl.sh
```

This script installs Ollama, pulls Gemma 3 4B, installs Rust,
builds ZeroClaw, and configures everything automatically.

### Option B: Manual Setup

```bash
# 1. Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. Start Ollama
ollama serve

# 3. Pull Gemma 3 4B (~3.3 GB download)
ollama pull gemma3:4b

# 4. Verify
ollama list
# Should show:  gemma3:4b

# 5. Quick test
ollama run gemma3:4b "What is plumbing?"
```

### Verify GPU Acceleration

```bash
# While Ollama is running, open another WSL2 terminal:
nvidia-smi
# Look for an "ollama" process using GPU memory
```

---

## Step 2: ZeroClaw Setup

### Install Rust & Build ZeroClaw

```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Clone ZeroClaw
git clone https://github.com/zeroclaw-labs/zeroclaw.git ~/zeroclaw-src
cd ~/zeroclaw-src

# Build (takes 3-5 minutes)
cargo build --release --locked
cargo install --path . --force --locked

# Verify
zeroclaw --version
```

### Configure ZeroClaw for FixIt

```bash
# Create workspace directory
mkdir -p ~/.zeroclaw/workspace/skills/fixit-diagnose

# Copy config files from the project
PROJECT="/mnt/d/Zewail City/Graduation Project/FixIt Recommendation System/FixIt Recommendation System"

cp "$PROJECT/zeroclaw/config.toml"  ~/.zeroclaw/config.toml
cp "$PROJECT/zeroclaw/IDENTITY.md"  ~/.zeroclaw/workspace/IDENTITY.md
cp "$PROJECT/zeroclaw/skills/fixit-diagnose/SKILL.md" \
   ~/.zeroclaw/workspace/skills/fixit-diagnose/SKILL.md

# Run onboard wizard
zeroclaw onboard
```

---

## Step 3: Start All Services

You need **3 terminals** running simultaneously:

### Terminal 1: Ollama (WSL2)

```bash
ollama serve
# Runs on http://127.0.0.1:11434
```

### Terminal 2: ZeroClaw Gateway (WSL2)

```bash
zeroclaw gateway --port 3000
# Runs on http://0.0.0.0:3000
```

### Terminal 3: FixIt FastAPI (Windows PowerShell)

```powershell
cd "D:\Zewail City\Graduation Project\FixIt Recommendation System\FixIt Recommendation System"
python run.py
# Runs on http://localhost:8000
```

### Verify All Services

```bash
# From Windows PowerShell:
# 1. FixIt API
curl http://localhost:8000/health

# 2. Ollama (via WSL2 port forwarding)
curl http://localhost:11434/api/tags

# 3. ZeroClaw
curl http://localhost:3000/health
```

---

## Step 4: Test with Postman

### Test 1: Text-Only Request

```
POST http://localhost:3000/v1/chat/completions
Content-Type: application/json

{
  "model": "gemma3:4b",
  "messages": [
    {
      "role": "user",
      "content": "My kitchen sink is leaking water everywhere. I'm located at latitude 30.06, longitude 31.32. My user ID is 42."
    }
  ],
  "temperature": 0.1
}
```

**Expected Flow:**
1. ZeroClaw forwards to Gemma 3 4B
2. Model diagnoses: "plumbing" category
3. Model calls `get_technician_recommendation` tool
4. ZeroClaw executes HTTP request to `localhost:8000/api/recommend`
5. Model compiles service order JSON
6. Response returned to Postman

### Test 2: Image + Text Request

```
POST http://localhost:3000/v1/chat/completions
Content-Type: application/json

{
  "model": "gemma3:4b",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "What's wrong here? I'm at lat 30.06, lon 31.32, user ID 42."
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "data:image/jpeg;base64,<YOUR_BASE64_IMAGE_HERE>"
          }
        }
      ]
    }
  ],
  "temperature": 0.1
}
```

---

## Ollama Fallback (Demo Insurance)

If ZeroClaw has any issues during your live demo, use this standalone
Node.js server that talks directly to Ollama:

### Setup

```powershell
# Windows PowerShell
cd "D:\Zewail City\Graduation Project\FixIt Recommendation System\FixIt Recommendation System\ollama-fallback"

# Install dependencies
npm install

# Copy environment template
copy .env.example .env

# Start the fallback server
npm start
# Runs on http://localhost:3001
```

### Test the Fallback

```
POST http://localhost:3001/api/ai/diagnose
Content-Type: application/json

{
  "text": "My AC is not cooling the room properly. It makes a loud rattling noise.",
  "latitude": 30.06,
  "longitude": 31.32,
  "userId": 42
}
```

### Health Check

```
GET http://localhost:3001/health
```

Returns status of both Ollama and FixIt API connections.

### Switching During Demo

If ZeroClaw is unresponsive during your presentation:

1. Keep the FixIt FastAPI running (Terminal 3)
2. Keep Ollama running (Terminal 1)
3. Open a new terminal and start the fallback:
   ```
   cd ollama-fallback && npm start
   ```
4. Change your Postman URL from `localhost:3000` to `localhost:3001`
5. Use the `/api/ai/diagnose` endpoint instead of `/v1/chat/completions`

The output format is identical.

---

## WSL2 ↔ Windows Networking

### WSL2 reaching Windows (FixIt API)

From inside WSL2, `localhost` refers to WSL2 itself, not Windows.
To reach the FixIt FastAPI on Windows:

```bash
# Method 1: hostname.local (Windows 11+)
curl http://$(hostname).local:8000/health

# Method 2: resolv.conf DNS server IP
WINDOWS_IP=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}')
curl http://${WINDOWS_IP}:8000/health

# Method 3: Set environment variable
export FIXIT_API_HOST="http://${WINDOWS_IP}:8000"
```

### Windows reaching WSL2 (Ollama / ZeroClaw)

From Windows, WSL2 services are usually reachable at `localhost`:
```powershell
# Should work on Windows 11 with default WSL2 config
curl http://localhost:11434/api/tags
curl http://localhost:3000/health
```

If `localhost` doesn't work:
```powershell
# Get WSL2 IP
wsl hostname -I
# Use that IP instead of localhost
```

---

## Troubleshooting

### "Cannot connect to Ollama"

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not, start it
ollama serve

# If port conflict, check what's using 11434
sudo lsof -i :11434
```

### "Model not found"

```bash
# List available models
ollama list

# Pull the model if missing
ollama pull gemma3:4b
```

### "FixIt API not reachable from WSL2"

```bash
# Test connectivity
WINDOWS_IP=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}')
curl http://${WINDOWS_IP}:8000/health

# If blocked by Windows Firewall:
# 1. Open Windows Firewall settings
# 2. Allow inbound connections on port 8000
# 3. Or temporarily disable firewall for testing
```

### "ZeroClaw build fails"

```bash
# Ensure Rust is up to date
rustup update stable

# Clean and rebuild
cd ~/zeroclaw-src
cargo clean
cargo build --release --locked

# If dependency issues, try without --locked
cargo build --release
```

### "Slow inference / model loading"

```bash
# Check GPU is being used
nvidia-smi
# Look for ollama process with GPU memory usage

# If CPU-only inference (very slow), ensure:
# 1. NVIDIA drivers are installed on Windows
# 2. nvidia-container-toolkit is available in WSL2
# 3. Restart Ollama after driver installation

# Use a smaller model for testing
ollama pull gemma3:4b   # ~3.3 GB, good for RTX 3050-Ti
```

### "Tool calling not working"

If Gemma 3 4B doesn't call the tool:
1. Check the system prompt is loaded (`zeroclaw doctor`)
2. Try rephrasing the input to include explicit location
3. Switch to the Ollama fallback, which handles tool calling more reliably

---

## File Structure Reference

```
FixIt Recommendation System/
├── app/                              # Existing FastAPI code (untouched)
│   ├── main.py                       # FastAPI app with /api/recommend
│   ├── hybrid_engine.py              # Recommendation engine
│   ├── config.py                     # Service categories & constants
│   └── ...
├── zeroclaw/                         # ZeroClaw integration layer
│   ├── config.toml                   # ZeroClaw configuration
│   ├── IDENTITY.md                   # AI agent identity/system prompt
│   ├── setup-wsl.sh                  # WSL2 automated setup script
│   ├── skills/
│   │   └── fixit-diagnose/
│   │       └── SKILL.md              # Diagnostic skill definition
│   └── tools/
│       ├── fixit_recommend.rs        # Native Rust tool (production)
│       └── mod.rs                    # Tool registration guide
├── ollama-fallback/                  # Demo fail-safe
│   ├── package.json
│   ├── ollama-client.js              # Direct Ollama API client
│   ├── fixit-diagnose-server.js      # Express server (port 3001)
│   ├── .env.example                  # Environment template
│   └── .env                          # Your local config (git-ignored)
├── node-bridge/                      # Node.js ↔ ZeroClaw bridge
│   ├── zeroclaw-client.js            # ZeroClaw gateway HTTP client
│   └── ai-diagnose-route.js          # Express route module
└── docs/
    └── STAGE1_SETUP_GUIDE.md         # This file
```
