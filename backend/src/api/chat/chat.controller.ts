import { Request, Response } from 'express';
import prisma from '../../config/db';
import uploadImageToCloudinary from '../../helpers/cloudinary';
import { generateContent } from './chat.helper';

const user = prisma.user;
const conversations = prisma.conversations;
const messages = prisma.messages;
const attachment = prisma.attachment;

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

    const aiReply: any = await generateContent(
      text,
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
