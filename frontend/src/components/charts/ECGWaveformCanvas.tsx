import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RefreshCw, Activity } from 'lucide-react';
import { Button } from '../common/Button';

interface ECGWaveformCanvasProps {
  waveformPoints?: number[];
  heartRate?: number;
  rhythmTitle?: string;
  prIntervalMs?: number;
  qrsDurationMs?: number;
  qtcIntervalMs?: number;
  rhythm?: string;
  isLive?: boolean;
}

export const ECGWaveformCanvas: React.FC<ECGWaveformCanvasProps> = ({
  waveformPoints,
  heartRate = 72,
  rhythmTitle = 'Lead II (25mm/s, 10mm/mV)',
  prIntervalMs,
  qrsDurationMs,
  qtcIntervalMs,
  rhythm = 'Normal Sinus Rhythm',
  isLive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(isLive);
  const [selectedLead, setSelectedLead] = useState<'Lead II' | 'Lead V1' | 'Lead V5'>('Lead II');
  const animationFrameRef = useRef<number | null>(null);
  const scanIndexRef = useRef<number>(0);

  // Default synthetic P-Q-R-S-T sequence if none provided
  const points = waveformPoints && waveformPoints.length > 0 ? waveformPoints : generateDefaultECG(heartRate);

  function generateDefaultECG(hr: number) {
    const pts: number[] = [];
    const len = 300;
    for (let i = 0; i < len; i++) {
      const t = (i % 100) / 100;
      let y = 0;
      if (t >= 0.12 && t <= 0.22) y += 0.15 * Math.sin(((t - 0.12) / 0.10) * Math.PI); // P
      else if (t >= 0.28 && t <= 0.31) y -= 0.15 * Math.sin(((t - 0.28) / 0.03) * Math.PI); // Q
      else if (t >= 0.31 && t <= 0.37) y += 1.2 * Math.sin(((t - 0.31) / 0.06) * Math.PI); // R
      else if (t >= 0.37 && t <= 0.41) y -= 0.35 * Math.sin(((t - 0.37) / 0.04) * Math.PI); // S
      else if (t >= 0.50 && t <= 0.68) y += 0.30 * Math.sin(((t - 0.50) / 0.18) * Math.PI); // T
      y += (Math.random() - 0.5) * 0.02;
      pts.push(y);
    }
    return pts;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = 180);

    const drawGrid = () => {
      ctx.fillStyle = '#060D1A'; // Deep cardiology dark monitor canvas
      ctx.fillRect(0, 0, width, height);

      // Minor grid (1mm equivalent)
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.08)';
      ctx.lineWidth = 0.6;
      for (let x = 0; x < width; x += 10) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 10) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Major grid (5mm equivalent)
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.2)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };

    const renderWaveform = () => {
      drawGrid();

      const centerY = height / 2;
      const amplitudeScale = height * 0.38;
      const stepX = width / points.length;

      ctx.beginPath();
      ctx.strokeStyle = '#10B981'; // Emerald clinical ECG trace
      ctx.lineWidth = 2.2;
      ctx.lineJoin = 'round';
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 6;

      for (let i = 0; i < points.length; i++) {
        const x = i * stepX;
        const val = points[i];
        const leadMultiplier = selectedLead === 'Lead V1' ? 0.8 : selectedLead === 'Lead V5' ? 1.15 : 1.0;
        const y = centerY - val * amplitudeScale * leadMultiplier;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw real-time Sweep bar if playing
      if (isPlaying) {
        scanIndexRef.current = (scanIndexRef.current + 2) % width;
        const scanX = scanIndexRef.current;

        // Erase trail bar
        ctx.fillStyle = 'rgba(6, 13, 26, 0.85)';
        ctx.fillRect(scanX, 0, 18, height);

        // Bright leading sweep line
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(scanX, 0);
        ctx.lineTo(scanX, height);
        ctx.stroke();
      }

      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(renderWaveform);
      }
    };

    renderWaveform();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [points, isPlaying, selectedLead]);

  return (
    <div className="bg-navy-950 rounded-2xl p-4 border border-slate-800 shadow-xl overflow-hidden relative">
      {/* Top Monitor Header */}
      <div className="flex items-center justify-between gap-3 mb-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-mono font-bold text-emerald-400 uppercase tracking-widest">{selectedLead}</span>
          <span className="text-slate-400 font-mono hidden sm:inline">• 25mm/s • 10mm/mV • Calibrated</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Lead Selector */}
          <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-700 text-[11px] font-mono">
            {(['Lead II', 'Lead V1', 'Lead V5'] as const).map((lead) => (
              <button
                key={lead}
                onClick={() => setSelectedLead(lead)}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  selectedLead === lead ? 'bg-cardio-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lead}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="w-full relative overflow-hidden rounded-xl">
        <canvas ref={canvasRef} className="w-full block" />
        
        {/* Real-time HR Readout HUD */}
        <div className="absolute top-2 right-3 flex items-baseline gap-1 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 pointer-events-none">
          <Activity className="w-4 h-4 text-pulse-500 animate-pulse-slow mr-1" />
          <span className="text-xl font-mono font-extrabold text-white tracking-tight">{heartRate}</span>
          <span className="text-[10px] font-mono text-slate-400 font-semibold">BPM</span>
        </div>
      </div>

      {/* Bottom telemetry line */}
      <div className="flex items-center justify-between mt-3 text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2">
        <span>Rhythm: <span className="text-slate-200 font-semibold">{rhythm}</span></span>
        <span>
          PR: <span className="text-sky-300">{prIntervalMs != null ? `${prIntervalMs} ms` : '--'}</span> | QRS:{' '}
          <span className="text-sky-300">{qrsDurationMs != null ? `${qrsDurationMs} ms` : '--'}</span> | QTc:{' '}
          <span className="text-sky-300">{qtcIntervalMs != null ? `${qtcIntervalMs} ms` : '--'}</span>
        </span>
      </div>
    </div>
  );
};

