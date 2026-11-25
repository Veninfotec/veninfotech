import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LiveScoresDashboard from '@/components/live-scores/LiveScoresDashboard';

export const metadata: Metadata = {
  title: 'Live Scores • Real-Time Cricket & Football Scoreboard',
  description:
    'Follow live cricket and football scores, ball-by-ball scorecards, matchday results, and real-time fixture updates on Veninfotech.',
  alternates: {
    canonical: '/live-scores',
  },
  openGraph: {
    title: 'Live Scores • Real-Time Cricket & Football Scoreboard | Veninfotech',
    description:
      'Auto-updating live cricket and football scoreboards, match statistics, and fixture updates on Veninfotech.',
    url: 'https://veninfotech.net/live-scores',
    siteName: 'Veninfotech',
    type: 'website',
  },
};

export default function LiveScoresPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col selection:bg-[#1365A4] selection:text-white">
      <Navbar />

      <main className="flex-1 flex flex-col">
        <LiveScoresDashboard />
      </main>

      <Footer />
    </div>
  );
}

