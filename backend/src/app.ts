import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { clerkMiddleware } from '@clerk/express';
import router from './routes';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(compression());

export const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
});

app.use(limiter);
app.use(pinoHttp({ logger }));
app.use(clerkMiddleware());

app.get('/', (req, res) => {
  res.json({
    message: 'ACCESS BLOCKED',
  });
});

app.use('/api', router);

export default app;
