const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_API_URL',
  'JWT_SECRET'
];

// Check if .env file exists
const envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.warn('Warning: .env file not found. Creating one with default development values...');
  
  // Generate a secure random JWT secret
  const jwtSecret = crypto.randomBytes(64).toString('hex');
  
  // Create default .env file
  const defaultEnvContent = `# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Security
JWT_SECRET=${jwtSecret}

# Feature Flags
NEXT_PUBLIC_ENABLE_PENALTIES=true
NEXT_PUBLIC_ENABLE_BONUSES=true

# Development Settings
NEXT_PUBLIC_DEBUG_MODE=true
`;
  
  fs.writeFileSync(envPath, defaultEnvContent);
  console.log('Created default .env file for development with secure JWT secret');
  process.exit(0);
}

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = envContent.split('\n')
  .filter(line => line && !line.startsWith('#'))
  .map(line => line.split('=')[0]);

// Check for missing required variables
const missingVars = requiredEnvVars.filter(varName => !envVars.includes(varName));

if (missingVars.length > 0) {
  console.warn('Warning: Missing required environment variables. Adding them with secure defaults...');
  
  let updatedContent = envContent;
  
  if (missingVars.includes('JWT_SECRET')) {
    const jwtSecret = crypto.randomBytes(64).toString('hex');
    updatedContent += `\n# Security\nJWT_SECRET=${jwtSecret}\n`;
  }
  
  fs.writeFileSync(envPath, updatedContent);
  console.log('Updated .env file with missing required variables');
}

console.log('Environment variables validated successfully'); 