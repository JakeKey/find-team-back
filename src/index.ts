import { CONFIG_CONSTS } from 'config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import winston from 'winston';
import expressWinston from 'express-winston';

import { auth, projects, profile } from 'routes';
import { createDebug } from 'utils';

const debug = createDebug('connect');

const app = express();

debug(`App environment: ${CONFIG_CONSTS.NODE_ENV}`);
const isTestEnv = CONFIG_CONSTS.NODE_ENV === 'test';

app.use(
  cors({
    origin: CONFIG_CONSTS.NODE_FTEAM_FRONT_ORIGIN,
    optionsSuccessStatus: 200,
  })
);
app.use(helmet());
app.use(express.json());

if (!isTestEnv) {
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
app.use('/api/profile', profile);
app.use('/api/projects', projects);

if (!isTestEnv) {
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

if (isTestEnv) {
  module.exports = app;
}
