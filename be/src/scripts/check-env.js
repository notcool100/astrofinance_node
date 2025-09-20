/**
 * Script to check critical environment variables
 * Run with: node scripts/check-env.js
 */

// Load environment variables
require('dotenv').config();

console.log('Environment Check Results:');
console.log('-------------------------');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);
console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? 'Set (value hidden)' : 'NOT SET - AUTHENTICATION WILL FAIL'}`);
console.log(`JWT_EXPIRES_IN: ${process.env.JWT_EXPIRES_IN || 'Not set (will use default)'}`);
console.log(`PORT: ${process.env.PORT || 'Not set (will use default 5000)'}`);
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'Set (value hidden)' : 'NOT SET - DATABASE CONNECTION WILL FAIL'}`);
console.log('-------------------------');

// Check for critical missing variables
const criticalVars = ['JWT_SECRET', 'DATABASE_URL'];
const missingVars = criticalVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('\nWARNING: The following critical environment variables are missing:');
  missingVars.forEach(varName => console.error(`- ${varName}`));
  console.error('\nThe application may not function correctly without these variables.');
  process.exit(1);
} else {
  console.log('\nAll critical environment variables are set.');
  process.exit(0);
}