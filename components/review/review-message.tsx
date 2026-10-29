import Link from "next/link";
import { PetMini } from "@/components/pet/pet-mini";
import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/components/ui/icon-names";

/** Màn trạng thái của trang Ôn tập: chưa có thẻ, đã ôn xong, hoặc lỗi. */
export function ReviewMessage({ icon, title, body, action, cheer, children }: { icon: IconName; title: string; body: string; action?: { href: string; label: string }; /** Hiện pet ăn mừng phía trên (khi xong buổi ôn). */ cheer?: boolean; children?: React.ReactNode }) {
  return (
    <div className="mx-auto mt-space-lg max-w-xl rounded-2xl bg-surface-container-low p-space-lg text-center">
      {cheer && <PetMini cheer className="mx-auto mb-1 size-16" />}
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-high text-primary">
        <Icon name={icon} size={28} />
      </span>
      <h1 className="mt-space-md font-serif text-headline-md text-on-surface">{title}</h1>
      <p className="mx-auto mt-space-sm max-w-md text-body-md text-on-surface-variant">{body}</p>
      {action && (
        <Link href={action.href} className="mt-space-lg inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-label-md font-medium text-on-primary hover:brightness-110">
          {action.label}
        </Link>
      )}
      {children}
    </div>
  );
}
