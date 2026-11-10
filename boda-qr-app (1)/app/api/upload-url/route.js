import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getDb } from '@/utils/db';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://6352774975ad66aa32e2fee2e8002c8b.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: 6538c8c4572301bcd9c643de09864536 || '',
    secretAccessKey: ca709a1b9b6be0f1ae347f82adb01e831f036ef882cb180e70f383f49a4f7c6c || '',
  },
});

export async function POST(request) {
  try {
    const { filename, fileType } = await request.json();

    if (!filename || !fileType) {
      return NextResponse.json({ error: 'Faltan parámetros (filename, fileType)' }, { status: 400 });
    }

    const uniqueKey = `boda-${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: uniqueKey,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN}/${uniqueKey}`;
    const fileCategory = fileType.startsWith('video') ? 'video' : 'image';

    // Guardar referencia en SQLite
    const db = await getDb();
    await db.run(
      'INSERT INTO media (url, type) VALUES (?, ?)',
      [publicUrl, fileCategory]
    );

    return NextResponse.json({ uploadUrl, publicUrl, key: uniqueKey });
  } catch (error) {
    console.error('Error generando URL de subida:', error);
    return NextResponse.json({ error: 'Error al generar URL de subida' }, { status: 500 });
  }
}
