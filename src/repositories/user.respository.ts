export interface IUserRepository {
  addPermissions(userId: string, permissions: string[]): Promise<void>;
  removePermissions(userId: string, permissions: string[]): Promise<void>;
  hasPermission(userId: string, permissions: string[]): Promise<boolean>;
}
