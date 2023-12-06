import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(_request: Request) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1_234,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return Response.json({
    publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    paymentIntentId: paymentIntent.id,
    paymentIntentSecret: paymentIntent.client_secret,
  });
};
