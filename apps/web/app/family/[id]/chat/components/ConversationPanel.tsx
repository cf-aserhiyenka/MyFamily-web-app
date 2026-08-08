"use client";

import { useState } from "react";
import { conversationLabel, type ConversationRow, type MessageRow } from "../types";

type ConversationPanelProps = {
  conversation: ConversationRow | undefined;
  messages: MessageRow[] | undefined;
  content: string;
  onContentChange: (content: string) => void;
  onSend: () => void;
  onEditMessage: (messageId: string, content: string) => void;
  onDeleteMessage: (messageId: string) => void;
  memberId: string;

};

export function ConversationPanel({
  conversation,
  messages,
  content,
  onContentChange,
  onSend,
  onEditMessage,
  onDeleteMessage,
  memberId,

}: ConversationPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  function startEditing(message: MessageRow) {
    setEditingId(message.id);
    setEditContent(message.content);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditContent("");
  }

  function submitEdit(messageId: string) {
    if (editContent.trim()) onEditMessage(messageId, editContent.trim());
    setEditingId(null);
    setEditContent("");
  }

  return (
    <section className="flex-1 flex flex-col p-4">
      {conversation && (
        <div className="border-b border-bark pb-2 mb-3">
          <h3 className="font-semibold">{conversationLabel(conversation)}</h3>
          <p className="text-xs">{conversation.participantNames.join(", ")}</p>
        </div>
      )}
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto p-4 ">
        {messages?.map((message, index) => {
          const isOwn = message.senderId === memberId;
          const isLast = index === messages.length - 1;
          const isEditing = editingId === message.id;
          return (
            <div key={message.id} className={isOwn ? "text-right" : "text-left"}>
              <p className="text-xs">{message.senderName}</p>
              {isEditing ? (
                <form
                  className="flex gap-2 justify-end"
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitEdit(message.id);
                  }}
                >
                  <input
                    type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    autoFocus
                    className="border border-bark rounded-lg px-2 py-1 text-sm"
                  />
                  <button type="submit" className="text-xs border border-bark px-2 py-1 rounded-lg">
                    Save
                  </button>
                  <button type="button" onClick={cancelEditing} className="text-xs border border-bark px-2 py-1 rounded-lg">
                    Cancel
                  </button>
                </form>
              ) : (
                <div className="inline-flex items-center gap-2">
                  <p className="border border-bark rounded-lg px-3 py-2 inline-block">
                    {message.content}
                    {message.editedAt && <span className="text-xs"> (edited)</span>}
                  </p>
                  {isOwn && isLast && (
                    <button
                      type="button"
                      onClick={() => startEditing(message)}
                      className="text-xs border border-bark px-1.5 py-1 rounded-lg"
                    >
                      Edit
                    </button>
                  )}
                  {isOwn && (
                    <button
                      type="button"
                      onClick={() => onDeleteMessage(message.id)}
                      className="text-xs border border-bark px-1.5 py-1 rounded-lg"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <form
        className="flex gap-2 mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (content.trim()) onSend();
        }}
      >
        <input
          type="text"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-bark rounded-lg px-3 py-2"
        />
        <button type="submit" className="bg-bark text-cream px-4 py-2 rounded-lg">
          Send
        </button>
      </form>
    </section>
  );
}
