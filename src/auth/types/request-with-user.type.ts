import { type AuthenticatedUser } from './auth.types';

export interface RequestWithUser {
  user?: AuthenticatedUser;
}
