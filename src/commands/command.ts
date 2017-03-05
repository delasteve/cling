export interface ICommand {
  canExecute(payload: any): boolean;
  execute(payload: any): void;
}
