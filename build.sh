#!/bin/bash

# Comprehensive build script for Vercel deployment
echo "Starting build process..."

# Create output directory and clean it if it exists
rm -rf dist
mkdir -p dist
mkdir -p dist/sounds

# Copy essential files to dist
echo "Copying files to dist..."
cp index.html dist/
cp styles.css dist/
cp script.js dist/
cp 404.html dist/
cp vercel.html dist/

# Copy sound files if they exist
if [ -d "sounds" ]; then
  echo "Copying sound files..."
  cp -r sounds/* dist/sounds/ 2>/dev/null || :
fi

# Create a simple index.js for server-side handling
echo "Creating server files..."
cat > dist/index.js << EOL
// Simple server-side handler for Vercel
module.exports = (req, res) => {
  // Set headers
  res.setHeader('Content-Type', 'text/html');
  
  // Always serve index.html
  const fs = require('fs');
  const path = require('path');
  
  const indexPath = path.join(__dirname, 'index.html');
  const content = fs.readFileSync(indexPath, 'utf8');
  
  res.status(200).send(content);
};
EOL

echo "Build complete! Files are ready in the dist directory."