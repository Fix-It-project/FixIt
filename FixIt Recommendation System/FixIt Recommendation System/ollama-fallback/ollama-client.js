/**
 * ═══════════════════════════════════════════════════════════════
 *  FixIt Ollama Direct Client
 *
 *  Talks directly to Ollama's /api/chat endpoint using
 *  PROMPT-BASED tool calling (Gemma 3 4B does not support
 *  Ollama's native `tools` parameter).
 *
 *  Flow:
 *    1. Send user message + tool instructions in the system prompt
 *    2. If the model outputs a TOOL_CALL JSON block → parse & execute
 *    3. Feed the tool result back into the conversation
 *    4. Repeat until the model returns a final text/JSON response
 *
 *  This is the DEMO FAIL-SAFE: identical output to the ZeroClaw
 *  pipeline, but without any Rust dependency.
 * ═══════════════════════════════════════════════════════════════
 */

const axios = require("axios");

// ── Configuration ───────────────────────────────────────────
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma3:4b";
const FIXIT_API_URL = process.env.FIXIT_API_URL || "http://localhost:8000";
const OLLAMA_TIMEOUT = parseInt(process.env.OLLAMA_TIMEOUT_MS || "120000", 10);
const MAX_ITERATIONS = parseInt(process.env.MAX_TOOL_ITERATIONS || "5", 10);

// ── System Prompt (with embedded tool instructions) ─────────
// Since Gemma 3 4B doesn't support native tool calling, we
// describe the tool in the prompt and tell the model to output
// a specific JSON format when it wants to invoke it.
const SYSTEM_PROMPT = `You are the FixIt AI Diagnostic Agent, an expert in Egyptian home maintenance and repair.

Your job:
1. DIAGNOSE the user's home maintenance problem from their input (text, photo, or audio).
2. CATEGORIZE it into exactly one of these 10 service categories:
   plumbing, electrical, carpentry, home cleaning, air condition, painter, dish, oven/cooker, fridge/freezer, fan
3. CALL the get_technician_recommendation tool (instructions below).
4. COMPILE a structured service order JSON from the tool result.

## TOOL: get_technician_recommendation

You have access to ONE tool. To call it, output ONLY the following JSON block (nothing else):

\`\`\`tool_call
{
  "tool": "get_technician_recommendation",
  "arguments": {
    "problem_description": "<clear description of the issue>",
    "latitude": <number>,
    "longitude": <number>,
    "user_id": <number or null>,
    "radius_km": 10,
    "top_k": 3
  }
}
\`\`\`

After you output the tool_call block, I will execute it and give you the result. Then compile the final service order.

## Rules
- ALWAYS call get_technician_recommendation — NEVER guess or invent technicians.
- If the user sends an image, describe the visible damage in your problem_description.
- If GPS coordinates are not provided, ask the user for them BEFORE calling the tool.
- If user ID is not provided, set user_id to null.
- Present the final result as a clean JSON object.

## Final Output Format

After receiving the tool response, output this exact JSON structure:

\`\`\`json
{
  "service_order": {
    "diagnosed_category": "<one of the 10 categories>",
    "problem_summary": "<1-2 sentence summary>",
    "severity_estimate": "low | medium | high",
    "assigned_technician": {
      "id": "<technician_id>",
      "name": "<name>",
      "category": "<category>",
      "distance_km": <number>,
      "match_score": <0-1>,
      "trust_score": <0-1>,
      "hourly_rate_egp": <number>
    },
    "all_recommendations": [ ... ],
    "estimated_cost_range_egp": "<min> – <max>",
    "user_id": "<user_id or null>",
    "engine_used": "<from API response>"
  }
}
\`\`\`

Severity: low=cosmetic/minor, medium=functional impairment, high=safety hazard.
Cost: simple fix=rate×1, medium=rate×1.5-3, complex=rate×3-5.`;

// ── Tool Call Parser ────────────────────────────────────────
// Extracts a tool call from the model's text response.
// Looks for ```tool_call ... ``` blocks or raw JSON with "tool" key.

