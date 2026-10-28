"use client";

import type { ThreeEvent } from "@react-three/fiber";
import type { Station } from "@/lib/kitchen/spike-orders";
import { GlbModel } from "./glb-model";
import { HintArrow, Label, Steam, Stool } from "./kitchen-decor";

const WOOD = "#d9a066", CREAM = "#f6ead0";

/** Vòng sáng quanh vật đang đứng gần (gợi ý bấm E). */
export function Ring({ r, on }: { r: number; on: boolean }) {
  return on ? <mesh rotation-x={-Math.PI / 2} position-y={0.03}><ringGeometry args={[r + 0.1, r + 0.28, 40]} /><meshBasicMaterial color="#ffd54a" /></mesh> : null;
}

const APPLIANCE: Record<string, { model: string; size: number }> = {
  steamer: { model: "steamer", size: 1.3 },
  soy: { model: "pot-stew", size: 1.2 },
  griddle: { model: "frying-pan", size: 1.4 },
};
const tap = (fn: () => void) => (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); fn(); };

interface StationProps { s: Station; near: boolean; busy: boolean; hint: boolean; onTap: () => void }

/** Bếp: bệ gỗ bo góc + thiết bị là mô hình CC0 (xửng hấp, nồi, chảo), nhãn chữ Hán/pinyin nổi phía trên, hơi nước khi nấu. Chạm vào là tự đi tới và nấu. */
export function StationMesh({ s, near, busy, hint, onTap }: StationProps) {
  const a = APPLIANCE[s.id];
  return (
    <group position={[s.x, 0, s.z]} onPointerDown={tap(onTap)}>
      <mesh position-y={0.45} castShadow receiveShadow><boxGeometry args={[1.9, 0.9, 1.5]} /><meshStandardMaterial color={CREAM} /></mesh>
      <mesh position-y={0.93} castShadow><boxGeometry args={[2.05, 0.1, 1.65]} /><meshStandardMaterial color={WOOD} /></mesh>
      <group position-y={0.98}><GlbModel name={a.model} size={a.size} /></group>
      <Steam active={busy} position={[0, 1.7, 0]} />
      <Label han={s.han} pinyin={s.pinyin} position={[0, 3.0, 0.4]} active={hint} />
      {hint && <HintArrow position={[0, 3.75, 0]} />}
      <Ring r={s.r} on={near || hint} />
    </group>
  );
}

/** Bàn khách: mặt tròn, chân, ghế đẩu và bát đũa. */
export function TableMesh({ x, z, near, hint, onTap }: { x: number; z: number; near: boolean; hint: boolean; onTap: () => void }) {
  return (
    <group position={[x, 0, z]} onPointerDown={tap(onTap)}>
      <mesh position-y={0.72} castShadow receiveShadow><cylinderGeometry args={[1, 1, 0.12, 32]} /><meshStandardMaterial color="#c9763a" /></mesh>
      <mesh position-y={0.36}><cylinderGeometry args={[0.18, 0.3, 0.72, 12]} /><meshStandardMaterial color="#8b4f27" /></mesh>
      <mesh position={[0.3, 0.82, 0.2]}><cylinderGeometry args={[0.16, 0.12, 0.14, 16]} /><meshStandardMaterial color="#f4f8ff" /></mesh>
      <Stool position={[1.7, 0, 0]} />
      {hint && <HintArrow position={[0, 2.4, 0]} />}
      <Ring r={1.1} on={near || hint} />
    </group>
  );
}
