import { Module } from '@nestjs/common';
import { TranscriptionService } from './transcription/transcription.service';
import { TranscriptionController } from './transcription/transcription.controller';
@Module({
  imports: [],
  providers: [TranscriptionService],
  controllers: [TranscriptionController],
})
export class AppModule {}
