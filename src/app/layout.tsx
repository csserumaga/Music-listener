import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Music Listener — Spotify Music Search',
  description: 'Search Spotify and listen without leaving the page.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
