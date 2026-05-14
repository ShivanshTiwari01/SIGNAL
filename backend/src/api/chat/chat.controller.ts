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
  generateContentStream,
  AI_MODEL,
} from './chat.helper';
import {
  buildSignalSystemPrompt,
  SIGNAL_FALLBACK_PROMPT,
} from '../../config/prompts';
import { topCompanies } from '../../constants/nifty';

const user = prisma.user;
const conversations = prisma.conversations;
const messages = prisma.messages;
const attachment = prisma.attachment;

export const conversation = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.query;
    const { text } = req.body;

    const { userId: clerkUserId } = getAuth(req);

    if (!clerkUserId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const userExists = await user.findUnique({
      where: { userClerkId: clerkUserId },
    });

    if (!userExists) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const userId = userExists.id;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'text is required',
      });
    }

    let conversation: any = null;

    console.log('conversation id ', conversationId);
    console.log('type of conversation id ', typeof conversationId);

    if (conversationId) {
      conversation = await conversations.findUnique({
        where: {
          id: conversationId as string,
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

      console.log('Stock data fetched from cache', stockData);
    } else {
      for (const symbol of topCompanies) {
        const data: any = await fetchTimeSeriesDaily(symbol);

        const analysis = analyzeStock(data, symbol);

        if (analysis) stockData.push(analysis);

        await new Promise((r) => setTimeout(r, 2000));
      }

      console.log('Stock data fetched from api', stockData);

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

    const systemPrompt =
      stockData.length > 0
        ? buildSignalSystemPrompt(stockData)
        : SIGNAL_FALLBACK_PROMPT;

    const prompt = `${systemPrompt}\n\nUser: ${text}`;

    const aiReply: any = await generateContent(
      prompt,
      recentMessages,
      base64Image,
      req.file?.mimetype,
    );

    if (!aiReply) {
      return res.status(503).json({
        success: false,
        message: 'AI service temporarily unavailable. Please try again.',
      });
    }

    await messages.create({
      data: {
        content: aiReply.text,
        role: 'ai',
        model: AI_MODEL,
        conversationId: conversation.id,
        tokenCount: aiReply.text?.length ?? 0,
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

    const userExists = await user.findUnique({
      where: { userClerkId: clerkUserId },
    });

    if (!userExists) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const conversationsList = await conversations.findMany({
      where: {
        userId: userExists.id,
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

async function resolveStockData(): Promise<any[]> {
  const cached = await redisClient.get('stockData');
  if (cached) return JSON.parse(cached);

  const stockData: any[] = [];
  for (const symbol of topCompanies) {
    const data: any = await fetchTimeSeriesDaily(symbol);
    const analysis = analyzeStock(data, symbol);
    if (analysis) stockData.push(analysis);
    await new Promise((r) => setTimeout(r, 2000));
  }
  await redisClient.set('stockData', JSON.stringify(stockData));
  return stockData;
}

export const conversationStream = async (req: Request, res: Response) => {
  const { conversationId } = req.query;
  const { text } = req.body;
  const { userId: clerkUserId } = getAuth(req);

  if (!clerkUserId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const userExists = await user.findUnique({
    where: { userClerkId: clerkUserId },
  });
  if (!userExists) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  if (!text) {
    res.status(400).json({ success: false, message: 'text is required' });
    return;
  }

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const sendEvent = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const userId = userExists.id;

    let conv: any = null;

    if (conversationId) {
      conv = await conversations.findUnique({
        where: { id: conversationId as string },
      });
    } else {
      conv = await conversations.create({
        data: { title: 'New Conversation', userId, model: AI_MODEL },
      });
    }

    const userMessage = await messages.create({
      data: {
        content: text,
        role: 'user',
        conversationId: conv.id,
        tokenCount: text.length,
      },
    });

    // Handle optional image
    let base64Image: string | undefined;

    if (req.file) {
      const uploadedUrl = await uploadImageToCloudinary(req.file);
      base64Image = req.file.buffer.toString('base64');
      await attachment.create({
        data: {
          messageId: userMessage.id,
          fileName: req.file.originalname,
          fileType: req.file.mimetype,
          fileSize: req.file.size,
          fileUrl: uploadedUrl || '',
        },
      });
    }

    const stockData = await resolveStockData();

    const recentMessages = await messages.findMany({
      where: { conversationId: conv.id },
      orderBy: { createdAt: 'asc' },
      take: 10,
      select: { role: true, content: true },
    });

    const systemPrompt =
      stockData.length > 0
        ? buildSignalSystemPrompt(stockData)
        : SIGNAL_FALLBACK_PROMPT;

    const prompt = `${systemPrompt}\n\nUser: ${text}`;

    const stream = await generateContentStream(
      prompt,
      recentMessages,
      base64Image,
      req.file?.mimetype,
    );

    let fullContent = '';

    for await (const chunk of stream) {
      const token = chunk.text ?? '';
      if (token) {
        fullContent += token;
        sendEvent({ token });
      }
    }

    // Persist the complete AI response
    await messages.create({
      data: {
        content: fullContent,
        role: 'ai',
        model: AI_MODEL,
        conversationId: conv.id,
        tokenCount: fullContent.length,
      },
    });

    sendEvent({ done: true, conversationId: conv.id });
    res.end();
  } catch (error) {
    logger.error(error, 'Error in conversationStream handler');
    sendEvent({ error: 'An error occurred while generating the response.' });
    res.end();
  }
};

export const marketTicker = async (req: Request, res: Response) => {
  try {
    const cached = await redisClient.get('stockData');

    if (!cached) {
      return res.status(200).json({ success: true, data: [] });
    }

    const stocks: any[] = JSON.parse(cached);

    const ticker = stocks.map((s) => ({
      symbol: s.symbol,
      price: s.price,
      change: s.priceChange,
      trend: s.trend,
    }));

    return res.status(200).json({ success: true, data: ticker });
  } catch (error) {
    logger.error(error, 'Error in marketTicker handler');
    return res
      .status(500)
      .json({ success: false, message: 'Internal Server Error' });
  }
};
