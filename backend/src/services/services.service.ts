import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, ServiceDocument } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
  ) {}

  async create(freelancerId: string, dto: CreateServiceDto) {
    return this.serviceModel.create({
      ...dto,
      freelancerId: new Types.ObjectId(freelancerId),
    });
  }

  async findAll() {
    return this.serviceModel
      .find({ isActive: true })
      .populate('freelancerId', 'firstName lastName skills')
      .exec();
  }

  // --- ADMIN ROUTE: Fetch ALL services (even inactive) ---
  async findAllAdmin() {
    return this.serviceModel
      .find()
      .populate('freelancerId', 'firstName lastName email')
      .exec();
  }

  async findAllForFreelancer(freelancerId: string) {
    return this.serviceModel
      .find({ freelancerId: new Types.ObjectId(freelancerId) })
      .exec();
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Service not found');
    }
    const service = await this.serviceModel
      .findById(id)
      .populate('freelancerId', 'firstName lastName email skills bio')
      .exec();
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async update(id: string, freelancerId: string, dto: UpdateServiceDto) {
    const service = await this.findOwned(id, freelancerId);
    Object.assign(service, dto);
    return service.save();
  }

  // --- UPDATED: Allow Admin to delete ANY service ---
  async remove(id: string, userId: string, userRoles: string[]) {
    const service = await this.findOne(id);
    
    // Check if user is admin OR if they own the service
    if (service.freelancerId.toString() !== userId && !userRoles.includes('admin')) {
      throw new ForbiddenException('You do not own this service');
    }
    
    await service.deleteOne();
    return { ok: true };
  }

  private async findOwned(id: string, freelancerId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Service not found');
    }
    const service = await this.serviceModel.findById(id).exec();
    if (!service) throw new NotFoundException('Service not found');
    if (service.freelancerId.toString() !== freelancerId) {
      throw new ForbiddenException('You do not own this service');
    }
    return service;
  }
}