import { UserType } from './user';

export interface PositionType extends Required<Pick<UserType, 'position'>> {
  count: number;
}

export type ProjectUserType = Pick<UserType, 'id' | 'username' | 'position'>;

export interface ProjectType {
  id: number;
  ownerId: number;
  name: string;
  description: string;
  createdAt: Date;
  users?: ProjectUserType[];
  positions?: PositionType[];
}
