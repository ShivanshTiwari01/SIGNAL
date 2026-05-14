'use client';

import { useEffect, useRef, useState } from 'react';
import api from '@/store/axios';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TickerItem {
  symbol: string;
  price: number;
  change: number | null;
  trend: string | null;
}

// Fallback mock data shown while data loads or if API is unavailable
const MOCK_TICKERS: TickerItem[] = [
  { symbol: 'RELIANCE', price: 2847.5, change: 1.23, trend: 'uptrend' },
  { symbol: 'TCS', price: 4215.8, change: -0.42, trend: 'downtrend' },
  { symbol: 'HDFCBANK', price: 1923.4, change: 0.87, trend: 'uptrend' },
  { symbol: 'INFY', price: 1672.3, change: 2.15, trend: 'uptrend' },
  { symbol: 'ICICIBANK', price: 1456.9, change: -0.63, trend: 'downtrend' },
  { symbol: 'BAJFINANCE', price: 7834.2, change: 1.54, trend: 'uptrend' },
  { symbol: 'HINDUNILVR', price: 2543.7, change: -0.29, trend: 'downtrend' },
  { symbol: 'BHARTIARTL', price: 1892.6, change: 3.21, trend: 'uptrend' },
  { symbol: 'ITC', price: 487.3, change: 0.41, trend: 'uptrend' },
  { symbol: 'KOTAKBANK', price: 2134.5, change: -1.08, trend: 'downtrend' },
  { symbol: 'SBIN', price: 823.4, change: 1.77, trend: 'uptrend' },
  { symbol: 'WIPRO', price: 567.8, change: -0.53, trend: 'downtrend' },
];

function TickerItemEl({ item }: { item: TickerItem }) {
  const isUp = (item.change ?? 0) >= 0;
  const changeAbs = Math.abs(item.change ?? 0).toFixed(2);

  return (
    <div className='flex items-center gap-2.5 px-5 shrink-0 border-r border-white/5'>
      <span className='text-foreground font-semibold text-xs tracking-wide'>
        {item.symbol}
      </span>
      <span className='text-foreground/80 text-xs tabular-nums'>
        ₹
        {item.price.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
      <span
        className={`flex items-center gap-0.5 text-xs font-medium tabular-nums ${
          isUp ? 'text-growth' : 'text-loss'
        }`}
      >
        {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
        {isUp ? '+' : '-'}
        {changeAbs}%
      </span>
    </div>
  );
}

export default function TickerStrip() {
  const [tickers, setTickers] = useState<TickerItem[]>(MOCK_TICKERS);
  const trackRef = useRef<HTMLDivElement>(null);

  // Try to fetch live ticker data
  useEffect(() => {
    api
      .get('/chat/market/ticker')
      .then((res) => {
        const data: TickerItem[] = res.data?.data ?? [];
        if (data.length > 0) setTickers(data);
      })
      .catch(() => {
        // Silently use mock data
      });
  }, []);

  // Smooth CSS animation — duplicate the ticker items for seamless loop
  const doubled = [...tickers, ...tickers];

  return (
    <div className='h-9 bg-card border-b border-border overflow-hidden relative flex items-center shrink-0'>
      {/* Left fade */}
      <div className='absolute left-0 top-0 bottom-0 w-8 bg-linear-to-r from-card to-transparent z-10 pointer-events-none' />
      {/* Right fade */}
      <div className='absolute right-0 top-0 bottom-0 w-8 bg-linear-to-l from-card to-transparent z-10 pointer-events-none' />

      {/* Label */}
      <div className='flex items-center gap-1.5 px-3 border-r border-border shrink-0 z-10 bg-card h-full'>
        <span className='w-1.5 h-1.5 rounded-full bg-growth animate-pulse' />
        <span className='text-[10px] font-semibold text-muted-foreground uppercase tracking-widest'>
          NIFTY50
        </span>
      </div>

      {/* Scrolling ticker */}
      <div className='flex-1 overflow-hidden' ref={trackRef}>
        <div
          className='flex items-center'
          style={{
            animation: `ticker-scroll ${tickers.length * 3}s linear infinite`,
          }}
        >
          {doubled.map((item, i) => (
            <TickerItemEl key={`${item.symbol}-${i}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
