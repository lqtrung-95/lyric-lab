import type { DiagramKey } from "@/lib/pronunciation/articulation-data";

/**
 * Hình lưỡi (cắt dọc miệng, nhìn từ bên cạnh, môi ở bên trái, họng bên phải) cho từng cách phát âm. Hệ tọa độ viewBox 0 0 200 160.
 * `tongue`: đường viền khép kín của lưỡi; `contact`: chỗ chạm/gần nhất để đánh dấu; `lips`: dạng môi; `jaw`: độ hạ của hàm dưới.
 */
export interface DiagramShape {
  tongue: string;
  contact: { x: number; y: number } | null;
  lips: "open" | "closed" | "round" | "teeth";
  jaw: number;
}

const BODY = "Q148 108 156 122 L158 146 Q110 140 62 120";

export const DIAGRAM_SHAPES: Record<DiagramKey, DiagramShape> = {
  bilabial: { tongue: `M58 112 Q80 106 110 108 Q140 108 156 122 L158 146 Q110 142 62 120 Z`, contact: { x: 36, y: 80 }, lips: "closed", jaw: -18 },
  labiodental: { tongue: `M58 112 Q80 106 110 108 Q140 108 156 122 L158 146 Q110 142 62 120 Z`, contact: { x: 40, y: 82 }, lips: "teeth", jaw: -10 },
  alveolar: { tongue: `M62 60 Q58 74 70 86 Q96 96 126 102 ${BODY} Q52 96 62 60 Z`, contact: { x: 62, y: 56 }, lips: "open", jaw: 0 },
  velar: { tongue: `M56 112 Q80 108 100 112 Q112 104 116 74 Q120 44 134 36 Q150 44 156 66 L158 146 Q110 142 62 120 Z`, contact: { x: 134, y: 34 }, lips: "open", jaw: 0 },
  alveolopalatal: { tongue: `M54 100 Q58 88 70 80 Q86 52 100 46 Q122 52 132 80 Q146 98 156 116 L158 146 Q110 140 62 122 Q52 112 54 100 Z`, contact: { x: 98, y: 40 }, lips: "open", jaw: -4 },
  retroflex: { tongue: `M70 62 Q74 52 84 56 Q88 70 102 86 Q128 98 148 106 Q156 114 156 124 L158 146 Q110 140 66 120 Q56 96 70 62 Z`, contact: { x: 78, y: 50 }, lips: "open", jaw: 0 },
  dental: { tongue: `M54 80 Q70 82 86 88 Q112 96 132 102 ${BODY} Q52 100 54 80 Z`, contact: { x: 52, y: 78 }, lips: "open", jaw: -4 },
  vowelA: { tongue: `M58 112 Q80 106 110 108 Q140 108 156 122 L158 146 Q110 142 62 120 Z`, contact: null, lips: "open", jaw: 10 },
  vowelE: { tongue: `M58 112 Q84 106 104 104 Q120 80 132 74 Q148 78 156 100 L158 146 Q110 142 62 120 Z`, contact: null, lips: "open", jaw: 2 },
  vowelI: { tongue: `M56 100 Q70 76 92 56 Q112 52 128 70 Q142 90 156 116 L158 146 Q110 140 62 120 Q52 112 56 100 Z`, contact: null, lips: "open", jaw: -8 },
  vowelU: { tongue: `M58 112 Q84 108 104 112 Q114 90 124 64 Q136 48 148 58 Q156 80 156 100 L158 146 Q110 142 62 120 Z`, contact: null, lips: "round", jaw: -4 },
  vowelV: { tongue: `M56 100 Q70 76 92 56 Q112 52 128 70 Q142 90 156 116 L158 146 Q110 140 62 120 Q52 112 56 100 Z`, contact: null, lips: "round", jaw: -8 },
  vowelO: { tongue: `M58 112 Q84 106 104 104 Q120 82 132 76 Q148 80 156 102 L158 146 Q110 142 62 120 Z`, contact: null, lips: "round", jaw: 0 },
  vowelEr: { tongue: `M64 90 Q70 82 80 86 Q92 100 108 102 Q136 104 156 118 L158 146 Q110 142 62 120 Q56 106 64 90 Z`, contact: null, lips: "open", jaw: 2 },
};
