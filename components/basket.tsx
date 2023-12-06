import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { PaymentSheetError, StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';

import { fetchPaymentParams } from '../lib/paymentIntent';

const enum BasketState {
  LOADING,
  READY,
  ERROR,
}

type BasketData =
  | { kind: BasketState.LOADING }
  | { kind: BasketState.READY, id: string }
  | { kind: BasketState.ERROR, error?: any }

function Basket() {
  const [state, setState] = useState<BasketData>({ kind: BasketState.LOADING });
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  useEffect(() => {
    (async () => {
      let paymentIntentSecret: string, paymentIntentId: string;

      try {
        ({ paymentIntentSecret, paymentIntentId } = await fetchPaymentParams());
      } catch (error) {
        console.error(error);
        return setState({ kind: BasketState.ERROR, error });
      }

      const { error } = await initPaymentSheet({
        merchantDisplayName: 'Payment, Inc. Shop',
        paymentIntentClientSecret: paymentIntentSecret,
        allowsDelayedPaymentMethods: false,
        defaultBillingDetails: {
          name: 'Jane Doe',
        }
      });
      
      setState(
        error
          ? { kind: BasketState.ERROR, error }
          : { kind: BasketState.READY, id: paymentIntentId }
      );
    })();
  }, []);

  const openPaymentSheet = async () => {
    if (state.kind !== BasketState.READY) return;

    const { error } = await presentPaymentSheet();
    if (!error) {
      router.push(`/order/${state.id}`);
    } else if (error?.code === PaymentSheetError.Canceled) {
      setState({ ...state });
    } else {
      setState({ kind: BasketState.ERROR, error });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Basket</Text>
      <Text style={styles.text}>
        {'Visa: 4242 4242 4242 4242\n'}
        {'MasterCard: 5555 5555 5555 4444\n'}
        {'Generic Decline: 4000 0000 0000 0002\n'}
        {'3D Secure: 4000 0027 6000 3184'}
      </Text>
      <Button
        disabled={state.kind !== BasketState.READY}
        title="Checkout"
        onPress={openPaymentSheet}
      />
      <StatusBar style="auto" />
    </View>
  );
}

function BasketWrapper() {
  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
      urlScheme="demo-stripe"
    >
      <Basket />
    </StripeProvider>
  );
}

export default BasketWrapper;

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
  },
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#fff',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
});
