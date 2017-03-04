import { oneLine } from 'common-tags';
import { AbstractCommand } from '../abstract.command';

export class CloseIssueCommand extends AbstractCommand {
  constructor(slackToken: string) {
    const commandPattern = /^\!close\s+\#?(\d+)/i;

    super(slackToken, commandPattern);
  }

  public async execute(payload: any): Promise<any> {
    const issue = await this.getIssue(payload.text);
    const message = oneLine`
      Issue
      <https://github.com/angular/angular-cli/issues/${issue}|#${issue}>
      added to list to be closed.
    `;

    this.postMessage(payload, message);
  }

  private async getIssue(text: string) {
    const matches = this.commandPattern.exec(text);

    return matches[1];
  }
}
