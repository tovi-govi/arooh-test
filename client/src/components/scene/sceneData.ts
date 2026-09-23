import * as THREE from "three";

export interface TrackItem {
  id: string;
  num: string;
  code: string;
  title: string;
  category: string;
  tagline: string;
  description: string;
  team: string;
  prize: string;
  accent: string;
  icon: string;
}

export const TRACKS: TrackItem[] = [
  {
    id: "hack",
    num: "01",
    code: "ARENA 01",
    title: "Hack the Grid",
    category: "36 HR HACKATHON",
    tagline: "Ship a working product before the clock ships you.",
    description:
      "36 hours of non-stop rapid prototyping, generative systems, and real-time execution. Build on top of open protocols, hardware APIs, or novel AI workflows.",
    team: "Teams / 2—4",
    prize: "₹2,50,000",
    accent: "#ff3b42",
    icon: "⌘",
  },
  {
    id: "robo",
    num: "02",
    code: "ARENA 02",
    title: "Robo Riot",
    category: "ROBOTICS BATTLE",
    tagline: "Steel, sensors and a little controlled chaos.",
    description:
      "Custom-built combat bots and autonomous navigation rovers clash in a closed electrified arena with dynamic hazards.",
    team: "Teams / 2—5",
    prize: "₹1,75,000",
    accent: "#ff8438",
    icon: "⚙",
  },
  {
    id: "ctf",
    num: "03",
    code: "ARENA 03",
    title: "Red CTF",
    category: "CYBERSECURITY",
    tagline: "Find the flaw. Take the flag. Leave no trace.",
    description:
      "Attack-defense cybersecurity wargame featuring binary exploitation, reverse engineering, web security, cryptography, and network forensics.",
    team: "Solo or Pairs",
    prize: "₹1,25,000",
    accent: "#ff2233",
    icon: "▣",
  },
  {
    id: "ideathon",
    num: "04",
    code: "ARENA 04",
    title: "Idea Mine",
    category: "IMPACT IDEATHON",
    tagline: "Pitch the impossible. Make the room believe you.",
    description:
      "Transform ambitious theoretical concepts into concrete venture blueprints. Fast mentoring loops with venture builders and engineers.",
    team: "Teams / 2—3",
    prize: "₹1,00,000",
    accent: "#f4efe3",
    icon: "✦",
  },
  {
    id: "esports",
    num: "05",
    code: "ARENA 05",
    title: "Pixel Fight",
    category: "ESPORTS ARENA",
    tagline: "Bracketed, broadcast and turned all the way up.",
    description:
      "High-octane competitive LAN tournament with real-time analytics, shoutcasters, and intense crowd energy.",
    team: "Squads / 5",
    prize: "₹80,000",
    accent: "#e5242a",
    icon: "✚",
  },
  {
    id: "quiz",
    num: "06",
    code: "ARENA 06",
    title: "Quick Fire",
    category: "TECH QUIZ",
    tagline: "A quiz for people who treat trivia like a sport.",
    description:
      "Rapid-response technical quiz spanning computational history, esoteric languages, hardware trivia, and pop-culture lore.",
    team: "Solo",
    prize: "₹50,000",
    accent: "#ff6b72",
    icon: "?",
  },
];

export interface ScheduleItem {
  time: string;
  title: string;
  desc: string;
  location: string;
  tag: string;
  metric: string;
  status: string;
}

