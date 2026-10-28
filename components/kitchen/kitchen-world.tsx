"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { directionTo, nearestWithin, stepChef, type Circle, type Vec2 } from "@/lib/kitchen/chef-motion";
import { STATIONS, TABLE, type StationId } from "@/lib/kitchen/spike-orders";
import { preloadModels } from "./glb-model";
import { Character, StationMesh, TableMesh } from "./kitchen-props";

preloadModels(["steamer", "pot-stew", "frying-pan", "dim-sum", "cup-tea", "pancakes", "character-c", "character-e"]);

export type NearId = StationId | "table";
const INTERACTABLES: (Vec2 & { id: NearId })[] = [...STATIONS.map((s) => ({ id: s.id as NearId, x: s.x, z: s.z })), { id: "table", x: TABLE.x, z: TABLE.z }];
const OBSTACLES: Circle[] = [...STATIONS.map((s) => ({ x: s.x, z: s.z, r: s.r })), { x: TABLE.x, z: TABLE.z, r: TABLE.r }];
// Màn hình nhìn từ camera chéo: "lên" là (-1,-1), "phải" là (1,-1) trên mặt phẳng x–z.
const UP = { x: -Math.SQRT1_2, z: -Math.SQRT1_2 }, RIGHT = { x: Math.SQRT1_2, z: -Math.SQRT1_2 };
const KEY_DIR: Record<string, Vec2> = { w: UP, arrowup: UP, s: { x: -UP.x, z: -UP.z }, arrowdown: { x: -UP.x, z: -UP.z }, d: RIGHT, arrowright: RIGHT, a: { x: -RIGHT.x, z: -RIGHT.z }, arrowleft: { x: -RIGHT.x, z: -RIGHT.z } };

/** Khung nhìn: thu phóng camera trực giao vừa với cỡ màn hình (chỉ làm lại khi cỡ đổi). */
function Rig() {
  const last = useRef("");
  useFrame(({ camera, size }) => {
    const key = `${size.width}x${size.height}`;
    if (key === last.current) return;
    last.current = key;
    const cam = camera as THREE.OrthographicCamera;
    cam.zoom = Math.min(size.width / 17.5, size.height / 13);
    cam.lookAt(0.3, 0.2, 1.4);
    cam.updateProjectionMatrix();
  });
  return null;
}

function Floor({ onGo }: { onGo: (p: Vec2) => void }) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d")!;
    g.fillStyle = "#e9dcc3"; g.fillRect(0, 0, 64, 64);
    g.fillStyle = "#dccdb0"; g.fillRect(0, 0, 32, 32); g.fillRect(32, 32, 32, 32);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(7, 5);
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

function Walls() {
  return (
    <group>
      <mesh position={[0, 1.3, -4.9]} receiveShadow><boxGeometry args={[14, 2.6, 0.4]} /><meshStandardMaterial color="#f4e6c8" /></mesh>
      <mesh position={[0, 2.62, -4.9]}><boxGeometry args={[14.2, 0.22, 0.5]} /><meshStandardMaterial color="#d94a3a" /></mesh>
      <mesh position={[-7.1, 1.3, 0.2]} receiveShadow><boxGeometry args={[0.4, 2.6, 10]} /><meshStandardMaterial color="#f4e6c8" /></mesh>
      <mesh position={[-7.1, 2.62, 0.2]}><boxGeometry args={[0.5, 0.22, 10.2]} /><meshStandardMaterial color="#d94a3a" /></mesh>
    </group>
  );
}

interface ChefProps { carrying: StationId | null; onNear: (id: NearId | null) => void; onFps: (fps: number) => void; targetRef: React.RefObject<Vec2 | null> }

