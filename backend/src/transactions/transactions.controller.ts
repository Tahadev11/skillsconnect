import { Controller, Get, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';

@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('admin/all')
  getAllTransactions() {
    return this.transactionsService.getAllTransactions();
  }

  @Get('admin/revenue')
  getRevenue() {
    return this.transactionsService.getPlatformRevenue();
  }
}