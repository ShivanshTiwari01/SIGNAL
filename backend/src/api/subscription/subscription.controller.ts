import { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import prisma from '../../config/db';
import { subscriptionPlans } from '../../constants/subscriptionPlans';
import razorpay from '../../config/razorpay';
import { logger } from '../../app';

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

export const subscriptionCancel = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
