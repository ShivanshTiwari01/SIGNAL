import { GoogleGenAI } from '@google/genai';
import { logger } from '../../app';

const ai = new GoogleGenAI({});

interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const generateContent = async (
  prompt: string,
  history?: { role: string; content: string }[],
  image?: string,
  mimeType?: string,
) => {
  let response: any = null;
  let contents: any = [];

  if (history) {
    contents = (history || []).map((msg) => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));
  }

  contents.push({
    parts: image
      ? [{ inlineData: { mimeType, data: image } }, { text: prompt }]
      : [{ text: prompt }],
  });

  try {
    response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents,
    });

    console.log('AI Response: ', response);

    return response;
  } catch (error) {
    logger.error(error, 'AI API call error');
    return null;
  }
};

export const fetchTimeSeriesDaily = async (symbol: string) => {
  try {
    const response: any = await fetch(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}.BSE&outputsize=compact&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`,
    );

    const data = await response.json();

    const timeSeries = data['Time Series (Daily)'];

    if (!timeSeries) {
      logger.warn(
        { symbol, response: data },
        'Time Series (Daily) missing - likely rate limited',
      );
      return null;
    }

    const cleanedData = Object.entries(timeSeries).map(([date, val]) => {
      const valData = val as Record<string, string>;
      return {
        date,
        open: Number(valData['1. open']),
        high: Number(valData['2. high']),
        low: Number(valData['3. low']),
        close: Number(valData['4. close']),
        volume: Number(valData['5. volume']),
      };
    });

    return cleanedData;
  } catch (error) {
    logger.error(error, 'Time Seried Data API call error');
    return null;
  }
};

export const calculateSMA = (data: Candle[], period: number) => {
  if (data.length < period) return null;

  const slice = data.slice(0, period);
  const sum = slice.reduce((acc, candle) => acc + candle.close, 0);

  return sum / period;
};

export const calculateRSI = (data: Candle[], period: number = 14) => {
  if (data.length < period) return null;

  let gains = 0;
  let losses = 0;

  for (let i = 0; i < period; i++) {
    const change = data[i].close - data[i + 1].close;

    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  return rsi;
};

export const interpretRSI = (rsi: number) => {
  if (rsi > 70) return 'overbought';
  if (rsi < 30) return 'oversold';
  return 'neutral';
};

export const calculatePriceChange = (data: Candle[]) => {
  if (data.length < 2) return null;

  const current = data[0].close;
  const previous = data[1].close;

  return ((current - previous) / previous) * 100;
};

export const analyzeStock = (data: Candle[], symbol: string) => {
  if (!data || data.length === 0) return null;

  const sma20 = calculateSMA(data, 20);
  const sma50 = calculateSMA(data, 50);
  const rsi = calculateRSI(data);
  const priceChange = calculatePriceChange(data);

  return {
    symbol: symbol,
    price: data[0].close,
    sma20,
    sma50,
    rsi,
    rsiSignal: rsi ? interpretRSI(rsi) : null,
    priceChange,
    trend: sma20 && sma50 ? (sma20 > sma50 ? 'uptrend' : 'downtrend') : null,
  };
};
