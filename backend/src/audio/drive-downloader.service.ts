import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class DriveDownloaderService {
  private readonly logger = new Logger(DriveDownloaderService.name);

  extractFileId(driveUrlOrId: string): string {
    const trimmed = driveUrlOrId.trim();

    // Direct ID check
    if (/^[a-zA-Z0-9_-]{25,}$/.test(trimmed)) {
      return trimmed;
    }

    // Match /d/ID or id=ID
    const matchId = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (matchId && matchId[1]) {
      return matchId[1];
    }

    const matchParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (matchParam && matchParam[1]) {
      return matchParam[1];
    }

    throw new BadRequestException('شناسه یا پیوند گوگل درایو نامعتبر است');
  }

  async downloadFromDrive(driveUrlOrId: string): Promise<{ buffer: Buffer; filename: string }> {
    const fileId = this.extractFileId(driveUrlOrId);
    this.logger.log(`Downloading audio file from Google Drive (ID: ${fileId})`);

    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    try {
      const response = await axios.get(downloadUrl, {
        responseType: 'arraybuffer',
        maxRedirects: 5,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const buffer = Buffer.from(response.data);

      // Check if Google Drive returned an HTML warning page (for large files virus scan bypass)
      const preview = buffer.slice(0, 1000).toString('utf-8');
      if (preview.includes('<!DOCTYPE html>') && preview.includes('confirm=')) {
        const confirmMatch = preview.match(/confirm=([0-9A-Za-z_]+)/);
        if (confirmMatch && confirmMatch[1]) {
          const confirmCode = confirmMatch[1];
          const confirmUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=${confirmCode}`;
          const confirmedRes = await axios.get(confirmUrl, {
            responseType: 'arraybuffer',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          });
          const finalBuffer = Buffer.from(confirmedRes.data);
          const filename = this.extractFilename(confirmedRes.headers['content-disposition']) || `drive_track_${fileId}.mp3`;
          return { buffer: finalBuffer, filename };
        }
      }

      const filename = this.extractFilename(response.headers['content-disposition']) || `drive_track_${fileId}.mp3`;
      return { buffer, filename };
    } catch (error) {
      this.logger.error(`Failed to download from Google Drive: ${error.message}`);
      throw new BadRequestException(`خطا در دانلود فایل از گوگل درایو: ${error.message}`);
    }
  }

  private extractFilename(dispositionHeader?: string): string | null {
    if (!dispositionHeader) return null;
    const match = dispositionHeader.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?/i);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
    return null;
  }
}
