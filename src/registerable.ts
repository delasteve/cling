export interface IRegisterable {
  rtmEvent: string;
  callback(payload: any): Promise<void>;
}
