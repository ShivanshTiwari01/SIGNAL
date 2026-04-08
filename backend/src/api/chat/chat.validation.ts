import * as z from 'zod';

export const ConversationSchema = z.object({
  conversationId: z.string().optional(),
  text: z.string().min(10, 'Please provide more details'),
});
