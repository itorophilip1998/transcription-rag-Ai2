import { SpeechClient } from '@google-cloud/speech';

async function testGoogleCloudCredentials() {
  try {
    // Create a client for Google Cloud Speech API
    const client = new SpeechClient();

    // Try a basic operation like getting the project information
    const [project] = await client.getProjectId();

    console.log(
      `Successfully authenticated! Google Cloud Project ID: ${project}`,
    );
  } catch (error) {
    console.error('Failed to authenticate with Google Cloud:', error.message);
  }
}

testGoogleCloudCredentials();
