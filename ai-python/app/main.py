from fastapi import FastAPI
from pydantic import BaseModel
from typing import Any, Dict

app = FastAPI()


class TextPayload(BaseModel):
    text: str


class ImagePayload(BaseModel):
    image: str  # base64 data URL or raw base64


class AudioPayload(BaseModel):
    audio: str  # base64 audio


def mock_result(mood: str, score: float, label: str, metadata: Dict[str, Any]):
    return {"mood": mood, "score": score, "label": label, "metadata": metadata}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze-text")
def analyze_text(payload: TextPayload):
    text = payload.text.lower()
    if any(w in text for w in ["sad", "bad", "upset", "angry"]):
        return mock_result("sad", 0.87, "NEGATIVE", {"words": len(text.split())})
    return mock_result("happy", 0.92, "POSITIVE", {"words": len(text.split())})


@app.post("/detect-emotion")
def detect_emotion(payload: ImagePayload):
    return mock_result("neutral", 0.65, "NEUTRAL", {"faces_detected": 1})


@app.post("/analyze-audio")
def analyze_audio(payload: AudioPayload):
    return mock_result("calm", 0.71, "NEUTRAL", {"duration_sec": 3.2})


