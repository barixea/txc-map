import { NextResponse } from 'next/server';
import { readGoogleSheetGames } from '@/lib/google-sheet';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const link = process.env.GOOGLE_SHEET_MASTER_URL;
  if (!link) {
    return NextResponse.json({ source: 'unconfigured', games: [] }, { headers: { 'Cache-Control': 'no-store' } });
  }
  try {
    const games = await readGoogleSheetGames(link);
    return NextResponse.json({ source: 'google-sheet', games }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not read the game schedule.';
    return NextResponse.json({ source: 'google-sheet', error: message }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
