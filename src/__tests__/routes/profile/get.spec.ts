import { describe, it, beforeEach } from 'mocha';
import chai, { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';

import { fakeQueryResult, stubConnectPool, stubMiddlewares } from '__tests__';
import { Status } from 'types/enums';
import { GetProfileResponseData } from 'types/interfaces';

describe('Profile Get route', () => {
  let connectStubVar: SinonStub, server: any, getProfileStub: SinonStub;

  const testGetProfileResponse: GetProfileResponseData = {
    username: 'Test User',
    id: 1,
  };

  beforeEach(() => {
    stubMiddlewares(sinon);

    const { connectStub, queryStub } = stubConnectPool();
    connectStubVar = connectStub;
    getProfileStub = queryStub.onFirstCall();

    server = require('index');
  });

  it('should send status 200 if Get Project and Get Project Positions queries resolves', (done) => {
    getProfileStub.resolves(fakeQueryResult([testGetProfileResponse]));

    chai
      .request(server)
      .get('/api/profile')
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.OK);
        expect(res.body).to.haveOwnProperty('data');
        expect(res.body.data).to.deep.include({
          ...testGetProfileResponse,
        });
        done();
      });
  });

  it('should send status 500 if pool.connect() throws', (done) => {
    connectStubVar.rejects();
    getProfileStub.resolves(fakeQueryResult([testGetProfileResponse]));

    chai
      .request(server)
      .get('/api/profile')
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.INTERNAL_SERVER_ERROR);
        done();
      });
  });
});
