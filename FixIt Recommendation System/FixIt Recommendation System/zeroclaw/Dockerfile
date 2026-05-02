# ═══════════════════════════════════════════════════════════════
#  ZeroClaw — Multi-Stage Docker Build
#
#  Stage 1: Build ZeroClaw from Rust source (~3-5 min first run)
#  Stage 2: Slim runtime with just the binary + config files
# ═══════════════════════════════════════════════════════════════

# ── Stage 1: Rust Builder ────────────────────────────────────
FROM rust:1.78-slim-bookworm AS builder

RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    libssl-dev \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Clone and build ZeroClaw
RUN git clone https://github.com/zeroclaw-labs/zeroclaw.git /zeroclaw-src \
    && cd /zeroclaw-src \
    && cargo build --release --locked \
    && cargo install --path . --root /usr/local --locked

# ── Stage 2: Slim Runtime ────────────────────────────────────
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

# Copy the compiled ZeroClaw binary
COPY --from=builder /usr/local/bin/zeroclaw /usr/local/bin/zeroclaw

# Set up ZeroClaw workspace
RUN mkdir -p /root/.zeroclaw/workspace/skills/fixit-diagnose /root/.zeroclaw/state

# Copy configuration files from build context
COPY config.toml /root/.zeroclaw/config.toml
COPY IDENTITY.md /root/.zeroclaw/workspace/IDENTITY.md
COPY skills/fixit-diagnose/SKILL.md /root/.zeroclaw/workspace/skills/fixit-diagnose/SKILL.md

# Expose the gateway port
EXPOSE 3000

# Start the ZeroClaw gateway
CMD ["zeroclaw", "gateway"]
