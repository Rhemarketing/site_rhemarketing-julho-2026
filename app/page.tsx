const recentSites = [
  {
    title: "Palhaço Marotinho",
    description: "Página divertida com painel de gestão.",
    image: "/projects/marotinho.jpg",
    href: "https://palhacomarotinho.com.br/",
  },
  {
    title: "DNA da Pizza",
    description: "Site inteligente com painel.",
    image: "/projects/dnapizza.jpg",
    href: "https://dnadapizza.rhemarketing.com/",
  },
  {
    title: "Unigospel",
    description: "Plataforma de cursos com IA.",
    image: "/projects/unigospel.jpg",
    href: "https://unigospel.com/",
  },
  {
    title: "Paulinho Soluções",
    description: "Assistência Técnica com design de destaque.",
    image: "/projects/paulinho.jpg",
    href: "https://www.paulinhosolucoes.com.br/",
  },
  {
    title: "Protec Balanças",
    description: "Site institucional com blog e painel de gestão.",
    image: "/projects/protec.jpg",
    href: "https://protecbalancas.com.br/",
  },
  {
    title: "Paulo Designer",
    description: "Página minimalista com painel de gestão.",
    image: "/projects/paulodesigner.jpg",
    href: "https://paulogdesign.com/",
  },
  {
    title: "Renata Delfino",
    description: "Site institucional com painel de gestão.",
    image: "/projects/renata.jpg",
    href: "https://deixesualuzbrilhar.com/",
  },
  {
    title: "Videira Ituiutaba",
    description: "Plataforma de cursos com login de alunos.",
    image: "/projects/videiracursos.jpg",
    href: "https://cursos.videiraituiutaba.com.br/",
  },
];

const extras = [
  "Lojas virtuais",
  "Automações com IA",
  "Edição de vídeo",
  "Copywriting e redação",
];

