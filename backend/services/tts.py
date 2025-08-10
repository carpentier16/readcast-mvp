import httpx
from tenacity import retry, stop_after_attempt, wait_exponential
from ..settings import settings

@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=8))
async def elevenlabs_tts(text: str, voice_id: str, out_path: str):
    if not settings.ELEVENLABS_API_KEY:
        raise RuntimeError("Missing ELEVENLABS_API_KEY")
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "xi-api-key": settings.ELEVENLABS_API_KEY,
        "accept": "audio/mpeg",
        "Content-Type": "application/json",
    }
    payload = {
        "text": text[:5000],
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.7}
    }
    try:
        async with httpx.AsyncClient(timeout=120) as client:
            r = await client.post(url, headers=headers, json=payload)
            r.raise_for_status()
            with open(out_path, "wb") as f:
                f.write(r.content)
    except httpx.HTTPStatusError as e:
        body = e.response.text if e.response is not None else ""
        code = e.response.status_code if e.response is not None else "?"
        raise RuntimeError(f"ElevenLabs HTTP {code}: {body}") from e

async def synthesize(text: str, voice_id: str, out_path: str):
    provider = settings.TTS_PROVIDER.lower()
    if provider == "elevenlabs":
        await elevenlabs_tts(text, voice_id, out_path)
    else:
        raise NotImplementedError(f"TTS provider {provider} not implemented")
