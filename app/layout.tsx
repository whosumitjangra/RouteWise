import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RouteWise - Multi-Modal Travel & Budget Comparison Engine',
  description: 'Deterministic multi-modal travel engine comparing Driving, Train, Rideshare, Bus, Flight, and Active modes side-by-side with GTFS precision and smart budgeting.',
  keywords: ['travel comparison', 'multi-modal routing', 'budget travel', 'transit timetable', 'rideshare cost comparison', 'OSRM', 'GTFS'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
