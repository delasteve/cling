import * as slack from 'slack';
import { ICommand } from './command.interface';

export abstract class AbstractCommand implements ICommand {

  public rtmEvent = 'message';

  constructor(
    private readonly slackToken: string,
    protected readonly commandPattern: RegExp
  ) { }

  canExecute(payload: any): boolean {
    return !payload.subtype && this.test(payload.text);
  }

  abstract execute(payload: any): void;

  protected postMessage(payload: any, text: string) {
    slack.chat
      .postMessage({
        token: this.slackToken,
        channel: payload.channel,
        text,
        thread_ts: payload.thread_ts || payload.ts
      }, () => {});
  }

  private test(text: string): boolean {
    return this.commandPattern.test(text);
  }
}
