#!/usr/bin/env node
/**
 * Local Last.fm proxy for `npm start` — same contract as netlify/functions/lastfm.ts.
 * Injects LASTFM_API_KEY from `.env` so the browser never sees the key.
 *
 * Do not commit real API keys. Scrub `.env` / restore environment files before commits.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const LASTFM_API = 'https://ws.audioscrobbler.com/2.0/';
const DEFAULT_PORT = 4301;

export function loadDotEnv() {
  const path = resolve(process.cwd(), '.env');
  if (!existsSync(path)) {
    return;
  }
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const eq = trimmed.indexOf('=');
    if (eq === -1) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    ...corsHeaders(),
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify(payload));
}

/**
 * @param {number} [port]
 * @returns {Promise<import('node:http').Server>}
 */
export function startLastfmProxy(port = Number(process.env.LASTFM_PROXY_PORT || DEFAULT_PORT)) {
  loadDotEnv();

  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://127.0.0.1:${port}`);

    if (req.method === 'OPTIONS') {
      res.writeHead(204, corsHeaders());
      res.end();
      return;
    }

    if (url.pathname !== '/api/lastfm') {
      sendJson(res, 404, { error: 'Not found' });
      return;
    }

    if (req.method !== 'GET') {
      sendJson(res, 405, { error: 'Method not allowed' });
      return;
    }

    const apiKey = process.env.LASTFM_API_KEY;
    if (!apiKey) {
      sendJson(res, 500, { error: 'LASTFM_API_KEY is not configured' });
      return;
    }

    const method = url.searchParams.get('method');
    if (!method) {
      sendJson(res, 400, { error: 'Missing method query parameter' });
      return;
    }

    const params = new URLSearchParams(url.searchParams);
    params.set('api_key', apiKey);
    params.set('format', 'json');

    try {
      const response = await fetch(`${LASTFM_API}?${params.toString()}`);
      const body = await response.text();
      res.writeHead(response.status, {
        ...corsHeaders(),
        'Content-Type': 'application/json',
      });
      res.end(body);
    } catch (err) {
      console.error('[lastfm-proxy]', err);
      sendJson(res, 502, { error: 'Failed to reach Last.fm' });
    }
  });

  return new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => {
      console.log(`[lastfm-proxy] http://127.0.0.1:${port}/api/lastfm`);
      resolveListen(server);
    });
  });
}

const isDirectRun = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  startLastfmProxy().catch((err) => {
    console.error('[lastfm-proxy] failed to start', err);
    process.exit(1);
  });
}
