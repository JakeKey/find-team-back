import bcrypt from 'bcrypt';
import debug from 'debug';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

import { CONFIG_CONSTS } from 'config';
import { ErrorCodes, SuccessCodes } from 'types/enums';
import { ResponseModel } from 'types/interfaces';

export const formatResponse = <T>(data: T, success = SuccessCodes.SUCCESS): ResponseModel<T> => ({
  data,
  success,
});

export const formatError = (error = ErrorCodes.SOMETHING_WENT_WRONG): ResponseModel<{}> => ({
  data: {},
  error,
});

export const bcryptHandler = {
  encrypt: async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  },
  decrypt: async (password: string, hashedPassword: string) => {
    return bcrypt.compare(password, hashedPassword);
  },
};

export const createDebug = (postfix: string) => debug(`fyt:${postfix}`);

interface GoogleReCaptchaResponse {
  success: boolean;
  // eslint-disable-next-line camelcase
  challenge_ts: Date;
  hostname: string;
  'error-codes': string[];
}

export const postReCaptchaResponse = async (
  response: string
): Promise<Partial<GoogleReCaptchaResponse>> => {
  const responseGoogle = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${CONFIG_CONSTS.NODE_FTEAM_RECAPTCHA_SECRET}&response=${response}`,
  });

  return responseGoogle.json();
};

export const generateAuthToken = (id: string | number) => {
  if (!CONFIG_CONSTS.NODE_FTEAM_JWT_SECRET) return;
  return jwt.sign({ id }, CONFIG_CONSTS.NODE_FTEAM_JWT_SECRET, { expiresIn: '7d' });
};
