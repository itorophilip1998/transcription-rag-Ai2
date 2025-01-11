import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TranscriptionModule } from './transcription/transcription.module';

const ServeStaticModuleFn = ServeStaticModule.forRoot({
  rootPath: join(__dirname, '..', 'uploads'),
  serveRoot: '/uploads', // URL path to access files
});

@Module({
  imports: [TranscriptionModule, ServeStaticModuleFn],
})
export class AppModule {}
