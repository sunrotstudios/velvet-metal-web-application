import { NormalizedAlbum, Playlist } from '@/lib/types';

export function convertAlbumsToCSV(albums: NormalizedAlbum[]): string {
  const headers = ['Name', 'Artist', 'Release Date', 'Track Count', 'Service'];
  const rows = albums.map((album) => [
    `"${album.name.replace(/"/g, '""')}"`,
    `"${album.artistName.replace(/"/g, '""')}"`,
    album.releaseDate,
    album.trackCount.toString(),
    album.sourceService,
  ]);

  return [headers, ...rows].map((row) => row.join(',')).join('\n');
}

export function convertPlaylistsToCSV(playlists: Playlist[]): string {
  const headers = ['Name', 'Track Count'];
  const rows = playlists.map((playlist) => [
    `"${(playlist.name || playlist.attributes?.name || '').replace(
      /"/g,
      '""'
    )}"`,
    (playlist.tracks?.total || playlist.attributes?.trackCount || 0).toString(),
  ]);

  return [headers, ...rows].map((row) => row.join(',')).join('\n');
}

export function downloadFile(
  content: string,
  filename: string,
  type: 'csv' | 'json'
) {
  const blob = new Blob([content], {
    type: type === 'csv' ? 'text/csv' : 'application/json',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
