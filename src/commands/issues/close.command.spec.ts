import { expect } from 'chai';
import { CloseIssueCommand } from './close.command';
import { Mock, IMock, Times, It } from 'typemoq';
import { IMessenger } from '../../messengers/messenger.interface';
import { IGitHubRepository } from '../../repositories/github.repository';

describe('CloseIssueCommand', () => {
  const project = 'foo/bar';
  let mockGitHubRepository: IMock<IGitHubRepository>;
  let mockMessenger: IMock<IMessenger>;
  let closeIssueCommand: CloseIssueCommand;

  beforeEach(() => {
    mockGitHubRepository = Mock.ofType<IGitHubRepository>();
    mockMessenger = Mock.ofType<IMessenger>();

    closeIssueCommand = new CloseIssueCommand(project, mockGitHubRepository.object, mockMessenger.object);
  });

  describe('#canExecute', () => {
    it('should allow "!close #<issue number>" to execute', async () => {
      const result = await closeIssueCommand.canExecute({ text: '!close #9999' });

      expect(result).to.be.true;
    });

    it('should allow "!close <issue number>" to execute', async () => {
      const result = await closeIssueCommand.canExecute({ text: '!close 9999' });

      expect(result).to.be.true;
    });
  });

  describe('#execute', () => {
    it('should call addLabels on the github repository', async () => {
      const issue = '1234';
      const labels = ['close'];
      mockGitHubRepository
        .setup(x => x.addLabels(issue, labels))
        .returns(() => Promise.resolve());

      await closeIssueCommand.execute({ text: `!close #${issue}` });

      mockGitHubRepository.verify(x => x.addLabels(It.isValue(issue), It.isValue(labels)), Times.once());
    });

    it('should call sendMessage on messenger with formatted message', async () => {
      const issueNumber = 2345;
      const payload = { text: `!close ${issueNumber}`, channel: 'C345678' };
      const expectedMessageRegex = It.is(
        (message: string) => /^Issue .*foo\/bar.* labeled `close`/.test(message));

      mockGitHubRepository
        .setup(x => x.addLabels(It.isAny(), It.isAny()))
        .returns(() => Promise.resolve());

      await closeIssueCommand.execute(payload);

      mockMessenger.verify(
        x => x.sendMessage(
          expectedMessageRegex,
          It.isValue(payload)),
        Times.once());
    });
  });
});
