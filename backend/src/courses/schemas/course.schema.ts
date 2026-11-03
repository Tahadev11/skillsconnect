import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CourseDocument = HydratedDocument<Course>;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  instructorId: Types.ObjectId;

  @Prop({ type: Number, default: 0, min: 0 })
  price: number;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ default: false })
  isPublished: boolean;

  // --- ADDED: Video Link ---
  @Prop({ type: String, default: '' })
  videoUrl: string;

    // Add these properties to the Course class
  @Prop({ default: false })
  allowExchange: boolean;

  @Prop({ type: String, default: '' })
  skillsWanted: string;
}

export const CourseSchema = SchemaFactory.createForClass(Course);