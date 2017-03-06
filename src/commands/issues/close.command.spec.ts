import { expect } from 'chai';
import { CloseIssueCommand } from './close.command';
import { Mock, IMock, Times, It } from 'typemoq';
import { IMessenger } from '../../messengers/messenger.interface';
import { IIssueRepository } from '../../repositories/issue.repository';

describe('CloseIssueCommand', () => {
  let mockIssueRepository: IMock<IIssueRepository>;
  let mockMessenger: IMock<IMessenger>;
  let closeIssueCommand: CloseIssueCommand;

  beforeEach(() => {
    mockIssueRepository = Mock.ofType<IIssueRepository>();
    mockMessenger = Mock.ofType<IMessenger>();

    closeIssueCommand = new CloseIssueCommand(mockIssueRepository.object, mockMessenger.object);
  });

  describe('#execute', () => {
    it('should call addIssue on issue repository', async () => {
      const issue = { number: '1234', action: 'close' };
      mockIssueRepository
        .setup(x => x.addIssue(issue))
        .returns(() => Promise.resolve());

      await closeIssueCommand.execute({ text: `!close #${issue.number}` });

      mockIssueRepository.verify(x => x.addIssue(It.isValue(issue)), Times.once());
    });

    it('should call sendMessage on messenger with formatted message', async () => {
      const issueNumber = 2345;
      const payload = { text: `!close ${issueNumber}`, channel: 'C345678' };
      const expectedMessageRegex = It.is(
        (message: string) => /^Issue .* added to the list .*/.test(message));

      mockIssueRepository
        .setup(x => x.addIssue(It.isAny()))
        .returns(() => Promise.resolve());

      await closeIssueCommand.execute(payload);

      mockMessenger.verify(
        x => x.sendMesssage(
          expectedMessageRegex,
          It.isValue(payload)),
        Times.once());
    });
  });

  describe('#canExecute', () => {
    it('should allow "!close #<issue number>" to execute', () => {
      const result = closeIssueCommand.canExecute({ text: '!close #9999' });

      expect(result).to.be.true;
    });

    it('should allow "!close <issue number>" to execute', () => {
      const result = closeIssueCommand.canExecute({ text: '!close 9999' });

      expect(result).to.be.true;
    });
  });
});
