import bcrypt from 'bcrypt';
import debug from 'debug';
import fetch from 'node-fetch';

import { CONFIG_CONSTS } from 'config';
import { ErrorCodes, SuccessCodes } from 'types/enums';
import { ResponseModel } from 'types/interfaces';

export const formatResponse = (res?: object, code?: SuccessCodes): ResponseModel => ({
  data: res || {},
  code: code && Object.values(SuccessCodes).includes(code) ? code : SuccessCodes.SUCCESS,
});

export const formatError = (code?: ErrorCodes): ResponseModel => ({
  code: code && Object.values(ErrorCodes).includes(code) ? code : ErrorCodes.SOMETHING_WENT_WRONG,
});

export const encryptPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
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
