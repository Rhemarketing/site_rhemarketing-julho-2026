"use client";

import { useState, useEffect } from "react";

export interface GalleryImage {
  id: number;
  title: string;
  description: string | null;
  file_path: string;
}

const whatsappBase =
  "https://wa.me/5534999005219?text=";

export default function GalleryLightbox({ items }: { items: GalleryImage[] }) {
  const [selectedItem, setSelectedItem] = useState<GalleryImage | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedItem(null);
    };
    if (selectedItem) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedItem]);

  if (!items || items.length === 0) {
    return (
      <div className="gallery-empty">
        <p>Ainda não há artes cadastradas nesta galeria.</p>
        <a
          href={`${whatsappBase}${encodeURIComponent(
            "Olá Patrick! Gostaria de ver amostras de Design Gráfico e conversar sobre um projeto."
          )}`}
          target="_blank"
          rel="noreferrer"
          className="button button-primary"
        >
          Conversar no WhatsApp ↗
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="gallery-grid">
        {items.map((item) => (
          <div
            key={item.id}
            className="gallery-card"
            onClick={() => setSelectedItem(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setSelectedItem(item);
            }}
            aria-label={`Ver imagem ${item.title}`}
          >
            <div className="gallery-card-thumb">
              <img src={item.file_path} alt={item.title} loading="lazy" />
              <div className="gallery-card-overlay">
                <span className="gallery-zoom-icon">🔍 Ampliar</span>
              </div>
            </div>
            <div className="gallery-card-caption">
              <h3>{item.title}</h3>
              {item.description && <p>{item.description}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Modal / Lightbox */}
      {selectedItem && (
        <div
          className="lightbox-backdrop"
          onClick={() => setSelectedItem(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="lightbox-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="lightbox-close"
              onClick={() => setSelectedItem(null)}
              aria-label="Fechar visualização"
            >
              ✕
            </button>

            <div className="lightbox-image-wrap">
              <img
                src={selectedItem.file_path}
                alt={selectedItem.title}
              />
            </div>

            <div className="lightbox-details">
              <h2>{selectedItem.title}</h2>
              {selectedItem.description && (
                <p className="lightbox-desc">{selectedItem.description}</p>
              )}
              <div className="lightbox-actions">
                <a
                  href={`${whatsappBase}${encodeURIComponent(
                    `Olá, Patrick! Vi a arte "${selectedItem.title}" no seu portfólio de Design Gráfico e quero um projeto com estilo semelhante.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="button button-primary"
                >
                  Quero uma arte assim ↗
                </a>
                <a
                  href={selectedItem.file_path}
                  target="_blank"
                  rel="noreferrer"
                  className="button button-secondary"
                >
                  Abrir original ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
