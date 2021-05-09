export interface CheckIfUserExistSQLType {
  username: string;
  email: string;
  registered: boolean;
}

export const checkIfUserExistSQL =
  'SELECT username, email, registered FROM users WHERE username = $1 OR email = $2';

export const createUserSQL =
  'INSERT INTO users (username, password, email, position) VALUES ($1, $2, $3, $4)';
