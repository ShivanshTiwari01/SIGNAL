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
      const clerkUser = event.data;

      console.log('Clerk user created:', clerkUser);

      const existingUser = await user.findUnique({
        where: {
          userClerkId: clerkUser.id,
        },
      });

      console.log('Existing user found:', existingUser);

      if (existingUser) {
        return res.status(200).json({
          success: true,
          message: 'User already exists',
        });
      }

      const newUser = await user.create({
        data: {
          userClerkId: clerkUser.id,
          email: clerkUser.email_addresses[0].email_address,
        },
      });

      console.log('User created in database:', newUser);

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
