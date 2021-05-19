import { describe, it, beforeEach } from 'mocha';
import chai, { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';

import { fakeQueryResult, stubConnectPool, stubMiddlewares } from '__tests__';
import { VerifyCodeReqBody } from 'types/interfaces';
import { ErrorCodes, Status } from 'types/enums';
import { VERIFICATION_CODE_EXPIRATION_TIME_MINUTES } from 'utils';

describe('Verify route', () => {
  let connectStubVar: SinonStub,
    server: any,
    verifyCodeStub: SinonStub,
    checkIfIsAlreadyVerifiedStub: SinonStub,
    verifyUserStub: SinonStub;

  const testValues: VerifyCodeReqBody = {
    code: 'test_code_12345678',
    reCaptchaResponse: '12345678',
  };

  beforeEach(() => {
    stubMiddlewares(sinon);

    const { connectStub, queryStub } = stubConnectPool();
    connectStubVar = connectStub;
    verifyCodeStub = queryStub.onFirstCall();
    checkIfIsAlreadyVerifiedStub = queryStub.onSecondCall();
    verifyUserStub = queryStub.onThirdCall();

    server = require('index');
  });

  it('should send status 200 if token is valid', (done) => {
    verifyCodeStub.resolves(fakeQueryResult([{ user_id: 1, created_at: Date.now() - 1000 }]));
    checkIfIsAlreadyVerifiedStub.resolves(fakeQueryResult([{ verified: false }]));
    verifyUserStub.resolves(fakeQueryResult([]));

    chai
      .request(server)
      .post('/api/auth/verify')
      .send(testValues)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.OK);
        done();
      });
  });

  it('should send status 400 and proper ErrorCode if user is already verified', (done) => {
    verifyCodeStub.resolves(fakeQueryResult([{ user_id: 1, created_at: Date.now() - 1000 }]));
    checkIfIsAlreadyVerifiedStub.resolves(fakeQueryResult([{ verified: true }]));
    verifyUserStub.resolves(fakeQueryResult([]));

    chai
      .request(server)
      .post('/api/auth/verify')
      .send(testValues)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.BAD_REQUEST);
        expect(res.body).to.include({ error: ErrorCodes.USER_ALREADY_VERIFIED });
        done();
      });
  });

  it('should send status 403 and proper ErrorCode if token expired', (done) => {
    verifyCodeStub.resolves(
      fakeQueryResult([
        {
          user_id: 1,
          created_at: Date.now() - 1000 - VERIFICATION_CODE_EXPIRATION_TIME_MINUTES * 60 * 1000,
        },
      ])
    );
    checkIfIsAlreadyVerifiedStub.resolves(fakeQueryResult([{ verified: false }]));
    verifyUserStub.resolves(fakeQueryResult([]));

    chai
      .request(server)
      .post('/api/auth/verify')
      .send(testValues)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.FORBIDDEN);
        expect(res.body).to.include({ error: ErrorCodes.VERIFICATION_CODE_EXPIRED });
        done();
      });
  });

  it('should send status 500 if verify code query throws', (done) => {
    verifyCodeStub.rejects();
    checkIfIsAlreadyVerifiedStub.resolves(fakeQueryResult([{ verified: false }]));
    verifyUserStub.resolves(fakeQueryResult([]));

    chai
      .request(server)
      .post('/api/auth/verify')
      .send(testValues)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.INTERNAL_SERVER_ERROR);
        done();
      });
  });

  it('should send status 500 if check if user is verified query throws', (done) => {
    verifyCodeStub.resolves(fakeQueryResult([{ user_id: 1, created_at: Date.now() - 1000 }]));
    checkIfIsAlreadyVerifiedStub.rejects();
    verifyUserStub.resolves(fakeQueryResult([]));

    chai
      .request(server)
      .post('/api/auth/verify')
      .send(testValues)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.INTERNAL_SERVER_ERROR);
        done();
      });
  });

  it('should send status 500 if check if verify user query throws', (done) => {
    verifyCodeStub.resolves(fakeQueryResult([{ user_id: 1, created_at: Date.now() - 1000 }]));
    checkIfIsAlreadyVerifiedStub.resolves(fakeQueryResult([{ verified: false }]));
    verifyUserStub.rejects();

    chai
      .request(server)
      .post('/api/auth/verify')
      .send(testValues)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.INTERNAL_SERVER_ERROR);
        done();
      });
  });

  it('should send status 500 if check if pool.connect() throws throws', (done) => {
    connectStubVar.rejects();
    verifyCodeStub.resolves(fakeQueryResult([{ user_id: 1, created_at: Date.now() - 1000 }]));
    checkIfIsAlreadyVerifiedStub.resolves(fakeQueryResult([{ verified: false }]));
    verifyUserStub.resolves(fakeQueryResult([]));

    chai
      .request(server)
      .post('/api/auth/verify')
      .send(testValues)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.INTERNAL_SERVER_ERROR);
        done();
      });
  });
});
