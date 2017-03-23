import { expect } from 'chai';
import { Mock, IMock, It, Times } from 'typemoq';
import { IUserRepository } from '../../repositories/user.respository';
import { IMessenger } from '../../messengers/messenger.interface';
import { GrantPermissionsCommand } from './grant-permissions.command';

describe('GrantPermissionComamnd', () => {
  let mockMessenger: IMock<IMessenger>;
  let mockUserRepository: IMock<IUserRepository>;
  let command: GrantPermissionsCommand;

  beforeEach(() => {
    mockUserRepository = Mock.ofType<IUserRepository>();
    mockMessenger = Mock.ofType<IMessenger>();

    command = new GrantPermissionsCommand(mockUserRepository.object, mockMessenger.object);
  });

  describe('#canExecute', () => {
    it('should send message saying user lacks permissions to execute the command', async () => {
      const executingUserId = 'U4567SDFGH';

      mockUserRepository
        .setup(x => x.hasPermissions(It.isValue(executingUserId), It.isValue(['admin'])))
        .returns(() => Promise.resolve(false));

      await command.canExecute({ user: executingUserId, text: `!p <@U8675309FOO> issue` });

      mockMessenger.verify(
        x => x.sendMessage(It.isValue('You do not have permission to use this command.'), It.isAny()), Times.once());
    });

    it('should return false when user lacks permission', async () => {
      const executingUserId = 'U4567SDFGH';

      mockUserRepository
        .setup(x => x.hasPermissions(It.isValue(executingUserId), It.isValue(['admin'])))
        .returns(() => Promise.resolve(false));

      const result = await command.canExecute({ user: executingUserId, text: `!p <@U8675309FOO> issue` });

      expect(result).to.be.false;
    });

    it('should allow "!permission <@user> <permission>" to execute', async () => {
      mockUserRepository
        .setup(x => x.hasPermissions(It.isAny(), It.isAny()))
        .returns(() => Promise.resolve(true));

      const result = await command.canExecute({ text: '!permission <@U03SVJQQK> foo' });

      expect(result).to.be.true;
    });

    it('should allow "!permissions <@user> <permission>" to execute', async () => {
      mockUserRepository
        .setup(x => x.hasPermissions(It.isAny(), It.isAny()))
        .returns(() => Promise.resolve(true));

      const result = await command.canExecute({ text: '!permissions <@U03SVJQQK> foo' });

      expect(result).to.be.true;
    });

    it('should allow "!p <@user> <permission>" to execute', async () => {
      mockUserRepository
        .setup(x => x.hasPermissions(It.isAny(), It.isAny()))
        .returns(() => Promise.resolve(true));

      const result = await command.canExecute({ text: '!p <@U03SGJQQK> foo' });

      expect(result).to.be.true;
    });

    it('should allow "!p <@user> <permission> -<permission>" to execute', async () => {
      mockUserRepository
        .setup(x => x.hasPermissions(It.isAny(), It.isAny()))
        .returns(() => Promise.resolve(true));

      const result = await command.canExecute({ text: '!p <@U03SGJQQK> foo -bar' });

      expect(result).to.be.true;
    });
  });

  describe('#execute', () => {
    beforeEach(() => {
      mockUserRepository
        .setup(x => x.hasPermissions(It.isAny(), It.isAny()))
        .returns(() => Promise.resolve(true));
    });

    it('should parse the userId', async () => {
      const userId = 'U98023BSV';
      await command.execute({ text: `!p <@${userId}> foo` });

      mockUserRepository.verify(x => x.addPermissions(It.isValue(userId), It.isAny()), Times.once());
      mockUserRepository.verify(x => x.removePermissions(It.isValue(userId), It.isAny()), Times.once());
    });

    it('should parse a permission to add', async () => {
      await command.execute({ text: `!p <@U8675309FOO> issue` });

      mockUserRepository.verify(x => x.addPermissions(It.isAny(), It.isValue(['issue'])), Times.once());
    });

    it('should parse multiple permissions to add', async () => {
      await command.execute({ text: `!p <@U8675309FOO> issue pr` });

      mockUserRepository.verify(
        x => x.addPermissions(It.isAny(), It.is((y: any[]) =>
          !!expect(y).to.deep.equal(['issue', 'pr'])
        )), Times.once());
    });

    it('should parse a permission to remove', async () => {
      await command.execute({ text: `!p <@U8675309FOO> -issue` });

      mockUserRepository.verify(x => x.removePermissions(It.isAny(), It.isValue(['issue'])), Times.once());
    });

    it('should parse multiple permissions to remove', async () => {
      await command.execute({ text: `!p <@U8675309FOO> -issue -pr` });

      mockUserRepository.verify(
        x => x.removePermissions(It.isAny(), It.is((y: any[]) =>
          !!expect(y).to.deep.equal(['issue', 'pr'])
        )), Times.once());
    });

    it('should parse permissions to add and remove', async () => {
      await command.execute({ text: `!p <@U8675309FOO> issue -pr` });

      mockUserRepository.verify(x => x.addPermissions(It.isAny(), It.isValue(['issue'])), Times.once());
      mockUserRepository.verify(x => x.removePermissions(It.isAny(), It.isValue(['pr'])), Times.once());
    });

    it('should send message notifying an update occurred', async () => {
      await command.execute({ text: `!p <@U8675309FOO> issue` });

      mockMessenger.verify(x => x.sendMessage(It.isValue('Successfully updated permissions.'), It.isAny()), Times.once());
    });

    it('should send message notifying a failed update when permission is not valid', async () => {
      await command.execute({ text: `!p <@U8675309FOO> foo` });

      mockMessenger.verify(x => x.sendMessage(It.isValue('No permissions were updated.'), It.isAny()), Times.once());
    });
  });
});
