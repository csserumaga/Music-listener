'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, Headphones, ListMusic, Music2, Pause, Play, Plus, Search, Shuffle, Sparkles, Volume2 } from 'lucide-react';

type Track={id:string;name:string;artists:string;image:string;duration:number;genre:string;mood:string;audiusUrl:string};
type View='discover'|'favorites'|'recent';

const categories=[['Trending',''],['Afrobeats','Afrobeat'],['Hip-Hop','Hip-Hop/Rap'],['R&B','R&B/Soul'],['Electronic','Electronic'],['Jazz','Jazz'],['Pop','Pop']];

function fmt(sec:number){if(!Number.isFinite(sec))return'0:00';const m=Math.floor(sec/60);const s=Math.floor(sec%60);return`${m}:${String(s).padStart(2,'0')}`}

export default function Home(){
 const [query,setQuery]=useState('');
 const [tracks,setTracks]=useState<Track[]>([]);
 const [selected,setSelected]=useState<Track|null>(null);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 const [heading,setHeading]=useState('Trending on Audius');
 const [isPlaying,setIsPlaying]=useState(false);
 const [favorites,setFavorites]=useState<Track[]>([]);
 const [recent,setRecent]=useState<Track[]>([]);
 const [queue,setQueue]=useState<Track[]>([]);
 const [view,setView]=useState<View>('discover');
 const [current,setCurrent]=useState(0);
 const [duration,setDuration]=useState(0);
 const [volume,setVolume]=useState(.85);
 const audioRef=useRef<HTMLAudioElement>(null);

 useEffect(()=>{try{setFavorites(JSON.parse(localStorage.getItem('ml-favorites')||'[]'));setRecent(JSON.parse(localStorage.getItem('ml-recent')||'[]'))}catch{};void loadTrending('','Trending on Audius')},[]);
 useEffect(()=>{if(audioRef.current)audioRef.current.volume=volume},[volume]);
 useEffect(()=>{if(!selected)return;const a=audioRef.current;if(!a)return;a.load();a.play().then(()=>setIsPlaying(true)).catch(()=>setIsPlaying(false))},[selected]);

 function persist(key:string,value:Track[]){localStorage.setItem(key,JSON.stringify(value))}
 async function loadTrending(genre:string,label:string){setLoading(true);setError('');setView('discover');setHeading(label);try{const u=`/api/search?mode=trending${genre?`&genre=${encodeURIComponent(genre)}`:''}`;const r=await fetch(u);const d=await r.json();if(!r.ok)throw new Error(d.error||'Could not load music');setTracks(d.tracks||[])}catch(e){setError(e instanceof Error?e.message:'Could not load music')}finally{setLoading(false)}}
 async function searchMusic(e:FormEvent){e.preventDefault();if(!query.trim())return;setLoading(true);setError('');setView('discover');setHeading(`Results for “${query}”`);try{const r=await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);const d=await r.json();if(!r.ok)throw new Error(d.error||'Search failed');setTracks(d.tracks||[])}catch(e){setError(e instanceof Error?e.message:'Search failed')}finally{setLoading(false)}}
 function chooseTrack(t:Track,list=displayTracks){setSelected(t);const next=[t,...recent.filter(x=>x.id!==t.id)].slice(0,20);setRecent(next);persist('ml-recent',next);if(list.length&&!queue.length)setQueue(list.filter(x=>x.id!==t.id))}
 function togglePlay(){const a=audioRef.current;if(!a)return;if(a.paused)a.play();else a.pause()}
 function toggleFavorite(t:Track){const exists=favorites.some(x=>x.id===t.id);const next=exists?favorites.filter(x=>x.id!==t.id):[t,...favorites];setFavorites(next);persist('ml-favorites',next)}
 function addQueue(t:Track){if(!queue.some(x=>x.id===t.id)&&t.id!==selected?.id)setQueue([...queue,t])}
 function nextTrack(){const list=queue.length?queue:displayTracks;if(!list.length)return;const i=Math.max(0,list.findIndex(x=>x.id===selected?.id));const n=list[(i+1)%list.length];chooseTrack(n,list);if(queue.length)setQueue(queue.filter(x=>x.id!==n.id))}
 function prevTrack(){const list=displayTracks;if(!list.length)return;const i=Math.max(0,list.findIndex(x=>x.id===selected?.id));chooseTrack(list[(i-1+list.length)%list.length],list)}
 function shuffle(){if(displayTracks.length)chooseTrack(displayTracks[Math.floor(Math.random()*displayTracks.length)],displayTracks)}
 function seek(v:number){if(audioRef.current)audioRef.current.currentTime=v}
 const displayTracks=useMemo(()=>view==='favorites'?favorites:view==='recent'?recent:tracks,[view,favorites,recent,tracks]);
 const activeFav=selected?favorites.some(x=>x.id===selected.id):false;

 return <main className={selected?'hasPlayer':''}>
  <div className="orb orbOne"/><div className="orb orbTwo"/>
  <nav className="nav shell"><div className="brand"><div className="brandMark"><Music2 size={20}/></div><span>Music Listener</span></div><div className="modeBadge"><Headphones size={14}/> True audio streaming</div></nav>
  <section className="hero shell"><div className="eyebrow"><Sparkles size={15}/> Powered by Audius</div><h1>Press play.<br/><span>Keep the music moving.</span></h1><p>No video player. Search, stream, queue and save music in a proper audio-first experience.</p><form className="searchBox" onSubmit={searchMusic}><Search size={21}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search tracks or artists..."/><button disabled={loading}>{loading?'Searching…':'Search'}</button></form>{error&&<div className="notice"><Headphones size={18}/>{error}</div>}</section>

  <section className="shell quickRow">{categories.map(([label,genre])=><button key={label} onClick={()=>void loadTrending(genre,label==='Trending'?'Trending on Audius':`${label} trending`)}>{label}</button>)}</section>

  <section className="content shell"><div className="libraryHead"><div><small className="kicker">DISCOVER</small><h2>{view==='discover'?heading:view==='favorites'?'Liked songs':'Recently played'}</h2></div><div className="libraryTabs"><button className={view==='discover'?'active':''} onClick={()=>setView('discover')}>Discover</button><button className={view==='favorites'?'active':''} onClick={()=>setView('favorites')}><Heart size={14}/> Liked <b>{favorites.length}</b></button><button className={view==='recent'?'active':''} onClick={()=>setView('recent')}>Recent</button></div></div>
   {loading&&view==='discover'?<div className="loadingPanel">Loading music…</div>:displayTracks.length===0?<div className="emptyLibrary"><Music2 size={36}/><h3>No tracks here yet</h3><p>Try another search or category.</p></div>:<div className="trackList">{displayTracks.map((t,i)=>{const liked=favorites.some(x=>x.id===t.id);return <div key={t.id} className={`trackRow ${selected?.id===t.id?'active':''}`}><button className="trackMain" onClick={()=>chooseTrack(t,displayTracks)}><span className="index">{selected?.id===t.id&&isPlaying?<Play size={14} fill="currentColor"/>:i+1}</span><div className="artFallback">{t.image?<img src={t.image} alt=""/>:<Music2 size={22}/>}</div><span className="trackText"><strong>{t.name}</strong><small>{t.artists}{t.genre?` · ${t.genre}`:''}</small></span><span className="source">{fmt(t.duration)}</span></button><div className="rowActions"><button className={liked?'liked':''} onClick={()=>toggleFavorite(t)} title="Like"><Heart size={17} fill={liked?'currentColor':'none'}/></button><button onClick={()=>addQueue(t)} title="Add to queue"><Plus size={18}/></button></div></div>})}</div>}
  </section>

  <footer className="shell">Audio streams directly from Audius. Music Listener does not host or redistribute tracks.</footer>

  {selected&&<div className="playerDock"><audio ref={audioRef} src={`/api/stream?id=${encodeURIComponent(selected.id)}`} onPlay={()=>setIsPlaying(true)} onPause={()=>setIsPlaying(false)} onTimeUpdate={e=>setCurrent(e.currentTarget.currentTime)} onLoadedMetadata={e=>setDuration(e.currentTarget.duration||selected.duration)} onEnded={nextTrack}/><div className="progressWrap"><span>{fmt(current)}</span><input type="range" min="0" max={duration||selected.duration||1} value={Math.min(current,duration||selected.duration||1)} onChange={e=>seek(Number(e.target.value))}/><span>{fmt(duration||selected.duration)}</span></div><div className="dockInner shell"><div className="nowTrack"><div className="dockArt">{selected.image?<img src={selected.image} alt=""/>:<Music2/>}</div><div><small>NOW PLAYING</small><strong>{selected.name}</strong><span>{selected.artists}</span></div></div><div className="transport"><button onClick={shuffle} title="Shuffle"><Shuffle size={18}/></button><button onClick={prevTrack} title="Previous"><ChevronLeft size={23}/></button><button className="bigPlay" onClick={togglePlay} title={isPlaying?'Pause':'Play'}>{isPlaying?<Pause size={22} fill="currentColor"/>:<Play size={22} fill="currentColor"/>}</button><button onClick={nextTrack} title="Next"><ChevronRight size={23}/></button><button title="Queue"><ListMusic size={18}/><em>{queue.length}</em></button></div><div className="dockTools"><button className={activeFav?'liked':''} onClick={()=>toggleFavorite(selected)} title="Like"><Heart size={19} fill={activeFav?'currentColor':'none'}/></button><div className="volume"><Volume2 size={17}/><input type="range" min="0" max="1" step="0.05" value={volume} onChange={e=>setVolume(Number(e.target.value))}/></div></div></div></div>}
 </main>
}
