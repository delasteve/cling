import { IUserRepository } from '../../repositories/user.respository';
import { IMessenger } from '../../messengers/messenger.interface';
import { AbstractCommand } from '../abstract.command';

export class GrantPermissionsCommand extends AbstractCommand {
  private readonly userRepository: IUserRepository;
  private readonly messenger: IMessenger;
  private readonly validPermissions: string[];

  constructor(userRepository: IUserRepository, messenger: IMessenger) {
    const commandPattern = /^\!p(?:ermission(?:s)?)?\s+<\@(U\d+\w+)>\s+(.*)/i;
    super(commandPattern);

    this.userRepository = userRepository;
    this.messenger = messenger;
    // TODO: put this in the database
    this.validPermissions = [
      'admin',
      'open', 'close', 'label', 'assign', 'review', 'lock',
      'issue', 'issue:open', 'issue:close', 'issue:label', 'issue:assign', 'issue:lock',
      'pr', 'pr:open', 'pr:close', 'pr:label', 'pr:assign', 'pr:review', 'pr:lock',
      'ci', 'travis', 'appveyor'
    ];
  }

  public async canExecute(payload: any): Promise<boolean> {
    if (!(await super.canExecute(payload))) { return false; }

    const hasPermission = await this.userRepository.hasPermissions(payload.user, ['admin']);

    if (!hasPermission) {
      await this.messenger.sendMessage('You do not have permission to use this command.', payload);
    }

    return hasPermission;
  }

  public async execute(payload: any): Promise<void> {
    const userId = this.getUserId(payload.text);
    const permissions = this.getPermissionChanges(payload.text);

    await this.userRepository.addPermissions(userId, permissions.add);
    await this.userRepository.removePermissions(userId, permissions.remove);

    if (permissions.add.length > 0 || permissions.remove.length > 0) {
      await this.messenger.sendMessage('Successfully updated permissions.', payload);
    } else {
      await this.messenger.sendMessage('No permissions were updated.', payload);
    }
  }

  private getUserId(text: string) {
    const matches = this.commandPattern.exec(text);

    return matches[1];
  }

  private getPermissionChanges(text: string) {
    const matches = this.commandPattern.exec(text)[2];
    const allPermissions: string[] = matches.split(' ');
    const permissionsToAdd = allPermissions
      .filter(permission => this.validPermissions.includes(permission));
    const permissionsToRemove = allPermissions
      .map(permission => permission.substring(1))
      .filter(permission => this.validPermissions.includes(permission));

    return {
      add: permissionsToAdd,
      remove: permissionsToRemove
    };
  }
}
