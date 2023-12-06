export async function fetchPaymentParams() {
  const response = await fetch('/api/payment-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status !== 200) {
    throw new Error(`Failed preparing basket (${response.statusText})`);
  }

  const { paymentIntentId, paymentIntentSecret } = await response.json();
  if (
    typeof paymentIntentId !== 'string' ||
    typeof paymentIntentSecret !== 'string'
  ) {
    throw new Error(`Failed preparing basket (Response Shape)`);
  }

  return { paymentIntentId, paymentIntentSecret };
};
