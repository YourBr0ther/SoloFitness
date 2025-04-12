const fs = require('fs');
const path = require('path');

// Required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_API_URL',
];

// Check if .env file exists
const envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.warn('Warning: .env file not found. Creating one with default development values...');
  
  // Create default .env file
  const defaultEnvContent = `# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Feature Flags
NEXT_PUBLIC_ENABLE_PENALTIES=true
NEXT_PUBLIC_ENABLE_BONUSES=true

# Development Settings
NEXT_PUBLIC_DEBUG_MODE=true
`;
  
  fs.writeFileSync(envPath, defaultEnvContent);
  console.log('Created default .env file for development');
  process.exit(0);
}

// Only validate required variables in production
if (process.env.NODE_ENV === 'production') {
  // Read .env file
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = envContent.split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split('=')[0]);

  // Check for missing required variables
  const missingVars = requiredEnvVars.filter(varName => !envVars.includes(varName));

  if (missingVars.length > 0) {
    console.error('Error: Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`  - ${varName}`);
    });
    process.exit(1);
  }
}

console.log('Environment variables validated successfully'); 