import { env } from "@FixIt/env/server";
import app from './app.js';
import { logger } from './shared/logger.js';

app.listen(env.PORT, '0.0.0.0', () => {
  logger.info(`🚀 Server is running on port ${env.PORT}`);
});
