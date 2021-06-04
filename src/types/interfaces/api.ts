import { ProjectType } from './project';
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

export type VerifyCodeReqBody = { code: string } & ReCaptchaReq;

export type VerifyCodeResponseData = { token: string };

export type CreateProjectReqBody = Pick<ProjectType, 'name' | 'description' | 'positions'>;

export type GetProjectByIdQueryParams = Pick<ProjectType, 'id'>;

export type GetProjectResponseData = ProjectType & {
  authorName: string;
};

export type CreateProjectResponseData = null;
