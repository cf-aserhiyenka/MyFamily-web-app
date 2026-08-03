import { z } from "zod";

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1, "Message cannot be empty").max(2000, "Message is too long"),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const createGroupConversationSchema = z.object({
  name: z.string().trim().min(1, "Group name cannot be empty").max(100, "Group name is too long"),
  memberIds: z.array(z.string()).min(1, "Select at least one member"),
});

export type CreateGroupConversationInput = z.infer<typeof createGroupConversationSchema>;
