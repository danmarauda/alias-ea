"""
ALIAS Executive Agent - Voice Agent
Real-time voice AI agent powered by LiveKit.

Uses:
- ElevenLabs Scribe V2 Realtime for speech-to-text
- OpenAI GPT-4o for language model
- ElevenLabs for text-to-speech
- Silero VAD for voice activity detection
"""

import logging
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("alias-voice-agent")
logger.setLevel(logging.INFO)

from livekit import agents
from livekit.agents import Agent, AgentSession
from livekit.plugins import openai, silero, elevenlabs
from livekit.plugins.elevenlabs import STT as ElevenLabsSTT


class AliasAssistant(Agent):
    """ALIAS Executive Agent - Your intelligent voice assistant."""

    def __init__(self) -> None:
        super().__init__(
            instructions="""You are ALIAS, an intelligent executive assistant.

You help professionals with:
- Task management and prioritization
- Meeting preparation and follow-ups
- Research and information synthesis
- Decision support and analysis
- Calendar and schedule optimization

Your communication style:
- Professional yet approachable
- Concise and actionable
- Proactive with suggestions
- Clear and well-organized

Important:
- Keep responses brief for voice (2-3 sentences max)
- Avoid markdown, emojis, or special formatting
- Speak naturally as if in conversation
- Ask clarifying questions when needed""",
        )


async def entrypoint(ctx: agents.JobContext):
    """Main entry point for the voice agent."""
    await ctx.connect()

    logger.info("🎙️ Starting ALIAS voice session")

    # Create the assistant
    agent = AliasAssistant()

    # Speech-to-Text: ElevenLabs Scribe V2 Realtime
    stt = elevenlabs.STT(
        model_id="scribe_v2_realtime",
        language_code="en",
        tag_audio_events=True,
    )

    # Language Model: OpenAI GPT-4o
    llm = openai.LLM(
        model="gpt-4o-mini",
    )

    # Text-to-Speech: ElevenLabs
    tts = elevenlabs.TTS(
        voice="Rachel",  # Professional female voice
        model="eleven_turbo_v2_5",
    )

    # Voice Activity Detection: Silero
    vad = silero.VAD.load()

    # Create the agent session
    session = AgentSession(
        stt=stt,
        llm=llm,
        tts=tts,
        vad=vad,
    )

    try:
        await session.start(
            room=ctx.room,
            agent=agent,
        )

        # Generate initial greeting
        await session.generate_reply(
            instructions="Greet the user briefly. Introduce yourself as ALIAS, their executive assistant. Ask how you can help today."
        )

        # Keep the session running
        while True:
            await asyncio.sleep(1)

    except Exception as e:
        logger.error(f"Session error: {e}")
    finally:
        logger.info("🎙️ ALIAS voice session ended")


def main():
    """Run the voice agent."""
    agents.cli.run_app(
        agents.WorkerOptions(
            entrypoint_fnc=entrypoint,
            port=8083,
        )
    )


if __name__ == "__main__":
    main()

