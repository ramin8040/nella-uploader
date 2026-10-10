import { Module } from '@nestjs/common';
import { StreamController } from './stream.controller';
import { MusicModule } from '../music/music.module';

@Module({
  imports: [MusicModule],
  controllers: [StreamController],
})
export class StreamModule {}
