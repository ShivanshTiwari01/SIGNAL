import Zod from 'zod';

export const ConversationSchema = Zod.object({
  conversationId: Zod.string().optional(),
  text: Zod.string().min(10, 'Please provide more details'),
});
