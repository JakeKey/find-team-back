import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import sinon, { SinonSpy } from 'sinon';
import { Request, Response } from 'express';

import middlewares from 'middlewares';
import { tokenJWT } from 'utils';

const { authorise } = middlewares;

describe('Authorisation middleware', () => {
  const TEST_TOKEN = 'test_token';
  const getReq = (token?: string): Partial<Request> | { header: () => string } => ({
    header: () => `Bearer ${token || ''}`,
    params: {},
  });
  let res: Partial<Response>, next: SinonSpy, json: SinonSpy, status: SinonSpy;

  beforeEach(() => {
    json = sinon.fake();
    status = sinon.fake.returns({ json });
    next = sinon.fake();
    res = {
      status,
    };
  });

  it('should be a function', () => {
    expect(authorise).to.be.a('function');
  });

  it('should call next() if token verification returns user id', () => {
    sinon.stub(tokenJWT, 'verify').returns({ id: 1 });

    authorise(getReq(TEST_TOKEN) as Request, res as Response, next);

    expect(next.calledOnce).to.equal(true);
  });

  it('should call status() and json() and not call next() if token verification does not return user id', () => {
    sinon.stub(tokenJWT, 'verify').returns({ id: undefined });

    authorise(getReq(TEST_TOKEN) as Request, res as Response, next);

    expect(next.calledOnce).to.equal(false);
    expect(status.calledOnce).to.equal(true);
    expect(json.calledOnce).to.equal(true);
  });

  it('should call status() and json() and not call next() if token is not provided', () => {
    authorise(getReq() as Request, res as Response, next);

    expect(next.calledOnce).to.equal(false);
    expect(status.calledOnce).to.equal(true);
    expect(json.calledOnce).to.equal(true);
  });
});
