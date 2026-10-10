import { Module } from '@nestjs/common';
import { AudioService } from './audio.service';
import { DriveDownloaderService } from './drive-downloader.service';

@Module({
  providers: [AudioService, DriveDownloaderService],
  exports: [AudioService, DriveDownloaderService],
})
export class AudioModule {}
