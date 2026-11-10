import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (!key) {
    return NextResponse.json({ error: 'Falta la clave del archivo' }, { status: 400 });
  }

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });

    const file = await s3Client.send(command);
    const byteArray = await file.Body.transformToByteArray();
    const contentType = file.ContentType || 'application/octet-stream';
    
    // Generar un nombre de archivo limpio para la descarga
    const cleanFileName = key.replace(/^boda-\d+-/, '');

    return new NextResponse(byteArray, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${cleanFileName}"`,
      },
    });
  } catch (error) {
    console.error('Error al descargar archivo:', error);
    return NextResponse.json({ error: 'Error al procesar la descarga' }, { status: 500 });
  }
}
