import { useEffect, useState, useRef, useCallback } from "react";

export interface ChapterInfo {
  id: string;
  code: string;
  name: string;
  target: number;
  range: [number, number];
  description: string;
}

export const CHAPTERS: ChapterInfo[] = [
  {
    id: "void",
    code: "00",
    name: "Opening",
    target: 0.00,
    range: [0.00, 0.12],
    description: "Monolithic Void",
  },
  {
    id: "signal",
    code: "01",
    name: "It Wakes Up",
    target: 0.20,
    range: [0.12, 0.31],
    description: "Awakening & Gravitational Drift",
  },
  {
    id: "formation",
    code: "02",
    name: "The Scale",
    target: 0.38,
    range: [0.31, 0.47],
    description: "Kinetic Geometry & Full Speed Scale",
  },
  {
    id: "reveal",
    code: "03",
    name: "Arooh",
    target: 0.54,
    range: [0.47, 0.65],
    description: "Monumental Convergence",
  },
  {
    id: "tracks",
    code: "04",
    name: "Six Arenas",
    target: 0.70,
    range: [0.64, 0.77],
    description: "Six Combat Arenas",
  },
  {
    id: "schedule",
    code: "05",
    name: "Run of Show",
    target: 0.85,
    range: [0.82, 1.00],
    description: "Two Days & Ecosystem",
  },
];

export interface ScrollState {
  progress: number;       // Smoothed rendered progress (0 to 1)
  rawProgress: number;    // Target progress (0 to 1)
  velocity: number;       // Rate of scroll change
  isScrolling: boolean;
  chapter: number;        // Active chapter index (0..5)
  scrollToProgress: (target: number) => void;
  snapToChapter: (chapterIndex: number) => void;
}

export type ScrollUpdateCallback = (state: {
  progress: number;
  rawProgress: number;
  velocity: number;
  chapter: number;
}) => void;

// =============================================================================
// CENTRAL AUTHORITATIVE SMOOTH SCROLL CONTROLLER
// Silky-smooth exponential damping with reduced sensitivity and controlled inertia
// =============================================================================
class CentralScrollController {
  private targetProgress = 0;
  private renderedProgress = 0;
  private velocity = 0;
  private chapter = 0;
  private isScrolling = false;
  private rafId: number | null = null;
  private isRunning = false;
  private lastTime = 0;
  private lastScrollSyncTime = 0;
  private isSyncingScroll = false;
  private isProgrammatic = false;

  private listeners = new Set<ScrollUpdateCallback>();

  constructor() {
    if (typeof window !== "undefined") {
      this.init();
    }
  }

  private init() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();

    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Helper: Check if cursor is over a scrollable sub-element (e.g. modal or schedule list)
    const isInsideScrollable = (target: HTMLElement | null, deltaY: number): boolean => {
      let el = target;
      while (el && el !== document.body && el !== document.documentElement) {
        const overflowY = window.getComputedStyle(el).overflowY;
        if ((overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight) {
          const canScrollDown = deltaY > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 2;
          const canScrollUp = deltaY < 0 && el.scrollTop > 2;
          if (canScrollDown || canScrollUp) return true;
        }
        el = el.parentElement;
      }
      return false;
    };

    // 1. Wheel event listener: Supports vertical scroll as well as horizontal trackpad gestures
    const onWheel = (e: WheelEvent) => {
      this.isProgrammatic = false;
      if (document.body.style.overflow === "hidden") return;
      if (isInsideScrollable(e.target as HTMLElement, e.deltaY)) return;

      e.preventDefault();

      let delta = e.deltaY;
      // If user swipes horizontally on trackpad/mouse, honor deltaX
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 3) {
        delta = e.deltaX;
      }
      if (e.deltaMode === 1) delta *= 16;
      else if (e.deltaMode === 2) delta *= 400;

      // Clamp individual wheel delta to prevent sudden huge flicks (reduced sensitivity)
      const clampedDelta = Math.sign(delta) * Math.min(Math.abs(delta), 60);
      const SENSITIVITY = 0.00030;
      const targetStep = clampedDelta * SENSITIVITY;

      this.targetProgress = Math.max(0, Math.min(1, this.targetProgress + targetStep));

      // Controlled inertia: Cap maximum lead buffer between targetProgress and renderedProgress
      const MAX_LEAD = 0.06;
      this.targetProgress = Math.max(
        this.renderedProgress - MAX_LEAD,
        Math.min(this.renderedProgress + MAX_LEAD, this.targetProgress)
      );
    };

