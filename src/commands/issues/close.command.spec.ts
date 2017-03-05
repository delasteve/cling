import { expect } from 'chai';
import { CloseIssueCommand } from './close.command';
import { Mock, IMock } from 'typemoq';
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
    it.skip('should call addIssue on issue repository');
    it.skip('should handle error from issue repository gracefully');
    it.skip('should call sendMessage on messenger with formatted message');
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
