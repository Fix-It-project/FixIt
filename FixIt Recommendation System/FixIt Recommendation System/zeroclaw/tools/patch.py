import sys

with open('/zeroclaw-src/crates/zeroclaw-runtime/src/tools/mod.rs', 'r') as f:
    content = f.read()

target = "let mut tool_arcs: Vec<Arc<dyn Tool>> = vec!["
replacement = "let mut tool_arcs: Vec<Arc<dyn Tool>> = vec![\n        Arc::new(crate::tools::fixit_recommend::FixItRecommendTool::new()),"

if target in content:
    content = content.replace(target, replacement, 1)
    with open('/zeroclaw-src/crates/zeroclaw-runtime/src/tools/mod.rs', 'w') as f:
        f.write(content)
    print("Successfully patched mod.rs (tool_arcs)")
else:
    print("Could not find target in mod.rs")
    sys.exit(1)
