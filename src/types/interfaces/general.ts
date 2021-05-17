import { ErrorCodes, SuccessCodes } from 'types/enums';

export interface ResponseModel<T> {
  data: T;
  success?: SuccessCodes;
  error?: ErrorCodes;
}
