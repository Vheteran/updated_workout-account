// Host a JSON file (GitHub gist raw URL, Firebase, or your backend)
// with the same shape as localTiktokFeed. Leave empty to use the local list.
export const TIKTOK_FEED_URL = '';

export const localTiktokFeed = {
  updatedAt: '2026-09-18',
  videos: [
    {
      id: 'mobility-reset',
      title: '3-minute mobility reset',
      creator: '@lyftn',
      url: 'https://www.tiktok.com/tag/mobilityworkout',
      programId: 'three-days-mobility',
      tags: ['mobility'],
    },
    {
      id: 'core-finisher',
      title: 'Core finisher at home',
      creator: '@lyftn',
      url: 'https://www.tiktok.com/tag/coreworkout',
      programId: 'abdomen-40',
      tags: ['core'],
    },
    {
      id: 'beginner-full',
      title: 'Beginner full body, no gym',
      creator: '@lyftn',
      url: 'https://www.tiktok.com/tag/homeworkout',
      programId: 'at-home',
      tags: ['beginner', 'home'],
    },
  ],
};
