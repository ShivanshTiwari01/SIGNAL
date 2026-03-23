import { Request, Response } from 'express';
import { Webhook } from 'svix';
import prisma from '../../config/db';

const user = prisma.user;

export const signup = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const headers = req.headers;

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET as string);
    let event: any;

    try {
      event = wh.verify(JSON.stringify(payload), {
        'svix-id': headers['svix-id'] as string,
        'svix-timestamp': headers['svix-timestamp'] as string,
        'svix-signature': headers['svix-signature'] as string,
      });
    } catch (err) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    if (event.type === 'user.created') {
      const user = event.data;

      console.log('Clerk user created:', user);

      const existingUser = await user.findUnique({
        where: {
          clerkId: user.id,
        },
      });

      if (existingUser) {
        return res.status(200).json({
          success: true,
          message: 'User already exists',
        });
      }

      await user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0].emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'User created successfully',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};
