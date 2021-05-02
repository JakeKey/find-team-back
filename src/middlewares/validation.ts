import { Request, Response, NextFunction } from 'express';
import { AnySchema } from 'joi';

import { Status } from 'types/enums';

type ValidationObject = Partial<Record<'body' | 'params' | 'query', AnySchema>>;

export const validation = (schema: ValidationObject) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body, params, query } = schema;

  const result = {
    body: body?.validate(req.body),
    params: params?.validate(req.params),
    query: query?.validate(req.query),
  };

  if (result.body?.error) {
    return res.sendStatus(Status.BAD_REQUEST);
  } else {
    next();
  }
};
