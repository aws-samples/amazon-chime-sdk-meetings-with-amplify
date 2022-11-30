import React, {useState, useEffect, useRef} from 'react';
import './App.css';
import { Container, Header, SpaceBetween } from '@cloudscape-design/components';
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

const Transcription = ({ setLine, transcripts, lines }) => {
  const [currentLine, setCurrentLine] = useState({});

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
