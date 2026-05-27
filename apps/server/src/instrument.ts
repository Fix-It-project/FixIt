import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

// Initialize Sentry before any app code runs
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  integrations: [
    Sentry.httpIntegration(),
    nodeProfilingIntegration(),
  ],
  tracesSampleRate:
    process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profilesSampleRate:
    process.env.NODE_ENV === 'production' ? 0.05 : 1.0,
  beforeSend(event) {
    // Redact sensitive headers and cookies before sending to Sentry
    if (event.request) {
      if (event.request.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
      if (event.request.cookies) {
        event.request.cookies = {};
      }
    }
    return event;
  },
});
