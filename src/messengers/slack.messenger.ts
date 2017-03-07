import * as slack from 'slack';
import { IMessenger } from './messenger.interface';

export class SlackMessenger implements IMessenger {
  constructor(
    private slackToken: string
  ) { }

  async sendMesssage(text: string, options: any): Promise<void> {
    slack.chat
      .postMessage({
        token: this.slackToken,
        channel: options.channel,
        text
      }, () => { });
  }
}
