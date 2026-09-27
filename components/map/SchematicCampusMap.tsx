'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CAMPUS_ANCHORS, CAMPUS_DRAWING, CAMPUS_FOOTPRINTS, CAMPUS_OUTLINE } from '@/data/campus-layout';
import { EVENT_VENUES, type SportMarkerConfig } from '@/data/event-venues';
import type { VisibleGame } from '@/lib/game-schedule';
import type { BuildingWithPhoto } from '@/lib/types';

const { width: WIDTH, height: HEIGHT, top: TOP } = CAMPUS_DRAWING;
const FILLS = { field: '#b5cd94', court: '#c3d5de', gym: '#dac3a1', church: '#d6aaa0' };
const VENUE_LABEL_POSITIONS: Record<string, [number, number]> = {
  'soccer-field': [224, 240],
  'covered-court': [241, 337],
  'xu-gym': [481, 352],
};
const SPORT_OFFSETS: Record<string, [number, number]> = {
  basketball: [-12, -18], soccer: [-18, -18], softball: [18, -18], frisbee: [0, -18], volleyball: [12, -18],
};

type Props = {
  buildings: BuildingWithPhoto[];
  sports: SportMarkerConfig[];
  gamesBySport: Map<string, VisibleGame>;
  scheduleActive: boolean;
  scheduleError: string | null;
  selectedId: string | null;
  selectedSportId: string | null;
  onSelect: (id: string) => void;
  onSelectSport: (id: string) => void;
  onClearSelection: () => void;
  zoom: number;
};

