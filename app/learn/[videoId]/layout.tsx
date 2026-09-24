import type { Metadata } from "next";

// Trang bài học chứa lời bài hát: không cho công cụ tìm kiếm index.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
