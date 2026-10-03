import { ArrowRight, CalendarDays, Camera, ClipboardList, Images, Package, Users, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Brand from '../components/Brand';
import './LandingPage.css';

const features = [
  { icon: ClipboardList, title: 'Gestión de pedidos', text: 'Consulta cada pedido, sus artículos y su avance hasta la entrega.' },
  { icon: Package, title: 'Productos', text: 'Mantén organizados álbumes, marcos y artículos fotográficos.' },
  { icon: Camera, title: 'Sesiones fotográficas', text: 'Coordina horarios, responsables y detalles de cada sesión.' },
  { icon: Images, title: 'Impresiones', text: 'Da seguimiento a formatos, cantidades y solicitudes de impresión.' },
  { icon: Users, title: 'Clientes', text: 'Reúne la información y el historial de cada cliente.' },
  { icon: UserCheck, title: 'Control de asistencia', text: 'Registra entradas, salidas y jornadas del personal.' },
];

export default function LandingPage() {
  return (
    <div className="minerva-landing">
      <header className="landing-header">
        <Link aria-label="Foto Minerva, inicio" className="landing-brand" to="/"><Brand /></Link>
        <nav aria-label="Navegación de inicio">
          <a href="#operacion">Qué puedes administrar</a>
          <Link className="landing-login-link" to="/login">Iniciar sesión</Link>
          <Link className="landing-register-link" to="/register">Crear cuenta</Link>
        </nav>
      </header>
      <main>
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <p className="studio-eyebrow">FOTO MINERVA · ADMINISTRACIÓN DEL ESTUDIO</p>
            <h1>El trabajo de tu estudio, organizado en un solo lugar.</h1>
            <p>Centraliza pedidos, productos, sesiones, impresiones, clientes y asistencia para que cada detalle de Foto Minerva tenga seguimiento.</p>
            <div className="landing-actions">
              <Link className="studio-button studio-button-primary" to="/login">Iniciar sesión <ArrowRight size={17} /></Link>
              <Link className="studio-button studio-button-secondary" to="/register">Crear cuenta</Link>
            </div>
          </div>
          <div className="landing-image-card">
            <Brand />
            <span>Administración del estudio fotográfico</span>
            <div className="landing-image-decoration"><Camera size={48} strokeWidth={1.4} /></div>
          </div>
        </section>
        <section className="landing-features" id="operacion">
          <div className="landing-section-heading">
            <p className="studio-eyebrow">OPERACIÓN DEL ESTUDIO</p>
            <h2>Todo lo que necesitas para el día a día.</h2>
            <p>Una vista clara para organizar el trabajo del estudio y atender cada solicitud.</p>
          </div>
          <div className="landing-feature-grid">
            {features.map(({ icon: Icon, title, text }) => <article className="landing-feature-card" key={title}><span><Icon size={20} /></span><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </section>
        <section className="landing-final-cta">
          <div><p className="studio-eyebrow">FOTO MINERVA</p><h2>Tu estudio, listo para seguir avanzando.</h2><p>Ingresa al panel para consultar la operación o crea una cuenta para comenzar.</p></div>
          <div className="landing-actions"><Link className="studio-button studio-button-primary" to="/login">Ingresar al sistema <ArrowRight size={17} /></Link><Link className="landing-cta-secondary" to="/register">Crear una cuenta</Link></div>
        </section>
      </main>
      <footer className="landing-footer"><Brand compact /><span>© {new Date().getFullYear()} Foto Minerva</span></footer>
    </div>
  );
}
