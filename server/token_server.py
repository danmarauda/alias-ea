"""
ALIAS Executive Agent - Token Server
FastAPI server for LiveKit authentication and room management.
"""

import os
from typing import Optional

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from livekit import api
from pydantic import BaseModel, Field

load_dotenv()

LIVEKIT_URL = os.getenv("LIVEKIT_URL", "ws://localhost:7880")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY", "devkey")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET", "secret")


class TokenRequest(BaseModel):
    room: str = Field(..., description="Room to join or create")
    identity: str = Field(..., description="Unique participant identity")
    name: Optional[str] = Field(None, description="Optional display name")
    auto_create_room: bool = Field(True, description="Create room if it doesn't exist")


class RoomCreateRequest(BaseModel):
    name: str = Field(..., description="Room name")


app = FastAPI(
    title="ALIAS Voice Agent Token Server",
    description="Authentication server for LiveKit voice agent connections",
    version="1.0.0",
)

# Enable CORS for mobile app access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _require_config():
    if not (LIVEKIT_URL and LIVEKIT_API_KEY and LIVEKIT_API_SECRET):
        raise HTTPException(
            status_code=500,
            detail="LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET must be set",
        )


async def _ensure_room(room_name: str):
    """Create the room if it does not already exist."""
    try:
        async with api.LiveKitAPI() as lkapi:
            await lkapi.room.create_room(api.CreateRoomRequest(name=room_name))
    except Exception as exc:
        msg = str(exc).lower()
        if "already exists" in msg or "exists" in msg:
            return
        raise HTTPException(status_code=500, detail=f"Failed to create room: {exc}")


@app.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "alias-voice-agent"}


@app.post("/token")
async def get_token(body: TokenRequest):
    """Generate a LiveKit access token for a participant."""
    _require_config()

    if body.auto_create_room:
        await _ensure_room(body.room)

    grants = api.VideoGrants(
        room_join=True,
        room=body.room,
        can_publish=True,
        can_subscribe=True,
        can_publish_data=True,
    )

    token = (
        api.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
        .with_identity(body.identity)
        .with_name(body.name or body.identity)
        .with_grants(grants)
    )

    return {
        "token": token.to_jwt(),
        "url": LIVEKIT_URL,
        "identity": body.identity,
        "room": body.room,
    }


@app.post("/rooms")
async def create_room(body: RoomCreateRequest):
    """Create a new LiveKit room."""
    _require_config()
    await _ensure_room(body.name)
    return {"room": body.name, "created": True}


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8008"))
    print(f"🚀 ALIAS Token Server starting on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)

