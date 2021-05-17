import { describe, it, beforeEach } from 'mocha';
import chai, { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';

import { fakeQueryResult, stubConnectPool, stubMiddlewares } from '__tests__';
import { LoginReqBody } from 'types/interfaces';
import { ErrorCodes, Status } from 'types/enums';
import { GetCredentialsSQLType } from 'sql';
import { bcryptHandler } from 'utils';

describe('Login route', () => {
  let connectStubVar: SinonStub, server: any, getCredentialsStub: SinonStub, decryptStub: SinonStub;

  const getCredentialsQueryResult = (id?: number, registered = true) =>
    id
      ? fakeQueryResult<GetCredentialsSQLType>([
          {
            id,
            password: 'test_password',
            registered,
          },
        ])
      : fakeQueryResult<undefined>([]);

  const testValues: LoginReqBody = {
    username: 'test_username',
    password: 'test_password',
    email: 'test@mail.com',
    reCaptchaResponse: '12345678',
  };

  beforeEach(() => {
    stubMiddlewares(sinon);
    const { connectStub, queryStub } = stubConnectPool();
    connectStubVar = connectStub;
    getCredentialsStub = queryStub.onFirstCall();
    decryptStub = sinon.stub(bcryptHandler, 'decrypt');

    server = require('index');
  });

  it('should send status 200 and token if credentials are correct', (done) => {
    getCredentialsStub.resolves(getCredentialsQueryResult(1));
    decryptStub.resolves(true);

    chai
      .request(server)
      .post('/api/auth/login')
      .send(testValues)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.OK);
        expect(res.body).to.haveOwnProperty('data');
        // eslint-disable-next-line no-unused-expressions
        expect(res.body.data).to.haveOwnProperty('token').that.is.not.empty;
        done();
      });
  });

  it('should send status 401 and proper ErrorCode if username and email are empty', (done) => {
    getCredentialsStub.resolves(getCredentialsQueryResult(1));
    decryptStub.resolves(true);

    chai
      .request(server)
      .post('/api/auth/login')
      .send({ ...testValues, email: '', username: '' })
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.UNAUTHORIZED);
        expect(res.body).to.include({ error: ErrorCodes.MISSING_CREDENTIALS });
        done();
      });
  });

  it('should send status 403 and proper ErrorCode if user was not found', (done) => {
    getCredentialsStub.resolves(getCredentialsQueryResult());
    decryptStub.resolves(true);

    chai
      .request(server)
      .post('/api/auth/login')
      .send(testValues)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.FORBIDDEN);
        expect(res.body).to.include({ error: ErrorCodes.INVALID_CREDENTIALS });
        done();
      });
  });

  it('should send status 403 and proper ErrorCode if user was found but is not registered', (done) => {
    getCredentialsStub.resolves(getCredentialsQueryResult(1, false));
    decryptStub.resolves(true);

    chai
      .request(server)
      .post('/api/auth/login')
      .send(testValues)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.FORBIDDEN);
        expect(res.body).to.include({ error: ErrorCodes.INVALID_CREDENTIALS });
        done();
      });
  });

  it('should send status 403 and proper ErrorCode if decrypt() returns false', (done) => {
    getCredentialsStub.resolves(getCredentialsQueryResult(1));
    decryptStub.resolves(false);

    chai
      .request(server)
      .post('/api/auth/login')
      .send(testValues)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.FORBIDDEN);
        expect(res.body).to.include({ error: ErrorCodes.INVALID_CREDENTIALS });
        done();
      });
  });

  it('should send status 500 if pool.connect() throws', (done) => {
    getCredentialsStub.resolves(getCredentialsQueryResult(1));
    decryptStub.resolves(true);
    connectStubVar.rejects();

    chai
      .request(server)
      .post('/api/auth/login')
      .send(testValues)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.INTERNAL_SERVER_ERROR);
        done();
      });
  });

  it('should send status 500 if client.query() throws', (done) => {
    getCredentialsStub.rejects();
    decryptStub.resolves(true);

    chai
      .request(server)
      .post('/api/auth/login')
      .send(testValues)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.INTERNAL_SERVER_ERROR);
        done();
      });
  });

  it('should send status 500 if decrypt() throws', (done) => {
    getCredentialsStub.rejects();
    decryptStub.rejects();

    chai
      .request(server)
      .post('/api/auth/login')
      .send(testValues)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.INTERNAL_SERVER_ERROR);
        done();
      });
  });
});
