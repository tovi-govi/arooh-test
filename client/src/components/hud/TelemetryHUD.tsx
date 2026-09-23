import React, { useState, useEffect, useRef } from "react";

interface TelemetryHUDProps {
  progress: number;
  chapter: number;
  onJumpToChapter: (target: number) => void;
  onOpenRegisterModal: () => void;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  progress,
  onOpenRegisterModal,
}) => {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const droneOscRef = useRef<OscillatorNode | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);

  const toggleAudio = () => {
    if (!audioEnabled) {
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(45, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(110, ctx.currentTime);

        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.025, ctx.currentTime + 1.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        audioCtxRef.current = ctx;
        droneOscRef.current = osc;
        droneGainRef.current = gain;
        setAudioEnabled(true);
      } catch {
        console.warn("Audio Context unavailable");
      }
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setAudioEnabled(false);
    }
  };

  useEffect(() => {
    if (droneOscRef.current && audioCtxRef.current && audioEnabled) {
      const targetFreq = 45 + progress * 55;
      droneOscRef.current.frequency.setTargetAtTime(targetFreq, audioCtxRef.current.currentTime, 0.15);
    }
  }, [progress, audioEnabled]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  return (
    <div className="telemetry-hud pointer-events-none fixed inset-0 z-30 select-none font-mono text-xs">
      {/* Top Left: Editorial Masthead */}
      <div className="absolute top-6 left-6 sm:left-10 flex items-center gap-3">
        <div className="font-['Anton'] text-2xl sm:text-3xl tracking-wider text-[#f4efe3] drop-shadow-[2px_2px_0_#000]">
          AROOH
        </div>
        <span className="hidden sm:inline-block w-[1px] h-4 bg-[#ff1744]/40" />
        <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-[0.25em] text-[#f4efe3]/80">
          MIT ADT // 14—15 NOV 2026
        </span>
      </div>

      {/* Top Right: Sound & Action */}
      <div className="absolute top-6 right-6 sm:right-10 flex items-center gap-4 pointer-events-auto">
        <button
          onClick={toggleAudio}
          className={`px-2 py-1 text-[10px] font-mono tracking-widest uppercase transition-all flex items-center gap-1.5 ${
            audioEnabled
              ? "text-[#ff1744] border-b border-[#ff1744] drop-shadow-[0_0_8px_rgba(255,23,68,0.6)]"
              : "text-[#f4efe3]/50 hover:text-[#f4efe3]"
          }`}
          title="Toggle ambient drone audio"
        >
          <span>{audioEnabled ? "SOUND ON" : "SOUND OFF"}</span>
        </button>

        <button
          onClick={onOpenRegisterModal}
          className="px-5 py-2 bg-[#ff1744] hover:bg-[#ff3b42] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,23,68,0.4),3px_3px_0_#000]"
        >
          REGISTER ↗
        </button>
      </div>

      {/* Hairline Bottom Progress Indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white/10">
        <div
          className="h-full bg-[#ff1744] transition-all duration-75 shadow-[0_0_10px_#ff1744]"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
};
