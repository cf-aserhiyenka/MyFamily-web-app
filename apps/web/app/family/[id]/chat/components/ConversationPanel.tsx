"use client";

import { conversationLabel, type ConversationRow, type MessageRow } from "../types";

type ConversationPanelProps = {
  conversation: ConversationRow | undefined;
  messages: MessageRow[] | undefined;
  content: string;
  onContentChange: (content: string) => void;
  onSend: () => void;
  memberId: string;

};

export function ConversationPanel({
  conversation,
  messages,
  content,
  onContentChange,
  onSend,
  memberId,

}: ConversationPanelProps) {
  
  return (
    <section className="flex-1 flex flex-col p-4">
      {conversation && (
        <div className="border-b border-bark pb-2 mb-3">
          <h3 className="font-semibold">{conversationLabel(conversation)}</h3>
          <p className="text-xs">{conversation.participantNames.join(", ")}</p>
        </div>
      )}

      <div className="flex-1 flex flex-col gap-3">
        {messages?.map((message) => (
          <div key={message.id}>
            <div className={`text-xs ${message.senderId === memberId ? "text-right" : "text-left"}`}>
              <p className="text-xs">{message.senderName}</p>
              <p className="border border-bark rounded-lg px-3 py-2 inline-block">{message.content}</p>
            </div>
          </div>
        ))}
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
