import express, { Request, Response } from 'express';
import { PoolClient } from 'pg';

import pool from 'dbconfig';
import middlewares from 'middlewares';
import { createDebug, formatError, formatResponse } from 'utils';
import { Status, SuccessCodes } from 'types/enums';
import { GetProfileResponseData } from 'types/interfaces';
import { getProfileSQL } from 'sql';

const { authorise } = middlewares;

const debug = createDebug('profile');

const router = express.Router();

router.get('/', [authorise], async (req: Request<{ userId: number }, {}, {}>, res: Response) => {
  const { userId } = req.params;
  let client: PoolClient | undefined;

  try {
    client = await pool.connect();
    const resultGetProfile = await client.query<GetProfileResponseData>(getProfileSQL, [userId]);
    debug('Get Profile result: %O', resultGetProfile);
    const profile = resultGetProfile.rows[0];

    client.release();
    res
      .status(Status.OK)
      .json(formatResponse<GetProfileResponseData>(profile, SuccessCodes.PROFILE_DATA_RECEIVED));
  } catch (err) {
    debug('Get Profile error: %O', err);
    client?.release();
    res.status(Status.INTERNAL_SERVER_ERROR).json(formatError());
  }
});

export { router as profile };
