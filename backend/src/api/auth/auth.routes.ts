import express from 'express';
import { requireAuth } from '@clerk/express';
import * as controller from './auth.controller';
import validate from '../../middleware/validate';
import { completeProfileSchema } from './auth.validation';

const router = express.Router();

router.post('/signup', controller.signup);

router.patch(
  'complete-profile',
  requireAuth(),
  validate(completeProfileSchema),
  controller.completeProfile,
);

export default router;
