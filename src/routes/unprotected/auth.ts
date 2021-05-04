import express, { Request, Response } from 'express';
import Joi from 'joi';

import pool from 'dbconfig';
import { validation } from 'middlewares';
import { UserPositions, ErrorCodes } from 'types/enums';

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
      }),
    }),
  ],
  async (req: Request, res: Response) => {
    const { username, email } = req.body;
    let client;
    try {
      client = await pool.connect();

      const sql = 'SELECT id, registered FROM users WHERE username = $1 OR email = $2';
      const result = await client.query(sql, [username, email]);
      if (result?.rows.length) throw new Error(ErrorCodes.USERNAME_ALREADY_TAKEN);

      client.release();
      return res.send('ok');
    } catch (err) {
      client?.release();
      return res.sendStatus(500);
    }
  }
);

router.post('/login', async (req, res) => {
  return res.send('ok');
});

export { router as auth };
