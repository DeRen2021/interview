// import React from 'react';
import { ReactMediaRecorder } from 'react-media-recorder';
import { transcribeEndpoint } from '../../config/config';
import { useState } from 'react';
import '../../styles/component/Button.css';

interface AudioRecorderProps {
  onTranscription: (text: string) => void;
}
  
export default function AudioRecorder({ onTranscription }: AudioRecorderProps) {

  const [istranscripting, setIsTranscripting] = useState<boolean>(false);

  const transcribe = async (_: string, blob: Blob | null) => {
    if (!blob) return;
    setIsTranscripting(true);
    const form = new FormData();
    form.append('audio', blob, 'recording.webm');
    try {
      const res = await fetch(transcribeEndpoint, { method: 'POST', body: form });
      const { text } = await res.json();
      onTranscription(text);
    } catch (error) {
      console.error("Transcription failed:", error);
    } finally {
      setIsTranscripting(false);
    }
  }

  return (
    <ReactMediaRecorder
      audio
      onStop={transcribe}
      render={({ status, startRecording, stopRecording }) => (
        <div>
          <p>状态：{status}{istranscripting && ', 正在识别...'}</p>
          {istranscripting ? (
            <button className="button" disabled>正在识别...</button>
          ) : status === 'recording' ? (
            <button onClick={stopRecording} className="button recording">
              停止录音
            </button>
          ) : (
            <button onClick={startRecording} className="button">开始录音</button>
          )}
        </div>
      )}
    />
  );
}