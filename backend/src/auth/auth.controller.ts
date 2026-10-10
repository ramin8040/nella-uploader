import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto);

    // Set secure HttpOnly cookie
    const maxAge = loginDto.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    response.cookie('jwt_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
    });

    return {
      success: true,
      message: 'ورود موفقیت‌آمیز بود',
      admin: result.admin,
      token: result.accessToken,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt_token', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });

    return {
      success: true,
      message: 'با موفقیت خارج شدید',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() request: Request) {
    const user = (request as any).user;
    const admin = await this.authService.validateAdmin(user.id);
    return {
      success: true,
      admin,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Req() request: Request,
    @Body() dto: ChangePasswordDto,
  ) {
    const user = (request as any).user;
    return this.authService.changePassword(user.id, dto);
  }
}
