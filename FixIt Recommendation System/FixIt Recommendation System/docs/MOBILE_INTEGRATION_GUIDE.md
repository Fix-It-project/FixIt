# FixIt AI — Mobile Integration Guide

Welcome to the AI integration layer! The AI team has fully encapsulated the complexity of Large Language Models (Gemma 3 4B), Speech-to-Text transcription (Whisper), and Recommendation Engine routing into simple, clean REST API endpoints for you.

As a mobile developer, you **do not** need to worry about transcribing voice notes to text or managing LLM token contexts. Just hand the raw user data to the endpoints described below.

---

## The Two Core User Flows

The mobile application relies on two primary user flows for FixIt diagnostics and bookings.

### Flow 1: "Recommend with AI" (Quick Tool)
**Goal:** The user has a problem but doesn't know who to hire. The AI figures out the problem type, checks the market, and gives the user 3 top technicians to choose from. The user clicks one and finishes checkout manually.
👉 **Use Endpoint 1: The AI Fallback Diagnoser (`/api/ai/diagnose`)**

### Flow 2: "Place Complete Order via AI" (Concierge Agent)
**Goal:** The user talks to an autonomous concierge. The AI chats back and forth asking for missing details (like "What's your address?"), then autonomously places the final order pending a single 'Approve' button click.
👉 **Use Endpoint 2: The ZeroClaw Gateway (`/webhook` or `/v1/chat/completions`)**

---

## 🚀 Flow 1: The Diagnoser (Stateless, Fast)

This endpoint is your workhorse. Send it whatever the user typed, took a picture of, or said in a voice note, along with their coordinates. 

**Endpoint:** `POST {AI_FALLBACK_URL}:3001/api/ai/diagnose`  
*(Note: During local dev with a physical phone, use `ngrok` to expose port 3001)*

### Request Payload (`application/json`)
```json
{
  "text": "There's a puddle of water under my fridge.",  // String (Required, can be empty if sending audio/image)
  "image": "base64_encoded_jpeg_string_here",            // String (Optional) - Do NOT include "data:image/jpeg;base64," prefix
  "audio": "base64_encoded_wav_or_mp3_string_here",      // String (Optional) - Do NOT include data URI prefix
  "latitude": 30.0444,                                   // Number (Required)
  "longitude": 31.2357,                                  // Number (Required)
  "userId": 42                                           // Number (Optional, omit for guests)
}
```

> [!TIP]
> **Audio Magic:** If you pass `audio` in base64, our Python backend will automatically run it through an internal OpenAI Whisper model to transcribe it, append it to any `text` you provided, and pass the unified bundle to the AI. You do not need to do STT on the mobile device!
> **Supported Formats:** Our backend decoder explicitly supports common mobile formats including `.m4a` (iOS/Android default), `.mp3`, `.wav`, and `.webm`.

### Response Payload
You will receive a strictly structured JSON object. You can use standard React Native / Flutter data models to map it directly to your UI.

```json
{
  "success": true,
  "data": {
    "service_order": {
      "diagnosed_category": "fridge/freezer",
      "problem_summary": "Refrigerator leaking water from the bottom, likely a clogged defrost drain.",
      "severity_estimate": "medium",
      "assigned_technician": {
        "id": 104,
        "name": "Ahmed Mostafa",
        "category": "fridge/freezer",
        "distance_km": 4.2,
        "match_score": 0.94,
        "trust_score": 0.88,
        "hourly_rate_egp": 300
      },
      "all_recommendations": [ ... ], // Array of the top 3 technicians
      "estimated_cost_range_egp": "450 – 900",
      "user_id": 42,
      "engine_used": "hybrid"
    }
  },
  "meta": {
    "duration_ms": 12500
  }
}
```

### Error Handling for Flow 1
Be prepared to catch these and show UI alerts:
*   **HTTP 404:** No technicians found in the user's radius. Show: *"Unfortunately, we don't have technicians in your area yet."*
*   **HTTP 503:** AI models are cold-booting. show: *"Warming up the AI, please wait a moment..."*

---

## 🤖 Flow 2: ZeroClaw Orchestrator (Stateful Agent)

When the user chooses "Let the AI handle the booking", you are interacting with a stateful conversational agent. The API mimics standard chat platform standards.

**Endpoint:** `POST {ZEROCLAW_URL}:3000/webhook`  
*(Note: Expose port 3000 via ngrok for physical devices)*

