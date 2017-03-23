export interface IMessenger {
  sendMessage(text: string, options: any): void;
  sendRichMessage(title: LinkableText, color: string, author: LinkableText, fields: any[], options: any): void;
}

export interface LinkableText {
  text: string;
  url: string;
}
