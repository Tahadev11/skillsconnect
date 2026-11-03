import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserRole = 'admin' | 'instructor' | 'student' | 'freelancer';
export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({
    type: [String],
    enum: ['admin', 'instructor', 'student', 'freelancer'],
    default: ['student'],
  })
  roles: UserRole[];

  @Prop({ default: '' })
  bio: string;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ default: 'active', enum: ['active', 'banned', 'suspended'] })
  status: string;
}

export const UserSchema = SchemaFactory.createForClass(User);