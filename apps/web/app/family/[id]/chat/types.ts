export type ConversationRow = {
  id: string;
  type: "GROUP_DEFAULT" | "GROUP_CUSTOM" | "DIRECT";
  name: string | null;
  participantNames: string[];
};

export type MessageRow = {
  id: string;
  content: string;
  sentAt: string;
  senderId: string;
  senderName: string;
};

export type MemberRow = {
  id: string;
  name: string;
};

export function conversationLabel(conversation: ConversationRow) {
  if (conversation.name) return conversation.name;
//  return conversation.type === "GROUP_DEFAULT" ? "Whole family" : "Group chat";
}
