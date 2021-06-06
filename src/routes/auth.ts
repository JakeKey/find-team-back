import express, { Request, Response } from 'express';
import Joi from 'joi';
import { PoolClient } from 'pg';

import pool from 'dbconfig';
import middlewares from 'middlewares';
import {
  createDebug,
  bcryptHandler,
  formatError,
  formatResponse,
  tokenJWT,
  mailApi,
  verificationCode,
  VERIFICATION_CODE_EXPIRATION_TIME_MINUTES,
} from 'utils';
import { UserPositions, ErrorCodes, Status, SuccessCodes } from 'types/enums';
import {
  RegisterReqBody,
  LoginReqBody,
  LoginResponseData,
  RegisterResponseData,
  VerifyCodeReqBody,
  VerifyCodeResponseData,
} from 'types/interfaces';
import {
  checkIfUserExistSQL,
  CheckIfUserExistSQLType,
  createUserSQL,
  registerAnonymousUserSQL,
  getCredentialsByEmailSQL,
  getCredentialsByUsernameSQL,
  GetCredentialsSQLType,
  createVerificationCodeSQL,
  verifyCodeSQL,
  checkIfUserIsVerifiedSQL,
  verifyUserSQL,
} from 'sql';

const { validation, reCaptchaVerify } = middlewares;

const debug = createDebug('auth');

const router = express.Router();

router.post(
  '/register',
  [
    validation({
      body: Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required(),
        password: Joi.string().min(8).max(128).required(),
        email: Joi.string().email().max(128).required(),
        position: Joi.string().valid(...Object.values(UserPositions)),
        reCaptchaResponse: Joi.string().max(2048).required(),
      }),
    }),
    reCaptchaVerify,
  ],
  async (req: Request<{}, {}, RegisterReqBody>, res: Response) => {
    const { username, password, position } = req.body;
    let { email } = req.body;
    email = email.toLowerCase();

    let client: PoolClient | undefined;
    try {
      client = await pool.connect();

      const resultCheck = await client.query<CheckIfUserExistSQLType>(checkIfUserExistSQL, [
        username,
        email,
      ]);

      const existingUser = !!resultCheck?.rows.length && resultCheck.rows[0];
      const isEmailAlreadyUsed = existingUser && existingUser.email.toLowerCase() === email;
      debug('Find user result %O', resultCheck);

      if (existingUser && existingUser.registered) {
        client.release();
        return res
          .status(Status.FORBIDDEN)
          .json(
            formatError(
              isEmailAlreadyUsed
                ? ErrorCodes.EMAIL_ALREADY_REGISTERED
                : ErrorCodes.USERNAME_ALREADY_TAKEN
            )
          );
      }

      const encryptedPassword = await bcryptHandler.encrypt(password);

      const isAnonymousUser = isEmailAlreadyUsed && !resultCheck.rows[0].registered;

      const resultCreate = await client.query<{ id: string }>(
        !isAnonymousUser ? createUserSQL : registerAnonymousUserSQL,
        [username, encryptedPassword, email, position]
      );
      debug('Create user result %O', resultCreate);
      const userId = resultCreate.rows[0].id;
      if (!userId) throw new Error('No user id');
      const code = await verificationCode.create();

      const resultSaveCode = await client.query(createVerificationCodeSQL, [userId, code]);
      debug('Save verification code result %O', resultSaveCode);

      const resultSendMail = await mailApi.send(email, username, code);
      debug('Mail Api verification email send result %O', resultSendMail);

      client.release();
      return res
        .status(Status.CREATED)
        .json(formatResponse<RegisterResponseData>(null, SuccessCodes.REGISTER_SUCCESS));
    } catch (err) {
      debug('Auth register error: %O', err);
      client?.release();
      return res
        .status(Status.INTERNAL_SERVER_ERROR)
        .json(formatError(ErrorCodes.SOMETHING_WENT_WRONG));
    }
  }
);

