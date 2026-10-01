import { useEffect, useState } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  Check,
  CloudCog,
  CodeXml,
  Menu,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import Brand from '../components/Brand';
import './LandingPage.css';

const services = [
  {
    icon: CloudCog,
    title: 'Cloud & infraestructura',
    description: 'Arquitecturas seguras, observables y listas para crecer sin fricción.',
    tags: ['Cloud', 'Plataforma'],
  },
  {
    icon: CodeXml,
    title: 'Desarrollo de software',
    description: 'Productos digitales robustos que resuelven necesidades reales del negocio.',
    tags: ['Producto', 'Ingeniería'],
  },
  {
    icon: BrainCircuit,
    title: 'Datos e inteligencia artificial',
    description: 'Modelos, automatizaciones y analítica que convierten información en acción.',
    tags: ['Datos', 'IA aplicada'],
  },
  {
    icon: ShieldCheck,
    title: 'Ciberseguridad gestionada',
    description: 'Protección continua de activos, identidades y operaciones críticas.',
    tags: ['Seguridad', 'Resiliencia'],
  },
];

const solutions = [
  {
    number: '01',
    title: 'Ecosistema digital conectado',
    description: 'Integra tus plataformas, equipos y datos en una operación más fluida.',
    tone: 'solution-rose',
  },
  {
    number: '02',
    title: 'Automatización inteligente',
    description: 'Convierte tareas repetitivas en procesos confiables y medibles.',
    tone: 'solution-wine',
  },
  {
    number: '03',
    title: 'Cloud lista para escalar',
    description: 'Moderniza tu infraestructura con seguridad y crecimiento sostenible.',
    tone: 'solution-plum',
  },
];

const clients = ['NEXORA', 'brío bank', 'KAIROS', 'LUMA retail', 'orbit logistics', 'VERTICE'];

