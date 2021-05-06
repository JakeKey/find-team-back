import bcrypt from 'bcrypt';
import debug from 'debug';

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
  return await bcrypt.hash(password, salt);
};

export const createDebug = (postfix: string) => debug(`fyt:${postfix}`);
