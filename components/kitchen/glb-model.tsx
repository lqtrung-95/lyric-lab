"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

export const MODEL_DIR = "/models/kitchen";
export const modelUrl = (name: string): string => `${MODEL_DIR}/${name}.glb`;

/** Tải trước để lần đầu vào quán không bị khựng khi mô hình hiện ra. */
export function preloadModels(names: readonly string[]): void {
  for (const n of names) useLoader.preload(GLTFLoader, modelUrl(n));
}

interface Props {
  name: string;
  /** Kích thước lớn nhất sau khi co/giãn (đơn vị cảnh); chân mô hình đặt ở y = 0, tâm ở x–z = 0. */
  size: number;
  /** Tên hoạt ảnh (ví dụ "walk") nếu mô hình có; đổi tên sẽ chuyển mượt. */
  animation?: string;
}

/** Mô hình GLB dùng chung: bản sao riêng cho mỗi chỗ đặt, chuẩn hóa kích thước, bóng đổ, và phát hoạt ảnh nếu có. Cần bọc trong `<Suspense>`. */
export function GlbModel({ name, size, animation }: Props) {
  const gltf = useLoader(GLTFLoader, modelUrl(name));
  const { object, mixer } = useMemo(() => {
    const object = clone(gltf.scene);
    object.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    const box = new THREE.Box3().setFromObject(object), s = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
    const k = size / Math.max(s.x, s.y, s.z, 1e-6);
    object.scale.setScalar(k);
    object.position.set(-c.x * k, -box.min.y * k, -c.z * k);
    const holder = new THREE.Group();
    holder.add(object);
    return { object: holder, mixer: gltf.animations.length ? new THREE.AnimationMixer(object) : null };
  }, [gltf, size]);
  const current = useRef<THREE.AnimationAction | null>(null);
  useEffect(() => {
    if (!mixer || !animation) return;
    const clip = gltf.animations.find((a) => a.name === animation);
    if (!clip) return;
    const next = mixer.clipAction(clip).reset().fadeIn(0.2).play();
    current.current?.fadeOut(0.2);
    current.current = next;
  }, [mixer, gltf, animation]);
  useFrame((_, dt) => { mixer?.update(Math.min(dt, 0.05)); });
  return <primitive object={object} />;
}
