import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  buyerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sellerId: Types.ObjectId;

  @Prop({ required: true, enum: ['course', 'gig'] })
  type: 'course' | 'gig';

  @Prop({ type: Types.ObjectId, required: true })
  itemId: Types.ObjectId; // The course ID or service ID

  @Prop({ required: true })
  itemTitle: string;

  @Prop({ required: true })
  amount: number; // Total amount paid

  @Prop({ required: true })
  platformFee: number; // 10% cut for SkillsConnect

  @Prop({ required: true })
  sellerEarnings: number; // 90% for the seller
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);