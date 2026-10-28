"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";
import { GlbModel } from "./glb-model";

export interface Look { outfit: string; hair: string; skin?: string; apron?: boolean; hat?: boolean; ribbon?: string }
const CARRY_MODEL: Record<string, string> = { steamer: "dim-sum", soy: "cup-tea", griddle: "pancakes" };

interface Props { look: Look; moving?: boolean; carry?: string | null; cheer?: boolean }

/**
 * Nhân vật chibi dựng bằng khối tròn (đầu to, thân tròn, tay chân đung đưa): đi thì tay chân vẫy và người nhún, cầm món thì giơ hai tay ra trước, phục vụ xong thì giơ tay mừng.
 * Dựng bằng code nên không phụ thuộc mô hình ngoài và đổi màu áo/tóc dễ để tạo nhiều khách khác nhau.
 */
export function ChibiPerson({ look, moving = false, carry = null, cheer = false }: Props) {
  const root = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null), armR = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Mesh>(null), legR = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  const skin = look.skin ?? "#f6cfa8";
  useFrame((_, dt) => {
    t.current += Math.min(dt, 0.05) * (moving ? 11 : 2.2);
    const s = Math.sin(t.current);
    if (root.current) root.current.position.y = moving ? Math.abs(s) * 0.1 : Math.sin(t.current) * 0.015;
    const swing = moving ? s * 0.9 : 0;
    if (armL.current && armR.current) {
      if (carry) { armL.current.rotation.set(-1.25, 0, -0.15); armR.current.rotation.set(-1.25, 0, 0.15); }
      else if (cheer) { armL.current.rotation.set(Math.PI, 0, -0.35); armR.current.rotation.set(Math.PI, 0, 0.35); }
      else { armL.current.rotation.set(swing, 0, 0); armR.current.rotation.set(-swing, 0, 0); }
    }
    if (legL.current && legR.current) { legL.current.rotation.x = -swing * 0.8; legR.current.rotation.x = swing * 0.8; }
  });
  return (
    <group ref={root}>
      <mesh ref={legL} position={[-0.15, 0.2, 0]} castShadow><capsuleGeometry args={[0.11, 0.18, 4, 8]} /><meshStandardMaterial color="#4a3a5a" /></mesh>
      <mesh ref={legR} position={[0.15, 0.2, 0]} castShadow><capsuleGeometry args={[0.11, 0.18, 4, 8]} /><meshStandardMaterial color="#4a3a5a" /></mesh>
      <mesh position-y={0.7} castShadow><capsuleGeometry args={[0.36, 0.32, 8, 16]} /><meshStandardMaterial color={look.outfit} roughness={0.7} /></mesh>
      {look.apron && <mesh position={[0, 0.66, 0.3]} castShadow><boxGeometry args={[0.48, 0.5, 0.1]} /><meshStandardMaterial color="#fffaf0" roughness={0.8} /></mesh>}
      {look.ribbon && <mesh position={[0, 0.95, 0]}><torusGeometry args={[0.36, 0.035, 6, 24]} /><meshStandardMaterial color={look.ribbon} /></mesh>}
      <group ref={armL} position={[-0.42, 0.95, 0]}><mesh position-y={-0.2} castShadow><capsuleGeometry args={[0.1, 0.22, 4, 8]} /><meshStandardMaterial color={look.outfit} /></mesh><mesh position-y={-0.42}><sphereGeometry args={[0.1, 10, 8]} /><meshStandardMaterial color={skin} /></mesh></group>
      <group ref={armR} position={[0.42, 0.95, 0]}><mesh position-y={-0.2} castShadow><capsuleGeometry args={[0.1, 0.22, 4, 8]} /><meshStandardMaterial color={look.outfit} /></mesh><mesh position-y={-0.42}><sphereGeometry args={[0.1, 10, 8]} /><meshStandardMaterial color={skin} /></mesh></group>
      <mesh position-y={1.42} castShadow><sphereGeometry args={[0.46, 24, 18]} /><meshStandardMaterial color={skin} roughness={0.6} /></mesh>
      <mesh position={[0, 1.55, -0.05]}><sphereGeometry args={[0.48, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.55]} /><meshStandardMaterial color={look.hair} roughness={0.8} /></mesh>
      {[-0.17, 0.17].map((x) => <mesh key={x} position={[x, 1.42, 0.42]} scale={[1, 1.25, 0.5]}><sphereGeometry args={[0.055, 10, 8]} /><meshBasicMaterial color="#2b1d1a" /></mesh>)}
      {[-0.28, 0.28].map((x) => <mesh key={x} position={[x, 1.32, 0.38]} scale={[1, 0.7, 0.3]}><sphereGeometry args={[0.08, 10, 8]} /><meshBasicMaterial color="#ff9f9f" transparent opacity={0.7} /></mesh>)}
      <mesh position={[0, 1.3, 0.45]} rotation={[0, 0, Math.PI]}><torusGeometry args={[0.07, 0.015, 6, 12, Math.PI]} /><meshBasicMaterial color="#b0413e" /></mesh>
      {look.hat && (
        <group position-y={1.85}>
          <mesh castShadow><cylinderGeometry args={[0.3, 0.34, 0.2, 18]} /><meshStandardMaterial color="#ffffff" /></mesh>
          <mesh position-y={0.2} castShadow><sphereGeometry args={[0.36, 18, 12]} /><meshStandardMaterial color="#ffffff" /></mesh>
        </group>
      )}
      {carry && <group position={[0, 0.7, 0.55]}><GlbModel name={CARRY_MODEL[carry]} size={0.55} /></group>}
    </group>
  );
}
