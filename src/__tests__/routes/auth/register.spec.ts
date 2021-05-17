import { describe, it, beforeEach } from 'mocha';
import chai, { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';

import { fakeQueryResult, stubConnectPool, stubMiddlewares } from '__tests__';
import { CheckIfUserExistSQLType } from 'sql';
import { ErrorCodes, Status } from 'types/enums';
import { RegisterReqBody } from 'types/interfaces';

describe('Register route', () => {
  let connectStubVar: SinonStub,
    checkUserQueryStub: SinonStub,
    createUserQueryStub: SinonStub,
    server: any;

  const checkUserQueryResult = (username?: string, email?: string) =>
    username || email
      ? fakeQueryResult<CheckIfUserExistSQLType>([
          {
            username: username || '',
            email: email || '',
            registered: true,
          },
        ])
      : fakeQueryResult<undefined>([]);

  const testValues: RegisterReqBody = {
    username: 'test_username',
    password: 'test_password',
    email: 'test@mail.com',
    reCaptchaResponse: '12345678',
  };

  beforeEach(() => {
    stubMiddlewares(sinon);

    const { connectStub, queryStub } = stubConnectPool();
    connectStubVar = connectStub;
    checkUserQueryStub = queryStub.onFirstCall();
    createUserQueryStub = queryStub.onSecondCall();

    server = require('index');
  });

  it('should send status 201 if user does not exist', (done) => {
    checkUserQueryStub.resolves(checkUserQueryResult());
    createUserQueryStub.resolves({});

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
    checkUserQueryStub.resolves(checkUserQueryResult(testValues.username));
    createUserQueryStub.resolves({});

    chai
      .request(server)
      .post('/api/auth/register')
      .send(testValues)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.FORBIDDEN);
        expect(res.body).to.include({ error: ErrorCodes.USERNAME_ALREADY_TAKEN });
        done();
      });
  });

  it('should send status 403 and proper ErrorCode if email already exists', (done) => {
    checkUserQueryStub.resolves(checkUserQueryResult(testValues.username, testValues.email));
    createUserQueryStub.resolves({});

    chai
      .request(server)
      .post('/api/auth/register')
      .send(testValues)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.FORBIDDEN);
        expect(res.body).to.include({ error: ErrorCodes.EMAIL_ALREADY_REGISTERED });
        done();
      });
  });

  it('should send status 500 if pool.connect() throws', (done) => {
    connectStubVar.rejects();
    checkUserQueryStub.resolves(checkUserQueryResult());
    createUserQueryStub.resolves({});

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
    createUserQueryStub.resolves({});

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
    checkUserQueryStub.resolves(checkUserQueryResult());
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