/** Đầu bếp: WASD/mũi tên hoặc chạm sàn để đi; mỗi khung tính vị trí (hàm thuần `stepChef`), chỉ báo React khi vật gần nhất đổi để không dựng lại cảnh mỗi khung. */
function Chef({ carrying, onNear, onFps, targetRef }: ChefProps) {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const pos = useRef<Vec2>({ x: -1, z: 1.5 });
  const keys = useRef(new Set<string>());
  const lastNear = useRef<NearId | null>(null);
  const bob = useRef(0);
  const [moving, setMoving] = useState(false);
  const wasMoving = useRef(false);
  const fps = useRef({ frames: 0, t: 0 });
  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (!(e.target instanceof HTMLInputElement)) { keys.current.add(e.key.toLowerCase()); if (KEY_DIR[e.key.toLowerCase()]) targetRef.current = null; } };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [targetRef]);
  useFrame((_, dtRaw) => {
    const dt = Math.min(0.05, dtRaw);
    let sum: Vec2 = { x: 0, z: 0 };
    for (const k of keys.current) { const d = KEY_DIR[k]; if (d) sum = { x: sum.x + d.x, z: sum.z + d.z }; }
    let dir: Vec2 | null = sum.x !== 0 || sum.z !== 0 ? sum : null;
    if (!dir && targetRef.current) { dir = directionTo(pos.current, targetRef.current); if (!dir) targetRef.current = null; }
    if (dir) {
      pos.current = stepChef(pos.current, dir, dt, OBSTACLES);
      bob.current += dt * 14;
      if (group.current) group.current.rotation.y = Math.atan2(dir.x, dir.z);
    } else bob.current = 0;
    const isMoving = !!dir;
    if (isMoving !== wasMoving.current) { wasMoving.current = isMoving; setMoving(isMoving); }
    group.current?.position.set(pos.current.x, 0, pos.current.z);
    const near = nearestWithin(pos.current, INTERACTABLES)?.id ?? null;
    if (near !== lastNear.current) { lastNear.current = near; onNear(near); }
    fps.current.frames++; fps.current.t += dtRaw;
    if (fps.current.t >= 0.5) { onFps(Math.round(fps.current.frames / fps.current.t)); fps.current = { frames: 0, t: 0 }; }
  });
  return <group ref={group} position={[-1, 0, 1.5]}><group ref={body}><Character skin="c" hat animation={carrying ? "holding-both" : moving ? "sprint" : "idle"} carry={carrying} /></group></group>;
}

interface Props { near: NearId | null; busy: StationId | null; carrying: StationId | null; customerHere: boolean; onNear: (id: NearId | null) => void; onFps: (fps: number) => void }

/** Cảnh 3D của quán: camera chéo, sàn caro, tường, ba bếp, bàn khách, đầu bếp. Chỉ hiển thị và di chuyển; luật game nằm ở cha. */
export function KitchenWorld({ near, busy, carrying, customerHere, onNear, onFps }: Props) {
  const target = useRef<Vec2 | null>(null);
  return (
    <Canvas shadows dpr={[1, 1.75]} orthographic camera={{ position: [9, 11, 9], zoom: 60, near: -50, far: 100 }} className="!absolute inset-0 touch-none" aria-label="Quán ăn 3D">
      <color attach="background" args={["#e8d9a8"]} />
      <Rig />
      <ambientLight intensity={0.85} />
      <directionalLight position={[6, 10, 4]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} />
      <Suspense fallback={null}>
      <Floor onGo={(p) => { target.current = p; }} />
      <Walls />
      {STATIONS.map((s) => <StationMesh key={s.id} s={s} near={near === s.id} busy={busy === s.id} />)}
      <TableMesh x={TABLE.x} z={TABLE.z} near={near === "table"} />
      {customerHere && <group position={[TABLE.x + 1.5, 0, TABLE.z]} rotation-y={-Math.PI / 2}><Character skin="e" animation="idle" /></group>}
      <Chef carrying={carrying} onNear={onNear} onFps={onFps} targetRef={target} />
      </Suspense>
    </Canvas>
  );
}

