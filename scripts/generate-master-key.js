#!/usr/bin/env node
/**
 * RSA-4096 Master Key Generator
 * 
 * This script generates a master RSA-4096 key pair for admin decryption:
 * - Public key → saved to client/.env as VITE_MASTER_PUBLIC_KEY (for encryption)
 * - Private key → saved to master-private-key.pem (KEEP SECRET!)
 * 
 * ⚠️ CRITICAL SECURITY:
 * - Private key should NEVER be uploaded to server or git
 * - Make encrypted backups on USB drives and secure storage
 * - Without private key, admin cannot decrypt notes!
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔐 Generating RSA-4096 Master Key Pair...\n');

// Generate RSA-4096 key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Convert public key to base64 (single line for .env)
const publicKeyBase64 = publicKey
  .replace(/-----BEGIN PUBLIC KEY-----/, '')
  .replace(/-----END PUBLIC KEY-----/, '')
  .replace(/\n/g, '');

// Paths
const rootDir = path.join(__dirname, '..');
const clientEnvPath = path.join(rootDir, 'client', '.env');
const privateKeyPath = path.join(rootDir, 'master-private-key.pem');

// Save private key to file
fs.writeFileSync(privateKeyPath, privateKey, 'utf8');
console.log('✅ Private key saved to:', privateKeyPath);
console.log('   🔒 Keep this file SECRET and NEVER upload to server/git!\n');

// Update or create client/.env
let envContent = '';
if (fs.existsSync(clientEnvPath)) {
  envContent = fs.readFileSync(clientEnvPath, 'utf8');
}

// Remove existing VITE_MASTER_PUBLIC_KEY if present
envContent = envContent.replace(/^VITE_MASTER_PUBLIC_KEY=.*$/m, '');

// Add new public key
if (!envContent.endsWith('\n') && envContent.length > 0) {
  envContent += '\n';
}
envContent += `# RSA-4096 Public Key for admin decryption (generated: ${new Date().toISOString()})\n`;
envContent += `VITE_MASTER_PUBLIC_KEY="${publicKeyBase64}"\n`;

fs.writeFileSync(clientEnvPath, envContent, 'utf8');
console.log('✅ Public key saved to:', clientEnvPath);
console.log('   ✅ This can be safely committed to git\n');

// Update .gitignore
const gitignorePath = path.join(rootDir, '.gitignore');
let gitignoreContent = '';
if (fs.existsSync(gitignorePath)) {
  gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
}

if (!gitignoreContent.includes('master-private-key.pem')) {
  gitignoreContent += '\n# Master private key - NEVER commit!\nmaster-private-key.pem\n';
  fs.writeFileSync(gitignorePath, gitignoreContent, 'utf8');
  console.log('✅ Updated .gitignore to exclude master-private-key.pem\n');
}

// Success message
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Master keys generated successfully!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📁 Files created:');
console.log(`   1. ${privateKeyPath}`);
console.log(`   2. ${clientEnvPath} (updated)\n`);

console.log('⚠️  IMPORTANT - READ CAREFULLY:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔐 PRIVATE KEY (master-private-key.pem):');
console.log('   ✅ Keep on your personal computer ONLY');
console.log('   ✅ Make encrypted backups (USB drives, secure storage)');
console.log('   ❌ NEVER upload to server');
console.log('   ❌ NEVER commit to git');
console.log('   ❌ NEVER share with anyone');
console.log('   ⚠️  Without this file, you CANNOT decrypt notes as admin!\n');

console.log('🔓 PUBLIC KEY (client/.env):');
console.log('   ✅ Safe to commit to git');
console.log('   ✅ Safe to deploy to server');
console.log('   ✅ Used for encrypting noteKeys (cannot decrypt)\n');

console.log('📋 Next steps:');
console.log('   1. Make backup copies of master-private-key.pem');
console.log('   2. Deploy updated client/.env to production');
console.log('   3. Test encryption/decryption flow');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

