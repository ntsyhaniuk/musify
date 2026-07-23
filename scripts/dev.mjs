#!/usr/bin/env node
/**
 * Starts the local Last.fm proxy, then `ng serve`.
 * Used by `npm start` so `/api/lastfm` works without Netlify.
 */
import { spawn } from 'node:child_process';
import { startLastfmProxy } from './lastfm-dev-proxy.mjs';

const proxy = await startLastfmProxy();

const ng = spawn(
  'npx',
  ['ng', 'serve', '--host=127.0.0.1', '--port=4300'],
  { stdio: 'inherit', shell: process.platform === 'win32' },
);

function shutdown(code = 0) {
  proxy.close();
  if (!ng.killed) {
    ng.kill('SIGTERM');
  }
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

ng.on('exit', (code, signal) => {
  proxy.close();
  if (signal) {
    process.exit(0);
  }
  process.exit(code ?? 0);
});