function ProductPreview() {
  return (
    <div className="preview-stage" aria-label="Vista ilustrativa de una plataforma tecnológica">
      <div className="preview-orbit preview-orbit-one" aria-hidden="true" />
      <div className="preview-orbit preview-orbit-two" aria-hidden="true" />
      <div className="preview-window">
        <div className="preview-topbar">
          <div className="preview-brand">
            <span className="preview-brand-mark">A</span>
            <span>Apta <strong>Workspace</strong></span>
          </div>
          <div className="preview-window-actions" aria-hidden="true"><i /><i /><i /></div>
        </div>

        <div className="preview-body">
          <aside className="preview-sidebar" aria-hidden="true">
            <span className="preview-nav active" />
            <span className="preview-nav" />
            <span className="preview-nav" />
            <span className="preview-nav short" />
          </aside>

          <div className="preview-content">
            <div className="preview-title-row">
              <div>
                <span className="preview-overline">VISTA CONCEPTUAL</span>
                <h2>Operación conectada</h2>
              </div>
              <span className="preview-live"><i /> Demo visual</span>
            </div>

            <div className="preview-stats">
              <div><span>Procesos</span><strong>Integrados</strong><small><Check size={12} /> Flujo activo</small></div>
              <div><span>Datos</span><strong>Unificados</strong><small><Sparkles size={12} /> Vista central</small></div>
              <div><span>Plataforma</span><strong>Escalable</strong><small><ArrowUpRight size={12} /> Lista para crecer</small></div>
            </div>

            <div className="preview-chart-panel">
              <div className="preview-chart-heading">
                <div><strong>Flujo de operación</strong><span>Representación de producto</span></div>
                <span className="preview-chart-period">Vista general <ArrowDownRight size={12} /></span>
              </div>
              <div className="preview-chart" aria-hidden="true">
                <div className="chart-y-axis"><span>Alto</span><span>Medio</span><span>Bajo</span></div>
                <div className="chart-grid">
                  <i /><i /><i />
                  <svg viewBox="0 0 430 100" preserveAspectRatio="none" role="presentation">
                    <path className="chart-fill" d="M0 76 C35 70 48 42 86 55 S145 80 177 48 S234 35 264 47 S317 25 346 37 S398 18 430 8 L430 100 L0 100 Z" />
                    <path className="chart-line" d="M0 76 C35 70 48 42 86 55 S145 80 177 48 S234 35 264 47 S317 25 346 37 S398 18 430 8" />
                  </svg>
                  <div className="chart-x-axis"><span>Plan</span><span>Conecta</span><span>Construye</span><span>Escala</span></div>
                </div>
              </div>
            </div>

            <div className="preview-bottom-row">
              <span><i className="preview-dot rose-dot" /> Infraestructura</span>
              <span><i className="preview-dot wine-dot" /> Datos conectados</span>
              <span className="preview-secure"><ShieldCheck size={13} /> Seguro por diseño</span>
            </div>
          </div>
        </div>
      </div>
      <div className="preview-caption"><span /> Tecnología que acompaña el crecimiento</div>
    </div>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="marketing-site">
      <header className="marketing-header">
        <div className="marketing-header-inner">
          <a className="marketing-logo" href="#inicio" onClick={closeMenu} aria-label="Apta Digital, inicio">
            <Brand />
          </a>

          <button
            className="mobile-menu-toggle"
            type="button"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls="primary-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>

          <nav id="primary-menu" className={`marketing-nav${menuOpen ? ' is-open' : ''}`} aria-label="Navegación principal">
            <a href="#inicio" onClick={closeMenu}>Inicio</a>
            <a href="#servicios" onClick={closeMenu}>Servicios</a>
            <a href="#soluciones" onClick={closeMenu}>Soluciones</a>
            <a href="#casos" onClick={closeMenu}>Casos</a>
            <a href="#nosotros" onClick={closeMenu}>Nosotros</a>
            <a href="#contacto" onClick={closeMenu}>Contacto</a>
            <a className="marketing-contact-mobile" href="#contacto" onClick={closeMenu}>Hablemos <ArrowUpRight size={15} /></a>
          </nav>

          <a className="marketing-contact-button" href="#contacto">Hablemos <ArrowUpRight size={15} /></a>
        </div>
      </header>

      <main>
        <section className="hero-section" id="inicio">
          <div className="hero-inner">
            <div className="hero-copy" data-reveal>
              <div className="hero-eyebrow"><span /> TECNOLOGÍA DISEÑADA PARA AVANZAR</div>
              <h1>Hacemos que la tecnología trabaje <em>a favor</em> de tu negocio.</h1>
              <p className="hero-description">Diseñamos, construimos y operamos soluciones tecnológicas para que tu empresa avance con claridad, seguridad y propósito.</p>
              <div className="hero-actions">
                <a className="button button-wine" href="#contacto">Impulsa tu próximo proyecto <ArrowRight size={16} /></a>
                <a className="button button-text" href="#soluciones">Ver soluciones <ArrowDownRight size={16} /></a>
              </div>
              <div className="hero-note"><span className="hero-note-check"><Check size={12} /></span> Estrategia, ingeniería y operación en un mismo equipo</div>
            </div>
            <div className="hero-visual" data-reveal>
              <ProductPreview />
            </div>
          </div>
          <a className="hero-scroll" href="#casos" aria-label="Desplazarse a clientes"><span /> Explora Apta Digital</a>
        </section>

        <section className="trust-section" id="casos">
          <div className="trust-inner" data-reveal>
            <p>TECNOLOGÍA QUE SOSTIENE OPERACIONES DE LÍDERES EN CRECIMIENTO</p>
            <div className="client-list" aria-label="Empresas de referencia">
              {clients.map((client) => <span key={client}>{client}</span>)}
            </div>
          </div>
        </section>

        <section className="services-section section-padding" id="servicios">
          <div className="section-container">
            <div className="section-heading" data-reveal>
              <div>
                <p className="section-kicker"><span /> SERVICIOS</p>
                <h2>Capacidades que se integran <em>de punta a punta.</em></h2>
              </div>
              <p className="section-intro">Combinamos estrategia, ingeniería y operación para resolver retos complejos con una visión completa.</p>
            </div>

            <div className="service-grid">
              {services.map(({ icon: Icon, title, description, tags }, index) => (
                <article className="service-card" data-reveal key={title} style={{ '--reveal-delay': `${index * 80}ms` }}>
                  <div className="service-card-top">
                    <span className="service-icon"><Icon size={21} strokeWidth={1.7} /></span>
                    <a href="#contacto" className="service-arrow" aria-label={`Consultar sobre ${title}`}><ArrowUpRight size={17} /></a>
                  </div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <div className="service-tags">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="solutions-section section-padding" id="soluciones">
          <div className="section-container">
            <div className="solutions-heading" data-reveal>
              <div>
                <p className="section-kicker light-kicker"><span /> SOLUCIONES DESTACADAS</p>
                <h2>De la complejidad técnica a una <em>ventaja competitiva.</em></h2>
              </div>
              <p>Diseñamos respuestas completas para los desafíos que frenan tu siguiente etapa.</p>
            </div>

            <div className="solution-grid">
              {solutions.map((solution, index) => (
                <article className={`solution-card ${solution.tone}${index === 0 ? ' solution-featured' : ''}`} data-reveal key={solution.number} style={{ '--reveal-delay': `${index * 90}ms` }}>
                  <div className="solution-card-meta"><span>{solution.number}</span><ArrowUpRight size={18} /></div>
                  <div className="solution-card-copy">
                    <h3>{solution.title}</h3>
                    <p>{solution.description}</p>
                  </div>
                  <a href="#contacto">Explorar solución <ArrowRight size={15} /></a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="about-section section-padding" id="nosotros">
          <div className="section-container about-inner" data-reveal>
            <div className="about-mark" aria-hidden="true"><span>A</span><i /><i /><i /></div>
            <div className="about-copy">
              <p className="section-kicker"><span /> SOBRE APTA DIGITAL</p>
              <h2>Tecnología con criterio. <em>Progreso con sentido.</em></h2>
              <p>Somos un equipo tecnológico que conecta visión de negocio con soluciones prácticas. Acompañamos cada etapa: desde entender el reto hasta operar lo que construimos.</p>
            </div>
            <div className="about-aside"><span>01 — 03</span><p>Una relación de trabajo cercana, transparente y enfocada en resultados sostenibles.</p></div>
          </div>
        </section>

        <section className="contact-section" id="contacto">
          <div className="contact-inner" data-reveal>
            <div>
              <p className="section-kicker light-kicker"><span /> EL SIGUIENTE PASO</p>
              <h2>Tu próximo avance<br /><em>empieza con una conversación.</em></h2>
              <p>Cuéntanos qué quieres hacer posible. Encontraremos el camino tecnológico adecuado para tu negocio.</p>
            </div>
            <div className="contact-actions">
              <a className="button button-light" href="/login">Acceso al sistema <ArrowUpRight size={16} /></a>
              <span>El canal de contacto comercial se configura con el equipo de Apta Digital.</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="marketing-footer">
        <a className="marketing-logo" href="#inicio" aria-label="Apta Digital, volver al inicio"><Brand /></a>
        <p>Soluciones digitales para avanzar.</p>
        <span>© {new Date().getFullYear()} Apta Digital</span>
      </footer>
    </div>
  );
}