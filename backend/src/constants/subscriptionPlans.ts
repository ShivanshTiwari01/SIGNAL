export const subscriptionPlans = {
  explorer: {
    id: 'explorer',
    name: 'explorer',
    price: 0,
    yearlyPrice: 0,
    features: ['basic'],
    billingPeriod: 'monthly' as const,
  },
  trader: {
    id: 'trader',
    name: 'trader',
    price: 1999,
    yearlyPrice: 19990, // 10 months price = 2 months free
    features: ['basic', 'trader'],
    billingPeriod: 'monthly' as const,
  },
  traderYearly: {
    id: 'trader_yearly',
    name: 'trader',
    price: 19990,
    yearlyPrice: 19990,
    features: ['basic', 'trader'],
    billingPeriod: 'yearly' as const,
  },
  proTrader: {
    id: 'protrader',
    name: 'protrader',
    price: 19999,
    yearlyPrice: 199990, // 10 months price = 2 months free
    features: ['all'],
    billingPeriod: 'monthly' as const,
  },
  proTraderYearly: {
    id: 'protrader_yearly',
    name: 'protrader',
    price: 199990,
    yearlyPrice: 199990,
    features: ['all'],
    billingPeriod: 'yearly' as const,
  },
};

export type PlanId = keyof typeof subscriptionPlans;
