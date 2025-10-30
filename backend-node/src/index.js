import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { authMiddleware } from './middleware/auth.js';
import apiRouter from './routes/api.js';

dotenv.config({ path: process.env.ENV_PATH || undefined });

const app = express();

const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 60);

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));
app.use(rateLimit({ windowMs: RATE_LIMIT_WINDOW_MS, max: RATE_LIMIT_MAX }));

app.use(authMiddleware);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', apiRouter);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/emofilter';

async function start() {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(MONGO_URI, { dbName: process.env.MONGO_DB || 'emofilter' });
    const { ensureTtlIndex } = await import('./models/MoodRecord.js');
    await ensureTtlIndex();
    app.listen(PORT, () => console.log(`Controller listening on ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();


