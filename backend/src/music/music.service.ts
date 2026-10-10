import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AudioService } from '../audio/audio.service';
import { DriveDownloaderService } from '../audio/drive-downloader.service';
import { customAlphabet } from 'nanoid';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { ImportDriveDto } from './dto/import-drive.dto';
import { AddDirectTrackDto } from './dto/add-direct-track.dto';
import axios from 'axios';

// Alphanumeric URL-safe NanoID generator (7 characters)
const generateNanoId = customAlphabet(
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  7,
);

@Injectable()
export class MusicService {
  private readonly logger = new Logger(MusicService.name);

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private audioService: AudioService,
    private driveDownloader: DriveDownloaderService,
  ) {}

  async uploadTrack(
    file: Express.Multer.File,
    overrideData?: Partial<CreateTrackDto>,
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestException('فایل صوتی ارسال نشده است');
    }

    // 1. Extract metadata & waveforms
    const meta = await this.audioService.extractMetadata(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    // 2. Generate NanoID and storage key
    const trackId = generateNanoId();
    const slug = trackId;
    const storageKey = this.storageService.generateKey(file.originalname);

    // 3. Upload permanently to Cloudflare R2 / Storage
    await this.storageService.uploadFile(file.buffer, storageKey, meta.mimeType);

    // 4. Save to Database
    const title = overrideData?.title?.trim() || meta.title;
    const artist = overrideData?.artist?.trim() || meta.artist;
    const album = overrideData?.album?.trim() || meta.album;
    const duration = overrideData?.duration || meta.duration;

    const track = await this.prisma.music.create({
      data: {
        id: trackId,
        slug,
        title,
        artist,
        album,
        duration,
        bitrate: meta.bitrate,
        fileSize: meta.fileSize,
        mimeType: meta.mimeType,
        storageKey,
      },
    });

    this.logger.log(`Created track "${track.title}" with slug: ${track.slug}`);

    return {
      ...track,
      peaks: meta.peaks,
    };
  }

  async importFromDrive(importDto: ImportDriveDto) {
    const { driveUrl, customTitle, customArtist } = importDto;

    // 1. Download file permanently from Google Drive (NEVER stream directly from Drive)
    const { buffer, filename } = await this.driveDownloader.downloadFromDrive(driveUrl);

    // 2. Extract metadata
    const meta = await this.audioService.extractMetadata(buffer, filename);

    // 3. Generate NanoID & storage key
    const trackId = generateNanoId();
    const slug = trackId;
    const storageKey = this.storageService.generateKey(filename);

    // 4. Store permanently in Cloudflare R2
    await this.storageService.uploadFile(buffer, storageKey, meta.mimeType);

    // 5. Save track in Database
    const title = customTitle?.trim() || meta.title;
    const artist = customArtist?.trim() || meta.artist;

    const track = await this.prisma.music.create({
      data: {
        id: trackId,
        slug,
        title,
        artist,
        album: meta.album,
        duration: meta.duration,
        bitrate: meta.bitrate,
        fileSize: meta.fileSize,
        mimeType: meta.mimeType,
        storageKey,
      },
    });

    this.logger.log(`Imported from Drive: "${track.title}" (${track.slug})`);

    return {
      ...track,
      peaks: meta.peaks,
    };
  }

  async probeDirectUrl(url: string) {
    try {
      const response = await axios({
        method: 'HEAD',
        url,
        timeout: 8000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const contentLength = parseInt(String(response.headers['content-length'] || '0'), 10);
      const contentType = String(response.headers['content-type'] || 'audio/mpeg');

      const urlPath = new URL(url).pathname;
      const rawName = decodeURIComponent(urlPath.split('/').pop() || 'track.mp3');
      const baseName = rawName.replace(/\.[^/.]+$/, '');

      let title = baseName;
      let artist = 'هنرمند ناشناس';

      if (baseName.includes(' - ')) {
        const parts = baseName.split(' - ');
        artist = parts[0].trim();
        title = parts.slice(1).join(' - ').trim();
      }

      const estimatedDuration = contentLength > 0 ? Math.round(contentLength / 24000) : 180;

      return {
        url,
        fileSize: contentLength,
        mimeType: contentType,
        title,
        artist,
        estimatedDuration,
      };
    } catch (error) {
      const urlPath = new URL(url).pathname;
      const rawName = decodeURIComponent(urlPath.split('/').pop() || 'track.mp3');
      const baseName = rawName.replace(/\.[^/.]+$/, '');

      return {
        url,
        fileSize: 0,
        mimeType: 'audio/mpeg',
        title: baseName || 'قطعه موسیقی',
        artist: 'هنرمند ناشناس',
        estimatedDuration: 180,
      };
    }
  }

  async addDirectTrack(dto: AddDirectTrackDto) {
    const { directUrl, title, artist, album, duration } = dto;
    if (!directUrl) {
      throw new BadRequestException('لینک مستقیم آهنگ الزامی است');
    }

    const probed = await this.probeDirectUrl(directUrl);
    const trackId = generateNanoId();
    const slug = trackId;

    const finalDuration = duration && duration > 0 ? duration : (probed.estimatedDuration || 180);

    const track = await this.prisma.music.create({
      data: {
        id: trackId,
        slug,
        title: title.trim(),
        artist: artist.trim(),
        album: album?.trim() || 'تک آهنگ',
        duration: finalDuration,
        bitrate: 320,
        fileSize: probed.fileSize || 5000000,
        mimeType: probed.mimeType || 'audio/mpeg',
        storageKey: '',
        directUrl: directUrl.trim(),
      },
    });

    this.logger.log(`Added direct stream track "${track.title}" with slug: ${track.slug}`);
    return track;
  }

  async getAllTracks(search?: string) {
    const where = search
      ? {
          OR: [
            { title: { contains: search } },
            { artist: { contains: search } },
            { album: { contains: search } },
          ],
        }
      : {};

    const tracks = await this.prisma.music.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        artist: true,
        album: true,
        duration: true,
        bitrate: true,
        fileSize: true,
        directUrl: true,
        playCount: true,
        likeCount: true,
        createdAt: true,
        updatedAt: true,
        // storageKey is intentionally excluded from client responses
      },
    });

    return tracks;
  }

  async getTrackBySlug(slug: string) {
    const track = await this.prisma.music.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        artist: true,
        album: true,
        duration: true,
        bitrate: true,
        fileSize: true,
        mimeType: true,
        playCount: true,
        likeCount: true,
        createdAt: true,
      },
    });

    if (!track) {
      throw new NotFoundException('قطعه موسیقی مورد نظر یافت نشد');
    }

    return track;
  }

  async getNextUpTracks(currentSlug: string, limit = 5) {
    const tracks = await this.prisma.music.findMany({
      where: {
        slug: { not: currentSlug },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        artist: true,
        duration: true,
        playCount: true,
      },
    });

    return tracks;
  }

  async updateTrack(id: string, updateDto: UpdateTrackDto) {
    const exists = await this.prisma.music.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException('قطعه مورد نظر یافت نشد');
    }

    const updated = await this.prisma.music.update({
      where: { id },
      data: {
        ...(updateDto.title && { title: updateDto.title.trim() }),
        ...(updateDto.artist && { artist: updateDto.artist.trim() }),
        ...(updateDto.album !== undefined && { album: updateDto.album?.trim() }),
      },
      select: {
        id: true,
        slug: true,
        title: true,
        artist: true,
        album: true,
        duration: true,
        bitrate: true,
        playCount: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  async deleteTrack(id: string) {
    const track = await this.prisma.music.findUnique({ where: { id } });
    if (!track) {
      throw new NotFoundException('قطعه مورد نظر یافت نشد');
    }

    // Delete audio file from Cloudflare R2 / storage
    try {
      await this.storageService.deleteFile(track.storageKey);
    } catch (e) {
      this.logger.warn(`Failed to delete storage file: ${e.message}`);
    }

    // Delete record from DB
    await this.prisma.music.delete({ where: { id } });

    return {
      success: true,
      message: 'قطعه با موفقیت حذف شد',
    };
  }

  async incrementPlayCount(slug: string) {
    try {
      await this.prisma.music.update({
        where: { slug },
        data: { playCount: { increment: 1 } },
      });
    } catch {
      // Ignore if not found
    }
  }

  async likeTrack(slug: string) {
    const track = await this.prisma.music.update({
      where: { slug },
      data: { likeCount: { increment: 1 } },
      select: { id: true, slug: true, likeCount: true },
    });
    return track;
  }
}
