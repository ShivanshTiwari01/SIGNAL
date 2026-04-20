import { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import crypto from 'crypto';
import prisma from '../../config/db';
import { subscriptionPlans } from '../../constants/subscriptionPlans';
import razorpay from '../../config/razorpay';
import { logger } from '../../app';
import { PaymentStatus, Plan, Status } from '../../generated/prisma/enums';

const user = prisma.user;
const payment = prisma.payment;
const subs = prisma.subscription;

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
      notes: {
        user_id: userId,
      },
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

    const planExists = Object.values(subscriptionPlans).find(
      (p) => p.id === razorpay_subscription_id,
    );

    if (!planExists) {
      return res.status(404).json({
        success: false,
        message: 'Plan does not exist',
      });
    }

    const body = razorpay_payment_id + '|' + razorpay_subscription_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
      .update(body)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
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

      await payment.create({
        data: {
          userId: userId as string,
          razorpay_payment_id,
          amount: planExists.price,
          currency: 'INR',
          status: PaymentStatus.Succeeded,
        },
      });

      res.status(200).json({
        success: true,
        message: 'Subscription activated!',
      });
    } else {
      await payment.create({
        data: {
          userId: userId as string,
          razorpay_payment_id,
          amount: planExists.price,
          currency: 'INR',
          status: PaymentStatus.Failed,
        },
      });

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

export const razorpayWebhook = async (req: Request, res: Response) => {
  const webhookSecret: any = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(req.body)
    .digest('hex');

  if (signature === expectedSignature) {
    const event = JSON.parse(req.body);

    const notes = event.payload?.subscription?.entity?.notes;
    const userId = notes?.user_id;
    const subscriptionId = event.payload?.subscription?.entity?.id;

    const subscriptionEntity = event.payload?.subscription?.entity;

    const currentPeriodStart = new Date(
      subscriptionEntity?.current_start * 1000,
    );
    const currentPeriodEnd = new Date(subscriptionEntity?.current_end * 1000);

    switch (event.event) {
      case 'subscription.activated':
        await subs.create({
          data: {
            userId: userId as string,
            subscriptionId: subscriptionId,
            status: Status.Active,
            currentPeriodStart,
            currentPeriodEnd,
          },
        });
        break;
      case 'subscription.charged':
        await subs.update({
          where: { subscriptionId: subscriptionId },
          data: {
            status: Status.Active,
            currentPeriodStart,
            currentPeriodEnd,
          },
        });
        break;
      case 'subscription.cancelled':
        await subs.update({
          where: { subscriptionId: subscriptionId },
          data: {
            status: Status.Canceled,
            cancelAtPeriodEnd: true,
          },
        });
        break;
      case 'payment.failed':
        await subs.update({
          where: { subscriptionId: subscriptionId },
          data: {
            status: Status.PastDue,
          },
        });
        break;
    }

    res.json({ received: true });
  } else {
    res.status(400).send('Invalid signature');
  }
};
