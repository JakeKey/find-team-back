import { Request, Response, NextFunction } from 'express';

import { ErrorCodes, Status } from 'types/enums';
import { createDebug, formatError, tokenJWT } from 'utils';

const debug = createDebug('auth');

export const authorise = (
  req: Request<{}, {}, { token?: string }>,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.header('Authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    res.status(Status.UNAUTHORIZED).json(formatError(ErrorCodes.UNAUTHORIZED));
    return;
  }
  try {
    const result = tokenJWT.verify(token);
    debug('Authorisation middleware result', result);
    const { id } = result;
    if (!id) throw new Error('No user id in JWT');
    Object.defineProperty(req.params, 'userId', {
      value: id,
    });
    next();
  } catch (err) {
    debug('Authorisation middleware error', err);
    res.status(Status.UNAUTHORIZED).json(formatError(ErrorCodes.UNAUTHORIZED));
  }
};
