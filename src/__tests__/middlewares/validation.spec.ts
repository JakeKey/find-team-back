import { describe, it, afterEach, beforeEach } from 'mocha';
import { expect } from 'chai';
import sinon, { SinonSpy } from 'sinon';
import { Request, Response } from 'express';
import Joi, { ValidationResult } from 'joi';

import { validation, ValidationObject } from 'middlewares';

describe('Validation middleware', () => {
  const bodySchema = Joi.object({ test_body: Joi.string().required() });
  const paramsSchema = Joi.object({ test_params: Joi.string().required() });
  const querySchema = Joi.object({ test_query: Joi.string().required() });
  const schema: ValidationObject = {
    body: bodySchema,
    params: paramsSchema,
    query: querySchema,
  };
  const req: Partial<Request> = {
    body: { test_body: 'test' },
    params: { test_params: 'test' },
    query: { test_query: 'test' },
  };
  let res: Partial<Response>;
  let next: SinonSpy;
  let json: SinonSpy;
  let status: SinonSpy;

  const fakeValidationResult = (isValid: boolean) => (): ValidationResult => ({
    value: 'test',
    error: !isValid
      ? {
          name: 'ValidationError',
          message: 'Test Error',
          isJoi: true,
          details: [],
          annotate: () => '',
          _original: '',
        }
      : undefined,
  });

  beforeEach(() => {
    json = sinon.fake();
    status = sinon.fake.returns({ json });
    next = sinon.fake();
    res = {
      status,
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should be a function', () => {
    expect(validation).to.be.a('function');
  });

  it('should return a function', () => {
    const validationMiddleware = validation(schema);
    expect(validationMiddleware).to.be.a('function');
  });

  it('should call next() validation passes', async () => {
    sinon.stub(bodySchema, 'validate').callsFake(fakeValidationResult(true));
    sinon.stub(paramsSchema, 'validate').callsFake(fakeValidationResult(true));
    sinon.stub(querySchema, 'validate').callsFake(fakeValidationResult(true));

    const validationMiddleware = validation(schema);
    validationMiddleware(req as Request, res as Response, next);

    expect(next.calledOnce).to.equal(true);
  });

  it('should call status() and json() if body validation fails', async () => {
    sinon.stub(bodySchema, 'validate').callsFake(fakeValidationResult(false));
    sinon.stub(paramsSchema, 'validate').callsFake(fakeValidationResult(true));
    sinon.stub(querySchema, 'validate').callsFake(fakeValidationResult(true));

    const validationMiddleware = validation(schema);
    validationMiddleware(req as Request, res as Response, next);

    expect(status.calledOnce).to.equal(true);
    expect(json.calledOnce).to.equal(true);
  });

  it('should call status() and json() if params validation fails', async () => {
    sinon.stub(bodySchema, 'validate').callsFake(fakeValidationResult(true));
    sinon.stub(paramsSchema, 'validate').callsFake(fakeValidationResult(false));
    sinon.stub(querySchema, 'validate').callsFake(fakeValidationResult(true));

    const validationMiddleware = validation(schema);
    validationMiddleware(req as Request, res as Response, next);

    expect(status.calledOnce).to.equal(true);
    expect(json.calledOnce).to.equal(true);
  });

  it('should call status() and json() if query validation fails', async () => {
    sinon.stub(bodySchema, 'validate').callsFake(fakeValidationResult(true));
    sinon.stub(paramsSchema, 'validate').callsFake(fakeValidationResult(true));
    sinon.stub(querySchema, 'validate').callsFake(fakeValidationResult(false));

    const validationMiddleware = validation(schema);
    validationMiddleware(req as Request, res as Response, next);

    expect(status.calledOnce).to.equal(true);
    expect(json.calledOnce).to.equal(true);
  });
});
