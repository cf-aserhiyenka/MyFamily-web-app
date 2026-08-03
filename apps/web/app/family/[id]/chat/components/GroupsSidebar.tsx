"use client";

import { useState } from "react";
import { conversationLabel, type ConversationRow, type MemberRow } from "../types";

type GroupsSidebarProps = {
  conversations: ConversationRow[];
  selectedId: string | null;
  onSelect: (conversationId: string) => void;
  members: MemberRow[];
  onCreateGroup: (name: string, memberIds: string[]) => void;
  isCreating: boolean;
};

export function GroupsSidebar({
  conversations,
  selectedId,
  onSelect,
  members,
  onCreateGroup,
  isCreating,
}: GroupsSidebarProps) {
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());

  function switchMember(memberId: string) {
    setSelectedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!groupName.trim() || selectedMembers.size === 0) return;
    onCreateGroup(groupName, [...selectedMembers]);
    setGroupName("");
    setSelectedMembers(new Set());
    setShowGroupForm(false);
  }

  return (
    <aside className="w-64 border-r border-bark p-4 flex flex-col gap-2 shrink-0">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Group chats</h2>
        <button
          type="button"
          onClick={() => setShowGroupForm((shown) => !shown)}
          className="text-xs border border-bark px-2 py-1 rounded-lg"
        >
          New group
        </button>
      </div>

      {showGroupForm && (
        <form className="flex flex-col gap-2 p-3 rounded-lg border border-bark mb-2" onSubmit={handleSubmit}>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group name"
            className="border border-bark rounded-lg px-2 py-1 text-sm"
          />
          <div className="flex flex-col gap-1">
            {members.map((member) => (
              <label key={member.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedMembers.has(member.id)}
                  onChange={() => switchMember(member.id)}
                />
                {member.name}
              </label>
            ))}
          </div>
          <button
            type="submit"
            disabled={isCreating}
            className="bg-bark text-cream text-sm px-3 py-1.5 rounded-lg"
          >
            {isCreating ? "Creating..." : "Create"}
          </button>
        </form>
      )}

      {conversations
        .filter((conversation) => conversation.type !== "DIRECT")
        .map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            onClick={() => onSelect(conversation.id)}
            className={
              "text-left px-3 py-2 rounded-lg " +
              (selectedId === conversation.id ? "bg-bark text-cream" : "")
            }
          >
            {conversationLabel(conversation)}
          </button>
        ))}
    </aside>
  );
}
