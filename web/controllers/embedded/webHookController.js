// /controllers/webhookController.js
import crypto from 'crypto';

const verifyWebhook = (req, res, next) => {
  const hmac = req.headers['x-shopify-hmac-sha256'];
  const body = JSON.stringify(req.body);
  const secret = process.env.SHOPIFY_API_SECRET;

  const hash = crypto.createHmac('sha256', secret).update(body, 'utf8').digest('base64');

  if (hash === hmac) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
};

export const handleProductCreate = (req, res) => {
  // Verify the request
  console.log("I am called ################################");
  verifyWebhook(req, res, () => {
    const productData = req.body;
    console.log('New product created:', productData);
    // Add your logic to handle the product creation event
    res.status(200).send('Webhook received');
  });
};

export const handleProductUpdate = (req, res) => {
  // Verify the request
  console.log("I am called ################################");

  verifyWebhook(req, res, () => {
    const productData = req.body;
    console.log('Product updated:', productData);
    // Add your logic to handle the product update event
    res.status(200).send('Webhook received');
  });
};
