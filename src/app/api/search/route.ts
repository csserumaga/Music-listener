import { NextRequest, NextResponse } from 'next/server';

const BASE = 'https://api.audius.co/v1';
const APP = 'MusicListener';

type AudiusTrack = {
  id?: string;
  title?: string;
  duration?: number;
  genre?: string;
  mood?: string;
  permalink?: string;
  artwork?: Record<string,string>;
  user?: { name?: string; handle?: string };
};

function mapTrack(t:AudiusTrack){
  const artwork=t.artwork||{};
  return {
    id:t.id||'',
    name:t.title||'Untitled',
    artists:t.user?.name||t.user?.handle||'Audius artist',
    image:artwork['480x480']||artwork['150x150']||artwork['1000x1000']||'',
    duration:t.duration||0,
    genre:t.genre||'',
    mood:t.mood||'',
    audiusUrl:t.permalink?`https://audius.co${t.permalink}`:'https://audius.co',
  };
}

export async function GET(request:NextRequest){
  const q=request.nextUrl.searchParams.get('q')?.trim();
  const mode=request.nextUrl.searchParams.get('mode')||'search';
  const genre=request.nextUrl.searchParams.get('genre')?.trim();
  const params=new URLSearchParams({app_name:APP,limit:'20'});
  let endpoint='/tracks/search';
  if(mode==='trending'){
    endpoint='/tracks/trending';
    params.set('time','week');
    if(genre)params.set('genre',genre);
  }else{
    if(!q)return NextResponse.json({tracks:[]});
    params.set('query',q);
  }
  try{
    const r=await fetch(`${BASE}${endpoint}?${params.toString()}`,{cache:'no-store',headers:{Accept:'application/json'}});
    if(!r.ok)throw new Error('Audius is temporarily unavailable');
    const json=await r.json();
    const data=Array.isArray(json?.data)?json.data:[];
    return NextResponse.json({tracks:data.map(mapTrack).filter((t:any)=>t.id)});
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:'Music search failed'},{status:503});
  }
}
