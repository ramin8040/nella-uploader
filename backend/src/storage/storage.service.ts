import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import { FileStreamResult, IStorageService } from './storage.interface';
import { nanoid } from 'nanoid';

@Injectable()
export class StorageService implements IStorageService, OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client | null = null;
  private isR2 = false;
  private bucketName = '';
  private localDir = path.resolve(process.cwd(), 'uploads');

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const driver = this.configService.get<string>('STORAGE_DRIVER', 'local');
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');
    this.bucketName = this.configService.get<string>('R2_BUCKET_NAME', 'music-storage');
    const customEndpoint = this.configService.get<string>('R2_ENDPOINT');
    const customLocalDir = this.configService.get<string>('LOCAL_STORAGE_DIR');

    if (customLocalDir) {
      this.localDir = path.resolve(process.cwd(), customLocalDir);
    }

    if (!fs.existsSync(this.localDir)) {
      fs.mkdirSync(this.localDir, { recursive: true });
    }

    if (driver === 'r2' && accountId && accessKeyId && secretAccessKey) {
      const endpoint = customEndpoint || `https://${accountId}.r2.cloudflarestorage.com`;
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.isR2 = true;
      this.logger.log(`☁️ Cloudflare R2 storage initialized for bucket "${this.bucketName}"`);
    } else {
      this.isR2 = false;
      this.logger.log(`📁 Local storage driver active at: ${this.localDir}`);
    }
  }

  generateKey(originalName: string, prefix = 'tracks'): string {
    const ext = path.extname(originalName) || '.mp3';
    const id = nanoid(10);
    return `${prefix}/${id}${ext}`;
  }

  async uploadFile(buffer: Buffer, key: string, contentType: string): Promise<string> {
    if (this.isR2 && this.s3Client) {
      this.logger.log(`Uploading to Cloudflare R2: ${key}`);
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        }),
      );
      return key;
    }

    // Local file fallback
    const targetPath = path.join(this.localDir, key);
    const parentDir = path.dirname(targetPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    await fs.promises.writeFile(targetPath, buffer);
    this.logger.log(`Saved locally: ${targetPath}`);
    return key;
  }

  async getFileStats(key: string): Promise<{ size: number; contentType?: string }> {
    if (this.isR2 && this.s3Client) {
      const head = await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
      return {
        size: head.ContentLength || 0,
        contentType: head.ContentType,
      };
    }

    const targetPath = path.join(this.localDir, key);
    if (!fs.existsSync(targetPath)) {
      throw new Error(`File not found: ${key}`);
    }
    const stat = await fs.promises.stat(targetPath);
    return {
      size: stat.size,
    };
  }

  async getFileStream(
    key: string,
    rangeHeader?: string,
    defaultContentType = 'audio/mpeg',
  ): Promise<FileStreamResult> {
    const stats = await this.getFileStats(key);
    const totalSize = stats.size;
    const contentType = stats.contentType || defaultContentType;

    let start = 0;
    let end = totalSize - 1;
    let contentRange: string | undefined = undefined;

    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      start = parseInt(parts[0], 10);
      end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

      if (isNaN(start)) start = 0;
      if (isNaN(end) || end >= totalSize) end = totalSize - 1;

      contentRange = `bytes ${start}-${end}/${totalSize}`;
    }

    const contentLength = end - start + 1;

    if (this.isR2 && this.s3Client) {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Range: `bytes=${start}-${end}`,
      });
      const response = await this.s3Client.send(command);
      return {
        stream: response.Body as Readable,
        contentLength,
        totalSize,
        contentRange,
        contentType,
      };
    }

    // Local stream with range support
    const targetPath = path.join(this.localDir, key);
    const stream = fs.createReadStream(targetPath, { start, end });

    return {
      stream,
      contentLength,
      totalSize,
      contentRange,
      contentType,
    };
  }

  async deleteFile(key: string): Promise<void> {
    if (this.isR2 && this.s3Client) {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
      return;
    }

    const targetPath = path.join(this.localDir, key);
    if (fs.existsSync(targetPath)) {
      await fs.promises.unlink(targetPath);
    }
  }
}
