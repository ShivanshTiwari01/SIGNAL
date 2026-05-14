import express from 'express';
import { requireAuth } from '@clerk/express';
import * as controller from './subscription.controller';

const router = express.Router();

router.post('/create-plan', controller.createRazorpayPlan);

router.post('/subscription-create', requireAuth(), controller.subscription);

router.post('/verify-payment', requireAuth(), controller.verifyPayment);

router.post('/subscription-webhook', controller.razorpayWebhook);

export default router;
