declare module 'nodemailer' {
  export interface SendMailOptions {
    from?: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }

  export interface SentMessageInfo {
    messageId: string;
  }

  export interface Transport {
    sendMail(options: SendMailOptions): Promise<SentMessageInfo>;
  }

  export function createTransport(options: any): Transport;
}
