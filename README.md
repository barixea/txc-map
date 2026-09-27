# TXC Intramurals Campus Map

An interactive campus map that can be integrated into the TXC website. The 2D view is a custom tappable campus schematic; the 3D view uses Mapbox. Building coordinates, labels, and photos are configured in project files.

## Run locally

```bash
npm ci
# Create .env.local and set NEXT_PUBLIC_MAPBOX_TOKEN for the 3D view
npm run dev
```

Open http://localhost:3000. The map opens directly in 2D with venue shortcuts and 2D/3D and zoom controls. The 2D view works without a Mapbox token; the 3D view needs one.

## Edit map content

- `data/buildings.ts`: Building IDs, names, coordinates, categories, search aliases, rooms, and descriptions.
- `data/event-venues.ts`: `EVENT_VENUES` controls the three venue names shown inside 2D footprints and as text labels in 3D. Removing a venue entry also removes it from the map, while its underlying campus drawing remains.
- `data/event-venues.ts`: `SPORT_MARKERS` controls each independent sport icon and sport detail panel. Each sport points to a `venueId`; Soccer and Softball both point to `soccer-field`. Tapping a sport opens its own details, where the venue name links to building details. Optional `coordinates` are `[longitude, latitude]`; `schematicPosition` is `[x, y]` on the 2D drawing.
- `data/campus-boundary.ts`: Geographic campus outline for Mapbox.
- `data/campus-layout.ts`: 2D footprints and venue anchors, drawn from the supplied `11282023.Web.Campus_Map.jpg`. The reference orientation has the field on the left, covered court below it, and gym lower right. Shapes are illustrative, not surveyed. These positions are independent of Mapbox GPS coordinates.
- `lib/map-config.ts`: Map bounds, camera presets, and Mapbox style.
- `components/map/SchematicCampusMap.tsx`: Responsive 2D drawing, tappable venue footprints and sport markers, pointer dragging, keyboard panning, and sport shortcuts. The full campus fits initially; zoom in to read smaller labels. Active venues and sports come from `data/event-venues.ts`. Add a `CAMPUS_ANCHORS` entry when introducing a venue that has no drawing position yet.

Keep building IDs stable because the label and photo configurations use them as keys.

## Add photos

Copy photos into `public/images/buildings/`, then add entries to `data/building-photos.ts`:

```ts
export const BUILDING_PHOTOS: Partial<Record<string, BuildingPhoto>> = {
  'xu-gym': {
    url: '/images/buildings/xu-gym.jpg',
    caption: 'Entrance to the Xavier University Gym',
  },
};
```

## Google Sheets game markers

The map can read the tracker’s **Master** tab without Apps Script. Give the spreadsheet view access, copy its URL, and put it in `.env.local`. A URL without `gid=` reads the tab named `Master`; a URL with `gid=` reads that tab ID:

```dotenv
GOOGLE_SHEET_MASTER_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit?usp=sharing
```

Restart `npm run dev` after changing `.env.local`. The server reads only Match ID, Sport, Venue, Date, Sched Start, Sched End, and Status, then serves the mapped game data at `GET /api/games`. The browser refreshes it every 15 seconds, and the server caches the Sheet for up to 5 seconds. It checks the clock in **Asia/Manila** time. A row explicitly marked `Ongoing` shows its sport icon immediately, even when its scheduled date or time differs from the current clock. Other games appear when they are upcoming later today or within today's scheduled time. If a today's game has no scheduled end, its icon stays visible after its start until the day ends or the Sheet marks it Finished, Cancelled, or Postponed. Change an ongoing row to a terminal status to remove its icon. Two different sports at one venue keep separate icons. The sport detail panel shows the game date, time, and status.

The current icon set supports Soccer, Softball, Frisbee, Basketball, and Volleyball. Sheet venues `Soccer Field`, `Softball Field`, `Field (Pitch 1)`, and `Field (Pitch 2)` point to the map’s Soccer Field. Both Frisbee pitches use the supplied Frisbee GPS point for the Frisbee marker. `Covered Court` and `University Gym` point to their corresponding venues. Each game’s venue row determines the icon’s location and the venue shown in its detail panel, even when that sport normally uses another venue. Unmapped sheet sports and venues are ignored until an icon and venue mapping are added. The supplied sample tracker has no Basketball or Volleyball matches. The Track Oval remains unmapped because its location has not been confirmed.


## Checks

```bash
npm run lint
npm run build
```

## License

MIT

