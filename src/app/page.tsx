'use client';

import { FormEvent, useState } from 'react';
import { ExternalLink, Headphones, Music2, Play, Search, Sparkles } from 'lucide-react';

type Track = {
  id: string;
  name: string;
  artists: string;
  album: string;
  image: string;
  spotifyUrl: string;
  durationMs: number;
};

function formatDuration(ms: number) {
  const total = Math.floor(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selected, setSelected] = useState<Track | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function searchMusic(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Search failed');
      setTracks(data.tracks ?? []);
      if ((data.tracks ?? []).length > 0) setSelected(data.tracks[0]);
    } catch (err) {
      setTracks([]);
      setSelected(null);
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <div className="orb orbOne" />
      <div className="orb orbTwo" />
      <nav className="nav shell">
        <div className="brand"><div className="brandMark"><Music2 size={20} /></div><span>Music Listener</span></div>
        <div className="spotifyBadge">Powered by Spotify</div>
      </nav>

      <section className="hero shell">
        <div className="eyebrow"><Sparkles size={15} /> Your music, one search away</div>
        <h1>Find the song.<br /><span>Feel the moment.</span></h1>
        <p>Search Spotify’s music catalog and play tracks without leaving the page.</p>

        <form className="searchBox" onSubmit={searchMusic}>
          <Search size={21} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a song, artist or album..." aria-label="Search Spotify" />
          <button disabled={loading}>{loading ? 'Searching…' : 'Search'}</button>
        </form>

        {error && <div className="notice"><Headphones size={18} /> {error === 'Spotify credentials are not configured' ? 'Spotify is ready to connect. Add the Client ID and Client Secret to enable live search.' : error}</div>}
      </section>

      <section className="content shell">
        {tracks.length === 0 && !loading ? (
          <div className="emptyState">
            <div className="vinyl"><Music2 size={38} /></div>
            <h2>What do you want to hear?</h2>
            <p>Try searching for Burna Boy, Adele, Drake, Azawi, or any track you love.</p>
          </div>
        ) : (
          <div className="grid">
            <div>
              <div className="sectionHeading"><h2>Search results</h2><span>{tracks.length} tracks</span></div>
              <div className="trackList">
                {tracks.map((track, index) => (
                  <button key={track.id} className={`trackRow ${selected?.id === track.id ? 'active' : ''}`} onClick={() => setSelected(track)}>
                    <span className="index">{selected?.id === track.id ? <Play size={15} fill="currentColor" /> : index + 1}</span>
                    <img src={track.image} alt="" />
                    <span className="trackText"><strong>{track.name}</strong><small>{track.artists}</small></span>
                    <span className="album">{track.album}</span>
                    <span className="duration">{formatDuration(track.durationMs)}</span>
                  </button>
                ))}
              </div>
            </div>

            <aside className="playerCard">
              {selected && (
                <>
                  <div className="nowPlayingLabel">NOW PLAYING</div>
                  <img className="cover" src={selected.image} alt={`${selected.name} cover`} />
                  <h3>{selected.name}</h3>
                  <p>{selected.artists}</p>
                  <iframe
                    title={`Spotify player for ${selected.name}`}
                    src={`https://open.spotify.com/embed/track/${selected.id}?utm_source=generator&theme=0`}
                    width="100%"
                    height="152"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                  <a href={selected.spotifyUrl} target="_blank" rel="noreferrer">Open in Spotify <ExternalLink size={14} /></a>
                </>
              )}
            </aside>
          </div>
        )}
      </section>

      <footer className="shell">Spotify content remains hosted and streamed by Spotify. Music Listener does not download or redistribute audio.</footer>
    </main>
  );
}
