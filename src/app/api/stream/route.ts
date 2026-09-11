import { NextRequest, NextResponse } from 'next/server';

export async function GET(request:NextRequest){
  const id=request.nextUrl.searchParams.get('id')?.trim();
  if(!id)return NextResponse.json({error:'Missing track id'},{status:400});
  const url=`https://api.audius.co/v1/tracks/${encodeURIComponent(id)}/stream?app_name=MusicListener`;
  return NextResponse.redirect(url,307);
}
