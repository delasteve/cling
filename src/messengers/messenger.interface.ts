export interface IMessenger {
  sendMesssage(text: string, options: any): Promise<any>;

  sendRichMessage(text: string): Promise<any>;
}
