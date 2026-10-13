import type { Metadata } from "next";
import Link from "next/link";
import { getDbPool, GalleryItem } from "@/lib/db";
import VideoGallery from "@/components/video-gallery";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edição de Vídeo & Audiovisual | Patrick Mendes",
  description:
    "Confira os projetos de edição de vídeo, reels dinâmicos, vídeos comerciais e institucionais editados por Patrick Mendes.",
};

const whatsappUrl =
  "https://wa.me/5534999005219?text=Olá%2C%20Patrick!%20Vi%20sua%20galeria%20de%20Edição%20de%20Vídeo%20e%20quero%20um%20orçamento.";

export default async function EdicaoDeVideoPage() {
  let items: GalleryItem[] = [];

  try {
    const pool = getDbPool();
    const [rows] = await pool.query(
      "SELECT id, title, description, file_path, thumbnail_path, external_url, sort_order FROM gallery_items WHERE type = 'video' ORDER BY sort_order DESC, id DESC"
    );
    items = rows as GalleryItem[];
  } catch (error) {
    console.error("Erro ao carregar itens de vídeo:", error);
  }

  return (
    <main className="gallery-page">
      {/* Cabeçalho */}
      <header className="site-header static-header">
        <Link className="brand" href="/" aria-label="Patrick Mendes — início">
          <span>Patrick</span> Mendes
        </Link>

        <nav className="desktop-nav" aria-label="Navegação da galeria">
          <Link href="/#inicio">← Início</Link>
          <Link href="/#outros-servicos">Outros serviços</Link>
          <Link href="/design-grafico">Design Gráfico ↗</Link>
        </nav>

        <a
          className="header-cta"
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
        >
          Pedir orçamento <span aria-hidden="true">↗</span>
        </a>
      </header>

      {/* Hero da Galeria */}
      <section className="gallery-hero">
        <div className="hero-grid" aria-hidden="true"></div>
        <div className="gallery-hero-content">
          <span className="kicker">/ Portfólio Audiovisual</span>
          <h1>
            Edição de Vídeo & <em>Retenção Visual</em>
          </h1>
          <p>
            Vídeos dinâmicos com cortes precisos, sound design, legendas animadas
            e ritmo cinematográfico para capturar e prender a atenção do público.
          </p>
        </div>
      </section>

      {/* Grid de Vídeos */}
      <section className="gallery-container">
        <VideoGallery items={items} />
      </section>

      {/* Chamada Final */}
      <section className="contact section" id="contato">
        <div className="contact-grid" aria-hidden="true"></div>
        <span className="kicker">/ Vamos impulsionar seus vídeos</span>
        <h2>Vamos editar seu <i>próximo</i> <em>vídeo?</em></h2>
        <p>
          Traga seu material bruto e transforme-o em um conteúdo magnético que gera
          autoridade, conexão e vendas para o seu negócio.
        </p>
        <a
          className="contact-button"
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
        >
          Solicitar orçamento no WhatsApp <span aria-hidden="true">↗</span>
        </a>
      </section>

      {/* Rodapé */}
      <footer>
        <Link className="brand" href="/" aria-label="Patrick Mendes — início">
          <span>Patrick</span> Mendes
        </Link>
        <p>Vídeos e websites de alta performance para impulsionar seus resultados.</p>
        <div className="footer-links">
          <a
            href="https://instagram.com/rhemarketando"
            target="_blank"
            rel="noreferrer"
          >
            Instagram ↗
          </a>
          <a
            href="https://wa.me/5534999005219"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp ↗
          </a>
          <Link href="/admin/login">Admin ↗</Link>
        </div>
        <small>© 2026 Patrick Mendes. Todos os direitos reservados.</small>
      </footer>
    </main>
  );
}
