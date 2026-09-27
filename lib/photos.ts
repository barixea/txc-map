import { BUILDINGS } from '@/data/buildings';
import { BUILDING_PHOTOS } from '@/data/building-photos';
import { EVENT_VENUES } from '@/data/event-venues';
import type { BuildingWithPhoto } from './types';

/** Return only event venues, with photos stored in public/images/buildings. */
export async function getBuildingsWithPhotos(): Promise<BuildingWithPhoto[]> {
  return BUILDINGS
    .filter((building) => Object.hasOwn(EVENT_VENUES, building.id))
    .map((building) => ({
      ...building,
      photo: BUILDING_PHOTOS[building.id] ?? null,
    }));
}
