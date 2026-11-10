import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export async function GET() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
    });

    const response = await s3Client.send(command);
    const contents = response.Contents || [];

    const mediaList = contents.map((item, index) => {
      const isVideo = item.Key.match(/\.(mp4|mov|webm|avi|mkv)$/i) || item.Key.includes('video');
      return {
        id: item.Key || index,
        url: `${process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN}/${item.Key}`,
        type: isVideo ? 'video' : 'image',
      };
    }).reverse();

    return NextResponse.json(mediaList);
  } catch (error) {
    console.error('Error al listar archivos de R2:', error);
    return NextResponse.json({ error: 'Error al consultar la galería' }, { status: 500 });
  }
}
