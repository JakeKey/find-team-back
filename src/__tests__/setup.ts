import { beforeEach, afterEach, before } from 'mocha';
import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

import { mailApi } from 'utils';

chai.use(chaiHttp);
chai.use(chaiAsPromised);

before(function () {
  this.timeout(3000);
});

beforeEach(function () {
  sinon.stub(mailApi, 'send').callsFake(async () => {});
});

afterEach(() => {
  sinon.restore();
});
