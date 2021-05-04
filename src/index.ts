import 'config';

import express from 'express';
import helmet from 'helmet';
import winston from 'winston';
import expressWinston from 'express-winston';

import { auth } from 'routes/unprotected';

const app = express();

app.use(helmet());
app.use(express.json());

app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    meta: false,
    msg: 'HTTP {{res.statusCode}} {{req.method}} {{req.url}} {{res.responseTime}}ms',
  })
);

app.use('/api/auth', auth);

app.use(
  expressWinston.errorLogger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
  })
);

app.listen(3000, () => {
  console.log('The application is listening on port 3000!');
});