function parseToolCall(text) {
  // Pattern 1: ```tool_call\n{...}\n```
  const fencedMatch = text.match(/```tool_call\s*\n?([\s\S]*?)```/);
  if (fencedMatch) {
    try {
      const parsed = JSON.parse(fencedMatch[1].trim());
      if (parsed.tool && parsed.arguments) return parsed;
    } catch (e) {
      console.warn("[Parser] Failed to parse fenced tool_call:", e.message);
    }
  }

  // Pattern 2: ```json\n{"tool":...}\n```
  const jsonFencedMatch = text.match(/```json\s*\n?([\s\S]*?)```/);
  if (jsonFencedMatch) {
    try {
      const parsed = JSON.parse(jsonFencedMatch[1].trim());
      if (parsed.tool && parsed.arguments) return parsed;
    } catch (e) {
      // Not a tool call JSON, ignore
    }
  }

  // Pattern 3: Unfenced JSON with "tool" key anywhere in the text
  const rawMatch = text.match(/\{[\s\S]*?"tool"\s*:\s*"get_technician_recommendation"[\s\S]*?\}/);
  if (rawMatch) {
    try {
      const parsed = JSON.parse(rawMatch[0]);
      if (parsed.tool && parsed.arguments) return parsed;
    } catch (e) {
      // Try to extract just the arguments portion
      console.warn("[Parser] Failed to parse raw tool call JSON:", e.message);
    }
  }

  return null;
}

// ── Tool Executor ───────────────────────────────────────────

/**
 * Execute the get_technician_recommendation tool by calling
 * the FixIt FastAPI /api/recommend endpoint.
 *
 * @param {Object} args - Tool arguments from the LLM
 * @returns {Object} API response or error object
 */
async function executeRecommendationTool(args) {
  const url = `${FIXIT_API_URL}/api/recommend`;

  const payload = {
    problem_description: args.problem_description,
    latitude: args.latitude,
    longitude: args.longitude,
    user_id: args.user_id || null,
    radius_km: args.radius_km || 10,
    top_k: args.top_k || 3,
  };

  console.log(`[FixIt Tool] POST ${url}`);
  console.log(`[FixIt Tool] Payload:`, JSON.stringify(payload, null, 2));

  try {
    const response = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    });

    console.log(
      `[FixIt Tool] Response: ${response.status} — ${response.data.recommendations?.length || 0} technicians found`
    );

    return response.data;
  } catch (error) {
    const status = error.response?.status;
    const body = error.response?.data;

    console.error(`[FixIt Tool] Error: ${status || error.code}`, body || error.message);

    if (status === 404) {
      return {
        error: "No technicians found within the search radius.",
        suggestion: "Try increasing radius_km or broadening the problem description.",
      };
    }
    if (status === 422) {
      return {
        error: "Invalid request parameters.",
        details: body,
      };
    }
    if (status === 503) {
      return {
        error: "Recommendation engine is still loading. Please retry in a few seconds.",
      };
    }

    return {
      error: `Failed to reach FixIt API: ${error.message}`,
      suggestion: "Ensure the FastAPI server is running: python run.py",
    };
  }
}

// ── Main Chat Function with Prompt-Based Tool Loop ──────────

/**
 * Run a full diagnostic conversation with Gemma 3 4B via Ollama.
 * Uses prompt-based tool calling (parses model text output for
 * tool_call JSON blocks) since Gemma 3 doesn't support native tools.
 *
 * @param {Array} userMessages - Array of message objects
 *   For text-only: [{ role: "user", content: "..." }]
 *   For multimodal: [{ role: "user", content: "...", images: ["base64..."] }]
 * @returns {Object} { response: string, serviceOrder: object|null, iterations: number }
 */
