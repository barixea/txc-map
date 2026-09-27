'use client';

import { Marker } from 'react-map-gl/mapbox';
import { EVENT_VENUES, LABEL_STYLES } from '@/data/event-venues';
import type { BuildingWithPhoto } from '@/lib/types';

type Props = {
  building: BuildingWithPhoto;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

export default function BuildingMarker({ building, isSelected, onSelect }: Props) {
  const venue = EVENT_VENUES[building.id];
  const labelStyle = LABEL_STYLES[venue?.variant ?? 'default'];

  return (
    <Marker longitude={building.coordinates[0]} latitude={building.coordinates[1]} anchor="top" offset={[0, 8]}>
      <button
        type="button"
        aria-label={`Open ${building.name} venue details`}
        aria-pressed={isSelected}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(building.id);
        }}
        className={`max-w-40 cursor-pointer truncate focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${isSelected ? LABEL_STYLES.featured : labelStyle}`}
      >
        {venue?.label ?? building.name}
      </button>
    </Marker>
  );
}