router.post(
  '/login',
  [
    validation({
      body: Joi.object({
        username: Joi.string().alphanum().min(3).max(30),
        password: Joi.string().min(8).max(128).required(),
        email: Joi.string().email().max(128),
        reCaptchaResponse: Joi.string().max(2048).required(),
      }),
    }),
    reCaptchaVerify,
  ],
  async (req: Request<{}, {}, LoginReqBody>, res: Response) => {
    const { username, password, email } = req.body;
    if (!username && !email) {
      return res.status(Status.UNAUTHORIZED).json(formatError(ErrorCodes.MISSING_CREDENTIALS));
    }
    let client: PoolClient | undefined;
    try {
      client = await pool.connect();
      const resultCheck = await client.query<GetCredentialsSQLType>(
        username ? getCredentialsByUsernameSQL : getCredentialsByEmailSQL,
        [username || email]
      );
      const userCredentials = resultCheck?.rows[0];

      const areCredentialsCorrect =
        userCredentials && (await bcryptHandler.decrypt(password, userCredentials.password));
      if (!userCredentials?.registered || !areCredentialsCorrect) {
        client.release();
        return res.status(Status.FORBIDDEN).json(formatError(ErrorCodes.INVALID_CREDENTIALS));
      }
      debug('Correct credentials for user %s, id: %s', username || email, userCredentials.id);

      if (!userCredentials.verified) {
        client.release();
        return res.status(Status.FORBIDDEN).json(formatError(ErrorCodes.USER_NOT_VERIFIED));
      }

      const token = tokenJWT.generate(userCredentials.id);
      if (!token) throw new Error('Token not created');
      return res
        .status(Status.OK)
        .json(formatResponse<LoginResponseData>({ token }, SuccessCodes.LOGIN_SUCCESS));
    } catch (err) {
      debug('Auth register error: %O', err);
      client?.release();
      return res.status(Status.INTERNAL_SERVER_ERROR).json(formatError());
    }
  }
);

router.post(
  '/verify',
  [
    validation({
      body: Joi.object({
        code: Joi.string().alphanum().min(10).max(100),
        reCaptchaResponse: Joi.string().max(2048).required(),
      }),
    }),
    reCaptchaVerify,
  ],
  async (req: Request<{}, {}, VerifyCodeReqBody>, res: Response) => {
    const { code } = req.body;

    let client: PoolClient | undefined;
    try {
      client = await pool.connect();
      const resultVerifyCode = await client.query<{ user_id: string; created_at: string }>(
        verifyCodeSQL,
        [code]
      );
      const userId = resultVerifyCode?.rows[0]?.user_id;

      if (!userId) {
        client.release();
        return res.status(Status.FORBIDDEN).json(formatError(ErrorCodes.INVALID_VERIFICATION_CODE));
      }

      const createdAt = resultVerifyCode?.rows[0]?.created_at;
      const timeFromCreationMs = createdAt && Date.now() - new Date(createdAt).getTime();
      const timeFromCreationMinutes = timeFromCreationMs && timeFromCreationMs / 1000 / 60;
      if (
        !timeFromCreationMinutes ||
        timeFromCreationMinutes > VERIFICATION_CODE_EXPIRATION_TIME_MINUTES
      ) {
        client.release();
        return res.status(Status.FORBIDDEN).json(formatError(ErrorCodes.VERIFICATION_CODE_EXPIRED));
      }

      const resultCheckIsVerified = await client.query<{ verified: boolean }>(
        checkIfUserIsVerifiedSQL,
        [userId]
      );
      if (!resultCheckIsVerified?.rows[0]) throw new Error('User not found');
      const verified = resultCheckIsVerified?.rows[0]?.verified;

      if (verified) {
        client.release();
        return res.status(Status.BAD_REQUEST).json(formatError(ErrorCodes.USER_ALREADY_VERIFIED));
      }

      const resultVerifyUser = await client.query(verifyUserSQL, [userId]);
      debug('Verify user result: %O', resultVerifyUser);

      const token = tokenJWT.generate(userId);
      if (!token) throw new Error('Token not created');
      return res
        .status(Status.OK)
        .json(formatResponse<VerifyCodeResponseData>({ token }, SuccessCodes.VERIFICATION_SUCCESS));
    } catch (err) {
      debug('Auth register error: %O', err);
      client?.release();
      return res.status(Status.INTERNAL_SERVER_ERROR).json(formatError());
    }
  }
);

export { router as auth };
