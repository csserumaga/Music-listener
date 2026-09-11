'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ExternalLink, Headphones, Music2, Play, Search, Sparkles } from 'lucide-react';

type Track = { id:string; name:string; artists:string; image:string; youtubeUrl:string };

const albums = [
  { title:'African Giant', artist:'Burna Boy', query:'Burna Boy African Giant album', className:'coverBurn' },
  { title:'30', artist:'Adele', query:'Adele 30 album', className:'coverAdele' },
  { title:'Views', artist:'Drake', query:'Drake Views album', className:'coverDrake' },
  { title:'African Music', artist:'Azawi', query:'Azawi African Music album', className:'coverAzawi' },
  { title:'Made in Lagos', artist:'Wizkid', query:'Wizkid Made in Lagos album', className:'coverWiz' },
  { title:'Timeless', artist:'Davido', query:'Davido Timeless album', className:'coverDavido' },
];

export default function Home(){
 const [query,setQuery]=useState(''); const [tracks,setTracks]=useState<Track[]>([]); const [selected,setSelected]=useState<Track|null>(null); const [loading,setLoading]=useState(false); const [error,setError]=useState(''); const [heading,setHeading]=useState('Popular right now');
 async function runSearch(term:string,label?:string){ if(!term.trim())return; setLoading(true);setError(''); if(label)setHeading(label); try{const r=await fetch(`/api/search?q=${encodeURIComponent(term.trim())}`);const d=await r.json();if(!r.ok)throw new Error(d.error||'Search failed');setTracks(d.tracks||[]);if((d.tracks||[]).length&&!selected)setSelected(d.tracks[0])}catch(err){setError(err instanceof Error?err.message:'Search failed')}finally{setLoading(false)}}
 useEffect(()=>{void runSearch('Afrobeats hits 2026','Popular right now')},[]);
 async function searchMusic(e:FormEvent){e.preventDefault();await runSearch(query,'Search results')}
 return <main><div className="orb orbOne"/><div className="orb orbTwo"/><nav className="nav shell"><div className="brand"><div className="brandMark"><Music2 size={20}/></div><span>Music Listener</span></div><div className="spotifyBadge">Music everywhere</div></nav>
 <section className="hero shell"><div className="eyebrow"><Sparkles size={15}/> Tap. Play. Discover.</div><h1>Your music.<br/><span>Ready when you are.</span></h1><p>Play popular songs instantly, browse albums from artists you love, or search for anything.</p><form className="searchBox" onSubmit={searchMusic}><Search size={21}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search songs, artists or albums..." aria-label="Search music"/><button disabled={loading}>{loading?'Searching…':'Search'}</button></form>{error&&<div className="notice"><Headphones size={18}/>{error}</div>}</section>
 <section className="shell albumSection"><div className="sectionHeading"><h2>Albums & artist picks</h2><span>Tap a card to explore</span></div><div className="albumGrid">{albums.map((a)=><button key={a.title} className="albumCard" onClick={()=>void runSearch(a.query,`${a.artist} — ${a.title}`)}><div className={`albumArt ${a.className}`}><span>{a.title}</span></div><strong>{a.title}</strong><small>{a.artist}</small></button>)}</div></section>
 <section className="content shell"><div className="grid"><div><div className="sectionHeading"><h2>{heading}</h2><span>{loading?'Loading…':`${tracks.length} songs`}</span></div>{tracks.length===0&&loading?<div className="loadingPanel">Finding music for you…</div>:<div className="trackList">{tracks.map((t,i)=><button key={t.id} className={`trackRow ${selected?.id===t.id?'active':''}`} onClick={()=>setSelected(t)}><span className="index">{selected?.id===t.id?<Play size={15} fill="currentColor"/>:i+1}</span><img src={t.image} alt=""/><span className="trackText"><strong>{t.name}</strong><small>{t.artists}</small></span><span className="album">Tap to play</span></button>)}</div>}</div><aside className="playerCard">{selected?<><div className="nowPlayingLabel">NOW PLAYING</div><img className="cover" src={selected.image} alt=""/><h3>{selected.name}</h3><p>{selected.artists}</p><iframe title={`Player for ${selected.name}`} src={`https://www.youtube.com/embed/${selected.id}?autoplay=1&playsinline=1`} width="100%" height="240" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen/><a href={selected.youtubeUrl} target="_blank" rel="noreferrer">Open on YouTube <ExternalLink size={14}/></a></>:<div className="playerEmpty"><div className="vinyl"><Music2 size={34}/></div><h3>Pick a song</h3><p>Tap any song and it will play here.</p></div>}</aside></div></section><footer className="shell">Music is streamed from YouTube. Music Listener does not download or redistribute media.</footer></main>
}
