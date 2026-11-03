import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { Service, ServiceSchema } from '../services/schemas/service.schema';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { TransactionsModule } from '../transactions/transactions.module'; // <-- Add this

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Service.name, schema: ServiceSchema }, // We need Service to fetch price & freelancerId
    ]),
        TransactionsModule, // <-- AND THIS

  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}