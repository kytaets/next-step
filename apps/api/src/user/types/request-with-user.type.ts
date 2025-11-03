import { Request } from 'express';
import { UserWithoutPassword } from './user-without-password.type';

export interface RequestWithUser extends Request {
  user: UserWithoutPassword;
}
