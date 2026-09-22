import { MetadataRoute } from 'next';
import prisma from '../lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://14kmovie.com';

  let movies: { slug: string; updatedAt: Date }[] = [];
  try {
    movies = await prisma.movie.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.warn("⚠️ Sitemap database query timed out during build, skipping movies list.");
  }

  const movieUrls = movies.map((movie: { slug: string; updatedAt: Date }) => ({
    url: `${baseUrl}/movie/${movie.slug}`,
    lastModified: movie.updatedAt || new Date(),
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...movieUrls,
  ];
}