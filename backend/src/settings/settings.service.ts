import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async getSettings() {
    let settings = await this.prisma.settings.findUnique({
      where: { id: 'singleton' },
    });

    if (!settings) {
      settings = await this.prisma.settings.create({
        data: {
          id: 'singleton',
          brandName: 'مرکز پخش موسیقی نلا',
          brandLogoUrl: '/assets/logo.svg',
          primaryColor: '#e08d3c',
          secondaryColor: '#ffd7ab',
          instagramUrl: 'https://instagram.com/music_center',
          telegramUrl: 'https://t.me/music_center',
          phoneNumber: '۰۹۱۲۳۴۵۶۷۸۹',
          websiteUrl: 'https://example.com',
        },
      });
    }

    return settings;
  }

  async updateSettings(dto: UpdateSettingsDto) {
    const settings = await this.prisma.settings.upsert({
      where: { id: 'singleton' },
      update: {
        ...(dto.brandName && { brandName: dto.brandName }),
        ...(dto.brandLogoUrl && { brandLogoUrl: dto.brandLogoUrl }),
        ...(dto.primaryColor && { primaryColor: dto.primaryColor }),
        ...(dto.secondaryColor && { secondaryColor: dto.secondaryColor }),
        ...(dto.instagramUrl !== undefined && { instagramUrl: dto.instagramUrl }),
        ...(dto.telegramUrl !== undefined && { telegramUrl: dto.telegramUrl }),
        ...(dto.phoneNumber !== undefined && { phoneNumber: dto.phoneNumber }),
        ...(dto.websiteUrl !== undefined && { websiteUrl: dto.websiteUrl }),
      },
      create: {
        id: 'singleton',
        brandName: dto.brandName || 'مرکز پخش موسیقی نلا',
        brandLogoUrl: dto.brandLogoUrl || '/assets/logo.svg',
        primaryColor: dto.primaryColor || '#e08d3c',
        secondaryColor: dto.secondaryColor || '#ffd7ab',
        instagramUrl: dto.instagramUrl || '',
        telegramUrl: dto.telegramUrl || '',
        phoneNumber: dto.phoneNumber || '',
        websiteUrl: dto.websiteUrl || '',
      },
    });

    this.logger.log('Brand settings updated successfully');
    return settings;
  }

  async uploadLogo(file: Express.Multer.File) {
    const key = this.storageService.generateKey(file.originalname, 'brand');
    await this.storageService.uploadFile(file.buffer, key, file.mimetype);

    // Provide relative URL accessible via backend
    const logoUrl = `/uploads/${key}`;

    const settings = await this.updateSettings({
      brandLogoUrl: logoUrl,
    });

    return {
      success: true,
      brandLogoUrl: logoUrl,
      settings,
    };
  }
}
