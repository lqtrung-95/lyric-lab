"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Vẽ chữ lên canvas làm texture (nhãn, biển hiệu) mà không cần thư viện chữ 3D. */
function textTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d")!;
  draw(g);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

/** Nhãn nổi trên bếp: chữ Hán to và pinyin nhỏ, nền trắng bo tròn (như bảng tên của quán). */
export function Label({ han, pinyin, position, active = false }: { han: string; pinyin: string; position: [number, number, number]; active?: boolean }) {
  const map = useMemo(() => textTexture(256, 128, (g) => {
    g.fillStyle = active ? "#ffe27a" : "#fffaf0"; roundRect(g, 6, 6, 244, 116, 28); g.fill();
    g.strokeStyle = "rgba(0,0,0,.12)"; g.lineWidth = 4; g.stroke();
    g.fillStyle = "#2b1d1a"; g.textAlign = "center";
    g.font = "bold 52px 'PingFang SC','Noto Sans SC',sans-serif"; g.fillText(han, 128, 62);
    g.font = "600 28px system-ui,sans-serif"; g.fillStyle = "#8a5a2b"; g.fillText(pinyin, 128, 102);
  }), [han, pinyin, active]);
  return <sprite position={position} scale={[1.6, 0.8, 1]}><spriteMaterial map={map} depthTest={false} transparent /></sprite>;
}

/** Biển hiệu treo trên tường sau: nền đỏ sẫm, chữ vàng. */
export function Sign({ text, position }: { text: string; position: [number, number, number] }) {
  const map = useMemo(() => textTexture(512, 160, (g) => {
    g.fillStyle = "#3b1f17"; roundRect(g, 4, 4, 504, 152, 22); g.fill();
    g.strokeStyle = "#e8b04a"; g.lineWidth = 8; g.stroke();
    g.fillStyle = "#f6c453"; g.textAlign = "center"; g.font = "bold 92px 'PingFang SC','Noto Sans SC',sans-serif"; g.fillText(text, 256, 108);
  }), [text]);
  return <mesh position={position}><planeGeometry args={[3.2, 1]} /><meshBasicMaterial map={map} transparent /></mesh>;
}

/** Đèn lồng đỏ đung đưa nhẹ, có phát sáng. */
export function Lantern({ position, phase = 0 }: { position: [number, number, number]; phase?: number }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => { if (g.current) g.current.rotation.z = Math.sin(clock.elapsedTime * 1.3 + phase) * 0.08; });
  return (
    <group position={position}>
      <group ref={g}>
        <mesh position-y={0.5}><cylinderGeometry args={[0.015, 0.015, 0.6, 6]} /><meshBasicMaterial color="#5a3a22" /></mesh>
        <mesh scale={[1, 0.85, 1]} castShadow><sphereGeometry args={[0.32, 18, 14]} /><meshStandardMaterial color="#e23d2d" emissive="#ff5a3c" emissiveIntensity={0.55} /></mesh>
        <mesh position-y={0.28}><cylinderGeometry args={[0.12, 0.12, 0.08, 10]} /><meshStandardMaterial color="#f2c14e" /></mesh>
        <mesh position-y={-0.3}><cylinderGeometry args={[0.1, 0.1, 0.06, 10]} /><meshStandardMaterial color="#f2c14e" /></mesh>
      </group>
    </group>
  );
}

/** Chậu cây: chậu xanh và các lá hình nón. */
export function Plant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position-y={0.28} castShadow><cylinderGeometry args={[0.34, 0.26, 0.56, 14]} /><meshStandardMaterial color="#3b7fb8" /></mesh>
      {[0, 1, 2, 3, 4].map((i) => <mesh key={i} position={[Math.cos(i * 1.26) * 0.16, 0.85, Math.sin(i * 1.26) * 0.16]} rotation={[Math.sin(i * 1.26) * 0.4, 0, -Math.cos(i * 1.26) * 0.4]} castShadow><coneGeometry args={[0.13, 0.7, 6]} /><meshStandardMaterial color={i % 2 ? "#4f9d4a" : "#68b45a"} /></mesh>)}
    </group>
  );
}

/** Hơi nước bốc lên khi đang nấu: vài quả cầu mờ trồi lên rồi tan. */
export function Steam({ active, position }: { active: boolean; position: [number, number, number] }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    refs.current.forEach((m, i) => {
      if (!m) return;
      const p = (clock.elapsedTime * 0.55 + i / 6) % 1;
      m.visible = active;
      m.position.set(Math.sin(p * 6 + i) * 0.18, p * 1.4, Math.cos(p * 5 + i) * 0.18);
      m.scale.setScalar(0.12 + p * 0.28);
      (m.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.55;
    });
  });
  return <group position={position}>{Array.from({ length: 6 }, (_, i) => <mesh key={i} ref={(m) => { refs.current[i] = m; }} visible={false}><sphereGeometry args={[1, 10, 8]} /><meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} /></mesh>)}</group>;
}

/** Mũi tên nảy nhẹ phía trên bếp/bàn cần tới (gợi ý cho người mới). */
export function HintArrow({ position }: { position: [number, number, number] }) {
  const m = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => { if (m.current) m.current.position.y = Math.sin(clock.elapsedTime * 5) * 0.12; });
  return <group position={position}><mesh ref={m} rotation-x={Math.PI}><coneGeometry args={[0.22, 0.45, 4]} /><meshStandardMaterial color="#ffd54a" emissive="#ffb300" emissiveIntensity={0.6} /></mesh></group>;
}

export function Stool({ position }: { position: [number, number, number] }) {
  return <group position={position}><mesh position-y={0.28} castShadow><cylinderGeometry args={[0.26, 0.2, 0.08, 12]} /><meshStandardMaterial color="#8b4f27" /></mesh><mesh position-y={0.13}><cylinderGeometry args={[0.06, 0.1, 0.26, 8]} /><meshStandardMaterial color="#6e3d1d" /></mesh></group>;
}
