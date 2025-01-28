import { supabase } from '@/lib/supabase';
import {
  addAlbumsToAppleMusicLibrary,
  checkAlbumsInLibrary,
  findAlbumsByUPC,
  findBestMatchingAlbum,
  searchAppleMusicCatalog,
} from '../api/apple-music';

export type TransferProgress = {
  current: number;
  total: number;
};

export type TransferLogger = (
  type: 'info' | 'success' | 'error',
  message: string
) => void;

type ServiceType = 'spotify' | 'apple-music';

export async function transferLibrary(
  userId: string,
  fromService: ServiceType,
  toService: ServiceType,
  tokens: {
    spotify_token?: string;
    apple_music_token?: string;
  },
  onProgress: (progress: TransferProgress) => void,
  logger: TransferLogger
) {
  console.log('Starting transfer library process:', {
    userId,
    fromService,
    toService,
    hasSpotifyToken: !!tokens.spotify_token,
    hasAppleMusicToken: !!tokens.apple_music_token,
  });

  if (fromService === 'spotify' && toService === 'apple-music') {
    if (!tokens.apple_music_token) {
      console.error('Missing Apple Music token');
      throw new Error('Apple Music token is required for this transfer');
    }
    return await transferSpotifyToAppleMusic(
      userId,
      tokens.apple_music_token,
      onProgress,
      logger
    );
  } else {
    throw new Error('This transfer direction is not yet implemented');
  }
}

async function transferSpotifyToAppleMusic(
  userId: string,
  appleMusicToken: string,
  onProgress: (progress: TransferProgress) => void,
  logger: TransferLogger
) {
  // First, get the total count
  const { count, error: countError } = await supabase
    .from('user_albums')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('service', 'spotify');

  if (countError) {
    throw new Error(`Failed to get album count: ${countError.message}`);
  }

  if (!count || count === 0) {
    logger('info', 'No albums found to transfer');
    return { successCount: 0, failureCount: 0 };
  }

  // Fetch all albums in pages
  const pageSize = 1000;
  const totalPages = Math.ceil(count / pageSize);
  let allAlbums: any[] = [];

  for (let page = 0; page < totalPages; page++) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data: albums, error } = await supabase
      .from('user_albums')
      .select('*')
      .eq('user_id', userId)
      .eq('service', 'spotify')
      .order('added_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(
        `Failed to fetch albums page ${page + 1}: ${error.message}`
      );
    }

    if (albums) {
      allAlbums = [...allAlbums, ...albums];
    }

    logger(
      'info',
      `Fetched page ${page + 1} of ${totalPages} (${
        allAlbums.length
      } albums so far)`
    );
  }

  logger(
    'info',
    `Starting transfer of ${allAlbums.length} albums from Spotify to Apple Music`
  );
  onProgress({ current: 0, total: allAlbums.length });

  // Create a transfer record
  const { data: transfer, error: transferError } = await supabase
    .from('transfers')
    .insert([
      {
        user_id: userId,
        source_service: 'spotify',
        destination_service: 'apple-music',
        status: 'in_progress',
        tracksCount: allAlbums.length,
        metadata: {
          total_albums: allAlbums.length,
          successful_transfers: 0,
          failed_transfers: 0,
        },
      },
    ])
    .select()
    .single();

  if (transferError) {
    throw new Error(
      `Failed to create transfer record: ${transferError.message}`
    );
  }

  let successCount = 0;
  let failureCount = 0;
  const foundAppleMusicIds: string[] = [];
  const albumsToAdd: { id: string; album: (typeof allAlbums)[0] }[] = [];

  try {
    // First, process all albums with UPCs in larger batches
    const albumsWithUpc = allAlbums.filter((album) => album.upc);
    const albumsWithoutUpc = allAlbums.filter((album) => !album.upc);

    if (albumsWithUpc.length > 0) {
      // Process UPC matches in larger batches
      const batchSize = 50; // Increased batch size for UPC matching
      for (let i = 0; i < albumsWithUpc.length; i += batchSize) {
        const batch = albumsWithUpc.slice(i, i + batchSize);
        const upcs = batch.map((album) => album.upc!);

        const upcMatches = await findAlbumsByUPC(upcs, appleMusicToken);

        // Get all matched IDs
        const matchedIds = Object.values(upcMatches).filter(
          (id) => id !== null
        ) as string[];

        if (matchedIds.length > 0) {
          // Check library status in bulk
          const existingAlbums = await checkAlbumsInLibrary(
            matchedIds,
            appleMusicToken
          );

          // Process results
          batch.forEach((album) => {
            const appleMusicId = upcMatches[album.upc!];
            if (appleMusicId) {
              if (existingAlbums[appleMusicId]) {
                successCount++;
                logger(
                  'info',
                  `Album "${album.name}" already in library (UPC)`
                );
              } else {
                foundAppleMusicIds.push(appleMusicId);
                albumsToAdd.push({ id: appleMusicId, album });
              }
            } else {
              albumsWithoutUpc.push(album);
            }
          });
        }

        onProgress({
          current: Math.min(i + batchSize, albumsWithUpc.length),
          total: allAlbums.length,
        });
      }
    }

    // Process remaining albums with text search in parallel
    if (albumsWithoutUpc.length > 0) {
      const searchBatchSize = 10;
      for (let i = 0; i < albumsWithoutUpc.length; i += searchBatchSize) {
        const batch = albumsWithoutUpc.slice(i, i + searchBatchSize);

        // Run searches in parallel
        const searchPromises = batch.map(async (album) => {
          try {
            const searchQuery = `${album.name} ${album.artist_name}`;
            const searchResults = await searchAppleMusicCatalog(
              searchQuery,
              appleMusicToken
            );
            const appleMusicId = findBestMatchingAlbum(searchResults, album);

            if (appleMusicId) {
              return { album, appleMusicId };
            }
          } catch (error) {
            logger(
              'error',
              `Search failed for "${album.name}": ${(error as Error).message}`
            );
          }
          return null;
        });

        const searchResults = await Promise.all(searchPromises);
        const validResults = searchResults.filter(
          (result) => result !== null
        ) as { album: any; appleMusicId: string }[];

        if (validResults.length > 0) {
          // Check library status in bulk
          const idsToCheck = validResults.map((r) => r.appleMusicId);
          const existingAlbums = await checkAlbumsInLibrary(
            idsToCheck,
            appleMusicToken
          );

          validResults.forEach(({ album, appleMusicId }) => {
            if (existingAlbums[appleMusicId]) {
              successCount++;
              logger(
                'info',
                `Album "${album.name}" already in library (search)`
              );
            } else {
              foundAppleMusicIds.push(appleMusicId);
              albumsToAdd.push({ id: appleMusicId, album });
            }
          });
        }

        failureCount += batch.length - validResults.length;

        onProgress({
          current:
            albumsWithUpc.length +
            Math.min(i + searchBatchSize, albumsWithoutUpc.length),
          total: allAlbums.length,
        });
      }
    }

    // Add all found albums to library in larger batches
    if (albumsToAdd.length > 0) {
      const addBatchSize = 50; // Increased batch size for adding to library
      for (let i = 0; i < albumsToAdd.length; i += addBatchSize) {
        const batch = albumsToAdd.slice(i, i + addBatchSize);
        const ids = batch.map((item) => item.id);

        try {
          await addAlbumsToAppleMusicLibrary(ids, appleMusicToken);
          successCount += batch.length;
          logger('success', `Added ${batch.length} albums to library`);
        } catch (error) {
          failureCount += batch.length;
          logger(
            'error',
            `Failed to add batch to library: ${(error as Error).message}`
          );
        }
      }
    }

    // Update transfer record
    const { error: updateError } = await supabase
      .from('transfers')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        metadata: {
          total_albums: allAlbums.length,
          successful_transfers: successCount,
          failed_transfers: failureCount,
        },
      })
      .eq('id', transfer.id);

    if (updateError) {
      throw new Error(
        `Failed to update transfer record: ${updateError.message}`
      );
    }

    logger(
      'success',
      `Transfer completed: ${successCount} successful, ${failureCount} failed`
    );
    return { successCount, failureCount };
  } catch (error) {
    // Update transfer record with error
    await supabase
      .from('transfers')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error: (error as Error).message,
        metadata: {
          total_albums: allAlbums.length,
          successful_transfers: successCount,
          failed_transfers: failureCount,
        },
      })
      .eq('id', transfer.id);

    throw error;
  }
}

