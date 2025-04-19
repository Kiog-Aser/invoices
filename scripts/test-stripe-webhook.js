// scripts/test-stripe-webhook.js
// Usage: node scripts/test-stripe-webhook.js
const fetch = require('node-fetch');

const webhookUrl = 'https://yourdomain.com/api/stripe/webhook'; // Change to your actual webhook endpoint

const event = {
  id: 'evt_test_webhook',
  object: 'event',
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_123',
      customer: 'cus_test_123',
      subscription: 'sub_test_123',
      // ...add any other fields your handler expects
    }
  }
};

fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Stripe-Signature': 'test_signature' // If you check signature, you may need to disable it for local/dev
  },
  body: JSON.stringify(event)
})
  .then(res => res.text())
  .then(console.log)
  .catch(console.error);
