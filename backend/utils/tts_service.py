import edge_tts
import asyncio
from io import BytesIO

class TTSService:
    @staticmethod
    async def generate_audio_stream(text: str, lang: str = 'en') -> BytesIO:
        """
        Generates audio from text using Microsoft Edge TTS (Neural Voices).
        Returns a BytesIO stream.
        """
        try:
            # Voice Mapping for "Human Realistic" Sound
            # en: en-IN-NeerjaNeural (Soft, Professional Indian English)
            # ml: ml-IN-SobhanaNeural (Natural Malayalam)
            voice = "en-IN-NeerjaNeural"
            if lang == 'ml':
                voice = "ml-IN-SobhanaNeural"
            
            communicate = edge_tts.Communicate(text, voice)
            
            # Edge TTS writes to file or yields bytes. We want bytes.
            fp = BytesIO()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    fp.write(chunk["data"])
            
            fp.seek(0)
            return fp

        except Exception as e:
            print(f"Edge TTS Error: {e}")
            return BytesIO(b"Error generating audio")
