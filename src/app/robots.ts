import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/debug/'],
    },
    sitemap: 'https://esperanza2k26.vercel.app/sitemap.xml',
  }
}
