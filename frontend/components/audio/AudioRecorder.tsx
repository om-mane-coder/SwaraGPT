'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Mic, Square, Upload, Play, Pause, Volume2, VolumeX, 
  RefreshCw, CheckCircle, AlertCircle, Music
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
  // Mode: mic record vs upload
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

  // Tanpura nodes ref
  const tanpuraNodesRef = useRef<{
    ctx: AudioContext;
    masterGain: GainNode;
    intervalId: NodeJS.Timeout;
  } | null>(null);

  // Draw real-time audio visualization
  const drawWaveform = useCallback(() => {
    if (!analyserRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteTimeDomainData(dataArray);

    ctx.fillStyle = '#090D16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#F59E0B';
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

  // Start Live Microphone Recording
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

        // Stop all media tracks
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
      setMicError("Microphone permission denied or device not found. Please check browser settings.");
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      onAudioReady(file, file);
    }
  };

  // Play / Pause Recorded Audio Preview
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

  // Start / Stop Synthetic Tanpura Drone
  const toggleTanpura = () => {
    if (isTanpuraActive) {
      // Stop Tanpura
      if (tanpuraNodesRef.current) {
        clearInterval(tanpuraNodesRef.current.intervalId);
        tanpuraNodesRef.current.ctx.close();
        tanpuraNodesRef.current = null;
      }
      setIsTanpuraActive(false);
    } else {
      // Start Tanpura Pluck Cycle (Pa - Sa - Sa - Sa_low)
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(tanpuraVolume, ctx.currentTime);
        masterGain.connect(ctx.destination);

        // Frequencies based on tonic: Pa (3/2 * tonic), Sa (tonic), Mandra Sa (0.5 * tonic)
        const paFreq = tonicFrequency * 1.5;
        const saFreq = tonicFrequency;
        const lowSaFreq = tonicFrequency * 0.5;

        const stringFrequencies = [paFreq, saFreq, saFreq, lowSaFreq];
        let currentString = 0;

        const pluckString = (freq: number) => {
          if (ctx.state === 'closed') return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          // Sawtooth gives rich harmonics akin to jawari thread buzz
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          const now = ctx.currentTime;
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.exponentialRampToValueAtTime(0.3, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now);
          osc.stop(now + 3.0);
        };

        // Pluck strings sequentially every 800ms
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

  // Adjust Tanpura Volume
  const handleVolumeChange = (vol: number) => {
    setTanpuraVolume(vol);
    if (tanpuraNodesRef.current) {
      tanpuraNodesRef.current.masterGain.gain.setValueAtTime(vol, tanpuraNodesRef.current.ctx.currentTime);
    }
  };

  // Cleanup on unmount
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
    <div className={`glass-card p-6 rounded-2xl border border-amber-500/20 ${className}`}>
      {/* Header & Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Mic className="w-5 h-5 text-amber-400" />
            <span>Audio Capture & Practice Studio</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Sing with acoustic Tanpura drone or upload pre-recorded riyaz.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-[#090D16] p-1 rounded-xl border border-gray-800">
          <button
            onClick={() => setMode('record')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              mode === 'record'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Live Mic</span>
          </button>
          <button
            onClick={() => setMode('upload')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              mode === 'upload'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* Tanpura Drone Control Bar */}
      <div className="p-3.5 rounded-xl bg-[#090D16] border border-gray-800/80 flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleTanpura}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              isTanpuraActive 
                ? 'bg-rose-500 text-white animate-pulse' 
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>{isTanpuraActive ? 'Stop Tanpura Drone' : 'Start Tanpura Drone'}</span>
          </button>
          <span className="text-xs text-gray-400 font-mono">
            Sa: <strong className="text-amber-400">{tonicFrequency.toFixed(1)} Hz</strong>
          </span>
        </div>

        {isTanpuraActive && (
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-gray-400" />
            <input
              type="range"
              min="0.05"
              max="0.8"
              step="0.05"
              value={tanpuraVolume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-24 accent-amber-500 h-1 bg-gray-700 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] font-mono text-gray-400">{Math.round(tanpuraVolume * 100)}%</span>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {micError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{micError}</span>
        </div>
      )}

      {/* Main Recording / Upload Area */}
      {mode === 'record' ? (
        <div className="space-y-4">
          {/* Waveform Canvas */}
          <div className="h-28 w-full bg-[#090D16] rounded-xl border border-gray-800 overflow-hidden relative flex items-center justify-center">
            <canvas ref={canvasRef} width={600} height={112} className="w-full h-full" />

            {!isRecording && !audioUrl && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 text-xs gap-1.5 pointer-events-none">
                <Mic className="w-6 h-6 text-gray-600" />
                <span>Press Record to start singing</span>
              </div>
            )}

            {isRecording && (
              <div className="absolute top-3 right-3 flex items-center gap-2 bg-rose-950/80 px-2.5 py-1 rounded-full border border-rose-600/40 text-rose-400 text-xs font-mono font-bold">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>{formatSeconds(recordTime)}</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 pt-2">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-600 text-white font-bold text-sm shadow-lg shadow-rose-500/25 hover:scale-105 transition-all flex items-center gap-2"
              >
                <Mic className="w-4 h-4" />
                <span>Start Recording Riyaz</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="px-6 py-3 rounded-xl bg-gray-800 text-white font-bold text-sm border border-gray-700 hover:bg-gray-700 hover:scale-105 transition-all flex items-center gap-2 shadow-lg"
              >
                <Square className="w-4 h-4 text-rose-400 fill-rose-400" />
                <span>Stop & Analyze ({formatSeconds(recordTime)})</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* File Upload Mode */
        <div className="p-8 border-2 border-dashed border-gray-700 hover:border-amber-500/50 rounded-xl text-center transition-all bg-[#090D16]">
          <input
            type="file"
            id="audio-file-input"
            accept="audio/wav,audio/mp3,audio/mpeg,audio/flac,audio/ogg"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label htmlFor="audio-file-input" className="cursor-pointer flex flex-col items-center">
            <Upload className="w-10 h-10 text-amber-400 mb-3" />
            <span className="text-sm font-semibold text-white mb-1">Click to upload singing audio</span>
            <span className="text-xs text-gray-400">Supported formats: WAV, MP3, FLAC (Up to 50MB)</span>
          </label>
        </div>
      )}

      {/* Recorded Audio Preview */}
      {audioUrl && (
        <div className="mt-6 p-4 rounded-xl bg-[#090D16] border border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-xs font-semibold text-white">Audio Captured Successfully</div>
              <div className="text-[11px] text-gray-400 font-mono">Ready for full MIR pipeline analysis</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={togglePlayRecorded}
              className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
              title="Preview audio"
            >
              {isPlayingRecorded ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
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
