import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TranscriptionService } from './transcription.service';
import * as fs from 'fs';
import * as path from 'path';

@Controller('transcription')
export class TranscriptionController {
  constructor(private readonly transcriptionService: TranscriptionService) {}

  @Get('')
  getHello() {
    return { status: 'Hello World! my local server backend' };
  }

  @Post('')
  @UseInterceptors(FileInterceptor('file')) // Handles file uploads
  async transcribe(@UploadedFile() file: Express.Multer.File) {
    try {
      // Ensure the uploads directory exist
      const uploadsDir = path.join(__dirname, '..', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
      }

      // Save the file temporarily sfsfs
      const filePath = path.join(uploadsDir, file.originalname);
      fs.writeFileSync(filePath, file.buffer);
      // Process the uploaded file and get transcription
      const transcript = await this.transcriptionService.processFile(filePath);
      return transcript;
    } catch (error) {
      // throw new Error(`Transcription failed: ${error.message}`);
      return {
        message: `Transcription failed: ${error.message}`,
        statusCode: 500,
        error: error,
      };
    }
  }
}
