import { IRegisterable } from '../registerable';
import { ICommand } from './command';

export abstract class AbstractCommand implements IRegisterable, ICommand {
  public readonly rtmEvent = 'message';

  constructor(
    protected readonly commandPattern: RegExp
  ) { }

  public async callback(payload: any): Promise<void> {
    if (await this.canExecute(payload)) {
      try {
        await this.execute(payload);
      } catch (e) {
        console.log(e);
      }
    }
  }

  public async canExecute(payload: any): Promise<boolean> {
    return !payload.subtype && this.test(payload.text);
  }

  public abstract execute(payload: any): Promise<void>;

  private test(text: string): boolean {
    const regex = new RegExp(this.commandPattern);

    return regex.test(text);
  }
}
