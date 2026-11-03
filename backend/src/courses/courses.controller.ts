import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Public } from '../auth/decorators/public.decorators';
import { Roles } from '../auth/decorators/roles.decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor')
  @Post()
  create(@Req() req: any, @Body() dto: CreateCourseDto) {
    return this.coursesService.create(req.user.userId, dto);
  }

  @Public()
  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

    @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/all')
  async getAllCoursesAdmin() {
    return this.coursesService.findAllAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor')
  @Get('mine')
  findMine(@Req() req: any) {
    return this.coursesService.findAllForInstructor(req.user.userId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin') // Allow admin
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.coursesService.remove(id, req.user.userId, req.user.roles);
  }
}