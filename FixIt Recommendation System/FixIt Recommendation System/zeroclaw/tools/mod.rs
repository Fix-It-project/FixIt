// ═══════════════════════════════════════════════════════════════
//  ZeroClaw Tools Module — FixIt Extension
//
//  Add this registration to the ZeroClaw source tree's
//  src/tools/mod.rs file. This registers the FixIt Recommendation
//  tool alongside ZeroClaw's built-in tools.
//
//  Instructions:
//    1. Copy fixit_recommend.rs to zeroclaw/src/tools/
//    2. Add the lines below to the existing src/tools/mod.rs
//    3. Rebuild: cargo build --release --locked
// ═══════════════════════════════════════════════════════════════

// Add this line to the module declarations at the top of mod.rs:
mod fixit_recommend;

// Add this line inside the default_tools() function:
// Box::new(fixit_recommend::FixItRecommendTool::new()),

// ── Example: Full default_tools() with FixIt added ──────────
//
// pub fn default_tools() -> Vec<Box<dyn Tool>> {
//     vec![
//         // ... existing ZeroClaw built-in tools ...
//         Box::new(fixit_recommend::FixItRecommendTool::new()),
//     ]
// }
