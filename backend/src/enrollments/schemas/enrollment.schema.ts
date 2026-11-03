import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EnrollmentDocument = HydratedDocument<Enrollment>;

@Schema({ timestamps: true })
export class Enrollment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId: Types.ObjectId;

  @Prop({ type: Number, default: 0, min: 0, max: 100 })
  progress: number;
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);

// One enrollment per (student, course)
EnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });