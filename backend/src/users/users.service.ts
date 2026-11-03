import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }

  async createUser(dto: RegisterUserDto): Promise<UserDocument> {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const created = new this.userModel({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      roles: dto.roles ?? ['student'],
    });
    return created.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+passwordHash')
      .exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async updateRole(id: string, newRole: string): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(
        id,
        { roles: [newRole] },
        { returnDocument: 'after' } 
      )
      .exec();
  }
  // ADD THIS: Fetch all users for the Admin Dashboard
  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select('-passwordHash').exec();
  }

  // ADD THIS: Delete a user
  async deleteUser(id: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async updateProfile(id: string, updateDto: { firstName?: string; lastName?: string; bio?: string; skills?: string[] }) {
    return this.userModel.findByIdAndUpdate(
      id,
      { $set: updateDto },
      { returnDocument: 'after', select: '-passwordHash' } 
    ).exec();
  }
  async updatePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await this.userModel.findById(id).select('+passwordHash').exec();
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) throw new Error('Current password is incorrect');

    const newHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newHash;
    return user.save();
  }

 async updateStatus(id: string, status: string) {
    return this.userModel
      .findByIdAndUpdate(
        id,
        { status },
        { returnDocument: 'after' } 
      )
      .select('-passwordHash')
      .exec();
  }

    async findPublicProfiles() {
    return this.userModel
      .find({ 
        roles: { $in: ['student', 'instructor', 'freelancer'] },
        skills: { $exists: true, $ne: [] }
      })
      .select('firstName lastName bio skills roles')
      .exec();
  }
}