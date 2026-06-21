import random

import streamlit as st

from api import generate_image
from prompts import STYLES, build_prompt

# ── Page config ────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="AI Image Generator",
    page_icon="🎨",
    layout="centered",
)

# ── Custom CSS ─────────────────────────────────────────────────────────────────
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    html, body, [class*="css"] { font-family: 'Inter', sans-serif; }

    .main-title {
        font-size: 2.4rem; font-weight: 700;
        background: linear-gradient(135deg, #6366f1, #ec4899);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        margin-bottom: 0.2rem;
    }
    .subtitle { color: #94a3b8; font-size: 1rem; margin-bottom: 2rem; }

    .history-card {
        background: #1e293b; border: 1px solid #334155;
        border-radius: 12px; padding: 0.8rem 1rem;
        margin-bottom: 0.6rem; font-size: 0.85rem; color: #cbd5e1;
    }
    .history-card strong { color: #a5b4fc; }

    .stButton > button {
        background: linear-gradient(135deg, #6366f1, #ec4899);
        color: white; border: none; border-radius: 8px;
        padding: 0.6rem 2rem; font-weight: 600;
        font-size: 1rem; width: 100%; transition: opacity 0.2s;
    }
    .stButton > button:hover { opacity: 0.9; }
</style>
""", unsafe_allow_html=True)

# ── Session state ──────────────────────────────────────────────────────────────
if "history" not in st.session_state:
    st.session_state.history = []

# ── Header ─────────────────────────────────────────────────────────────────────
st.markdown('<p class="main-title">🎨 AI Image Generator</p>', unsafe_allow_html=True)
st.markdown('<p class="subtitle">Type a prompt, pick a style, and watch it come alive.</p>', unsafe_allow_html=True)

# ── Inputs ─────────────────────────────────────────────────────────────────────
st.subheader("✏️ Describe your image")
user_prompt = st.text_input(
    label="Image Prompt",
    placeholder="e.g. A futuristic Indian city at night",
    label_visibility="collapsed",
)

st.subheader("🎭 Choose a Style")
style = st.radio(
    label="Style",
    options=list(STYLES.keys()),
    horizontal=True,
    label_visibility="collapsed",
)

# ── Advanced options ───────────────────────────────────────────────────────────
with st.expander("⚙️ Advanced Options (optional)"):
    negative_prompt = st.text_input(
        "Negative Prompt",
        placeholder="e.g. blurry, low quality, distorted",
    )
    image_size = st.selectbox(
        "Image Size",
        ["512x512", "768x768", "1024x1024"],
        index=0,
    )
    num_images = st.selectbox("Number of Images", [1, 2, 3], index=0)

# ── Buttons ────────────────────────────────────────────────────────────────────
col1, col2, col3 = st.columns([1, 2, 1])
with col2:
    generate_clicked = st.button("✨ Generate Image")

EXAMPLE_PROMPTS = [
    "A lone astronaut exploring a bioluminescent alien jungle",
    "An ancient Indian temple submerged underwater, with fish swimming around",
    "A cozy treehouse café in autumn, warm lights glowing inside",
    "A dragon made entirely of clouds flying over mountain peaks",
    "A futuristic Mumbai skyline at sunset with flying vehicles",
]
if st.button("🎲 Surprise me with a random prompt"):
    st.info(f"💡 Try: **{random.choice(EXAMPLE_PROMPTS)}**")

st.divider()

# ── Generation logic ───────────────────────────────────────────────────────────
if generate_clicked:
    if not user_prompt.strip():
        st.warning("⚠️ Please enter an image prompt first.")
    else:
        # Build the final prompt (user text + style suffix + optional negative)
        final_prompt = build_prompt(user_prompt.strip(), style)
        if negative_prompt.strip():
            final_prompt += f", avoid: {negative_prompt.strip()}"

        width, height = map(int, image_size.split("x"))

        with st.spinner("🖌️ Generating your image… this may take 10–30 seconds"):
            images = []
            errors = []
            # Loop num_images times, calling generate_image() once per image
            for i in range(num_images):
                img_bytes, err = generate_image(
                    prompt=final_prompt,
                    width=width,
                    height=height,
                )
                if err:
                    errors.append(err)
                else:
                    images.append(img_bytes)

        if errors:
            st.error(f"❌ {errors[0]}")
        elif images:
            # Display images
            if len(images) == 1:
                st.image(images[0], caption=f'"{user_prompt}" — {style}', use_container_width=True)
                st.download_button(
                    "⬇️ Download Image",
                    data=images[0],
                    file_name="generated_image.png",
                    mime="image/png",
                )
            else:
                cols = st.columns(len(images))
                for i, (col, img_bytes) in enumerate(zip(cols, images)):
                    with col:
                        st.image(img_bytes, use_container_width=True)
                        st.download_button(
                            f"⬇️ Download #{i+1}",
                            data=img_bytes,
                            file_name=f"generated_image_{i+1}.png",
                            mime="image/png",
                            key=f"dl_{i}",
                        )

            # Save first image to history
            st.session_state.history.append({
                "prompt": user_prompt.strip(),
                "style": style,
                "final_prompt": final_prompt,
                "image_bytes": images[0],
            })
            st.success("✅ Image generated successfully!")

# ── Prompt History / Gallery ───────────────────────────────────────────────────
if st.session_state.history:
    st.subheader("🗂️ Prompt History")
    for i, entry in enumerate(reversed(st.session_state.history)):
        idx = len(st.session_state.history) - i
        with st.expander(f"#{idx}  —  {entry['prompt'][:60]}"):
            st.image(entry["image_bytes"], use_container_width=True)
            st.markdown(f"""
<div class="history-card">
  <strong>Prompt:</strong> {entry['prompt']}<br>
  <strong>Style:</strong> {entry['style']}<br>
  <strong>Final prompt sent to API:</strong> {entry['final_prompt']}
</div>
""", unsafe_allow_html=True)
            st.download_button(
                "⬇️ Download",
                data=entry["image_bytes"],
                file_name=f"image_{idx}.png",
                mime="image/png",
                key=f"hist_dl_{i}",
            )

    if st.button("🗑️ Clear History"):
        st.session_state.history = []
        st.rerun()