async function diagnoseWithOllama(userMessages) {
  // Build conversation with system prompt
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...userMessages,
  ];

  let iterations = 0;

  while (iterations < MAX_ITERATIONS) {
    iterations++;
    console.log(`\n[Ollama] Iteration ${iterations}/${MAX_ITERATIONS}`);

    // ── Call Ollama /api/chat (NO tools param) ───────────────
    let ollamaResponse;
    try {
      ollamaResponse = await axios.post(
        `${OLLAMA_URL}/api/chat`,
        {
          model: OLLAMA_MODEL,
          messages,
          stream: false,
          options: {
            temperature: 0.1,
            num_predict: 2048,
          },
        },
        {
          timeout: OLLAMA_TIMEOUT,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      if (error.code === "ECONNREFUSED") {
        throw new Error(
          `Cannot connect to Ollama at ${OLLAMA_URL}. ` +
            `Ensure Ollama is running: ollama serve`
        );
      }
      if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
        throw new Error(
          `Ollama request timed out after ${OLLAMA_TIMEOUT}ms. ` +
            `The model may still be loading. Try again.`
        );
      }
      // Log the actual Ollama error for debugging
      console.error(
        "[Ollama] Request error:",
        error.response?.data || error.message
      );
      throw error;
    }

    const msg = ollamaResponse.data.message;
    const responseText = msg.content || "";

    console.log(`[Ollama] Response length: ${responseText.length} chars`);

    // ── Check if the model wants to call a tool ─────────────
    const toolCall = parseToolCall(responseText);

    if (toolCall) {
      console.log(`[Ollama] Detected tool call: ${toolCall.tool}`);
      console.log(
        `[Ollama] Args:`,
        JSON.stringify(toolCall.arguments, null, 2)
      );

      // Add the assistant's message to history
      messages.push({ role: "assistant", content: responseText });

      // Execute the tool
      let toolResult;
      if (toolCall.tool === "get_technician_recommendation") {
        toolResult = await executeRecommendationTool(toolCall.arguments);
      } else {
        toolResult = { error: `Unknown tool: ${toolCall.tool}` };
      }

      console.log(`[Ollama] Tool result received, feeding back to model...`);

      // Feed result back as a user message (Gemma 3 doesn't have a "tool" role)
      messages.push({
        role: "user",
        content:
          `Here is the result from the get_technician_recommendation tool:\n\n` +
          `\`\`\`json\n${JSON.stringify(toolResult, null, 2)}\n\`\`\`\n\n` +
          `Now compile the final service_order JSON based on this data.`,
      });

      // Continue the loop — model will process tool results
      continue;
    }

    // ── No tool call — this is the final response ───────────
    console.log(`[Ollama] Final response received (iteration ${iterations})`);

    // Try to extract service order JSON
    let serviceOrder = null;
    const jsonMatch = responseText.match(
      /\{[\s\S]*"service_order"[\s\S]*\}/
    );
    if (jsonMatch) {
      try {
        serviceOrder = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.warn("[Ollama] Failed to parse service order JSON:", e.message);
        // Try a more targeted extraction from ```json blocks
        const fencedJson = responseText.match(/```json\s*\n?([\s\S]*?)```/);
        if (fencedJson) {
          try {
            serviceOrder = JSON.parse(fencedJson[1].trim());
          } catch (e2) {
            console.warn("[Ollama] Also failed on fenced JSON:", e2.message);
          }
        }
      }
    }

    return {
      response: responseText,
      serviceOrder,
      iterations,
    };
  }

  // Safety: max iterations exceeded
  throw new Error(
    `Tool-calling loop exceeded ${MAX_ITERATIONS} iterations. ` +
      `The model may be stuck in a loop.`
  );
}

// ── Health Check ────────────────────────────────────────────

/**
 * Check if Ollama is reachable and the model is available.
 * @returns {Object} { ollama: boolean, model: boolean, modelName: string }
 */
async function checkOllamaHealth() {
  try {
    const resp = await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 5000 });
    const models = resp.data.models || [];
    const hasModel = models.some(
      (m) => m.name === OLLAMA_MODEL || m.name.startsWith(OLLAMA_MODEL)
    );

    return {
      ollama: true,
      model: hasModel,
      modelName: OLLAMA_MODEL,
      availableModels: models.map((m) => m.name),
    };
  } catch (error) {
    return {
      ollama: false,
      model: false,
      modelName: OLLAMA_MODEL,
      error: error.message,
    };
  }
}

/**
 * Check if the FixIt API is reachable.
 * @returns {Object} Health status
 */
async function checkFixItHealth() {
  try {
    const resp = await axios.get(`${FIXIT_API_URL}/health`, { timeout: 5000 });
    return { reachable: true, ...resp.data };
  } catch (error) {
    return { reachable: false, error: error.message };
  }
}

module.exports = {
  diagnoseWithOllama,
  checkOllamaHealth,
  checkFixItHealth,
  SYSTEM_PROMPT,
};
