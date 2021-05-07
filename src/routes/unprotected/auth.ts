import express, { Request, Response } from 'express';
import Joi from 'joi';

import pool from 'dbconfig';
import { validation, reCaptchaVerify } from 'middlewares';
import { createDebug, encryptPassword, formatError, formatResponse } from 'utils';
import { UserPositions, ErrorCodes, Status } from 'types/enums';
import { RegisterReqBody } from 'types/interfaces';

const debug = createDebug('auth');

const router = express.Router();

interface FindUserSQLType {
  username: string;
  email: string;
  registered: boolean;
}

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

      const findUserSQL =
        'SELECT username, email, registered FROM users WHERE username = $1 OR email = $2';
      const resultFind = await client.query<FindUserSQLType>(findUserSQL, [
        username,
        email.toLowerCase(),
      ]);
      debug('Find user result %O', resultFind);
      const existingUser = !!resultFind?.rows.length && resultFind.rows[0];
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

      const createUserSQL =
        'INSERT INTO users (username, password, email, position) VALUES ($1, $2, $3, $4)';
      const encryptedPassword = await encryptPassword(password);
      const resultCreate = await client.query(createUserSQL, [
        username,
        encryptedPassword,
        email,
        position,
      ]);
      debug('Create user result %O', resultCreate);

      client.release();
      return res.status(Status.OK).json(formatResponse());
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
