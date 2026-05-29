import pino from 'pino';

const isLambdaRuntime =
  Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
  Boolean(process.env.LAMBDA_TASK_ROOT);
const usePrettyTransport =
  process.env.NODE_ENV !== 'production' && !isLambdaRuntime;

const transport = usePrettyTransport
  ? pino.transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
        singleLine: false,
        messageFormat: '{levelLabel} - {msg}',
        customColors: 'err:red,warn:yellow,info:blue,debug:gray',
      },
    })
  : undefined;

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
