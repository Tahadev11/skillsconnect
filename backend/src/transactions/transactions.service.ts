import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
  ) {}

  async createTransaction(data: {
    buyerId: string;
    sellerId: string;
    type: 'course' | 'gig';
    itemId: string;
    itemTitle: string;
    amount: number;
  }) {
    // Calculate 10% platform fee
    const platformFee = data.amount * 0.10;
    const sellerEarnings = data.amount - platformFee;

    return this.transactionModel.create({
      buyerId: new Types.ObjectId(data.buyerId),
      sellerId: new Types.ObjectId(data.sellerId),
      type: data.type,
      itemId: new Types.ObjectId(data.itemId),
      itemTitle: data.itemTitle,
      amount: data.amount,
      platformFee,
      sellerEarnings,
    });
  }

  async getPlatformRevenue() {
    // Aggregate total revenue and platform fees
    const stats = await this.transactionModel.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalPlatformFees: { $sum: '$platformFee' },
          totalTransactions: { $sum: 1 },
        },
      },
    ]);

    if (stats.length === 0) {
      return { totalRevenue: 0, totalPlatformFees: 0, totalTransactions: 0 };
    }

    return stats[0];
  }

  async getAllTransactions() {
    return this.transactionModel
      .find()
      .populate('buyerId', 'firstName lastName email')
      .populate('sellerId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }
}