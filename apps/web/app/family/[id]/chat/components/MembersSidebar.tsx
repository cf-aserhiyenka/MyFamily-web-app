"use client";

import type { MemberRow } from "../types";

type MembersSidebarProps = {
  members: MemberRow[];
  onStartConversation: (memberId: string) => void;
};

export function MembersSidebar({ members, onStartConversation }: MembersSidebarProps) {
  return (
    <aside className="w-64 border-l border-bark p-4 flex flex-col gap-2 shrink-0">
      <h2 className="text-lg font-semibold mb-2">Chats</h2>
      {members.map((member) => (
        <button
          key={member.id}
          type="button"
          onClick={() => onStartConversation(member.id)}
          className="text-left px-3 py-2 rounded-lg"
        >
          {member.name}
        </button>
      ))}
    </aside>
  );
}
