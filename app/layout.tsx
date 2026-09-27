import type { Metadata, Viewport } from 'next';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@fontsource/barlow/latin-400.css';
import '@fontsource/barlow/latin-600.css';
import '@fontsource/barlow/latin-700.css';
import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-700.css';
import './globals.css';

import ThemeProvider from '@/components/theme/ThemeProvider';
import { getTheme } from '@/lib/themes';
import { themeStyleSheet } from '@/lib/themes/css';
import { themeInitScript } from '@/lib/themes/init-script';

export const metadata: Metadata = {
  title: 'XU Campus Map — Xavier University Ateneo de Cagayan',
  description:
    'Explore intramurals venues on the Xavier University Main Campus in 2D and 3D.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  // Uses the default theme; the browser reads this before any script runs
  themeColor: getTheme(null).colors.brand,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Suppress hydration warning for data-theme set by pre-paint script.
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Defines colors for all themes */}
        <style dangerouslySetInnerHTML={{ __html: themeStyleSheet() }} />
        {/* Loads stored theme before the page paints */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript() }} />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
