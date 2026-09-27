'use client';

import ViewModeToggle from './ViewModeToggle';

type Props = {
  mode: '2d' | '3d';
  onModeChange: (mode: '2d' | '3d') => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
};

// Bottom-right cluster of map controls.
const DOCK = 'absolute bottom-6 right-3 z-10 flex flex-col items-end gap-2 sm:bottom-8 sm:right-4';

// Shared floating card style
const FLOATING = 'rounded-lg shadow-md ring-1 ring-black/10';

// Zoom buttons share one rounded card
const ZOOM_GROUP = `flex flex-col overflow-hidden ${FLOATING}`;

// Divider between zoom in/out buttons
const ZOOM_DIVIDER = 'border-b border-slate-200';

// 40px thumb-friendly buttons with hover and focus states
const BUTTON = [
  'grid size-10 place-items-center',
  'bg-white text-slate-700',
  'transition hover:bg-slate-100',
  'focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand',
  'disabled:cursor-default disabled:text-slate-300 disabled:hover:bg-white',
].join(' ');

// Map controls: view mode and zoom.
export default function ControlDock({
  mode,
  onModeChange,
  onZoomIn,
  onZoomOut,
  canZoomIn,
  canZoomOut,
}: Props) {
  return (
    <div className={DOCK}>
      <ViewModeToggle mode={mode} onChange={onModeChange} />

      <div className={ZOOM_GROUP}>
        <button
          type="button"
          onClick={onZoomIn}
          disabled={!canZoomIn}
          aria-label="Zoom in"
          className={`${BUTTON} ${ZOOM_DIVIDER}`}
        >
          <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
            <path d="M10 4.5v11M4.5 10h11" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onZoomOut}
          disabled={!canZoomOut}
          aria-label="Zoom out"
          className={BUTTON}
        >
          <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
            <path d="M4.5 10h11" />
          </svg>
        </button>
      </div>
    </div>
  );
}
