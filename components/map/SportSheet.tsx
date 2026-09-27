'use client';

import Image from 'next/image';
import type { SportMarkerConfig } from '@/data/event-venues';
import { formatGameTime, type VisibleGame } from '@/lib/game-schedule';
import type { BuildingWithPhoto } from '@/lib/types';

type Props = {
  sport: SportMarkerConfig | null;
  venue: BuildingWithPhoto | null;
  game: VisibleGame | null;
  onClose: () => void;
  onViewVenue: (id: string) => void;
};

export default function SportSheet({ sport, venue, game, onClose, onViewVenue }: Props) {
  if (!sport || !venue) return null;

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-labelledby="sport-sheet-title"
      className="absolute inset-x-0 bottom-0 z-10 max-h-[62dvh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-96 md:rounded-none md:rounded-l-2xl"
    >
      <div className="relative grid h-44 place-items-center bg-[#e8efdf]">
        <Image src={`/icons/sports/${sport.icon}.svg`} alt="" width={112} height={112} unoptimized className="size-28 object-contain" />
        <button type="button" onClick={onClose} aria-label="Close sport details" className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/60 text-white transition hover:bg-black/75 focus-visible:ring-2 focus-visible:ring-white">✕</button>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Intramurals sport</p>
          <h2 id="sport-sheet-title" className="font-score mt-1 text-xl font-bold text-slate-900">{sport.sport}</h2>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Venue</p>
          <button type="button" onClick={() => onViewVenue(venue.id)} className="mt-1 text-left text-sm font-semibold text-brand underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">{venue.name} ↗</button>
        </div>
        {game ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Game from Sheet</p>
            <p className="mt-1 text-sm font-semibold capitalize text-slate-900">{game.status}</p>
            <p className="text-sm text-slate-600">Scheduled {game.game.date} · {formatGameTime(game.game.startMinutes)}{game.game.endMinutes !== null ? ` – ${formatGameTime(game.game.endMinutes)}` : ''} · {game.game.id}</p>
          </div>
        ) : <p className="text-sm text-slate-500">Game times and status will appear here when the schedule is connected.</p>}
      </div>
    </aside>
  );
}
