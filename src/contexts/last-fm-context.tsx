import React, { createContext, useContext, useState, useEffect } from 'react';
import { lastFmClient, LastFmStats } from '../lib/lastfm';
import { useQuery } from '@tanstack/react-query';

interface LastFmContextType {
  username: string | null;
  setUsername: (username: string) => void;
  stats: LastFmStats | null;
  isLoading: boolean;
  error: string | null;
}

const LastFmContext = createContext<LastFmContextType | undefined>(undefined);

export const LastFmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [username, setUsername] = useState<string | null>(localStorage.getItem('lastfm_username'));

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['lastfm', username],
    queryFn: async () => {
      if (!username) return null;
      try {
        lastFmClient.setUsername(username);
        return await lastFmClient.getUserInfo();
      } catch (err) {
        console.error('Failed to fetch Last.fm stats:', err);
        throw new Error('Failed to fetch Last.fm stats');
      }
    },
    enabled: !!username,
  });

  useEffect(() => {
    if (username) {
      localStorage.setItem('lastfm_username', username);
      lastFmClient.setUsername(username);
    } else {
      localStorage.removeItem('lastfm_username');
    }
  }, [username]);

  return (
    <LastFmContext.Provider 
      value={{ 
        username, 
        setUsername, 
        stats: stats || null,
        isLoading,
        error: error ? (error as Error).message : null,
      }}
    >
      {children}
    </LastFmContext.Provider>
  );
};

export const useLastFm = () => {
  const context = useContext(LastFmContext);
  if (context === undefined) {
    throw new Error('useLastFm must be used within a LastFmProvider');
  }
  return context;
};
