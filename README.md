# Music Listener

A polished Next.js web app that searches Spotify's catalog and plays selected tracks through Spotify's official embed player.

## Features
- Search songs, artists and albums through Spotify Web API
- Responsive track results with cover art and metadata
- In-page Spotify playback embed
- Secure server-side Spotify Client Credentials flow
- No audio files are downloaded, proxied, or stored

## Setup
1. Create an app in the Spotify Developer Dashboard.
2. Copy `.env.example` to `.env.local`.
3. Add `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`.
4. Run `npm install` then `npm run dev`.

## Vercel
Add the same two environment variables in your Vercel project settings, then deploy.

Spotify content remains subject to Spotify's Developer Terms and Platform Rules.
