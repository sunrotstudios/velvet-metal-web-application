import axios from 'axios';

const LASTFM_API_KEY = import.meta.env.VITE_LASTFM_API_KEY;
const LASTFM_API_BASE = 'https://ws.audioscrobbler.com/2.0/';

export interface LastFmTrack {
  name: string;
  artist: {
    name: string;
  };
  playcount: number;
  image: { size: string; '#text': string }[];
}

export interface LastFmStats {
  playcount: number;
  artist_count: number;
  track_count: number;
}

export class LastFmClient {
  private username: string | null = null;

  setUsername(username: string) {
    this.username = username;
  }

  async getRecentTracks(limit: number = 50, page: number = 1) {
    if (!this.username) throw new Error('Username not set');
    
    const response = await axios.get(LASTFM_API_BASE, {
      params: {
        method: 'user.getrecenttracks',
        user: this.username,
        api_key: LASTFM_API_KEY,
        format: 'json',
        limit,
        page,
      },
    });

    return response.data.recenttracks.track;
  }

  async getTopArtists(period: 'overall' | '7day' | '1month' | '3month' | '6month' | '12month' = 'overall', limit: number = 10) {
    if (!this.username) throw new Error('Username not set');

    const response = await axios.get(LASTFM_API_BASE, {
      params: {
        method: 'user.gettopartists',
        user: this.username,
        api_key: LASTFM_API_KEY,
        format: 'json',
        period,
        limit,
      },
    });

    return response.data.topartists.artist;
  }

  async getUserInfo() {
    if (!this.username) throw new Error('Username not set');

    const response = await axios.get(LASTFM_API_BASE, {
      params: {
        method: 'user.getinfo',
        user: this.username,
        api_key: LASTFM_API_KEY,
        format: 'json',
      },
    });

    return response.data.user;
  }
}

export const lastFmClient = new LastFmClient();
