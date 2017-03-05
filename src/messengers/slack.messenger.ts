import * as slack from 'slack';
import { IMessenger } from './messenger.interface';

export class SlackMessenger implements IMessenger {
  constructor(
    private slackToken: string
  ) { }

  async sendMesssage(text: string, options: any): Promise<any> {
    slack.chat
      .postMessage({
        token: this.slackToken,
        channel: options.channel,
        text,
        thread_ts: options.thread_ts || options.ts
      }, () => { });
  }

  sendRichMessage(): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
