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

  public async getPermissions(userId: string): Promise<string[]> {
    const permissions = await this.users
      .child(`${userId}/permissions`)
      .once('value')
      .then(snapshot => snapshot.val());

    if (permissions === null) { return []; }

    const keys = Object.keys(permissions);
    const userPermissions = keys.filter(key => permissions[key]);

    return userPermissions;
  }

  public async addPermissions(userId: string, permissionsList: string[]): Promise<void> {
    await this.updatePermissions(userId, permissionsList, Permission.add);
  }

  public async removePermissions(userId: string, permissionsList: string[]): Promise<void> {
    await this.updatePermissions(userId, permissionsList, Permission.remove);
  }

  public async hasPermissions(userId: string, permissions: string[]): Promise<boolean> {
    const userPermissions = await this.users
      .child(`${userId}/permissions`)
      .once('value')
      .then(snapshot => snapshot.val());

    if (userPermissions === null) { return false; }

    const hasPermission = permissions.find(permission => !!userPermissions[permission]);

    return typeof hasPermission !== 'undefined';
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
