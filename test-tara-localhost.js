const fetch = require('node-fetch');

async function test() {
  const payload = {
    apiKey: "FMRZPNkpHykIjtuYbZcevvox",
    businessId: "AU5F57fcg2",
    productId: "test-localhost",
    productName: "Localhost Test",
    productPrice: 100,
    productDescription: "Testing if localhost URL is accepted",
    productPictureUrl: "http://localhost:3000/images/test.jpg", // Localhost URL
    returnUrl: "http://localhost:3000/return",
    webHookUrl: "http://localhost:3000/webhook"
  };

  const response = await fetch('https://www.dklo.co/api/tara/paymentlinks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  console.log("Response:", JSON.stringify(data));
}

test();
