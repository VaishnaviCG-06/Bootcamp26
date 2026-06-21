# PixelDream ✦ — AI Image Generator

A clean, deployable **Streamlit** web app that lets you type a prompt, pick an art style, and generate an AI image — powered by the **Hugging Face Inference API** (free monthly credits, no GPU needed).

---

## What the project does

PixelDream takes a text prompt from the user, enriches it with a chosen art-style suffix (Cyberpunk, Anime, Oil Painting, etc.), and sends it to the **FLUX.1-schnell** model via the Hugging Face Inference API. The generated image is displayed instantly inside the browser. Users can also download the image, browse their prompt history, and use advanced options like negative prompts and multi-image generation.

---

## Project structure

```
image-gen-chatbot/
├── app.py              # Streamlit UI — all visual components
├── api.py              # Hugging Face API integration
├── prompts.py          # Style definitions & prompt-building logic
├── requirements.txt    # Python dependencies
├── .env.example        # Template for your local API key
├── .gitignore          # Keeps secrets out of Git
└── .streamlit/
    ├── config.toml             # Theme & server settings
    └── secrets.toml.example    # Template for Streamlit Cloud secrets
```

---

## How to run locally

### 1 — Prerequisites

- Python 3.9 or newer  
- pip

### 2 — Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/image-gen-chatbot.git
cd image-gen-chatbot
```

### 3 — Create a virtual environment (recommended)

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 4 — Install dependencies

```bash
pip install -r requirements.txt
```

### 5 — Add your Hugging Face token

Copy the example file and fill in your token:

```bash
cp .env.example .env
```

Open `.env` in any text editor and replace `hf_your_token_here` with your real token (see **How to get a free HF token** below).

### 6 — Run the app

```bash
streamlit run app.py
```

The app opens at `http://localhost:8501` in your browser.

---

## How to get a free Hugging Face token

1. Go to [huggingface.co](https://huggingface.co) and create a free account.
2. Click your profile picture → **Settings** → **Access Tokens**.
3. Click **New token**, give it a name (e.g. `pixeldream`), set the role to **Read**, and click **Create token**.
4. Copy the token (starts with `hf_`) and paste it into your `.env` file as `HF_TOKEN=hf_...`.

> **Free tier:** HF gives every account free monthly Inference API credits — more than enough for a project like this.

---

## How to deploy on Streamlit Community Cloud (free)

1. Push your project to a **public GitHub repository** (make sure `.env` and `secrets.toml` are in `.gitignore`).
2. Go to [share.streamlit.io](https://share.streamlit.io) and sign in with GitHub.
3. Click **New app** → pick your repo, branch (`main`), and main file (`app.py`).
4. Before deploying, open **Advanced settings → Secrets** and paste:
   ```toml
   HF_TOKEN = "hf_your_actual_token_here"
   ```
5. Click **Deploy** — your app will be live at a public URL in ~60 seconds.

---

## Known limitation

The **FLUX.1-schnell** model on the free HF Inference tier can take **10–60 seconds** on a cold start (when the model has not been used recently). Subsequent requests in the same session are much faster. There is no websocket-style progress bar — the spinner just waits until the image arrives.

---

## Features

| Feature | Status |
|---|---|
| Text prompt input | ✅ |
| Style radio buttons (8 styles) | ✅ |
| Live final-prompt preview | ✅ |
| AI image generation (FLUX.1-schnell) | ✅ |
| Download button | ✅ |
| Prompt history | ✅ |
| Negative prompt input | ✅ |
| Image size selector | ✅ |
| Multiple image generation (1–4) | ✅ |
| Clean file structure | ✅ |
| No hardcoded API keys | ✅ |
| Deployable to Streamlit Cloud | ✅ |
