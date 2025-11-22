
// This script will read the API keys from a loan .env file declared at the root of the project
const fs = require('fs');
require('dotenv').config(); // loads .env file

const environmentPath = './src/environments/environment.ts';

const content = `
export const environment = {
  production: false,
  serverUrl: 'http://localhost:3000/api',
  GOOGLE_MAPS_KEY: '${process.env.GOOGLE_MAPS_KEY}'
};
`;
// write to the file
fs.writeFileSync(environmentPath, content);
console.log('environment.ts updated from .env');
