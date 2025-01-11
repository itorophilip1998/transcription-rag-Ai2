import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegStatic from 'ffmpeg-static';
import { SpeechClient, protos } from '@google-cloud/speech';

@Injectable()
export class TranscriptionService {
  private client: SpeechClient;
  private ffmpegPath = ffmpegStatic; // Path to the static ffmpeg binary

  constructor() {
    this.client = new SpeechClient();
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
        .audioCodec('pcm_s16le') // Linear16 format, suitable for Google Speech API
        .audioFrequency(16000) // Set audio frequency to 16kHz
        .on('end', () => resolve(audioPath))
        .on('error', (err) => reject(`Error during conversion: ${err}`))
        .run();
    });
  }

  // Function to transcribe audio using Google Cloud Speech-to-Text
  async transcribeAudio(audioPath: string): Promise<string> {
    const audioBytes = fs.readFileSync(audioPath).toString('base64');

    const request = {
      audio: { content: audioBytes },
      config: {
        encoding:
          protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding
            .LINEAR16, // Correct encoding type
        sampleRateHertz: 16000,
        languageCode: 'en-US',
      },
    };
    try {
      const [response] = await this.client.recognize(request);
      const transcript = response.results
        .map((result) => result.alternatives[0].transcript)
        .join('\n');
      return transcript;
    } catch (error) {
      throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
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
