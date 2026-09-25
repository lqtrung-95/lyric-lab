import type { Metadata } from "next";
import { OnboardingScreen } from "@/components/onboarding/onboarding-screen";

export const metadata: Metadata = { title: "Làm quen", robots: { index: false } };

export default function WelcomePage() {
  return <OnboardingScreen />;
}
