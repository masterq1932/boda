import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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

    const mediaList = await Promise.all(
      contents.map(async (item, index) => {
        const isVideo = item.Key.match(/\.(mp4|mov|webm|avi|mkv)$/i) || item.Key.includes('video');
        
        // Generar enlace firmado de lectura directo desde Cloudflare R2
        const getCommand = new GetObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: item.Key,
        });
        const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 86400 });

        return {
          id: item.Key || index,
          url: signedUrl,
          type: isVideo ? 'video' : 'image',
          lastModified: item.LastModified,
        };
      })
    );

    mediaList.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

    return NextResponse.json(mediaList);
  } catch (error) {
    console.error('Error al listar archivos de R2:', error);
    return NextResponse.json({ error: 'Error al consultar la galería' }, { status: 500 });
  }
}