    // 2. Touch event listener for smooth touch scrolling (supports horizontal swipe on timeline)
    let touchStartY = 0;
    let touchStartX = 0;
    const onTouchStart = (e: TouchEvent) => {
      this.isProgrammatic = false;
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (document.body.style.overflow === "hidden") return;
      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const diffY = touchStartY - currentY;
      const diffX = touchStartX - currentX;
      const effectiveDiff = Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 4 ? diffX : diffY;
      if (isInsideScrollable(e.target as HTMLElement, effectiveDiff)) return;

      if (Math.abs(effectiveDiff) > 2) {
        this.isProgrammatic = false;
        e.preventDefault();
        touchStartY = currentY;
        touchStartX = currentX;

        const step = Math.sign(effectiveDiff) * Math.min(Math.abs(effectiveDiff), 40) * 0.00045;
        this.targetProgress = Math.max(0, Math.min(1, this.targetProgress + step));

        const MAX_LEAD = 0.06;
        this.targetProgress = Math.max(
          this.renderedProgress - MAX_LEAD,
          Math.min(this.renderedProgress + MAX_LEAD, this.targetProgress)
        );
      }
    };

    // 3. Native scroll listener (strictly ignored during programmatic jumps like Return to Top)
    const onNativeScroll = () => {
      if (this.isProgrammatic) return;
      if (this.isSyncingScroll) {
        this.isSyncingScroll = false;
        return;
      }
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const p = Math.max(0, Math.min(1, window.scrollY / docHeight));
      if (Math.abs(p - this.renderedProgress) > 0.05) {
        this.targetProgress = p;
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("scroll", onNativeScroll, { passive: true });

    // 4. Silky-Smooth Critically Damped Exponential Animation Loop
    const tick = (now: number) => {
      const dt = Math.min(0.04, (now - this.lastTime) / 1000 || 0.016);
      this.lastTime = now;

      const diff = this.targetProgress - this.renderedProgress;

      if (Math.abs(diff) > 0.00005) {
        // Fast, graceful exponential settling
        // During programmatic navigation (e.g. Return to Top), use rate 16.0 for a swift, clean ~300ms return
        const rate = this.isProgrammatic ? 16.0 : 12.0;
        const lerpFactor = 1 - Math.exp(-rate * dt);
        this.renderedProgress += diff * lerpFactor;

        // Cap velocity to prevent excessive camera FOV warping during long jumps
        const rawVel = diff * rate;
        this.velocity = Math.max(-1.5, Math.min(1.5, rawVel));
        this.isScrolling = true;

        // Throttled native scroll sync (only sync if not returning to top to avoid jump-back loop)
        if (this.targetProgress !== 0 && now - this.lastScrollSyncTime > 120) {
          this.lastScrollSyncTime = now;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (docHeight > 0) {
            this.isSyncingScroll = true;
            window.scrollTo({ top: this.renderedProgress * docHeight, left: 0, behavior: "instant" });
          }
        }
      } else {
        this.renderedProgress = this.targetProgress;
        this.velocity = 0;
        this.isScrolling = false;
        this.isProgrammatic = false;
        if (this.targetProgress === 0 && typeof window !== "undefined") {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }
      }

      const p = this.renderedProgress;

      // Determine active chapter deterministically
      const chIdx = CHAPTERS.findIndex((c) => p >= c.range[0] && p <= c.range[1]);
      if (chIdx !== -1) {
        this.chapter = chIdx;
      }

      // Notify subscribers
      if (this.listeners.size > 0) {
        const state = {
          progress: this.renderedProgress,
          rawProgress: this.targetProgress,
          velocity: this.velocity,
          chapter: this.chapter,
        };
        this.listeners.forEach((cb) => cb(state));
      }

      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  // Programmatic step by direction (e.g. arrow keys)
  public stepDirection(dir: number) {
    if (dir === 0) return;
    const step = dir * 0.045;
    this.targetProgress = Math.max(0, Math.min(1, this.targetProgress + step));
    const MAX_LEAD = 0.07;
    this.targetProgress = Math.max(
      this.renderedProgress - MAX_LEAD,
      Math.min(this.renderedProgress + MAX_LEAD, this.targetProgress)
    );
  }

  public getRenderedProgress(): number {
    return this.renderedProgress;
  }

  public getRawProgress(): number {
    return this.targetProgress;
  }

  public getVelocity(): number {
    return this.velocity;
  }

  public getChapter(): number {
    return this.chapter;
  }

  public subscribe(cb: ScrollUpdateCallback): () => void {
    this.listeners.add(cb);
    cb({
      progress: this.renderedProgress,
      rawProgress: this.targetProgress,
      velocity: this.velocity,
      chapter: this.chapter,
    });
    return () => {
      this.listeners.delete(cb);
    };
  }

  // Smooth progression to target progress
  public scrollToProgress(target: number) {
    const clamped = Math.max(0, Math.min(1, target));
    this.targetProgress = clamped;
    this.isProgrammatic = true;

    // If scrolling to top, immediately synchronize native scroll to prevent jump-back
    if (clamped === 0 && typeof window !== "undefined") {
      this.isSyncingScroll = true;
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }

  public stepByDirection(dir: number) {
    this.stepDirection(dir);
  }

  public snapToChapter(idx: number) {
    const clampedIdx = Math.max(0, Math.min(CHAPTERS.length - 1, idx));
    this.scrollToProgress(CHAPTERS[clampedIdx].target);
  }
}

// Global Singleton
export const scrollController = new CentralScrollController();

// React Hook for UI components that consume progress and chapter
export function useScrollProgress(): ScrollState {
  const [progress, setProgress] = useState(scrollController.getRenderedProgress());
  const [rawProgress, setRawProgress] = useState(scrollController.getRawProgress());
  const [velocity, setVelocity] = useState(scrollController.getVelocity());
  const [chapter, setChapter] = useState(scrollController.getChapter());
  const isScrollingRef = useRef(false);

  useEffect(() => {
    let lastP = scrollController.getRenderedProgress();
    let lastCh = scrollController.getChapter();

    const unsubscribe = scrollController.subscribe((state) => {
      // Throttle React state updates to avoid unnecessary 60fps reconciliations
      // Only update when chapter changes or progress moves meaningfully (> 0.004)
      const pDiff = Math.abs(state.progress - lastP);
      const chChanged = state.chapter !== lastCh;

      if (pDiff > 0.004 || chChanged || state.progress === 0 || state.progress === 1) {
        lastP = state.progress;
        lastCh = state.chapter;
        setProgress(state.progress);
        setRawProgress(state.rawProgress);
        setVelocity(state.velocity);
        setChapter(state.chapter);
      }
    });

    return unsubscribe;
  }, []);

  const scrollToProgress = useCallback((target: number) => {
    scrollController.scrollToProgress(target);
  }, []);

  const snapToChapter = useCallback((chapterIndex: number) => {
    scrollController.snapToChapter(chapterIndex);
  }, []);

  return {
    progress,
    rawProgress,
    velocity,
    isScrolling: isScrollingRef.current,
    chapter,
    scrollToProgress,
    snapToChapter,
  };
}
