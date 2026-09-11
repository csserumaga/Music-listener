import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim();
  if (!query) return NextResponse.json({ tracks: [] });
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' music')}`;
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' });
    if (!response.ok) throw new Error('Music search is temporarily unavailable');
    const html = await response.text();
    const marker = 'var ytInitialData = ';
    const start = html.indexOf(marker);
    if (start < 0) throw new Error('Could not read music results');
    const jsonStart = start + marker.length;
    const end = html.indexOf(';</script>', jsonStart);
    if (end < 0) throw new Error('Could not read music results');
    const data = JSON.parse(html.slice(jsonStart, end));
    const tracks: any[] = [];
    function walk(node:any){
      if(!node||tracks.length>=12)return;
      if(Array.isArray(node)){for(const x of node)walk(x);return;}
      if(typeof node!=='object')return;
      const v=node.videoRenderer;
      if(v?.videoId){
        const name=v.title?.runs?.map((r:any)=>r.text).join('')||v.title?.simpleText||'Untitled';
        const artists=v.ownerText?.runs?.map((r:any)=>r.text).join('')||v.longBylineText?.runs?.map((r:any)=>r.text).join('')||'YouTube';
        const thumbs=v.thumbnail?.thumbnails||[];
        if(!tracks.some(t=>t.id===v.videoId))tracks.push({id:v.videoId,name,artists,image:thumbs.at(-1)?.url||`https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,youtubeUrl:`https://www.youtube.com/watch?v=${v.videoId}`});
      }
      for(const value of Object.values(node))walk(value);
    }
    walk(data);
    return NextResponse.json({ tracks });
  } catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Search failed'},{status:503});}
}
