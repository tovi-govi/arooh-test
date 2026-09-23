import React, { useState, useEffect } from "react";
import { useScrollProgress, CHAPTERS } from "../components/scene/useScrollProgress";
import { AroohCanvas } from "../components/scene/AroohCanvas";
import { TelemetryHUD } from "../components/hud/TelemetryHUD";
import { NarrativeLayers } from "../components/hud/NarrativeLayers";
import { TrackModal } from "../components/hud/TrackModal";
import { RegistrationModal } from "../components/hud/RegistrationModal";
import { TrackItem } from "../components/scene/sceneData";

export default function AroohExperience() {
  const {
    progress,
    rawProgress,
    velocity,
    chapter,
    scrollToProgress,
    snapToChapter,
  } = useScrollProgress();

  const [selectedTrack, setSelectedTrack] = useState<TrackItem | null>(null);
  const [registeredTrackDefault, setRegisteredTrackDefault] = useState<string>("Hack the Grid");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [debugMode, setDebugMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.location.search.includes("debug");
    }
    return false;
  });

  // Keyboard navigation & debug toggle support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === "input" || targetTag === "textarea" || targetTag === "select") {
        return;
      }

      if (e.key === "d" || e.key === "D") {
        setDebugMode((prev) => !prev);
      } else if (e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !e.shiftKey)) {
        if (e.key === " ") e.preventDefault();
        snapToChapter(chapter + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp" || (e.key === " " && e.shiftKey)) {
        if (e.key === " ") e.preventDefault();
        snapToChapter(chapter - 1);
      } else if (e.key === "Home") {
        snapToChapter(0);
      } else if (e.key === "End") {
        snapToChapter(CHAPTERS.length - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [chapter, snapToChapter]);

  const handleOpenRegister = React.useCallback((trackTitle?: string) => {
    if (trackTitle) {
      setRegisteredTrackDefault(trackTitle);
    }
    setIsRegisterOpen(true);
  }, []);

  return (
    <div className="relative w-full bg-[#060609] text-[#f4efe3] select-none min-h-screen">
      {/* Screen reader skip link for accessibility */}
      <a
        href="#register"
        onClick={(e) => {
          e.preventDefault();
          handleOpenRegister();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#ff1744] focus:text-white focus:font-bold focus:outline-none"
      >
        Skip directly to Registration
      </a>

      {/* Semantic Chapter Anchors */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {CHAPTERS.map((ch) => (
          <div
            key={ch.id}
            id={`chapter-${ch.id}`}
            className="absolute w-full"
            style={{ top: `${ch.target * 100}%` }}
          />
        ))}
      </div>

      {/* Persistent 3D WebGL Canvas Layer (Fixed, hardware-accelerated, reads renderedProgress directly) */}
      <AroohCanvas />

      {/* Cyber Telemetry HUD Overlay */}
      <TelemetryHUD
        progress={progress}
        chapter={chapter}
        onJumpToChapter={scrollToProgress}
        onOpenRegisterModal={handleOpenRegister}
      />

      {/* Narrative & Information Content Layer */}
      <NarrativeLayers
        progress={progress}
        onSelectTrack={setSelectedTrack}
        onJumpToProgress={scrollToProgress}
        onOpenRegisterModal={handleOpenRegister}
        registeredTrackDefault={registeredTrackDefault}
      />

      {/* Modal for Track Inspection */}
      <TrackModal
        track={selectedTrack}
        onClose={() => setSelectedTrack(null)}
        onRegisterTrack={(trackTitle) => handleOpenRegister(trackTitle)}
      />

      {/* Dedicated Registration Modal */}
      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        defaultTrack={registeredTrackDefault}
      />

      {/* Development Debug Overlay */}
      {debugMode && (
        <div className="fixed bottom-4 left-4 z-50 p-3 bg-black/90 border border-[#ff1744] text-[#ff1744] font-mono text-[10px] space-y-1 shadow-[0_0_15px_rgba(255,23,68,0.3)]">
          <div className="font-bold text-white flex items-center justify-between gap-4 border-b border-white/20 pb-1">
            <span>SCROLL TELEMETRY DEBUG</span>
            <button onClick={() => setDebugMode(false)} className="text-white/60 hover:text-white">✕</button>
          </div>
          <div>Rendered Progress: <span className="text-white">{progress.toFixed(4)}</span></div>
          <div>Raw Progress: <span className="text-white">{rawProgress.toFixed(4)}</span></div>
          <div>Delta Velocity: <span className="text-white">{velocity.toFixed(2)}</span></div>
          <div>Active Phase: <span className="text-white">[{CHAPTERS[chapter].code}] {CHAPTERS[chapter].name}</span></div>
          <div>Authoritative Loop: <span className="text-emerald-400">ONLINE (1)</span></div>
          <div>Constant Speed: <span className="text-emerald-400">ACTIVE (0.32/s)</span></div>
          <div className="text-[8px] text-white/40 pt-1">Press 'D' to toggle debug HUD</div>
        </div>
      )}

      {/* Controlled Scroll Track Spacer (1200vh) providing a deliberate, cinematic timeline and buffer */}
      <div
        className="w-full pointer-events-none opacity-0"
        style={{ height: "1200vh" }}
        aria-hidden="true"
      />
    </div>
  );
}
