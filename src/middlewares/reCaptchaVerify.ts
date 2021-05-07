import { Request, Response, NextFunction } from 'express';

import { createDebug, formatError, postReCaptchaResponse } from 'utils';
import { ErrorCodes, Status } from 'types/enums';

const debug = createDebug('recaptcha');

export const reCaptchaVerify = async (
  req: Request<{}, {}, { reCaptchaResponse?: string }>,
  res: Response,
  next: NextFunction
) => {
  const { reCaptchaResponse } = req.body;
  const returnCaptchaError = () =>
    res.status(Status.TOO_MANY_REQUESTS).json(formatError(ErrorCodes.INVALID_CAPTCHA));

  try {
    if (!reCaptchaResponse) {
      returnCaptchaError();
      return;
    }
    const response = await postReCaptchaResponse(reCaptchaResponse);
    debug('reCaptchaVerify response %O', response);

    if (!response?.success) {
      returnCaptchaError();
      return;
    } else {
      next();
    }
  } catch (err) {
    debug('reCaptchaVerify error %O', err);
    returnCaptchaError();
  }
};
