'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Mic, Square, Upload, Play, Pause, Volume2, 
  CheckCircle, AlertCircle, Music
} from 'lucide-react';

interface AudioRecorderProps {
  onAudioReady: (audioBlob: Blob, audioFile?: File) => void;
  tonicFrequency?: number;
  className?: string;
}

export default function AudioRecorder({
  onAudioReady,
  tonicFrequency = 130.81,
  className = '',
}: AudioRecorderProps) {
  const [mode, setMode] = useState<'record' | 'upload'>('record');
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  // Tanpura Drone Synth State
  const [isTanpuraActive, setIsTanpuraActive] = useState(false);
  const [tanpuraVolume, setTanpuraVolume] = useState(0.4);

  // Web Audio Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recordedAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const tanpuraNodesRef = useRef<{
    ctx: AudioContext;
    masterGain: GainNode;
    intervalId: NodeJS.Timeout;
  } | null>(null);

  // Draw real-time audio visualization with faint slate stroke
  const drawWaveform = useCallback(() => {
    if (!analyserRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteTimeDomainData(dataArray);

    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#475569';
    ctx.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    animFrameRef.current = requestAnimationFrame(drawWaveform);
  }, []);

  const startRecording = async () => {
    setMicError(null);
    setAudioUrl(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        }
      });

      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      analyserRef.current = analyser;

      drawWaveform();

      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onAudioReady(blob);

        stream.getTracks().forEach((track) => track.stop());
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordTime(0);

      timerRef.current = setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);

    } catch (err: unknown) {
      console.error("Microphone access error:", err);
      setMicError("Microphone access unavailable. Check browser permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      onAudioReady(file, file);
    }
  };

  const togglePlayRecorded = () => {
    if (!recordedAudioRef.current) return;
    if (isPlayingRecorded) {
      recordedAudioRef.current.pause();
      setIsPlayingRecorded(false);
    } else {
      recordedAudioRef.current.play();
      setIsPlayingRecorded(true);
    }
  };

  const toggleTanpura = () => {
    if (isTanpuraActive) {
      if (tanpuraNodesRef.current) {
        clearInterval(tanpuraNodesRef.current.intervalId);
        tanpuraNodesRef.current.ctx.close();
        tanpuraNodesRef.current = null;
      }
      setIsTanpuraActive(false);
    } else {
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(tanpuraVolume, ctx.currentTime);
        masterGain.connect(ctx.destination);

        const paFreq = tonicFrequency * 1.5;
        const saFreq = tonicFrequency;
        const lowSaFreq = tonicFrequency * 0.5;

        const stringFrequencies = [paFreq, saFreq, saFreq, lowSaFreq];
        let currentString = 0;

        const pluckString = (freq: number) => {
          if (ctx.state === 'closed') return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          const now = ctx.currentTime;
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.exponentialRampToValueAtTime(0.25, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now);
          osc.stop(now + 3.0);
        };

        pluckString(stringFrequencies[0]);
        currentString = 1;

        const intervalId = setInterval(() => {
          pluckString(stringFrequencies[currentString]);
          currentString = (currentString + 1) % stringFrequencies.length;
        }, 850);

        tanpuraNodesRef.current = { ctx, masterGain, intervalId };
        setIsTanpuraActive(true);
      } catch (err) {
        console.error("Tanpura audio init failed:", err);
      }
    }
  };

  const handleVolumeChange = (vol: number) => {
    setTanpuraVolume(vol);
    if (tanpuraNodesRef.current) {
      tanpuraNodesRef.current.masterGain.gain.setValueAtTime(vol, tanpuraNodesRef.current.ctx.currentTime);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (tanpuraNodesRef.current) {
        clearInterval(tanpuraNodesRef.current.intervalId);
        tanpuraNodesRef.current.ctx.close();
      }
    };
  }, []);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs ${className}`}>
      {/* Header & Tabs */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-semibold text-slate-800">Audio Input</h3>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setMode('record')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              mode === 'record'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mic
          </button>
          <button
            onClick={() => setMode('upload')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              mode === 'upload'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upload
          </button>
        </div>
      </div>

      {/* Tanpura Drone Control */}
      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTanpura}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              isTanpuraActive 
                ? 'bg-slate-800 text-white' 
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>{isTanpuraActive ? 'Stop Drone' : 'Drone (Tanpura)'}</span>
          </button>
          <span className="font-mono text-slate-500 text-[11px]">
            Sa: {tonicFrequency.toFixed(1)} Hz
          </span>
        </div>

        {isTanpuraActive && (
          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="range"
              min="0.05"
              max="0.8"
              step="0.05"
              value={tanpuraVolume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-20 accent-slate-800 h-1 bg-slate-200 rounded cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Error Banner */}
      {micError && (
        <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{micError}</span>
        </div>
      )}

      {/* Main Recording / Upload Area */}
      {mode === 'record' ? (
        <div className="space-y-3">
          <div className="h-24 w-full bg-[#F8FAFC] rounded-xl border border-slate-200 overflow-hidden relative flex items-center justify-center">
            <canvas ref={canvasRef} width={600} height={96} className="w-full h-full" />

            {!isRecording && !audioUrl && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs gap-1.5 pointer-events-none">
                <Mic className="w-4 h-4 text-slate-400" />
                <span>Ready to record</span>
              </div>
            )}

            {isRecording && (
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-white/90 px-2 py-0.5 rounded-full border border-slate-200 text-slate-700 text-xs font-mono font-semibold shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span>{formatSeconds(recordTime)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center pt-1">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-2xs"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Record</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white font-medium text-xs hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-2xs"
              >
                <Square className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                <span>Stop & Analyze ({formatSeconds(recordTime)})</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-6 border border-dashed border-slate-200 hover:border-slate-400 rounded-xl text-center transition-colors bg-slate-50">
          <input
            type="file"
            id="audio-file-input"
            accept="audio/wav,audio/mp3,audio/mpeg,audio/flac,audio/ogg"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label htmlFor="audio-file-input" className="cursor-pointer flex flex-col items-center">
            <Upload className="w-6 h-6 text-slate-400 mb-1.5" />
            <span className="text-xs font-medium text-slate-700">Choose audio file (WAV, MP3, FLAC)</span>
          </label>
        </div>
      )}

      {/* Recorded Audio Preview */}
      {audioUrl && (
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Audio ready for analysis</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={togglePlayRecorded}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
              title="Preview audio"
            >
              {isPlayingRecorded ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <audio
              ref={recordedAudioRef}
              src={audioUrl}
              onEnded={() => setIsPlayingRecorded(false)}
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
}
