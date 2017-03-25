import * as slack from 'slack';
import { IMessenger, LinkableText } from './messenger.interface';

export class SlackMessenger implements IMessenger {
  constructor(
    private slackToken: string
  ) { }

  public sendMessage(text: string, options: any): void {
    slack.chat
      .postMessage({
        token: this.slackToken,
        channel: options.channel,
        text,
        as_user: true
      }, () => { });
  }

  public sendRichMessage(
    title: LinkableText, color: string, author: LinkableText, fields: any[], options: any): void {
    const attachment: SlackAttachment = {
      fallback: title.text,
      color: color,
      author_name: author.text,
      author_link: author.url,
      title: title.text,
      title_link: title.url,
      fields: fields.map((field) => {
        return {
          title: field.title,
          value: Array.isArray(field.value)
            ? field.value
              .map((value) => this.makeStringFromLinkableText(value))
              .join('\n')
            : field.value,
          short: field.short
        };
      })
    };

    slack.chat
      .postMessage({
        token: this.slackToken,
        channel: options.channel,
        text: ' ',
        attachments: [attachment],
        as_user: true
      }, () => { });
  }

  private makeStringFromLinkableText(linkableText: LinkableText): string {
    if (linkableText.url === '') {
      return linkableText.text;
    }

    return `<${linkableText.url}|${linkableText.text}>`;
  }
}

interface SlackAttachment {
  fallback: string;
  color?: string;
  pretext?: string;
  author_name?: string;
  author_link?: string;
  author_icon?: string;
  title: string;
  title_link?: string;
  text?: string;
  fields?: SlackAttachmentField[];
  image_url?: string;
  thumb_url?: string;
  footer?: string;
  footer_icon?: string;
  ts?: number;
}

interface SlackAttachmentField {
  title: string;
  value: string;
  short: boolean;
}
