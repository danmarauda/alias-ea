# ALIAS Voice Agent - Railway Deployment
# Multi-stage build for optimized image size

# Stage 1: Builder
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    portaudio19-dev \
    && rm -rf /var/lib/apt/lists/*

# Install uv for fast package management
RUN pip install --no-cache-dir uv

# Copy dependency files
COPY pyproject.toml .

# Install Python dependencies
RUN uv pip install --system .

# Stage 2: Runtime
FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    portaudio19-dev \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy Python packages from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY agent.py token_server.py ./

# Create non-root user for security
RUN useradd -m -u 1000 agent && \
    chown -R agent:agent /app
USER agent

# Environment variables
ENV PYTHONUNBUFFERED=1

# Expose ports (agent: 8083, token server: 8008)
EXPOSE 8083 8008

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import sys; sys.exit(0)"

# Default command - run the agent
CMD ["python", "agent.py", "start"]

