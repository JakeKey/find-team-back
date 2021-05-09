import { afterEach, beforeEach, before } from 'mocha';
import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import { NextFunction, Request, Response } from 'express';

import middlewares, { ValidationObject } from 'middlewares';

chai.use(chaiHttp);
chai.use(chaiAsPromised);

afterEach(() => {
  sinon.restore();
});
