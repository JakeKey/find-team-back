import { beforeEach, afterEach } from 'mocha';
import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

import { mailApi } from 'utils';

chai.use(chaiHttp);
chai.use(chaiAsPromised);

beforeEach(() => {
  sinon.stub(mailApi, 'send').callsFake(async () => {});
});

afterEach(() => {
  sinon.restore();
});
