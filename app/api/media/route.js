import { NextResponse } from 'next/server';
import { getDb } from '@/utils/db';

export async function GET() {
  try {
    const db = await getDb();
    const mediaList = await db.all('SELECT * FROM media ORDER BY id DESC');
    return NextResponse.json(mediaList);
  } catch (error) {
    console.error('Error obteniendo medios:', error);
    return NextResponse.json({ error: 'Error al consultar la galería' }, { status: 500 });
  }
}
