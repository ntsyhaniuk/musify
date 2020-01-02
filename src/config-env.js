const writeFile = require('file-system').writeFile;
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;

const targetPath = `./src/environments/environment.prod.ts`;
const envConfigFile = `
export const environment = {
  production: true,
  CLIENT_ID: '${CLIENT_ID}',
  REDIRECT_URI: '${REDIRECT_URI}',
  BASE_URL: 'https://api.spotify.com/v1',
  STORAGE_KEY: 'auth_token',
  AUTH_URL: 'https://accounts.spotify.com/authorize'
};
`;
writeFile(targetPath, envConfigFile, (err) => {
    if (err) {
      console.log(err);
    }
  });
