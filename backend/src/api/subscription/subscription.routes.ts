import express from 'express';
import { requireAuth } from '@clerk/express';
import * as controller from './subscription.controller';
import validate from '../../middleware/validate';
// import { completeProfileSchema } from './auth.validation';

const router = express.Router();

router.post('/create-plan', controller.createRazorpayPlan);

router.post('/subscription-create', controller.subscription);

router.post('/subscription-cancel', controller.subscriptionCancel);

// router.post('/subscription-webhook', controller.webhook);

export default router;
