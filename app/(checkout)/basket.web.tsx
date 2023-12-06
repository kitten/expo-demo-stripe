import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';

import { fetchPaymentParams } from '../../lib/paymentIntent';

const enum BasketState {
  LOADING,
  READY,
  ERROR,
}

type BasketData =
  | { kind: BasketState.LOADING }
  | { kind: BasketState.READY, id: string, secret: string }
  | { kind: BasketState.ERROR, error?: any }

const stripePromise = loadStripe(process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function Basket({ id, secret }: { id: string, secret: string }) {
  const stripe = useStripe();
  const elements = useElements();

  const submitPayment = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    const { error } = await stripe.confirmPayment({
      clientSecret: secret,
      elements,
      confirmParams: {
        return_url: window.location.toString(),
      },
    });

    if (!error) {
      router.push(`/order/${id}`);
    }
  };

  return (
    <form onSubmit={submitPayment}>
      <h2>Basket</h2>
      <p>
        {'Visa: 4242 4242 4242 4242\n'}
        {'MasterCard: 5555 5555 5555 4444\n'}
        {'Generic Decline: 4000 0000 0000 0002\n'}
        {'3D Secure: 4000 0027 6000 3184'}
      </p>

      <PaymentElement />

      <button type="submit">Pay</button>
    </form>
  );
}

function BasketWrapper() {
  const [state, setState] = useState<BasketData>({ kind: BasketState.LOADING });

  useEffect(() => {
    (async () => {
      let paymentIntentSecret: string, paymentIntentId: string;

      try {
        ({ paymentIntentSecret, paymentIntentId } = await fetchPaymentParams());
      } catch (error) {
        console.error(error);
        return setState({ kind: BasketState.ERROR, error });
      }
      
      setState({
        kind: BasketState.READY,
        id: paymentIntentId,
        secret: paymentIntentSecret,
      });
    })();
  }, []);

  switch (state.kind) {
    case BasketState.LOADING:
      return <h3>Loading...</h3>;

    case BasketState.ERROR:
      return <h3>{state.error ? `Error: ${state.error}` : 'Error'}</h3>;

    case BasketState.READY:
      return (
        <Elements stripe={stripePromise} options={{ clientSecret: state.id }}>
          <Basket id={state.id} secret={state.secret} />
        </Elements>
      );
  }
}

export default BasketWrapper;
