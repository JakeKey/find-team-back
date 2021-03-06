import { config } from 'dotenv';

config();

export const CONFIG_CONSTS = {
  NODE_FTEAM_RECAPTCHA_SECRET: process.env.NODE_FTEAM_RECAPTCHA_SECRET,
  NODE_FTEAM_JWT_SECRET: process.env.NODE_FTEAM_JWT_SECRET,
  NODE_FTEAM_FRONT_ORIGIN: process.env.NODE_FTEAM_FRONT_ORIGIN,
  NODE_FTEAM_PORT: process.env.NODE_FTEAM_PORT,
  NODE_FTEAM_DB_CONNECT: process.env.NODE_FTEAM_DB_CONNECT,
  NODE_FTEAM_MAIL_SERVICE_API_URL: process.env.NODE_FTEAM_MAIL_SERVICE_API_URL,
  NODE_FTEAM_MAIL_SERVICE_API_APP_KEY: process.env.NODE_FTEAM_MAIL_SERVICE_API_APP_KEY,
  NODE_FTEAM_MAIL_SERVICE_API_SECRET_KEY: process.env.NODE_FTEAM_MAIL_SERVICE_API_SECRET_KEY,
  NODE_FTEAM_MAIL_SERVICE_API_SMTP: process.env.NODE_FTEAM_MAIL_SERVICE_API_SMTP,
  NODE_FTEAM_HASH_PRIVATE_KEY: process.env.NODE_FTEAM_HASH_PRIVATE_KEY,
  NODE_ENV: process.env.NODE_ENV,
};
