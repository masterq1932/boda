import QRCode from 'qrcode';

const url = process.argv[2] || 'https://tu-boda.vercel.app';

QRCode.toString(url, { type: 'terminal', small: true }, (err, qr) => {
  if (err) console.error(err);
  console.log('\nEscanea este código QR para acceder a la app de la boda:\n');
  console.log(qr);
  console.log(`\nURL configurada: ${url}\n`);
});
