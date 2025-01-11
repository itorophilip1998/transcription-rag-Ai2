import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegStatic from 'ffmpeg-static';
import * as vosk from 'vosk';

@Injectable()
export class TranscriptionService {
  private ffmpegPath = ffmpegStatic; // Path to the static ffmpeg binary

  constructor() {
    // Load Vosk model for transcription
    const modelPath = path.join(__dirname, 'vosk-model'); // Set the path to your Vosk model directory
    if (!fs.existsSync(modelPath)) {
      throw new Error(
        'Vosk model not found! Please download the model from https://alphacephei.com/vosk/models',
      );
    }
    this.model = new vosk.Model(modelPath);
  }

  // Function to convert video to audio (WAV format)
  async convertVideoToAudio(
    videoPath: string,
    audioPath: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .setFfmpegPath(this.ffmpegPath)
        .output(audioPath)
        .audioCodec('pcm_s16le') // Linear16 format, suitable for Vosk
        .audioFrequency(16000) // Set audio frequency to 16kHz
        .on('end', () => resolve(audioPath))
        .on('error', (err) => reject(`Error during conversion: ${err}`))
        .run();
    });
  }

  // Function to transcribe audio using Vosk
  async transcribeAudio(audioPath: string): Promise<string> {
    const audioStream = fs.createReadStream(audioPath);
    const recognizer = new vosk.AsrRecognizer(this.model, {
      sampleRate: 16000,
    });

    let transcript = '';
    audioStream.on('data', (chunk) => {
      recognizer.acceptWaveform(chunk); // Feed audio data to recognizer
    });

    audioStream.on('end', () => {
      const result = recognizer.finalResult();
      if (result && result.text) {
        transcript = result.text; // Get the transcript from the final result
      }
    });

    return new Promise((resolve, reject) => {
      audioStream.on('end', () => {
        if (transcript) {
          resolve(transcript);
        } else {
          reject(new Error('Failed to transcribe audio.'));
        }
      });
    });
  }

  // Main method to handle transcription
  async processFile(filePath: string): Promise<string> {
    const extname = path.extname(filePath).toLowerCase();
    let audioPath = '';

    if (extname === '.mp4' || extname === '.avi' || extname === '.mov') {
      // If video, convert to audio
      const tempAudioPath = path.join(__dirname, 'temp_audio.wav');
      audioPath = await this.convertVideoToAudio(filePath, tempAudioPath);
    } else if (
      extname === '.mp3' ||
      extname === '.wav' ||
      extname === '.flac'
    ) {
      // If audio, directly use it
      audioPath = filePath;
    } else {
      throw new Error('Unsupported file type!');
    }

    const transcript = await this.transcribeAudio(audioPath);

    // Clean up temporary audio file (if created)
    if (audioPath !== filePath) {
      fs.unlinkSync(audioPath);
    }

    return transcript;
  }
}
