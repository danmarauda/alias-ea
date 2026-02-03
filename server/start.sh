#!/bin/bash
# ALIAS Voice Agent - Start All Services
# Usage: ./start.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting ALIAS Voice Agent Services${NC}"
echo ""

# Check for .env file
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Copying from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env with your API keys before continuing."
    exit 1
fi

# Check for required tools
if ! command -v uv &> /dev/null; then
    echo "❌ uv is not installed. Install with: curl -LsSf https://astral.sh/uv/install.sh | sh"
    exit 1
fi

# Install dependencies if needed
if [ ! -d ".venv" ]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    uv sync
fi

# Start LiveKit server in background (if not already running)
if ! lsof -i :7880 &> /dev/null; then
    echo -e "${GREEN}▶ Starting LiveKit server on port 7880...${NC}"
    livekit-server --dev --bind 0.0.0.0 &
    sleep 2
else
    echo -e "${GREEN}✓ LiveKit server already running on port 7880${NC}"
fi

# Start Token server in background
echo -e "${GREEN}▶ Starting Token server on port 8008...${NC}"
uv run python token_server.py &
TOKEN_PID=$!
sleep 1

# Start Voice agent
echo -e "${GREEN}▶ Starting Voice agent on port 8083...${NC}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}ALIAS Voice Agent is ready!${NC}"
echo ""
echo "Services running:"
echo "  • LiveKit Server: ws://localhost:7880"
echo "  • Token Server:   http://localhost:8008"
echo "  • Voice Agent:    port 8083"
echo ""
echo "Press Ctrl+C to stop all services"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Run agent in foreground
uv run python agent.py start

# Cleanup on exit
trap "kill $TOKEN_PID 2>/dev/null; pkill -f 'livekit-server' 2>/dev/null" EXIT

