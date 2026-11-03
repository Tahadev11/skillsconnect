import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Enrollment, EnrollmentDocument } from './schemas/enrollment.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { TransactionsService } from '../transactions/transactions.service'; // <-- ADDED

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(Course.name)
    private courseModel: Model<CourseDocument>,
    private transactionsService: TransactionsService, // <-- ADDED
  ) {}

  async enroll(studentId: string, courseId: string) {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new NotFoundException('Course not found');
    }

    const course = await this.courseModel.findById(courseId).exec();
    if (!course) throw new NotFoundException('Course not found');
    if (!course.isPublished) {
      throw new BadRequestException('Course is not published');
    }

    const existing = await this.enrollmentModel
      .findOne({
        studentId: new Types.ObjectId(studentId),
        courseId: new Types.ObjectId(courseId),
      })
      .exec();
    if (existing) {
      throw new ConflictException('Already enrolled in this course');
    }

    // 1. Create the enrollment
    const enrollment = await this.enrollmentModel.create({
      studentId: new Types.ObjectId(studentId),
      courseId: new Types.ObjectId(courseId),
    });

    // 2. Log the transaction for the admin revenue dashboard
    await this.transactionsService.createTransaction({
      buyerId: studentId,
      sellerId: course.instructorId.toString(),
      type: 'course',
      itemId: courseId,
      itemTitle: course.title,
      amount: course.price,
    });

    return enrollment;
  }

  async myEnrollments(studentId: string) {
    return this.enrollmentModel
      .find({ studentId: new Types.ObjectId(studentId) })
      .populate('courseId', 'title description price skills')
      .exec();
  }

  async studentsOfCourse(courseId: string, instructorId: string) {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new NotFoundException('Course not found');
    }

    const course = await this.courseModel.findById(courseId).exec();
    if (!course) throw new NotFoundException('Course not found');
    if (course.instructorId.toString() !== instructorId) {
      throw new ForbiddenException('You do not own this course');
    }

    return this.enrollmentModel
      .find({ courseId: new Types.ObjectId(courseId) })
      .populate('studentId', 'email firstName lastName skills')
      .exec();
  }

  async unenroll(userId: string, idFromFrontend: string) {
    // 1. Try to delete by matching both student and the Course ID
    let deleted = await this.enrollmentModel.findOneAndDelete({ 
      studentId: new Types.ObjectId(userId), 
      courseId: new Types.ObjectId(idFromFrontend) 
    }).exec();

    // 2. If that fails (e.g., the course was deleted), try deleting by the Enrollment ID directly
    if (!deleted && Types.ObjectId.isValid(idFromFrontend)) {
      deleted = await this.enrollmentModel.findOneAndDelete({
        studentId: new Types.ObjectId(userId),
        _id: new Types.ObjectId(idFromFrontend)
      }).exec();
    }

    // 3. If we still can't find it, throw a clean error
    if (!deleted) {
      throw new NotFoundException('Enrollment record not found.');
    }

    return { ok: true, message: 'Unenrolled successfully' };
  }
}