import type { Metadata } from "next";
import { ModeTabs } from "@/components/review/mode-tabs";
import { RoleplayPractice } from "@/components/speaking/roleplay-practice";
import { annotatePinyin } from "@/lib/explore/story/annotate-lines";
import { SCENARIOS } from "@/lib/roleplay/scenarios";

export const metadata: Metadata = { title: "Trò chuyện tự do", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Trò chuyện tự do: AI đóng vai trong một tình huống đời thường, người học nói bằng micro, không có kịch bản. Chỉ tài khoản đã đăng ký, có hạn mức theo ngày. */
export default async function SpeakRoleplayPage() {
  const openingPinyin = await annotatePinyin(SCENARIOS.map((s) => s.opening.zh));
  return (
    <>
      <ModeTabs />
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Trò chuyện tự do</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Nói chuyện với AI đóng vai trong tình huống đời thường, không có kịch bản. Hãy nói bằng micro, sai cũng không sao. Làm xong được tính điểm luyện tập (XP).</p>
        <div className="mt-space-md"><RoleplayPractice openingPinyin={openingPinyin} /></div>
      </div>
    </>
  );
}
