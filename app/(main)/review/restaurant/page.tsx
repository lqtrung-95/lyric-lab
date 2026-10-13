import type { Metadata } from "next";
import { RestaurantPractice } from "@/components/restaurant/restaurant-practice";

export const metadata: Metadata = { title: "Quán ăn", robots: { index: false } };

export default function RestaurantPage() {
  return <RestaurantPractice />;
}
