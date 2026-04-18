import { Request, Response } from 'express';
import { Webhook } from 'svix';
import { getAuth } from '@clerk/express';
import prisma from '../../config/db';
import { logger } from '../../app';

const user = prisma.user;
const userProfile = prisma.userProfile;

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

      const existingUser = await user.findUnique({
        where: {
          userClerkId: clerkUser.id,
        },
      });

      if (existingUser) {
        return res.status(200).json({
          success: true,
          message: 'User already exists',
        });
      }

      const email = clerkUser.email_addresses[0].email_address;
      const isEmailVerified =
        clerkUser.email_addresses[0].verification.status === 'verified';
      const username = email.split('@')[0];

      console.log('verification', isEmailVerified);
      console.log('username', username);

      const newUser = await user.create({
        data: {
          userClerkId: clerkUser.id,
          email,
          username,
          isEmailVerified,
        },
      });

      const newUserProfile = await userProfile.create({
        data: {
          userId: newUser.id,
          firstName: clerkUser.first_name,
          lastName: clerkUser.last_name,
        },
      });

      logger.info({ 'new user': newUser });
      logger.info({ 'new user profile': newUserProfile });

      return res.status(201).json({
        success: true,
        message: 'User created successfully',
      });
    }
  } catch (error) {
    logger.error({ 'Error processing webhook': error });
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

export const completeProfile = async (req: Request, res: Response) => {
  try {
    const { bio, dob, mobile } = req.body;

    const { userId } = getAuth(req);

    const userExists = await user.findFirst({
      where: {
        userClerkId: userId as string,
      },
    });

    if (!userExists) {
      return res.status(404).json({
        success: 'false',
        message: 'User not found',
      });
    }

    if (mobile) {
      await user.update({
        data: {
          mobile,
        },
        where: {
          userClerkId: userId as string,
        },
      });
    }

    const updatedData: any = {};

    if (bio !== undefined || bio !== null) updatedData.bio = bio;
    if (dob !== undefined || dob !== null) updatedData.dob = dob;

    await userProfile.update({
      data: updatedData,
      where: {
        userId: userExists.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
