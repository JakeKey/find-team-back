import express, { Request, Response } from 'express';
import Joi from 'joi';

import pool from 'dbconfig';
import middlewares from 'middlewares';
import { createDebug, bcryptHandler, formatError, formatResponse, generateAuthToken } from 'utils';
import { UserPositions, ErrorCodes, Status, SuccessCodes } from 'types/enums';
import {
  RegisterReqBody,
  LoginReqBody,
  LoginResponseData,
  RegisterResponseData,
} from 'types/interfaces';
import {
  checkIfUserExistSQL,
  CheckIfUserExistSQLType,
  createUserSQL,
  getCredentialsByEmailSQL,
  getCredentialsByUsernameSQL,
  GetCredentialsSQLType,
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
    const { username, password, email, position } = req.body;
    let client;
    try {
      client = await pool.connect();

      const resultCheck = await client.query<CheckIfUserExistSQLType>(checkIfUserExistSQL, [
        username,
        email.toLowerCase(),
      ]);
      debug('Find user result %O', resultCheck);
      const existingUser = !!resultCheck?.rows.length && resultCheck.rows[0];
      if (existingUser && existingUser.registered) {
        return res
          .status(Status.FORBIDDEN)
          .json(
            formatError(
              email.toLowerCase() === existingUser.email
                ? ErrorCodes.EMAIL_ALREADY_REGISTERED
                : ErrorCodes.USERNAME_ALREADY_TAKEN
            )
          );
      }

      const encryptedPassword = await bcryptHandler.encrypt(password);
      const resultCreate = await client.query(createUserSQL, [
        username,
        encryptedPassword,
        email,
        position,
      ]);
      debug('Create user result %O', resultCreate);

      // TODO send verification email

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
    let client;
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
        return res.status(Status.FORBIDDEN).json(formatError(ErrorCodes.INVALID_CREDENTIALS));
      }
      debug('Correct credentials for user %s, id: %s', username || email, userCredentials.id);

      // TODO check 'verified' flag after adding mail service

      const token = generateAuthToken(userCredentials.id);
      if (!token) throw new Error();
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

export { router as auth };
