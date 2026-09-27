import { SPORT_MARKERS } from '@/data/event-venues';

export type ScheduleGame = {
  id: string;
  sportId: string;
  venueId: string;
  date: string; // YYYY-MM-DD in Asia/Manila
  startMinutes: number;
  endMinutes: number | null;
  sheetStatus: string;
};

export type VisibleGame = {
  game: ScheduleGame;
  status: 'ongoing' | 'upcoming';
};

const SPORT_IDS = new Set(SPORT_MARKERS.map((sport) => sport.id));

const VENUE_IDS: Record<string, string> = {
  'soccer field': 'soccer-field',
  'xu soccer field': 'soccer-field',
  'softball field': 'soccer-field', // Softball uses the Soccer Field map venue.
  'field (pitch 1)': 'soccer-field',
  'field (pitch 2)': 'soccer-field',
  'covered court': 'covered-court',
  'xu covered court': 'covered-court',
  'university gym': 'xu-gym',
  'xavier university gym': 'xu-gym',
  'xu gym': 'xu-gym',
};

const clean = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');
const headerKey = (value: string) => clean(value).replace(/[^a-z0-9]/g, '');

export function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    if (char === '"') {
      if (quoted && csv[index + 1] === '"') { cell += '"'; index += 1; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(cell); cell = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && csv[index + 1] === '\n') index += 1;
      row.push(cell); cell = '';
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
    } else {
      cell += char;
    }
  }
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function parseDate(value: string): string | null {
  const text = value.trim();
  let year: number;
  let month: number;
  let day: number;
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(text);
  const numeric = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text);
  const named = /^([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})$/.exec(text);
  const namedDayFirst = /^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$/.exec(text);
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  if (iso) [, year, month, day] = iso.map(Number);
  else if (numeric) [, month, day, year] = numeric.map(Number);
  else if (named) { month = months.indexOf(named[1].slice(0, 3).toLowerCase()) + 1; day = Number(named[2]); year = Number(named[3]); }
  else if (namedDayFirst) { day = Number(namedDayFirst[1]); month = months.indexOf(namedDayFirst[2].slice(0, 3).toLowerCase()) + 1; year = Number(namedDayFirst[3]); }
  else return null;
  const valid = new Date(Date.UTC(year, month - 1, day));
  if (valid.getUTCFullYear() !== year || valid.getUTCMonth() + 1 !== month || valid.getUTCDate() !== day) return null;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseTime(value: string): number | null {
  const text = value.trim();
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i.exec(text);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  if (minute > 59 || hour > (match[3] ? 12 : 23) || (match[3] && hour < 1)) return null;
  if (match[3]) hour = (hour % 12) + (match[3].toUpperCase() === 'PM' ? 12 : 0);
  return hour * 60 + minute;
}

export function parseMasterRows(rows: string[][]): ScheduleGame[] {
  if (!rows.length) return [];
  const columns = new Map(rows[0].map((name, index) => [headerKey(name), index]));
  const required = ['sport', 'venue', 'date', 'schedstart'];
  if (required.some((key) => !columns.has(key))) throw new Error('The Master tab needs Sport, Venue, Date, and Sched Start columns.');
  const value = (row: string[], key: string) => row[columns.get(key) ?? -1] ?? '';
  return rows.slice(1).flatMap((row, index) => {
    const sportId = clean(value(row, 'sport'));
    const venueId = VENUE_IDS[clean(value(row, 'venue'))];
    const date = parseDate(value(row, 'date'));
    const startMinutes = parseTime(value(row, 'schedstart'));
    if (!SPORT_IDS.has(sportId) || !venueId || !date || startMinutes === null) return [];
    const endMinutes = parseTime(value(row, 'schedend'));
    return [{
      id: value(row, 'matchid').trim() || `row-${index + 2}`,
      sportId, venueId, date, startMinutes,
      endMinutes: endMinutes !== null && endMinutes > startMinutes ? endMinutes : null,
      sheetStatus: clean(value(row, 'status')),
    }];
  });
}

export function getManilaClock(now: Date): { date: string; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now);
  const part = (name: string) => parts.find((item) => item.type === name)?.value ?? '';
  return {
    date: `${part('year')}-${part('month')}-${part('day')}`,
    minutes: Number(part('hour')) * 60 + Number(part('minute')),
  };
}

export function visibleGames(games: ScheduleGame[], now: Date): Map<string, VisibleGame> {
  const clock = getManilaClock(now);
  const chosen = new Map<string, VisibleGame>();
  for (const game of games) {
    if (['finished', 'postponed', 'cancelled', 'canceled'].includes(game.sheetStatus)) continue;
    let status: VisibleGame['status'] | null = null;
    if (game.sheetStatus === 'ongoing') status = 'ongoing';
    else if (game.date === clock.date) {
      if (clock.minutes < game.startMinutes) status = 'upcoming';
      else if (game.endMinutes === null || clock.minutes < game.endMinutes) status = 'ongoing';
    }
    if (!status) continue;
    const current = chosen.get(game.sportId);
    const explicitOngoing = game.sheetStatus === 'ongoing';
    const currentExplicitOngoing = current?.game.sheetStatus === 'ongoing';
    if (!current || (explicitOngoing && !currentExplicitOngoing) ||
      (explicitOngoing === currentExplicitOngoing && status === 'ongoing' && current.status !== 'ongoing') ||
      (explicitOngoing === currentExplicitOngoing && status === current.status && game.startMinutes < current.game.startMinutes)) {
      chosen.set(game.sportId, { game, status });
    }
  }
  return chosen;
}

export function formatGameTime(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
}
