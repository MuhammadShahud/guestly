interface BaseMessage {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  context?: {
    message_id: string;
  };
}

interface TextMessage extends BaseMessage {
  type: 'text';
  text?: {
    preview_url: boolean;
    body: string;
  };
}

interface ImageMessage extends BaseMessage {
  type: 'image';
  image?: {
    id?: string;
    link?: string;
  };
}

interface AudioMessage extends BaseMessage {
  type: 'audio';
  audio?: {
    id?: string;
    link?: string;
  };
}

interface VideoMessage extends BaseMessage {
  type: 'video';
  video?: {
    id?: string;
    link?: string;
    caption?: string;
  };
}

export type TMessage = TextMessage | ImageMessage | AudioMessage | VideoMessage;
