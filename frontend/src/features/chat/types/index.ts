export interface Conversation {
  id: string;
  title: string;
}

export interface Attachment {
  id: string;
  messageId: string;
  fileName: string;
  fileUrl: string;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'ai';
  conversationId: string;
  tokenCount: number;
  createdAt: string;
  attachments?: Attachment[];
}

export interface PaginatedMessages {
  data: Message[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
