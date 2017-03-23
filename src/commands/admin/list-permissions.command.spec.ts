import { expect } from 'chai';
import { Mock, IMock, It, Times } from 'typemoq';
import { IUserRepository } from '../../repositories/user.respository';
import { IMessenger } from '../../messengers/messenger.interface';
import { ListPermissionsCommand } from './list-permissions.command';

describe('ListPermissionComamnd', () => {
  let mockMessenger: IMock<IMessenger>;
  let mockUserRepository: IMock<IUserRepository>;
  let command: ListPermissionsCommand;

  beforeEach(() => {
    mockUserRepository = Mock.ofType<IUserRepository>();
    mockMessenger = Mock.ofType<IMessenger>();

    command = new ListPermissionsCommand(mockUserRepository.object, mockMessenger.object);
  });

  describe('#canExecute', () => {
    it('should send message saying user lacks permissions to execute the command', async () => {
      const executingUserId = 'U4567SDFGH';

      mockUserRepository
        .setup(x => x.hasPermissions(It.isValue(executingUserId), It.isValue(['admin'])))
        .returns(() => Promise.resolve(false));

      await command.canExecute({ user: executingUserId, text: `!p <@U8675309FOO>` });

      mockMessenger.verify(
        x => x.sendMessage(It.isValue('You do not have permission to use this command.'), It.isAny()), Times.once());
    });

    it('should return false when user lacks permission', async () => {
      const executingUserId = 'U4567SDFGH';

      mockUserRepository
        .setup(x => x.hasPermissions(It.isValue(executingUserId), It.isValue(['admin'])))
        .returns(() => Promise.resolve(false));

      const result = await command.canExecute({ user: executingUserId, text: `!p <@U8675309FOO>` });

      expect(result).to.be.false;
    });

    it('should allow "!permission <@user>" to execute', async () => {
      mockUserRepository
        .setup(x => x.hasPermissions(It.isAny(), It.isAny()))
        .returns(() => Promise.resolve(true));

      const result = await command.canExecute({ text: '!permission <@U03SVJQQK>' });

      expect(result).to.be.true;
    });

    it('should allow "!permissions <@user>" to execute', async () => {
      mockUserRepository
        .setup(x => x.hasPermissions(It.isAny(), It.isAny()))
        .returns(() => Promise.resolve(true));

      const result = await command.canExecute({ text: '!permissions <@U03SVJQQK>' });

      expect(result).to.be.true;
    });

    it('should allow "!p <@user> <permission>" to execute', async () => {
      mockUserRepository
        .setup(x => x.hasPermissions(It.isAny(), It.isAny()))
        .returns(() => Promise.resolve(true));

      const result = await command.canExecute({ text: '!p <@U03SGJQQK>' });

      expect(result).to.be.true;
    });

    it('should now allow allow "!p <@user> some text" to execute', async () => {
      mockUserRepository
        .setup(x => x.hasPermissions(It.isAny(), It.isAny()))
        .returns(() => Promise.resolve(true));

      const result = await command.canExecute({ text: '!p <@U03SGJQQK> some text' });

      expect(result).to.be.false;
    });
  });

  describe('#execute', () => {
    it('should parse the userId', async () => {
      mockUserRepository
        .setup(x => x.getPermissions(It.isAny()))
        .returns(() => Promise.resolve([]));

      const userId = 'U98023BSV';
      await command.execute({ text: `!p <@${userId}>` });

      mockUserRepository.verify(x => x.getPermissions(It.isValue(userId)), Times.once());
    });

    it('should say there are no permissions for the user when returned an empty list of permissions', async () => {
      mockUserRepository
        .setup(x => x.getPermissions(It.isAny()))
        .returns(() => Promise.resolve([]));

      await command.execute({ text: `!p <@U98023BSV>` });

      mockMessenger.verify(x => x.sendMessage(It.isValue('User has no permissions.'), It.isAny()), Times.once());
    });

    it('should list permission for user when permission in list', async () => {
      mockUserRepository
        .setup(x => x.getPermissions(It.isAny()))
        .returns(() => Promise.resolve(['admin']));

      await command.execute({ text: `!p <@U98023BSV>` });

      mockMessenger.verify(x => x.sendMessage(It.isValue('User has the following permissions: `admin`.'), It.isAny()), Times.once());
    });

    it('should list all permissions for user when multiple permissions in list', async () => {
      mockUserRepository
        .setup(x => x.getPermissions(It.isAny()))
        .returns(() => Promise.resolve(['admin', 'ci']));

      await command.execute({ text: `!p <@U98023BSV>` });

      mockMessenger.verify(x => x.sendMessage(It.isValue('User has the following permissions: `admin`, `ci`.'), It.isAny()), Times.once());
    });
  });
});
