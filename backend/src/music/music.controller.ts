import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MusicService } from './music.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { ImportDriveDto } from './dto/import-drive.dto';
import { AddDirectTrackDto, ProbeUrlDto } from './dto/add-direct-track.dto';

@Controller('api/music')
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  // --- Admin Protected Endpoints ---

  @UseGuards(JwtAuthGuard)
  @Post('direct')
  async addDirectTrack(@Body() directDto: AddDirectTrackDto) {
    const track = await this.musicService.addDirectTrack(directDto);
    return {
      success: true,
      message: 'قطعه با لینک مستقیم با موفقیت ثبت شد',
      track,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('probe-url')
  async probeUrl(@Body() body: ProbeUrlDto) {
    const result = await this.musicService.probeDirectUrl(body.url);
    return {
      success: true,
      result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadTrack(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 }), // 100 MB max
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() body: Partial<CreateTrackDto>,
  ) {
    const track = await this.musicService.uploadTrack(file, body);
    return {
      success: true,
      message: 'قطعه با موفقیت بارگذاری شد',
      track,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('import-drive')
  async importFromDrive(@Body() importDto: ImportDriveDto) {
    const track = await this.musicService.importFromDrive(importDto);
    return {
      success: true,
      message: 'قطعه با موفقیت از گوگل درایو بارگیری و ذخیره شد',
      track,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  async getAllTracksAdmin(@Query('search') search?: string) {
    const tracks = await this.musicService.getAllTracks(search);
    return {
      success: true,
      tracks,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateTrack(
    @Param('id') id: string,
    @Body() updateDto: UpdateTrackDto,
  ) {
    const track = await this.musicService.updateTrack(id, updateDto);
    return {
      success: true,
      message: 'اطلاعات قطعه با موفقیت به‌روزرسانی شد',
      track,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteTrack(@Param('id') id: string) {
    return this.musicService.deleteTrack(id);
  }

  // --- Public Visitor Endpoints (No Auth Required) ---

  @Get(':slug')
  async getTrack(@Param('slug') slug: string) {
    const track = await this.musicService.getTrackBySlug(slug);
    return {
      success: true,
      track,
    };
  }

  @Get(':slug/next-up')
  async getNextUp(@Param('slug') slug: string, @Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 5;
    const tracks = await this.musicService.getNextUpTracks(slug, parsedLimit);
    return {
      success: true,
      tracks,
    };
  }

  @Post(':slug/like')
  async likeTrack(@Param('slug') slug: string) {
    const track = await this.musicService.likeTrack(slug);
    return {
      success: true,
      track,
    };
  }
}
