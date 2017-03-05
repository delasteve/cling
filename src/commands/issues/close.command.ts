import { oneLine } from 'common-tags';
import { IIssueRepository } from '../../repositories/issue.repository';
import { IMessenger } from '../../messengers/messenger.interface';
import { AbstractCommand } from '../abstract.command';

export class CloseIssueCommand extends AbstractCommand {
  private readonly issuesRepository: IIssueRepository;
  private readonly messenger: IMessenger;

  constructor(issuesRepository: IIssueRepository, messenger: IMessenger) {
    const commandPattern = /^\!close\s+\#?(\d+)/i;
    super(commandPattern);

    this.issuesRepository = issuesRepository;
    this.messenger = messenger;
  }

  public async execute(payload: any): Promise<any> {
    const issueNumber = await this.getIssue(payload.text);

    await this.issuesRepository.addIssue({
      number: issueNumber,
      action: 'close'
    });

    const message = oneLine`
      Issue
      <https://github.com/angular/angular-cli/issues/${issueNumber}|#${issueNumber}>
      added to list to be closed.
    `;

    this.messenger.sendMesssage(message, payload);
  }

  private async getIssue(text: string) {
    const matches = this.commandPattern.exec(text);

    return matches[1];
  }
}
