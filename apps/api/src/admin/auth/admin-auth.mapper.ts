import { AdminUser } from '../entities/admin-user.entity';

export type PublicAdminUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  permissions: string[];
};

export function toPublicAdmin(admin: AdminUser): PublicAdminUser {
  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role.name,
    permissions: admin.role.permissions.map((p) => p.key),
  };
}
