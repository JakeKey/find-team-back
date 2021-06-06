import { describe, it, beforeEach } from 'mocha';
import chai, { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';

import { fakeQueryResult, stubConnectPool, stubMiddlewares } from '__tests__';
import { Status, UserPositions } from 'types/enums';
import { GetProjectsSQLType, GetProjectsPositionsSQLType } from 'sql';

describe('Project Get route', () => {
  let connectStubVar: SinonStub,
    server: any,
    getProjectStub: SinonStub,
    getProjectPositionsStub: SinonStub;

  const testGetProjectResponse: Omit<GetProjectsSQLType, 'createdAt'> = {
    authorname: 'Test Author',
    name: 'Test Projects',
    description: 'Test Descriptions',
    id: 1,
    ownerId: 1,
  };

  const testGetProjectPositionsResponse: GetProjectsPositionsSQLType[] = [
    { position: UserPositions.frontend, count: 2 },
    { position: UserPositions.PO, count: 1 },
  ];

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
    getProjectPositionsStub.resolves(fakeQueryResult(testGetProjectPositionsResponse));

    chai
      .request(server)
      .get('/api/projects/1')
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.OK);
        expect(res.body).to.haveOwnProperty('data');
        expect(res.body.data).to.deep.include({
          ...testGetProjectResponse,
          positions: testGetProjectPositionsResponse,
        });
        done();
      });
  });

  it('should send status 500 if Get Project query rejects', (done) => {
    getProjectStub.rejects();
    getProjectPositionsStub.resolves(fakeQueryResult([]));

    chai
      .request(server)
      .get('/api/projects/4')
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
      .get('/api/projects/2')
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
      .get('/api/projects/3')
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.INTERNAL_SERVER_ERROR);
        done();
      });
  });
});
