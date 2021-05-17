import { afterEach } from 'mocha';
import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

chai.use(chaiHttp);
chai.use(chaiAsPromised);

afterEach(() => {
  sinon.restore();
});
