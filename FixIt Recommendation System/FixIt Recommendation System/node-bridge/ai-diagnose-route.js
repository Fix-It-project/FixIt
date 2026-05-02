/**
 * ═══════════════════════════════════════════════════════════════
 *  FixIt AI Diagnose Route
 *
 *  Express router module for POST /api/ai/diagnose.
 *  Receives a multimodal payload from the React Native app (or
 *  Postman) and forwards it to the ZeroClaw AI Agent for
 *  diagnosis and technician recommendation.
 *
 *  Integration:
 *    const aiDiagnoseRouter = require('./node-bridge/ai-diagnose-route');
 *    app.use(aiDiagnoseRouter);
 * ═══════════════════════════════════════════════════════════════
 */

const express = require("express");
const { getAIServiceOrder } = require("./zeroclaw-client");

const router = express.Router();

/**
 * POST /api/ai/diagnose
 *
 * Body:
 * {
 *   "text":      "My kitchen sink is leaking",
 *   "image":     "<base64 image string>",    // optional
 *   "audio":     "<base64 audio string>",    // optional
 *   "latitude":  30.06,
 *   "longitude": 31.32,
 *   "userId":    42                          // optional
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "service_order": { ... }
 *   }
 * }
 */
router.post("/api/ai/diagnose", async (req, res) => {
  try {
    const { text, image, audio, latitude, longitude, userId } = req.body;

    // ── Validation ──────────────────────────────────────────
    if (!text && !image && !audio) {
      return res.status(400).json({
        success: false,
        error:
          "At least one input is required: text, image, or audio.",
      });
    }

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        error:
          "GPS coordinates (latitude, longitude) are required.",
      });
    }

    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        success: false,
        error: "latitude must be between -90 and 90.",
      });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        error: "longitude must be between -180 and 180.",
      });
    }

    // ── Forward to AI Agent ─────────────────────────────────
    const serviceOrder = await getAIServiceOrder({
      text,
      imageBase64: image,
      audioBuffer: audio ? Buffer.from(audio, "base64") : null,
      latitude,
      longitude,
      userId,
    });

    res.json({ success: true, data: serviceOrder });
  } catch (error) {
    console.error("AI Diagnosis Error:", error.message);

    // Provide helpful error messages
    let statusCode = 500;
    let errorMsg = "Failed to process AI diagnosis";

    if (error.code === "ECONNREFUSED") {
      statusCode = 503;
      errorMsg =
        "AI Agent (ZeroClaw) is not reachable. Ensure 'zeroclaw gateway' is running.";
    } else if (error.code === "ETIMEDOUT" || error.code === "ECONNABORTED") {
      statusCode = 504;
      errorMsg =
        "AI Agent timed out. The LLM may be loading or processing a complex request.";
    } else if (error.response) {
      statusCode = error.response.status || 500;
      errorMsg = error.response.data?.error || error.message;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMsg,
    });
  }
});

module.exports = router;
