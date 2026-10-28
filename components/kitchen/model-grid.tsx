"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const COLS = 6, GAP = 2.4;

/** Tải một mô hình theo đường dẫn, đưa về giữa/đáy và co về cao ~2 đơn vị; trả cả số tam giác. */
async function load(url: string): Promise<{ object: THREE.Object3D; triangles: number }> {
  const gltf = await new GLTFLoader().loadAsync(url);
  let triangles = 0;
  gltf.scene.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.castShadow = true; triangles += (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3; } });
  const box = new THREE.Box3().setFromObject(gltf.scene), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
  const k = 1.8 / Math.max(size.x, size.y, size.z, 1e-6);
  gltf.scene.scale.setScalar(k);
  gltf.scene.position.set(-c.x * k, -box.min.y * k, -c.z * k);
  return { object: gltf.scene, triangles: Math.round(triangles) };
}

/** Bảng so sánh nhiều mô hình cùng lúc dưới ánh sáng của quán (công cụ nội bộ để chấm chọn tài nguyên miễn phí). Thứ tự và số tam giác ghi ở chú thích bên dưới. */
export function ModelGrid({ urls }: { urls: string[] }) {
  const [items, setItems] = useState<{ url: string; object: THREE.Object3D; triangles: number }[]>([]);
  const [failed, setFailed] = useState<string[]>([]);
  useEffect(() => {
    let cancelled = false;
    void Promise.all(urls.map((url) => load(url).then((r) => ({ url, ...r }), () => { setFailed((f) => [...f, url]); return null; }))).then((r) => { if (!cancelled) setItems(r.filter((x): x is NonNullable<typeof x> => x !== null)); });
    return () => { cancelled = true; };
  }, [urls]);
  const rows = Math.ceil(urls.length / COLS);
  const name = (u: string) => u.split("/").pop()!.replace(".glb", "");
  return (
    <div className="flex flex-col gap-space-sm">
      <div className="relative h-[min(70vh,560px)] min-h-[360px] overflow-hidden rounded-3xl border-2 border-ink">
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 11, 9], fov: 34 }} onCreated={({ camera }) => camera.lookAt(0, 0, 1)}>
          <color attach="background" args={["#e8d9a8"]} />
          <ambientLight intensity={0.9} />
          <directionalLight position={[4, 9, 5]} intensity={1.8} castShadow />
          <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0.5]} receiveShadow><planeGeometry args={[COLS * GAP + 2, rows * GAP + 2]} /><meshStandardMaterial color="#e9dcc3" /></mesh>
          {items.map((it, i) => <group key={it.url} position={[((i % COLS) - (COLS - 1) / 2) * GAP, 0, (Math.floor(i / COLS) - (rows - 1) / 2) * GAP]}><primitive object={it.object} /></group>)}
        </Canvas>
      </div>
      <ol className="grid grid-cols-2 gap-x-4 text-body-sm sm:grid-cols-3 md:grid-cols-6">
        {items.map((it, i) => <li key={it.url}>{i + 1}. {name(it.url)} <span className="text-on-surface-variant">({it.triangles.toLocaleString("vi-VN")})</span></li>)}
      </ol>
      {failed.length > 0 && <p role="alert" className="text-label-md font-bold text-error">Không tải được: {failed.map(name).join(", ")}</p>}
    </div>
  );
}
