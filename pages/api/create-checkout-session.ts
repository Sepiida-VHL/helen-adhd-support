import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

// Server-side secret; do NOT expose to browser
const stripeSecret = process.env.STRIPE_SECRET_KEY as string
const stripe = new Stripe(stripeSecret || '', { apiVersion: '2024-06-20' })

/*
  POST /api/create-checkout-session
  Body:
  {
    userId: string;               // your authenticated user's id (e.g., Supabase auth uid)
    plan: 'free'|'pro'|'team'|string; // plan identifier
    priceId?: string;             // optional: explicit Stripe Price ID; if omitted, map from plan below
    successUrl?: string;          // optional: success redirect
    cancelUrl?: string;           // optional: cancel redirect
  }
*/
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe is not configured on the server' })
  }

  try {
    const { userId, plan, priceId, successUrl, cancelUrl } = req.body || {}

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' })
    }

    // Map your plan -> Stripe Price ID here if priceId isn't provided
    const PRICE_MAP: Record<string, string | undefined> = {
      // e.g., pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
    }

    const resolvedPriceId = priceId || PRICE_MAP[plan]
    if (!resolvedPriceId) {
      return res.status(400).json({ error: 'Unknown or unmapped plan; provide priceId or configure PRICE_MAP' })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      client_reference_id: userId,
      metadata: { user_id: userId, plan },
      line_items: [
        {
          price: resolvedPriceId,
          quantity: 1,
        },
      ],
      success_url:
        successUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/billing/cancel`,
    })

    return res.status(200).json({ id: session.id, url: session.url })
  } catch (err: any) {
    console.error('create-checkout-session error', err)
    return res.status(500).json({ error: 'Failed to create checkout session' })
  }
}

