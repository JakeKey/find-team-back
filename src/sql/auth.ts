import { UserType } from 'types/interfaces';

export type CheckIfUserExistSQLType = Pick<UserType, 'username' | 'registered' | 'email'>;

export const checkIfUserExistSQL =
  'SELECT username, email, registered FROM users WHERE username = $1 OR email = $2';

export const createUserSQL =
  'INSERT INTO users (username, password, email, position) VALUES ($1, $2, $3, $4)';

export const getCredentialsByUsernameSQL =
  'SELECT id, password, registered FROM users WHERE username = $1';

export const getCredentialsByEmailSQL =
  'SELECT id, password, registered FROM users WHERE email = $1';

export type GetCredentialsSQLType = Pick<UserType, 'id' | 'password' | 'registered'>;
