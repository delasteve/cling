export interface IUserRepository {
  addPermissions(userId: string, permissions: string[]);
  removePermissions(userId: string, permissions: string[]);
}
