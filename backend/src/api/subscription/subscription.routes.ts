import express from 'express';
import { requireAuth } from '@clerk/express';
import * as controller from './subscription.controller';
import validate from '../../middleware/validate';
// import { completeProfileSchema } from './auth.validation';

const router = express.Router();

router.post('/create-plan', controller.createRazorpayPlan);

router.post('/subscription-create', controller.subscription);

router.post('/verify-payment', controller.verifyPayment);

router.post('/subscription-webhook', controller.razorpayWebhook);

export default router;
