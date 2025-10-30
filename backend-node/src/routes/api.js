import { Router } from 'express';
import axios from 'axios';
import { MoodRecord } from '../models/MoodRecord.js';

const router = Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://ai-python:5000';

async function saveAndRespond(req, res, source, aiPath, payload) {
  try {
    const { data } = await axios.post(`${AI_SERVICE_URL}${aiPath}`, payload, { timeout: 15_000 });
    const userId = req.user?.id || req.headers['x-user-id'] || 'anonymous';
    const record = await MoodRecord.create({
      userId,
      source,
      mood: data.mood,
      score: data.score,
      label: data.label,
      metadata: data.metadata
    });
    return res.json({ ...data, id: record._id });
  } catch (err) {
    const status = err.response?.status || 500;
    return res.status(status).json({ error: 'AI service failed', details: err.message });
  }
}

router.post('/analyze-text', async (req, res) => {
  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: 'text is required' });
  return saveAndRespond(req, res, 'text', '/analyze-text', { text });
});

router.post('/detect-emotion', async (req, res) => {
  const { image } = req.body || {};
  if (!image) return res.status(400).json({ error: 'image (base64) is required' });
  return saveAndRespond(req, res, 'image', '/detect-emotion', { image });
});

router.post('/analyze-audio', async (req, res) => {
  const { audio } = req.body || {};
  if (!audio) return res.status(400).json({ error: 'audio (base64) is required' });
  return saveAndRespond(req, res, 'audio', '/analyze-audio', { audio });
});

export default router;