const whatsappUrl =
  "https://wa.me/5534999005219?text=Olá%2C%20Patrick!%20Vi%20seu%20site%20e%20quero%20conversar%20sobre%20a%20criação%20do%20meu%20site.";

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Patrick Mendes — início">
          <span>Patrick</span> Mendes
        </a>

        <nav className="desktop-nav" aria-label="Navegação principal">
          <a href="#sites">Sites recentes</a>
          <a href="#processo">Processo</a>
          <a href="#sobre">Sobre</a>
          <a href="#contato">Contato</a>
        </nav>

        <a className="header-cta" href={whatsappUrl} target="_blank" rel="noreferrer">
          Pedir orçamento <span aria-hidden="true">↗</span>
        </a>

        <details className="mobile-menu">
          <summary aria-label="Abrir menu"><span></span><span></span></summary>
          <nav aria-label="Navegação móvel">
            <a href="#sites">Sites recentes</a>
            <a href="#processo">Processo</a>
            <a href="#sobre">Sobre</a>
            <a href="#contato">Contato</a>
          </nav>
        </details>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-grid" aria-hidden="true"></div>
        <div className="hero-orbit hero-orbit-one" aria-hidden="true"></div>
        <div className="hero-orbit hero-orbit-two" aria-hidden="true"></div>

        <div className="hero-copy">
          <div className="eyebrow"><span></span> Criação de sites sob medida</div>
          <h1>Web Designer e Gestor <em>de Agentes IA</em></h1>
          <p>
            Páginas bonitas e rápidas e automação inteligente de grandes projetos com agentes de IA.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href={whatsappUrl} target="_blank" rel="noreferrer">
              Quero criar meu site <span aria-hidden="true">↗</span>
            </a>
            <a className="button button-secondary" href="#sites">
              Ver sites recentes <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>

        <div className="hero-proof" aria-label="Diferenciais do serviço">
          <span><b>01</b> Design sob medida</span>
          <span><b>02</b> Perfeito no celular</span>
          <span><b>03</b> Pronto para vender</span>
        </div>
      </section>

      <section className="recent-sites section" id="sites" aria-labelledby="sites-title">
        <div className="section-heading sites-heading">
          <div>
            <span className="kicker">/ Sites recentes</span>
            <h2 id="sites-title">Trabalhos que já estão <em>no mundo.</em></h2>
          </div>
          <p>
            Uma seleção dos projetos mais recentes. Arraste para explorar e
            clique em um card para conhecer o site.
          </p>
        </div>

        <div className="carousel-shell">
          <div className="site-carousel" aria-label="Carrossel de sites recentes">
            {recentSites.map((site, index) => (
              <a
                className="site-card"
                href={site.href}
                id={`site-${index + 1}`}
                key={site.title}
                aria-label={`Conhecer o projeto ${site.title}`}
                target={site.href.startsWith("http") ? "_blank" : undefined}
                rel={site.href.startsWith("http") ? "noreferrer" : undefined}
              >
                <div className="site-card-image">
                  <img src={site.image} alt={`Página do projeto ${site.title}`} loading="lazy" />
                  <span aria-hidden="true">↗</span>
                </div>
                <div className="site-card-copy">
                  <h3>{site.title}</h3>
                  <p>{site.description}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="carousel-controls" aria-label="Controles do carrossel">
            <a href="#site-1" aria-label="Ir para o primeiro site">←</a>
            <div aria-hidden="true"><span></span></div>
            <a href="#site-4" aria-label="Ir para o último site">→</a>
          </div>
        </div>
      </section>

      <section className="video-section section" id="processo" aria-labelledby="process-title">
        <div className="video-copy">
          <span className="kicker">/ Como funciona</span>
          <h2 id="process-title">Do primeiro papo ao site <em>no ar.</em></h2>
          <p>
            Neste vídeo, explico como organizo conteúdo, design e tecnologia
            para transformar sua ideia em um site claro, bonito e funcional.
          </p>
          <div className="video-notes" aria-label="Etapas do processo">
            <span>01 · Imersão</span>
            <span>02 · Design</span>
            <span>03 · Publicação</span>
          </div>
        </div>

        <div className="video-frame">
          <iframe
            src="https://www.youtube-nocookie.com/embed/ScMzIvxBSi4?rel=0"
            title="Como funciona o processo de criação de um site"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>
      </section>

      <section className="about section" id="sobre">
        <div className="about-visual">
          <div className="about-number" aria-hidden="true">RHE</div>
          <img
            src="/assets/patrick-hero.png"
            alt="Patrick Mendes"
            width="700"
            height="900"
            loading="lazy"
          />
        </div>
        <div className="about-copy">
          <span className="kicker">/ Quem está por trás</span>
          <h2>Prazer, sou <em>Patrick Mendes.</em></h2>
          <p className="about-lead">
            Uno estratégia, criatividade e tecnologia para construir uma
            presença digital que faça sentido para o seu negócio — e para as
            pessoas que você quer alcançar.
          </p>
          <p>
            Você fala diretamente comigo em todas as etapas. Isso torna o
            processo mais próximo, ágil e alinhado ao que sua marca realmente
            precisa.
          </p>
          <div className="about-points">
            <span>Atendimento direto</span>
            <span>Estratégia sob medida</span>
            <span>Suporte próximo</span>
          </div>
        </div>
      </section>

      <section className="extras section" aria-labelledby="extras-title">
        <div>
          <span className="kicker">/ Soluções complementares</span>
          <h2 id="extras-title">Seu digital conectado de <em>ponta a ponta.</em></h2>
        </div>
        <div className="extra-list">
          {extras.map((extra, index) => (
            <div key={extra}>
              <span>0{index + 1}</span>
              <h3>{extra}</h3>
              <b aria-hidden="true">↗</b>
            </div>
          ))}
        </div>
      </section>

      <section className="contact section" id="contato">
        <div className="contact-grid" aria-hidden="true"></div>
        <span className="kicker">/ Vamos conversar</span>
        <h2>Vamos criar um site à altura do seu <em>negócio?</em></h2>
        <p>
          Conte um pouco sobre sua empresa e o que você precisa. Eu analiso o
          projeto e mostro o caminho mais simples para colocar seu site no ar.
        </p>
        <a className="contact-button" href={whatsappUrl} target="_blank" rel="noreferrer">
          Solicitar orçamento no WhatsApp <span aria-hidden="true">↗</span>
        </a>
      </section>

      <footer>
        <a className="brand" href="#inicio"><span>RHE</span> Marketing</a>
        <p>Sites claros, rápidos e feitos para transformar visitas em oportunidades.</p>
        <div className="footer-links">
          <a href="https://instagram.com/rhemarketando" target="_blank" rel="noreferrer">Instagram ↗</a>
          <a href="https://wa.me/5534999005219" target="_blank" rel="noreferrer">WhatsApp ↗</a>
        </div>
        <small>© 2026 RHE Marketing. Todos os direitos reservados.</small>
      </footer>
    </main>
  );
}
