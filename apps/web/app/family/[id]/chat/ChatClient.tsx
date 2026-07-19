"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type ConversationRow = {
  id: string;
  type: "GROUP_DEFAULT" | "GROUP_CUSTOM" | "DIRECT";
  name: string | null;
};

type MessageRow = {
  id: string;
  content: string;
  sentAt: string;
  senderId: string;
  senderName: string;
};

type ChatClientProps = {
  memberId: string;
  conversations: ConversationRow[];
};

export function ChatClient({ memberId, conversations }: ChatClientProps) {
  const [selectedId, setSelectedId] = useState<string | null>(conversations[0]?.id ?? null);
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["messages", selectedId],
    queryFn: async () => {
      const res = await fetch(`/api/conversations/${selectedId}/messages`);
      if (!res.ok) throw new Error("Failed to load messages");
      return res.json() as Promise<{ messages: MessageRow[] }>;
    },
    enabled: selectedId !== null,
    refetchInterval: 5000,
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/conversations/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["messages", selectedId] });
    },
  });

  function conversationLabel(conversation: ConversationRow) {
    if (conversation.name) return conversation.name;
    return conversation.type === "GROUP_DEFAULT" ? "Whole family" : "Direct message";
  }

  return (
    <main className="min-h-screen flex">
      <aside className="w-64 border-r border-bark p-4 flex flex-col gap-2">
        <h2 className="text-lg font-semibold mb-2">Conversations</h2>
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            onClick={() => setSelectedId(conversation.id)}
            className={
              "text-left px-3 py-2 rounded-lg " +
              (selectedId === conversation.id ? "bg-bark text-cream" : "")
            }
          >
            {conversationLabel(conversation)}
          </button>
        ))}
      </aside>

      <section className="flex-1 flex flex-col p-4">
        <div className="flex-1 flex flex-col gap-3">
          {data?.messages.map((message) => (
            <div key={message.id}>
              <p className="text-xs">{message.senderName}</p>
              <p className="border border-bark rounded-lg px-3 py-2 inline-block">
                {message.content}
              </p>
            </div>
          ))}
        </div>

        <form
          className="flex gap-2 mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (content.trim()) sendMessage.mutate();
          }}
        >
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-bark rounded-lg px-3 py-2"
          />
          <button type="submit" className="bg-bark text-cream px-4 py-2 rounded-lg">
            Send
          </button>
        </form>
      </section>
    </main>
  );
}
