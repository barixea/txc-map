'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Map, {
  type MapRef,
  type ViewStateChangeEvent,
} from 'react-map-gl/mapbox';

import BuildingMarker from './BuildingMarker';
import SportMarker from './SportMarker';
import SportSheet from './SportSheet';
import BuildingSheet from './BuildingSheet';
import CampusBoundary from './CampusBoundary';
import SchematicCampusMap from './SchematicCampusMap';
import ControlDock from '../overlay/ControlDock';
import { useTheme } from '@/components/theme/ThemeProvider';
import { SPORT_MARKERS } from '@/data/event-venues';
import { visibleGames, type ScheduleGame, type VisibleGame } from '@/lib/game-schedule';
import {
  BASEMAP_CONFIG,
  CAMPUS_BOUNDS,
  CAMPUS_CENTER,
  LABEL_ZOOM_THRESHOLD,
  MAP_STYLE,
  MAX_ZOOM,
  MIN_ZOOM,
  VIEW_3D,
} from '@/lib/map-config';
import type { BuildingWithPhoto } from '@/lib/types';

type ViewMode = '2d' | '3d';
type GameFeed = { source: 'unconfigured' | 'google-sheet'; games: ScheduleGame[] };

const SHELL = 'flex h-[100dvh] w-full flex-col overflow-hidden';

const MISSING_TOKEN_SCREEN = 'grid size-full place-items-center bg-slate-100 p-6 text-center';

const CODE = 'rounded bg-slate-200 px-1';

