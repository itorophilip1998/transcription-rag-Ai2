import {
  Controller,
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

  @Post('transcribe')
  @UseInterceptors(FileInterceptor('file')) // Handles file uploads
  async transcribe(@UploadedFile() file: Express.Multer.File): Promise<string> {
    // Ensure the uploads directory exists
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    // Save the file temporarily or use the buffer directly
    const filePath = path.join(uploadsDir, file.originalname);
    fs.writeFileSync(filePath, file.buffer);

    try {
      // Process the uploaded file and get transcription
      const transcript = await this.transcriptionService.processFile(filePath);
      return transcript;
    } catch (error) {
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }
}
