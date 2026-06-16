"""
FixIt AI System — Audio Transcription Engine
Uses transformers to transcribe user audio sent from the mobile app,
specifically tuned for Egyptian Arabic and code-switching.
"""

import base64
import logging
import os
import shutil
import tempfile
import torch
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
import imageio_ffmpeg

# Inject the strictly bundled FFmpeg binary path into the system PATH
# and ensure it is named exactly "ffmpeg.exe" as expected by ffmpeg tools.
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
    def __init__(self, model_name: str = "IbrahimAmin/code-switched-egyptian-arabic-whisper-small"):
        """
        Initializes the Whisper model via Transformers.
        Defaults to a model fine-tuned for Egyptian Arabic and English code-switching.
        """
        self.model_name = model_name
        self.pipe = None
        self._ready = False

    def build(self):
        """Loads the localized Whisper model into memory using Transformers."""
        logger.info(f"Loading Whisper STT model '{self.model_name}'...")
        try:
            device = "cuda" if torch.cuda.is_available() else "cpu"
            torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32

            model = AutoModelForSpeechSeq2Seq.from_pretrained(
                self.model_name,
                torch_dtype=torch_dtype,
                low_cpu_mem_usage=True,
            ).to(device)

            processor = AutoProcessor.from_pretrained(self.model_name)

            self.pipe = pipeline(
                "automatic-speech-recognition",
                model=model,
                tokenizer=processor.tokenizer,
                feature_extractor=processor.feature_extractor,
                torch_dtype=torch_dtype,
                device=device,
            )
            
            self._ready = True
            logger.info(f"✅ Whisper STT model ready (running on {device}).")
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {e}")

    def _detect_audio_suffix(self, audio_base64: str) -> str:
        """Detect audio format from the data URI prefix and return a file suffix."""
        mime_to_suffix = {
            "audio/wav": ".wav",
            "audio/x-wav": ".wav",
            "audio/wave": ".wav",
            "audio/mp4": ".m4a",
            "audio/x-m4a": ".m4a",
            "audio/m4a": ".m4a",
            "audio/aac": ".aac",
            "audio/mpeg": ".mp3",
            "audio/mp3": ".mp3",
            "audio/webm": ".webm",
            "audio/ogg": ".ogg",
            "audio/flac": ".flac",
            "video/mp4": ".mp4",
        }
        if "data:" in audio_base64 and ";base64" in audio_base64:
            mime = audio_base64.split("data:")[1].split(";")[0].lower()
            return mime_to_suffix.get(mime, ".wav")
        return ".wav"  # Default to .wav — ffmpeg handles conversion

    async def transcribe_base64(self, audio_base64: str) -> str:
        """
        Decodes base64 audio, saves it temporarily, and runs transcription.
        Returns the transcribed text.
        """
        if not self._ready or self.pipe is None:
            raise RuntimeError("Whisper model is not loaded.")

        # Detect audio format from the data URI prefix
        suffix = self._detect_audio_suffix(audio_base64)

        # Decode base64
        try:
            # Strip data URI prefix if present (e.g., data:audio/wav;base64,...)
            if "base64," in audio_base64:
                audio_base64 = audio_base64.split("base64,")[1]
            audio_bytes = base64.b64decode(audio_base64)
        except Exception as e:
            raise ValueError(f"Invalid base64 audio format: {e}")

        if len(audio_bytes) < 100:
            raise ValueError("Audio data is too small to be a valid recording.")

        logger.info(f"Audio detected: {suffix} format, {len(audio_bytes)} bytes")

        # Save to temporary file (transformers pipeline expects a file path or numpy array)
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_audio:
            temp_path = temp_audio.name
            temp_audio.write(audio_bytes)

        try:
            # Run transcription
            logger.info(f"Transcribing audio file ({len(audio_bytes)} bytes)...")
            result = self.pipe(temp_path)
            transcription = result.get("text", "").strip()
            if not transcription:
                logger.warning("Whisper returned empty transcription.")
                return "(could not understand audio)"
            logger.info(f"Transcription complete: '{transcription}'")
            return transcription
        except Exception as e:
            logger.error(f"Whisper transcription failed: {e}", exc_info=True)
            raise RuntimeError(f"Audio transcription failed: {e}")
        finally:
            # Clean up the temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
