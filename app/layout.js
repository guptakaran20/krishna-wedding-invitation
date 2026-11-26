import 'lenis/dist/lenis.css';
import './globals.css';

export const metadata = {
  title: 'Sheshank & Sakshi · Wedding',
  description: 'An illustrated invitation to the wedding of Sheshank and Sakshi.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#e2af9c',
};

export default function RootLayout({ children }) {
  return (
    // art-hold: the sheet below the opening draws no CSS backgrounds until the opening's paintings are in
    // (lib/artLoader.js lifts it). The Hindi heading face (Tiro) is added by page.js once the page is up, so it never
    // blocks the first paint; the opening's own Devanagari face is local and preloaded here.
    <html lang="en" className="art-hold" suppressHydrationWarning>
      <head>
        {/* the opening's paintings first: the room, its curtains, the couple and the swing */}
        <link rel="preload" as="image" type="image/webp" href="/art/room-bg.webp" fetchPriority="high" />
        <link rel="preload" as="image" type="image/webp" href="/art/curtain-left.webp" fetchPriority="high" />
        <link rel="preload" as="image" type="image/webp" href="/art/curtain-right.webp" fetchPriority="high" />
        <link rel="preload" as="font" type="font/woff2" href="/fonts/noto-sans-devanagari-500.woff2" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>{children}</body>
    </html>
  );
}
