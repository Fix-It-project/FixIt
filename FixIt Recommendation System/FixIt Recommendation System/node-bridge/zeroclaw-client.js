/**
 * ═══════════════════════════════════════════════════════════════
 *  ZeroClaw Gateway Client
 *  
 *  Sends multimodal maintenance requests to the ZeroClaw AI Agent
 *  gateway, which internally routes through Gemma 3 4B for
 *  diagnosis and tool-calling to the FixIt Recommendation API.
 *
 *  Usage:
 *    const { getAIServiceOrder } = require('./zeroclaw-client');
 *    const result = await getAIServiceOrder({ text, latitude, longitude });
 * ═══════════════════════════════════════════════════════════════
 */

const axios = require("axios");

const ZEROCLAW_URL = process.env.ZEROCLAW_URL || "http://localhost:3000";

/**
 * Send a multimodal maintenance request to the FixIt AI Agent.
 *
 * @param {Object} params
 * @param {string}  params.text          - Problem description text
 * @param {string}  [params.imageBase64] - Base64 encoded image of damage
 * @param {Buffer}  [params.audioBuffer] - Raw audio buffer of voice message
 * @param {number}  params.latitude      - User GPS latitude
 * @param {number}  params.longitude     - User GPS longitude
 * @param {string|number} [params.userId] - User ID (optional)
 * @returns {Promise<Object>} Structured service order JSON
 */
async function getAIServiceOrder({
  text,
  imageBase64,
  audioBuffer,
  latitude,
  longitude,
  userId,
}) {
  // ── Build the multimodal message for ZeroClaw ─────────────
  let userContent = text || "";

  // Append GPS context so the agent has coordinates
  userContent += `\n\n[User Location: lat=${latitude}, lon=${longitude}]`;
  if (userId) {
    userContent += `\n[User ID: ${userId}]`;
  }

  const messageParts = [{ type: "text", text: userContent }];

  // Image attachment (if provided)
  if (imageBase64) {
    messageParts.push({
      type: "image_url",
      image_url: {
        url: `data:image/jpeg;base64,${imageBase64}`,
      },
    });
  }

  // Audio attachment (if provided) -> Transcribe before sending
  if (audioBuffer) {
    const audioBase64 =
      Buffer.isBuffer(audioBuffer)
        ? audioBuffer.toString("base64")
        : audioBuffer;

    try {
      const FIXIT_API_URL = process.env.FIXIT_API_URL || "http://localhost:8000";
      const audioResponse = await axios.post(`${FIXIT_API_URL}/api/transcribe`, {
        audio_base64: audioBase64
      }, { timeout: 30000 });
      
      const transcription = audioResponse.data.text;
      
      // Update the user content with the transcription
      userContent += `\n\n[User Voice Note Transcription: "${transcription}"]`;
      messageParts[0].text = userContent;
      
    } catch (err) {
      throw new Error(`Failed to transcribe audio via FixIt API: ${err.message}`);
    }
  }

  const messages = [{ role: "user", content: messageParts }];

  // ── Call ZeroClaw gateway (OpenAI-compatible endpoint) ────
  const response = await axios.post(
    `${ZEROCLAW_URL}/v1/chat/completions`,
    {
      model: "gemma3:4b",
      messages,
      temperature: 0.1, // Low temp for deterministic diagnostics
      max_tokens: 2048,
    },
    {
      headers: { "Content-Type": "application/json" },
      timeout: 60000, // 60s timeout (LLM + tool call can be slow)
    }
  );

  // ── Parse the structured service order from AI response ───
  const aiResponse = response.data.choices[0].message.content;

  // Try to extract JSON from the response
  const jsonMatch = aiResponse.match(/\{[\s\S]*"service_order"[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      // If JSON parsing fails, return raw
      return { raw_response: aiResponse, parse_error: parseErr.message };
    }
  }

  // No structured JSON found — return the raw response
  return { raw_response: aiResponse };
}

module.exports = { getAIServiceOrder };
