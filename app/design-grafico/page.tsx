import type { Metadata } from "next";
import Link from "next/link";
import { getDbPool, GalleryItem } from "@/lib/db";
import GalleryLightbox from "@/components/gallery-lightbox";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Design Gráfico & Artes | Patrick Mendes",
  description:
    "Confira as artes, identidades visuais e criativos para redes sociais criados por Patrick Mendes.",
};

const whatsappUrl =
  "https://wa.me/5534999005219?text=Olá%2C%20Patrick!%20Vi%20sua%20galeria%20de%20Design%20Gráfico%20e%20quero%20um%20orçamento.";

export default async function DesignGraficoPage() {
  let items: GalleryItem[] = [];

  try {
    const pool = getDbPool();
    const [rows] = await pool.query(
      "SELECT id, title, description, file_path, sort_order FROM gallery_items WHERE type = 'design' ORDER BY sort_order DESC, id DESC"
    );
    items = rows as GalleryItem[];
  } catch (error) {
    console.error("Erro ao carregar itens de design:", error);
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
          <Link href="/edicao-de-video">Edição de Vídeo ↗</Link>
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
          <span className="kicker">/ Galeria de Criação</span>
          <h1>
            Design Gráfico & <em>Comunicação Visual</em>
          </h1>
          <p>
            Artes publicitárias, criativos para anúncios e peças de alto impacto
            para fortalecer sua marca e impulsionar suas conversões.
          </p>
        </div>
      </section>

      {/* Grid de Artes */}
      <section className="gallery-container">
        <GalleryLightbox items={items} />
      </section>

      {/* Chamada Final */}
      <section className="contact section" id="contato">
        <div className="contact-grid" aria-hidden="true"></div>
        <span className="kicker">/ Vamos criar juntos</span>
        <h2>Precisa de um <i>design</i> <em>exclusivo?</em></h2>
        <p>
          Fale diretamente comigo para criarmos uma identidade visual memorável
          ou criativos de alta conversão para o seu negócio.
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
        <p>Artes visuais e websites feitos para transformar marcas e gerar resultados.</p>
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
