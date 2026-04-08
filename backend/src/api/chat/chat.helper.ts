import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

export const generateContent = async (
  prompt: string,
  image?: string,
  mimeType?: string,
) => {
  let response: any = null;

  try {
    if (image) {
      response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            inlineData: {
              mimeType: mimeType || 'text/plain',
              data: image || Buffer.from(prompt).toString('base64'),
            },
          },
          {
            text: prompt,
          },
        ],
      });
    } else {
      response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
    }

    console.log('AI Response:', response);

    return response;
  } catch (error) {
    console.error('Error generating content:', error);
  }
};