export default function CampusMap({ buildings }: { buildings: BuildingWithPhoto[] }) {
  const mapRef = useRef<MapRef>(null);
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('2d');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedSportId, setSelectedSportId] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(VIEW_3D.zoom >= LABEL_ZOOM_THRESHOLD);
  const [zoom, setZoom] = useState<number>(VIEW_3D.zoom);
  const [schematicZoom, setSchematicZoom] = useState(1);
  const [styleReady, setStyleReady] = useState(false);
  const [gameFeed, setGameFeed] = useState<GameFeed | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch('/api/games', { cache: 'no-store' });
        if (!response.ok) {
          const failure = await response.json() as { source?: string; error?: string };
          if (active) {
            if (failure.source === 'google-sheet') setGameFeed((current) => current ?? { source: 'google-sheet', games: [] });
            setScheduleError(failure.error ?? 'Could not load game schedule.');
          }
          return;
        }
        const feed = await response.json() as GameFeed;
        if (active) { setGameFeed(feed); setScheduleError(null); }
      } catch {
        if (active) setScheduleError('Could not reach the game schedule.');
      }
    };
    void refresh();
    const refreshTimer = window.setInterval(() => { void refresh(); }, 15_000);
    const clockTimer = window.setInterval(() => setNow(new Date()), 15_000);
    return () => { active = false; window.clearInterval(refreshTimer); window.clearInterval(clockTimer); };
  }, []);

  const scheduleActive = gameFeed?.source === 'google-sheet';
  const currentMinute = Math.floor(now.getTime() / 60_000);
  const gamesBySport = useMemo(() => scheduleActive
    ? visibleGames(gameFeed?.games ?? [], new Date(currentMinute * 60_000))
    : new globalThis.Map<string, VisibleGame>(), [gameFeed, currentMinute, scheduleActive]);
  const sports = useMemo(() => gameFeed === null ? [] : scheduleActive ? SPORT_MARKERS.filter((sport) => gamesBySport.has(sport.id)) : SPORT_MARKERS, [gameFeed, scheduleActive, gamesBySport]);
  const gameVenueId = useCallback((sportId: string, defaultVenueId: string) => gamesBySport.get(sportId)?.game.venueId ?? defaultVenueId, [gamesBySport]);

  const selected = buildings.find((b) => b.id === selectedId) ?? null;
  const selectedSport = sports.find((sport) => sport.id === selectedSportId) ?? null;
  const sportVenue = buildings.find((building) => building.id === (selectedSport ? gameVenueId(selectedSport.id, selectedSport.venueId) : null)) ?? null;
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (scheduleActive && selectedSportId && !gamesBySport.has(selectedSportId)) setSelectedSportId(null);
  }, [scheduleActive, selectedSportId, gamesBySport]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !styleReady || viewMode !== '3d') return;

    const setConfig = (key: string, value: unknown) => {
      try {
        map.setConfigProperty('basemap', key, value);
      } catch {
      }
    };

    for (const [key, value] of Object.entries(BASEMAP_CONFIG)) setConfig(key, value);
    setConfig('show3dObjects', true);
    setConfig('show3dTrees', false);
    setConfig('lightPreset', theme.map.lightPreset3D);
  }, [viewMode, styleReady, theme]);

  // Update label visibility and zoom level as the map zooms
  const handleZoom = useCallback((e: ViewStateChangeEvent) => {
    const next = e.viewState.zoom;
    const labelled = next >= LABEL_ZOOM_THRESHOLD;
    setShowLabels((prev) => (prev === labelled ? prev : labelled));
    setZoom((prev) => (prev === next ? prev : next));
  }, []);

  const focusBuilding = useCallback(
    (id: string) => {
      const building = buildings.find((b) => b.id === id);
      if (!building) return;
      setSelectedId(id);
      setSelectedSportId(null);

      if (viewMode === '3d') {
        const map = mapRef.current?.getMap();
        map?.easeTo({
          center: building.coordinates,
          zoom: Math.max(map.getZoom(), 17.6),
          duration: 600,
          essential: true,
        });
      }
    },
    [buildings, viewMode],
  );

  const focusSport = useCallback(
    (id: string) => {
      const sport = SPORT_MARKERS.find((item) => item.id === id);
      const venue = buildings.find((building) => building.id === (sport ? gameVenueId(sport.id, sport.venueId) : null));
      if (!sport || !venue) return;
      setSelectedSportId(id);
      setSelectedId(null);
      if (viewMode === '3d') {
        const map = mapRef.current?.getMap();
        map?.easeTo({ center: venue.id === sport.venueId ? sport.coordinates ?? venue.coordinates : venue.coordinates, zoom: Math.max(map.getZoom(), 17.6), duration: 600, essential: true });
      }
    },
    [buildings, viewMode, gameVenueId],
  );

  const zoomIn = useCallback(() => {
    if (viewMode === '2d') setSchematicZoom((current) => Math.min(2.25, current + 0.25));
    else mapRef.current?.getMap().zoomIn({ duration: 300 });
  }, [viewMode]);
  const zoomOut = useCallback(() => {
    if (viewMode === '2d') setSchematicZoom((current) => Math.max(1, current - 0.25));
    else mapRef.current?.getMap().zoomOut({ duration: 300 });
  }, [viewMode]);
  return (
    <div className={SHELL}>
      <div className="relative flex-1">
        {viewMode === '2d' ? (
          <SchematicCampusMap
            buildings={buildings}
            sports={sports}
            gamesBySport={gamesBySport}
            scheduleActive={Boolean(scheduleActive)}
            scheduleError={scheduleError}
            selectedId={selectedId}
            selectedSportId={selectedSportId}
            onSelect={focusBuilding}
            onSelectSport={focusSport}
            onClearSelection={() => { setSelectedId(null); setSelectedSportId(null); }}
            zoom={schematicZoom}
          />
        ) : token ? (
          <Map
            ref={mapRef}
            mapboxAccessToken={token}
            mapStyle={MAP_STYLE}
            config={{ basemap: { show3dObjects: true, show3dTrees: false } }}
            initialViewState={{ ...CAMPUS_CENTER, ...VIEW_3D }}
            maxBounds={CAMPUS_BOUNDS}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            dragRotate
            pitchWithRotate
            touchPitch
            attributionControl
            onLoad={() => setStyleReady(true)}
            onZoom={handleZoom}
            onClick={() => { setSelectedId(null); setSelectedSportId(null); }}
            style={{ width: '100%', height: '100%' }}
          >
            <CampusBoundary />
            {buildings.map((building) => (
              <BuildingMarker
                key={building.id}
                building={building}
                isSelected={building.id === selectedId}
                onSelect={focusBuilding}
              />
            ))}
            {sports.flatMap((sport) => {
              const venue = buildings.find((building) => building.id === gameVenueId(sport.id, sport.venueId));
              return venue ? [
                <SportMarker
                  key={sport.id}
                  sport={sport}
                  venueName={venue.name}
                  coordinates={venue.id === sport.venueId ? sport.coordinates ?? venue.coordinates : venue.coordinates}
                  isSelected={selectedSportId === sport.id}
                  showLabel={showLabels}
                  game={gamesBySport.get(sport.id) ?? null}
                  onSelect={focusSport}
                />,
              ] : [];
            })}
          </Map>
        ) : (
          <div className={MISSING_TOKEN_SCREEN}>
            <div className="max-w-sm space-y-2">
              <h2 className="text-base font-semibold text-slate-900">3D map unavailable</h2>
              <p className="text-sm text-slate-600">
                <code className={CODE}>NEXT_PUBLIC_MAPBOX_TOKEN</code> is not set. Add it to{' '}
                <code className={CODE}>.env.local</code> and restart the dev server.
              </p>
            </div>
          </div>
        )}

        {viewMode === '3d' && scheduleError && (
          <p role="status" className="absolute bottom-5 left-5 z-10 max-w-sm rounded-lg bg-white/95 px-3 py-2 text-xs text-amber-800 shadow-md">
            Schedule unavailable: {scheduleError}
          </p>
        )}

        <ControlDock
          mode={viewMode}
          onModeChange={(nextMode) => {
            setStyleReady(false);
            setViewMode(nextMode);
          }}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          canZoomIn={viewMode === '2d' ? schematicZoom < 2.25 : zoom < MAX_ZOOM}
          canZoomOut={viewMode === '2d' ? schematicZoom > 1 : zoom > MIN_ZOOM}
        />

        <BuildingSheet building={selected} onClose={() => setSelectedId(null)} />
        <SportSheet sport={selectedSport} venue={sportVenue} game={selectedSportId ? gamesBySport.get(selectedSportId) ?? null : null} onClose={() => setSelectedSportId(null)} onViewVenue={focusBuilding} />
      </div>

    </div>
  );
}
