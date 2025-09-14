import { UserRole } from '@eams/database';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
  iat?: number; // Issued at
  exp?: number; // Expires at
}

export interface AuthenticatedUser {
  sub: string; // User ID
  email: string;
  role: UserRole;
}
