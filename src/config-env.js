const writeFile = require('file-system').writeFile;
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;
const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

const targetPath = `./src/environments/environment.prod.ts`;
const envConfigFile = `
export const environment = {
  production: true,
  CLIENT_ID: '${CLIENT_ID}',
  REDIRECT_URI: '${REDIRECT_URI}',
  LASTFM_API_KEY: '${LASTFM_API_KEY}',
  STORAGE_KEY: 'auth_token',
  BASE_SPOTIFY_URL: 'https://api.spotify.com/v1',
  BASE_LASTFM_URL: 'http://ws.audioscrobbler.com/2.0',
  AUTH_URL: 'https://accounts.spotify.com/authorize'
};
`;
writeFile(targetPath, envConfigFile, (err) => {
    if (err) {
      console.log(err);
    }
  });
