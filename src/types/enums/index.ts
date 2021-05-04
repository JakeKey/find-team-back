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
  BAD_REQUEST = 400,
}

export enum ErrorCodes {
  SOMETHING_WENT_WRONG = 'SOMETHING_WENT_WRONG',
  USERNAME_ALREADY_TAKEN = 'USERNAME_ALREADY_TAKEN',
  EMAIL_ALREADY_REGISTERED = 'EMAIL_ALREADY_REGISTERED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}
