// ═══════════════════════════════════════════════════════════════
//  FixIt Recommendation Tool — ZeroClaw Native Rust Plugin
//  
//  To use this, add it to the ZeroClaw source tree:
//    1. Copy this file to:  zeroclaw/src/tools/fixit_recommend.rs
//    2. Register it in:     zeroclaw/src/tools/mod.rs
//    3. Rebuild:            cargo build --release --locked
//
//  This is the PRODUCTION path. For quick demos, use the
//  SKILL.md approach or the Ollama fallback instead.
// ═══════════════════════════════════════════════════════════════

use async_trait::async_trait;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::env;
use std::time::Duration;

use crate::tools::traits::{Tool, ToolResult};

// ── Response types for deserialization ───────────────────────

#[derive(Debug, Deserialize)]
struct TechnicianMatch {
    technician_id: Value,
    name: String,
    category: String,
    match_score: f64,
    distance_km: f64,
    market_trust_score: f64,
    base_hourly_rate: i64,
}

#[derive(Debug, Deserialize)]
struct RecommendationResponse {
    user_id: Option<Value>,
    is_cold_start: bool,
    recommendations: Vec<TechnicianMatch>,
    engine_used: String,
}

// ── Tool Implementation ─────────────────────────────────────

pub struct FixItRecommendTool {
    client: Client,
    api_base: String,
}

impl FixItRecommendTool {
    pub fn new() -> Self {
        // Default: Windows host reachable from WSL2
        // Override with FIXIT_API_HOST env var
        let api_base = env::var("FIXIT_API_HOST")
            .unwrap_or_else(|_| "http://localhost:8000".to_string());

        let client = Client::builder()
            .timeout(Duration::from_secs(15))
            .build()
            .expect("Failed to build HTTP client");

        Self { client, api_base }
    }
}

#[async_trait]
impl Tool for FixItRecommendTool {
    fn name(&self) -> &str {
        "get_technician_recommendation"
    }

    fn description(&self) -> &str {
        "Fetch the top-rated available technicians for a home maintenance \
         problem from the FixIt Hybrid Recommendation Engine. The engine \
         uses Content-Based Filtering (TF-IDF + FAISS), Collaborative \
         Filtering (NMF), and MarketTrust reliability scoring. Returns \
         ranked technicians with match scores, distances, and trust ratings."
    }

    /// JSON Schema exposed to Gemma 3 4B so it knows how to call us.
    fn parameters_schema(&self) -> Value {
        json!({
            "type": "object",
            "properties": {
                "problem_description": {
                    "type": "string",
                    "description": "A clear, detailed description of the home maintenance \
                                    issue (5-1000 characters). Must be specific enough to \
                                    infer the service category. Examples: \
                                    'Kitchen sink leaking from the base of the faucet' → plumbing, \
                                    'AC unit blowing warm air and making rattling noise' → air condition, \
                                    'Ceiling fan wobbles dangerously when turned on high' → fan."
                },
                "latitude": {
                    "type": "number",
                    "description": "User's latitude in WGS-84 decimal degrees. \
                                    Must be between -90 and 90. \
                                    Example: 30.0444 (Cairo, Egypt)."
                },
                "longitude": {
                    "type": "number",
                    "description": "User's longitude in WGS-84 decimal degrees. \
                                    Must be between -180 and 180. \
                                    Example: 31.2357 (Cairo, Egypt)."
                },
                "user_id": {
                    "type": ["integer", "null"],
                    "description": "Optional existing user ID for personalized \
                                    recommendations based on booking history. \
                                    Pass null or omit for anonymous/cold-start users."
                },
                "radius_km": {
                    "type": "number",
                    "description": "Search radius in kilometres. Default 10. Max 100.",
                    "default": 10.0
                },
                "top_k": {
                    "type": "integer",
                    "description": "Number of technicians to return. Default 3. Max 20.",
                    "default": 3
                }
            },
            "required": ["problem_description", "latitude", "longitude"]
        })
    }

    /// Execute: POST to FixIt FastAPI and return the result.
    async fn execute(&self, args: Value) -> Result<ToolResult, anyhow::Error> {
        let url = format!("{}/api/recommend", self.api_base);

        // Validate required fields
        let problem = args["problem_description"]
            .as_str()
            .ok_or_else(|| anyhow::anyhow!("Missing required field: problem_description"))?;

        if problem.len() < 5 {
            return Ok(ToolResult {
                output: "Error: problem_description must be at least 5 characters.".to_string(),
                is_error: true,
            });
        }

        let latitude = args["latitude"]
            .as_f64()
            .ok_or_else(|| anyhow::anyhow!("Missing required field: latitude"))?;

        let longitude = args["longitude"]
            .as_f64()
            .ok_or_else(|| anyhow::anyhow!("Missing required field: longitude"))?;

        // Build the request payload
        let payload = json!({
            "problem_description": problem,
            "latitude": latitude,
            "longitude": longitude,
            "user_id": args.get("user_id").unwrap_or(&Value::Null),
            "radius_km": args.get("radius_km")
                .and_then(|v| v.as_f64())
                .unwrap_or(10.0),
            "top_k": args.get("top_k")
                .and_then(|v| v.as_i64())
                .unwrap_or(3),
        });

        // Make the HTTP request
        let response = match self.client
            .post(&url)
            .header("Content-Type", "application/json")
            .json(&payload)
            .send()
            .await
        {
            Ok(resp) => resp,
            Err(e) => {
                return Ok(ToolResult {
                    output: format!(
                        "Failed to reach FixIt API at {}: {}. \
                         Ensure the FastAPI server is running on Windows with: python run.py",
                        url, e
                    ),
                    is_error: true,
                });
            }
        };

        let status = response.status();

        if !status.is_success() {
            let body = response.text().await.unwrap_or_default();
            let hint = match status.as_u16() {
                404 => "No technicians found within the search radius. Try increasing radius_km.",
                422 => "Invalid request parameters. Check problem_description length and coordinate ranges.",
                503 => "Recommendation engine is still starting up. Please wait and retry.",
                _ => "Unexpected error from the FixIt API.",
            };
            return Ok(ToolResult {
                output: format!(
                    "FixIt API error (HTTP {}): {}\nHint: {}",
                    status, body, hint
                ),
                is_error: true,
            });
        }

        // Parse and return the response
        let body: Value = response.json().await?;
        Ok(ToolResult {
            output: serde_json::to_string_pretty(&body)?,
            is_error: false,
        })
    }
}
