import React, {useState, useEffect, useRef} from 'react';
import './App.css';
import Predictions from '@aws-amplify/predictions';
import { Container, Header, SpaceBetween } from '@cloudscape-design/components';
import { useAudioVideo } from 'amazon-chime-sdk-component-library-react';
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';
import '@cloudscape-design/global-styles/index.css';

import awsExports from './aws-exports';
Amplify.configure(awsExports);

const AlwaysScrollToBottom = () => {
  const elementRef = useRef();
  useEffect(() => elementRef.current.scrollIntoView());
  return <div ref={elementRef} />;
};

const handlePartialTranscripts = (incomingTranscripts, outputText, setCurrentLine, setLine) => {
  const newTranscriptObject = {
    attendeeName: `${incomingTranscripts.attendeeName}`,
    text: `${outputText}`
  };
  if (incomingTranscripts.partial) {
    setCurrentLine([newTranscriptObject]);
  } else {
    setLine((lines) => [
      ...lines,
      newTranscriptObject,
    ]);
    setCurrentLine('');
  }
}

const Transcription = ({targetLanguage, setLine, transcripts, lines }) => {
  const [incomingTranscripts, setIncomingTranscripts] = useState([]);
  const audioVideo = useAudioVideo();
  const [currentLine, setCurrentLine] = useState({});

  useEffect(() => {
    async function transcribeText() {
      console.log(
        `incomingTranscripts: ${JSON.stringify(incomingTranscripts)}`,
      );
      if (incomingTranscripts.transcriptEvent) {
        console.log(`sourceLanguage: ${incomingTranscripts.sourceLanguage}`);
        console.log(`targetLanguage: ${targetLanguage}`);

        if (incomingTranscripts.sourceLanguage !== targetLanguage) {
          const translateResult = await Predictions.convert({
            translateText: {
              source: {
                text: incomingTranscripts.transcriptEvent,
                language: incomingTranscripts.sourceLanguage,
              },
              targetLanguage: targetLanguage,
            },
          });
          console.log(
            `translateResult: ${JSON.stringify(translateResult.text)}`,
          );

          handlePartialTranscripts(
              incomingTranscripts,
              translateResult.text,
              setCurrentLine,
              setLine
          );
        } else {
          handlePartialTranscripts(
              incomingTranscripts,
              incomingTranscripts.transcriptEvent,
              setCurrentLine,
              setLine
          );
        }
      }
    }
    transcribeText();
  }, [incomingTranscripts]);


  
  useEffect(() => {
    if (!audioVideo) {
      console.error('No audioVideo');
      return;
    }
    audioVideo.realtimeSubscribeToReceiveDataMessage(
      'transcriptEvent',
      (data) => {
        const receivedData = (data && data.json()) || {};
        const { message } = receivedData;
        setIncomingTranscripts(message);
      },
    );

    return () => {
      console.log('unsubscribing from receive data message');
      audioVideo.realtimeUnsubscribeFromReceiveDataMessage('Message');
    };
  }, [audioVideo]);

  useEffect(() => {
    async function transcribeText() {
      if (transcripts.transcriptEvent) {
        handlePartialTranscripts(
            transcripts,
            transcripts.transcriptEvent,
            setCurrentLine,
            setLine
        );
      }
    }
    transcribeText();
  }, [transcripts]);

  useEffect(() => {
    if (!audioVideo) {
      console.error('No audioVideo');
      return;
    }
    if (transcripts) {
      audioVideo.realtimeSendDataMessage(
        'transcriptEvent',
        { message: transcripts },
        30000,
      );
    }
  }, [transcripts]);


  return (
    <Container header={<Header variant='h2'>Transcription</Header>}>
      <SpaceBetween size='xs'>
        <div style={{ height: '663px', width: '240px' }} className={"transcriptionContainer"}>
          {lines.map((line, index) => (
               <div key={index}>
                  <strong>{line.attendeeName}</strong>: {line.text}
                  <br />
                </div>
            ))
          }
          {currentLine.length > 0 && currentLine.map((line, index) => (
              <div key={index}>
                <strong>{line.attendeeName}</strong>: {line.text}
                <br />
              </div>
          ))}
          <AlwaysScrollToBottom />
        </div>
      </SpaceBetween>
    </Container>
  );
};

export default Transcription;
