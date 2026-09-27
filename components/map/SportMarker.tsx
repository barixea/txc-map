'use client';

import Image from 'next/image';
import { Marker } from 'react-map-gl/mapbox';
import type { SportMarkerConfig } from '@/data/event-venues';
import type { VisibleGame } from '@/lib/game-schedule';

type Props = {
  sport: SportMarkerConfig;
  venueName: string;
  coordinates: [number, number];
  isSelected: boolean;
  showLabel: boolean;
  game: VisibleGame | null;
  onSelect: (sportId: string) => void;
};

export default function SportMarker({ sport, venueName, coordinates, isSelected, showLabel, game, onSelect }: Props) {
  return (
    <Marker longitude={coordinates[0]} latitude={coordinates[1]} anchor="bottom">
      <button
        type="button"
        aria-label={`Open ${sport.sport} sport details at ${venueName}`}
        aria-pressed={isSelected}
        onClick={(event) => { event.stopPropagation(); onSelect(sport.id); }}
        className="group flex min-h-11 min-w-11 cursor-pointer flex-col items-center gap-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
      >
        {showLabel && <span className="font-score-upright rounded-md bg-white/95 px-2 py-0.5 text-xs font-semibold text-slate-800 shadow-sm ring-1 ring-black/5">{sport.sport}{game ? ` · ${game.status}` : ''}</span>}
        <Image src={`/icons/sports/${sport.icon}.svg`} alt="" width={48} height={48} unoptimized className={`pointer-events-none size-12 drop-shadow-md transition-transform group-hover:scale-110 ${isSelected ? 'scale-110' : ''}`} />
      </button>
    </Marker>
  );
}
