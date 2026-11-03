import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Service', required: true })
  serviceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  freelancerId: Types.ObjectId;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 'pending' })
  status: string; // 'pending', 'completed'
}

export const OrderSchema = SchemaFactory.createForClass(Order);