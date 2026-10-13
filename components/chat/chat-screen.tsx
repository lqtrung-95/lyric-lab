"use client";

import { ChatThread } from "./chat-thread";

/** Màn Cộng đồng (`/chat`): tiêu đề giới thiệu và cuộc trò chuyện. */
export function ChatScreen() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-space-md">
      <header>
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Cộng đồng</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Trò chuyện với những người cùng học tiếng Trung. Admin sẽ đăng thông báo ở đây khi sửa bài hay có tính năng mới.</p>
      </header>
      <ChatThread listClassName="h-[55dvh] min-h-72" />
    </div>
  );
}
