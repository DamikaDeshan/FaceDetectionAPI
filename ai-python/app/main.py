from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Any, Dict
from transformers import pipeline
from deepface import DeepFace
import numpy as np
import librosa
import io
import base64
import soundfile as sf
import cv2

app = FastAPI()

# ---- Models loaded globally ----
sentiment_classifier = pipeline("sentiment-analysis")

def decode_base64_image(data):
    header, data = data.split(',', 1) if ',' in data else ('', data)
    img_arr = np.frombuffer(base64.b64decode(data), dtype=np.uint8)
    return cv2.imdecode(img_arr, cv2.IMREAD_COLOR)

class TextPayload(BaseModel):
    text: str

class ImagePayload(BaseModel):
    image: str  # base64 data URL or raw base64

class AudioPayload(BaseModel):
    audio: str  # base64 audio

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/analyze-text")
def analyze_text(payload: TextPayload):
    try:
        result = sentiment_classifier(payload.text)[0]
        mood = "happy" if result["label"] == "POSITIVE" else "sad"
        score = float(result["score"])
        label = result["label"]
        meta = {"words": len(payload.text.split())}
        return {"mood": mood, "score": score, "label": label, "metadata": meta}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing failed: {e}")

@app.post("/detect-emotion")
def detect_emotion(payload: ImagePayload):
    try:
        img = decode_base64_image(payload.image)
        result = DeepFace.analyze(img, actions=['emotion'], enforce_detection=False)
        emotion = result['dominant_emotion']
        score = float(result['emotion'][emotion])
        label = emotion.upper()
        faces = 1 if result.get('region', None) else 0
        return {"mood": emotion, "score": score, "label": label, "metadata": {"faces_detected": faces}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Face emotion failed: {e}")

@app.post("/analyze-audio")
def analyze_audio(payload: AudioPayload):
    try:
        audio_bytes = base64.b64decode(payload.audio)
        audio_np, sr = sf.read(io.BytesIO(audio_bytes))
        # Aggregate as mono if multi-channel
        if len(audio_np.shape) > 1:
            audio_np = np.mean(audio_np, axis=1)
        duration = len(audio_np) / sr
        energy = float(np.mean(audio_np ** 2))
        mood = "calm" if energy < 0.01 else "intense"
        label = mood.upper()
        return {"mood": mood, "score": energy, "label": label, "metadata": {"duration_sec": duration}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio analysis failed: {e}")


