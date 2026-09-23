import * as THREE from "three";

export interface CyberFragment {
  targetPos: THREE.Vector3;
  targetRot: THREE.Euler;
  targetScale: THREE.Vector3;
  startPos: THREE.Vector3;
  startRot: THREE.Euler;
  spiralRadius: number;
  spiralSpeed: number;
  letterIndex: number;
  delay: number;
}

// Generate sleek, high-impact cybernetic architectural sculpture for "A", "R", "O", "O", "H"
export function generateAroohFragments(): {
  fragments: CyberFragment[];
  instancedMesh: THREE.InstancedMesh;
} {
  const fragments: CyberFragment[] = [];

  const addPiece = (
    centerX: number,
    lx: number,
    ly: number,
    lz: number,
    w: number,
    h: number,
    d: number,
    rotZ: number,
    letterIdx: number,
    delayOffset: number
  ) => {
    const tx = centerX + lx;
    const ty = ly;
    const tz = lz;

    // Dispersed vortex coordinates: spiral galaxy starting positions
    const spiralAngle = Math.random() * Math.PI * 2;
    const spiralRadius = 25 + Math.random() * 45;
    const sx = tx + Math.cos(spiralAngle) * spiralRadius;
    const sy = ty + Math.sin(spiralAngle) * spiralRadius * 0.8;
    const sz = -50 - Math.random() * 80;

    const sRotX = (Math.random() - 0.5) * 4.0;
    const sRotY = (Math.random() - 0.5) * 4.0;
    const sRotZ = rotZ + (Math.random() - 0.5) * 4.0;

    fragments.push({
      targetPos: new THREE.Vector3(tx, ty, tz),
      targetRot: new THREE.Euler(0, 0, rotZ),
      targetScale: new THREE.Vector3(w, h, d),
      startPos: new THREE.Vector3(sx, sy, sz),
      startRot: new THREE.Euler(sRotX, sRotY, sRotZ),
      spiralRadius,
      spiralSpeed: 2.0 + Math.random() * 4.0,
      letterIndex: letterIdx,
      delay: delayOffset,
    });
  };

  const depth = 1.6;

  // 1. LETTER 'A' (center at x = -13.6)
  const ax = -13.6;
  addPiece(ax, -1.2, 0, 0, 1.15, 8.4, depth, 0.22, 0, 0.0);      // Left strut
  addPiece(ax, 1.2, 0, 0, 1.15, 8.4, depth, -0.22, 0, 0.04);     // Right strut
  addPiece(ax, 0, -0.4, 0, 2.6, 1.0, depth * 1.1, 0, 0, 0.08);   // Crossbar
  addPiece(ax, 0, 3.8, 0, 1.6, 1.0, depth * 1.15, 0, 0, 0.12);   // Crown apex
  addPiece(ax, -1.9, -3.8, 0, 1.4, 0.8, depth * 1.2, 0, 0, 0.16); // Left foot
  addPiece(ax, 1.9, -3.8, 0, 1.4, 0.8, depth * 1.2, 0, 0, 0.20);  // Right foot

  // 2. LETTER 'R' (center at x = -6.8)
  const rx = -6.8;
  addPiece(rx, -1.8, 0, 0, 1.2, 8.2, depth, 0, 1, 0.05);          // Spine
  addPiece(rx, 0.6, 3.6, 0, 3.4, 1.1, depth * 1.1, 0, 1, 0.10);  // Upper ceiling
  addPiece(rx, 0.6, 0.6, 0, 3.4, 1.1, depth * 1.1, 0, 1, 0.15);  // Mid bridge
  addPiece(rx, 2.1, 2.1, 0, 1.15, 2.6, depth, 0, 1, 0.20);        // Outer curve
  addPiece(rx, 1.1, -1.9, 0, 1.2, 4.8, depth, -0.52, 1, 0.25);    // Diagonal blade leg
  addPiece(rx, -1.8, -3.8, 0, 1.5, 0.8, depth * 1.2, 0, 1, 0.30); // Base foot

  // 3. LETTER 'O' #1 (center at x = 0.0)
  const o1x = 0.0;
  addPiece(o1x, -1.9, 0, 0, 1.2, 6.2, depth, 0, 2, 0.10);        // Left column
  addPiece(o1x, 1.9, 0, 0, 1.2, 6.2, depth, 0, 2, 0.15);         // Right column
  addPiece(o1x, 0, 3.6, 0, 4.8, 1.15, depth * 1.1, 0, 2, 0.20);   // Top header
  addPiece(o1x, 0, -3.6, 0, 4.8, 1.15, depth * 1.1, 0, 2, 0.25);  // Bottom base
  addPiece(o1x, -1.5, 2.8, 0, 0.9, 0.9, depth * 1.2, 0.78, 2, 0.30); // Bevel top-left
  addPiece(o1x, 1.5, 2.8, 0, 0.9, 0.9, depth * 1.2, -0.78, 2, 0.35); // Bevel top-right

  // 4. LETTER 'O' #2 (center at x = 6.8)
  const o2x = 6.8;
  addPiece(o2x, -1.9, 0, 0, 1.2, 6.2, depth, 0, 3, 0.15);        // Left column
  addPiece(o2x, 1.9, 0, 0, 1.2, 6.2, depth, 0, 3, 0.20);         // Right column
  addPiece(o2x, 0, 3.6, 0, 4.8, 1.15, depth * 1.1, 0, 3, 0.25);   // Top header
  addPiece(o2x, 0, -3.6, 0, 4.8, 1.15, depth * 1.1, 0, 3, 0.30);  // Bottom base
  addPiece(o2x, -1.5, 2.8, 0, 0.9, 0.9, depth * 1.2, 0.78, 3, 0.35); // Bevel top-left
  addPiece(o2x, 1.5, 2.8, 0, 0.9, 0.9, depth * 1.2, -0.78, 3, 0.40); // Bevel top-right

  // 5. LETTER 'H' (center at x = 13.6)
  const hx = 13.6;
  addPiece(hx, -1.9, 0, 0, 1.2, 8.2, depth, 0, 4, 0.20);         // Left pillar
  addPiece(hx, 1.9, 0, 0, 1.2, 8.2, depth, 0, 4, 0.25);          // Right pillar
  addPiece(hx, 0, 0, 0, 3.8, 1.2, depth * 1.15, 0, 4, 0.30);     // Central bridge
  addPiece(hx, -1.9, -3.8, 0, 1.5, 0.8, depth * 1.2, 0, 4, 0.35); // Left base
  addPiece(hx, 1.9, -3.8, 0, 1.5, 0.8, depth * 1.2, 0, 4, 0.40);  // Right base

  // High-End Cyber Metallic Armor with Pulsing Ruby Emissive Edges
  const geom = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x111118,
    emissive: 0xff1744,
    emissiveIntensity: 0.85,
    roughness: 0.12,
    metalness: 0.92,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    reflectivity: 0.9,
  });

  const instancedMesh = new THREE.InstancedMesh(geom, mat, fragments.length);
  instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  const dummy = new THREE.Object3D();
  fragments.forEach((frag, i) => {
    dummy.position.copy(frag.startPos);
    dummy.rotation.copy(frag.startRot);
    dummy.scale.set(0.001, 0.001, 0.001);
    dummy.updateMatrix();
    instancedMesh.setMatrixAt(i, dummy.matrix);
  });
  instancedMesh.instanceMatrix.needsUpdate = true;

  return { fragments, instancedMesh };
}
