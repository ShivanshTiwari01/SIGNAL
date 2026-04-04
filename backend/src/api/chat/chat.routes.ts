import express from 'express';
import * as controller from './chat.controller';
import validate from '../../middleware/validate';
import * as validation from './chat.validation';

const router = express.Router();

router.post(
  '/conversation',
  validate(validation.ConversationSchema),
  controller.conversation,
);

router.get('/conversation/:conversationId', controller.fetchConversation);

export default router;
