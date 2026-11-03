import { Controller, Post, Get, Param, UseGuards, Req, Patch, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles('student')
  @Post(':serviceId')
  create(@Param('serviceId') serviceId: string, @Req() req: any) {
    return this.ordersService.createOrder(req.user.userId, serviceId);
  }

  @Roles('student')
  @Get('me')
  getMine(@Req() req: any) {
    return this.ordersService.getMyOrders(req.user.userId);
  }

  @Roles('freelancer')
  @Get('freelancer')
  getFreelancerOrders(@Req() req: any) {
    return this.ordersService.getFreelancerOrders(req.user.userId);
  }

  @Roles('freelancer')
  @Patch(':orderId/status')
  updateStatus(
    @Param('orderId') orderId: string,
    @Req() req: any,
    @Body('status') status: string,
  ) {
    return this.ordersService.updateStatus(orderId, req.user.userId, status);
  }
}