const services = [
  {
    index: "01",
    title: "Sites que vendem",
    description:
      "Landing pages, sites institucionais e lojas virtuais rápidas, responsivas e pensadas para transformar visitas em oportunidades.",
    tags: ["UI/UX", "SEO", "Conversão"],
  },
  {
    index: "02",
    title: "Social Media",
    description:
      "Conteúdo estratégico, design consistente e uma presença digital que aproxima sua marca das pessoas certas.",
    tags: ["Estratégia", "Conteúdo", "Design"],
  },
  {
    index: "03",
    title: "Tráfego pago",
    description:
      "Campanhas em Google e Meta Ads com otimização contínua para ampliar alcance, gerar leads e acelerar resultados.",
    tags: ["Google Ads", "Meta Ads", "Dados"],
  },
];

const projects = [
  {
    title: "Experiências digitais",
    category: "Sites & landing pages",
    image: "/projects/site-01.jpg",
    className: "project-wide",
  },
  {
    title: "Marcas com presença",
    category: "Social media",
    image: "/projects/social-01.jpg",
    className: "project-standard",
  },
  {
    title: "Design que posiciona",
    category: "Conteúdo estratégico",
    image: "/projects/social-04.jpg",
    className: "project-standard",
  },
  {
    title: "Conversão em cada tela",
    category: "Web design",
    image: "/projects/site-03.jpg",
    className: "project-wide",
  },
];

