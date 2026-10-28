import { ModeTabs } from "@/components/review/mode-tabs";

/** Khung chung của các game giải trí: thanh quay lại Ôn & Nói, tiêu đề, mô tả. `wide` cho game cần khung chơi rộng hơn. */
export function ArcadeShell({ title, intro, wide = false, children }: { title: string; intro: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <>
      <ModeTabs />
      <div className={`mx-auto ${wide ? "max-w-4xl" : "max-w-3xl"}`}>
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">{title}</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">{intro}</p>
        <div className="mt-space-md">{children}</div>
      </div>
    </>
  );
}
