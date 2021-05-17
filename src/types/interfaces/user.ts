import { UserPositions } from 'types/enums';

export interface UserType {
  id: number;
  username: string;
  password: string;
  email: string;
  position?: UserPositions;
  createdAt: Date;
  verified: boolean;
  registered: boolean;
}
