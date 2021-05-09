import { describe, it, beforeEach } from 'mocha';
import chai, { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';
import { NextFunction, Request, Response } from 'express';

import middlewares from 'middlewares';
import pool from 'dbconfig';
import { PoolClient, QueryResult } from 'pg';
import { CheckIfUserExistSQLType } from 'sql';
import { ErrorCodes, Status } from 'types/enums';
import { RegisterReqBody } from 'types/interfaces';
import { formatError } from 'utils';

describe('Register route', () => {
  let connectStub: SinonStub,
    server: any,
    checkUserQueryStub: SinonStub,
    createUserQueryStub: SinonStub;
  const checkUserQueryResult = (
    username?: string,
    email?: string
  ): Partial<QueryResult<CheckIfUserExistSQLType>> => ({
    rows:
      username || email
        ? [
            {
              username: username || '',
              email: email || '',
              registered: true,
            },
          ]
        : [],
  });

  const testValues: RegisterReqBody = {
    username: 'test_username',
    password: 'test_password',
    email: 'test@mail.com',
    reCaptchaResponse: '12345678',
  };

  beforeEach(() => {
    const fakeMiddleware = async (req: Request, res: Response, next: NextFunction) => next();
    sinon.stub(middlewares, 'validation').callsFake(() => fakeMiddleware);
    sinon.stub(middlewares, 'reCaptchaVerify').callsFake(fakeMiddleware);

    const queryStub = sinon.stub();
    checkUserQueryStub = queryStub.onFirstCall();
    createUserQueryStub = queryStub.onSecondCall();
    const fakePoolClient = (): Partial<PoolClient> => ({
      query: queryStub,
      release: () => {},
    });
    connectStub = sinon.stub(pool, 'connect').callsFake(fakePoolClient);

    server = require('index');
  });

  it('should send status 201 if user does not exist', (done) => {
    checkUserQueryStub.returns(checkUserQueryResult());
    createUserQueryStub.returns({});

    chai
      .request(server)
      .post('/api/auth/register')
      .send(testValues)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.CREATED);
        done();
      });
  });

  it('should send status 403 and proper ErrorCode if username already exists', (done) => {
    checkUserQueryStub.returns(checkUserQueryResult(testValues.username));
    createUserQueryStub.returns({});

    chai
      .request(server)
      .post('/api/auth/register')
      .send(testValues)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.FORBIDDEN);
        expect(res.body).to.include(formatError(ErrorCodes.USERNAME_ALREADY_TAKEN));
        done();
      });
  });

  it('should send status 403 and proper ErrorCode if email already exists', (done) => {
    checkUserQueryStub.returns(checkUserQueryResult(testValues.username, testValues.email));
    createUserQueryStub.returns({});

    chai
      .request(server)
      .post('/api/auth/register')
      .send(testValues)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.FORBIDDEN);
        expect(res.body).to.include(formatError(ErrorCodes.EMAIL_ALREADY_REGISTERED));
        done();
      });
  });

  it('should send status 500 if pool.connect() throws', (done) => {
    connectStub.rejects();
    checkUserQueryStub.returns(checkUserQueryResult());
    createUserQueryStub.returns({});

    chai
      .request(server)
      .post('/api/auth/register')
      .send(testValues)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.INTERNAL_SERVER_ERROR);
        done();
      });
  });

  it('should send status 500 if first client.query() throws', (done) => {
    checkUserQueryStub.throws();
    createUserQueryStub.returns({});

    chai
      .request(server)
      .post('/api/auth/register')
      .send(testValues)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.INTERNAL_SERVER_ERROR);
        done();
      });
  });

  it('should send status 500 if second client.query() throws', (done) => {
    checkUserQueryStub.returns(checkUserQueryResult());
    createUserQueryStub.throws();

    chai
      .request(server)
      .post('/api/auth/register')
      .send(testValues)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.INTERNAL_SERVER_ERROR);
        done();
      });
  });
});
