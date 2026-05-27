import pino from 'pino';

// Always use pretty-printing for readable logs
// Logs appear on server regardless of client origin (local IP, AWS, etc.)
const transport = pino.transport({
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'HH:MM:ss Z',
    ignore: 'pid,hostname',
    singleLine: false,
    messageFormat: '{levelLabel} - {msg}',
    customColors: 'err:red,warn:yellow,info:blue,debug:gray',
  },
});

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    serializers: {
      req: pino.stdSerializers.req,
      err: pino.stdSerializers.err,
      res: pino.stdSerializers.res,
    },
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers["x-api-key"]',
        'res.headers["x-api-key"]',
        'body.password',
        'body.token',
        'body.refreshToken',
        'refreshToken',
        'accessToken',
        'user.password',
      ],
      censor: '[REDACTED]',
    },
  },
  transport
);

export default logger;
