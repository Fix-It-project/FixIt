/**
 * ═══════════════════════════════════════════════════════════════
 *  FixIt AI Diagnostic Server — Ollama Direct Fallback
 *
 *  A standalone Express server that bypasses ZeroClaw entirely
 *  and talks directly to Ollama. This is your DEMO INSURANCE:
 *  if ZeroClaw has issues during your presentation, start this
 *  server instead for identical functionality.
 *
 *  Endpoints:
 *    POST /api/ai/diagnose  — Diagnose a home maintenance problem
 *    GET  /health           — Health check (Ollama + FixIt API)
 *
 *  Usage:
 *    cd ollama-fallback
 *    npm install
 *    npm start              — Starts on port 3001
 *
 *  Environment:
 *    OLLAMA_URL       = http://localhost:11434
 *    FIXIT_API_URL    = http://localhost:8000
 *    OLLAMA_MODEL     = gemma3:4b
 *    PORT             = 3001
 * ═══════════════════════════════════════════════════════════════
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const {
  diagnoseWithOllama,
  checkOllamaHealth,
  checkFixItHealth,
} = require("./ollama-client");

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);

// ── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "50mb" })); // Large limit for base64 images

// ── Logging middleware ──────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`
    );
  });
  next();
});

// ═══════════════════════════════════════════════════════════════
//  POST /api/ai/diagnose
//
//  Accepts a multimodal payload and returns a structured
//  service order JSON after AI diagnosis.
// ═══════════════════════════════════════════════════════════════
app.post("/api/ai/diagnose", async (req, res) => {
  const requestStart = Date.now();

  try {
    const { text, image, audio, latitude, longitude, userId } = req.body;

    // ── Validation ────────────────────────────────────────────
    if (!text && !image && !audio) {
      return res.status(400).json({
        success: false,
        error: "At least one input is required: text, image, or audio.",
      });
    }

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        error: "GPS coordinates (latitude, longitude) are required.",
      });
    }

    // ── Build user message ──────────────────────────────────
    let userContent = text || "Please analyze the attached media and diagnose the issue.";

    // Append location context
    userContent += `\n\n[User Location: latitude=${latitude}, longitude=${longitude}]`;
    if (userId !== undefined && userId !== null) {
      userContent += `\n[User ID: ${userId}]`;
    }

    const userMessage = {
      role: "user",
      content: userContent,
    };

    // Attach image if provided (Ollama uses 'images' array)
    if (image) {
      // Remove data URI prefix if present
      const cleanBase64 = image.replace(
        /^data:image\/[a-zA-Z]+;base64,/,
        ""
      );
      userMessage.images = [cleanBase64];
    }

    // ── Pre-process Audio via FastAPI (Whisper) ───────────────
    if (audio) {
      console.log(`  [STT] Transcribing audio with FixIt API...`);
      try {
        const audioResponse = await axios.post(`${process.env.FIXIT_API_URL || "http://localhost:8000"}/api/transcribe`, {
          audio_base64: audio
        }, { timeout: 30000 });
        
        const transcription = audioResponse.data.text;
        console.log(`  [STT] Transcription: "${transcription}"`);
        
        // Append transcribed text to the system request
        userContent += `\n\n[User Voice Note Transcription: "${transcription}"]`;
        userMessage.content = userContent;
      } catch (err) {
        console.error("  [STT] Audio transcription failed:", err.message);
        return res.status(500).json({
          success: false,
          error: "Failed to transcribe audio. Ensure FastAPI server and Whisper are running."
        });
      }
    }

    console.log("\n╔══════════════════════════════════════════════╗");
    console.log("║  New AI Diagnosis Request                    ║");
    console.log("╚══════════════════════════════════════════════╝");
    console.log(`  Text:     ${(text || "(none)").substring(0, 80)}...`);
    console.log(`  Image:    ${image ? "Yes (" + Math.round(image.length / 1024) + " KB)" : "No"}`);
    console.log(`  Audio:    ${audio ? "Yes" : "No"}`);
    console.log(`  Location: ${latitude}, ${longitude}`);
    console.log(`  User ID:  ${userId || "anonymous"}`);

    // ── Run the diagnostic pipeline ─────────────────────────
    const result = await diagnoseWithOllama([userMessage]);

    const duration = Date.now() - requestStart;
    console.log(`\n  ✅ Diagnosis complete in ${duration}ms (${result.iterations} LLM iterations)`);

    // ── Return response ─────────────────────────────────────
    if (result.serviceOrder) {
      res.json({
        success: true,
        data: result.serviceOrder,
        meta: {
          engine: "ollama-direct",
          model: process.env.OLLAMA_MODEL || "gemma3:4b",
          iterations: result.iterations,
          duration_ms: duration,
        },
      });
    } else {
      // Model responded but didn't produce structured JSON
      res.json({
        success: true,
        data: { raw_response: result.response },
        meta: {
          engine: "ollama-direct",
          model: process.env.OLLAMA_MODEL || "gemma3:4b",
          iterations: result.iterations,
          duration_ms: duration,
          note: "Model response was not in structured JSON format.",
        },
      });
    }
  } catch (error) {
    const duration = Date.now() - requestStart;
    console.error(`\n  ❌ Diagnosis failed after ${duration}ms:`, error.message);
    if (error.response?.data) {
      console.error(`  ❌ Ollama error details:`, JSON.stringify(error.response.data, null, 2));
    }

    let statusCode = 500;
    let errorMsg = error.message;

    if (error.message.includes("Cannot connect to Ollama")) {
      statusCode = 503;
    } else if (error.message.includes("timed out")) {
      statusCode = 504;
    } else if (error.message.includes("loop exceeded")) {
      statusCode = 500;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMsg,
      meta: {
        engine: "ollama-direct",
        duration_ms: duration,
      },
    });
  }
});

// ═══════════════════════════════════════════════════════════════
//  GET /health
//
//  Checks connectivity to Ollama and the FixIt Recommendation API.
// ═══════════════════════════════════════════════════════════════
app.get("/health", async (req, res) => {
  const [ollamaHealth, fixitHealth] = await Promise.all([
    checkOllamaHealth(),
    checkFixItHealth(),
  ]);

  const allHealthy = ollamaHealth.ollama && ollamaHealth.model && fixitHealth.reachable;

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? "ok" : "degraded",
    engine: "ollama-direct-fallback",
    services: {
      ollama: ollamaHealth,
      fixit_api: fixitHealth,
    },
    timestamp: new Date().toISOString(),
  });
});

// ═══════════════════════════════════════════════════════════════
//  GET /
//
//  Simple info page.
// ═══════════════════════════════════════════════════════════════
app.get("/", (req, res) => {
  res.json({
    name: "FixIt AI Diagnostic Server (Ollama Fallback)",
    version: "1.0.0",
    description:
      "Direct Ollama integration for FixIt home maintenance diagnostics. " +
      "Bypasses ZeroClaw for demo reliability.",
    endpoints: {
      "POST /api/ai/diagnose": "Diagnose a home maintenance problem",
      "GET /health": "Check service health",
    },
    environment: {
      ollama_url: process.env.OLLAMA_URL || "http://localhost:11434",
      ollama_model: process.env.OLLAMA_MODEL || "gemma3:4b",
      fixit_api_url: process.env.FIXIT_API_URL || "http://localhost:8000",
    },
  });
});

// ── Start Server ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log("");
  console.log("═══════════════════════════════════════════════════");
  console.log("  FixIt AI Diagnostic Server (Ollama Fallback)");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Server:     http://localhost:${PORT}`);
  console.log(`  Diagnose:   POST http://localhost:${PORT}/api/ai/diagnose`);
  console.log(`  Health:     GET  http://localhost:${PORT}/health`);
  console.log(`  Ollama:     ${process.env.OLLAMA_URL || "http://localhost:11434"}`);
  console.log(`  Model:      ${process.env.OLLAMA_MODEL || "gemma3:4b"}`);
  console.log(`  FixIt API:  ${process.env.FIXIT_API_URL || "http://localhost:8000"}`);
  console.log("═══════════════════════════════════════════════════");
  console.log("");
  console.log("  Waiting for diagnosis requests...");
  console.log("");
});

module.exports = app;
