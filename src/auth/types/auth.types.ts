import { type User, type UserRole } from '@prisma/client';

export type AuthenticatedUser = Pick<
  User,
  | 'id'
  | 'fullName'
  | 'email'
  | 'department'
  | 'role'
  | 'isActive'
  | 'lastLoginAt'
  | 'createdAt'
  | 'updatedAt'
>;

export interface JwtAuthPayload {
  sub: string;
  email: string;
  role: UserRole;
}
