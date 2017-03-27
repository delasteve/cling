import { AbstractCommand } from '../abstract.command';
import { slackMessenger, userRepository } from '../../../index'

export class ListPermissionsCommand extends AbstractCommand {
  constructor() {
    const commandPattern = /^\!p(?:ermission(?:s)?)?\s+<\@(U\d+\w+)>\s*$/i;
    super(commandPattern);
  }

  public async canExecute(payload: any): Promise<boolean> {
    if (!(await super.canExecute(payload))) { return false; }

    const hasPermission = await userRepository.hasPermissions(payload.user, ['admin']);

    if (!hasPermission) {
      await slackMessenger.sendMessage('You do not have permission to use this command.', payload);
    }

    return hasPermission;
  }

  public async execute(payload: any): Promise<void> {
    const userId = this.getUserId(payload.text);
    const permissions = await userRepository.getPermissions(userId);

    if (permissions.length === 0) {
      return await slackMessenger.sendMessage(`User has no permissions.`, payload);
    }

    const userPermissions = permissions.join('`, `');

    await slackMessenger.sendMessage(`User has the following permissions: \`${userPermissions}\`.`, payload);
  }

  private getUserId(text: string) {
    const matches = this.commandPattern.exec(text);

    return matches[1];
  }
}
