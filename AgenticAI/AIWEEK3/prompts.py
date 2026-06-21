"""
prompts.py
----------
All prompt-engineering logic lives here.

Adding a new style is as simple as adding a key → suffix pair to STYLES.
The build_prompt() function handles composing the final string sent to the API.
"""

# ── Style definitions ──────────────────────────────────────────────────────────
# Each value is a descriptive suffix appended to the user's raw prompt.
STYLES: dict[str, str] = {
    "Photorealistic": (
        "photorealistic, ultra-detailed, 8k, cinematic lighting, "
        "sharp focus, professional photography"
    ),
    "Anime": (
        "anime style, vibrant colors, detailed linework, "
        "Studio Ghibli inspired, cel shading, expressive"
    ),
    "Cyberpunk": (
        "cyberpunk aesthetic, neon lights, rain-soaked streets, "
        "futuristic dystopia, high contrast, dark atmosphere, "
        "blade runner vibes"
    ),
    "Fantasy": (
        "epic fantasy art, magical atmosphere, intricate details, "
        "dramatic lighting, painterly, heroic composition"
    ),
    "Watercolor": (
        "watercolor painting, soft washes, delicate brushstrokes, "
        "pastel tones, artistic, impressionistic"
    ),
    "Oil Painting": (
        "oil painting, rich textures, classical composition, "
        "museum quality, chiaroscuro lighting, baroque style"
    ),
    "Pixel Art": (
        "pixel art, 16-bit style, retro video game aesthetic, "
        "clean pixels, limited color palette, nostalgic"
    ),
    "Sketch": (
        "pencil sketch, detailed linework, cross-hatching, "
        "monochrome, hand-drawn, artistic"
    ),
}

# ── Quality boosters appended to every prompt ─────────────────────────────────
_QUALITY_SUFFIX = "best quality, highly detailed, masterpiece"


def build_prompt(user_prompt: str, style: str) -> str:
    """
    Combine the user's raw prompt with the chosen style suffix and quality boosters.

    Parameters
    ----------
    user_prompt : str
        The raw text the user typed.
    style : str
        One of the keys in STYLES.

    Returns
    -------
    str
        The final prompt string ready to be sent to the image generation API.

    Example
    -------
    >>> build_prompt("A cat wearing sunglasses", "Anime")
    'A cat wearing sunglasses, anime style, vibrant colors, ..., best quality, ...'
    """
    style_suffix = STYLES.get(style, "")
    parts = [user_prompt.rstrip(".").rstrip(",")]
    if style_suffix:
        parts.append(style_suffix)
    parts.append(_QUALITY_SUFFIX)
    return ", ".join(parts)


# ── Random prompt suggestions (bonus feature) ─────────────────────────────────
RANDOM_PROMPTS: list[str] = [
    "A futuristic Indian city at night with flying autos and holographic billboards",
    "A lone astronaut sitting on the moon watching a sunrise over Earth",
    "A dragon resting on top of the Eiffel Tower during a thunderstorm",
    "An underwater kingdom with bioluminescent coral and ancient ruins",
    "A cosy tea stall in the rain on a foggy mountain road in Himachal Pradesh",
    "A golden temple floating in the clouds above a misty forest",
    "A robot reading a book under a cherry blossom tree",
    "A street market in Mumbai reimagined in a cyberpunk future",
    "An enchanted forest with fireflies and a tiny glowing cottage",
    "A time-travelling train bursting through a portal in the desert",
]
