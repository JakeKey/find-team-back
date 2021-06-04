import { NextFunction, Request, Response } from 'express';
import sinon, { SinonStatic } from 'sinon';

import middlewares from 'middlewares';
import { PoolClient, QueryResult } from 'pg';
import pool from 'dbconfig';

export const stubMiddlewares = (sinon: SinonStatic) => {
  const fakeMiddleware = async (req: Request, res: Response, next: NextFunction) => next();
  sinon.stub(middlewares, 'validation').callsFake(() => fakeMiddleware);
  sinon.stub(middlewares, 'reCaptchaVerify').callsFake(fakeMiddleware);
  const fakeAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    req.params.userId = '1';
    next();
  };
  sinon.stub(middlewares, 'authorise').callsFake(fakeAuthMiddleware);
};

export const stubConnectPool = () => {
  const queryStub = sinon.stub();

  const fakePoolClient = (): Partial<PoolClient> => ({
    query: queryStub,
    release: () => {},
  });

  const connectStub = sinon.stub(pool, 'connect').callsFake(fakePoolClient);

  return {
    connectStub,
    queryStub,
  };
};

export const fakeQueryResult = <T>(rows: T[]): Partial<QueryResult<T>> => ({
  rows,
});
