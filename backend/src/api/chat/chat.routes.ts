import express from 'express';
import multer from 'multer';
import * as controller from './chat.controller';
import validate from '../../middleware/validate';
import * as validation from './chat.validation';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

router.post(
  '/conversation',
  upload.single('image'),
  validate(validation.ConversationSchema),
  controller.conversation,
);

router.get('/conversation/:conversationId', controller.fetchConversation);

router.get('/conversations', controller.fetchConversations);

export default router;