export const SCHEDULE_DATA: { day1: ScheduleItem[]; day2: ScheduleItem[] } = {
  day1: [
    {
      time: "09:00",
      title: "Gates Open & Check-In",
      desc: "Passcode verification, hardware kit collection, and caffeine terminal online.",
      location: "WEST ACCESS PORTAL",
      tag: "BIO & RFID PASS",
      metric: "800+ BUILDERS",
      status: "GATES ACTIVE",
    },
    {
      time: "10:30",
      title: "Ignition Ceremony",
      desc: "Keynote address, festival guidelines, and track briefing in the Main Auditorium.",
      location: "MAIN AUDITORIUM",
      tag: "KEYNOTE & PROTOCOL",
      metric: "4 KEYNOTE ARCHITECTS",
      status: "STAGE 01 ONLINE",
    },
    {
      time: "12:00",
      title: "Hack the Grid Begins",
      desc: "Clock starts on the 36-hour sprint. API gateways and mentor channels unlock.",
      location: "COMBAT PROTOCOL LABS",
      tag: "36:00:00 SPRINT CLOCK",
      metric: "120+ SQUADS ARMED",
      status: "COMMITS LIVE",
    },
    {
      time: "16:00",
      title: "Robo Riot Arena Qualifying",
      desc: "Heats begin in the steel arena. Weight and safety checks verified.",
      location: "STEEL PIT ARENA",
      tag: "45NM TORQUE LIMIT",
      metric: "30KG COMBAT CLASS",
      status: "HAZARDS ARMED",
    },
    {
      time: "20:30",
      title: "Night Shift Social & DJ Set",
      desc: "Fuel reload, lightning demos, and modular synth live performances.",
      location: "MEZZANINE ROOFTOP",
      tag: "SYNTH WAVE 130BPM",
      metric: "LIGHTNING DEMOS",
      status: "NIGHT RUNTIME",
    },
  ],
  day2: [
    {
      time: "09:30",
      title: "Deep Tech Masterclasses",
      desc: "Hands-on workshops with lead architects on WebAssembly, AI infra, and robotics.",
      location: "LAB 04 // WASM & AI",
      tag: "RUST + ONNX RUNTIME",
      metric: "200 SEATS LIMITED",
      status: "TERMINALS ARMED",
    },
    {
      time: "12:00",
      title: "Red CTF Final Blitz",
      desc: "Scoring engine accelerates. Final flags injected into live vulnerable instances.",
      location: "ZERO-DAY VAULT",
      tag: "500 PTS BONUS FLAGS",
      metric: "DEFENSE MATRICES",
      status: "ATTACK BLITZ",
    },
    {
      time: "15:00",
      title: "Idea Mine Pitch Stadium",
      desc: "Top 8 finalists take the stage before jury panel and venture partners.",
      location: "VENTURE AMPHITHEATER",
      tag: "3 MIN PITCH + 2 MIN Q&A",
      metric: "14 VC PARTNER FUNDS",
      status: "JURY IN SESSION",
    },
    {
      time: "18:00",
      title: "Grand Awards Ceremony",
      desc: "₹8,00,000 prize distribution, track champion trophies, and special honors.",
      location: "MAIN ARENA LIVESTREAM",
      tag: "₹8,00,000 BOUNTY POOL",
      metric: "6 CHAMPION TROPHIES",
      status: "VICTORY PROTOCOL",
    },
    {
      time: "19:30",
      title: "Afterparty: Transmission End",
      desc: "Celebration, networking, and festival conclusion.",
      location: "TERMINAL MAIN DECK",
      tag: "OPEN SOCIAL ACCESS",
      metric: "ALL BADGES WELCOME",
      status: "TRANSMISSION END",
    },
  ],
};

export const SPONSORS = [
  { tier: "TITLE PARTNER", name: "NOVA//01", kind: "featured", desc: "Quantum Computing & Cloud Infrastructure" },
  { tier: "GOLD PARTNER", name: "BYTE/", kind: "normal", desc: "Developer Toolchains & AI Runtime" },
  { tier: "GOLD PARTNER", name: "VECTOR", kind: "normal", desc: "Autonomous Systems & Microelectronics" },
  { tier: "SILVER PARTNER", name: "ARC LABS", kind: "normal", desc: "Decentralized Storage & Compute" },
  { tier: "COMMUNITY", name: "OPEN SOURCE CLUB", kind: "community", desc: "Student Chapter" },
  { tier: "COMMUNITY", name: "DEV COLLECTIVE", kind: "community", desc: "Regional Tech Network" },
  { tier: "CAMPUS HOST", name: "NEXUS CAMPUS", kind: "community", desc: "Pune, Maharashtra" },
];

