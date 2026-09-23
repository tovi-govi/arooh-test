import React, { useState, useRef, useEffect } from "react";
import { SCHEDULE_DATA, SPONSORS, TrackItem } from "../scene/sceneData";
import { ArenaSelectionHub } from "./ArenaSelectionHub";
import TextLoop from "../ui/TextLoop";

interface NarrativeLayersProps {
  progress: number;
  onHoverTrack?: (id: string | null) => void;
  onSelectTrack: (track: TrackItem) => void;
  onJumpToProgress: (target: number) => void;
  onDownloadBrochure?: () => void;
  onOpenRegisterModal?: (trackTitle?: string) => void;
  registeredTrackDefault?: string;
}

interface TimelineCardProps {
  children: React.ReactNode;
  className?: string;
  isGold?: boolean;
  hasDropLine?: boolean;
}

const TimelineCard: React.FC<TimelineCardProps> = ({
  children,
  className = "",
  isGold = false,
  hasDropLine = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Subtle, responsive tilt between -6 and 6 degrees
    const rotateX = ((centerY - y) / centerY) * 6;
    const rotateY = ((x - centerX) / centerX) * 6;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const bracketColor = isGold ? "border-[#ffd600]" : "border-[#ff1744]";
  const glowShadow = isGold
    ? "0 20px 50px -10px rgba(0, 0, 0, 0.95), 0 0 35px rgba(255, 214, 0, 0.35)"
    : "0 20px 50px -10px rgba(0, 0, 0, 0.95), 0 0 35px rgba(255, 23, 68, 0.3)";

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isHovered
          ? `perspective(900px) rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg) translateY(-6px) scale(1.02)`
          : "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)",
        boxShadow: isHovered ? glowShadow : undefined,
        zIndex: isHovered ? 40 : undefined,
        transition: isHovered ? "transform 0.1s ease-out" : "transform 0.4s cubic-bezier(0.2, 0.9, 0.3, 1), box-shadow 0.4s ease",
      }}
      className={`relative flex-shrink-0 cyber-grid-bg select-none transition-colors ${isGold ? "cyber-card-gold" : "cyber-card"
        } ${className}`}
    >
      {/* Laser Drop-Line from Horizontal Rail */}
      {hasDropLine && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-0">
          <div
            className={`w-[2px] h-7 ${isGold
                ? "bg-gradient-to-b from-[#ffd600]/80 via-[#ffd600] to-[#ffd600]/40 shadow-[0_0_8px_#ffd600]"
                : "bg-gradient-to-b from-[#ff1744]/80 via-[#ff1744] to-[#ff1744]/40 shadow-[0_0_8px_#ff1744]"
              }`}
          />
          <div
            className={`w-2.5 h-2.5 rounded-full ring-2 ring-black -mt-1 ${isGold
                ? "bg-[#ffd600] shadow-[0_0_10px_#ffd600]"
                : "bg-[#ff1744] shadow-[0_0_10px_#ff1744]"
              }`}
          />
        </div>
      )}

      {/* Cybernetic Corner Brackets */}
      <span className={`absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t-2 border-l-2 ${bracketColor} pointer-events-none opacity-80`} />
      <span className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t-2 border-r-2 ${bracketColor} pointer-events-none opacity-80`} />
      <span className={`absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b-2 border-l-2 ${bracketColor} pointer-events-none opacity-80`} />
      <span className={`absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b-2 border-r-2 ${bracketColor} pointer-events-none opacity-80`} />

      {/* Card Content with 3D depth */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
};

export const NarrativeLayers: React.FC<NarrativeLayersProps> = ({
  progress,
  onHoverTrack,
  onSelectTrack,
  onJumpToProgress,
  onDownloadBrochure,
  onOpenRegisterModal,
}) => {
  const timelineTrackRef = useRef<HTMLDivElement>(null);
  const [maxScrollX, setMaxScrollX] = useState(2600);

  const getWindowStyle = (
    start: number,
    peakStart: number,
    peakEnd: number,
    end: number
  ) => {
    if (progress < start || progress > end) {
      return { opacity: 0, transform: "translateY(24px) scale(0.97)", pointerEvents: "none" as const, visible: false, willChange: "transform, opacity" };
    }
    let opacity = 0;
    if (progress < peakStart) {
      opacity = (progress - start) / (peakStart - start);
    } else if (progress <= peakEnd) {
      opacity = 1;
    } else {
      opacity = 1 - (progress - peakEnd) / (end - peakEnd);
    }
    const translateY = (1 - opacity) * 20;
    const scale = 0.97 + opacity * 0.03;
    return {
      opacity: Math.max(0, Math.min(1, opacity)),
      transform: `translateY(${translateY}px) scale(${scale})`,
      pointerEvents: opacity > 0.4 ? ("auto" as const) : ("none" as const),
      visible: true,
      willChange: "transform, opacity",
    };
  };

  // 1. OPENING (0.00 - 0.12)
  const voidStyle = getWindowStyle(-0.05, 0.0, 0.08, 0.13);

  // 2. IT WAKES UP (0.13 - 0.30)
  const signalStyle = getWindowStyle(0.12, 0.18, 0.26, 0.32);

  // 3. SCALE / CONVERGENCE (0.30 - 0.46)
  const formationStyle = getWindowStyle(0.30, 0.35, 0.42, 0.46);

  // 4. AROOH REVEAL (0.46 - 0.64) - Placed cleanly below the 3D monument
  const revealStyle = getWindowStyle(0.46, 0.49, 0.57, 0.64);

  // 5. ARENAS (0.64 - 0.77) - Completely clears out before the timeline buffer
  const tracksStyle = getWindowStyle(0.64, 0.68, 0.73, 0.77);

  // Buffer Zone: 0.77 to 0.83 (Clear, spacious scroll runway between Events and Timeline)

  // 6. SCHEDULE & TIMELINE (0.80 - 1.00) - Unobstructed horizontal timeline
  const scheduleStyle = getWindowStyle(0.80, 0.83, 1.05, 1.10);

  useEffect(() => {
    if (!timelineTrackRef.current) return;
    const el = timelineTrackRef.current;

    const updateMaxScroll = () => {
      const totalW = el.scrollWidth;
      const viewW = window.innerWidth;
      setMaxScrollX(Math.max(0, totalW - viewW + 140));
    };

    updateMaxScroll();
    const ro = new ResizeObserver(updateMaxScroll);
    ro.observe(el);
    window.addEventListener("resize", updateMaxScroll);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateMaxScroll);
    };
  }, [scheduleStyle.visible]);

  // Horizontal timeline progress:
  // Generous dwell zone from 0.82 to 0.88 (translateX = 0) so visitors have ample time
  // to view and read the entire Day 1 sequence before the timeline begins scrolling
  const timelineScrollStart = 0.88;
  const timelineScrollEnd = 0.99;
  const timelineProgress = progress <= timelineScrollStart
    ? 0
    : Math.min(1, (progress - timelineScrollStart) / (timelineScrollEnd - timelineScrollStart));
  const horizontalTranslateX = -timelineProgress * maxScrollX;

  // Active milestone phase
  const currentPhase: "day1" | "day2" | "backers" | "finale" =
    timelineProgress < 0.25 ? "day1" : timelineProgress < 0.65 ? "day2" : timelineProgress < 0.90 ? "backers" : "finale";

  return (
    <div className="narrative-overlay fixed inset-0 z-20 pointer-events-none flex flex-col justify-center items-center text-[#f4efe3]">
      {/* CHAPTER 1: THE OPENING (0.00 - 0.12) - Quiet, confident, mysterious */}
      {voidStyle.visible && (
        <div
          style={{
            opacity: voidStyle.opacity,
            transform: voidStyle.transform,
            pointerEvents: voidStyle.pointerEvents,
          }}
          className="absolute bottom-12 sm:bottom-16 left-6 sm:left-14 max-w-sm pointer-events-auto"
        >
          <div className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-wider text-[#f4efe3] mb-1 drop-shadow-[2px_2px_0_#000]">
            Something is forming.
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-[#ff1744] drop-shadow-[0_0_12px_rgba(255,23,68,0.7)]">
            <span>Keep scrolling</span>
            <span className="inline-block animate-bounce">↓</span>
          </div>
        </div>
      )}

      {/* CHAPTER 2: IT WAKES UP (0.13 - 0.30) - Asymmetric manga editorial anchored left */}
      {signalStyle.visible && (
        <div
          style={{
            opacity: signalStyle.opacity,
            transform: signalStyle.transform,
            pointerEvents: signalStyle.pointerEvents,
          }}
          className="absolute left-6 sm:left-14 top-1/2 -translate-y-1/2 max-w-xl text-left pointer-events-auto"
        >
          <div className="font-['Anton'] text-7xl sm:text-9xl text-[#ff1744]/15 leading-none select-none -mb-6 sm:-mb-10 font-bold">
            01
          </div>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-['Anton'] uppercase tracking-tight text-[#f4efe3] leading-none mb-4 drop-shadow-[4px_4px_0_#000]">
            It Wakes <span className="text-[#ff1744] drop-shadow-[0_0_25px_rgba(255,23,68,0.7)]">Up.</span>
          </h2>
          <p className="text-sm sm:text-base text-[#f4efe3]/85 font-sans max-w-md leading-relaxed mb-4">
            A pulse in the dark. 36 hours of pure technical rebellion at MIT ADT Pune.
          </p>
          <div className="inline-flex items-center gap-3 text-xs font-mono text-[#ff1744] border-b border-[#ff1744] pb-1">
            <span className="font-bold text-[#ff1744]">14—15 NOV 2026</span>
            <span className="text-white/40">//</span>
            <span className="text-[#f4efe3]">PUNE, INDIA</span>
          </div>
        </div>
      )}

      {/* CHAPTER 3: BUILT AT FULL SPEED (0.30 - 0.46) - Asymmetric anchored right with Vibrant Red & Dark Ink Theme */}
      {formationStyle.visible && (
        <div
          style={{
            opacity: formationStyle.opacity,
            transform: formationStyle.transform,
            pointerEvents: formationStyle.pointerEvents,
          }}
          className="absolute right-6 sm:right-14 top-1/2 -translate-y-1/2 max-w-lg text-left sm:text-right pointer-events-auto"
        >
          <div className="font-['Anton'] text-7xl sm:text-9xl text-[#ff1744]/15 leading-none select-none -mb-4 sm:-mb-8 font-bold">
            02
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-['Anton'] uppercase tracking-tight text-[#f4efe3] mb-6 drop-shadow-[4px_4px_0_#000]">
            Built At <span className="text-[#ff1744] drop-shadow-[0_0_25px_rgba(255,23,68,0.7)]">Full Speed.</span>
          </h2>
          <div className="space-y-4 font-mono">
            {/* Stat 1: Cash Bounty Pool - Vibrant Crimson Red */}
            <div className="border-l-2 sm:border-l-0 sm:border-r-2 border-[#ff1744] pl-3 sm:pl-0 sm:pr-3 bg-black/40 backdrop-blur-sm py-1">
              <div className="text-4xl sm:text-6xl font-['Anton'] text-[#ff1744] leading-none drop-shadow-[0_0_25px_rgba(255,23,68,0.7)]">
                ₹8,00,000
              </div>
              <div className="text-[11px] uppercase tracking-widest text-[#f4efe3]/90 mt-1 font-semibold">
                Cash Bounty Pool
              </div>
            </div>
            {/* Stat 2: 36 Hours - Crisp Titanium with Red Accent */}
            <div className="border-l-2 sm:border-l-0 sm:border-r-2 border-[#ff1744]/60 pl-3 sm:pl-0 sm:pr-3 bg-black/40 backdrop-blur-sm py-1">
              <div className="text-3xl sm:text-5xl font-['Anton'] text-[#f4efe3] leading-none drop-shadow-[0_0_20px_rgba(255,23,68,0.3)]">
                36 HOURS
              </div>
              <div className="text-[11px] uppercase tracking-widest text-[#ff1744] mt-1 font-semibold">
                Non-Stop Hackathon
              </div>
            </div>
            {/* Stat 3: 2,500+ Builders - Crisp Titanium */}
            <div className="border-l-2 sm:border-l-0 sm:border-r-2 border-[#ff1744]/60 pl-3 sm:pl-0 sm:pr-3 bg-black/40 backdrop-blur-sm py-1">
              <div className="text-3xl sm:text-5xl font-['Anton'] text-[#f4efe3] leading-none drop-shadow-[0_0_20px_rgba(255,23,68,0.3)]">
                2,500+
              </div>
              <div className="text-[11px] uppercase tracking-widest text-[#f4efe3]/90 mt-1 font-semibold">
                Builders On Campus
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHAPTER 4: AROOH REVEAL (0.46 - 0.64) - Lower-third frosted cyberpunk card avoiding 3D letter overlap */}
      {revealStyle.visible && (
        <div
          style={{
            opacity: revealStyle.opacity,
            transform: revealStyle.transform,
            pointerEvents: revealStyle.pointerEvents,
          }}
          className="fixed bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-2xl px-6 py-5 sm:py-6 text-center pointer-events-auto bg-[#0a0a10]/90 backdrop-blur-2xl border border-[#ff1744]/40 shadow-[0_0_50px_rgba(0,0,0,0.95),0_0_30px_rgba(255,23,68,0.25)] rounded-none"
        >
          {/* Tactical Telemetry Header */}
          <div className="flex items-center justify-center gap-2 font-mono text-[10px] tracking-[0.25em] text-[#ff1744] uppercase mb-2">
            <span className="w-1.5 h-1.5 bg-[#ff1744] rounded-full animate-ping" />
            <span>AROOH PROTOCOL // 03</span>
          </div>

          <h2 className="text-xl sm:text-3xl md:text-4xl font-['Anton'] uppercase tracking-tight text-[#f4efe3] mb-2 leading-tight drop-shadow-[2px_2px_0_#000]">
            For Those Who <span className="text-[#ff1744] drop-shadow-[0_0_20px_rgba(255,23,68,0.7)]">Break Things</span> To See How They Work.
          </h2>

          <p className="text-xs sm:text-sm text-[#f4efe3]/80 max-w-lg mx-auto leading-relaxed mb-4 font-sans">
            Six arenas. Two days. No compromises.
          </p>

          <div className="flex items-center justify-center gap-4 font-mono text-xs">
            <button
              onClick={() => onJumpToProgress(0.72)}
              className="px-6 py-2.5 bg-[#ff1744] hover:bg-[#ff3b42] text-white font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,23,68,0.5),3px_3px_0_#000]"
            >
              EXPLORE ARENAS ↓
            </button>
            <button
              onClick={() => (onDownloadBrochure ? onDownloadBrochure() : onJumpToProgress(0.92))}
              className="px-6 py-2.5 border border-[#ff1744] bg-black/80 text-[#f4efe3] hover:bg-[#ff1744] hover:text-white font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,23,68,0.3),3px_3px_0_#000] flex items-center gap-2"
            >
              <span>DOWNLOAD BROCHURE</span>
              <span>↓</span>
            </button>
          </div>
        </div>
      )}

      {/* CHAPTER 5: ARENAS & TRACKS (0.64 - 0.81) */}
      {tracksStyle.visible && (
        <div
          style={{
            opacity: tracksStyle.opacity,
            transform: tracksStyle.transform,
            pointerEvents: tracksStyle.pointerEvents,
          }}
          className="w-full max-w-7xl px-2 sm:px-6 pointer-events-auto overflow-y-auto max-h-[88vh] py-3"
        >
          <ArenaSelectionHub
            onHoverTrack={onHoverTrack}
            onSelectTrack={onSelectTrack}
          />
        </div>
      )}

      {/* CHAPTER 6: HORIZONTAL TIMELINE & RUN OF SHOW (0.80 - 1.00) */}
      {scheduleStyle.visible && (
        <div
          style={{
            opacity: scheduleStyle.opacity,
            pointerEvents: scheduleStyle.pointerEvents,
          }}
          className="fixed inset-0 pointer-events-auto flex flex-col justify-between select-none overflow-hidden z-20 bg-[#060609]/85 backdrop-blur-md"
        >
          {/* Top HUD: Title, Station Scrubber & Quick Jumps */}
          <div className="pt-20 sm:pt-24 px-6 sm:px-14 flex flex-col sm:flex-row sm:items-end justify-between gap-4 z-30 pointer-events-auto">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-[#ff1744] uppercase mb-1">
                <span className="w-1.5 h-1.5 bg-[#ff1744] rounded-full animate-ping" />
                <span>05 // HORIZONTAL CHRONO-TIMELINE</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-['Anton'] uppercase tracking-tight text-[#f4efe3] leading-none">
                The Sequence // <span className="text-[#ff1744] drop-shadow-[0_0_20px_rgba(255,23,68,0.7)]">36H</span>
              </h2>
            </div>

            {/* Quick Milestone Jumps & Live Scrubber */}
            <div className="flex flex-col sm:items-end gap-2 font-mono">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => onJumpToProgress(0.85)}
                  className={`px-3 py-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all border ${currentPhase === "day1"
                      ? "bg-[#ff1744] border-[#ff1744] text-white shadow-[0_0_15px_rgba(255,23,68,0.6)]"
                      : "bg-black/70 border-white/20 text-[#f4efe3]/60 hover:text-white"
                    }`}
                >
                  01 // DAY 1
                </button>
                <button
                  onClick={() => onJumpToProgress(0.92)}
                  className={`px-3 py-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all border ${currentPhase === "day2"
                      ? "bg-[#ff1744] border-[#ff1744] text-white shadow-[0_0_15px_rgba(255,23,68,0.6)]"
                      : "bg-black/70 border-white/20 text-[#f4efe3]/60 hover:text-white"
                    }`}
                >
                  02 // DAY 2
                </button>
                <button
                  onClick={() => onJumpToProgress(0.96)}
                  className={`px-3 py-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all border ${currentPhase === "backers"
                      ? "bg-[#ff1744] border-[#ff1744] text-white shadow-[0_0_15px_rgba(255,23,68,0.6)]"
                      : "bg-black/70 border-white/20 text-[#f4efe3]/60 hover:text-white"
                    }`}
                >
                  03 // PARTNERS
                </button>
                <button
                  onClick={() => onJumpToProgress(1.00)}
                  className={`px-3 py-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all border ${currentPhase === "finale"
                      ? "bg-[#ff1744] border-[#ff1744] text-white shadow-[0_0_15px_rgba(255,23,68,0.6)]"
                      : "bg-black/70 border-white/20 text-[#f4efe3]/60 hover:text-white"
                    }`}
                >
                  04 // FINALE
                </button>

                {/* Left & Right Steppers */}
                <div className="flex items-center gap-1 ml-1 sm:ml-2">
                  <button
                    onClick={() => onJumpToProgress(Math.max(0.85, progress - 0.035))}
                    aria-label="Scroll left"
                    className="w-7 h-7 flex items-center justify-center border border-white/20 bg-black/80 hover:border-[#ff1744] hover:text-[#ff1744] text-white/70 transition-all font-mono text-xs"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => onJumpToProgress(Math.min(1.00, progress + 0.035))}
                    aria-label="Scroll right"
                    className="w-7 h-7 flex items-center justify-center border border-white/20 bg-black/80 hover:border-[#ff1744] hover:text-[#ff1744] text-white/70 transition-all font-mono text-xs"
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[10px] text-white/50 tracking-widest uppercase">
                <span>SCROLL DOWN / SWIPE TO ADVANCE TIMELINE</span>
                <span className="text-[#ff1744] font-bold animate-pulse">→</span>
              </div>
            </div>
          </div>

          {/* Thin Horizontal Cyber Progress Rail */}
          <div className="mx-6 sm:mx-14 my-3 h-[2px] bg-white/10 relative overflow-hidden z-30">
            <div
              className="h-full bg-[#ff1744] shadow-[0_0_12px_#ff1744] transition-all duration-75"
              style={{ width: `${timelineProgress * 100}%` }}
            />
          </div>

          {/* Center: The Continuous Horizontal Timeline Ribbon */}
          <div className="relative w-full flex-1 flex items-center overflow-x-visible overflow-y-hidden my-auto pt-7 pb-2">
            {/* The Horizontal Timeline Connecting Axis Line */}
            <div className="absolute top-[36px] left-0 right-0 h-[2px] bg-gradient-to-r from-[#ff1744]/20 via-[#ff1744]/80 to-[#ff1744]/20 shadow-[0_0_10px_rgba(255,23,68,0.6)] pointer-events-none z-0" />

            {/* Ambient Kinetic TextLoop Wave - flowing smoothly left to right in the background */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0 opacity-30">
              <TextLoop
                text="AROOH // 2026"
                shape="wave"
                speed={45}
                direction="forward"
                separator="✦ 36H MELEE ✦ MIT ADT PUNE ✦ ₹8L POOL ✦ ENTER THE ARENAS ✦"
                curviness={50}
                fontSize={22}
                fontWeight={700}
                letterSpacing={2}
                uppercase
                color="rgba(244, 239, 227, 0.7)"
                ribbon
                ribbonColor="rgba(255, 23, 68, 0.25)"
                ribbonWidth={38}
                pauseOnHover={false}
                preserveAspectRatio="none"
                className="w-full h-full"
              />
            </div>

            <div
              ref={timelineTrackRef}
              style={{
                transform: `translateX(${horizontalTranslateX}px)`,
                willChange: "transform",
              }}
              className="flex items-stretch gap-6 px-6 sm:px-14 flex-nowrap z-10"
            >
              {/* STAGE 1 BADGE: DAY 01 */}
              <TimelineCard className="w-[320px] sm:w-[350px] h-[430px] sm:h-[460px] max-h-[64vh] p-5 sm:p-6 bg-[#08080e] border-[#ff1744]">
                <div>
                  {/* Milestone Junction Diode */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ff1744] shadow-[0_0_10px_#ff1744] ring-4 ring-[#ff1744]/30 animate-pulse" />
                      <span className="font-mono text-[10px] tracking-widest text-[#ff1744] uppercase font-bold">
                        MILESTONE // STAGE 01
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-white/50 tracking-wider">FRI 14 NOV</span>
                  </div>

                  <div>
                    <span className="inline-block px-2.5 py-0.5 bg-[#ff1744] text-white font-mono font-bold text-[10px] uppercase tracking-widest mb-2 shadow-[0_0_12px_rgba(255,23,68,0.5)]">
                      PHASE 01 // 36H MELEE
                    </span>
                    <div className="text-4xl sm:text-5xl font-['Anton'] uppercase text-white leading-none mb-1">
                      DAY 01
                    </div>
                    <div className="font-mono text-xs font-bold text-[#ff1744] tracking-wider mb-2">
                      FRI 14 NOV 2026 // IGNITION
                    </div>
                    <p className="text-xs text-[#f4efe3]/80 leading-relaxed font-sans mb-3">
                      36-hour non-stop engineering marathon begins. API gateways unlock, hardware kits handed over, mentorship pods activate, and midnight sprint shifts begin.
                    </p>
                  </div>

                  {/* Operational Telemetry Summary Chips */}
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px] text-[#f4efe3]/90">
                    <div className="p-1.5 bg-white/5 border border-white/10">
                      <span className="text-[#ff1744] block font-bold">STATIONS:</span>
                      <span>5 IN SEQUENCE</span>
                    </div>
                    <div className="p-1.5 bg-white/5 border border-white/10">
                      <span className="text-[#ff1744] block font-bold">ROSTER:</span>
                      <span>800+ BUILDERS</span>
                    </div>
                    <div className="p-1.5 bg-white/5 border border-white/10 col-span-2">
                      <span className="text-[#ff1744] block font-bold">PROTOCOLS:</span>
                      <span>COMBAT LABS & HARDWARE MELEE</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[10px] font-mono text-white/50">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ACTIVE SPRINT
                  </span>
                  <span className="text-[#ff1744] font-bold">SCROLL RIGHT →</span>
                </div>
              </TimelineCard>

              {/* DAY 01 EVENT CARDS */}
              {SCHEDULE_DATA.day1.map((item, idx) => (
                <TimelineCard
                  key={`day1-${idx}`}
                  className="w-[290px] sm:w-[330px] h-[430px] sm:h-[460px] max-h-[64vh] p-5 group bg-[#08080e] border-white/10"
                >
                  <div>
                    {/* Station Node Header */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ff1744] shadow-[0_0_8px_#ff1744] group-hover:scale-125 transition-transform" />
                        <span className="text-[10px] font-mono text-[#ff1744] tracking-wider font-bold">
                          CHECKPOINT 0{idx + 1}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-white/40">DAY 01</span>
                    </div>

                    <div className="text-3xl sm:text-4xl font-['Anton'] text-[#ff1744] tracking-wide mb-1 drop-shadow-[0_0_12px_rgba(255,23,68,0.5)]">
                      {item.time}
                    </div>
                    <h3 className="text-base font-bold text-[#f4efe3] uppercase tracking-tight mb-1 leading-snug group-hover:text-white transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#f4efe3]/75 leading-relaxed font-sans mb-3 line-clamp-2">
                      {item.desc}
                    </p>

                    {/* Enriched Operational Telemetry Chips */}
                    <div className="space-y-1.5 font-mono text-[9px]">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 text-[#f4efe3]/90">
                        <span className="text-[#ff1744] font-bold">LOC:</span>
                        <span className="truncate">{item.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 text-[#f4efe3]/90">
                        <span className="text-[#ff1744] font-bold">SPEC:</span>
                        <span className="truncate">{item.tag}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 text-[#f4efe3]/90">
                        <span className="text-[#ff1744] font-bold">METRIC:</span>
                        <span className="truncate">{item.metric}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-white/10 flex items-center justify-between font-mono text-[10px] text-white/40 uppercase">
                    <span>ARENA PROTOCOL</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {item.status}
                    </span>
                  </div>
                </TimelineCard>
              ))}

              {/* STAGE 2 BADGE: DAY 02 */}
              <TimelineCard className="w-[320px] sm:w-[350px] h-[430px] sm:h-[460px] max-h-[64vh] p-5 sm:p-6 bg-[#08080e] border-[#ff1744]">
                <div>
                  {/* Milestone Junction Diode */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ff1744] shadow-[0_0_10px_#ff1744] ring-4 ring-[#ff1744]/30 animate-pulse" />
                      <span className="font-mono text-[10px] tracking-widest text-[#ff1744] uppercase font-bold">
                        MILESTONE // STAGE 02
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-white/50 tracking-wider">SAT 15 NOV</span>
                  </div>

                  <div>
                    <span className="inline-block px-2.5 py-0.5 bg-[#ff1744] text-white font-mono font-bold text-[10px] uppercase tracking-widest mb-2 shadow-[0_0_12px_rgba(255,23,68,0.5)]">
                      PHASE 02 // THE CLIMAX
                    </span>
                    <div className="text-4xl sm:text-5xl font-['Anton'] uppercase text-white leading-none mb-1">
                      DAY 02
                    </div>
                    <div className="font-mono text-xs font-bold text-[#ff1744] tracking-wider mb-2">
                      SAT 15 NOV 2026 // CLIMAX
                    </div>
                    <p className="text-xs text-[#f4efe3]/80 leading-relaxed font-sans mb-3">
                      Code freeze at high noon. Stadium pitches before venture partner juries, live CTF final attack blitz, and ₹8,00,000 in grand honors and trophies.
                    </p>
                  </div>

                  {/* Operational Telemetry Summary Chips */}
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px] text-[#f4efe3]/90">
                    <div className="p-1.5 bg-white/5 border border-white/10">
                      <span className="text-[#ff1744] block font-bold">STATIONS:</span>
                      <span>5 IN SEQUENCE</span>
                    </div>
                    <div className="p-1.5 bg-white/5 border border-white/10">
                      <span className="text-[#ffd600] block font-bold">BOUNTY:</span>
                      <span>₹8,00,000 CASH</span>
                    </div>
                    <div className="p-1.5 bg-white/5 border border-white/10 col-span-2">
                      <span className="text-[#ff1744] block font-bold">EVALUATION:</span>
                      <span>14 VC PARTNERS & JURY PODS</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[10px] font-mono text-white/50">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ffd600] animate-pulse" />
                    FINALS RUNTIME
                  </span>
                  <span className="text-[#ff1744] font-bold">SCROLL RIGHT →</span>
                </div>
              </TimelineCard>

              {/* DAY 02 EVENT CARDS */}
              {SCHEDULE_DATA.day2.map((item, idx) => {
                const isAward = item.title.includes("Awards");
                return (
                  <TimelineCard
                    key={`day2-${idx}`}
                    isGold={isAward}
                    className={`w-[290px] sm:w-[330px] h-[430px] sm:h-[460px] max-h-[64vh] p-5 group ${isAward
                        ? "bg-[#0f0c06] border-[#ffd600]/40"
                        : "bg-[#08080e] border-white/10"
                      }`}
                  >
                    <div>
                      {/* Station Node Header */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${isAward
                                ? "bg-[#ffd600] shadow-[0_0_10px_#ffd600] animate-ping"
                                : "bg-[#ff1744] shadow-[0_0_8px_#ff1744] group-hover:scale-125 transition-transform"
                              }`}
                          />
                          <span
                            className={`text-[10px] font-mono tracking-wider font-bold ${isAward ? "text-[#ffd600]" : "text-[#ff1744]"
                              }`}
                          >
                            {isAward ? "CLIMAX CHECKPOINT" : `CHECKPOINT 0${idx + 1}`}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-white/40">DAY 02</span>
                      </div>

                      <div
                        className={`text-3xl sm:text-4xl font-['Anton'] tracking-wide mb-1 ${isAward
                            ? "text-[#ffd600] drop-shadow-[0_0_15px_rgba(255,214,0,0.6)]"
                            : "text-[#ff1744] drop-shadow-[0_0_12px_rgba(255,23,68,0.5)]"
                          }`}
                      >
                        {item.time}
                      </div>
                      <h3
                        className={`text-base font-bold uppercase tracking-tight mb-1 leading-snug transition-colors ${isAward ? "text-[#ffd600]" : "text-[#f4efe3] group-hover:text-white"
                          }`}
                      >
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#f4efe3]/75 leading-relaxed font-sans mb-3 line-clamp-2">
                        {item.desc}
                      </p>

                      {/* Enriched Operational Telemetry Chips */}
                      <div className="space-y-1.5 font-mono text-[9px]">
                        <div
                          className={`flex items-center gap-1.5 px-2 py-1 border ${isAward
                              ? "bg-[#ffd600]/10 border-[#ffd600]/30 text-[#f4efe3]"
                              : "bg-white/5 border-white/10 text-[#f4efe3]/90"
                            }`}
                        >
                          <span className={isAward ? "text-[#ffd600] font-bold" : "text-[#ff1744] font-bold"}>
                            LOC:
                          </span>
                          <span className="truncate">{item.location}</span>
                        </div>
                        <div
                          className={`flex items-center gap-1.5 px-2 py-1 border ${isAward
                              ? "bg-[#ffd600]/10 border-[#ffd600]/30 text-[#f4efe3]"
                              : "bg-white/5 border-white/10 text-[#f4efe3]/90"
                            }`}
                        >
                          <span className={isAward ? "text-[#ffd600] font-bold" : "text-[#ff1744] font-bold"}>
                            SPEC:
                          </span>
                          <span className="truncate">{item.tag}</span>
                        </div>
                        <div
                          className={`flex items-center gap-1.5 px-2 py-1 border ${isAward
                              ? "bg-[#ffd600]/10 border-[#ffd600]/30 text-[#f4efe3]"
                              : "bg-white/5 border-white/10 text-[#f4efe3]/90"
                            }`}
                        >
                          <span className={isAward ? "text-[#ffd600] font-bold" : "text-[#ff1744] font-bold"}>
                            METRIC:
                          </span>
                          <span className="truncate">{item.metric}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-white/10 flex items-center justify-between font-mono text-[10px] text-white/40 uppercase">
                      <span>{isAward ? "ESCROW VERIFIED" : "ARENA PROTOCOL"}</span>
                      <span
                        className={`font-bold flex items-center gap-1.5 ${isAward ? "text-[#ffd600]" : "text-emerald-400"
                          }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full animate-pulse ${isAward ? "bg-[#ffd600]" : "bg-emerald-400"
                            }`}
                        />
                        {item.status}
                      </span>
                    </div>
                  </TimelineCard>
                );
              })}

              {/* STAGE 3: BACKERS & PARTNER ECOSYSTEM */}
              <TimelineCard className="w-[580px] sm:w-[660px] h-[430px] sm:h-[460px] max-h-[64vh] p-5 sm:p-6 bg-[#08080e] border-white/15">
                <div>
                  {/* Milestone Junction Diode */}
                  <div className="flex items-center justify-between border-b border-white/15 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ff1744] shadow-[0_0_8px_#ff1744]" />
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff1744] font-bold">
                        STAGE 03 // PARTNER ECOSYSTEM
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      7 ENTERPRISE NODES
                    </span>
                  </div>

                  {/* Hero Command Frame: Title Partner NOVA//01 */}
                  <div className="p-3 mb-2.5 border border-[#ff1744]/60 bg-gradient-to-r from-[#ff1744]/20 via-[#0a0a10] to-[#ff1744]/10 shadow-[0_0_20px_rgba(255,23,68,0.2)] relative">
                    <div className="flex items-center justify-between text-[9px] font-mono mb-1">
                      <span className="px-2 py-0.5 bg-[#ff1744] text-white font-bold tracking-widest uppercase">
                        TITLE PARTNER // 01
                      </span>
                      <span className="text-[#ff1744] font-bold tracking-wider">COMPUTE GRANTS AVAILABLE</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <div className="text-2xl sm:text-3xl font-['Anton'] text-white tracking-wide">
                        NOVA//01
                      </div>
                      <div className="text-[10px] font-mono text-[#f4efe3]/80">
                        Quantum Computing & Cloud Infrastructure
                      </div>
                    </div>
                  </div>

                  {/* Tiered Partner Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SPONSORS.filter((s) => s.kind !== "featured").map((sp, idx) => (
                      <div
                        key={idx}
                        className="p-2 border border-white/10 bg-black/60 hover:border-[#ff1744]/50 transition-all font-mono"
                      >
                        <span className="block text-[8px] uppercase tracking-wider text-white/40">
                          {sp.tier}
                        </span>
                        <span className="text-xs font-['Anton'] tracking-wide text-white block my-0.5">
                          {sp.name}
                        </span>
                        <span className="text-[8px] text-white/60 line-clamp-1">
                          {sp.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2.5 border-t border-white/10 text-[9px] font-mono text-white/40 uppercase flex items-center justify-between">
                  <span>ENGINEERING ALLIANCE PROTOCOL</span>
                  <span className="text-[#ff1744] font-bold">STAGE 03 // VERIFIED</span>
                </div>
              </TimelineCard>

              {/* STAGE 4: TRANSMISSION END & FINALE */}
              <TimelineCard className="w-[340px] sm:w-[380px] h-[430px] sm:h-[460px] max-h-[64vh] p-5 sm:p-6 bg-[#08080e] border-[#ff1744]">
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                      <span className="font-mono text-[10px] uppercase font-bold text-emerald-400 tracking-widest">
                        STAGE 04 // LAUNCH COMMAND
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-white/40">PORTAL ONLINE</span>
                  </div>

                  <div className="text-3xl sm:text-4xl font-['Anton'] text-white uppercase tracking-tight mb-1">
                    ENTER THE ARENAS
                  </div>
                  <p className="text-xs text-[#f4efe3]/80 leading-relaxed font-sans mb-3">
                    Registrations closing soon for all 6 combat arenas. Reserve squad credentials now.
                  </p>

                  {/* 2x2 Combat Telemetry Grid */}
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px] mb-3">
                    <div className="p-2 bg-white/5 border border-white/10 text-center">
                      <div className="text-sm font-['Anton'] text-[#ff1744]">6 ARENAS</div>
                      <div className="text-[8px] text-white/50 uppercase">FULL ROSTER</div>
                    </div>
                    <div className="p-2 bg-white/5 border border-white/10 text-center">
                      <div className="text-sm font-['Anton'] text-[#ffd600]">₹8L POOL</div>
                      <div className="text-[8px] text-white/50 uppercase">PRIZE ESCROW</div>
                    </div>
                    <div className="p-2 bg-white/5 border border-white/10 text-center">
                      <div className="text-sm font-['Anton'] text-white">120+ SQUADS</div>
                      <div className="text-[8px] text-white/50 uppercase">REGISTERED</div>
                    </div>
                    <div className="p-2 bg-white/5 border border-white/10 text-center">
                      <div className="text-sm font-['Anton'] text-emerald-400">36 HOURS</div>
                      <div className="text-[8px] text-white/50 uppercase">SPRINT RUNTIME</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <button
                    onClick={() => (onDownloadBrochure ? onDownloadBrochure() : undefined)}
                    className="w-full py-2.5 sm:py-3 bg-[#ff1744] hover:bg-[#ff3b42] text-white font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,23,68,0.7),3px_3px_0_#000] active:translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <span>DOWNLOAD BROCHURE</span>
                    <span>↓</span>
                  </button>
                  <button
                    onClick={() => onJumpToProgress(0.0)}
                    className="w-full py-2 border border-white/25 bg-black/80 hover:bg-white hover:text-black text-white/80 font-bold uppercase tracking-wider transition-all text-[11px]"
                  >
                    RETURN TO TOP ↑
                  </button>
                </div>
              </TimelineCard>
            </div>
          </div>

          {/* Bottom HUD: Coordinates, Copyright & Sticky Quick Actions */}
          <div className="pb-6 px-6 sm:px-14 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-white/50 border-t border-white/10 pt-3 z-30 pointer-events-auto bg-[#060609]/90 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span>CONTACT: <a href="mailto:contact@aroohfest.in" className="text-[#ff1744] hover:underline">contact@aroohfest.in</a></span>
              <span>//</span>
              <span>PUNE, INDIA</span>
              <span className="hidden sm:inline">//</span>
              <span className="hidden sm:inline">© 2026 AROOH TECH FEST</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onJumpToProgress(0.0)}
                className="px-3.5 py-1.5 border border-white/20 hover:border-white/50 bg-black/60 text-white/70 hover:text-white font-mono text-xs uppercase tracking-wider transition-all"
              >
                Top ↑
              </button>
              <button
                onClick={() => (onDownloadBrochure ? onDownloadBrochure() : undefined)}
                className="px-4 py-1.5 bg-[#ff1744] hover:bg-[#ff3b42] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,23,68,0.4),2px_2px_0_#000] flex items-center gap-1.5"
              >
                <span>Brochure</span>
                <span>↓</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
