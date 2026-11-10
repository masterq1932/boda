import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getDb } from '@/utils/db';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
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