// Camera waypoints along normalized progress (0.0 to 1.0)
export interface CameraWaypoint {
  t: number;
  pos: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
}

export const CAMERA_WAYPOINTS: CameraWaypoint[] = [
  // 0.00: The Opening - colossal abstract structure far in deep darkness, mysterious silhouette
  {
    t: 0.0,
    pos: new THREE.Vector3(0, 2.2, 58),
    target: new THREE.Vector3(0, 0, 0),
    fov: 44,
  },
  // 0.20: It Wakes Up - camera plunging forward into the orbit of the structure
  {
    t: 0.20,
    pos: new THREE.Vector3(-2.5, 2.5, 32),
    target: new THREE.Vector3(0, 0.5, 0),
    fov: 46,
  },
  // 0.38: World Formation - angled perspective as geometric rings and fragments assemble
  {
    t: 0.38,
    pos: new THREE.Vector3(5.5, 3.8, 24),
    target: new THREE.Vector3(0, 0, -2),
    fov: 48,
  },
  // 0.52: The AROOH Reveal - elevated hero perspective maintaining clean clearance above lower-third card
  {
    t: 0.52,
    pos: new THREE.Vector3(0, 1.4, 26.5),
    target: new THREE.Vector3(0, 1.4, 0),
    fov: 48,
  },
  // 0.70: Six Combat Arenas - Wide tactical arena view
  {
    t: 0.70,
    pos: new THREE.Vector3(-8.0, 4.8, 8.0),
    target: new THREE.Vector3(-4.0, 1.5, -15),
    fov: 52,
  },
  // 0.78: Cinematic Scroll Buffer - Arenas dissolve, clean expanse over cyber grid
  {
    t: 0.78,
    pos: new THREE.Vector3(-8.0, 4.5, 8.0),
    target: new THREE.Vector3(-4.0, 1.5, -15),
    fov: 50,
  },
  // 0.84: Timeline Day 01 - Camera locks Z depth and glides along the left flank
  {
    t: 0.84,
    pos: new THREE.Vector3(-6.0, 4.5, 8.0),
    target: new THREE.Vector3(-2.0, 1.5, -15),
    fov: 50,
  },
  // 0.92: Timeline Day 02 - Camera tracks laterally across X to the center
  {
    t: 0.92,
    pos: new THREE.Vector3(2.0, 4.5, 8.0),
    target: new THREE.Vector3(5.0, 1.5, -15),
    fov: 50,
  },
  // 1.00: Timeline Backers & Finale - Camera finishes lateral track to the right flank
  {
    t: 1.0,
    pos: new THREE.Vector3(10.0, 4.5, 8.0),
    target: new THREE.Vector3(13.0, 1.5, -15),
    fov: 50,
  },
];

const _evalCamPos = new THREE.Vector3();
const _evalCamTarget = new THREE.Vector3();

// Helper to interpolate camera smoothly between waypoints (zero per-frame allocations)
export function evaluateCamera(progress: number): {
  pos: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
} {
  const clamped = Math.max(0, Math.min(1, progress));
  const points = CAMERA_WAYPOINTS;

  let i = 0;
  while (i < points.length - 1 && clamped > points[i + 1].t) {
    i++;
  }

  if (i >= points.length - 1) {
    const last = points[points.length - 1];
    _evalCamPos.copy(last.pos);
    _evalCamTarget.copy(last.target);
    return { pos: _evalCamPos, target: _evalCamTarget, fov: last.fov };
  }

  const p0 = points[i];
  const p1 = points[i + 1];
  const localT = (clamped - p0.t) / (p1.t - p0.t);

  // Smooth cubic ease (smoothstep)
  const ease = localT * localT * (3 - 2 * localT);

  _evalCamPos.lerpVectors(p0.pos, p1.pos, ease);
  _evalCamTarget.lerpVectors(p0.target, p1.target, ease);
  const fov = THREE.MathUtils.lerp(p0.fov, p1.fov, ease);

  return { pos: _evalCamPos, target: _evalCamTarget, fov };
}
