import React from 'react';
import { useLastFm } from '../contexts/LastFmContext';
import { LastFmConnect } from '../components/LastFm/LastFmConnect';
import { LastFmStats } from '../components/LastFm/LastFmStats';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const LastFmDashboard: React.FC = () => {
  const { username, setUsername, isLoading } = useLastFm();

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="h-[400px] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Last.fm Dashboard</h1>
        {username && (
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Connected as</p>
              <p className="font-medium">{username}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setUsername('')}
            >
              Disconnect
            </Button>
          </div>
        )}
      </div>
      
      {!username ? (
        <LastFmConnect />
      ) : (
        <LastFmStats />
      )}
    </div>
  );
};

export default LastFmDashboard;
