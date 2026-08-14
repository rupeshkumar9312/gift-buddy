import { User } from '../users/entities/user.entity';

export type PublicUser = {
  id: number;
  email: string | null;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
};

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
  };
}
