export interface ICommand {
  canExecute(payload: any): Promise<boolean>;
  execute(payload: any): Promise<void>;
}
