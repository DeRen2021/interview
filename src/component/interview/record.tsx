// import React from 'react';
import { ReactMediaRecorder } from 'react-media-recorder';
import { transcribeEndpoint } from '../../config/config';

interface AudioRecorderProps {
  onTranscription: (text: string) => void;
}

export default function AudioRecorder({ onTranscription }: AudioRecorderProps) {
  return (
    <ReactMediaRecorder
      audio
      onStop={async (_, blob) => {
        // 将 Blob 上传给后端
        const form = new FormData();
        form.append('audio', blob, 'recording.webm');
        const res = await fetch(transcribeEndpoint, { method: 'POST', body: form });
        const { text } = await res.json();
        onTranscription(text);
      }}
      render={({ status, startRecording, stopRecording }) => (
        <div>
          <p>状态：{status}</p>
          <button onClick={startRecording}>开始录音</button>
          <button onClick={stopRecording}>结束并识别</button>
        </div>
      )}
    />
  );
}