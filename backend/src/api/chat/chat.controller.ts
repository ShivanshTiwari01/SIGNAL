import { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import prisma from '../../config/db';
import redisClient from '../../config/redis';
import { logger } from '../../app';
import uploadImageToCloudinary from '../../helpers/cloudinary';
import {
  analyzeStock,
  fetchTimeSeriesDaily,
  generateContent,
} from './chat.helper';
import { topCompanies } from '../../constants/nifty';

const user = prisma.user;
const conversations = prisma.conversations;
const messages = prisma.messages;
const attachment = prisma.attachment;

export const conversation = async (req: Request, res: Response) => {
  try {
    console.log('hitting api');
    const { conversationId } = req.query;
    const { text } = req.body;

    const { userId: clerkUserId } = getAuth(req);
    if (!clerkUserId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const dbUser = await user.findUnique({
      where: { userClerkId: clerkUserId },
    });
    if (!dbUser) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }
    const userId = dbUser.id;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'text is required',
      });
    }

    let conversation: any = null;

    console.log('conversation id ', conversationId);
    console.log('type of conversation id ', typeof conversationId);

    if (conversationId && typeof conversationId === 'string') {
      conversation = await conversations.findUnique({
        where: {
          id: conversationId,
        },
      });
    } else {
      conversation = await conversations.create({
        data: {
          title: 'New Conversation',
          userId: userId,
          model: 'gemini-3-flash-preview',
        },
      });
    }

    const message = await messages.create({
      data: {
        content: text,
        role: 'user',
        conversationId: conversation.id,
        tokenCount: text.length,
      },
    });

    let base64Image: string | undefined = undefined;
    let uploadImage: string | null = null;

    if (req.file) {
      uploadImage = await uploadImageToCloudinary(req.file);

      base64Image = req.file.buffer.toString('base64');

      await attachment.create({
        data: {
          messageId: message.id,
          fileName: req.file.originalname,
          fileType: req.file.mimetype,
          fileSize: req.file.size,
          fileUrl: uploadImage || '',
        },
      });
    }

    let stockData = [];

    let cachedStockData = await redisClient.get('stockData');

    if (cachedStockData) {
      stockData = JSON.parse(cachedStockData);

      console.log('Stock data fetched from cache');
    } else {
      for (const symbol of topCompanies) {
        const data: any = await fetchTimeSeriesDaily(symbol);

        const analysis = analyzeStock(data, symbol);

        if (analysis) stockData.push(analysis);

        await new Promise((r) => setTimeout(r, 2000));
      }

      await redisClient.set('stockData', JSON.stringify(stockData));
    }

    const recentMessages = await messages.findMany({
      where: {
        conversationId: conversation.id,
      },
      orderBy: { createdAt: 'asc' },
      take: 10,
      select: {
        role: true,
        content: true,
      },
    });

    const systemContext = `
      You are Signal AI, a professional trading intelligence assistant specialising in the Indian stock market (NIFTY50).

      You always have access to the latest real-time market data for the top NIFTY50 stocks listed below. Use this data to ground every response — whether the user asks for stock picks, analysis, trend explanations, risk assessment, or general market questions.

      Current Market Data (NIFTY50):
      ${JSON.stringify(stockData, null, 2)}

      Guidelines:
      - Always reference the provided stock data when relevant
      - Be decisive and actionable — avoid vague or generic answers
      - Keep responses concise and trader-friendly
      - If the user asks what to buy, rank your top picks clearly with reasoning
      - If the user asks about a specific stock, analyse it using the data above
      - For general market questions, use the overall data to give context
      `;

    const prompt = `${systemContext}\n\nUser: ${text}`;

    const aiReply: any = await generateContent(
      prompt,
      recentMessages,
      base64Image,
      req.file?.mimetype,
    );

    await messages.create({
      data: {
        content: aiReply.text,
        role: 'ai',
        conversationId: conversation.id,
        tokenCount: aiReply.text.length,
      },
    });

    return res.status(200).json({
      success: true,
      data: { text: aiReply.text, conversationId: conversation.id },
    });
  } catch (error) {
    logger.error(error, 'Error in create conversation handler');
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

export const fetchConversation = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt((req.query.page as string) ?? '1', 10);
    const pageSize = parseInt((req.query.pageSize as string) ?? '20', 10);

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: 'conversationId is required',
      });
    }

    const [paginatedMessages, total] = await Promise.all([
      messages.findMany({
        where: {
          conversationId: conversationId.toString(),
        },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          attachments: {
            select: {
              id: true,
              messageId: true,
              fileName: true,
              fileUrl: true,
            },
          },
        },
      }),
      messages.count({
        where: {
          conversationId: conversationId.toString(),
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: paginatedMessages,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    logger.error(error, 'Error in fetchConversation handler');
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

export const fetchConversations = async (req: Request, res: Response) => {
  try {
    const { userId: clerkUserId } = getAuth(req);
    if (!clerkUserId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const dbUser = await user.findUnique({
      where: { userClerkId: clerkUserId },
    });
    if (!dbUser) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const conversationsList = await conversations.findMany({
      where: {
        userId: dbUser.id,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
      },
    });

    if (!conversationsList) {
      return res.status(404).json({
        success: false,
        message: 'No conversations found',
      });
    }

    return res.status(200).json({
      success: true,
      data: conversationsList,
    });
  } catch (error) {
    logger.error(error, 'Error in fetchConversations handler:');
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};
