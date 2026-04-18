import 'dotenv/config';
import app from './app';
import { logger } from './app';
import prisma from './config/db';
import redisClient from './config/redis';

const PORT = process.env.PORT || 3001;

async function start() {
  await prisma.$connect();
  logger.info('Database connected');

  await redisClient.ping();
  logger.info('Redis connected');

  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
}

start().catch((err) => {
  logger.error(err, 'Failed to start server');
  process.exit(1);
});
