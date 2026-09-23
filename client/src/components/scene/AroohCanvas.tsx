import React, { useEffect, useRef, memo } from "react";
import * as THREE from "three";
import { FontLoader, Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { evaluateCamera, TRACKS } from "./sceneData";
import { scrollController } from "./useScrollProgress";

interface AroohCanvasProps {
  progress?: number;
}

interface LetterNode {
  mesh: THREE.Mesh;
  wireMesh: THREE.Mesh;
  material: THREE.MeshPhysicalMaterial;
  wireMaterial: THREE.MeshBasicMaterial;
  targetPos: THREE.Vector3;
  startPos: THREE.Vector3;
  startRot: THREE.Euler;
  targetRot: THREE.Euler;
  delay: number;
}

interface FragmentNode {
  group: THREE.Group;
  mesh: THREE.Mesh;
  edges: THREE.LineSegments;
  startPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  startRot: THREE.Euler;
  targetRot: THREE.Euler;
  delay: number;
}

function createCircleTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.3, "rgba(255,50,65,0.8)");
    gradient.addColorStop(0.7, "rgba(229,36,42,0.15)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(32, 32, 32, 0, Math.PI * 2);
    ctx.fill();
  }
  return new THREE.CanvasTexture(canvas);
}

export const AroohCanvas: React.FC<AroohCanvasProps> = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // =========================================================================
    // 1. SCENE SETUP & ATMOSPHERIC FOG
    // =========================================================================
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020204);
    scene.fog = new THREE.FogExp2(0x020204, 0.0075);

    const camera = new THREE.PerspectiveCamera(
      48,
      container.clientWidth / container.clientHeight,
      0.1,
      600
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      alpha: false,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // =========================================================================
    // 2. CONTROLLED LIGHTING SYSTEM (CHIAROSCURO CONTRAST)
    // =========================================================================
    const ambientLight = new THREE.AmbientLight(0x08080f, 0.45);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(22, 28, 24);
    scene.add(keyLight);

    const cyanRimLight = new THREE.DirectionalLight(0x00e5ff, 0.35);
    cyanRimLight.position.set(-28, 14, -12);
    scene.add(cyanRimLight);

    const warmFillLight = new THREE.DirectionalLight(0xff4400, 0.25);
    warmFillLight.position.set(18, -15, 10);
    scene.add(warmFillLight);

    const corePointLight = new THREE.PointLight(0xff1744, 1.2, 35, 1.6);
    corePointLight.position.set(0, 0.2, -2.5);
    scene.add(corePointLight);

    const nodePointLight = new THREE.PointLight(0xff1744, 3.8, 28, 1.8);
    scene.add(nodePointLight);

    // Shared Materials
    const darkMetalMat = new THREE.MeshPhysicalMaterial({
      color: 0x09090e,
      roughness: 0.22,
      metalness: 0.94,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
    });

    const graphiteMat = new THREE.MeshPhysicalMaterial({
      color: 0x13131c,
      roughness: 0.35,
      metalness: 0.88,
      clearcoat: 0.5,
    });

    const edgeLineMat = new THREE.LineBasicMaterial({
      color: 0x3a3a4c,
      transparent: true,
      opacity: 0.6,
    });

    // =========================================================================
    // 3. FOREGROUND PARALLAX OBJECT (BRUSHES PAST CAMERA AT 0% -> 22%)
    // =========================================================================
    const fgGroup = new THREE.Group();
    fgGroup.position.set(-8.8, -1.6, 31.5);
    fgGroup.rotation.set(0.18, 0.38, -0.12);

    const fgShape = new THREE.Shape();
    fgShape.moveTo(-2.2, -1.4);
    fgShape.lineTo(2.4, -1.4);
    fgShape.lineTo(3.2, 0.4);
    fgShape.lineTo(1.6, 1.6);
    fgShape.lineTo(-1.8, 1.6);
    fgShape.lineTo(-2.6, 0.2);
    fgShape.closePath();

    const fgGeo = new THREE.ExtrudeGeometry(fgShape, {
      depth: 0.45,
      bevelEnabled: true,
      bevelThickness: 0.12,
      bevelSize: 0.1,
      bevelSegments: 3,
    });
    fgGeo.center();

    const fgMesh = new THREE.Mesh(fgGeo, darkMetalMat);
    const fgEdges = new THREE.LineSegments(new THREE.EdgesGeometry(fgGeo, 25), edgeLineMat);
    fgMesh.add(fgEdges);
    fgGroup.add(fgMesh);
    fgGroup.visible = false;
    scene.add(fgGroup);

    // =========================================================================
    // 4. DISTANT MONOLITHS (3 COLOSSAL STRUCTURES VEILED IN ATMOSPHERIC FOG)
    // =========================================================================
    const monolithGroup = new THREE.Group();
    scene.add(monolithGroup);

    const monolithConfigs = [
      { pos: new THREE.Vector3(-44, 22, -170), size: [16, 95, 16] as [number, number, number], seamX: 8.05 },
      { pos: new THREE.Vector3(50, 30, -210), size: [20, 130, 20] as [number, number, number], seamX: -10.05 },
      { pos: new THREE.Vector3(0, 38, -250), size: [28, 160, 28] as [number, number, number], seamX: 0 },
    ];

    const monolithMeshes: { mesh: THREE.Mesh; seam: THREE.Mesh }[] = [];

    monolithConfigs.forEach((cfg) => {
      const mGeo = new THREE.BoxGeometry(...cfg.size);
      const mMesh = new THREE.Mesh(mGeo, darkMetalMat);
      mMesh.position.copy(cfg.pos);

      const seamGeo = new THREE.PlaneGeometry(0.3, cfg.size[1] * 0.85);
      const seamMat = new THREE.MeshBasicMaterial({
        color: 0xff1744,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
      });
      const seamMesh = new THREE.Mesh(seamGeo, seamMat);
      seamMesh.position.set(cfg.seamX, 0, cfg.size[2] * 0.51);
      mMesh.add(seamMesh);

      const mEdges = new THREE.LineSegments(new THREE.EdgesGeometry(mGeo), edgeLineMat);
      mMesh.add(mEdges);

      monolithGroup.add(mMesh);
      monolithMeshes.push({ mesh: mMesh, seam: seamMesh });
    });

    // =========================================================================
    // 5. THE AROOH CORE (CENTRAL TECHNOLOGICAL HEART BEHIND AROOH)
    // =========================================================================
    const coreRootGroup = new THREE.Group();
    coreRootGroup.position.set(0, 1.6, -2.5);
    scene.add(coreRootGroup);

    const innerCoreGeo = new THREE.IcosahedronGeometry(1.7, 1);
    const innerCoreMat = new THREE.MeshPhysicalMaterial({
      color: 0x07070a,
      roughness: 0.15,
      metalness: 0.96,
      clearcoat: 1.0,
      emissive: 0x440008,
      emissiveIntensity: 0.2,
    });
    const innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    coreRootGroup.add(innerCoreMesh);

    const innerCoreWireMat = new THREE.MeshBasicMaterial({
      color: 0xff1744,
      wireframe: true,
      transparent: true,
      opacity: 0.0,
    });
    const innerCoreWire = new THREE.Mesh(innerCoreGeo, innerCoreWireMat);
    coreRootGroup.add(innerCoreWire);

    const corePlates: { mesh: THREE.Mesh; basePos: THREE.Vector3; expandDir: THREE.Vector3 }[] = [];
    const plateShape = new THREE.Shape();
    plateShape.moveTo(-1.6, -0.7);
    plateShape.lineTo(1.6, -0.7);
    plateShape.lineTo(2.1, 0.7);
    plateShape.lineTo(-2.1, 0.7);
    plateShape.closePath();

    const plateGeo = new THREE.ExtrudeGeometry(plateShape, {
      depth: 0.35,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.08,
      bevelSegments: 2,
    });
    plateGeo.center();

    const plateConfigs = [
      { pos: new THREE.Vector3(0, 2.3, 0), rot: new THREE.Euler(0, 0, 0), dir: new THREE.Vector3(0, 1.6, 0) },
      { pos: new THREE.Vector3(0, -2.3, 0), rot: new THREE.Euler(0, 0, Math.PI), dir: new THREE.Vector3(0, -1.6, 0) },
      { pos: new THREE.Vector3(-2.5, 0, 0), rot: new THREE.Euler(0, 0, Math.PI / 2), dir: new THREE.Vector3(-1.6, 0, 0) },
      { pos: new THREE.Vector3(2.5, 0, 0), rot: new THREE.Euler(0, 0, -Math.PI / 2), dir: new THREE.Vector3(1.6, 0, 0) },
    ];

    plateConfigs.forEach((cfg) => {
      const pMesh = new THREE.Mesh(plateGeo, darkMetalMat);
      pMesh.position.copy(cfg.pos);
      pMesh.rotation.copy(cfg.rot);

      const pEdges = new THREE.LineSegments(new THREE.EdgesGeometry(plateGeo), edgeLineMat);
      pMesh.add(pEdges);

      coreRootGroup.add(pMesh);
      corePlates.push({ mesh: pMesh, basePos: cfg.pos.clone(), expandDir: cfg.dir });
    });

    // =========================================================================
    // 6. FLOATING GEOMETRIC FRAGMENTS (EXACTLY 7 MAJOR STRUCTURAL ELEMENTS)
    // =========================================================================
    const fragmentRootGroup = new THREE.Group();
    fragmentRootGroup.visible = false;
    scene.add(fragmentRootGroup);

    const fragmentNodes: FragmentNode[] = [];

    function createFragmentGeometry(type: number): THREE.BufferGeometry {
      const s = new THREE.Shape();
      if (type === 0) {
        s.moveTo(-3.2, -1.2);
        s.lineTo(3.4, -0.6);
        s.lineTo(2.6, 1.4);
        s.lineTo(-1.8, 1.8);
      } else if (type === 1) {
        s.moveTo(-2.4, -1.8);
        s.lineTo(2.8, -1.2);
        s.lineTo(1.8, 1.9);
        s.lineTo(-2.8, 1.3);
      } else if (type === 2) {
        s.moveTo(-2.8, -1.0);
        s.lineTo(3.0, -1.0);
        s.lineTo(2.0, 1.2);
        s.lineTo(0.5, 0.8);
        s.lineTo(-0.8, 1.6);
      } else {
        s.moveTo(-2.2, -1.5);
        s.lineTo(1.8, -1.7);
        s.lineTo(3.0, 0.2);
        s.lineTo(1.5, 1.8);
        s.lineTo(-1.6, 1.6);
        s.lineTo(-2.8, 0.1);
      }
      s.closePath();

      const geo = new THREE.ExtrudeGeometry(s, {
        depth: 0.5,
        bevelEnabled: true,
        bevelThickness: 0.16,
        bevelSize: 0.12,
        bevelSegments: 3,
      });
      geo.center();
      return geo;
    }

    const fragmentConfigs = [
      {
        type: 0,
        startPos: new THREE.Vector3(-38, 22, -45),
        targetPos: new THREE.Vector3(-18.5, 7.8, -3.2),
        startRot: new THREE.Euler(0.6, -0.8, 0.4),
        targetRot: new THREE.Euler(0.08, 0.15, -0.1),
        delay: 0.0,
      },
      {
        type: 1,
        startPos: new THREE.Vector3(42, 24, -55),
        targetPos: new THREE.Vector3(18.8, 8.2, -3.0),
        startRot: new THREE.Euler(-0.5, 0.7, -0.3),
        targetRot: new THREE.Euler(-0.06, -0.14, 0.08),
        delay: 0.04,
      },
      {
        type: 2,
        startPos: new THREE.Vector3(-35, -5, -30),
        targetPos: new THREE.Vector3(-21.0, 0.4, -2.2),
        startRot: new THREE.Euler(0.8, 0.4, -0.5),
        targetRot: new THREE.Euler(0.0, 0.22, 0.02),
        delay: 0.08,
      },
      {
        type: 3,
        startPos: new THREE.Vector3(38, -6, -38),
        targetPos: new THREE.Vector3(21.2, -0.2, -2.4),
        startRot: new THREE.Euler(-0.7, -0.5, 0.6),
        targetRot: new THREE.Euler(0.0, -0.20, -0.04),
        delay: 0.12,
      },
      {
        type: 0,
        startPos: new THREE.Vector3(-32, -20, -40),
        targetPos: new THREE.Vector3(-17.5, -6.8, -3.5),
        startRot: new THREE.Euler(-0.4, 0.9, 0.3),
        targetRot: new THREE.Euler(-0.1, 0.12, 0.14),
        delay: 0.16,
      },
      {
        type: 1,
        startPos: new THREE.Vector3(34, -18, -48),
        targetPos: new THREE.Vector3(17.8, -7.0, -3.2),
        startRot: new THREE.Euler(0.5, -0.7, -0.4),
        targetRot: new THREE.Euler(0.12, -0.15, -0.12),
        delay: 0.20,
      },
      {
        type: 2,
        startPos: new THREE.Vector3(0, 36, -70),
        targetPos: new THREE.Vector3(0, 11.2, -4.5),
        startRot: new THREE.Euler(1.2, 0, 0),
        targetRot: new THREE.Euler(0.05, 0, 0),
        delay: 0.24,
      },
    ];

    fragmentConfigs.forEach((cfg) => {
      const fGroup = new THREE.Group();
      const geo = createFragmentGeometry(cfg.type);
      const mesh = new THREE.Mesh(geo, graphiteMat);

      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeLineMat);
      mesh.add(edges);

      fGroup.position.copy(cfg.startPos);
      fGroup.rotation.copy(cfg.startRot);
      fGroup.add(mesh);

      fragmentRootGroup.add(fGroup);
      fragmentNodes.push({
        group: fGroup,
        mesh,
        edges,
        startPos: cfg.startPos,
        targetPos: cfg.targetPos,
        startRot: cfg.startRot,
        targetRot: cfg.targetRot,
        delay: cfg.delay,
      });
    });

    // =========================================================================
    // 7. CONDUCTIVE CIRCUIT NETWORK (3 THIN 3D PHYSICAL PATHWAYS)
    // =========================================================================
    const circuitGroup = new THREE.Group();
    scene.add(circuitGroup);

    const curve1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-42, 10, -165),
      new THREE.Vector3(-22, 6, -60),
      new THREE.Vector3(-7, 2.5, -12),
      new THREE.Vector3(0, 0.2, -2.5),
      new THREE.Vector3(8, -2, 12),
      new THREE.Vector3(15, -4, 26),
    ]);

    const curve2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(48, 14, -180),
      new THREE.Vector3(24, 8, -70),
      new THREE.Vector3(8, -1.8, -14),
      new THREE.Vector3(0, 0.2, -2.5),
      new THREE.Vector3(-10, 3, 10),
      new THREE.Vector3(-18, 5, 24),
    ]);

    const curve3 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 35, -120),
      new THREE.Vector3(0, 16, -40),
      new THREE.Vector3(0, 0.2, -2.5),
      new THREE.Vector3(0, -6.5, 8),
      new THREE.Vector3(0, -7.5, 30),
    ]);

    const curves = [curve1, curve2, curve3];
    const cableMat = new THREE.MeshStandardMaterial({
      color: 0x14141e,
      metalness: 0.92,
      roughness: 0.35,
    });

    curves.forEach((crv) => {
      const tubeGeo = new THREE.TubeGeometry(crv, 64, 0.032, 8, false);
      const tubeMesh = new THREE.Mesh(tubeGeo, cableMat);
      circuitGroup.add(tubeMesh);
    });

    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0xff1744,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const pulseGeo = new THREE.SphereGeometry(0.14, 16, 16);

    const circuitPulses = curves.map(() => {
      const pMesh = new THREE.Mesh(pulseGeo, pulseMat);
      scene.add(pMesh);
      return pMesh;
    });

    // =========================================================================
    // 8. 3D ORBITAL RINGS (AUTHENTIC DEPTH, TILTING AROUND AROOH CORE)
    // =========================================================================
    const ringGroup = new THREE.Group();
    ringGroup.position.set(0, 1.6, -2.5);
    scene.add(ringGroup);

    const primaryRingGeo = new THREE.TorusGeometry(8.6, 0.08, 16, 120);
    const primaryRingMat = new THREE.MeshPhysicalMaterial({
      color: 0x151520,
      metalness: 0.94,
      roughness: 0.18,
      clearcoat: 0.9,
    });
    const primaryRingMesh = new THREE.Mesh(primaryRingGeo, primaryRingMat);
    primaryRingMesh.rotation.set(0.55, -0.4, 0.2);
    ringGroup.add(primaryRingMesh);

    const innerWireRingGeo = new THREE.TorusGeometry(8.56, 0.02, 12, 100);
    const innerWireRingMat = new THREE.MeshBasicMaterial({
      color: 0xff1744,
      transparent: true,
      opacity: 0.4,
      wireframe: true,
    });
    const innerWireRingMesh = new THREE.Mesh(innerWireRingGeo, innerWireRingMat);
    primaryRingMesh.add(innerWireRingMesh);

    const secRingGeo = new THREE.TorusGeometry(12.2, 0.032, 12, 120);
    const secRingMat = new THREE.MeshPhysicalMaterial({
      color: 0x00e5ff,
      metalness: 0.85,
      roughness: 0.25,
      transparent: true,
      opacity: 0.35,
      wireframe: true,
    });
    const secRingMesh = new THREE.Mesh(secRingGeo, secRingMat);
    secRingMesh.rotation.set(-0.7, 0.5, -0.3);
    ringGroup.add(secRingMesh);

    // =========================================================================
    // 9. THE SINGLE RED ENERGY NODE (PRIMARY VISUAL LIGHT ANCHOR)
    // =========================================================================
    const energyNodeGroup = new THREE.Group();
    scene.add(energyNodeGroup);

    const energyCoreGeo = new THREE.SphereGeometry(0.24, 24, 24);
    const energyCoreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const energyCoreMesh = new THREE.Mesh(energyCoreGeo, energyCoreMat);
    energyNodeGroup.add(energyCoreMesh);

    const energyHaloGeo = new THREE.SphereGeometry(0.55, 16, 16);
    const energyHaloMat = new THREE.MeshBasicMaterial({
      color: 0xff1744,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const energyHaloMesh = new THREE.Mesh(energyHaloGeo, energyHaloMat);
    energyNodeGroup.add(energyHaloMesh);

    // =========================================================================
    // 10. 3D AROOH LETTERS LOADED WITH AVQEST FONT
    // =========================================================================
    const aroohGroup = new THREE.Group();
    aroohGroup.visible = false;
    scene.add(aroohGroup);

    // Dedicated illumination lights for AROOH 3D logo
    const logoFrontLight = new THREE.PointLight(0xff1744, 4.2, 65, 1.2);
    logoFrontLight.position.set(0, 3.8, 20);
    scene.add(logoFrontLight);

    const logoTopLight = new THREE.DirectionalLight(0xffffff, 1.4);
    logoTopLight.position.set(0, 16, 25);
    scene.add(logoTopLight);

    const letterNodes: LetterNode[] = [];
    const fontLoader = new FontLoader();

    fontLoader.load("/fonts/avqest.json", (font: Font) => {
      const letters = ["A", "R", "O", "O", "H"];
      const letterPositions = [-14.0, -7.0, 0.0, 7.0, 14.0];

      letters.forEach((char, index) => {
        const textGeo = new TextGeometry(char, {
          font: font,
          size: 7.2,
          depth: 1.8,
          curveSegments: 5,
          bevelEnabled: true,
          bevelThickness: 0.28,
          bevelSize: 0.16,
          bevelOffset: 0,
          bevelSegments: 2,
        });

        textGeo.computeBoundingBox();
        textGeo.center();

        // Darkish, ultra-vibrant crimson obsidian and laser wireframe matching Arooh's signature identity
        const material = new THREE.MeshPhysicalMaterial({
          color: 0x14141e,           // Dark brooding obsidian metal (prevents washed-out pastel pink)
          emissive: 0xff0525,        // Pure, saturated, intense crimson red core glow
          emissiveIntensity: 0.85,   // Deep vibrant glow
          roughness: 0.14,
          metalness: 0.88,
          clearcoat: 1.0,
          clearcoatRoughness: 0.05,
        });

        const wireMaterial = new THREE.MeshBasicMaterial({
          color: 0xff1744,           // Blazing electric laser red wireframe
          wireframe: true,
          transparent: true,
          opacity: 0.80,
          blending: THREE.AdditiveBlending,
        });

        const mesh = new THREE.Mesh(textGeo, material);
        const wireMesh = new THREE.Mesh(textGeo, wireMaterial);
        mesh.add(wireMesh);

        // Elevated target position gives ample breathing room for the lower-third manifesto card
        const targetPos = new THREE.Vector3(letterPositions[index], 1.6, 0);

        const angle = (index / letters.length) * Math.PI * 2 + 0.3;
        const radius = 28 + (index % 3) * 8;
        const startPos = new THREE.Vector3(
          targetPos.x + Math.cos(angle) * radius,
          targetPos.y + Math.sin(angle) * radius * 0.7,
          -80 - index * 8
        );

        const startRot = new THREE.Euler(0.35 * (index % 2 === 0 ? 1 : -1), 0.4, 0.15);
        const targetRot = new THREE.Euler(0, 0, 0);

        mesh.position.copy(startPos);
        mesh.rotation.copy(startRot);
        mesh.scale.set(0.0001, 0.0001, 0.0001);

        aroohGroup.add(mesh);

        letterNodes.push({
          mesh,
          wireMesh,
          material,
          wireMaterial,
          targetPos,
          startPos,
          startRot,
          targetRot,
          delay: index * 0.05,
        });
      });
    });

    // =========================================================================
    // 11. SPARSE ATMOSPHERIC PARTICLES
    // =========================================================================
    const particleCount = 750;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const colCore = new THREE.Color(0xffffff);
    const colNeonRed = new THREE.Color(0xff1744);
    const colDeepRed = new THREE.Color(0x880e4f);

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      const radius = 10 + Math.pow(Math.random(), 1.8) * 65;
      const angle = Math.random() * Math.PI * 2;
      const z = (Math.random() - 0.5) * 240 - 20;

      particlePositions[idx] = Math.cos(angle) * radius;
      particlePositions[idx + 1] = Math.sin(angle) * (radius * 0.65);
      particlePositions[idx + 2] = z;

      const r = Math.random();
      const col = r < 0.25 ? colNeonRed : r < 0.6 ? colCore : colDeepRed;
      particleColors[idx] = col.r;
      particleColors[idx + 1] = col.g;
      particleColors[idx + 2] = col.b;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleTex = createCircleTexture();
    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      map: particleTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // =========================================================================
    // 12. CYBER GRID TERRAIN (HORIZON GROUND)
    // =========================================================================
    const gridHelper = new THREE.GridHelper(260, 60, 0xff1744, 0x121220);
    gridHelper.position.set(0, -7.5, -45);
    scene.add(gridHelper);

    // =========================================================================
    // 13. 6 CYBERNETIC ARENA TRACK NODES (CHAPTER 4 ARENAS)
    // =========================================================================
    const trackMeshes: {
      id: string;
      group: THREE.Group;
      core: THREE.Mesh;
      ring: THREE.Mesh;
      beam: THREE.Mesh;
    }[] = [];

    TRACKS.forEach((track, i) => {
      const tg = new THREE.Group();

      let geom: THREE.BufferGeometry;
      switch (i % 6) {
        case 0: geom = new THREE.BoxGeometry(1.4, 1.4, 1.4); break;
        case 1: geom = new THREE.TorusKnotGeometry(0.7, 0.22, 64, 12); break;
        case 2: geom = new THREE.TetrahedronGeometry(1.2, 0); break;
        case 3: geom = new THREE.OctahedronGeometry(1.1, 0); break;
        case 4: geom = new THREE.IcosahedronGeometry(1.1, 0); break;
        default: geom = new THREE.DodecahedronGeometry(1.1, 0);
      }

      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(track.accent),
        emissive: new THREE.Color(track.accent),
        emissiveIntensity: 0.8,
        roughness: 0.15,
        metalness: 0.85,
      });
      const core = new THREE.Mesh(geom, mat);
      tg.add(core);

      const ringGeo = new THREE.TorusGeometry(1.8, 0.02, 12, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(track.accent),
        transparent: true,
        opacity: 0.6,
        wireframe: true,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      tg.add(ring);

      const beamGeo = new THREE.CylinderGeometry(0.04, 0.04, 20, 8);
      const beamMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(track.accent),
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.y = 10;
      tg.add(beam);

      // Spatial Combat Arena Coordinates
      const arenaPositions: Record<string, THREE.Vector3> = {
        hack: new THREE.Vector3(-13.5, 2.0, -12.5),      // Arena 01: Left Wing
        robo: new THREE.Vector3(0.0, 7.5, -20.0),        // Arena 02: Top Apex
        ctf: new THREE.Vector3(13.5, 2.2, -13.0),        // Arena 03: Right Wing
        ideathon: new THREE.Vector3(-11.0, -3.6, -18.0), // Arena 04: Lower Left
        esports: new THREE.Vector3(11.0, -3.4, -17.5),   // Arena 05: Lower Right
        quiz: new THREE.Vector3(0.0, -5.0, -25.0),       // Arena 06: Center Bottom
      };

      const basePos = arenaPositions[track.id] || new THREE.Vector3(0, 0, -20);
      tg.position.copy(basePos);
      tg.visible = false;
      scene.add(tg);
      trackMeshes.push({ id: track.id, group: tg, core, ring, beam });
    });

    // =========================================================================
    // 13. VOLUMETRIC STAGE LIGHT PILLARS FOR TIMELINE RUN OF SHOW (CH_05)
    // =========================================================================
    const timelinePillarsGroup = new THREE.Group();
    scene.add(timelinePillarsGroup);

    const pillarPositions = [
      { x: -14.0, z: -18.0, color: 0xff1744, radius: 0.6 }, // Stage 01 / Day 1 Flank
      { x: -6.0,  z: -22.0, color: 0xff3b42, radius: 0.4 }, // Checkpoint conduit
      { x: 0.0,   z: -20.0, color: 0xffd600, radius: 0.8 }, // Day 2 / Grand Awards Apex
      { x: 6.0,   z: -22.0, color: 0xff1744, radius: 0.4 }, // Checkpoint conduit
      { x: 14.0,  z: -18.0, color: 0xff0055, radius: 0.6 }, // Stage 04 / Finale Flank
    ];

    const pillarMeshes: THREE.Mesh[] = [];
    const pillarGeo = new THREE.CylinderGeometry(0.15, 1.2, 48, 16, 1, true);

    pillarPositions.forEach((pDef) => {
      const mat = new THREE.MeshBasicMaterial({
        color: pDef.color,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const pMesh = new THREE.Mesh(pillarGeo, mat);
      pMesh.position.set(pDef.x, 10, pDef.z);
      pMesh.scale.x = pDef.radius;
      pMesh.scale.z = pDef.radius;
      timelinePillarsGroup.add(pMesh);
      pillarMeshes.push(pMesh);
    });

    const timelineStageLight = new THREE.PointLight(0xff1744, 0, 50, 1.4);
    timelineStageLight.position.set(0, -2, 0);
    scene.add(timelineStageLight);

    // Pointer Parallax
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Pre-warm WebGL shaders to eliminate initial and mid-scroll compilation stutter
    try {
      renderer.compile(scene, camera);
    } catch {
      // ignore
    }

    // =========================================================================
    // AUTHORITATIVE RENDER LOOP (READS DIRECTLY FROM CENTRAL SCROLL CONTROLLER)
    // =========================================================================
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      // DIRECT READ FROM SINGLE SOURCE OF TRUTH (ZERO REACT RE-RENDER OVERHEAD)
      const p = scrollController.getRenderedProgress();
      const vel = Math.abs(scrollController.getVelocity());

      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      // 1. Camera Navigation (Smoothly interpolated from progress, 100% reversible)
      const { pos: camPos, target: camLook, fov: baseFov } = evaluateCamera(p);

      const warpFov = Math.min(4.5, vel * 2.5);
      camera.fov = baseFov + warpFov;
      camera.updateProjectionMatrix();

      if (!prefersReducedMotion) {
        camPos.x += mouse.x * 0.9;
        camPos.y += mouse.y * 0.6;
        const roll = Math.sin(p * Math.PI * 3) * 0.03 + mouse.x * 0.02;
        camera.rotation.z = roll;
      }

      camera.position.copy(camPos);
      camera.lookAt(camLook);

      // 2. Foreground Parallax Object (Sweeps past camera at 3% -> 22%)
      const fgProgress = Math.max(0, Math.min(1, (p - 0.03) / 0.19));
      fgGroup.position.x = -8.8 - fgProgress * 12;
      fgGroup.position.y = -1.6 - fgProgress * 6;
      fgGroup.rotation.y = 0.38 + fgProgress * 0.4;
      fgGroup.visible = p > 0.025 && p < 0.25;

      // 3. Distant Monoliths (Atmospheric breathing)
      monolithMeshes.forEach((m, idx) => {
        const seamMat = m.seam.material as THREE.MeshBasicMaterial;
        seamMat.opacity = Math.sin(elapsedTime * 1.5 + idx * 2.1) * 0.08 + 0.22;
      });

      // 4. The Arooh Core Progressive Activation (100% Reversible)
      const coreActive = p > 0.08;
      coreRootGroup.visible = coreActive && p < 0.95;

      if (coreRootGroup.visible) {
        const coreScaleP = Math.max(0, Math.min(1, (p - 0.08) / 0.32));
        coreRootGroup.scale.setScalar(coreScaleP);

        const coreRotSpeed = 0.25 + p * 0.5;
        innerCoreMesh.rotation.y = elapsedTime * coreRotSpeed;
        innerCoreMesh.rotation.x = elapsedTime * (coreRotSpeed * 0.7);

        const lightP = Math.max(0, Math.min(1, (p - 0.18) / 0.40));
        corePointLight.intensity = lightP * 3.6;
        innerCoreWireMat.opacity = lightP * 0.65;
        (innerCoreMesh.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.2 + lightP * 0.8;

        const separateP = Math.max(0, Math.min(1, (p - 0.36) / 0.24));
        const sepEase = 1 - Math.pow(1 - separateP, 3);

        corePlates.forEach((plate) => {
          plate.mesh.position.copy(plate.basePos).addScaledVector(plate.expandDir, sepEase * 1.5);
          plate.mesh.rotation.z += (1 - sepEase) * 0.02 * Math.sin(elapsedTime);
        });

        if (p > 0.68) {
          const fadeP = Math.max(0, 1 - (p - 0.68) / 0.22);
          coreRootGroup.scale.setScalar(fadeP * coreScaleP);
        }
      }

      // 5. 7 Structural Fragments Assembly (100% Reversible, zero per-frame allocations)
      fragmentRootGroup.visible = p >= 0.16 && p < 0.96;
      if (fragmentRootGroup.visible) {
        const assemblyStart = 0.18;
        const assemblyLock = 0.52;

        fragmentNodes.forEach((node) => {
          const localP = Math.max(0, Math.min(1, (p - (assemblyStart + node.delay * 0.15)) / (assemblyLock - assemblyStart)));
          const ease = localP === 1 ? 1 : 1 - Math.pow(2, -10 * localP);

          node.group.position.lerpVectors(node.startPos, node.targetPos, ease);
          if (localP < 1.0) {
            node.group.position.y += (1 - localP) * Math.sin(elapsedTime * 1.2 + node.delay * 5) * 0.8;
          }

          node.group.rotation.set(
            THREE.MathUtils.lerp(node.startRot.x, node.targetRot.x, ease),
            THREE.MathUtils.lerp(node.startRot.y, node.targetRot.y, ease),
            THREE.MathUtils.lerp(node.startRot.z, node.targetRot.z, ease)
          );

          if (p > 0.70) {
            const passP = (p - 0.70) / 0.25;
            node.group.scale.setScalar(Math.max(0.001, 1 - passP * 0.7));
          } else {
            node.group.scale.setScalar(Math.min(1, localP * 2.2));
          }
        });
      }

      // 6. Conductive Circuit Pulses (Deterministic scroll position)
      curves.forEach((crv, idx) => {
        const pulseMesh = circuitPulses[idx];
        const pulseT = ((p * 2.4 + elapsedTime * 0.12 + idx * 0.33) % 1 + 1) % 1;
        const pt = crv.getPointAt(pulseT);
        pulseMesh.position.copy(pt);
        pulseMesh.visible = p > 0.10 && p < 0.92;
      });

      // 7. 3D Orbital Rings Tilting & Occlusion
      if (p > 0.12) {
        ringGroup.visible = true;
        const ringScale = Math.min(1, (p - 0.12) / 0.28);
        ringGroup.scale.setScalar(ringScale);

        primaryRingMesh.rotation.z += 0.006 + vel * 0.02;
        primaryRingMesh.rotation.x = 0.55 + Math.sin(p * Math.PI) * 0.35;
        secRingMesh.rotation.y -= 0.008 + vel * 0.025;
        secRingMesh.rotation.z = -0.3 + Math.cos(p * Math.PI) * 0.25;

        if (p > 0.68) {
          const expandP = (p - 0.68) / 0.25;
          ringGroup.scale.setScalar(1 + expandP * 1.8);
          (primaryRingMesh.material as THREE.MeshPhysicalMaterial).opacity = Math.max(0, 1 - expandP);
        }
      } else {
        ringGroup.visible = false;
      }

      // 8. The Single Red Energy Node
      if (p > 0.14 && p < 0.95) {
        energyNodeGroup.visible = true;
        let nodePos: THREE.Vector3;

        if (p < 0.46) {
          const t = Math.max(0, Math.min(1, (p - 0.14) / 0.32));
          nodePos = curve1.getPointAt(t);
        } else if (p <= 0.70) {
          const orbitAngle = elapsedTime * 2.0 + (p - 0.46) * 12;
          const orbitRadius = 4.4;
          nodePos = new THREE.Vector3(
            Math.cos(orbitAngle) * orbitRadius,
            Math.sin(orbitAngle) * (orbitRadius * 0.7) + 0.2,
            -2.0 + Math.sin(orbitAngle * 2) * 1.5
          );
        } else {
          const climbP = (p - 0.70) / 0.25;
          nodePos = new THREE.Vector3(0, 4.4 + climbP * 12, -2.0 - climbP * 15);
        }

        energyNodeGroup.position.copy(nodePos);
        nodePointLight.position.copy(nodePos);

        const pulse = 3.2 + Math.sin(elapsedTime * 6) * 0.8;
        nodePointLight.intensity = pulse;
        energyHaloMesh.scale.setScalar(1 + Math.sin(elapsedTime * 6) * 0.25);
      } else {
        energyNodeGroup.visible = false;
        nodePointLight.intensity = 0;
      }

      // 9. 3D AvQest Letters Kinetic Assembly (100% Reversible)
      const textAssembleStart = 0.18;
      const textAssembleSnap = 0.50;
      const textDissolveStart = 0.68;
      const textDissolveEnd = 0.84;

      const baseAssembleP = Math.max(0, Math.min(1, (p - textAssembleStart) / (textAssembleSnap - textAssembleStart)));
      const dissolveP = Math.max(0, Math.min(1, (p - textDissolveStart) / (textDissolveEnd - textDissolveStart)));

      // Hide letters completely before assembly begins and after dissolve ends
      aroohGroup.visible = p >= textAssembleStart - 0.02 && p < textDissolveEnd + 0.05;

      if (aroohGroup.visible) {
        const snapPulse = 0.85 + Math.sin(elapsedTime * 4.0) * 0.25;
        logoFrontLight.intensity = (1.8 + baseAssembleP * 3.5) * (1 - dissolveP);

        letterNodes.forEach((node) => {
          const individualP = Math.max(0, Math.min(1, (baseAssembleP - node.delay * 0.25) / 0.75));
          const t = individualP;
          const ease = t === 1 ? 1 : 1 - Math.pow(2, -10 * t) * Math.cos((t * 10 - 0.75) * (2 * Math.PI) / 3);

          let posX = THREE.MathUtils.lerp(node.startPos.x, node.targetPos.x, ease);
          let posY = THREE.MathUtils.lerp(node.startPos.y, node.targetPos.y, ease);
          let posZ = THREE.MathUtils.lerp(node.startPos.z, node.targetPos.z, ease);

          if (individualP < 1.0) {
            const inv = 1 - individualP;
            const spiralRot = individualP * Math.PI * 3 + node.delay * 2;
            const currentRadius = 16 * inv;
            posX += Math.cos(spiralRot) * currentRadius * 0.4;
            posY += Math.sin(spiralRot) * currentRadius * 0.3;
          }

          if (dissolveP > 0) {
            posZ += dissolveP * 35;
            posX += Math.sin(node.delay * 10) * dissolveP * 18;
            posY += Math.cos(node.delay * 10) * dissolveP * 18;
          }

          node.mesh.position.set(posX, posY, posZ);

          if (individualP < 0.99) {
            const inv = 1 - individualP;
            node.mesh.rotation.set(
              THREE.MathUtils.lerp(node.startRot.x, node.targetRot.x, ease) + inv * (elapsedTime * 0.4),
              THREE.MathUtils.lerp(node.startRot.y, node.targetRot.y, ease) + inv * (elapsedTime * 0.5),
              THREE.MathUtils.lerp(node.startRot.z, node.targetRot.z, ease)
            );
          } else {
            node.mesh.rotation.copy(node.targetRot);
          }

          // Scale from 0 → 1 during assembly, then 1 → ~0 during dissolve
          const assembleScale = individualP * individualP * (3 - 2 * individualP);
          const dissolveScale = Math.max(0.001, 1 - dissolveP * 0.85);
          node.mesh.scale.setScalar(assembleScale * dissolveScale);

          // Dynamic glow and cyber wireframe effects
          if (individualP >= 0.92 && dissolveP === 0) {
            node.material.emissiveIntensity = 0.95 + snapPulse * 0.35;
            node.wireMaterial.opacity = 0.6 + Math.sin(elapsedTime * 5.0) * 0.25;
          } else {
            node.material.emissiveIntensity = 0.65 + individualP * 0.35;
            node.wireMaterial.opacity = 0.35 + individualP * 0.3;
          }
        });
      } else {
        logoFrontLight.intensity = 0;
      }

      // 10. Sparse Cosmic Particles Drift
      const posArray = particleGeo.attributes.position.array as Float32Array;
      const hyperSpeed = 0.03 + p * 0.15 + vel * 0.25;

      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        posArray[idx + 2] += hyperSpeed;

        if (posArray[idx + 2] > camera.position.z + 5) {
          posArray[idx + 2] = camera.position.z - 220;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // 11. Cyber Grid
      gridHelper.visible = p > 0.40;
      if (gridHelper.visible) {
        gridHelper.position.z = -45 + (elapsedTime * 6) % 4.3;
      }

      // 12. Track Arena Nodes (CH_04) - Fully dissolves and hides before timeline buffer
      const tracksActive = p > 0.62 && p < 0.77;
      trackMeshes.forEach((tm) => {
        tm.group.visible = tracksActive;
        if (!tracksActive) return;

        // Smooth scale in at 0.62->0.66, smooth scale out at 0.72->0.76
        const scaleIn = Math.max(0, Math.min(1, (p - 0.62) / 0.04));
        const scaleOut = Math.max(0, Math.min(1, (0.76 - p) / 0.04));
        const finalScale = scaleIn * scaleOut;
        tm.group.scale.setScalar(Math.max(0.0001, finalScale));

        // Subtle ambient rotation, constant calm aesthetics
        tm.core.rotation.x += 0.012;
        tm.core.rotation.y += 0.015;
        tm.ring.rotation.z -= 0.015;
      });

      // 13. Timeline Stage Volumetric Backlighting (CH_05) - subtle floor light, clean background
      const inTimeline = p >= 0.80;
      timelinePillarsGroup.visible = false;
      if (inTimeline) {
        const timelineFadeIn = Math.min(1, (p - 0.80) / 0.04);
        timelineStageLight.intensity = timelineFadeIn * 1.2;
        timelineStageLight.position.x = camPos.x;
        timelineStageLight.position.z = camPos.z - 10;
      } else {
        timelineStageLight.intensity = 0;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      renderer.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      particleTex.dispose();
      innerCoreGeo.dispose();
      innerCoreMat.dispose();
      primaryRingGeo.dispose();
      primaryRingMat.dispose();
      secRingGeo.dispose();
      secRingMat.dispose();
      fgGeo.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ background: "#040407" }}
      aria-hidden="true"
    />
  );
});

AroohCanvas.displayName = "AroohCanvas";
