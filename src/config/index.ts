import { config } from 'dotenv';

config();

export const CONFIG_CONSTS = {
  NODE_FTEAM_RECAPTCHA_SECRET: process.env.NODE_FTEAM_RECAPTCHA_SECRET,
  NODE_FTEAM_FRONT_ORIGIN: process.env.NODE_FTEAM_FRONT_ORIGIN,
  NODE_FTEAM_PORT: process.env.NODE_FTEAM_PORT,
  NODE_FTEAM_DB_CONNECT: process.env.NODE_FTEAM_DB_CONNECT,
  NODE_ENV: process.env.NODE_ENV,
};
