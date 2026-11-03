import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ServiceDocument = HydratedDocument<Service>;

@Schema({ timestamps: true })
export class Service {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  freelancerId: Types.ObjectId;

  @Prop({ type: Number, required: true, min: 1 })
  price: number;

  @Prop({ required: true, min: 1 })
  deliveryDays: number;

  @Prop({ required: true, trim: true, index: true })
  category: string;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ default: true })
  isActive: boolean;

    // --- BARTER MODE FIELDS ---
  @Prop({ default: false })
  allowExchange: boolean;

  @Prop({ type: String, default: '' })
  skillsWanted: string;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);