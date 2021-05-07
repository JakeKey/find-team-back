import { CONFIG_CONSTS } from 'config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import winston from 'winston';
import expressWinston from 'express-winston';

import { auth } from 'routes/unprotected';
import { createDebug } from 'utils';

const isTestEnv = CONFIG_CONSTS.NODE_ENV !== 'test';

const debug = createDebug('connect');

const app = express();

app.use(
  cors({
    origin: CONFIG_CONSTS.NODE_FTEAM_FRONT_ORIGIN,
    optionsSuccessStatus: 200,
  })
);
app.use(helmet());
app.use(express.json());

if (isTestEnv) {
  app.use(
    expressWinston.logger({
      transports: [new winston.transports.Console()],
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
      meta: false,
      msg: 'HTTP {{res.statusCode}} {{req.method}} {{req.url}} {{res.responseTime}}ms',
    })
  );
}

app.use('/api/auth', auth);

if (isTestEnv) {
  app.use(
    expressWinston.errorLogger({
      transports: [new winston.transports.Console()],
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    })
  );
}

app.listen(CONFIG_CONSTS.NODE_FTEAM_PORT, () => {
  debug(`The application is listening on port ${CONFIG_CONSTS.NODE_FTEAM_PORT}!`);
});

export { app };
