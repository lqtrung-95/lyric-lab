import type { Metadata } from "next";
import { ProfileScreen } from "@/components/profile/profile-screen";

export const metadata: Metadata = { title: "Hồ sơ và huy hiệu", robots: { index: false } };

export default function ProfilePage() {
  return <ProfileScreen />;
}
