import fs = require('fs');
import { IMessenger } from '../../messengers/messenger.interface';
import { AbstractCommand } from '../abstract.command';

export class HelpCommand extends AbstractCommand {
  private readonly messenger: IMessenger;

  constructor(messenger: IMessenger) {
    const commandPattern = /^\!h(?:elp)?\s+\#?(\d+)/i;
    super(commandPattern);

    this.messenger = messenger;
  }

  public async canExecute(payload: any): Promise<boolean> {
    return !Boolean(payload.subtype);
  }

  public async execute(payload: any): Promise<void> {
    const message = fs.readFileSync(`${__dirname}/help.txt`, 'utf-8');

    this.messenger.sendMesssage(message, payload);
  }

}
