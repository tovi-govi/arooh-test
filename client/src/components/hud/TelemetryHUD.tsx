import React, { useState, useEffect, useRef } from "react";

interface TelemetryHUDProps {
  progress: number;
  chapter: number;
  onJumpToChapter: (target: number) => void;
  onDownloadBrochure?: () => void;
  onOpenRegisterModal?: () => void;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  progress,
  onDownloadBrochure,
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

  // Pure 3D selling point: NO header at the very start (progress < 0.08)
  // At the start, the screen is 100% pure cinematic 3D darkness.
  // The header elements softly fade in only after the opening void (progress > 0.08).
  const headerOpacity = Math.max(0, Math.min(1, (progress - 0.08) / 0.06));
  const showHeader = headerOpacity > 0.01;

  return (
    <div className="telemetry-hud pointer-events-none fixed inset-0 z-30 select-none font-mono text-xs">
      {/* Top Header Group: Editorial Masthead & Actions (Hidden at start, fades in after progress > 0.08) */}
      <div
        style={{
          opacity: headerOpacity,
          pointerEvents: showHeader ? "auto" : "none",
          transform: `translateY(${(1 - headerOpacity) * -10}px)`,
          transition: "opacity 0.25s ease-out, transform 0.25s ease-out",
        }}
      >
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
        <div className="absolute top-6 right-6 sm:right-10 flex items-center gap-4">
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
            onClick={onDownloadBrochure || onOpenRegisterModal}
            className="px-3.5 sm:px-4 py-2 bg-[#ff1744] hover:bg-[#ff3b42] text-white font-mono font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,23,68,0.5),3px_3px_0_#000] flex items-center gap-1.5 active:translate-y-0.5"
            title="Download Official AROOH 2026 Brochure"
          >
            <span>DOWNLOAD BROCHURE</span>
            <span className="text-[13px] leading-none">↓</span>
          </button>
        </div>
      </div>

      {/* Hairline Bottom Progress Indicator (Hidden at start, fades in after progress > 0.05) */}
      <div
        style={{ opacity: Math.max(0, Math.min(1, (progress - 0.05) / 0.05)) }}
        className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white/10 transition-opacity"
      >
        <div
          className="h-full bg-[#ff1744] transition-all duration-75 shadow-[0_0_10px_#ff1744]"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
};
