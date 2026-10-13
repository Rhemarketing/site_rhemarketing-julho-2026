"use client";

import { useState, useEffect } from "react";

export interface GalleryVideo {
  id: number;
  title: string;
  description: string | null;
  file_path: string;
  thumbnail_path: string | null;
  external_url: string | null;
}

const whatsappBase = "https://wa.me/5534999005219?text=";

function getEmbedUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    // YouTube
    const ytMatch = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)/);
    if (vimeoMatch && vimeoMatch[3]) {
      return `https://player.vimeo.com/video/${vimeoMatch[3]}?autoplay=1`;
    }

    return null;
  } catch {
    return null;
  }
}

export default function VideoGallery({ items }: { items: GalleryVideo[] }) {
  const [activeVideo, setActiveVideo] = useState<GalleryVideo | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveVideo(null);
    };
    if (activeVideo) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeVideo]);

  if (!items || items.length === 0) {
    return (
      <div className="gallery-empty">
        <p>Ainda não há vídeos publicados nesta galeria.</p>
        <a
          href={`${whatsappBase}${encodeURIComponent(
            "Olá Patrick! Gostaria de conversar sobre edição de vídeos para o meu projeto."
          )}`}
          target="_blank"
          rel="noreferrer"
          className="button button-primary"
        >
          Solicitar Edição de Vídeo no WhatsApp ↗
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="gallery-video-grid">
        {items.map((video) => {
          const embed = getEmbedUrl(video.external_url || video.file_path);
          const isDirectVideo =
            video.file_path.endsWith(".mp4") ||
            video.file_path.endsWith(".webm") ||
            video.file_path.startsWith("/uploads/videos/");

          return (
            <div key={video.id} className="video-card">
              <div
                className="video-card-preview"
                onClick={() => setActiveVideo(video)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setActiveVideo(video);
                }}
              >
                {video.thumbnail_path ? (
                  <img
                    src={video.thumbnail_path}
                    alt={video.title}
                    loading="lazy"
                  />
                ) : isDirectVideo ? (
                  <video
                    src={video.file_path}
                    muted
                    preload="metadata"
                  />
                ) : (
                  <div className="video-card-generic-thumb">
                    <span>🎬</span>
                  </div>
                )}
                <div className="video-card-overlay">
                  <div className="play-button-icon" aria-label="Reproduzir vídeo">
                    ▶
                  </div>
                </div>
              </div>

              <div className="video-card-info">
                <h3>{video.title}</h3>
                {video.description && <p>{video.description}</p>}
                <button
                  className="video-btn-play"
                  onClick={() => setActiveVideo(video)}
                >
                  Assistir vídeo ↗
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Cinema Mode */}
      {activeVideo && (
        <div
          className="lightbox-backdrop"
          onClick={() => setActiveVideo(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="video-cinema-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="lightbox-close"
              onClick={() => setActiveVideo(null)}
              aria-label="Fechar vídeo"
            >
              ✕
            </button>

            <div className="video-cinema-player">
              {(() => {
                const embed = getEmbedUrl(activeVideo.external_url || activeVideo.file_path);
                if (embed) {
                  return (
                    <iframe
                      src={embed}
                      title={activeVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                } else {
                  return (
                    <video
                      src={activeVideo.file_path}
                      controls
                      autoPlay
                      playsInline
                    >
                      Seu navegador não suporta a reprodução deste vídeo.
                    </video>
                  );
                }
              })()}
            </div>

            <div className="video-cinema-footer">
              <div>
                <h2>{activeVideo.title}</h2>
                {activeVideo.description && <p>{activeVideo.description}</p>}
              </div>

              <a
                href={`${whatsappBase}${encodeURIComponent(
                  `Olá, Patrick! Gostei da edição do vídeo "${activeVideo.title}" e quero um orçamento para edição de vídeo.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="button button-primary"
              >
                Quero um vídeo com essa edição ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
