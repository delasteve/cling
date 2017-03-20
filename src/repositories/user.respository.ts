export interface IUserRepository {
  getPermissions(userId: string): Promise<string[]>;
  addPermissions(userId: string, permissions: string[]): Promise<void>;
  removePermissions(userId: string, permissions: string[]): Promise<void>;
  hasPermissions(userId: string, permissions: string[]): Promise<boolean>;
}
