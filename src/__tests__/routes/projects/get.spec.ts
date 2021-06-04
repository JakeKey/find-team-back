import { describe, it, beforeEach } from 'mocha';
import chai, { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';

import { fakeQueryResult, stubConnectPool, stubMiddlewares } from '__tests__';
import { GetProjectByIdQueryParams } from 'types/interfaces';
import { Status } from 'types/enums';
import { GetProjectsSQLType } from 'sql/projects';

describe('Project Get route', () => {
  let connectStubVar: SinonStub,
    server: any,
    getProjectStub: SinonStub,
    getProjectPositionsStub: SinonStub;

  const testValues: GetProjectByIdQueryParams = {
    id: 1,
  };

  const testGetProjectResponse: GetProjectsSQLType = {
    username: 'Test Author',
    name: 'Test Projects',
    description: 'Test Descriptions',
    id: 1,
    ownerId: 1,
    createdAt: new Date(),
  };

  beforeEach(() => {
    stubMiddlewares(sinon);

    const { connectStub, queryStub } = stubConnectPool();
    connectStubVar = connectStub;
    getProjectStub = queryStub.onFirstCall();
    getProjectPositionsStub = queryStub.onSecondCall();

    server = require('index');
  });

  it('should send status 200 if Get Project and Get Project Positions queries resolves', (done) => {
    getProjectStub.resolves(fakeQueryResult([testGetProjectResponse]));
    getProjectPositionsStub.resolves(fakeQueryResult([]));

    chai
      .request(server)
      .get('/api/projects')
      .query(testValues)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.OK);
        done();
      });
  });

  it('should send status 500 if Get Project query rejects', (done) => {
    getProjectStub.rejects();
    getProjectPositionsStub.resolves(fakeQueryResult([]));

    chai
      .request(server)
      .get('/api/projects')
      .query(testValues)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.INTERNAL_SERVER_ERROR);
        done();
      });
  });

  it('should send status 500 if Get Project Positions query rejects', (done) => {
    getProjectStub.resolves(fakeQueryResult([testGetProjectResponse]));
    getProjectPositionsStub.rejects();

    chai
      .request(server)
      .get('/api/projects')
      .query(testValues)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.INTERNAL_SERVER_ERROR);
        done();
      });
  });

  it('should send status 500 if pool.connect() throws', (done) => {
    connectStubVar.rejects();
    getProjectStub.resolves(fakeQueryResult([testGetProjectResponse]));
    getProjectPositionsStub.resolves(fakeQueryResult([]));

    chai
      .request(server)
      .get('/api/projects')
      .query(testValues)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.INTERNAL_SERVER_ERROR);
        done();
      });
  });
});
