import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import sinon, { SinonSpy } from 'sinon';
import { Request, Response } from 'express';
import Joi, { ValidationResult } from 'joi';

import middlewares, { ValidationObject } from 'middlewares';

const { validation } = middlewares;

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
    body: { test_body: 'test_body' },
    params: { test_params: 'test_params' },
    query: { test_query: 'test_query' },
  };
  let res: Partial<Response>, next: SinonSpy, json: SinonSpy, status: SinonSpy;

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

  const getValidationStubs = ({
    body = true,
    params = true,
    query = true,
  }: Partial<Record<'body' | 'params' | 'query', boolean>>) => {
    sinon.stub(bodySchema, 'validate').callsFake(fakeValidationResult(body));
    sinon.stub(paramsSchema, 'validate').callsFake(fakeValidationResult(params));
    sinon.stub(querySchema, 'validate').callsFake(fakeValidationResult(query));
  };

  beforeEach(() => {
    json = sinon.fake();
    status = sinon.fake.returns({ json });
    next = sinon.fake();
    res = {
      status,
    };
  });

  it('should be a function', () => {
    expect(validation).to.be.a('function');
  });

  it('should return a function', () => {
    const validationMiddleware = validation(schema);
    expect(validationMiddleware).to.be.a('function');
  });

  it('should call next() if each validation pass', async () => {
    getValidationStubs({});

    const validationMiddleware = validation(schema);
    validationMiddleware(req as Request, res as Response, next);

    expect(next.calledOnce).to.equal(true);
  });

  it('should call status() and json() if body validation fails', async () => {
    getValidationStubs({ body: false });

    const validationMiddleware = validation(schema);
    validationMiddleware(req as Request, res as Response, next);

    expect(status.calledOnce).to.equal(true);
    expect(json.calledOnce).to.equal(true);
  });

  it('should call status() and json() if params validation fails', async () => {
    getValidationStubs({ params: false });

    const validationMiddleware = validation(schema);
    validationMiddleware(req as Request, res as Response, next);

    expect(status.calledOnce).to.equal(true);
    expect(json.calledOnce).to.equal(true);
  });

  it('should call status() and json() if query validation fails', async () => {
    getValidationStubs({ query: false });

    const validationMiddleware = validation(schema);
    validationMiddleware(req as Request, res as Response, next);

    expect(status.calledOnce).to.equal(true);
    expect(json.calledOnce).to.equal(true);
  });
});
