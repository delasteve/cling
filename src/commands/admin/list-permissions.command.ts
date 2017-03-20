import { IUserRepository } from '../../repositories/user.respository';
import { IMessenger } from '../../messengers/messenger.interface';
import { AbstractCommand } from '../abstract.command';

export class ListPermissionsCommand extends AbstractCommand {
  private readonly userRepository: IUserRepository;
  private readonly messenger: IMessenger;

  constructor(userRepository: IUserRepository, messenger: IMessenger) {
    const commandPattern = /^\!p(?:ermission(?:s)?)?\s+<\@(U\d+\w+)>\s*$/i;
    super(commandPattern);

    this.userRepository = userRepository;
    this.messenger = messenger;
  }

  public async canExecute(payload: any): Promise<boolean> {
    if (!(await super.canExecute(payload))) { return false; }

    const hasPermission = await this.userRepository.hasPermissions(payload.user, ['admin']);

    if (!hasPermission) {
      await this.messenger.sendMesssage('You do not have permission to use this command.', payload);
    }

    return hasPermission;
  }

  public async execute(payload: any): Promise<void> {
    const userId = this.getUserId(payload.text);
    const permissions = await this.userRepository.getPermissions(userId);

    if (permissions.length === 0) {
      return await this.messenger.sendMesssage(`User has no permissions.`, payload);
    }

    const userPermissions = permissions.join('`, `');

    await this.messenger.sendMesssage(`User has the following permissions: \`${userPermissions}\`.`, payload);
  }

  private getUserId(text: string) {
    const matches = this.commandPattern.exec(text);

    return matches[1];
  }
}
