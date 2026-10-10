import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Public endpoint for streaming page & theme
  @Get()
  async getSettings() {
    const settings = await this.settingsService.getSettings();
    return {
      success: true,
      settings,
    };
  }

  // Admin protected endpoint to update settings
  @UseGuards(JwtAuthGuard)
  @Put()
  async updateSettings(@Body() dto: UpdateSettingsDto) {
    const settings = await this.settingsService.updateSettings(dto);
    return {
      success: true,
      message: 'تنظیمات برند با موفقیت ذخیره شد',
      settings,
    };
  }

  // Admin protected endpoint to upload brand logo
  @UseGuards(JwtAuthGuard)
  @Post('logo')
  @UseInterceptors(FileInterceptor('logo'))
  async uploadLogo(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.settingsService.uploadLogo(file);
  }
}
