export type SportIcon = 'soccer' | 'basketball' | 'volleyball' | 'softball' | 'frisbee';

export type EventVenue = {
  /** The building name shown on the map, separate from any sport. */
  label?: string;
  variant?: 'default' | 'featured';
};

/**
 * Only IDs here appear as TXC venues on the maps and in /api/buildings.
 * Sports below reference these IDs but have their own markers and details.
 */

/**
 * 'main-gate-corrales': { label: 'Main Gate — Corrales' },
  'mortola-gate': { label: 'Mortola Gate' },
  'xu-new-library': { label: 'XU New Library' },
  'xu-old-library': { label: 'XU Old Library' },
  'science-center': { label: 'Science Center' },
  'sec-mall': { label: 'SEC Mall' },
  'museo-de-oro': { label: 'Museo de Oro' },
  'finance-office': { label: 'Finance Office' },
  'xavier-hall': { label: 'Xavier Hall' },
  'registrar-office': { label: 'Xavier Registrar Office' },
  'scholarships-financial-aid': { label: 'XU Office of Scholarships and Financial Aid' },
  'lucas-hall': { label: 'Lucas Hall' },
  'campion-hall': { label: 'Campion Hall' },
  'university-church': { label: 'University Church of the Immaculate Conception' },
  'agriculture-building': { label: 'Agriculture Building' },
  'xu-gym': { label: 'Xavier University Gym' },
  'peace-park': { label: 'Xavier University Peace Park' },
  'sped-lab': { label: 'SPED Lab' },
  'student-center': { label: 'Student Center Building' },
  'magis-building': { label: 'Magis Building' },
  'little-theater': { label: 'Little Theater' },
  'loyola-house': { label: 'Loyola House' },
  'haggerty-house': { label: 'Haggerty House' },
  'soccer-field': { label: 'XU Soccer Field' },
  'social-science-building': { label: 'Social Science Building' },
  'sbm-building': { label: 'SBM Building' },
  'covered-court': { label: 'XU Covered Court' },
  'physical-plant-offices': { label: 'Physical Plant Offices' },
  'physical-plant-workshop': { label: 'Physical Plant Workshop' },
  'engineering-building': { label: 'Engineering Building' },
  'engineering-annex': { label: 'Engineering Annex' },
  'religious-of-the-assumption': { label: 'Religious of the Assumption' },
  'medicine-building': { label: 'Medicine Building' },
  'amphitheater': { label: 'Amphitheater' },
 */

export const EVENT_VENUES: Record<string, EventVenue> = {
  'xu-gym': { label: 'University Gym' },
  'soccer-field': { label: 'Soccer Field' },
  'covered-court': { label: 'Covered Court' },
};

export type SportMarkerConfig = {
  id: string;
  sport: string;
  icon: SportIcon;
  /** Existing building hosting this sport. */
  venueId: string;
  /** Optional [longitude, latitude]; otherwise use the venue's GPS point. */
  coordinates?: [number, number];
  /** [x, y] in the illustrated 2D map (see campus-layout.ts). */
  schematicPosition: [number, number];
};

/** Sports are independent map items, even when they share a venue. */
export const SPORT_MARKERS: SportMarkerConfig[] = [
  { id: 'basketball', sport: 'Basketball', icon: 'basketball', venueId: 'xu-gym', schematicPosition: [481, 324] },
  { id: 'soccer', sport: 'Soccer', icon: 'soccer', venueId: 'soccer-field', schematicPosition: [203, 202] },
  {
    id: 'frisbee',
    sport: 'Frisbee',
    icon: 'frisbee',
    venueId: 'soccer-field',
    coordinates: [124.64828633923103, 8.476343007092051],
    schematicPosition: [225, 218],
  },
  {
    id: 'softball',
    sport: 'Softball',
    icon: 'softball',
    venueId: 'soccer-field',
    coordinates: [124.64746719564286, 8.475821935655013],
    schematicPosition: [260, 202],
  },
  { id: 'volleyball', sport: 'Volleyball', icon: 'volleyball', venueId: 'covered-court', schematicPosition: [241, 301] },
];

/** Shared styles for building name tags in the 3D map. */
export const LABEL_STYLES = {
  default: 'font-score-upright rounded-md bg-white/95 px-2 py-0.5 text-xs font-semibold text-slate-800 shadow-sm ring-1 ring-black/5',
  featured: 'font-score-upright rounded-lg bg-brand px-2.5 py-1 text-xs font-bold text-brand-fg shadow-md ring-1 ring-white/70',
} as const;
