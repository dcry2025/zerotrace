#!/usr/bin/env node
/**
 * Database Export Script for Admin
 * 
 * Exports all notes from PostgreSQL database to JSON format
 * for use with the offline decryption tool (tools/decrypt-notes.html)
 * 
 * Usage:
 *   node scripts/export-db.js > notes-export.json
 *   node scripts/export-db.js --output notes-export.json
 * 
 * Environment Variables:
 *   DB_HOST - Database host (default: localhost)
 *   DB_PORT - Database port (default: 5432)
 *   DB_NAME - Database name (default: privnotecash)
 *   DB_USER - Database user (default: postgres)
 *   DB_PASSWORD - Database password (required)
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const outputFileIndex = args.indexOf('--output');
const outputFile = outputFileIndex !== -1 ? args[outputFileIndex + 1] : null;

// Database configuration from environment
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'privnotecash',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
};

// Validate configuration
if (!dbConfig.password) {
  console.error('❌ Error: DB_PASSWORD environment variable is required');
  console.error('\nUsage:');
  console.error('  DB_PASSWORD=yourpassword node scripts/export-db.js > notes-export.json');
  console.error('  DB_PASSWORD=yourpassword node scripts/export-db.js --output notes-export.json');
  process.exit(1);
}

async function exportDatabase() {
  const client = new Client(dbConfig);

  try {
    // Log to stderr (so it doesn't go to stdout/file)
    console.error('🔄 Connecting to database...');
    console.error(`   Host: ${dbConfig.host}:${dbConfig.port}`);
    console.error(`   Database: ${dbConfig.database}`);
    console.error(`   User: ${dbConfig.user}`);
    
    await client.connect();
    console.error('✅ Connected successfully\n');

    // Query all notes with encrypted content and metadata hashes
    console.error('📥 Fetching notes from database...');
    const query = `
      SELECT 
        unique_link,
        content,
        metadata_hash,
        read_at,
        password_hash,
        expires_at,
        created_at
      FROM notes
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `;

    const result = await client.query(query);
    console.error(`✅ Found ${result.rows.length} notes\n`);

    // Format data for export
    const exportData = {
      exportedAt: new Date().toISOString(),
      totalNotes: result.rows.length,
      database: {
        host: dbConfig.host,
        name: dbConfig.database,
      },
      notes: result.rows.map(row => ({
        uniqueLink: row.unique_link,
        encryptedContent: row.content,
        metadataHash: row.metadata_hash,
        isRead: row.read_at !== null,
        hasPassword: row.password_hash !== null,
        createdAt: row.created_at?.toISOString(),
        expiresAt: row.expires_at?.toISOString(),
      }))
    };

    // Output JSON
    const jsonOutput = JSON.stringify(exportData, null, 2);

    if (outputFile) {
      // Write to file
      const outputPath = path.resolve(outputFile);
      fs.writeFileSync(outputPath, jsonOutput, 'utf8');
      console.error(`✅ Export saved to: ${outputPath}`);
    } else {
      // Write to stdout
      console.log(jsonOutput);
    }

    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('✅ Export completed successfully');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.error('📊 Export Summary:');
    console.error(`   Total notes: ${exportData.totalNotes}`);
    console.error(`   Exported at: ${exportData.exportedAt}`);
    console.error(`   Database: ${exportData.database.name} @ ${exportData.database.host}\n`);
    
    if (outputFile) {
      console.error('📋 Next Steps:');
      console.error('   1. Open tools/decrypt-notes.html in your browser (file:// protocol)');
      console.error('   2. Load your master-private-key.pem file');
      console.error(`   3. Load the exported file: ${outputFile}`);
      console.error('   4. Click "Decrypt All Notes" to view all notes\n');
    } else {
      console.error('📋 Next Steps:');
      console.error('   1. Save the JSON output to a file');
      console.error('   2. Open tools/decrypt-notes.html in your browser (file:// protocol)');
      console.error('   3. Load your master-private-key.pem file');
      console.error('   4. Load the JSON file');
      console.error('   5. Click "Decrypt All Notes" to view all notes\n');
    }

    console.error('⚠️  SECURITY WARNING:');
    console.error('   - This export contains encrypted notes and encrypted keys');
    console.error('   - Keep this file secure (it can be decrypted with your private key)');
    console.error('   - Delete after use if no longer needed\n');

  } catch (error) {
    console.error('\n❌ Export failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Connection refused. Check:');
      console.error('   - Database is running');
      console.error('   - Host and port are correct');
      console.error('   - Firewall allows connections');
    } else if (error.code === '28P01') {
      console.error('\n💡 Authentication failed. Check:');
      console.error('   - DB_PASSWORD is correct');
      console.error('   - DB_USER has proper permissions');
    } else if (error.code === '3D000') {
      console.error('\n💡 Database does not exist. Check:');
      console.error('   - DB_NAME is correct');
      console.error('   - Database has been created');
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run export
exportDatabase();

