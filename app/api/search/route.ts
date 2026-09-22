import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  if (!query.trim()) {
    return NextResponse.json([]);
  }

  try {
    const movies = await prisma.movie.findMany({
      where: {
        title: { contains: query, mode: 'insensitive' },
      },
      take: 5,
      select: {
        slug: true,
        title: true,
        posterUrl: true,
        year: true,
      },
    });

    return NextResponse.json(movies);
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json([], { status: 500 });
  }
}