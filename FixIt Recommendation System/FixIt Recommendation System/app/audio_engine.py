"""
FixIt AI System — Audio Transcription Engine
Uses openai-whisper to transcribe user audio sent from the mobile app.
"""

import base64
import logging
import os
import shutil
import tempfile
import whisper
import imageio_ffmpeg

# Inject the strictly bundled FFmpeg binary path into the system PATH
# and ensure it is named exactly "ffmpeg.exe" as expected by Whisper.
_ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
ffmpeg_dir = os.path.dirname(_ffmpeg_exe)
_ffmpeg_alias = os.path.join(ffmpeg_dir, "ffmpeg.exe")

if not os.path.exists(_ffmpeg_alias):
    try:
        shutil.copy(_ffmpeg_exe, _ffmpeg_alias)
    except Exception as e:
        pass

os.environ["PATH"] = ffmpeg_dir + os.pathsep + os.environ.get("PATH", "")

logger = logging.getLogger(__name__)

class AudioEngine:
    def __init__(self, model_name: str = "base"):
        """
        Initializes the Whisper model.
        Model options: tiny, base, small, medium, large
        'base' provides a good balance of speed and accuracy.
        """
        self.model_name = model_name
        self.model = None
        self._ready = False

    def build(self):
        """Loads the localized Whisper model into memory."""
        logger.info(f"Loading Whisper STT model '{self.model_name}'...")
        try:
            self.model = whisper.load_model(self.model_name)
            self._ready = True
            logger.info("✅ Whisper STT model ready.")
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {e}")

    async def transcribe_base64(self, audio_base64: str) -> str:
        """
        Decodes base64 audio, saves it temporarily, and runs transcription.
        Returns the transcribed text.
        """
        if not self._ready or self.model is None:
            raise RuntimeError("Whisper model is not loaded.")

        # Decode base64
        try:
            # Strip data URI prefix if present (e.g., data:audio/wav;base64,...)
            if "base64," in audio_base64:
                audio_base64 = audio_base64.split("base64,")[1]
            audio_bytes = base64.b64decode(audio_base64)
        except Exception as e:
            raise ValueError(f"Invalid base64 audio format: {e}")

        # Save to temporary file (Whisper expects a file path or numpy array)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
            temp_path = temp_audio.name
            temp_audio.write(audio_bytes)

        try:
            # Run transcription (fp16=False to avoid warnings on CPU if no GPU available)
            logger.info(f"Transcribing audio file ({len(audio_bytes)} bytes)...")
            result = self.model.transcribe(temp_path, fp16=False)
            transcription = result.get("text", "").strip()
            logger.info(f"Transcription complete: '{transcription}'")
            return transcription
        finally:
            # Clean up the temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
