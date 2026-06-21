"""
api.py
──────
Handles all communication with the Hugging Face Inference API
using the official huggingface_hub InferenceClient SDK.

Model used: black-forest-labs/FLUX.1-schnell
  - Free monthly credits with a Hugging Face account token
  - No GPU or billing setup needed
  - Returns a PIL Image which we convert to PNG bytes

The API key is loaded from:
  - Locally  → .env file  (HF_TOKEN=hf_xxxx)
  - Deployed → Streamlit Secrets  (st.secrets["HF_TOKEN"])
"""

import io
import os

import streamlit as st
from dotenv import load_dotenv

# Load .env file if present (local development)
load_dotenv()


def _get_token() -> str | None:
    """
    Retrieve the Hugging Face token.
    Priority: Streamlit Secrets → environment variable (.env)
    """
    try:
        return st.secrets["HF_TOKEN"]
    except (KeyError, FileNotFoundError):
        pass
    return os.getenv("HF_TOKEN")


def generate_image(
    prompt: str,
    width: int = 512,
    height: int = 512,
) -> tuple[bytes | None, str | None]:
    """
    Generate an image using the Hugging Face InferenceClient.

    Args:
        prompt:  Fully-built prompt (user text + style suffix).
        width:   Output image width in pixels.
        height:  Output image height in pixels.

    Returns:
        (image_bytes, None)  on success
        (None, error_str)    on failure
    """
    token = _get_token()

    if not token:
        return None, (
            "🔑 No API key found. "
            "Add HF_TOKEN=hf_xxxx to your .env file, "
            "or to Streamlit Secrets when deploying."
        )

    # Import here so the error is surfaced cleanly if the package is missing
    try:
        from huggingface_hub import InferenceClient
    except ImportError:
        return None, "❌ huggingface_hub package not installed. Run: pip install huggingface_hub"

    try:
        client = InferenceClient(
            provider="auto",   # picks the best available free provider automatically
            api_key=token,
        )

        # Returns a PIL.Image.Image object
        pil_image = client.text_to_image(
            prompt,
            model="black-forest-labs/FLUX.1-schnell",
            width=width,
            height=height,
        )

        # Convert PIL Image → PNG bytes for Streamlit
        buf = io.BytesIO()
        pil_image.save(buf, format="PNG")
        return buf.getvalue(), None

    except Exception as e:
        err = str(e)

        if "401" in err or "authorization" in err.lower() or "token" in err.lower():
            return None, "🔑 Invalid or expired API token. Check your HF_TOKEN."
        elif "429" in err or "rate" in err.lower():
            return None, "🚦 Rate limit reached. Wait a moment and try again."
        elif "503" in err or "loading" in err.lower():
            return None, (
                "⏳ Model is loading on Hugging Face servers. "
                "Wait 20–30 seconds and try again."
            )
        elif "timeout" in err.lower():
            return None, "⏱️ Request timed out. Try again in a moment."
        else:
            return None, f"❌ Generation failed: {err}"
