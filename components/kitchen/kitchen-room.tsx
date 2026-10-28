"use client";

import { useMemo } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { Vec2 } from "@/lib/kitchen/chef-motion";
import { Lantern, Plant, Sign } from "./kitchen-decor";

/** Sàn gỗ lát ván (vẽ bằng canvas) — ấm hơn sàn caro xám. Chạm sàn để đi tới đó. */
export function Floor({ onGo }: { onGo: (p: Vec2) => void }) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256; c.height = 256;
    const g = c.getContext("2d")!;
    const tones = ["#e2b985", "#d9ae78", "#e8c595", "#dcb27e"];
    for (let i = 0; i < 4; i++) {
      g.fillStyle = tones[i]; g.fillRect(0, i * 64, 256, 64);
      g.fillStyle = "rgba(90,50,20,.18)"; g.fillRect(0, i * 64, 256, 3);
      const cut = (i * 83) % 200 + 30;
      g.fillRect(cut, i * 64, 3, 64);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 3);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0.2]} receiveShadow onPointerDown={(e: ThreeEvent<PointerEvent>) => onGo({ x: e.point.x, z: e.point.z })}>
      <planeGeometry args={[14, 10]} />
      <meshStandardMaterial map={tex} />
    </mesh>
  );
}

/** Tường sau và tường trái (kem, viền đỏ), biển hiệu, đèn lồng, cây cảnh, thảm đỏ trước cửa. */
export function Room() {
  return (
    <group>
      <mesh position={[0, 1.4, -4.9]} receiveShadow><boxGeometry args={[14, 2.8, 0.4]} /><meshStandardMaterial color="#f6ead0" /></mesh>
      <mesh position={[0, 2.82, -4.9]}><boxGeometry args={[14.2, 0.24, 0.5]} /><meshStandardMaterial color="#d6382b" /></mesh>
      <mesh position={[0, 0.12, -4.68]}><boxGeometry args={[14, 0.24, 0.06]} /><meshStandardMaterial color="#8b4f27" /></mesh>
      <mesh position={[-7.1, 1.4, 0.2]} receiveShadow><boxGeometry args={[0.4, 2.8, 10]} /><meshStandardMaterial color="#f6ead0" /></mesh>
      <mesh position={[-7.1, 2.82, 0.2]}><boxGeometry args={[0.5, 0.24, 10.2]} /><meshStandardMaterial color="#d6382b" /></mesh>
      <Sign text="早餐铺" position={[1.2, 1.9, -4.66]} />
      <Lantern position={[-5.5, 2.4, -3.6]} />
      <Lantern position={[3.8, 2.4, -3.8]} phase={1.7} />
      <Lantern position={[6.2, 2.4, -1]} phase={3} />
      <Plant position={[6.1, 0, -4]} />
      <Plant position={[-6.2, 0, 4.2]} />
      <mesh rotation-x={-Math.PI / 2} position={[3.6, 0.02, 1.6]} receiveShadow><circleGeometry args={[2.2, 40]} /><meshStandardMaterial color="#c8423a" /></mesh>
    </group>
  );
}
