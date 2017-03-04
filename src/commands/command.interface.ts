export interface ICommand {
  rtmEvent: string;
  canExecute(payload: any): boolean;
  execute(payload: any): void;
}
