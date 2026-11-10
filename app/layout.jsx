import './globals.css';

export const metadata = {
  title: 'Boda QR - Fotos y Videos',
  description: 'Sube y comparte tus fotos y videos de la boda',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased bg-stone-50 text-stone-800">{children}</body>
    </html>
  );
}
