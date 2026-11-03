import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';

@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  // Student enrolls in a course
  @Roles('student')
  @Post(':courseId')
  enroll(@Param('courseId') courseId: string, @Req() req: any) {
    return this.enrollmentsService.enroll(req.user.userId, courseId);
  }

  // Student's own enrollments (with populated course data)
  @Roles('student')
  @Get('me')
  mine(@Req() req: any) {
    return this.enrollmentsService.myEnrollments(req.user.userId);
  }

  // Instructor sees who enrolled in their course
  @Roles('instructor')
  @Get('course/:courseId')
  students(
    @Param('courseId') courseId: string,
    @Req() req: any,
  ) {
    return this.enrollmentsService.studentsOfCourse(
      courseId,
      req.user.userId,
    );
  }

  // Student drops a course
  @Roles('student')
  @Delete(':courseId')
  unenroll(@Param('courseId') courseId: string, @Req() req: any) {
    return this.enrollmentsService.unenroll(req.user.userId, courseId);
  }
}