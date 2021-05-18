import fetch from 'node-fetch';

import { CONFIG_CONSTS } from 'config';

import { createDebug } from './helpers';
import { getVerificationTemplateHTML } from './templates';

const debug = createDebug('mail');

interface MailConfigType {
  subject: string;
  html: string;
  from: string;
  from_name: string;
}

type MailConfigHandlerType = (username: string, href: string) => MailConfigType;

enum MailTypeEnum {
  VERIFICATION = 'VERIFICATION',
}

type MailTypes = Record<MailTypeEnum, MailConfigHandlerType>;

const MAIL: MailTypes = {
  VERIFICATION: (username: string, href: string) => ({
    subject: 'Find Team - Verify your email address',
    html: getVerificationTemplateHTML(username, href),
    from: 'welcome@find-team.com',
    from_name: 'Find Team',
  }),
};

const encodeParams = (params: Record<string, string>) =>
  Object.keys(params)
    .map(
      (paramKey) =>
        `${encodeURIComponent(
          paramKey === 'to' ? `to[${params[paramKey]}]` : paramKey
        )}=${encodeURIComponent(params[paramKey])}`
    )
    .join('&');

const prepareValidationLink = (code: string) =>
  `${CONFIG_CONSTS?.NODE_FTEAM_FRONT_ORIGIN || ''}/verify?code=${code}`;

export const mailApi = {
  send: async (to: string, username: string, code: string): Promise<void> => {
    const {
      NODE_FTEAM_MAIL_SERVICE_API_URL,
      NODE_FTEAM_MAIL_SERVICE_API_APP_KEY,
      NODE_FTEAM_MAIL_SERVICE_API_SECRET_KEY,
      NODE_FTEAM_MAIL_SERVICE_API_SMTP,
    } = CONFIG_CONSTS;

    if (!NODE_FTEAM_MAIL_SERVICE_API_URL || !NODE_FTEAM_MAIL_SERVICE_API_SMTP) throw new Error('');

    const response = await fetch(NODE_FTEAM_MAIL_SERVICE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          NODE_FTEAM_MAIL_SERVICE_API_APP_KEY + ':' + NODE_FTEAM_MAIL_SERVICE_API_SECRET_KEY
        ).toString('base64')}`,
      },
      body: encodeParams({
        ...MAIL.VERIFICATION(username, prepareValidationLink(code)),
        to,
        smtp_account: NODE_FTEAM_MAIL_SERVICE_API_SMTP,
      }),
    });

    debug('sendMail response %O', response);

    return response.json();
  },
};
