import { Readable } from 'stream';

export interface FileStreamResult {
  stream: Readable;
  contentLength: number;
  totalSize: number;
  contentRange?: string;
  contentType: string;
}

export interface IStorageService {
  uploadFile(buffer: Buffer, key: string, contentType: string): Promise<string>;
  getFileStream(key: string, rangeHeader?: string, contentType?: string): Promise<FileStreamResult>;
  getFileStats(key: string): Promise<{ size: number; contentType?: string }>;
  deleteFile(key: string): Promise<void>;
  generateKey(originalName: string, prefix?: string): string;
}
