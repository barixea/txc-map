import { parseCsv, parseMasterRows, type ScheduleGame } from '@/lib/game-schedule';

function csvUrl(sheetLink: string): string {
  const url = new URL(sheetLink);
  if (url.protocol !== 'https:' || url.hostname !== 'docs.google.com') {
    throw new Error('The schedule link must be an HTTPS Google Sheets link.');
  }
  if (/^\/spreadsheets\/d\/e\/[^/]+\/pub$/.test(url.pathname)) {
    url.searchParams.set('output', 'csv');
    return url.toString();
  }
  const match = /^\/spreadsheets\/d\/([a-zA-Z0-9_-]+)\//.exec(url.pathname);
  const gid = url.searchParams.get('gid') ?? new URLSearchParams(url.hash.slice(1)).get('gid');
  if (!match) throw new Error('Use a viewable Google Sheets edit link.');
  if (gid && /^\d+$/.test(gid)) {
    return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv&gid=${gid}`;
  }
  return `https://docs.google.com/spreadsheets/d/${match[1]}/gviz/tq?tqx=out:csv&sheet=Master`;
}

export async function readGoogleSheetGames(sheetLink: string): Promise<ScheduleGame[]> {
  const response = await fetch(csvUrl(sheetLink), {
    headers: { Accept: 'text/csv' },
    next: { revalidate: 5 },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Google Sheets returned HTTP ${response.status}.`);
  const body = await response.text();
  if (body.trimStart().startsWith('<!DOCTYPE') || body.trimStart().startsWith('<html')) {
    throw new Error('Google Sheets returned a sign-in page instead of a CSV. Check sharing access.');
  }
  return parseMasterRows(parseCsv(body));
}
