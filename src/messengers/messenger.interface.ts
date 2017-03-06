export interface IMessenger {
  sendMesssage(text: string, options: any): Promise<any>;
}
