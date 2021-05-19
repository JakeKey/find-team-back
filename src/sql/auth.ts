import { UserType } from 'types/interfaces';

export type CheckIfUserExistSQLType = Pick<UserType, 'username' | 'registered' | 'email'>;

export const checkIfUserExistSQL =
  'SELECT username, email, registered FROM users WHERE username ILIKE $1 OR email = $2';

export const createUserSQL =
  'INSERT INTO users (username, password, email, position) VALUES ($1, $2, $3, $4) RETURNING id';

export const registerAnonymousUserSQL =
  'UPDATE users SET username = $1, password = $2, position = $4 WHERE email = $3 RETURNING id';

export const getCredentialsByUsernameSQL =
  'SELECT id, password, registered, verified FROM users WHERE username = $1';

export const getCredentialsByEmailSQL =
  'SELECT id, password, registered, verified FROM users WHERE email = $1';

export type GetCredentialsSQLType = Pick<UserType, 'id' | 'password' | 'registered' | 'verified'>;

export const createVerificationCodeSQL =
  'INSERT INTO verification_codes (user_id, code) VALUES ($1, $2)';

export const verifyCodeSQL = 'SELECT user_id, created_at FROM verification_codes WHERE code = $1';

export const checkIfUserIsVerifiedSQL = 'SELECT verified FROM users WHERE id = $1';

export const verifyUserSQL = 'UPDATE users SET verified = true WHERE id = $1';
