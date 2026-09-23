import React, { useEffect } from "react";
import { TrackItem } from "../scene/sceneData";

interface TrackModalProps {
  track: TrackItem | null;
  onClose: () => void;
  onRegisterTrack: (trackTitle: string) => void;
}

export const TrackModal: React.FC<TrackModalProps> = ({
  track,
  onClose,
  onRegisterTrack,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (track) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [track, onClose]);

  if (!track) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="track-modal-title"
    >
      <div
        className="relative w-full max-w-2xl bg-[#0e0e12] border-2 border-[#e5242a] p-6 sm:p-8 shadow-[12px_12px_0_#000] text-[#f4efe3]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-start justify-between border-b border-white/15 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-3 text-xs tracking-widest uppercase font-mono text-[#e5242a] mb-1">
              <span className="font-bold">{track.code}</span>
              <span>//</span>
              <span className="text-white/60">{track.category}</span>
            </div>
            <h2 id="track-modal-title" className="text-3xl sm:text-4xl font-['Anton'] uppercase tracking-tight text-[#f4efe3]">
              {track.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 border border-white/20 bg-white/5 hover:bg-[#e5242a] hover:text-white transition-all flex items-center justify-center font-mono text-lg"
            aria-label="Close track details"
          >
            ×
          </button>
        </div>

        {/* Tagline */}
        <p className="text-base sm:text-lg text-[#ff4549] font-medium mb-4 italic">
          "{track.tagline}"
        </p>

        {/* Full Description */}
        <p className="text-sm sm:text-base text-[#f4efe3]/80 leading-relaxed mb-6">
          {track.description}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 border border-white/15 p-4 bg-black/40 mb-6 font-mono">
          <div>
            <span className="block text-[10px] uppercase text-white/50 tracking-wider">Prize Pool</span>
            <span className="text-2xl font-['Anton'] text-[#e5242a]">{track.prize}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase text-white/50 tracking-wider">Formation</span>
            <span className="text-sm font-bold text-white mt-1.5 block">{track.team}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-white/20 text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-all"
          >
            Dismiss
          </button>
          <button
            onClick={() => {
              onRegisterTrack(track.title);
              onClose();
            }}
            className="px-6 py-2.5 bg-[#e5242a] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#ff4549] transition-all shadow-[4px_4px_0_#000]"
          >
            Claim Entry Slot ↗
          </button>
        </div>
      </div>
    </div>
  );
};
