import { Module } from '@nestjs/common';
import { TranscriptionController } from './transcription.controller';
import { TranscriptionService } from './transcription.service';

@Module({})
export class TranscriptionModule {
  imports: [];
  controllers: [TranscriptionController];
  providers: [TranscriptionService];
}
