import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { MusicService } from '../music/music.service';
import axios from 'axios';

@Controller('stream')
export class StreamController {
  private readonly logger = new Logger(StreamController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly musicService: MusicService,
  ) {}

  @Get(':id')
  async streamAudio(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // 1. Find track by ID or slug
    const track = await this.prisma.music.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!track) {
      throw new NotFoundException('فایل صوتی یافت نشد');
    }

    const rangeHeader = req.headers.range;

    // 2. Count play only on first chunk request (bytes=0 or no range)
    if (!rangeHeader || rangeHeader.includes('bytes=0-')) {
      this.musicService.incrementPlayCount(track.slug);
    }

    // 3. If track has direct URL, proxy stream directly with Range support
    if (track.directUrl) {
      try {
        const headers: Record<string, string> = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        };
        if (rangeHeader) {
          headers['Range'] = rangeHeader;
        }

        const remoteRes = await axios.get(track.directUrl, {
          headers,
          responseType: 'stream',
          validateStatus: (status) => status >= 200 && status < 400,
        });

        res.status(remoteRes.status);
        res.setHeader('Content-Type', String(remoteRes.headers['content-type'] || track.mimeType));
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'private, max-age=3600, no-transform');
        res.setHeader('Content-Disposition', 'inline');

        if (remoteRes.headers['content-range']) {
          res.setHeader('Content-Range', String(remoteRes.headers['content-range']));
        }
        if (remoteRes.headers['content-length']) {
          res.setHeader('Content-Length', String(remoteRes.headers['content-length']));
        }

        remoteRes.data.on('error', (err: any) => {
          this.logger.error(`Direct stream proxy pipe error: ${err.message}`);
          if (!res.headersSent) res.status(500).end();
        });

        req.on('close', () => {
          if (remoteRes.data && typeof remoteRes.data.destroy === 'function') {
            remoteRes.data.destroy();
          }
        });

        remoteRes.data.pipe(res);
        return;
      } catch (err: any) {
        this.logger.error(`Error streaming from directUrl for track ${id}: ${err.message}`);
        if (!res.headersSent) {
          res.status(502).json({ error: 'خطا در ارتباط با لینک مستقیم صوت' });
        }
        return;
      }
    }

    try {
      // 3. Fetch stream chunk with range support from Cloudflare R2 / Storage
      const {
        stream,
        contentLength,
        contentRange,
        contentType,
        totalSize,
      } = await this.storageService.getFileStream(
        track.storageKey,
        rangeHeader,
        track.mimeType,
      );

      // 4. Secure headers (never exposing Cloudflare R2 URLs or buckets)
      res.setHeader('Content-Type', contentType);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'private, max-age=3600, no-transform');
      res.setHeader('Content-Disposition', 'inline');

      if (contentRange) {
        // HTTP 206 Partial Content for Range Requests
        res.status(206);
        res.setHeader('Content-Range', contentRange);
        res.setHeader('Content-Length', contentLength);
      } else {
        // HTTP 200 Full Content
        res.status(200);
        res.setHeader('Content-Length', totalSize);
      }

      // 5. Pipe binary stream to response
      stream.on('error', (err) => {
        this.logger.error(`Stream pipe error: ${err.message}`);
        if (!res.headersSent) {
          res.status(500).end();
        }
      });

      req.on('close', () => {
        if ('destroy' in stream && typeof (stream as any).destroy === 'function') {
          (stream as any).destroy();
        }
      });

      stream.pipe(res);
    } catch (error) {
      this.logger.error(`Streaming error for track ${id}: ${error.message}`);
      if (!res.headersSent) {
        res.status(404).json({ error: 'خطا در بارگذاری جریان صوتی' });
      }
    }
  }
}
