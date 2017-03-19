import { IUserRepository } from '../user.respository';
import * as admin from 'firebase-admin';

enum Permission {
  add,
  remove
}

export class FirebaseUserRepository implements IUserRepository {

  private users: admin.database.Reference;

  constructor(
    private readonly database: admin.database.Database
  ) {
    this.users = this.database.ref('users');
  }

  public async addPermissions(userId: string, permissionsList: string[]): Promise<void> {
    await this.updatePermissions(userId, permissionsList, Permission.add);
  }

  public async removePermissions(userId: string, permissionsList: string[]): Promise<void> {
    await this.updatePermissions(userId, permissionsList, Permission.remove);
  }

  private async updatePermissions(userId: string, permissionsList: string[], permissionType: Permission): Promise<void> {
    const permissions = this.createPermissionsObject(permissionsList, permissionType);

    await this.users
      .child(`${userId}/permissions`)
      .update(permissions);
  }

  private createPermissionsObject(permissions: string[], permissionType: Permission): any {
    return permissions
      .reduce((permissionsObject: any, permission: string) => {
        permissionsObject[permission] = permissionType === Permission.add;

        return permissionsObject;
      }, {});
  }
}
