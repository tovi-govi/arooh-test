import React, { useState } from "react";
import { TRACKS, TrackItem } from "../scene/sceneData";

interface ArenaSelectionHubProps {
  onHoverTrack?: (id: string | null) => void;
  onSelectTrack: (track: TrackItem) => void;
}

interface ArenaVisualTheme {
  themeTag: string;
  badge: string;
  status: string;
  difficulty: string;
  borderAccent: string;
  glowColor: string;
  subtextColor: string;
  visualGraphic: React.ReactNode;
}

export const ArenaSelectionHub: React.FC<ArenaSelectionHubProps> = ({
  onHoverTrack,
  onSelectTrack,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedArenaId, setSelectedArenaId] = useState<string | null>(null);

  const handleMouseEnter = (id: string) => {
    setHoveredId(id);
    if (onHoverTrack) onHoverTrack(id);
  };

  const handleMouseLeave = () => {
    setHoveredId(null);
    if (onHoverTrack) onHoverTrack(null);
  };

  const handleClick = (track: TrackItem) => {
    setSelectedArenaId(track.id);
    setTimeout(() => {
      onSelectTrack(track);
      setSelectedArenaId(null);
    }, 280);
  };

  // Bespoke visual styling & iconography for each of the 6 arenas
  const arenaThemes: Record<string, ArenaVisualTheme> = {
    hack: {
      themeTag: "CODE RED // 36H MELEE",
      badge: "HACKATHON",
      status: "ARMED",
      difficulty: "MAXIMUM",
      borderAccent: "#00e5ff",
      glowColor: "rgba(0, 229, 255, 0.4)",
      subtextColor: "text-[#00e5ff]",
      visualGraphic: (
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-60 font-mono text-[9px] text-[#00e5ff]">
          <span className="w-1.5 h-1.5 bg-[#00e5ff] rounded-full animate-ping" />
          <span>⚡ 36H MELEE // ACTIVE</span>
        </div>
      ),
    },
    robo: {
      themeTag: "STEEL PIT // KINETIC CLASH",
      badge: "ROBO CLASH",
      status: "ARMED",
      difficulty: "LETHAL",
      borderAccent: "#ff9100",
      glowColor: "rgba(255, 145, 0, 0.4)",
      subtextColor: "text-[#ff9100]",
      visualGraphic: (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-60 font-mono text-[9px] text-[#ff9100]">
          <span className="w-2 h-2 border border-[#ff9100] rotate-45" />
          <span>⚙ TORQUE: 45NM</span>
        </div>
      ),
    },
    ctf: {
      themeTag: "RED CELL // BREAK THE VAULT",
      badge: "SECURITY CTF",
      status: "LOCKED",
      difficulty: "NIGHTMARE",
      borderAccent: "#ff1744",
      glowColor: "rgba(255, 23, 68, 0.5)",
      subtextColor: "text-[#ff1744]",
      visualGraphic: (
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-60 font-mono text-[9px] text-[#ff1744]">
          <span className="font-bold">⚠ ZERO-DAY TARGET</span>
        </div>
      ),
    },
    ideathon: {
      themeTag: "THE ARENA // IMPACT PITCH",
      badge: "IMPACT PITCH",
      status: "OPEN",
      difficulty: "STRATEGIC",
      borderAccent: "#f4efe3",
      glowColor: "rgba(244, 239, 227, 0.35)",
      subtextColor: "text-[#f4efe3]",
      visualGraphic: (
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-60 font-mono text-[9px] text-[#f4efe3]">
          <span>✦ SEED ROUND</span>
        </div>
      ),
    },
    esports: {
      themeTag: "LAN BASTION // FIRST BLOOD",
      badge: "LAN ARENA",
      status: "BRACKETED",
      difficulty: "REFLEX",
      borderAccent: "#ff0055",
      glowColor: "rgba(255, 0, 85, 0.45)",
      subtextColor: "text-[#ff0055]",
      visualGraphic: (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-60 font-mono text-[9px] text-[#ff0055]">
          <span>✚ 120 FPS // NO MERCY</span>
        </div>
      ),
    },
    quiz: {
      themeTag: "RAPID FIRE // HIGH NOON",
      badge: "SPEED TRIVIA",
      status: "RAPID",
      difficulty: "EXTREME",
      borderAccent: "#ff5252",
      glowColor: "rgba(255, 82, 82, 0.4)",
      subtextColor: "text-[#ff5252]",
      visualGraphic: (
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-60 font-mono text-[9px] text-[#ff5252]">
          <span>⚡ 5.0 SEC CLOCK</span>
        </div>
      ),
    },
  };

  return (
    <div className="arena-selection-hub w-full max-w-7xl mx-auto px-3 sm:px-6 select-none">
      {/* 1. MANGA COMBAT ANNOUNCEMENT HEADER */}
      <div className="relative mb-6 sm:mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-white/15 pb-4">
        <div>
          <div className="flex items-center justify-center sm:justify-start gap-2 text-[10px] sm:text-xs uppercase tracking-[0.3em] font-mono text-[#ff1744] mb-1">
            <span className="inline-block w-2.5 h-2.5 bg-[#ff1744] rotate-45" />
            <span className="font-bold">03 // SIX ARENAS</span>
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-7xl font-['Anton'] uppercase tracking-tight text-[#f4efe3] drop-shadow-[4px_4px_0_#000] leading-none">
            Six Ways To <span className="text-[#ff1744] drop-shadow-[0_0_20px_rgba(255,23,68,0.7)]">Break It.</span>
          </h2>
        </div>

        <div className="text-right font-mono hidden md:block">
          <div className="text-[11px] text-white/50 tracking-widest uppercase">
            TARGET // <span className="text-[#ff1744] font-bold">SELECT TO ENTER</span>
          </div>
          <div className="text-[9px] text-white/30 uppercase mt-0.5">
            HOVER TO FOCUS // CLICK FOR RULES
          </div>
        </div>
      </div>

      {/* 2. SPATIAL ARENA SELECTION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {TRACKS.map((track) => {
          const theme = arenaThemes[track.id] || arenaThemes.hack;
          const isHovered = hoveredId === track.id;
          const isSelected = selectedArenaId === track.id;

          return (
            <div
              key={track.id}
              onMouseEnter={() => handleMouseEnter(track.id)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(track)}
              className={`arena-card group relative cursor-pointer overflow-hidden p-5 border-2 transition-all duration-150 transform hover:-translate-y-1 ${
                isSelected
                  ? "bg-white text-black border-white animate-pulse"
                  : isHovered
                  ? "bg-[#0d0d15] border-[#ff1744] shadow-[0_0_25px_rgba(255,23,68,0.35),4px_4px_0_#000] z-20"
                  : "bg-[#09090f]/95 border-white/20 shadow-[4px_4px_0_#000] hover:border-[#ff1744]/70 z-10"
              }`}
            >
              {/* Unique visual graphic badge */}
              {theme.visualGraphic}

              {/* OVERSIZED ARENA NUMBER (DOMINANT WATERMARK) */}
              <div
                className={`absolute -right-2 -bottom-4 font-['Anton'] text-7xl sm:text-8xl leading-none select-none pointer-events-none font-bold transition-all duration-300 ${
                  isHovered
                    ? "text-[#ff1744]/25 translate-x-1 translate-y-1"
                    : "text-white/5"
                }`}
              >
                {track.num}
              </div>

              {/* Top Tag & Track Badge */}
              <div className="flex items-center justify-between mb-3 relative z-10 font-mono">
                <span className="px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase bg-black/80 border border-white/20 text-[#ff1744]">
                  ARENA // {track.num}
                </span>
                <span className="text-[9px] tracking-wider uppercase text-white/50">
                  {theme.badge}
                </span>
              </div>

              {/* Category & Title */}
              <div className="relative z-10 mb-2">
                <div className="text-[10px] font-mono tracking-widest text-white/50 uppercase">
                  {track.category}
                </div>
                <h3 className="text-2xl sm:text-3xl font-['Anton'] uppercase tracking-tight text-white group-hover:text-[#ff1744] transition-colors leading-none my-1">
                  {track.title}
                </h3>
              </div>

              {/* Arena Tagline */}
              <p className="text-xs text-white/70 font-sans line-clamp-2 leading-relaxed mb-4 relative z-10 italic">
                "{track.tagline}"
              </p>

              {/* Tactical Status HUD */}
              <div className="grid grid-cols-2 gap-2 pt-2 pb-3 border-t border-white/10 font-mono text-[9px] relative z-10">
                <div>
                  <span className="text-white/40 block">DIFFICULTY</span>
                  <span className="text-white font-bold">{theme.difficulty}</span>
                </div>
                <div>
                  <span className="text-white/40 block">BOUNTY</span>
                  <span className="text-[#ff1744] font-bold">{track.prize}</span>
                </div>
                <div>
                  <span className="text-white/40 block">FORMATION</span>
                  <span className="text-white/80">{track.team}</span>
                </div>
                <div>
                  <span className="text-white/40 block">STATUS</span>
                  <span className={`${theme.subtextColor} font-bold`}>{theme.status}</span>
                </div>
              </div>

              {/* Bottom Action Strip */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10 relative z-10 font-mono text-[10px]">
                <span className="text-white/40 group-hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff1744] animate-pulse" />
                  {isHovered ? "SELECTED" : "STANDBY"}
                </span>
                <span className="font-bold text-[#ff1744] group-hover:underline flex items-center gap-1">
                  ENTER ARENA ↗
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. BOTTOM ARENA STATUS BAR */}
      <div className="mt-5 p-3 bg-black/70 border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[10px] text-white/60">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#ff1744] animate-ping" />
          <span>SIX ARENAS // ALL DISCIPLINES</span>
        </div>
        <div className="text-[#ff1744]">
          TOTAL FESTIVAL BOUNTY POOL // ₹8,00,000 INR
        </div>
      </div>
    </div>
  );
};