### The Simple Webhook Approach
For the easiest integration (especially if you just dump all user input in one shot):

#### Request Payload (`application/json`)
```json
{
  "message": "My air conditioner is blowing warm air! \n\n[User Location: lat=30.06, lon=31.32]\n[User ID: 12]",
  "audioBuffer": "base64_encoded_audio_optional" 
}
```
*Note: Because this is a simple webhook, you'll need to manually encode the GPS coordinates into the text string as shown above before sending, but any audio provided will automatically be intercepted and transcribed!*

#### Response Payload
```json
{
  "response": "Got it! I've diagnosed an AC compressor issue. I've found Ahmed, who is 2.1km away. Here is your service order summary...",
  "service_order": { ... } // Same JSON structure as Flow 1
}
```

### The OpenAI-Compatible Approach (For Multimodal & Chat UI)
If you are building a ChatGPT-style conversational UI within the app:

**Endpoint:** `POST {ZEROCLAW_URL}:3000/v1/chat/completions`

#### Request Payload
```json
{
  "model": "gemma3:4b",
  "messages": [
    {
      "role": "user",
      "content": "What's wrong with this ceiling fan?"
    }
  ]
}
```

---

## Developer Prerequisites Checklist

Before you start writing code, make sure the AI team has given you the thumbs up that these services are running on their end (or on the dev server):

- [ ] **Python FastAPI** running on port 8000 (Handles Database, Hybrid Engine, and Whisper Audio STT)
- [ ] **Ollama Gateway** running on port 11434 (Handles the Gemma 3 4B Model)
- [ ] **Node.js Fallback** running on port 3001 (Flow 1 Endpoint)
- [ ] **ZeroClaw Gateway** running on port 3000 (Flow 2 Endpoint)
---

## 🐳 Quick Start with Docker Compose (Recommended)

The entire AI stack can be launched with a single command. Docker Compose handles startup ordering, networking, and log aggregation automatically.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- NVIDIA GPU drivers installed on the host (for GPU-accelerated inference)

### Start Everything
```bash
# First run (builds images + downloads Gemma 3 4B model ~2.5 GB)
docker compose up --build

# Subsequent runs (instant, uses cached images and model)
docker compose up
```

### What Happens Automatically
1. **Ollama** boots and pulls `gemma3:4b` if not cached (persisted in a Docker volume).
2. **Python FastAPI** loads the recommendation engines and Whisper STT model.
3. Only after both are healthy, **Node.js Fallback** (port 3001) and **ZeroClaw** (port 3000) start.
4. All logs stream into a single terminal window.

### Useful Commands
```bash
docker compose logs -f              # Tail all service logs
docker compose logs -f fixit-api    # Tail only the Python API logs
docker compose down                 # Stop all services
docker compose ps                   # Check service health status
```

### Port Summary
| Service | Port | Purpose |
|---------|------|---------|
| `fixit-api` | `8000` | Python FastAPI + Whisper STT |
| `ollama` | `11434` | Gemma 3 4B LLM Engine |
| `fixit-fallback` | `3001` | Flow 1 — AI Diagnoser |
| `zeroclaw` | `3000` | Flow 2 — AI Orchestrator |

---

<details>
<summary>📋 Manual Startup (Without Docker)</summary>

If you prefer to run services individually (e.g., for debugging), follow this strict order:

### 1. Foundational Layer (Start First)

* **Terminal 1 (LLM Engine):**
  ```powershell
  ollama serve
  ```

* **Terminal 2 (Python Backend):**
  ```powershell
  python run.py
  ```
  *Wait for `✅ All engines ready`.*

### 2. Orchestration Layer (Start Second)

* **Terminal 3 (ZeroClaw Gateway):**
  ```bash
  zeroclaw gateway
  ```
  *Wait for `listening on 0.0.0.0:3000`.*

* **Terminal 4 (Fallback Server):**
  ```powershell
  cd ollama-fallback && npm start
  ```
  *Wait for the `FixIt AI Diagnostic Server` banner.*

</details>

---

## 🌐 Local Network Tunnels (ngrok)

If testing the mobile app on a physical device, `localhost` will not resolve to your laptop.

Tunnel the orchestrators to public URLs using ngrok:
* `ngrok http 3000` → ZeroClaw Gateway (Flow 2)
* `ngrok http 3001` → Fallback Server (Flow 1)

*(If working remotely: Request the corresponding `ngrok` URLs from the AI team.)*

Happy building! 🛠️
