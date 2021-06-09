import { UserType } from './user';

export type ProfileType = Pick<UserType, 'id' | 'position' | 'username'>;
