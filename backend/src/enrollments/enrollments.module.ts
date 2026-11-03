import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import {
  Enrollment,
  EnrollmentSchema,
} from './schemas/enrollment.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import { TransactionsModule } from '../transactions/transactions.module'; // <-- Add this

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
    TransactionsModule, // <-- Add this
  ],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}