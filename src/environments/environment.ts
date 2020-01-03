// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  CLIENT_ID: '', // here should be your client id from registered application
  REDIRECT_URI: 'http://localhost:4300/',
  LASTFM_API_KEY: '',
  STORAGE_KEY: 'auth_token',
  BASE_SPOTIFY_URL: 'https://api.spotify.com/v1',
  BASE_LASTFM_URL: 'https://ws.audioscrobbler.com/2.0',
  AUTH_URL: 'https://accounts.spotify.com/authorize'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
