import express, { Request, Response } from 'express';
import Joi from 'joi';

import { validation } from 'middlewares';

const router = express.Router();

router.post(
  '/register',
  [
    validation({
      body: Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required(),
        password: Joi.string().min(8).max(128).required(),
      }),
    }),
  ],
  async (req: Request, res: Response) => {
    return res.send('ok');
  }
);

router.post('/login', async (req, res) => {
  return res.send('ok');
});

export { router as auth };
