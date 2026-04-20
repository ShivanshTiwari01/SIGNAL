import { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import crypto from 'crypto';
import prisma from '../../config/db';
import { subscriptionPlans } from '../../constants/subscriptionPlans';
import razorpay from '../../config/razorpay';
import { logger } from '../../app';
import { Plan } from '../../generated/prisma/enums';

const user = prisma.user;

export const createRazorpayPlan = async (req: Request, res: Response) => {
  try {
    const { name, amount, currency = 'INR', description } = req.body;

    console.log(req.body);

    const plan = await razorpay.plans.create({
      period: 'monthly', // weekly / monthly / yearly
      interval: 1, // every 1 month
      item: {
        name,
        amount, // amount in paise (499 INR)
        currency,
        description,
      },
    });

    console.log(plan);

    return res.status(200).json({
      success: true,
      message: 'Plan created successfully',
      plan,
    });
  } catch (error) {
    logger.error({ 'Razorpay Plan creation error': error });
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const subscription = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);

    const { plan } = req.body;

    const planExists = Object.values(subscriptionPlans).find(
      (p) => p.id === plan,
    );

    if (!planExists) {
      return res.status(404).json({
        success: false,
        message: 'Plan not exists',
      });
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: planExists.id,
      customer_notify: 1, // Razorpay notifies customer via email
      total_count: 12, // number of billing cycles (12 months)
      quantity: 1,
    });

    return res.status(201).json({
      success: true,
      subscription_id: subscription.id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    } = req.body;

    const { userId } = getAuth(req);

    const planEntry = Object.entries(subscriptionPlans).find(
      ([_, p]) => p.id === razorpay_subscription_id,
    );

    if (planEntry) {
      await user.update({
        data: {
          subscriptionId: razorpay_subscription_id,
          plan: planEntry[0] as keyof typeof Plan,
        },
        where: {
          userClerkId: userId as string,
        },
      });
    }

    // Generate expected signature
    const body = razorpay_payment_id + '|' + razorpay_subscription_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
      .update(body)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Payment is legit — activate subscription in your DB here
      res.status(200).json({
        success: true,
        message: 'Subscription activated!',
      });
    } else {
      // Tampered payment
      return res.status(400).json({
        success: false,
        message: 'Invalid signature',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const razorpayWebhook = (req: Request, res: Response) => {
  const webhookSecret: any = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(req.body)
    .digest('hex');

  if (signature === expectedSignature) {
    const event = JSON.parse(req.body);

    switch (event.event) {
      case 'subscription.activated':
        // Activate user access in DB
        break;
      case 'subscription.charged':
        // Renewal successful
        break;
      case 'subscription.cancelled':
        // Revoke user access
        break;
      case 'payment.failed':
        // Notify user
        break;
    }

    res.json({ received: true });
  } else {
    res.status(400).send('Invalid signature');
  }
};
