'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [uploading, setUploading] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [mediaList, setMediaList] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [filter, setFilter] = useState('all');
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchMedia();
    const interval = setInterval(fetchMedia, 5000);
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
          body: JSON.stringify({ 
            filename: file.name, 
            fileType: file.type,
            comment: comment.trim()
          }),
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
    setComment('');
    e.target.value = null;

    if (successCount > 0) {
      fetchMedia();
    }
  };

  const filteredMedia = mediaList.filter((item) => {
    if (filter === 'image') return item.type === 'image';
    if (filter === 'video') return item.type === 'video';
    return true;
  });

  const counts = {
    images: mediaList.filter((i) => i.type === 'image').length,
    videos: mediaList.filter((i) => i.type === 'video').length,
  };

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < filteredMedia.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handlePrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const selectedItem = selectedIndex !== null ? filteredMedia[selectedIndex] : null;

  return (
    <main className="min-h-screen bg-[#faf4f5] text-rose-950 pb-20">
      {/* Encabezado Personalizado */}
      <header className="bg-[#b87c88] text-white py-12 px-4 text-center shadow-md">
        <p className="uppercase tracking-widest text-xs font-light text-rose-100 mb-2">Recuerdos de mi Boda</p>
        <h1 className="font-serif text-4xl md:text-5xl tracking-wide mb-2">Antonieta & Javier</h1>
        <p className="text-rose-100 text-sm md:text-base font-light">Comparte los momentos inolvidables de este día especial</p>
      </header>

      {/* Zona de Subida con Campo de Comentario */}
      <div className="max-w-2xl mx-auto px-4 mt-8">
        <div className="bg-white border border-rose-200/80 rounded-2xl p-6 shadow-sm text-center">
          <input
            type="text"
            placeholder=" Escribe un mensaje o felicitación (opcional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={uploading}
            className="w-full mb-4 px-4 py-3 rounded-xl border border-rose-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#b87c88] text-stone-700 bg-rose-50/30"
          />

          <label className="block w-full cursor-pointer bg-[#b87c88] hover:bg-[#a46874] text-white font-medium py-4 px-6 rounded-xl transition duration-200 shadow hover:shadow-md">
            <span className="text-lg">📷 Sube una Foto o Video 🎥</span>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          <p className="text-xs text-rose-400 mt-3">Puedes seleccionar uno o varios archivos a la vez.</p>

          {uploading && (
            <div className="mt-4 p-3 bg-rose-50 rounded-lg text-sm text-rose-800 animate-pulse border border-rose-100">
              {progressText}
            </div>
          )}
        </div>
      </div>

      {/* Galería */}
      <div className="max-w-6xl mx-auto px-4 mt-10">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-rose-200/80 pb-4 gap-4">
          <div>
            <h2 className="font-serif text-2xl text-rose-900">Galería de Antonieta y Javier</h2>
            <p className="text-xs text-rose-500 mt-1">
              {counts.images} fotos • {counts.videos} videos compartidos
            </p>
          </div>

          <div className="flex bg-rose-100/60 p-1 rounded-xl gap-1 text-xs font-medium">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === 'all' ? 'bg-[#b87c88] text-white shadow-sm' : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              Todos ({mediaList.length})
            </button>
            <button
              onClick={() => setFilter('image')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === 'image' ? 'bg-[#b87c88] text-white shadow-sm' : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              📷 Fotos ({counts.images})
            </button>
            <button
              onClick={() => setFilter('video')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === 'video' ? 'bg-[#b87c88] text-white shadow-sm' : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              🎥 Videos ({counts.videos})
            </button>
          </div>
        </div>

        {loadingMedia ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-rose-100/40 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-rose-300 text-rose-400">
            No hay archivos en esta categoría. ¡Sé el primero en subir un recuerdo!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {filteredMedia.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setSelectedIndex(idx)}
                className="relative group aspect-square bg-rose-100/60 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition"
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
                      <span className="bg-white/80 rounded-full p-3 text-rose-900 shadow">▶</span>
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
                {item.comment && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white text-xs truncate">
                    💬 {item.comment}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal interactivo con navegación entre elementos */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 text-white text-lg font-bold px-4 py-2 bg-white/20 rounded-full hover:bg-white/40 transition z-10"
          >
            ✕ Cerrar
          </button>

          {selectedIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-4 text-white text-2xl font-bold p-3 bg-white/20 rounded-full hover:bg-white/40 transition z-10"
            >
              ❮
            </button>
          )}

          <div className="relative max-w-4xl w-full max-h-[85vh] flex flex-col items-center">
            {selectedItem.type === 'video' ? (
              <video src={selectedItem.url} controls autoPlay className="max-h-[70vh] w-auto rounded-lg shadow-2xl" />
            ) : (
              <img src={selectedItem.url} alt="Vista previa" className="max-h-[70vh] w-auto object-contain rounded-lg shadow-2xl" />
            )}

            {selectedItem.comment && (
              <p className="mt-3 text-rose-100 text-sm italic bg-white/10 px-4 py-2 rounded-xl text-center max-w-lg border border-white/10">
                "{selectedItem.comment}"
              </p>
            )}

            <a
              href={`/api/download?key=${encodeURIComponent(selectedItem.id)}`}
              download
              className="mt-4 bg-[#b87c88] hover:bg-[#a46874] text-white font-medium px-6 py-2 rounded-full shadow transition flex items-center gap-2 text-sm"
            >
               Descargar archivo
            </a>
          </div>

          {selectedIndex < filteredMedia.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 text-white text-2xl font-bold p-3 bg-white/20 rounded-full hover:bg-white/40 transition z-10"
            >
              ❯
            </button>
          )}
        </div>
      )}
    </main>
  );
}