const extras = [
  "Lojas virtuais",
  "Automações com IA",
  "Edição de vídeo",
  "Copywriting e redação",
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="RHE Marketing — início">
          <span>RHE</span> Marketing
        </a>

        <nav className="desktop-nav" aria-label="Navegação principal">
          <a href="#servicos">Serviços</a>
          <a href="#projetos">Projetos</a>
          <a href="#sobre">Sobre</a>
          <a href="#contato">Contato</a>
        </nav>

        <a
          className="header-cta"
          href="https://wa.me/5534999005219?text=Olá%2C%20Patrick!%20Vi%20seu%20site%20e%20gostaria%20de%20conversar%20sobre%20um%20projeto."
          target="_blank"
          rel="noreferrer"
        >
          Falar sobre meu projeto <span aria-hidden="true">↗</span>
        </a>

        <details className="mobile-menu">
          <summary aria-label="Abrir menu"><span></span><span></span></summary>
          <nav aria-label="Navegação móvel">
            <a href="#servicos">Serviços</a>
            <a href="#projetos">Projetos</a>
            <a href="#sobre">Sobre</a>
            <a href="#contato">Contato</a>
          </nav>
        </details>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-grid" aria-hidden="true"></div>
        <div className="hero-beam hero-beam-one" aria-hidden="true"></div>
        <div className="hero-beam hero-beam-two" aria-hidden="true"></div>

        <div className="hero-copy">
          <div className="eyebrow"><span>⚡</span> Estratégia, design e tecnologia</div>
          <h1>
            Seu negócio merece mais do que <strong>presença.</strong>
            <span>Merece <em>resultado.</em></span>
          </h1>
          <p>
            Sites, conteúdo e tráfego para transformar atenção em clientes e
            posicionar sua marca no digital.
          </p>
          <div className="hero-actions">
            <a
              className="button button-primary"
              href="https://wa.me/5534999005219?text=Olá%2C%20Patrick!%20Quero%20crescer%20no%20digital."
              target="_blank"
              rel="noreferrer"
            >
              Quero crescer no digital <span aria-hidden="true">→</span>
            </a>
            <a className="button button-secondary" href="#projetos">
              Ver projetos <span aria-hidden="true">↘</span>
            </a>
          </div>
          <div className="hero-proof" aria-label="Principais especialidades">
            <span>Sites & landing pages</span>
            <span>Social media</span>
            <span>Tráfego pago</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="portrait-panel">
            <div className="portrait-glow" aria-hidden="true"></div>
            <img
              src="/assets/patrick-hero.png"
              alt="Patrick Mendes, especialista em marketing digital"
              width="900"
              height="1000"
              fetchPriority="high"
            />
          </div>
          <div className="metric-card metric-card-one">
            <span>Presença digital</span>
            <strong>que converte</strong>
          </div>
          <div className="metric-card metric-card-two">
            <span>Estratégia</span>
            <strong>ponta a ponta</strong>
          </div>
        </div>

        <div className="scroll-cue" aria-hidden="true"><span></span> EXPLORE</div>
      </section>

      <section className="services section" id="servicos">
        <div className="section-heading">
          <div>
            <span className="kicker">/ O que eu faço</span>
            <h2>Estratégia que sai do papel e vira <em>crescimento.</em></h2>
          </div>
          <p>
            Uma presença digital completa para conectar sua marca, sua oferta e
            o público que está pronto para comprar.
          </p>
        </div>

        <div className="service-grid">
          {services.map((service) => (
            <article className="service-card" key={service.index}>
              <div className="service-topline">
                <span>{service.index}</span>
                <span aria-hidden="true">↗</span>
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <div className="tag-list">
                {service.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="ticker" aria-label="Especialidades da RHE Marketing">
        <div>
          <span>SITES</span><b>✦</b><span>CONTEÚDO</span><b>✦</b>
          <span>TRÁFEGO</span><b>✦</b><span>AUTOMAÇÃO</span><b>✦</b>
          <span>SITES</span><b>✦</b><span>CONTEÚDO</span><b>✦</b>
        </div>
      </div>

      <section className="projects section" id="projetos">
        <div className="section-heading projects-heading">
          <div>
            <span className="kicker">/ Projetos selecionados</span>
            <h2>Ideias fortes merecem uma execução <em>à altura.</em></h2>
          </div>
          <p>
            Uma seleção de trabalhos desenvolvidos para negócios que queriam
            comunicar melhor, crescer e ser lembrados.
          </p>
        </div>

        <div className="project-grid">
          {projects.map((project, index) => (
            <article className={`project-card ${project.className}`} key={project.title}>
              <div className="project-image">
                <img src={project.image} alt={`Projeto de ${project.category}: ${project.title}`} loading="lazy" />
              </div>
              <div className="project-caption">
                <div>
                  <span>{project.category}</span>
                  <h3>{project.title}</h3>
                </div>
                <strong>0{index + 1}</strong>
              </div>
            </article>
          ))}
        </div>

        <div className="project-cta-row">
          <p>Tem uma ideia em mente?</p>
          <a
            href="https://wa.me/5534999005219?text=Olá%2C%20Patrick!%20Tenho%20uma%20ideia%20de%20projeto%20e%20quero%20conversar."
            target="_blank"
            rel="noreferrer"
          >
            Vamos tirar do papel <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <section className="process section" aria-labelledby="process-title">
        <div className="process-intro">
          <span className="kicker">/ Como funciona</span>
          <h2 id="process-title">Clareza do primeiro contato à <em>entrega.</em></h2>
        </div>
        <div className="process-steps">
          <article>
            <span>01</span>
            <div><h3>Imersão</h3><p>Entendo seu negócio, público, objetivo e o desafio que precisamos resolver.</p></div>
          </article>
          <article>
            <span>02</span>
            <div><h3>Estratégia</h3><p>Defino a direção criativa, a mensagem e os pontos de conversão do projeto.</p></div>
          </article>
          <article>
            <span>03</span>
            <div><h3>Execução</h3><p>Transformo o plano em uma entrega profissional, funcional e pronta para crescer.</p></div>
          </article>
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
        <h2>Pronto para transformar presença em <em>resultado?</em></h2>
        <p>
          Conte um pouco sobre seu projeto. Eu vou analisar sua necessidade e
          mostrar o melhor caminho para sua marca crescer no digital.
        </p>
        <a
          className="contact-button"
          href="https://wa.me/5534999005219?text=Olá%2C%20Patrick!%20Vi%20o%20site%20da%20RHE%20Marketing%20e%20quero%20solicitar%20um%20orçamento."
          target="_blank"
          rel="noreferrer"
        >
          Solicitar orçamento no WhatsApp <span aria-hidden="true">↗</span>
        </a>
      </section>

      <footer>
        <a className="brand" href="#inicio"><span>RHE</span> Marketing</a>
        <p>Estratégia, design e tecnologia para negócios que querem crescer.</p>
        <div className="footer-links">
          <a href="https://instagram.com/rhemarketando" target="_blank" rel="noreferrer">Instagram ↗</a>
          <a href="https://wa.me/5534999005219" target="_blank" rel="noreferrer">WhatsApp ↗</a>
        </div>
        <small>© 2026 RHE Marketing. Todos os direitos reservados.</small>
      </footer>
    </main>
  );
}
