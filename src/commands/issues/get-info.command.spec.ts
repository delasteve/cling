import { expect } from 'chai';
import { GetIssueInfoCommand } from './get-info.command';
import { IMock, Mock, Times, It } from 'typemoq';
import { IGitHubRepository } from '../../repositories/github.repository';
import { IMessenger, LinkableText } from '../../messengers/messenger.interface';

describe('GetIssueInfoCommand', () => {
  let mockGitHubRepository: IMock<IGitHubRepository>;
  let mockMessenger: IMock<IMessenger>;
  let getIssueInfoCommand: GetIssueInfoCommand;
  let issue: any;
  const issueNumber = '1234';

  beforeEach(() => {
    mockGitHubRepository = Mock.ofType<IGitHubRepository>();
    mockMessenger = Mock.ofType<IMessenger>();

    issue = {
      html_url: `https://github.com/foo/bar/issues/${issueNumber}`,
      number: issueNumber,
      title: 'Do something awesome',
      user: {
        login: 'octocat',
        html_url: 'https://github.com/octocat',
      },
      labels: [],
      state: 'open',
      assignees: [],
    };

    getIssueInfoCommand = new GetIssueInfoCommand(mockGitHubRepository.object, mockMessenger.object);
  });

  describe('#canExecute', () => {
    it('should allow "!info #<issue number>" to execute', async () => {
      const result = await getIssueInfoCommand.canExecute({ text: '!info #9999' });

      expect(result).to.be.true;
    });

    it('should allow "!info <issue number>" to execute', async () => {
      const result = await getIssueInfoCommand.canExecute({ text: '!info 9999' });

      expect(result).to.be.true;
    });

    it('should allow "!i #<issue number>" to execute', async () => {
      const result = await getIssueInfoCommand.canExecute({ text: '!i #9999' });

      expect(result).to.be.true;
    });

    it('should allow "!i <issue number>" to execute', async () => {
      const result = await getIssueInfoCommand.canExecute({ text: '!i 9999' });

      expect(result).to.be.true;
    });
  });

  describe('#execute', () => {
    beforeEach(() => {
      mockGitHubRepository
        .setup(x => x.getIssue(issueNumber))
        .returns(() => Promise.resolve(issue));
    });

    it('should call getIssue on the github repository', async () => {
      await getIssueInfoCommand.execute({ text: `!info #${issueNumber}` });

      mockGitHubRepository.verify(
        x => x.getIssue(It.isValue(issueNumber)),
        Times.once());
    });

    it('should call sendRichMessage on messenger', async () => {
      await getIssueInfoCommand.execute({ text: `!info #${issueNumber}` });

      mockMessenger.verify(
        x => x.sendRichMessage(It.isAny(), It.isAny(), It.isAny(), It.isAny(), It.isAny()),
        Times.once());
    });

    it('should format title string for an issue', async () => {
      const expectedTitle: LinkableText = {
        text: `Issue #${issue.number}: ${issue.title}`,
        url: issue.html_url
      };

      await getIssueInfoCommand.execute({ text: `!info #${issueNumber}` });

      mockMessenger.verify(
        x => x.sendRichMessage(It.isValue(expectedTitle), It.isAny(), It.isAny(), It.isAny(), It.isAny()),
        Times.once());
    });

    it('should format title string for a pull request', async () => {
      issue.pull_request = {};

      const expectedTitle: LinkableText = {
        text: `Pull Request #${issue.number}: ${issue.title}`,
        url: issue.html_url
      };

      await getIssueInfoCommand.execute({ text: `!info #${issueNumber}` });

      mockMessenger.verify(
        x => x.sendRichMessage(It.isValue(expectedTitle), It.isAny(), It.isAny(), It.isAny(), It.isAny()),
        Times.once());
    });

    it('should set the color to github green when issue is open', async () => {
      const expectedColor = '#2cbe4e';

      await getIssueInfoCommand.execute({ text: `!info #${issueNumber}` });

      mockMessenger.verify(
        x => x.sendRichMessage(It.isAny(), It.isValue(expectedColor), It.isAny(), It.isAny(), It.isAny()),
        Times.once());
    });

    it('should set the color to github red when issue is closed', async () => {
      issue.state = 'closed';
      const expectedColor = '#cb2431';

      await getIssueInfoCommand.execute({ text: `!info #${issueNumber}` });

      mockMessenger.verify(
        x => x.sendRichMessage(It.isAny(), It.isValue(expectedColor), It.isAny(), It.isAny(), It.isAny()),
        Times.once());
    });

    it('should format author', async () => {
      const expectedAuthor: LinkableText = {
        text: issue.user.login,
        url: issue.user.html_url
      };

      await getIssueInfoCommand.execute({ text: `!info #${issueNumber}` });

      mockMessenger.verify(
        x => x.sendRichMessage(It.isAny(), It.isAny(), It.isValue(expectedAuthor), It.isAny(), It.isAny()),
        Times.once());
    });

    it('should create labels and assignees fields', async () => {
      const expectedIssues = It.is((x: any[]) =>
        !!expect(x).to.have.length(2) &&
        !!expect(x[0].title).to.equal('Label(s)') &&
        !!expect(x[0].short).to.be.true &&
        !!expect(x[1].title).to.equal('Assignee(s)') &&
        !!expect(x[1].short).to.be.true
      );

      await getIssueInfoCommand.execute({ text: `!info #${issueNumber}` });

      mockMessenger.verify(
        x => x.sendRichMessage(It.isAny(), It.isAny(), It.isAny(), expectedIssues, It.isAny()),
        Times.once());
    });

    it('should list "None" if there are no labels', async () => {
      const expectedIssues = It.is((x: any[]) =>
        !!expect(x[0].value).to.have.length(1) &&
        !!expect(x[0].value[0]).to.deep.equal({ text: 'None', url: '' })
      );

      await getIssueInfoCommand.execute({ text: `!info #${issueNumber}` });

      mockMessenger.verify(
        x => x.sendRichMessage(It.isAny(), It.isAny(), It.isAny(), expectedIssues, It.isAny()),
        Times.once());
    });

    it('should list the label when issue has a label', async () => {
      issue.labels = [
        { name: 'foo' }
      ];

      const expectedIssues = It.is((x: any[]) =>
        !!expect(x[0].value).to.have.length(1) &&
        !!expect(x[0].value[0]).to.deep.equal({ text: 'foo', url: '' })
      );

      await getIssueInfoCommand.execute({ text: `!info #${issueNumber}` });

      mockMessenger.verify(
        x => x.sendRichMessage(It.isAny(), It.isAny(), It.isAny(), expectedIssues, It.isAny()),
        Times.once());
    });

    it('should list the labels when issue has multiple labels', async () => {
      issue.labels = [
        { name: 'foo' },
        { name: 'bar' }
      ];

      const expectedIssues = It.is((x: any[]) =>
        !!expect(x[0].value).to.have.length(2) &&
        !!expect(x[0].value[0]).to.deep.equal({ text: 'foo', url: '' }) &&
        !!expect(x[0].value[1]).to.deep.equal({ text: 'bar', url: '' })
      );

      await getIssueInfoCommand.execute({ text: `!info #${issueNumber}` });

      mockMessenger.verify(
        x => x.sendRichMessage(It.isAny(), It.isAny(), It.isAny(), expectedIssues, It.isAny()),
        Times.once());
    });

    it('should list "None" if there are no assignees', async () => {
      const expectedIssues = It.is((x: any[]) =>
        !!expect(x[1].value).to.have.length(1) &&
        !!expect(x[1].value[0]).to.deep.equal({ text: 'None', url: '' })
      );

      await getIssueInfoCommand.execute({ text: `!info #${issueNumber}` });

      mockMessenger.verify(
        x => x.sendRichMessage(It.isAny(), It.isAny(), It.isAny(), expectedIssues, It.isAny()),
        Times.once());
    });

    it('should list the assignee when issue has an assignee', async () => {
      issue.assignees = [
        { login: 'octocat', html_url: 'foo-url' }
      ];

      const expectedIssues = It.is((x: any[]) =>
        !!expect(x[1].value).to.have.length(1) &&
        !!expect(x[1].value[0]).to.deep.equal({ text: 'octocat', url: 'foo-url' })
      );

      await getIssueInfoCommand.execute({ text: `!info #${issueNumber}` });

      mockMessenger.verify(
        x => x.sendRichMessage(It.isAny(), It.isAny(), It.isAny(), expectedIssues, It.isAny()),
        Times.once());
    });

    it('should list the assignees when issue has multiple assignees', async () => {
      issue.assignees = [
        { login: 'octocat', html_url: 'foo-url' },
        { login: 'octocat2', html_url: 'foo-url2' }
      ];
      const expectedIssues = It.is((x: any[]) =>
        !!expect(x[1].value).to.have.length(2) &&
        !!expect(x[1].value[0]).to.deep.equal({ text: 'octocat', url: 'foo-url' }) &&
        !!expect(x[1].value[1]).to.deep.equal({ text: 'octocat2', url: 'foo-url2' })
      );

      await getIssueInfoCommand.execute({ text: `!info #${issueNumber}` });

      mockMessenger.verify(
        x => x.sendRichMessage(It.isAny(), It.isAny(), It.isAny(), expectedIssues, It.isAny()),
        Times.once());
    });

    it('should format title string for an issue', async () => {
      const expectedPayload = { text: `!info #${issueNumber}` };
      await getIssueInfoCommand.execute(expectedPayload);

      mockMessenger.verify(
        x => x.sendRichMessage(It.isAny(), It.isAny(), It.isAny(), It.isAny(), expectedPayload),
        Times.once());
    });
  });
});
