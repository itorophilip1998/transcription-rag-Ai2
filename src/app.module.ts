import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TranscriptionModule } from './transcription/transcription.module';

@Module({
  imports: [
    TranscriptionModule,
    // Serve files from the "uploads" folder
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads', // URL path to access files
    }),
  ],
})
export class AppModule {}
