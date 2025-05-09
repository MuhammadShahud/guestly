import { Document } from 'mongoose';
import { IContact } from 'src/contacts/interface/contact.interface';
import { IUser } from 'src/user/interfaces/user.interface';

type Message = {
  message: string;
  type: 'text' | 'image' | 'audio' | 'video';
  isforwarded: boolean;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  caption?: string;
  whatsapp_message_status?: string;
  whatsapp_message_id?: string;
  whatsapp_image_id?: string;
  whatsapp_video_id?: string;
  whatsapp_audio_id?: string;
};

export interface IChat extends Document {
  message?: Message;
  user?: IUser;
  contact?: IContact;
  room?: string;
  replyTo?: string;
  from?: string;
  to?: string;
  isSeen?: boolean;
}
