import type { ReactNode } from "react";

// Tranh C: vẽ bằng SVG theo đúng ngôn ngữ hình ảnh của app (Cozy Fantasy): viền mực nâu đậm, mảng màu phẳng, bo tròn, thêm một mảng sáng và một mảng tối cho mỗi vật.
// Mọi vật nhìn chính diện (như nhà búp bê cắt ngang) để đồng nhất góc nhìn. Màu lấy từ bảng màu của app, cố định (cảnh là căn phòng có đèn nên không đổi theo chế độ tối).

export const INK = "#4a2e1b";
export const C = {
  woodD: "#c27a3c", wood: "#e8a860", woodL: "#f6cf8e",
  cream: "#fff3d6", white: "#ffffff",
  red: "#e0533d", redD: "#b83a2a",
  yellow: "#f6c453", orange: "#e67e22", orangeD: "#c4621a",
  green: "#7fc468", greenD: "#3b6931", greenL: "#bcf1a9",
  blue: "#51a0db", blueL: "#cce5ff",
  pink: "#f2a0a0", clay: "#d9774a", grey: "#b9a58f", greyD: "#76604f", teal: "#3fa8a0", brown: "#8a5530",
} as const;

/** Một sprite phẳng: kích thước khung (viewBox) và nội dung SVG. */
export interface FlatSprite {
  w: number;
  h: number;
  node: ReactNode;
}

/** Thuộc tính nét chung (viền mực) cho thẻ `<g>` bao ngoài mỗi sprite; các phần tử con kế thừa. */
export const LINE = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round", strokeLinecap: "round" } as const;
