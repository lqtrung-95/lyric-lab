"use client";

import dynamic from "next/dynamic";

const ModelLab = dynamic(() => import("./model-lab").then((m) => m.ModelLab), { ssr: false, loading: () => <p role="status" className="py-space-lg text-body-md text-on-surface-variant">Đang tải khung xem…</p> });

export function ModelLabLoader() { return <ModelLab />; }