export async function verifyTransfer(
  userId: string,
  appleMusicToken: string,
  logger: TransferLogger
) {
  console.log('Verifying transferred albums...');

  // Get the most recent transfer
  const { data: transfer, error: transferError } = await supabase
    .from('transfers')
    .select('*')
    .eq('user_id', userId)
    .eq('destination_service', 'apple-music')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (transferError) {
    console.error('Failed to get transfer record:', transferError);
    throw new Error(`Failed to get transfer record: ${transferError.message}`);
  }

  if (!transfer) {
    throw new Error('No recent transfer found');
  }

  // Get albums that were found during transfer
  const { data: albums, error: albumsError } = await supabase
    .from('user_albums')
    .select('*')
    .eq('user_id', userId)
    .eq('service', 'apple-music')
    .gte('created_at', transfer.created_at);

  if (albumsError) {
    console.error('Failed to get transferred albums:', albumsError);
    throw new Error(`Failed to get transferred albums: ${albumsError.message}`);
  }

  if (!albums || albums.length === 0) {
    logger('info', 'No transferred albums found to verify');
    return { total: 0, found: 0 };
  }

  // Check if albums exist in Apple Music library
  const albumIds = albums.map((album) => album.service_id);
  console.log(`Checking ${albumIds.length} albums in Apple Music library...`);

  const results = await checkAlbumsInLibrary(albumIds, appleMusicToken);

  const foundCount = Object.values(results).filter((exists) => exists).length;

  logger(
    'info',
    `Found ${foundCount} out of ${albumIds.length} albums in your Apple Music library`
  );

  // Log details of missing albums
  const missingAlbums = albums.filter((album) => !results[album.service_id]);
  if (missingAlbums.length > 0) {
    logger(
      'error',
      'The following albums may not have transferred successfully:'
    );
    missingAlbums.forEach((album) => {
      logger('error', `- "${album.name}" by ${album.artist_name}`);
    });
  }

  return {
    total: albumIds.length,
    found: foundCount,
    missingAlbums: missingAlbums.map((album) => ({
      name: album.name,
      artist: album.artist_name,
      id: album.service_id,
    })),
  };
}
