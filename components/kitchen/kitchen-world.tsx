"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { approachPoint, directionTo, nearestWithin, stepChef, type Circle, type Vec2 } from "@/lib/kitchen/chef-motion";
import { STATIONS, TABLE, type StationId } from "@/lib/kitchen/spike-orders";
import { ChibiPerson, type Look } from "./chibi-person";
import { preloadModels } from "./glb-model";
import { Floor, Room } from "./kitchen-room";
import { StationMesh, TableMesh } from "./kitchen-props";

preloadModels(["steamer", "pot-stew", "frying-pan", "dim-sum", "cup-tea", "pancakes"]);
const CHEF_LOOK: Look = { outfit: "#2f7d5b", hair: "#3a2a20", apron: true, hat: true };
const GUESTS: Look[] = [{ outfit: "#c0513f", hair: "#1f1a17", ribbon: "#f2c14e" }, { outfit: "#7a5ab5", hair: "#5a3a22" }, { outfit: "#2f8ec4", hair: "#2a2a2a" }, { outfit: "#e08a2b", hair: "#7a3b22", ribbon: "#fff" }];

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
    cam.zoom = Math.min(size.width / 19, size.height / 14);
    cam.lookAt(0.2, 0.9, 0.2);
    cam.updateProjectionMatrix();
  });
  return null;
}

interface ChefProps {
  carrying: StationId | null; goal: NearId | null; cheer: boolean;
  onNear: (id: NearId | null) => void; onFps: (fps: number) => void; onArrive: (id: NearId) => void; onCancel: () => void;
  targetRef: React.RefObject<Vec2 | null>;
}
const POINT: Record<NearId, Vec2> = Object.fromEntries(INTERACTABLES.map((i) => [i.id, { x: i.x, z: i.z }])) as Record<NearId, Vec2>;

/** Đầu bếp: WASD/mũi tên, chạm sàn để đi, hoặc chạm bếp/bàn để tự đi tới rồi tự thao tác (`goal` + `onArrive`). Mỗi khung tính vị trí bằng hàm thuần `stepChef`; chỉ báo React khi vật gần nhất hoặc trạng thái đi/đứng đổi để không dựng lại cảnh mỗi khung. */
function Chef({ carrying, goal, cheer, onNear, onFps, onArrive, onCancel, targetRef }: ChefProps) {
  const group = useRef<THREE.Group>(null);
  const pos = useRef<Vec2>({ x: -1, z: 1.5 });
  const keys = useRef(new Set<string>());
  const lastNear = useRef<NearId | null>(null);
  const [moving, setMoving] = useState(false);
  const wasMoving = useRef(false);
  const fps = useRef({ frames: 0, t: 0 });
  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (!(e.target instanceof HTMLInputElement)) { const k = e.key.toLowerCase(); keys.current.add(k); if (KEY_DIR[k]) { targetRef.current = null; onCancel(); } } };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [targetRef, onCancel]);
  useFrame((_, dtRaw) => {
    const dt = Math.min(0.05, dtRaw);
    let sum: Vec2 = { x: 0, z: 0 };
    for (const k of keys.current) { const d = KEY_DIR[k]; if (d) sum = { x: sum.x + d.x, z: sum.z + d.z }; }
    let dir: Vec2 | null = sum.x !== 0 || sum.z !== 0 ? sum : null;
    if (!dir && goal) {
      dir = directionTo(pos.current, approachPoint(pos.current, POINT[goal], 1.5), 0.1);
      if (!dir) onArrive(goal);
    } else if (!dir && targetRef.current) { dir = directionTo(pos.current, targetRef.current); if (!dir) targetRef.current = null; }
    if (dir) {
      pos.current = stepChef(pos.current, dir, dt, OBSTACLES);
      if (group.current) group.current.rotation.y = Math.atan2(dir.x, dir.z);
    }
    const isMoving = !!dir;
    if (isMoving !== wasMoving.current) { wasMoving.current = isMoving; setMoving(isMoving); }
    group.current?.position.set(pos.current.x, 0, pos.current.z);
    const near = nearestWithin(pos.current, INTERACTABLES)?.id ?? null;
    if (near !== lastNear.current) { lastNear.current = near; onNear(near); }
    fps.current.frames++; fps.current.t += dtRaw;
    if (fps.current.t >= 0.5) { onFps(Math.round(fps.current.frames / fps.current.t)); fps.current = { frames: 0, t: 0 }; }
  });
  return <group ref={group} position={[-1, 0, 1.5]}><ChibiPerson look={CHEF_LOOK} moving={moving} carry={carrying} cheer={cheer} /></group>;
}

interface Props {
  near: NearId | null; busy: StationId | null; carrying: StationId | null; customerHere: boolean; guestIndex: number; hint: NearId | null; goal: NearId | null; cheer: boolean;
  onNear: (id: NearId | null) => void; onFps: (fps: number) => void; onTap: (id: NearId) => void; onArrive: (id: NearId) => void; onCancel: () => void;
}

/** Cảnh 3D của quán: camera chéo, sàn gỗ, tường, đèn lồng, ba bếp, bàn khách, đầu bếp và khách (chibi dựng bằng khối tròn). Chỉ hiển thị và di chuyển; luật game nằm ở cha. */
export function KitchenWorld({ near, busy, carrying, customerHere, guestIndex, hint, goal, cheer, onNear, onFps, onTap, onArrive, onCancel }: Props) {
  const target = useRef<Vec2 | null>(null);
  return (
    <Canvas shadows dpr={[1, 1.75]} orthographic camera={{ position: [9, 11, 9], zoom: 60, near: -50, far: 100 }} className="!absolute inset-0 touch-none" aria-label="Quán ăn 3D">
      <color attach="background" args={["#f1dfae"]} />
      <Rig />
      <hemisphereLight args={["#fff4dc", "#b78a5a", 0.9]} />
      <directionalLight position={[6, 10, 4]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} shadow-radius={4} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} />
      <Suspense fallback={null}>
        <Floor onGo={(p) => { target.current = p; onCancel(); }} />
        <Room />
        {STATIONS.map((s) => <StationMesh key={s.id} s={s} near={near === s.id} busy={busy === s.id} hint={hint === s.id} onTap={() => onTap(s.id)} />)}
        <TableMesh x={TABLE.x} z={TABLE.z} near={near === "table"} hint={hint === "table"} onTap={() => onTap("table")} />
        {customerHere && <group position={[TABLE.x + 1.7, 0, TABLE.z]} rotation-y={-Math.PI / 2}><ChibiPerson look={GUESTS[guestIndex % GUESTS.length]} /></group>}
        <Chef carrying={carrying} goal={goal} cheer={cheer} onNear={onNear} onFps={onFps} onArrive={onArrive} onCancel={onCancel} targetRef={target} />
      </Suspense>
    </Canvas>
  );
}
