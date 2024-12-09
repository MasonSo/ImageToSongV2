const LASTFM_API_KEY = '3a290b8020f4150b560e66d6f01e9b98'; // Your Last.fm API Key
const LASTFM_API_BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

// Genre mapping based on color and emotion
const tagGroups = {
    happy: ['indie', 'pop', 'soul', 'funk'],
    energetic: ['rock', 'electronic', 'dance', 'hip-hop'],
    warm: ['indie rock', 'soul', 'latin', 'pop'],
    chill: ['lo-fi', 'chillout', 'downtempo', 'jazz'],
    calm: ['ambient', 'acoustic', 'folk', 'classical'],
    sad: ['ambient', 'acoustic', 'classical', 'folk'],
    reflective: ['indie', 'classical', 'ambient', 'experimental'],
    neutral: ['classical', 'ambient', 'experimental', 'indie'],
    melancholy: ['acoustic', 'ambient', 'classical', 'folk']
};

// Function to fetch song recommendations based on vibe
export async function fetchSongRecommendations(vibe) {
    const tags = tagGroups[vibe] || ['world', 'experimental', 'indie'];
    const trackPool = [];
    const maxPages = 10; // Increase to fetch more pages
    const tracksPerPage = 50; // Fetch more tracks per page (if Last.fm allows)

    try {
        for (const tag of tags) {
            for (let page = 1; page <= maxPages; page++) {
                // Modify the request to send parameters as query parameters
                const url = new URL(LASTFM_API_BASE_URL);
                url.searchParams.append('method', 'tag.gettoptracks');
                url.searchParams.append('tag', tag);
                url.searchParams.append('limit', tracksPerPage);
                url.searchParams.append('page', page);
                url.searchParams.append('api_key', LASTFM_API_KEY);
                url.searchParams.append('format', 'json');

                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();

                if (data.tracks?.track) {
                    trackPool.push(...data.tracks.track);
                }
            }
        }

        console.log(`Fetched ${trackPool.length} tracks for vibe: ${vibe}`);

        const shuffledTracks = shuffleArray(trackPool);

        return shuffledTracks.map(track => ({
            name: track.name,
            artist: track.artist.name,
            url: track.url,
        }));
    } catch (error) {
        console.error('Error fetching recommendations:', error.message);
        return [];
    }
}

// Utility function to shuffle an array (for random song selection)
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap
    }
    return arr;
}
