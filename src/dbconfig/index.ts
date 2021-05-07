import { Pool } from 'pg';

import { CONFIG_CONSTS } from 'config';

export default new Pool({
  max: 20,
  connectionString: CONFIG_CONSTS.NODE_FTEAM_DB_CONNECT,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});
