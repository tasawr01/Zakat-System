import { NextResponse } from 'next/server';

// Mock Zakat Rules (In a real app, fetch from DB)
const ZAKAT_RULES = {
  gold: { threshold: 87.48, pricePerGram: 22000 }, // grams, PKR
  silver: { threshold: 612.36, pricePerGram: 280 }, // grams, PKR
  cash: { threshold: 0, rate: 0.025 },
  cattle: { threshold: 5, rate: 0 }, // Simplified
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { assets } = body;

    let totalZakat = 0;
    let details = [];

    // Gold
    if (assets.gold > ZAKAT_RULES.gold.threshold) {
      const goldValue = assets.gold * ZAKAT_RULES.gold.pricePerGram;
      const zakat = goldValue * 0.025;
      totalZakat += zakat;
      details.push({ type: 'Gold', amount: assets.gold, value: goldValue, zakat });
    }

    // Silver
    if (assets.silver > ZAKAT_RULES.silver.threshold) {
      const silverValue = assets.silver * ZAKAT_RULES.silver.pricePerGram;
      const zakat = silverValue * 0.025;
      totalZakat += zakat;
      details.push({ type: 'Silver', amount: assets.silver, value: silverValue, zakat });
    }

    // Cash
    if (assets.cash > 0) {
      const zakat = assets.cash * 0.025;
      totalZakat += zakat;
      details.push({ type: 'Cash', amount: assets.cash, value: assets.cash, zakat });
    }

    return NextResponse.json({
      totalZakat,
      currency: 'PKR',
      details,
      message: 'Zakat calculated successfully based on current Nisab rates.'
    });

  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
