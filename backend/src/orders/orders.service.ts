import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { Service, ServiceDocument } from '../services/schemas/service.schema';
import { TransactionsService } from '../transactions/transactions.service'; // <-- ADDED

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    private transactionsService: TransactionsService, // <-- ADDED
  ) {}

  async createOrder(studentId: string, serviceId: string) {
    // 1. Find the service
    const service = await this.serviceModel.findById(serviceId);
    if (!service) throw new BadRequestException('Service not found');

    // 2. Check if already ordered
    const existing = await this.orderModel.findOne({ 
      studentId: new Types.ObjectId(studentId), 
      serviceId: new Types.ObjectId(serviceId) 
    });
    if (existing) throw new BadRequestException('You have already hired this freelancer for this gig.');

    // 3. Create the order (No transaction logged here anymore!)
    return this.orderModel.create({
      studentId: new Types.ObjectId(studentId),
      serviceId: new Types.ObjectId(serviceId),
      freelancerId: service.freelancerId,
      price: service.price,
      status: 'pending',
    });
  }

  async getMyOrders(studentId: string) {
    return this.orderModel
      .find({ studentId: new Types.ObjectId(studentId) })
      .populate('serviceId', 'title category')
      .populate('freelancerId', 'firstName lastName email')
      .exec();
  }

  async getFreelancerOrders(freelancerId: string) {
    return this.orderModel
      .find({ freelancerId: new Types.ObjectId(freelancerId) })
      .populate('serviceId', 'title price')
      .populate('studentId', 'firstName lastName email')
      .exec();
  }

  async updateStatus(orderId: string, freelancerId: string, status: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new BadRequestException('Order not found');
    
    if (order.freelancerId.toString() !== freelancerId) {
      throw new ForbiddenException('You do not own this order');
    }

    // Check if we are moving from 'pending' to 'completed'
    const isCompletingNow = order.status !== 'completed' && status === 'completed';

    order.status = status;
    const updatedOrder = await order.save();

    // ONLY log the transaction if the order was just marked as completed
    if (isCompletingNow) {
      // Fetch the service details to log the transaction
      const service = await this.serviceModel.findById(order.serviceId);
      
      if (service) {
        await this.transactionsService.createTransaction({
          buyerId: order.studentId.toString(),
          sellerId: order.freelancerId.toString(),
          type: 'gig',
          itemId: order.serviceId.toString(),
          itemTitle: service.title,
          amount: order.price,
        });
      }
    }

    return updatedOrder;
  }
}