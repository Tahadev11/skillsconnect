import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Enrollment, EnrollmentDocument } from '../enrollments/schemas/enrollment.schema'; // <-- ADD THIS IMPORT

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Enrollment.name) private enrollmentModel: Model<EnrollmentDocument>, // <-- ADD THIS
  ) {}

  async create(instructorId: string, dto: CreateCourseDto) {
    return this.courseModel.create({
      ...dto,
      instructorId: new Types.ObjectId(instructorId),
    });
  }

  async findAll() {
    return this.courseModel.find({ isPublished: true }).exec();
  }

    async findAllAdmin() {
    // Populate the instructor's name so the admin knows who made it
    return this.courseModel.find().populate('instructorId', 'firstName lastName email').exec();
  }

  // UPDATE THIS METHOD
  async findAllForInstructor(instructorId: string) {
    const courses = await this.courseModel
      .find({ instructorId: new Types.ObjectId(instructorId) })
      .exec();

    // Loop through the courses and count the enrollments for each
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const studentCount = await this.enrollmentModel.countDocuments({
          courseId: course._id,
        });
        
        return {
          ...course.toObject(),
          studentsCount: studentCount, // Add the count to the response object
        };
      })
    );

    return coursesWithStats;
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Course not found');
    }
    const course = await this.courseModel.findById(id).exec();
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async update(id: string, instructorId: string, dto: UpdateCourseDto) {
    const course = await this.findOne(id);
    if (course.instructorId.toString() !== instructorId) {
      throw new ForbiddenException('You do not own this course');
    }
    Object.assign(course, dto);
    return course.save();
  }

// In courses.service.ts

  async remove(id: string, userId: string, userRoles: string[]) {
    const course = await this.findOne(id);
    
    // Check if user is admin OR if they own the course
    if (course.instructorId.toString() !== userId && !userRoles.includes('admin')) {
      throw new ForbiddenException('You do not own this course');
    }
    await course.deleteOne();
    // Also delete enrollments... (as we did earlier)
    return { ok: true };
  }
}