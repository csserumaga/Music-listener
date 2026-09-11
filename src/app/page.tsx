'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Heart, Headphones, ListMusic, Music2, Pause, Play, Plus, Radio, Search, Shuffle, Sparkles, Video, VideoOff } from 'lucide-react';

type Track = { id:string; name:string; artists:string; image:string; youtubeUrl:string };
type View = 'discover'|'favorites'|'recent';

const albums = [
  { title:'African Giant', artist:'Burna Boy', query:'Burna Boy African Giant album', className:'coverBurn' },
  { title:'30', artist:'Adele', query:'Adele 30 album', className:'coverAdele' },
  { title:'Views', artist:'Drake', query:'Drake Views album', className:'coverDrake' },
  { title:'African Music', artist:'Azawi', query:'Azawi African Music album', className:'coverAzawi' },
  { title:'Made in Lagos', artist:'Wizkid', query:'Wizkid Made in Lagos album', className:'coverWiz' },
  { title:'Timeless', artist:'Davido', query:'Davido Timeless album', className:'coverDavido' },
];
const moods = ['Afrobeats','R&B','Gospel','Amapiano','Hip-Hop','Chill'];

export default function Home(){
 const [query,setQuery]=useState('');
 const [tracks,setTracks]=useState<Track[]>([]);
 const [selected,setSelected]=useState<Track|null>(null);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 const [heading,setHeading]=useState('Popular right now');
 const [showVideo,setShowVideo]=useState(false);
 const [isPlaying,setIsPlaying]=useState(false);
 const [favorites,setFavorites]=useState<Track[]>([]);
 const [recent,setRecent]=useState<Track[]>([]);
 const [queue,setQueue]=useState<Track[]>([]);
 const [view,setView]=useState<View>('discover');
 const playerRef=useRef<HTMLIFrameElement>(null);

 useEffect(()=>{try{setFavorites(JSON.parse(localStorage.getItem('ml-favorites')||'[]'));setRecent(JSON.parse(localStorage.getItem('ml-recent')||'[]'))}catch{}},[]);
 useEffect(()=>{void runSearch('Afrobeats hits 2026','Popular right now')},[]);

 function persist(key:string,value:Track[]){localStorage.setItem(key,JSON.stringify(value))}
 function command(func:string,args:any[]=[]){playerRef.current?.contentWindow?.postMessage(JSON.stringify({event:'command',func,args}),'*')}
 function play(){command('playVideo');setIsPlaying(true)}
 function pause(){command('pauseVideo');setIsPlaying(false)}
 function togglePlay(){isPlaying?pause():play()}

 async function runSearch(term:string,label?:string){
  if(!term.trim())return;setLoading(true);setError('');setView('discover');if(label)setHeading(label);
  try{const r=await fetch(`/api/search?q=${encodeURIComponent(term.trim())}`);const d=await r.json();if(!r.ok)throw new Error(d.error||'Search failed');const found=d.tracks||[];setTracks(found);if(found.length&&!selected)chooseTrack(found[0],found)}
  catch(err){setError(err instanceof Error?err.message:'Search failed')}
  finally{setLoading(false)}
 }
 async function searchMusic(e:FormEvent){e.preventDefault();await runSearch(query,'Search results')}
 function chooseTrack(t:Track,list=tracks){setSelected(t);setIsPlaying(true);const next=[t,...recent.filter(x=>x.id!==t.id)].slice(0,12);setRecent(next);persist('ml-recent',next);if(list.length)setTracks(list)}
 function toggleFavorite(t:Track){const exists=favorites.some(x=>x.id===t.id);const next=exists?favorites.filter(x=>x.id!==t.id):[t,...favorites];setFavorites(next);persist('ml-favorites',next)}
 function addQueue(t:Track){if(!queue.some(x=>x.id===t.id))setQueue([...queue,t])}
 function nextTrack(){const list=queue.length?queue:displayTracks;if(!list.length)return;const i=Math.max(0,list.findIndex(x=>x.id===selected?.id));const next=list[(i+1)%list.length];chooseTrack(next,list);if(queue.length)setQueue(queue.filter(x=>x.id!==next.id))}
 function prevTrack(){const list=displayTracks;if(!list.length)return;const i=Math.max(0,list.findIndex(x=>x.id===selected?.id));chooseTrack(list[(i-1+list.length)%list.length],list)}
 function shuffle(){if(!displayTracks.length)return;chooseTrack(displayTracks[Math.floor(Math.random()*displayTracks.length)],displayTracks)}
 const displayTracks=useMemo(()=>view==='favorites'?favorites:view==='recent'?recent:tracks,[view,favorites,recent,tracks]);
 const activeFav=selected?favorites.some(x=>x.id===selected.id):false;

 return <main className={selected?'hasPlayer':''}>
  <div className="orb orbOne"/><div className="orb orbTwo"/>
  <nav className="nav shell"><div className="brand"><div className="brandMark"><Music2 size={20}/></div><span>Music Listener</span></div><div className="modeBadge"><Radio size={13}/> Audio-first</div></nav>

  <section className="hero shell"><div className="eyebrow"><Sparkles size={15}/> Less data. More listening.</div><h1>Your music.<br/><span>Always within reach.</span></h1><p>Tap a song and keep listening while you browse. Video stays off unless you choose to show it.</p><form className="searchBox" onSubmit={searchMusic}><Search size={21}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search songs, artists or albums..." aria-label="Search music"/><button disabled={loading}>{loading?'Searching…':'Search'}</button></form>{error&&<div className="notice"><Headphones size={18}/>{error}</div>}</section>

  <section className="shell quickRow">{moods.map(m=><button key={m} onClick={()=>void runSearch(`${m} hits 2026`,`${m} picks`)}>{m}</button>)}</section>

  <section className="shell albumSection"><div className="sectionHeading"><div><small className="kicker">EXPLORE</small><h2>Albums & artist picks</h2></div><span>Tap a card to explore</span></div><div className="albumGrid">{albums.map(a=><button key={a.title} className="albumCard" onClick={()=>void runSearch(a.query,`${a.artist} — ${a.title}`)}><div className={`albumArt ${a.className}`}><span>{a.title}</span><i><Play size={18} fill="currentColor"/></i></div><strong>{a.title}</strong><small>{a.artist}</small></button>)}</div></section>

  <section className="content shell">
   <div className="libraryHead"><div><small className="kicker">YOUR MUSIC</small><h2>{view==='discover'?heading:view==='favorites'?'Liked songs':'Recently played'}</h2></div><div className="libraryTabs"><button className={view==='discover'?'active':''} onClick={()=>setView('discover')}>Discover</button><button className={view==='favorites'?'active':''} onClick={()=>setView('favorites')}><Heart size={14}/> Liked <b>{favorites.length}</b></button><button className={view==='recent'?'active':''} onClick={()=>setView('recent')}>Recent</button></div></div>
   {loading&&view==='discover'?<div className="loadingPanel">Finding music for you…</div>:displayTracks.length===0?<div className="emptyLibrary"><Music2 size={36}/><h3>{view==='favorites'?'No liked songs yet':'Nothing here yet'}</h3><p>{view==='favorites'?'Tap the heart beside any song to save it here.':'Play a few songs and they will appear here.'}</p></div>:<div className="trackList">{displayTracks.map((t,i)=>{const liked=favorites.some(x=>x.id===t.id);return <div key={t.id} className={`trackRow ${selected?.id===t.id?'active':''}`}><button className="trackMain" onClick={()=>chooseTrack(t,displayTracks)}><span className="index">{selected?.id===t.id&&isPlaying?<Play size={14} fill="currentColor"/>:i+1}</span><img src={t.image} alt=""/><span className="trackText"><strong>{t.name}</strong><small>{t.artists}</small></span><span className="source">Audio mode</span></button><div className="rowActions"><button title="Like" className={liked?'liked':''} onClick={()=>toggleFavorite(t)}><Heart size={17} fill={liked?'currentColor':'none'}/></button><button title="Add to queue" onClick={()=>addQueue(t)}><Plus size={18}/></button></div></div>})}</div>}
  </section>

  <footer className="shell">Audio-first playback uses YouTube as the source. Video is optional. Music Listener does not download or redistribute media.</footer>

  {selected&&<div className={`playerDock ${showVideo?'videoOpen':''}`}>
    {showVideo&&<div className="videoPanel"><iframe ref={playerRef} title={selected.name} src={`https://www.youtube.com/embed/${selected.id}?autoplay=1&playsinline=1&enablejsapi=1&controls=1&rel=0`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen/></div>}
    {!showVideo&&<iframe className="audioEngine" ref={playerRef} title={selected.name} src={`https://www.youtube.com/embed/${selected.id}?autoplay=1&playsinline=1&enablejsapi=1&controls=0&rel=0`} allow="autoplay; encrypted-media"/>}
    <div className="dockInner shell"><div className="nowTrack"><img src={selected.image} alt=""/><div><small>NOW PLAYING</small><strong>{selected.name}</strong><span>{selected.artists}</span></div></div><div className="transport"><button title="Shuffle" onClick={shuffle}><Shuffle size={18}/></button><button title="Previous" onClick={prevTrack}><ChevronLeft size={23}/></button><button className="bigPlay" title={isPlaying?'Pause':'Play'} onClick={togglePlay}>{isPlaying?<Pause size={22} fill="currentColor"/>:<Play size={22} fill="currentColor"/>}</button><button title="Next" onClick={nextTrack}><ChevronRight size={23}/></button><button title="Queue"><ListMusic size={18}/><em>{queue.length}</em></button></div><div className="dockTools"><button className={activeFav?'liked':''} onClick={()=>toggleFavorite(selected)} title="Like"><Heart size={19} fill={activeFav?'currentColor':'none'}/></button><button className={showVideo?'videoOn':''} onClick={()=>setShowVideo(v=>!v)} title={showVideo?'Hide video':'Show video'}>{showVideo?<VideoOff size={19}/>:<Video size={19}/>}<span>{showVideo?'Hide video':'Video'}</span></button><a href={selected.youtubeUrl} target="_blank" rel="noreferrer" title="Open source"><ExternalLink size={18}/></a></div></div>
  </div>}
 </main>
}
