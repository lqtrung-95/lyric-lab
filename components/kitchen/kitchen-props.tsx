"use client";

import type { Station } from "@/lib/kitchen/spike-orders";

const WOOD = "#d9a066", RED = "#d94a3a", CREAM = "#f4e6c8", STEEL = "#9aa4ad", DARK = "#2f3b3a";

/** Vòng sáng quanh vật đang đứng gần (gợi ý bấm E). */
export function Ring({ r, on }: { r: number; on: boolean }) {
  return on ? <mesh rotation-x={-Math.PI / 2} position-y={0.03}><ringGeometry args={[r + 0.1, r + 0.28, 40]} /><meshBasicMaterial color="#ffd54a" /></mesh> : null;
}

/** Bếp: bệ gỗ + thiết bị theo loại (xửng hấp tre xếp tầng, nồi sữa đậu nành, bếp sắt phẳng). Dựng bằng hình khối để không phụ thuộc mô hình ngoài ở bản thử. */
export function StationMesh({ s, near, busy }: { s: Station; near: boolean; busy: boolean }) {
  return (
    <group position={[s.x, 0, s.z]}>
      <mesh position-y={0.45} castShadow receiveShadow><boxGeometry args={[1.9, 0.9, 1.5]} /><meshStandardMaterial color={CREAM} /></mesh>
      <mesh position-y={0.92} castShadow><boxGeometry args={[2, 0.08, 1.6]} /><meshStandardMaterial color={WOOD} /></mesh>
      {s.id === "steamer" && [0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 1.2 + i * 0.26, 0]} castShadow><cylinderGeometry args={[0.62, 0.62, 0.24, 24]} /><meshStandardMaterial color={i === 2 ? "#c98a4b" : "#e0b472"} /></mesh>
      ))}
      {s.id === "soy" && <>
        <mesh position-y={1.45} castShadow><cylinderGeometry args={[0.5, 0.58, 0.9, 24]} /><meshStandardMaterial color={STEEL} metalness={0.4} roughness={0.4} /></mesh>
        <mesh position-y={1.95} castShadow><sphereGeometry args={[0.5, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#c5ccd2" /></mesh>
      </>}
      {s.id === "griddle" && <>
        <mesh position-y={1.02} castShadow><cylinderGeometry args={[0.72, 0.72, 0.1, 28]} /><meshStandardMaterial color={DARK} /></mesh>
        <mesh position={[0.6, 1.1, 0.4]} rotation-y={0.6}><boxGeometry args={[0.7, 0.04, 0.12]} /><meshStandardMaterial color={STEEL} /></mesh>
      </>}
      {busy && <mesh position-y={2.7}><sphereGeometry args={[0.18, 12, 12]} /><meshBasicMaterial color="#ffd54a" /></mesh>}
      <Ring r={s.r} on={near} />
    </group>
  );
}

export function TableMesh({ x, z, near }: { x: number; z: number; near: boolean }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position-y={0.7} castShadow receiveShadow><cylinderGeometry args={[1, 1, 0.12, 32]} /><meshStandardMaterial color="#c9763a" /></mesh>
      <mesh position-y={0.35}><cylinderGeometry args={[0.18, 0.3, 0.7, 12]} /><meshStandardMaterial color="#8b4f27" /></mesh>
      <mesh position={[0.3, 0.8, 0.2]}><cylinderGeometry args={[0.16, 0.12, 0.14, 16]} /><meshStandardMaterial color="#f4f8ff" /></mesh>
      <Ring r={1.1} on={near} />
    </group>
  );
}

/** Người (đầu bếp hoặc khách): thân tròn, đầu cầu, mũ đầu bếp tùy chọn. */
export function Person({ body, hat, hair, carry }: { body: string; hat?: boolean; hair: string; carry?: string | null }) {
  return (
    <group>
      <mesh position-y={0.55} castShadow><capsuleGeometry args={[0.32, 0.5, 6, 14]} /><meshStandardMaterial color={body} /></mesh>
      <mesh position-y={1.2} castShadow><sphereGeometry args={[0.3, 18, 14]} /><meshStandardMaterial color="#f2c9a5" /></mesh>
      <mesh position-y={1.32} position-z={-0.04}><sphereGeometry args={[0.31, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={hair} /></mesh>
      {hat && <mesh position-y={1.62} castShadow><cylinderGeometry args={[0.24, 0.3, 0.34, 16]} /><meshStandardMaterial color="#ffffff" /></mesh>}
      <mesh position={[0.1, 1.2, 0.27]}><sphereGeometry args={[0.04, 8, 8]} /><meshBasicMaterial color="#222" /></mesh>
      <mesh position={[-0.1, 1.2, 0.27]}><sphereGeometry args={[0.04, 8, 8]} /><meshBasicMaterial color="#222" /></mesh>
      {carry && <mesh position={[0, 0.9, 0.5]} castShadow><cylinderGeometry args={[0.28, 0.28, 0.12, 16]} /><meshStandardMaterial color={RED} /></mesh>}
    </group>
  );
}
