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
    <html lang="en">
      <head>
        {/* the Hindi headings and lines (the guest can switch the invitation to Hindi in the corner menu) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
