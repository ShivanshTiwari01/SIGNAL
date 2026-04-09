import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

export const generateContent = async (
  prompt: string,
  history: { role: string; content: string }[],
  image?: string,
  mimeType?: string,
) => {
  let response: any = null;

  const contents: any = history.map((msg) => ({
    role: msg.role === 'ai' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  contents.push({
    parts: image
      ? [{ inlineData: { mimeType, data: image } }, { text: prompt }]
      : [{ text: prompt }],
  });

  response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents,
  });

  console.log('AI Response: ', response);

  return response;

  // try {
  //   if (image) {
  //     response = await ai.models.generateContent({
  //       model: 'gemini-3-flash-preview',
  //       contents: [
  //         {
  //           inlineData: {
  //             mimeType: mimeType || 'text/plain',
  //             data: image || Buffer.from(prompt).toString('base64'),
  //           },
  //         },
  //         {
  //           text: prompt,
  //         },
  //       ],
  //     });
  //   } else {
  //     response = await ai.models.generateContent({
  //       model: 'gemini-3-flash-preview',
  //       contents: prompt,
  //     });
  //   }

  //   console.log('AI Response:', response);

  //   return response;
  // } catch (error) {
  //   console.error('Error generating content:', error);
  // }
};
