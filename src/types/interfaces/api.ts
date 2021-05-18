import { UserType } from './user';

type ReCaptchaReq = {
  reCaptchaResponse: string;
};

export type RegisterReqBody = Pick<UserType, 'username' | 'password' | 'email' | 'position'> &
  ReCaptchaReq;

export type LoginReqBody = Pick<UserType, 'password'> &
  Partial<Pick<UserType, 'username' | 'email'>> &
  ReCaptchaReq;

export type RegisterResponseData = null;

export type LoginResponseData = { token: string };