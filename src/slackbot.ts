import * as slack from 'slack';
import { IRegisterable } from './registerable';

export class SlackBot {
  private bot: any;

  constructor(private slackToken: string) {
    this.bot = slack.rtm.client();
  }

  public start(): void {
    this.bot.listen({ token: this.slackToken });
  }

  public register(registerable: IRegisterable): void {
    this.bot[registerable.rtmEvent]((payload) => { registerable.callback(payload); });
  }
}
