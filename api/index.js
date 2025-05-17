// Serverless function for Vercel API routes
const path = require('path');
const fs = require('fs');

module.exports = (req, res) => {
  // Serve index.html for all routes
  try {
    const filePath = path.join(__dirname, '../index.html');
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(htmlContent);
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
};