import { describe, it, beforeEach } from 'mocha';
import chai, { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';

import { fakeQueryResult, stubConnectPool, stubMiddlewares } from '__tests__';
import { CreateProjectReqBody } from 'types/interfaces';
import { Status, UserPositions } from 'types/enums';

describe('Project Create route', () => {
  let connectStubVar: SinonStub,
    server: any,
    createProjectStub: SinonStub,
    addProjectPositionStub: SinonStub;

  const testValues: CreateProjectReqBody = {
    name: 'test_project',
    description: 'test_description',
  };

  beforeEach(() => {
    stubMiddlewares(sinon);

    const { connectStub, queryStub } = stubConnectPool();
    connectStubVar = connectStub;
    createProjectStub = queryStub.onFirstCall();
    addProjectPositionStub = queryStub;

    server = require('index');
  });

  it('should send status 201 and token if Create Project query resolves and positions are not specified', (done) => {
    createProjectStub.resolves(fakeQueryResult([{ id: 1 }]));
    addProjectPositionStub.rejects();

    chai
      .request(server)
      .post('/api/projects')
      .send(testValues)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.CREATED);
        done();
      });
  });

  it('should send status 201 and token if Create Project and Add Project Positions queries resolves and positions are specified', (done) => {
    createProjectStub.resolves(fakeQueryResult([{ id: 1 }]));
    addProjectPositionStub.resolves();
    const testValuesNew = {
      ...testValues,
      positions: [
        { position: UserPositions.frontend, count: 2 },
        { position: UserPositions.backend, count: 3 },
      ],
    };

    chai
      .request(server)
      .post('/api/projects')
      .send(testValuesNew)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.CREATED);
        done();
      });
  });

  it('should send status 400 if positions are duplicated', (done) => {
    createProjectStub.resolves(fakeQueryResult([{ id: 1 }]));
    addProjectPositionStub.resolves();
    const testValuesNew = {
      ...testValues,
      positions: [
        { position: UserPositions.frontend, count: 2 },
        { position: UserPositions.frontend, count: 3 },
      ],
    };

    chai
      .request(server)
      .post('/api/projects')
      .send(testValuesNew)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.BAD_REQUEST);
        done();
      });
  });

  it('should send status 500 if Create Projects query rejects', (done) => {
    createProjectStub.throws();
    addProjectPositionStub.resolves();

    chai
      .request(server)
      .post('/api/projects')
      .send(testValues)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.INTERNAL_SERVER_ERROR);
        done();
      });
  });

  it('should send status 500 if Add Project Positions query throws', (done) => {
    createProjectStub.resolves(fakeQueryResult([{ id: 1 }]));
    addProjectPositionStub.throws();
    const testValuesNew = {
      ...testValues,
      positions: [
        { position: UserPositions.frontend, count: 2 },
        { position: UserPositions.backend, count: 3 },
      ],
    };

    chai
      .request(server)
      .post('/api/projects')
      .send(testValuesNew)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.INTERNAL_SERVER_ERROR);
        done();
      });
  });

  it('should send status 500 if pool.connect() throws', (done) => {
    connectStubVar.throws();
    createProjectStub.resolves();
    addProjectPositionStub.resolves();

    chai
      .request(server)
      .post('/api/projects')
      .send(testValues)
      .end((err, res) => {
        expect(err).to.be.a('null');
        expect(res).to.have.status(Status.INTERNAL_SERVER_ERROR);
        done();
      });
  });
});
