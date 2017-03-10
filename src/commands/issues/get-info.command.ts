import { AbstractCommand } from '../abstract.command';
import { IGitHubRepository } from '../../repositories/github.repository';
import { IMessenger, LinkableText } from '../../messengers/messenger.interface';

export class GetIssueInfoCommand extends AbstractCommand {
  private githubRepository: IGitHubRepository;
  private messenger: IMessenger;

  constructor(githubRepository: IGitHubRepository, messenger: IMessenger) {
    const commandPattern = /^\!i(?:nfo)?\s+\#?(\d+)/i;
    super(commandPattern);

    this.githubRepository = githubRepository;
    this.messenger = messenger;
  }

  public async execute(payload: any): Promise<void> {
    const issueNumber = await this.getIssueNumber(payload.text);
    const issue = await this.githubRepository.getIssue(issueNumber);

    const issueTitle = this.getIssueTitle(issue);
    const issueColor = this.getStateColor(issue.state);
    const author = this.getIssueAuthor(issue.user);
    const fields = [
      this.buildIssueLabelsField(issue.labels),
      this.buildIssueAssigneesField(issue.assignees)
    ];

    this.messenger.sendRichMessage(issueTitle, issueColor, author, fields, payload);
  }

  private getIssueTitle(issue: any): LinkableText {
    const issueType = this.getIssueType(issue.pull_request);

    return {
      text: this.formatIssueTitle(issueType, issue.number, issue.title),
      url: issue.html_url
    };
  }

  private getIssueType(isPullRequest: any): string {
    return isPullRequest ? 'Pull Request' : 'Issue';
  }

  private getIssueAuthor(user: any): LinkableText {
    return {
      text: user.login,
      url: user.html_url
    };
  }

  private getStateColor(state): string {
    return state === 'open'
      ? '#2cbe4e'
      : '#cb2431';
  }

  private formatIssueTitle(issueType: string, issueNumber: number, issueTitle: string): string {
    return `${issueType} #${issueNumber}: ${issueTitle}`;
  }

  private buildIssueLabelsField(labels: any[]): any {
    return {
      title: 'Label(s)',
      value: this.getLabels(labels),
      short: true
    };
  }

  private getLabels(labels: any[]): LinkableText[] {
    return labels.length === 0
      ? [{ text: 'None', url: '' }]
      : labels
        .map((label): LinkableText => {
          return { text: label.name, url: '' };
        });
  }

  private buildIssueAssigneesField(assignees: any) {
    return {
      title: 'Assignee(s)',
      value: this.getAssigneesWithHyperlinks(assignees),
      short: true
    };
  }

  private getAssigneesWithHyperlinks(assignees: any[]): LinkableText[] {
    return assignees.length === 0
      ? [{ text: 'None', url: '' }]
      : assignees
        .map((assignee): LinkableText => {
          return {
            text: assignee.login,
            url: assignee.html_url
          };
        });
  }

  private getIssueNumber(text: string): string {
    const matches = this.commandPattern.exec(text);

    return matches[1];
  }
}
