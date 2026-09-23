import React, { useState, useEffect } from "react";
import { TRACKS } from "../scene/sceneData";
import { toast } from "sonner";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTrack?: string;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  defaultTrack,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [track, setTrack] = useState(defaultTrack || "Hack the Grid");
  const [college, setCollege] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (defaultTrack) {
      setTrack(defaultTrack);
    }
  }, [defaultTrack]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in your name and email.");
      return;
    }
    setSubmitted(true);
    toast.success(`Registered: ${name} [${track}]! Welcome to AROOH 2026.`);
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setCollege("");
    setSubmitted(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-xl bg-[#0a0a0e] border-2 border-[#ff1744] p-6 sm:p-8 shadow-[0_0_40px_rgba(255,23,68,0.3),10px_10px_0_#000] text-[#f4efe3]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/15 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-[0.25em] text-[#ff1744] mb-1">
              <span className="w-2 h-2 bg-[#ff1744] rotate-45 inline-block" />
              <span>OFFICIAL REGISTRATION // 2026</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-['Anton'] uppercase tracking-tight text-[#f4efe3] leading-none">
              Step <span className="text-[#ff1744]">In.</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 border border-white/20 bg-white/5 hover:bg-[#ff1744] hover:text-white transition-all flex items-center justify-center font-mono text-lg"
            aria-label="Close registration modal"
          >
            ×
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center font-mono">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-2xl sm:text-3xl font-['Anton'] uppercase text-white mb-2 tracking-wide">
              You're In.
            </h3>
            <p className="text-xs sm:text-sm text-white/80 max-w-sm mx-auto mb-6 leading-relaxed">
              Registration confirmed for <span className="text-[#ff1744] font-bold">{name}</span> in <span className="text-white font-bold">{track}</span>. Details sent to <span className="text-white underline">{email}</span>.
            </p>
            <div className="p-3 bg-white/5 border border-white/10 text-[10px] text-white/60 mb-6 max-w-xs mx-auto">
              MIT ADT CAMPUS // 14—15 NOV 2026
            </div>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-[#ff1744] hover:bg-[#ff3b42] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[3px_3px_0_#000]"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/60 mb-1">
                Lead / Team Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex or NullPointer"
                className="w-full bg-black/70 border border-white/20 p-3 text-white placeholder-white/30 focus:border-[#ff1744] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/60 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full bg-black/70 border border-white/20 p-3 text-white placeholder-white/30 focus:border-[#ff1744] focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/60 mb-1">
                  Chosen Arena *
                </label>
                <select
                  value={track}
                  onChange={(e) => setTrack(e.target.value)}
                  className="w-full bg-black/80 border border-white/20 p-3 text-white focus:border-[#ff1744] focus:outline-none transition-colors"
                >
                  {TRACKS.map((t) => (
                    <option key={t.id} value={t.title} className="bg-[#12121c] text-white">
                      {t.num} // {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/60 mb-1">
                  College / Studio
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="MIT ADT or University Name"
                  className="w-full bg-black/70 border border-white/20 p-3 text-white placeholder-white/30 focus:border-[#ff1744] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between gap-4 border-t border-white/10 mt-6">
              <span className="text-[9px] text-white/40">
                Instant confirmation link dispatched upon entry.
              </span>
              <button
                type="submit"
                className="px-6 py-3 bg-[#ff1744] hover:bg-[#ff3b42] text-white font-bold uppercase tracking-wider transition-all shadow-[4px_4px_0_#000] text-xs shrink-0"
              >
                REGISTER NOW ↗
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
