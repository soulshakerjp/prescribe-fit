import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PRESCRIBE FIT',
    short_name: 'PRESCRIBE FIT',
    description: 'OpenAIが夕食と筋トレを提案するフィットネスWebアプリ',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#0891b2',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png'
      },
      {
        src: '/icons/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  };
}
