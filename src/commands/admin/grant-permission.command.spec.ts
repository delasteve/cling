import { expect } from 'chai';
import { Mock, IMock, It, Times } from 'typemoq';
import { IUserRepository } from '../../repositories/user.respository';
import { IMessenger } from '../../messengers/messenger.interface';
import { GrantPermissionCommand } from './grant-permission.command';

describe('GrantPermissionComamnd', () => {
  let mockMessenger: IMock<IMessenger>;
  let mockUserRepository: IMock<IUserRepository>;
  let command: GrantPermissionCommand;

  beforeEach(() => {
    mockUserRepository = Mock.ofType<IUserRepository>();
    mockMessenger = Mock.ofType<IMessenger>();

    command = new GrantPermissionCommand(mockUserRepository.object, mockMessenger.object);
  });

  describe('#canExecute', () => {
    it('should allow "!permission <@user> <permission>" to execute', async () => {
      const result = await command.canExecute({ text: '!permission <@U03SVJQQK> foo' });

      expect(result).to.be.true;
    });

    it('should allow "!permissions <@user> <permission>" to execute', async () => {
      const result = await command.canExecute({ text: '!permissions <@U03SVJQQK> foo' });

      expect(result).to.be.true;
    });

    it('should allow "!p <@user> <permission>" to execute', async () => {
      const result = await command.canExecute({ text: '!p <@U03SGJQQK> foo' });

      expect(result).to.be.true;
    });
  });

  describe('#execute', () => {
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
  });
});
