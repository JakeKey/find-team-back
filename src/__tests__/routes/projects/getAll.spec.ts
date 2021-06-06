import { describe, it, beforeEach } from 'mocha';
import chai, { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';

import { fakeQueryResult, stubConnectPool, stubMiddlewares } from '__tests__';
import { Status } from 'types/enums';
import { GetAllProjectsSQLType } from 'sql';

describe('Project Get All route', () => {
  let connectStubVar: SinonStub, server: any, getAllProjectsStub: SinonStub;

  const testGetProjectResponse: Omit<GetAllProjectsSQLType, 'createdAt'>[] = [
    {
      authorname: 'Test Author',
      name: 'Test Projects',
      description: 'Test Descriptions',
      id: 1,
      ownerId: 1,
    },
    {
      authorname: 'Test Author',
      name: 'Test Projects2',
      description: 'Test Descriptions',
      id: 2,
      ownerId: 1,
    },
  ];

  beforeEach(() => {
    stubMiddlewares(sinon);

    const { connectStub, queryStub } = stubConnectPool();
    connectStubVar = connectStub;
    getAllProjectsStub = queryStub.onFirstCall();

    server = require('index');
  });

  it('should send status 200 if Get All Projects query resolves', (done) => {
    getAllProjectsStub.resolves(fakeQueryResult(testGetProjectResponse));

    chai
      .request(server)
      .get('/api/projects')
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.OK);
        expect(res.body.data).to.be.an('array').and.deep.include.members(testGetProjectResponse);
        done();
      });
  });

  it('should send status 500 if Get All Projects query rejects', (done) => {
    getAllProjectsStub.rejects(fakeQueryResult([testGetProjectResponse]));

    chai
      .request(server)
      .get('/api/projects')
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.INTERNAL_SERVER_ERROR);
        done();
      });
  });

  it('should send status 500 if pool.conect() rejects', (done) => {
    getAllProjectsStub.resolves(fakeQueryResult(testGetProjectResponse));
    connectStubVar.rejects();

    chai
      .request(server)
      .get('/api/projects')
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.INTERNAL_SERVER_ERROR);
        done();
      });
  });
});
