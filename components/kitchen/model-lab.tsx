"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface Loaded { object: THREE.Object3D; name: string; sizeKb: number; triangles: number; meshes: number; textures: number }

/** Đọc một file .glb/.gltf người dùng chọn: dựng cảnh, đưa về giữa và co/giãn về cao ~2 đơn vị, đếm tam giác và texture để đánh giá độ nặng. */
async function loadModel(file: File): Promise<Loaded> {
  const buffer = await file.arrayBuffer();
  const gltf = await new Promise<{ scene: THREE.Group }>((resolve, reject) => new GLTFLoader().parse(buffer, "", resolve, reject));
  const object = gltf.scene;
  let triangles = 0, meshes = 0;
  const textures = new Set<THREE.Texture>();
  object.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    meshes++; m.castShadow = true;
    const g = m.geometry;
    triangles += (g.index ? g.index.count : g.attributes.position.count) / 3;
    for (const mat of Array.isArray(m.material) ? m.material : [m.material]) for (const v of Object.values(mat)) if (v instanceof THREE.Texture) textures.add(v);
  });
  const box = new THREE.Box3().setFromObject(object), size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
  const k = 2 / Math.max(size.x, size.y, size.z, 1e-6);
  object.scale.setScalar(k);
  object.position.set(-center.x * k, -box.min.y * k, -center.z * k);
  return { object, name: file.name, sizeKb: Math.round(file.size / 1024), triangles: Math.round(triangles), meshes, textures: textures.size };
}

function Spin({ object, auto }: { object: THREE.Object3D; auto: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (g.current && auto) g.current.rotation.y += dt * 0.6; });
  return <group ref={g}><primitive object={object} /></group>;
}

/** Phòng thử mô hình: kéo thả file .glb (tạo từ Tripo hoặc nơi khác) để xem chất lượng, độ nặng trước khi đưa vào quán. Mọi thứ chạy trong trình duyệt, file không được tải lên đâu cả. */
export function ModelLab() {
  const [model, setModel] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [auto, setAuto] = useState(true);
  async function pick(file: File | undefined) {
    if (!file) return;
    setError(null);
    try { setModel(await loadModel(file)); } catch { setError("Không đọc được file. Hãy dùng .glb (xuất từ Tripo: Download → GLB)."); }
  }
  return (
    <div className="flex flex-col gap-space-md">
      <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-ink bg-surface-container-low p-space-md text-center" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); void pick(e.dataTransfer.files[0]); }}>
        <span className="text-label-lg font-extrabold">Chọn hoặc kéo thả file .glb vào đây</span>
        <span className="text-body-sm text-on-surface-variant">File chỉ được đọc trong trình duyệt của bạn, không tải lên máy chủ.</span>
        <input type="file" accept=".glb,.gltf,model/gltf-binary" className="sr-only" onChange={(e) => void pick(e.target.files?.[0])} />
      </label>
      {error && <p role="alert" className="text-label-md font-bold text-error">{error}</p>}
      <div className="relative h-[min(60vh,480px)] min-h-[320px] overflow-hidden rounded-3xl border-2 border-ink bg-[#e8d9a8]">
        <Canvas shadows dpr={[1, 2]} camera={{ position: [3, 2.4, 3.6], fov: 35 }}>
          <color attach="background" args={["#e8d9a8"]} />
          <ambientLight intensity={0.9} />
          <directionalLight position={[4, 6, 3]} intensity={1.8} castShadow />
          <mesh rotation-x={-Math.PI / 2} receiveShadow><circleGeometry args={[2.2, 40]} /><meshStandardMaterial color="#e9dcc3" /></mesh>
          {model && <Spin object={model.object} auto={auto} />}
        </Canvas>
        {!model && <p className="absolute inset-0 flex items-center justify-center text-body-md font-bold text-slate-700">Chưa có mô hình</p>}
      </div>
      {model && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-body-md" role="status">
          <strong>{model.name}</strong>
          <span>{model.sizeKb.toLocaleString("vi-VN")} KB</span>
          <span>{model.triangles.toLocaleString("vi-VN")} tam giác</span>
          <span>{model.meshes} mesh · {model.textures} texture</span>
          <button type="button" aria-pressed={auto} onClick={() => setAuto((v) => !v)} className="min-h-11 rounded-full border-2 border-ink px-4 text-label-md font-bold">Xoay {auto ? "BẬT" : "TẮT"}</button>
        </div>
      )}
    </div>
  );
}
