import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import prisma from '../../config/db';
import uploadImageToCloudinary from '../../helpers/cloudinary';

const user = prisma.user;
const conversations = prisma.conversations;
const messages = prisma.messages;

export const conversation = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;

    const userId = 'c8cf6335-6468-4572-a143-d4533bf37064';

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'text is required',
      });
    }

    let base64Image: string | null = null;

    if (req.file) {
      const uploadImage = await uploadImageToCloudinary(req.file);

      if (uploadImage) {
        console.log('Image uploaded to Cloudinary:', uploadImage);
      }

      base64Image = req.file.buffer.toString('base64');
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

    const ai = new GoogleGenAI({});

    let response: any = null;

    try {
      if (base64Image) {
        response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [
            {
              inlineData: {
                mimeType: req.file ? req.file.mimetype : 'text/plain',
                data: base64Image || Buffer.from(text).toString('base64'),
              },
            },
            {
              text: text,
            },
          ],
        });
      } else {
        response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: text,
        });
      }

      console.log('AI Response:', response);
    } catch (error) {
      console.error('Error generating content:', error);
      return res.status(400).json({
        success: false,
        message: 'Error generating content',
      });
    }

    const aiMessage = await messages.create({
      data: {
        content: response.text,
        role: 'ai',
        conversationId: conversation.id,
        tokenCount: response.text.length,
      },
    });

    return res.status(200).json({
      success: true,
      data: { text: response.text },
    });
  } catch (error) {
    console.error('Error in conversation handler:', error);
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
    console.error('Error in fetchConversation handler:', error);
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
    console.error('Error in fetchConversations handler:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};
