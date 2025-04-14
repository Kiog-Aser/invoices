// filepath: /Users/milhoornaert/CreatiFun/scripts/test-stripe-webhook.js
const crypto = require('crypto');
const http = require('http');
require('dotenv').config();

// Sample Stripe checkout.session.completed event
const payload = JSON.stringify({
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_webhook',
      customer: 'cus_test123',
      customer_details: {
        email: 'test@example.com'
      },
      client_reference_id: '123456',
      metadata: {
        priceId: 'price_1RAF0yQF2yOHJOkbGp7h8r08' // Your unlimited access price ID
      }
    }
  }
});

// Create signature using your webhook secret
const timestamp = Math.floor(Date.now() / 1000);
const secret = process.env.STRIPE_WEBHOOK_SECRET;

if (!secret) {
  console.error('❌ Error: STRIPE_WEBHOOK_SECRET is not defined in your environment');
  process.exit(1);
}

// Generate Stripe signature
const signedPayload = `${timestamp}.${payload}`;
const signature = crypto.createHmac('sha256', secret)
  .update(signedPayload)
  .digest('hex');

const stripeSignature = `t=${timestamp},v1=${signature}`;

console.log('🔑 Generated Stripe signature for testing');

// Test options for local environment
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/webhook/stripe',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    'Stripe-Signature': stripeSignature
  }
};

console.log('📤 Sending test webhook to local server...');

// Send the request
const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('🔄 Status Code:', res.statusCode);
    console.log('📥 Response Headers:', res.headers);
    console.log('📄 Response Body:', data);
    
    if (res.statusCode === 200) {
      console.log('✅ Webhook test successful! Your local endpoint is working.');
    } else {
      console.log('❌ Webhook test failed. See the response above for more details.');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error sending webhook:', error.message);
  console.log('📋 Troubleshooting tips:');
  console.log('1. Make sure your Next.js server is running on port 3000');
  console.log('2. Check that the STRIPE_WEBHOOK_SECRET in your .env.local matches the one in your Stripe dashboard');
  console.log('3. Ensure the bodyParser is disabled in your api route configuration');
});

req.write(payload);
req.end();
