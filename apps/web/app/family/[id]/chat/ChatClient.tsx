"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GroupsSidebar } from "./components/GroupsSidebar";
import { ConversationPanel } from "./components/ConversationPanel";
import { MembersSidebar } from "./components/MembersSidebar";
import type { ConversationRow, MemberRow, MessageRow } from "./types";

type ChatClientProps = {
  familyId: string;
  memberId: string;
  conversations: ConversationRow[];
  members: MemberRow[];
};

export function ChatClient({ familyId, conversations, members,memberId }: ChatClientProps) {
  const router = useRouter();
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

  const startConversation = useMutation({
    mutationFn: async (targetMemberId: string) => {
      const res = await fetch(`/api/family/${familyId}/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetMemberId }),
      });
      if (!res.ok) throw new Error("Failed to start conversation");
      return res.json() as Promise<{ id: string }>;
    },
    onSuccess: (result) => {
      setSelectedId(result.id);
      router.refresh();
    },
  });

  const createGroup = useMutation({
    mutationFn: async ({ name, memberIds }: { name: string; memberIds: string[] }) => {
      const res = await fetch(`/api/family/${familyId}/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "GROUP_CUSTOM", name, memberIds }),
      });
      if (!res.ok) throw new Error("Failed to create group");
      return res.json() as Promise<{ id: string }>;
    },
    onSuccess: (result) => {
      setSelectedId(result.id);
      router.refresh();
    },
  });

  const editMessage = useMutation({
    mutationFn: async ({ messageId, content: newContent }: { messageId: string; content: string }) => {
      const res = await fetch(`/api/conversations/${selectedId}/messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
      });
      if (!res.ok) throw new Error("Failed to edit message");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", selectedId] });
    },
  });

  const deleteMessage = useMutation({
    mutationFn: async (messageId: string) => {
      const res = await fetch(`/api/conversations/${selectedId}/messages/${messageId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete message");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", selectedId] });
    },
  });

  const leaveGroup = useMutation({
    mutationFn: async (conversationId: string) => {
      const res = await fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to leave conversation");
      return res.json();
    },
    onSuccess: (_result, conversationId) => {
      if (selectedId === conversationId) setSelectedId(null);
      router.refresh();
    },
  });

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  return (
    <main className="h-screen flex">
      <GroupsSidebar
        conversations={conversations}
        selectedId={selectedId}
        onSelect={setSelectedId}
        members={members}
        onCreateGroup={(name, memberIds) => createGroup.mutate({ name, memberIds })}
        isCreating={createGroup.isPending}
        onLeaveGroup={(conversationId) => leaveGroup.mutate(conversationId)}
      />

      <ConversationPanel
        conversation={selectedConversation}
        messages={data?.messages}
        content={content}
        onContentChange={setContent}
        onSend={() => sendMessage.mutate()}
        onEditMessage={(messageId, newContent) => editMessage.mutate({ messageId, content: newContent })}
        onDeleteMessage={(messageId) => deleteMessage.mutate(messageId)}
        memberId={memberId}

      />

      <MembersSidebar members={members} onStartConversation={(id) => startConversation.mutate(id)} />
    </main>
  );
}
