"use client";

import dynamic from "next/dynamic";

const ModelGrid = dynamic(() => import("./model-grid").then((m) => m.ModelGrid), { ssr: false, loading: () => <p role="status" className="py-space-lg text-body-md text-on-surface-variant">Đang tải…</p> });

export function ModelGridLoader({ urls }: { urls: string[] }) { return <ModelGrid urls={urls} />; }
