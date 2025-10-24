#!/usr/bin/env node

/**
 * Generate METRICS_API_KEY and add it to .env
 * 
 * Generates a secure random API key for /metrics endpoint
 * and automatically adds it to server/.env file
 * 
 * Usage:
 *   node scripts/generate-metrics-api-key.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function generateApiKey() {
  // Generate 32 bytes of random data and encode as base64url
  const key = crypto.randomBytes(32).toString('base64url');
  return key;
}

function addToEnvFile(apiKey) {
  const envPath = path.join(__dirname, '..', 'server', '.env');
  const envExamplePath = path.join(__dirname, '..', 'server', 'env.example');
  
  // Check if .env exists
  if (!fs.existsSync(envPath)) {
    console.log('\n⚠️  .env file not found, creating new one...');
    
    // Try to copy from env.example if it exists
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ Created .env from env.example');
    } else {
      // Create empty .env
      fs.writeFileSync(envPath, '');
      console.log('✅ Created empty .env file');
    }
  }
  
  // Read .env file
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check if METRICS_API_KEY already exists
  const metricsApiKeyRegex = /^METRICS_API_KEY=.*$/m;
  
  if (metricsApiKeyRegex.test(envContent)) {
    // Replace existing key
    envContent = envContent.replace(metricsApiKeyRegex, `METRICS_API_KEY=${apiKey}`);
    console.log('\n✅ Updated existing METRICS_API_KEY in .env');
  } else {
    // Add new key
    if (!envContent.endsWith('\n') && envContent.length > 0) {
      envContent += '\n';
    }
    envContent += `\n# Metrics API Key for /api/v1/metrics endpoint\nMETRICS_API_KEY=${apiKey}\n`;
    console.log('\n✅ Added METRICS_API_KEY to .env');
  }
  
  // Write back to .env
  fs.writeFileSync(envPath, envContent);
}

// Generate and add key
const apiKey = generateApiKey();
addToEnvFile(apiKey);

console.log('\n=================================================');
console.log('  METRICS_API_KEY Generated Successfully!');
console.log('=================================================\n');
console.log('Your API Key:');
console.log(`METRICS_API_KEY=${apiKey}`);
console.log('\n=================================================');
console.log('Usage:\n');
console.log('Option 1 (Header - more secure):');
console.log('  curl -H "X-API-Key: ' + apiKey + '" http://localhost:7000/api/v1/metrics\n');
console.log('Option 2 (Query param - convenient for browser):');
console.log('  http://localhost:7000/api/v1/metrics?key=' + apiKey);
console.log('\n⚠️  Warning: Query parameter is logged in server access logs.');
console.log('    Use header method for production or sensitive environments.');
console.log('=================================================\n');

