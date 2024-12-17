import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { lastFmClient } from '../../lib/lastfm';
import { useLastFm } from '../../contexts/LastFmContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const LastFmStats: React.FC = () => {
  const { username, stats } = useLastFm();

  const { data: topArtists, isLoading: isLoadingArtists } = useQuery({
    queryKey: ['lastfm-top-artists', username],
    queryFn: async () => {
      if (!username) return [];
      return await lastFmClient.getTopArtists('1month', 10);
    },
    enabled: !!username,
  });

  if (!stats) {
    return null;
  }

  if (isLoadingArtists) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const artistData = {
    labels: topArtists?.map(artist => artist.name) || [],
    datasets: [
      {
        label: 'Playcount',
        data: topArtists?.map(artist => parseInt(artist.playcount)) || [],
        backgroundColor: 'hsl(var(--primary) / 0.5)',
        borderColor: 'hsl(var(--primary))',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Top Artists This Month',
        color: 'hsl(var(--foreground))',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'hsl(var(--muted-foreground))',
        },
        grid: {
          color: 'hsl(var(--border) / 0.2)',
        },
      },
      y: {
        ticks: {
          color: 'hsl(var(--muted-foreground))',
        },
        grid: {
          color: 'hsl(var(--border) / 0.2)',
        },
      },
    },
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Scrobbles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              {stats.playcount.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Unique Artists</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              {stats.artist_count.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Unique Tracks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              {stats.track_count.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Bar options={options} data={artistData} />
        </CardContent>
      </Card>
    </div>
  );
};
