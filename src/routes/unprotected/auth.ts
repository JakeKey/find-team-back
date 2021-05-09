import express, { Request, Response } from 'express';
import Joi from 'joi';

import pool from 'dbconfig';
import middlewares from 'middlewares';
import { createDebug, encryptPassword, formatError, formatResponse } from 'utils';
import { UserPositions, ErrorCodes, Status } from 'types/enums';
import { RegisterReqBody } from 'types/interfaces';
import { checkIfUserExistSQL, CheckIfUserExistSQLType, createUserSQL } from 'sql';

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
        email: Joi.string().email().required(),
        position: Joi.string().valid(...Object.values(UserPositions)),
        reCaptchaResponse: Joi.string().required(),
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

      const encryptedPassword = await encryptPassword(password);
      const resultCreate = await client.query(createUserSQL, [
        username,
        encryptedPassword,
        email,
        position,
      ]);
      debug('Create user result %O', resultCreate);

      client.release();
      return res.status(Status.CREATED).json(formatResponse());
    } catch (err) {
      debug('Auth register error: %O', err);
      client?.release();
      return res.status(Status.INTERNAL_SERVER_ERROR).json(formatError(err?.message));
    }
  }
);

router.post('/login', async (req, res) => {
  return res.send('ok');
});

export { router as auth };
