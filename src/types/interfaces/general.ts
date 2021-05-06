import { ErrorCodes, SuccessCodes } from 'types/enums';

export interface ResponseModel {
  data?: object;
  code: SuccessCodes | ErrorCodes;
}
