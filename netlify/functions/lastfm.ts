const LASTFM_API = 'https://ws.audioscrobbler.com/2.0/';

interface NetlifyEvent {
  httpMethod: string;
  queryStringParameters: Record<string, string | undefined> | null;
}

interface NetlifyResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

/**
 * Proxies Last.fm API requests so the SPA never embeds LASTFM_API_KEY.
 * Query params: method, artist, album (optional), and any other Last.fm params.
 */
export async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed' });
  }

  const apiKey = process.env['LASTFM_API_KEY'];
  if (!apiKey) {
    return json(500, { error: 'LASTFM_API_KEY is not configured' });
  }

  const incoming = new URLSearchParams(
    Object.entries(event.queryStringParameters ?? {}).filter(
      (entry): entry is [string, string] => entry[1] != null,
    ),
  );
  const method = incoming.get('method');
  if (!method) {
    return json(400, { error: 'Missing method query parameter' });
  }

  const params = new URLSearchParams(incoming);
  params.set('api_key', apiKey);
  params.set('format', 'json');

  try {
    const response = await fetch(`${LASTFM_API}?${params.toString()}`);
    const body = await response.text();
    return {
      statusCode: response.status,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json',
      },
      body,
    };
  } catch (err) {
    console.error('[lastfm proxy]', err);
    return json(502, { error: 'Failed to reach Last.fm' });
  }
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };
}

function json(statusCode: number, payload: unknown): NetlifyResponse {
  return {
    statusCode,
    headers: {
      ...corsHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  };
}
