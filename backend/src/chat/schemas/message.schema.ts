import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiverId: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  // --- ADDED: Request Status ---
  @Prop({ default: 'pending' }) // 'pending' | 'accepted'
  status: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);