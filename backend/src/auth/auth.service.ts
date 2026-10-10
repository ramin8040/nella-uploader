import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    const admin = await this.prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      throw new UnauthorizedException('نام کاربری یا رمز عبور اشتباه است');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('نام کاربری یا رمز عبور اشتباه است');
    }

    const payload = { sub: admin.id, username: admin.username };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: loginDto.rememberMe ? '30d' : '7d',
    });

    this.logger.log(`Admin "${admin.username}" logged in successfully`);

    return {
      accessToken,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
      },
    };
  }

  async validateAdmin(id: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
      select: { id: true, username: true, name: true, createdAt: true },
    });
    return admin;
  }

  async changePassword(adminId: string, dto: ChangePasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('رمز عبور جدید با تکرار آن مطابقت ندارد');
    }

    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new UnauthorizedException('مدیر یافت نشد');
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, admin.password);
    if (!isMatch) {
      throw new BadRequestException('رمز عبور فعلی اشتباه است');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.admin.update({
      where: { id: adminId },
      data: { password: hashedPassword },
    });

    this.logger.log(`Password updated successfully for admin "${admin.username}"`);

    return {
      success: true,
      message: 'رمز عبور با موفقیت به‌روزرسانی شد',
    };
  }
}
