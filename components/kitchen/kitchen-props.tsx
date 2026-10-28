"use client";

import type { Station } from "@/lib/kitchen/spike-orders";
import { GlbModel } from "./glb-model";

const WOOD = "#d9a066", CREAM = "#f4e6c8";

/** Vòng sáng quanh vật đang đứng gần (gợi ý bấm E). */
export function Ring({ r, on }: { r: number; on: boolean }) {
  return on ? <mesh rotation-x={-Math.PI / 2} position-y={0.03}><ringGeometry args={[r + 0.1, r + 0.28, 40]} /><meshBasicMaterial color="#ffd54a" /></mesh> : null;
}

const APPLIANCE: Record<string, { model: string; size: number; y: number }> = {
  steamer: { model: "steamer", size: 1.3, y: 0.96 },
  soy: { model: "pot-stew", size: 1.2, y: 0.96 },
  griddle: { model: "frying-pan", size: 1.4, y: 0.96 },
};

/** Bếp: bệ gỗ dựng bằng khối + thiết bị là mô hình CC0 (xửng hấp, nồi, chảo). */
export function StationMesh({ s, near, busy }: { s: Station; near: boolean; busy: boolean }) {
  const a = APPLIANCE[s.id];
  return (
    <group position={[s.x, 0, s.z]}>
      <mesh position-y={0.45} castShadow receiveShadow><boxGeometry args={[1.9, 0.9, 1.5]} /><meshStandardMaterial color={CREAM} /></mesh>
      <mesh position-y={0.92} castShadow><boxGeometry args={[2, 0.08, 1.6]} /><meshStandardMaterial color={WOOD} /></mesh>
      <group position-y={a.y}><GlbModel name={a.model} size={a.size} /></group>
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

const CHAR_SIZE = 2.1;
export const CARRY_MODEL: Record<string, string> = { steamer: "dim-sum", soy: "cup-tea", griddle: "pancakes" };

/** Người (đầu bếp hoặc khách) từ nhân vật khối CC0 của Kenney, có hoạt ảnh idle/walk/holding-both/emote-yes...; đầu bếp có thêm mũ trắng. `carry` là món đang cầm. */
export function Character({ skin, hat, animation, carry }: { skin: string; hat?: boolean; animation: string; carry?: string | null }) {
  return (
    <group>
      <GlbModel name={`character-${skin}`} size={CHAR_SIZE} animation={animation} />
      {hat && <mesh position-y={CHAR_SIZE + 0.1} castShadow><cylinderGeometry args={[0.24, 0.3, 0.38, 16]} /><meshStandardMaterial color="#ffffff" /></mesh>}
      {carry && <group position={[0, CHAR_SIZE * 0.5, CHAR_SIZE * 0.25]}><GlbModel name={CARRY_MODEL[carry]} size={0.5} /></group>}
    </group>
  );
}
