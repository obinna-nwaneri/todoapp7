import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  const app = await createApp();
  app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port}`);
  });
}

bootstrap();
