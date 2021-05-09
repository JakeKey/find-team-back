import { Request, Response, NextFunction } from 'express';
import { AnySchema } from 'joi';

import { ErrorCodes, Status } from 'types/enums';
import { formatError } from 'utils';

export type ValidationObject = Partial<Record<'body' | 'params' | 'query', AnySchema>>;

export const validation = (schema?: ValidationObject) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!schema) {
    next();
    return;
  }
  const { body, params, query } = schema;

  const result = {
    body: body?.validate(req.body),
    params: params?.validate(req.params),
    query: query?.validate(req.query),
  };

  const errors = { ...result.body?.error, ...result.params?.error, ...result.query?.error };

  if (Object.keys(errors).length) {
    res.status(Status.BAD_REQUEST).json(formatError(ErrorCodes.VALIDATION_ERROR));
  } else {
    next();
  }
};
