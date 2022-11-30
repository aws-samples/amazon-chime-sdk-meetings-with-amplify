import { TranscribeStreamingClient } from '@aws-sdk/client-transcribe-streaming';
import MicrophoneStream from 'microphone-stream';
import { StartStreamTranscriptionCommand } from '@aws-sdk/client-transcribe-streaming';

let SAMPLE_RATE = 48000;
let muteTranscribe = false;

export const mute = async () => {
  muteTranscribe = true;
  console.log('mute transcribe');
}

export const unMute = async () => {
  muteTranscribe = false;
  console.log('unmute transcribe');
}

export const startRecording = async (
  language,
  callback,
  currentCredentials,
) => {
  if (!language) {
    console.log('no language');
    return false;
  }
  console.log(`selected language: ${language}`);
  const microphoneStream = await createMicrophoneStream();

  const transcribeClient = new TranscribeStreamingClient({
    region: 'us-east-1',
    credentials: currentCredentials,
  });
  return await startStreaming(
    language,
    microphoneStream,
    transcribeClient,
    callback,
  );
};

export const stopRecording = function (microphoneStream, transcribeClient) {
  console.log('stopRecording - pre');
  console.log(`microphoneStream: ${microphoneStream}`);
  console.log(`transcribeClient: ${transcribeClient}`);
  if (microphoneStream) {
    microphoneStream.stop();
    console.log('stopRecording - microphoneStream', microphoneStream);
  }
  if (transcribeClient) {
    transcribeClient.destroy();
    console.log('stopRecording - transcribeClient', transcribeClient);
  }
};

const createMicrophoneStream = async () => {
  let mediaStream = null;
  try {
    mediaStream = await window.navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true,
    });
  } catch (e) {
    console.error(`createMicrophoneStream error: ${e}`);
  }

  if (mediaStream) {
    if (mediaStream.getAudioTracks()[0].getSettings().sampleRate) {
      SAMPLE_RATE = mediaStream.getAudioTracks()[0].getSettings().sampleRate;
    }
    console.log('Sample rate', SAMPLE_RATE);
  }
  const microphoneStream = mediaStream
    ? new MicrophoneStream({
        stream: mediaStream,
        objectMode: false,
      })
    : new MicrophoneStream();
  
  microphoneStream.on('format', function(format) {
    console.log(format);
  });

  console.log(
    'inside - createMicrophoneStream - microphoneStream',
    microphoneStream,
  );
  console.log(
    'inside - after - createMicrophoneStream - microphoneStream',
    microphoneStream,
  );
  return microphoneStream;
};

const startStreaming = async (
  language,
  microphoneStream,
  transcribeClient,
  callback,
) => {
  console.log(`in startStreaming.  language: ${language}`);
  const audioStream = await getAudioStream(microphoneStream);
  console.log(audioStream, 'audioStream');

  const command = new StartStreamTranscriptionCommand({
    LanguageCode: language,
    MediaEncoding: 'pcm',
    MediaSampleRateHertz: SAMPLE_RATE,
    AudioStream: audioStream,
  });
  const data = await transcribeClient.send(command);

  if (data.TranscriptResultStream) {
    for await (const event of data?.TranscriptResultStream) {
      if (event?.TranscriptEvent?.Transcript) {
        console.log(event?.TranscriptEvent?.Transcript);
        for (const result of event?.TranscriptEvent?.Transcript.Results || []) {
          if (result?.Alternatives && result?.Alternatives[0].Items) {
            const noOfResults = result?.Alternatives[0].Items?.length;
            let wholeSentence = ``;
            for (let i = 0; i < noOfResults; i++) {
              wholeSentence += ` ${result?.Alternatives[0].Items[i].Content}`;
            }
            callback(
              wholeSentence,
              result.IsPartial,
              transcribeClient,
              microphoneStream,
            );
          }
        }
      }
    }
  }
};

const pcmEncode = (input) => {
  const buffer = new ArrayBuffer(input.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
};

const getAudioStream = async function* (microphoneStream) {
  const pcmEncodeChunk = (audioChunk) => {
    const raw = MicrophoneStream.toRaw(audioChunk);
    if (raw === null) {
      return;
    }
    return Buffer.from(pcmEncode(raw));
  };
  console.log(microphoneStream, 'microphoneStream inside getAudioStream');

  // @ts-ignore
  for await (const chunk of microphoneStream) {
    if (chunk.length <= SAMPLE_RATE) {
      let encodedChunk = pcmEncodeChunk(chunk);
      if (muteTranscribe) {
          encodedChunk = Buffer.alloc(encodedChunk.length);
      }
      yield {
        AudioEvent: {
          AudioChunk: encodedChunk,
        },
      };
    }
  }
};
