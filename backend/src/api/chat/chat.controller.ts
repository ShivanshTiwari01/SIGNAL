import { Request, Response } from 'express';
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
    const { conversationId } = req.query;
    const { text } = req.body;

    const userId = 'c8cf6335-6468-4572-a143-d4533bf37064';

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'text is required',
      });
    }

    let conversation: any = null;

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

    console.log('stock data: ', stockData);

    if (text.toLowerCase().trim() === 'what should i buy today') {
      const messagePayload = {
        market: 'NIFTY50',
        stocks: stockData,
        instruction: `
          You are a professional stock market analyst.

          Your task is to analyze the given stocks and select the TOP 3 best stocks to BUY TODAY.

          Selection Criteria:
          - Strong uptrend (based on SMA20 vs SMA50)
          - Healthy momentum (RSI not overbought, ideally between 40–65 or slightly oversold)
          - Positive price movement (priceChange > 0 preferred)
          - Overall strength compared to other stocks

          Instructions for Output:
          - Rank the top 3 stocks clearly as #1, #2, #3
          - Be decisive — DO NOT say "depends" or give vague answers
          - Keep response concise, sharp, and useful for action

          Output Format (STRICT — follow exactly):

          Start with:
          "Good morning! Here are the top 3 stocks to consider for today:"

          Then for each stock:

          1. STOCK_NAME (Rank #1)
          - Why it's strong (short bullet points)
          - Weakness (1-2 points max)
          - Short-term view (intraday/1-2 days)
          - Long-term view (trend perspective)

          Repeat for Rank #2 and Rank #3.

          Rules:
          - No long paragraphs
          - No generic explanations
          - No repeating definitions of indicators
          - Focus only on decision-making insights
          - Keep total response crisp and under ~200-250 words
          `,
      };

      const prompt = `${messagePayload.instruction}n\n Stock Data: ${JSON.stringify(messagePayload.stocks, null, 2)}`;

      const aiReply: any = await generateContent(prompt);

      console.log('buy today ai reply: ', aiReply);

      return res.status(200).json({
        success: true,
        data: {
          text: aiReply.text,
        },
      });
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

    const aiReply: any = await generateContent(
      text,
      recentMessages,
      base64Image,
      req.file?.mimetype,
    );

    const aiMessage = await messages.create({
      data: {
        content: aiReply.text,
        role: 'ai',
        conversationId: conversation.id,
        tokenCount: aiReply.text.length,
      },
    });

    return res.status(200).json({
      success: true,
      data: { text: aiReply.text },
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
    const conversationsList = await conversations.findMany({
      where: {
        userId: 'c8cf6335-6468-4572-a143-d4533bf37064',
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
