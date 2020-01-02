import { config } from 'dotenv';

config({ path: '../../.env' });

export const environment = {
  production: true,
  CLIENT_ID: process.env.CLIENT_ID,
  REDIRECT_URI: 'https://musify-app.netlify.com',
  BASE_URL: 'https://api.spotify.com/v1',
  STORAGE_KEY: 'auth_token',
  AUTH_URL: 'https://accounts.spotify.com/authorize'
};
