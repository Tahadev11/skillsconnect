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
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Public } from '../auth/decorators/public.decorators';
import { Roles } from '../auth/decorators/roles.decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('freelancer')
  @Post()
  create(@Req() req: any, @Body() dto: CreateServiceDto) {
    return this.servicesService.create(req.user.userId, dto);
  }

  @Public()
  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  // --- ADMIN ROUTE ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/all')
  async getAllServicesAdmin() {
    return this.servicesService.findAllAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('freelancer')
  @Get('mine')
  findMine(@Req() req: any) {
    return this.servicesService.findAllForFreelancer(req.user.userId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('freelancer')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.servicesService.update(id, req.user.userId, dto);
  }

  // --- UPDATED: Allow Admin to delete ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('freelancer', 'admin') // <-- Added admin here
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    // Pass the userId AND the roles array to the service
    return this.servicesService.remove(id, req.user.userId, req.user.roles);
  }
}