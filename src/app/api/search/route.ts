import { NextRequest, NextResponse } from 'next/server';

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken() {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 30_000) return cachedToken.token;

  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) throw new Error('Spotify credentials are not configured');

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });

  if (!response.ok) throw new Error('Spotify authentication failed');
  const data = await response.json();
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token as string;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim();
  if (!query) return NextResponse.json({ tracks: [] });

  try {
    const token = await getToken();
    const url = new URL('https://api.spotify.com/v1/search');
    url.searchParams.set('q', query);
    url.searchParams.set('type', 'track');
    url.searchParams.set('limit', '12');

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!response.ok) {
      const details = await response.text();
      return NextResponse.json({ error: 'Spotify search failed', details }, { status: response.status });
    }

    const data = await response.json();
    const tracks = (data.tracks?.items ?? []).map((track: any) => ({
      id: track.id,
      name: track.name,
      artists: track.artists?.map((artist: any) => artist.name).join(', ') ?? 'Unknown artist',
      album: track.album?.name ?? '',
      image: track.album?.images?.[0]?.url ?? '',
      spotifyUrl: track.external_urls?.spotify ?? `https://open.spotify.com/track/${track.id}`,
      durationMs: track.duration_ms ?? 0,
    }));

    return NextResponse.json({ tracks });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 503 },
    );
  }
}
