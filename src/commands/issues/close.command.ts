import { oneLine } from 'common-tags';
import { IGitHubRepository } from '../../repositories/github.repository';
import { IMessenger } from '../../messengers/messenger.interface';
import { AbstractCommand } from '../abstract.command';

export class CloseIssueCommand extends AbstractCommand {
  private readonly githubProject: string;
  private readonly issuesRepository: IGitHubRepository;
  private readonly messenger: IMessenger;

  constructor(githubProject: string, issuesRepository: IGitHubRepository, messenger: IMessenger) {
    const commandPattern = /^\!close\s+\#?(\d+)/i;
    super(commandPattern);

    this.githubProject = githubProject;
    this.issuesRepository = issuesRepository;
    this.messenger = messenger;
  }

  public async execute(payload: any): Promise<void> {
    const issueNumber = await this.getIssueNumber(payload.text);
    await this.issuesRepository.addLabels(issueNumber, ['close']);

    const message = oneLine`
      Issue
      <https://github.com/${this.githubProject}/issues/${issueNumber}|#${issueNumber}>
      has been labeled \`close\`.
    `;

    this.messenger.sendMessage(message, payload);
  }

  private async getIssueNumber(text: string): Promise<string> {
    const matches = this.commandPattern.exec(text);

    return matches[1];
  }
}
