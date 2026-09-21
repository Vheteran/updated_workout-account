import { localTiktokFeed, TIKTOK_FEED_URL } from '../data/tiktok';

export async function loadTiktokFeed() {
  if (!TIKTOK_FEED_URL) {
    return { ...localTiktokFeed, source: 'local' };
  }

  try {
    const response = await fetch(TIKTOK_FEED_URL, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('feed failed');
    const json = await response.json();
    if (!Array.isArray(json.videos)) throw new Error('invalid feed');
    return {
      updatedAt: json.updatedAt || new Date().toISOString(),
      videos: json.videos,
      source: 'remote',
    };
  } catch {
    return { ...localTiktokFeed, source: 'local' };
  }
}
