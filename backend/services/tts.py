import httpx
from tenacity import retry, stop_after_attempt, wait_exponential
from ..settings import settings

# Pour le debug: 1 tentative et timeout 30s (remets 3 tentatives / 120s en prod si besoin)
@retry(stop=stop_after_attempt(1), wait=wait_exponential(min=1, max=8))
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
        "text": text[:5000],  # sécurité: limite le payload
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.7},
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(url, headers=headers, json=payload)
            r.raise_for_status()
            with open(out_path, "wb") as f:
                f.write(r.content)
    except httpx.HTTPStatusError as e:
        body = e.response.text if e.response is not None else ""
        code = e.response.status_code if e.response is not None else "?"
        # Message plus clair pour le cas free-tier/401/429
        if code == 401 and "detected_unusual_activity" in body:
            raise RuntimeError("ElevenLabs 401: compte Free bloqué (VPN/proxy ou usage serveur). Passe en plan payant ou contacte le support.") from e
        raise RuntimeError(f"ElevenLabs HTTP {code}: {body}") from e


async def synthesize(text: str, voice_id_or_name: str, out_path: str):
    provider = (getattr(settings, "TTS_PROVIDER", "elevenlabs") or "elevenlabs").lower()
    if provider == "elevenlabs":
        await elevenlabs_tts(text, voice_id_or_name, out_path)
    else:
        raise NotImplementedError(f"TTS provider {provider} not implemented")
