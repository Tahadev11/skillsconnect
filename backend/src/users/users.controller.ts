import { 
  Controller, 
  Get, 
  Delete, 
  Patch, 
  Param, 
  Body, 
  UseGuards, 
  Req, 
  BadRequestException 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';
import { Public } from '../auth/decorators/public.decorators'; // <-- ADDED: Import Public
import { IsString, IsOptional, MinLength, IsArray } from 'class-validator'; // <-- ADDED: Import IsArray

// --- DTOs for Settings ---
class UpdateProfileDto {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) skills?: string[]; 
}
class UpdatePasswordDto {
  @IsString() currentPassword: string;
  @IsString() @MinLength(6) newPassword: string;
}
// --------------------------

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // --- PUBLIC DIRECTORY ROUTE (MUST BE ABOVE ':id' routes) ---
  @Public()
  @Get('directory')
  async getSkillsDirectory() {
    return this.usersService.findPublicProfiles();
  }

  // --- STUDENT UPGRADE ROUTE ---
  @UseGuards(JwtAuthGuard)
  @Patch('upgrade-role')
  async upgradeRole(
    @Req() req: any, 
    @Body('role') newRole: 'instructor' | 'freelancer'
  ) {
    const userId = req.user.userId; 

    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    const isStudent = user.roles.includes('student');
    const alreadyUpgraded = user.roles.includes('instructor') || user.roles.includes('freelancer');

    if (!isStudent || alreadyUpgraded) {
      throw new BadRequestException('You have already upgraded your role. You cannot switch again.');
    }

    if (newRole !== 'instructor' && newRole !== 'freelancer') {
      throw new BadRequestException('Invalid role requested.');
    }

    const updatedUser = await this.usersService.updateRole(userId, newRole);
    
    return {
      message: `Successfully upgraded to ${newRole}`,
      user: {
        id: updatedUser?._id,
        email: updatedUser?.email,
        roles: updatedUser?.roles,
      }
    };
  }

  // --- SETTINGS ROUTES ---
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  async updatePassword(@Req() req: any, @Body() dto: UpdatePasswordDto) {
    await this.usersService.updatePassword(req.user.userId, dto.currentPassword, dto.newPassword);
    return { message: 'Password updated successfully' };
  }

  // --- ADMIN ROUTES ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('all')
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    const deleted = await this.usersService.deleteUser(id);
    if (!deleted) throw new BadRequestException('User not found');
    return { message: 'User deleted successfully', id };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/status')
  async updateUserStatus(
    @Param('id') id: string,
    @Body('status') status: 'active' | 'banned' | 'suspended'
  ) {
    return this.usersService.updateStatus(id, status);
  }
}