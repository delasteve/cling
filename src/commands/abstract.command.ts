import { IRegisterable } from '../registerable';
import { ICommand } from './command';

export abstract class AbstractCommand implements IRegisterable, ICommand {
  public readonly rtmEvent = 'message';

  constructor(
    protected readonly commandPattern: RegExp
  ) { }

  public callback(payload: any): void {
    if (this.canExecute(payload)) {
      this.execute(payload);
    }
  }

  public canExecute(payload: any): boolean {
    return !payload.subtype && this.test(payload.text);
  }

  public abstract execute(payload: any): void;

  private test(text: string): boolean {
    const regex = new RegExp(this.commandPattern);

    return regex.test(text);
  }
}
