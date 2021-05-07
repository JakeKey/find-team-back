export enum UserPositions {
  frontend = 'frontend',
  backend = 'backend',
  fullstack = 'fullstack',
  designer = 'designer',
  PM = 'PM',
  PO = 'PO',
  other = 'other',
}

export enum Status {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
}

export enum ErrorCodes {
  SOMETHING_WENT_WRONG = 'SOMETHING_WENT_WRONG',
  USERNAME_ALREADY_TAKEN = 'USERNAME_ALREADY_TAKEN',
  EMAIL_ALREADY_REGISTERED = 'EMAIL_ALREADY_REGISTERED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_CAPTCHA = 'INVALID_CAPTCHA',
}

export enum SuccessCodes {
  SUCCESS = 'SUCCESS',
}
