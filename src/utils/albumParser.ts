// src/utils/albumParser.ts
export interface Album {
  name: string;
  artist_name: string;
}

export const parseAlbumsFromCSV = async (): Promise<Album[]> => {
  try {
    const response = await fetch("/data/marquee-albums.csv");
    const csvText = await response.text();

    // Skip header row and split into lines
    const lines = csvText.split("\n").slice(1);

    return lines
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const columns = line.split(",");
        return {
          name: columns[4]?.replace(/"/g, "").trim() || "",
          artist_name: columns[5]?.replace(/"/g, "").trim() || "",
        };
      })
      .filter((album) => album.name && album.artist_name);
  } catch (error) {
    console.error("Error parsing albums:", error);
    return [];
  }
};

export const getRandomAlbums = (albums: Album[], count: number): Album[] => {
  const shuffled = [...albums].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