export default function SchematicCampusMap({ buildings, sports, gamesBySport, scheduleActive, scheduleError, selectedId, selectedSportId, onSelect, onSelectSport, onClearSelection, zoom }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: number; x: number; y: number; left: number; top: number; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);
  const [viewportSize, setViewportSize] = useState({ width: 1000, height: 600 });
  const [dragging, setDragging] = useState(false);
  const canvasWidth = Math.min(viewportSize.width, viewportSize.height * WIDTH / HEIGHT) * zoom;
  const canvasHeight = canvasWidth * HEIGHT / WIDTH;
  const venuePoints = buildings.flatMap((building) => {
    const point = VENUE_LABEL_POSITIONS[building.id] ?? CAMPUS_ANCHORS[building.id];
    return point ? [{ building, venue: EVENT_VENUES[building.id], x: point[0], y: point[1] - TOP }] : [];
  });
  const sportPoints = useMemo(() => sports.flatMap((sport) => {
    const venueId = gamesBySport.get(sport.id)?.game.venueId ?? sport.venueId;
    const venue = buildings.find((building) => building.id === venueId);
    const center = CAMPUS_FOOTPRINTS.find((footprint) => footprint.id === venueId)?.center ?? CAMPUS_ANCHORS[venueId];
    const offset = SPORT_OFFSETS[sport.id] ?? [0, -18];
    const position = venueId === sport.venueId || !center ? sport.schematicPosition : [center[0] + offset[0], center[1] + offset[1]];
    return venue ? [{ sport, venue, x: position[0], y: position[1] - TOP }] : [];
  }), [sports, buildings, gamesBySport]);
  const shortcuts = sportPoints.map(({ sport, venue }) => ({ id: sport.id, label: `${sport.sport} · ${venue.name}`, icon: sport.icon }));

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(([entry]) => setViewportSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    const canvas = canvasRef.current;
    if (!viewport || !canvas) return;
    const sport = sportPoints.find((item) => item.sport.id === selectedSportId);
    const point = sport ? [sport.x, sport.y + TOP] : (selectedId ? CAMPUS_ANCHORS[selectedId] : undefined);
    const frame = requestAnimationFrame(() => {
      viewport.scrollTo({
        left: canvas.offsetLeft + ((point?.[0] ?? WIDTH / 2) / WIDTH) * canvas.clientWidth - viewport.clientWidth / 2,
        top: canvas.offsetTop + (((point?.[1] ?? TOP + HEIGHT / 2) - TOP) / HEIGHT) * canvas.clientHeight - viewport.clientHeight / 2,
        behavior: point ? 'smooth' : 'auto',
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [selectedId, selectedSportId, sportPoints, zoom, canvasWidth]);

  return (
    <section className="absolute inset-0 flex flex-col overflow-hidden bg-[#f6f2e8] text-[#35473f]" aria-label="Interactive 2D campus map">
      <header className="shrink-0 px-5 pb-2 pt-5 sm:px-8 sm:pt-6">
        <h1 className="font-score text-xl font-bold tracking-tight sm:text-2xl">Explore the campus grounds</h1>
        <p className="mt-1 text-xs text-[#798075]">Tap a sport icon or venue name to see its details.</p>
      </header>
      <div
        ref={viewportRef}
        className={`relative min-h-0 flex-1 touch-none overflow-auto overscroll-contain ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        aria-label="Scrollable 2D campus map"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          const movement: Record<string, [number, number]> = { ArrowLeft: [-80, 0], ArrowRight: [80, 0], ArrowUp: [0, -80], ArrowDown: [0, 80] };
          const delta = movement[event.key];
          if (delta) { event.preventDefault(); event.currentTarget.scrollBy({ left: delta[0], top: delta[1] }); }
        }}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          const viewport = event.currentTarget;
          suppressClickRef.current = false;
          dragRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop, moved: false };
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          if (!drag || drag.id !== event.pointerId) return;
          const dx = event.clientX - drag.x;
          const dy = event.clientY - drag.y;
          if (!drag.moved && Math.hypot(dx, dy) > 5) {
            drag.moved = true;
            suppressClickRef.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragging(true);
          }
          if (drag.moved) { event.currentTarget.scrollLeft = drag.left - dx; event.currentTarget.scrollTop = drag.top - dy; }
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          dragRef.current = null;
          setDragging(false);
        }}
        onPointerCancel={() => { dragRef.current = null; suppressClickRef.current = false; setDragging(false); }}
        onClickCapture={(event) => {
          if (suppressClickRef.current) { event.preventDefault(); event.stopPropagation(); suppressClickRef.current = false; }
        }}
        onClick={onClearSelection}
      >
        <div className="grid min-h-full min-w-full place-items-center" style={{ width: canvasWidth, height: canvasHeight }}>
          <div ref={canvasRef} className="relative shrink-0 select-none" style={{ width: canvasWidth, height: canvasHeight }}>
            <svg viewBox={`0 ${TOP} ${WIDTH} ${HEIGHT}`} className="absolute inset-0 size-full" aria-hidden="true">
              <defs>
                <pattern id="field-stripes" width="24" height="80" patternUnits="userSpaceOnUse"><rect width="12" height="80" fill="#fff" opacity=".07" /></pattern>
                <pattern id="roof-lines" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M 0 0 V 5" stroke="#6b766b" strokeWidth=".3" opacity=".2" /></pattern>
              </defs>
              <path d="M 492 160 L 551 390" fill="none" stroke="#e6e0d2" strokeWidth="12" />
              <path d="M 492 160 L 551 390" fill="none" stroke="#fdfbf5" strokeWidth=".7" strokeDasharray="5 4" />
              <text x="532" y="245" fontSize="4.4" fill="#928b7b" letterSpacing="1.3" transform="rotate(75 532 245)">CORRALES AVENUE</text>
              <polygon points={CAMPUS_OUTLINE} fill="#e4ead9" stroke="#b1bda5" strokeWidth="1.5" strokeLinejoin="round" />

              {/* Pedestrian corridors follow gaps between the reference footprints. */}
              <g fill="none" stroke="#fbf8ee" strokeLinecap="round" strokeLinejoin="round">
                <path d="M 490 231 H 382 L 380 247 H 296 L 291 184" strokeWidth="9" />
                <path d="M 293 248 L 153 252 L 145 202 M 151 251 L 202 296" strokeWidth="6" />
                <path d="M 322 249 V 288 L 397 316 L 431 359" strokeWidth="7" />
                <path d="M 387 239 L 389 278 L 500 278 M 77 289 L 145 249" strokeWidth="6" />
                <path d="M 160 283 L 257 283 L 262 295" strokeWidth="5" />
              </g>

              {CAMPUS_FOOTPRINTS.map((footprint) => {
                const enabled = venuePoints.some(({ building }) => building.id === footprint.id);
                const selected = selectedId === footprint.id;
                return (
                  <g key={footprint.id} data-campus-building={footprint.id}>
                    <title>{footprint.name}</title>
                    <polygon
                      data-venue-region={enabled ? footprint.id : undefined}
                      points={footprint.points}
                      fill={footprint.kind ? FILLS[footprint.kind] : '#dcd7c7'}
                      stroke={selected ? '#29396e' : footprint.kind === 'field' ? '#91ae79' : '#a6ac9b'}
                      strokeWidth={selected ? 2 : 1}
                      strokeLinejoin="round"
                      className={enabled ? 'cursor-pointer transition-colors hover:stroke-[#29396e]' : ''}
                      onClick={enabled ? (event) => { event.stopPropagation(); onSelect(footprint.id); } : undefined}
                    />
                    {!footprint.kind && <polygon points={footprint.points} fill="url(#roof-lines)" pointerEvents="none" />}
                    {footprint.lines.length > 0 && (
                      <text x={footprint.center[0]} y={footprint.center[1] - (footprint.lines.length - 1) * 3.2 + 1.8} textAnchor="middle" fontSize={['religious-of-the-assumption', 'physical-plant-workshop', 'physical-plant-offices'].includes(footprint.id) ? 3.4 : 5.2} fontWeight="600" letterSpacing=".1" fill="#4b574d" pointerEvents="none">
                        {footprint.lines.map((line, index) => <tspan key={line} x={footprint.center[0]} dy={index === 0 ? 0 : 6.4}>{line}</tspan>)}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Sports markings stay inside the three reference footprints. */}
              <g pointerEvents="none">
                <polygon points="174,186 282,183 282,252 160,252" fill="url(#field-stripes)" />
                <g fill="none" stroke="#f6faee" strokeWidth="1.1">
                  <path d="M 179 191 L 276 189 L 276 246 L 168 246 Z M 222 190 V 246" />
                  <circle cx="222" cy="218" r="11" />
                  <path d="M 174 207 H 190 V 232 H 171 M 276 205 H 258 V 232 H 276" />
                  <path d="M 177 212 H 183 V 226 H 174 M 276 211 H 267 V 226 H 276" />
                </g>
                <g transform="translate(241 319) rotate(39)" fill="none" stroke="#f6fafb" strokeWidth="1">
                  <rect x="-23" y="-18" width="46" height="36" /><path d="M 0 -18 V 18 M -8 -18 V 18 M 8 -18 V 18" />
                </g>
                <g fill="none" stroke="#f8f3e8" strokeWidth="1">
                  <path d="M 449 317 H 504 L 518 362 H 449 Z M 480 317 V 362" />
                  <ellipse cx="482" cy="340" rx="8" ry="9" />
                  <path d="M 449 329 H 460 V 350 H 449 M 507 329 H 496 V 350 H 514" />
                </g>
              </g>
              <g fill="#786e58" fontSize="4" fontWeight="700" letterSpacing=".4">
                <path d="M 481 227 L 493 227 M 481 235 L 495 235" stroke="#a28f6f" strokeWidth="2" />
                <text x="493" y="244" textAnchor="middle">MAIN GATE</text>
                <text x="464" y="231" fontSize="3" textAnchor="middle">COVERED WALK</text>
                <text x="35" y="190" textAnchor="middle" fontSize="3.5">MORTOLA GATE 2</text>
                <path d="M 20 227 L 24 236" stroke="#a28f6f" strokeWidth="2" />
                <text x="73" y="302" textAnchor="middle" fontSize="3.5">MORTOLA GATE 1</text>
                <path d="M 66 286 L 72 293" stroke="#a28f6f" strokeWidth="2" />
              </g>
            </svg>

            {venuePoints.map(({ building, venue, x, y }) => {
              const active = building.id === selectedId;
              return (
                <button
                  key={building.id}
                  type="button"
                  aria-label={`Open ${building.name} venue details`}
                  aria-pressed={active}
                  onClick={(event) => { event.stopPropagation(); onSelect(building.id); }}
                  className={`font-score-upright absolute z-[1] flex min-h-8 min-w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md px-1 text-center text-[8px] font-extrabold leading-tight text-[#364b3c] focus-visible:outline focus-visible:outline-4 focus-visible:outline-brand sm:text-[10px] ${active ? 'bg-white/80 underline' : 'hover:bg-white/60'}`}
                  style={{ left: `${x / WIDTH * 100}%`, top: `${y / HEIGHT * 100}%` }}
                >
                  {venue?.label ?? building.name}
                </button>
              );
            })}
            {sportPoints.map(({ sport, venue, x, y }) => (
              <button
                key={sport.id}
                type="button"
                aria-label={`Open ${sport.sport} sport details at ${venue.name}`}
                aria-pressed={selectedSportId === sport.id}
                onClick={(event) => { event.stopPropagation(); onSelectSport(sport.id); }}
                className="group absolute z-[2] flex min-h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 rounded-xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-brand"
                style={{ left: `${x / WIDTH * 100}%`, top: `${y / HEIGHT * 100}%` }}
              >
                <Image src={`/icons/sports/${sport.icon}.svg`} alt="" draggable={false} width={48} height={48} unoptimized className={`size-9 drop-shadow-md transition-transform group-hover:scale-110 sm:size-12 ${selectedSportId === sport.id ? 'scale-110' : ''}`} />
                <span className="font-score-upright hidden rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-slate-800 shadow-sm ring-1 ring-black/5 sm:inline">{sport.sport}{gamesBySport.get(sport.id) ? ` · ${gamesBySport.get(sport.id)?.status}` : ''}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <footer className="shrink-0 border-t border-[#e6e1d4] bg-[#f9f6ef] px-5 pb-5 pt-3 sm:px-8 sm:py-4">
        <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-[#7b806f]">Intramurals sports<span className="ml-1 normal-case tracking-normal text-[#929587]">· Drag to pan, + / − to zoom</span></div>
        <div className="flex flex-col gap-1 pr-14 sm:flex-row sm:flex-wrap sm:gap-3 sm:pr-16">
          {shortcuts.map(({ id, label, icon }) => (
            <button key={id} type="button" onClick={() => onSelectSport(id)} aria-pressed={selectedSportId === id} className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 py-1 text-left text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${selectedSportId === id ? 'border-[#a9b2cc] bg-[#e9edf7] text-[#29396e]' : 'border-transparent bg-white/70 text-[#53604e] hover:border-[#d5dacb] hover:bg-white'}`}>
              <Image src={`/icons/sports/${icon}.svg`} alt="" width={26} height={26} unoptimized className="size-7 object-contain" />
              <span>{label}{gamesBySport.get(id) ? ` · ${gamesBySport.get(id)?.status}` : ''}</span><svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="ml-auto size-4 text-[#9ca58e]"><path d="M 4 12 L 12 4 M 4 4 H 12 V 12" /></svg>
            </button>
          ))}
          {scheduleError && <p role="status" className="py-2 text-xs text-amber-800">Schedule unavailable: {scheduleError}</p>}
          {scheduleActive && shortcuts.length === 0 && !scheduleError && <p className="py-2 text-xs text-[#798075]">No games at mapped venues today.</p>}
        </div>
      </footer>
    </section>
  );
}
