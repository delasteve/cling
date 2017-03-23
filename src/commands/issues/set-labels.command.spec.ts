import { expect } from 'chai';
import { Mock, IMock, It, Times } from 'typemoq';
import { IGitHubRepository } from '../../repositories/github.repository';
import { IUserRepository } from '../../repositories/user.respository';
import { IMessenger } from '../../messengers/messenger.interface';
import { SetLabelsCommand } from './set-labels.command';

describe('GrantPermissionComamnd', () => {
  let mockGitHubRepository: IMock<IGitHubRepository>;
  let mockUserRepository: IMock<IUserRepository>;
  let mockMessenger: IMock<IMessenger>;
  let command: SetLabelsCommand;

  beforeEach(() => {
    mockGitHubRepository = Mock.ofType<IGitHubRepository>();
    mockUserRepository = Mock.ofType<IUserRepository>();
    mockMessenger = Mock.ofType<IMessenger>();

    command = new SetLabelsCommand(mockGitHubRepository.object, mockUserRepository.object, mockMessenger.object);
  });

  describe('#canExecute', () => {
    beforeEach(() => {
      mockGitHubRepository
        .setup(x => x.getIssue(It.isAny()))
        .returns(() => Promise.resolve({}));
    });

    it('should ask for permissions on the executing userId', async () => {
      const executingUserId = 'U2345678';
      mockUserRepository
        .setup(x => x.hasPermissions(It.isValue(executingUserId), It.isAny()))
        .returns(() => Promise.resolve(true));

      await command.canExecute({ user: executingUserId, text: '!l #4567 closable' });

      mockUserRepository.verify(x => x.hasPermissions(It.isValue(executingUserId), It.isAny()), Times.once());
    });

    it('should ask for admin and label permissions', async () => {
      mockUserRepository
        .setup(x => x.hasPermissions(It.isAny(), It.isAny()))
        .returns(() => Promise.resolve(true));

      await command.canExecute({ text: '!l #4567 closable' });

      mockUserRepository.verify(
        x => x.hasPermissions(
          It.isAny(),
          It.is((y: string[]) => !!expect(y).to.include.members(['admin', 'issue']))),
        Times.once());
    });

    it('should ask for issue label permissions when dealing with an issue', async () => {
      mockUserRepository
        .setup(x => x.hasPermissions(It.isAny(), It.isAny()))
        .returns(() => Promise.resolve(true));

      await command.canExecute({ text: '!l #4567 closable' });

      mockUserRepository.verify(
        x => x.hasPermissions(
          It.isAny(),
          It.is((y: string[]) => !!expect(y).to.include.members(['issue', 'issue:label']))),
        Times.once());
    });

    it('should ask for pull request label permissions when dealing with an pull request', async () => {
      mockUserRepository
        .setup(x => x.hasPermissions(It.isAny(), It.isAny()))
        .returns(() => Promise.resolve(true));

      mockGitHubRepository
        .setup(x => x.getIssue(It.isAny()))
        .returns(() => Promise.resolve({ pull_request: {} }));

      await command.canExecute({ text: '!l #4567 closable' });

      mockUserRepository.verify(
        x => x.hasPermissions(
          It.isAny(),
          It.is((y: string[]) => !!expect(y).to.include.members(['pr', 'pr:label']))),
        Times.once());
    });

    describe('user lacking permission', () => {
      beforeEach(() => {
        mockUserRepository
          .setup(x => x.hasPermissions(It.isAny(), It.isAny()))
          .returns(() => Promise.resolve(false));
      });

      it('should send message saying user lacks permissions to execute the command', async () => {
        await command.canExecute({ text: '!l #4567 closable' });

        mockMessenger.verify(
          x => x.sendMessage(It.isValue('You do not have permission to use this command.'), It.isAny()), Times.once());
      });

      it('should return false when user lacks permission', async () => {
        const executingUserId = 'U4567SDFGH';

        mockUserRepository
          .setup(x => x.hasPermissions(It.isValue(executingUserId), It.isAny()))
          .returns(() => Promise.resolve(false));

        const result = await command.canExecute({ user: executingUserId, text: '!l #4567 closable' });

        expect(result).to.be.false;
      });
    });

    describe('user has permission', () => {
      beforeEach(() => {
        mockUserRepository
          .setup(x => x.hasPermissions(It.isAny(), It.isAny()))
          .returns(() => Promise.resolve(true));
      });

      it('should allow "!label #<issue> <label>" to execute', async () => {
        const result = await command.canExecute({ text: '!label #1234 foo' });

        expect(result).to.be.true;
      });

      it('should allow "!label <issue> <label>" to execute', async () => {
        const result = await command.canExecute({ text: '!label 1234 foo' });

        expect(result).to.be.true;
      });

      it('should allow "!l #<issue> <label>" to execute', async () => {
        const result = await command.canExecute({ text: '!l #1234 foo' });

        expect(result).to.be.true;
      });

      it('should allow "!l <issue> <label>" to execute', async () => {
        const result = await command.canExecute({ text: '!l 1234 foo' });

        expect(result).to.be.true;
      });

      it('should allow "!l #<issue> <label> <label>" to execute', async () => {
        const result = await command.canExecute({ text: '!l #1234 foo' });

        expect(result).to.be.true;
      });

      it('should allow "!l <issue> <label> -<label>" to execute', async () => {
        const result = await command.canExecute({ text: '!l 1234 foo -bar' });

        expect(result).to.be.true;
      });
    });
  });

  describe('#execute', () => {
    beforeEach(() => {
      mockUserRepository
        .setup(x => x.hasPermissions(It.isAny(), It.isAny()))
        .returns(() => Promise.resolve(true));
    });
  });
});
