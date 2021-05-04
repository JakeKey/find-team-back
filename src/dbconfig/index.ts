import { Pool } from 'pg';

export default new Pool({
  max: 20,
  connectionString: process.env.NODE_FTEAM_DB_CONNECT,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});
