import { oneLine } from 'common-tags';
import { AbstractCommand } from '../abstract.command';
import { IIssuesRepository } from '../../repositories/issue.repository';

export class CloseIssueCommand extends AbstractCommand {
  private issuesRepository: IIssuesRepository;

  constructor(slackToken: string, issuesRepository: IIssuesRepository) {
    const commandPattern = /^\!close\s+\#?(\d+)/i;
    super(slackToken, commandPattern);

    this.issuesRepository = issuesRepository;
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

    this.postMessage(payload, message);
  }

  private async getIssue(text: string) {
    const matches = this.commandPattern.exec(text);

    return matches[1];
  }
}
