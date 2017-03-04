import * as slack from 'slack';
import { ICommand } from './commands/command.interface';

export class SlackBot {
  private bot: any;

  constructor(private slackToken: string) {
    this.bot = slack.rtm.client();
  }

  public start(): void {
    this.bot.listen({ token: this.slackToken });
  }

  public registerCommand(command: ICommand): void {
    this.bot[command.rtmEvent]((payload: any) => {
      if (command.canExecute(payload)) {
        command.execute(payload);
      }
    });
  }
}
