import type { Metadata } from "next";
import { ChatScreen } from "@/components/chat/chat-screen";

export const metadata: Metadata = { title: "Cộng đồng", robots: { index: false } };

export default function ChatPage() {
  return <ChatScreen />;
}
