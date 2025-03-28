const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { sendExpiringProductsEmail } = require('./email');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '..')));

// Allow CORS for WebSocket (optional, for deployment)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// In-memory store for products
let products = [];

// Function to check if a product is expiring within 5 days
function isExpiringSoon(expiryDate) {
  const currentDate = new Date('2025-03-27T00:00:00'); // Current date as per system
  let expDate;
  try {
    expDate = new Date(expiryDate + 'T00:00:00');
    if (isNaN(expDate.getTime())) {
      console.error(`Invalid expiry date: ${expiryDate}`);
      return false;
    }
  } catch (error) {
    console.error(`Error parsing expiry date ${expiryDate}:`, error);
    return false;
  }
  const diffTime = expDate - currentDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 5 && diffDays >= 0;
}

// WebSocket connection
wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send current products to the newly connected client
  ws.send(JSON.stringify({ type: 'initial', products }));

  ws.on('message', (message) => {
    console.log('Received message:', message.toString());
    try {
      const productData = JSON.parse(message.toString());

      // Check if the product already exists
      const existingProductIndex = products.findIndex(p => p.id === productData.id);
      if (existingProductIndex !== -1) {
        // Product exists, remove it (sold out)
        products.splice(existingProductIndex, 1);
        console.log(`Product with ID ${productData.id} removed (sold out)`);
      } else {
        // Product does not exist, add it
        products.push(productData);
        console.log(`Product with ID ${productData.id} added`);
      }

      // Broadcast the updated products list to all clients
      console.log('Broadcasting updated products:', products);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'update', products }));
          console.log('Message sent to client');
        }
      });

      // Check for expiring products and send email
      const expiringProducts = products.filter(product => isExpiringSoon(product.expiryDate));
      console.log('Expiring products:', expiringProducts);
      sendExpiringProductsEmail(expiringProducts);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Start the server on the environment's port
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});