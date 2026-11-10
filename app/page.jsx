'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [uploading, setUploading] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [mediaList, setMediaList] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchMedia();
    const interval = setInterval(fetchMedia, 5000); // Polling cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        setMediaList(data || []);
      }
    } catch (err) {
      console.error('Error cargando medios:', err);
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgressText(`Subiendo ${i + 1} de ${files.length}: ${file.name}`);

      try {
        const res = await fetch('/api/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, fileType: file.type }),
        });

        if (!res.ok) throw new Error('No se pudo obtener la URL de subida');
        const { uploadUrl } = await res.json();

        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        if (!uploadRes.ok) throw new Error('Fallo al subir archivo a Cloudflare R2');

        successCount++;
      } catch (err) {
        console.error(`Error al subir ${file.name}:`, err);
      }
    }

    setUploading(false);
    setProgressText('');
    e.target.value = null;

    if (successCount > 0) {
      fetchMedia();
      alert(`¡${successCount} archivo(s) subido(s) con éxito!`);
    }
  };

  return (
    <main className="min-h-screen bg-stone-50 text-stone-800 pb-20">
      {/* Encabezado */}
      <header className="bg-stone-900 text-stone-100 py-10 px-4 text-center shadow-md">
        <h1 className="font-serif text-3xl md:text-4xl tracking-wide mb-2">Recuerdos de la Boda</h1>
        <p className="text-stone-400 text-sm md:text-base font-light">Comparte tus fotos y videos favoritos de la celebración</p>
      </header>

      {/* Selector de Archivos */}
      <div className="max-w-2xl mx-auto px-4 mt-8">
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm text-center">
          <label className="block w-full cursor-pointer bg-stone-900 hover:bg-stone-800 text-white font-medium py-4 px-6 rounded-xl transition duration-200 shadow hover:shadow-md">
            <span>📷 Subir Fotos y Videos 🎥</span>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          <p className="text-xs text-stone-500 mt-3">Puedes seleccionar múltiples archivos a la vez.</p>

          {uploading && (
            <div className="mt-4 p-3 bg-stone-100 rounded-lg text-sm text-stone-700 animate-pulse">
              {progressText}
            </div>
          )}
        </div>
      </div>

      {/* Galería del Evento */}
      <div className="max-w-6xl mx-auto px-4 mt-10">
        <h2 className="font-serif text-2xl text-stone-700 mb-6 border-b border-stone-200 pb-2">Galería del Evento</h2>

        {loadingMedia ? (
          <div className="text-center py-12 text-stone-400">Cargando recuerdos...</div>
        ) : mediaList.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-stone-300 text-stone-400">
            Aún no hay fotos ni videos. ¡Sé el primero en subir un recuerdo!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {mediaList.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="relative group aspect-square bg-stone-200 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition"
              >
                {item.type === 'video' ? (
                  <div className="w-full h-full relative bg-black flex items-center justify-center">
                    <video
                      src={`${item.url}#t=0.001`}
                      className="w-full h-full object-cover opacity-90"
                      muted
                      preload="metadata"
                      playsInline
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition">
                      <span className="bg-white/80 rounded-full p-3 text-stone-900 shadow">▶</span>
                    </div>
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt="Foto de la boda"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Previsualización y Descarga 1 a 1 */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute -top-10 right-0 text-white text-xl font-bold px-3 py-1 bg-white/20 rounded-full hover:bg-white/40 transition"
            >
              ✕ Cerrar
            </button>

            {selectedItem.type === 'video' ? (
              <video src={selectedItem.url} controls autoPlay className="max-h-[80vh] w-auto rounded-lg shadow-2xl" />
            ) : (
              <img src={selectedItem.url} alt="Vista previa" className="max-h-[80vh] w-auto object-contain rounded-lg shadow-2xl" />
            )}

            <a
              href={`/api/download?key=${encodeURIComponent(selectedItem.id)}`}
              download
              className="mt-4 bg-white text-stone-900 font-medium px-6 py-2 rounded-full shadow hover:bg-stone-100 transition flex items-center gap-2"
            >
              ⬇️ Descargar archivo
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
