import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Images,
  Package,
  Plus,
  Search,
  UserCheck,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './StudioWorkspace.css';
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV
  ? 'http://localhost:5000/api'
  : 'https://apta-backend-e3t7.onrender.com/api');

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const formatCurrency = (value) => `$${Number(value || 0).toLocaleString('es-MX', { maximumFractionDigits: 2 })}`;

const sanitizePdfText = (value) => String(value ?? '')
  .replace(/\r?\n/g, ' ')
  .replace(/[–—]/g, '-')
  .replace(/[“”]/g, '"')
  .replace(/[‘’]/g, "'")
  .replace(/…/g, '...');

const loadPdfLogo = () => new Promise((resolve) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => resolve(null);
  image.src = '/assets/foto-minerva-mark.png';
});

const wrapCanvasText = (context, value, maxWidth) => {
  const text = sanitizePdfText(value).trim();
  if (!text) return [''];
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const nextLine = line ? `${line} ${word}` : word;
    if (!line || context.measureText(nextLine).width <= maxWidth) {
      line = nextLine;
    } else {
      lines.push(line);
      line = word;
    }
  });
  if (line) lines.push(line);
  return lines;
};

const dataUrlToBinary = (dataUrl) => {
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  return binary;
};

const createPdfBlob = async (title, detailLines) => {
  const width = 1240;
  const height = 1754;
  const bodyCanvas = document.createElement('canvas');
  bodyCanvas.width = width;
  bodyCanvas.height = height;
  const measureContext = bodyCanvas.getContext('2d');
  measureContext.font = "22px 'Aptos', 'Segoe UI', sans-serif";

  const wrappedLines = detailLines.flatMap((line) => wrapCanvasText(measureContext, line, 1030));
  const linesPerPage = 34;
  const pages = [];
  for (let index = 0; index < wrappedLines.length || index === 0; index += linesPerPage) {
    pages.push(wrappedLines.slice(index, index + linesPerPage));
  }

  const logo = await loadPdfLogo();
  const pageImages = pages.map((lines, pageIndex) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    context.fillStyle = '#fff2f7';
    context.fillRect(0, 0, width, height);

    context.fillStyle = '#fff9fc';
    context.fillRect(48, 48, width - 96, height - 96);

    context.strokeStyle = '#edbdd2';
    context.lineWidth = 3;
    context.strokeRect(48, 48, width - 96, height - 96);

    if (logo) {
      context.drawImage(logo, 82, 74, 112, 112);
    }

    context.fillStyle = '#482638';
    context.font = "700 34px 'Aptos', 'Segoe UI', sans-serif";
    context.fillText('Foto Minerva', 218, 118);

    context.fillStyle = '#a23f6b';
    context.font = "600 18px 'Aptos', 'Segoe UI', sans-serif";
    context.fillText('ESTUDIO FOTOGRÁFICO', 218, 153);

    context.strokeStyle = '#f0dce6';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(82, 210);
    context.lineTo(width - 82, 210);
    context.stroke();

    context.fillStyle = '#482638';
    context.font = "700 30px 'Aptos', 'Segoe UI', sans-serif";
    context.fillText(sanitizePdfText(title), 82, 270);

    context.fillStyle = '#ffffff';
    context.fillRect(82, 310, width - 164, 1240);
    context.strokeStyle = '#f0dce6';
    context.strokeRect(82, 310, width - 164, 1240);

    let y = 365;
    lines.forEach((line) => {
      const safeLine = sanitizePdfText(line);
      if (!safeLine) {
        y += 24;
        return;
      }
      const colonIndex = safeLine.indexOf(':');
      if (colonIndex > 0 && colonIndex < 34) {
        const label = safeLine.slice(0, colonIndex + 1);
        const value = safeLine.slice(colonIndex + 1).trim();
        context.fillStyle = '#81425e';
        context.font = "700 21px 'Aptos', 'Segoe UI', sans-serif";
        context.fillText(label, 118, y);
        const labelWidth = context.measureText(label).width;
        context.fillStyle = '#634b59';
        context.font = "400 21px 'Aptos', 'Segoe UI', sans-serif";
        context.fillText(value, 128 + labelWidth, y);
      } else {
        context.fillStyle = safeLine === 'Historial:' ? '#81425e' : '#634b59';
        context.font = safeLine === 'Historial:'
          ? "700 23px 'Aptos', 'Segoe UI', sans-serif"
          : "400 21px 'Aptos', 'Segoe UI', sans-serif";
        context.fillText(safeLine, 118, y);
      }
      y += 34;
    });

    context.strokeStyle = '#f0dce6';
    context.beginPath();
    context.moveTo(82, 1600);
    context.lineTo(width - 82, 1600);
    context.stroke();

    context.fillStyle = '#826c79';
    context.font = "400 17px 'Aptos', 'Segoe UI', sans-serif";
    context.textAlign = 'left';
    context.fillText('Documento generado por Foto Minerva', 82, 1645);
    context.textAlign = 'center';
    context.fillText(`Página ${pageIndex + 1} de ${pages.length}`, width / 2, 1645);
    context.textAlign = 'right';
    context.fillText(new Date().toLocaleDateString('es-MX'), width - 82, 1645);

    return dataUrlToBinary(canvas.toDataURL('image/jpeg', 0.94));
  });

  const objects = [];
  const pageRefs = pageImages.map((_, index) => `${3 + (index * 3)} 0 R`);
  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  objects.push(`<< /Type /Pages /Kids [${pageRefs.join(' ')}] /Count ${pageImages.length} >>`);

  pageImages.forEach((imageBinary, pageIndex) => {
    const pageObjectNumber = 3 + (pageIndex * 3);
    const contentObjectNumber = pageObjectNumber + 1;
    const imageObjectNumber = pageObjectNumber + 2;
    const stream = 'q\n595 0 0 842 0 0 cm\n/Im1 Do\nQ';
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im1 ${imageObjectNumber} 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`);
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    objects.push(`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBinary.length} >>\nstream\n${imageBinary}\nendstream`);
  });

  let pdf = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets = [];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const bytes = Uint8Array.from(pdf, (character) => character.charCodeAt(0) & 0xff);
  return new Blob([bytes], { type: 'application/pdf' });
};

const deliverPdf = async (fileName, blob) => {
  const file = new File([blob], fileName, { type: 'application/pdf' });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ title: 'Foto Minerva', files: [file] });
      return;
    } catch (error) {
      if (error?.name === 'AbortError') return;
    }
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const readUserData = (userId) => {
  const stored = localStorage.getItem(`foto-minerva-data:${encodeURIComponent(userId)}`);
  if (!stored) return {};

  const data = JSON.parse(stored);
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Los datos locales del usuario tienen un formato inválido.');
  }
  return data;
};

const readCollection = (userId, name) => {
  const data = readUserData(userId);
  const rows = data[name] ?? [];
  if (!Array.isArray(rows)) {
    throw new Error(`La colección local "${name}" del usuario tiene un formato inválido.`);
  }
  return rows;
};

function useCollection(name) {
  const { user } = useAuth();
  const userId = user?.id || user?._id;
  if (typeof userId !== 'string' && typeof userId !== 'number') {
    throw new Error('El usuario autenticado no tiene un identificador estable para sus datos.');
  }

  const stableUserId = String(userId);
  const [collectionState, setCollectionState] = useState(() => ({
    userId: stableUserId,
    rows: readCollection(stableUserId, name),
  }));

  useEffect(() => {
    setCollectionState({ userId: stableUserId, rows: readCollection(stableUserId, name) });
  }, [name, stableUserId]);

  const rows = collectionState.userId === stableUserId ? collectionState.rows : [];
  const updateRows = useCallback((next) => {
    const data = readUserData(stableUserId);
    const currentRows = data[name] ?? [];
    if (!Array.isArray(currentRows)) {
      throw new Error(`La colección local "${name}" del usuario tiene un formato inválido.`);
    }

    const value = typeof next === 'function' ? next(currentRows) : next;
    if (!Array.isArray(value)) {
      throw new Error(`La colección local "${name}" debe permanecer como una lista.`);
    }

    localStorage.setItem(
      `foto-minerva-data:${encodeURIComponent(stableUserId)}`,
      JSON.stringify({ ...data, [name]: value })
    );
    setCollectionState((current) => current.userId === stableUserId
      ? { userId: stableUserId, rows: value }
      : current);
    return value;
  }, [name, stableUserId]);

  return [rows, updateRows];
}

const entityConfig = {
  orders: {
    title: 'Pedidos',
    description: 'Consulta, registra y da seguimiento a los pedidos del estudio.',
    addLabel: 'Crear pedido',
    search: 'Buscar pedido, cliente o artículo',
    statuses: ['En revisión', 'En impresión', 'Listo para entrega', 'Entregado'],
    fields: [
      ['number', 'Número de pedido', 'text', true], ['date', 'Fecha', 'date', true],
      ['customer', 'Cliente', 'text', true], ['items', 'Artículos y servicios', 'textarea', true],
      ['productCount', 'Cantidad de productos', 'number', true], ['total', 'Total', 'number', true],
      ['prints', 'Impresión asociada', 'text', false], ['session', 'Sesión asociada', 'text', false],
      ['status', 'Estado', 'select', true, ['En revisión', 'En impresión', 'Listo para entrega', 'Entregado']],
    ],
    columns: [['number', 'Pedido'], ['date', 'Fecha'], ['customer', 'Cliente'], ['items', 'Artículos / servicios'], ['productCount', 'Cantidad'], ['total', 'Total'], ['status', 'Estado']],
  },
  products: {
    title: 'Productos',
    description: 'Administra álbumes, marcos y artículos fotográficos.',
    addLabel: 'Nuevo producto',
    search: 'Buscar producto o categoría',
    statuses: ['Disponible', 'No disponible'],
    fields: [
      ['name', 'Nombre', 'text', true], ['category', 'Categoría', 'select', true, ['Álbumes', 'Marcos', 'Artículos fotográficos', 'Impresiones', 'Otros']],
      ['description', 'Descripción', 'textarea', false], ['price', 'Precio', 'number', true],
      ['stock', 'Existencia', 'number', true], ['availability', 'Disponibilidad', 'select', true, ['Disponible', 'No disponible']],
    ],
    columns: [['name', 'Producto'], ['category', 'Categoría'], ['description', 'Descripción'], ['price', 'Precio'], ['stock', 'Existencia'], ['availability', 'Disponibilidad']],
  },
  sessions: {
    title: 'Sesiones',
    description: 'Organiza las sesiones fotográficas y consulta la agenda.',
    addLabel: 'Agendar sesión',
    search: 'Buscar sesión, cliente o responsable',
    statuses: ['Pendiente', 'Confirmada', 'En preparación', 'Realizada', 'Cancelada'],
    fields: [
      ['customer', 'Cliente', 'text', true], ['date', 'Fecha', 'date', true], ['time', 'Hora', 'time', true],
      ['type', 'Tipo de sesión', 'text', true], ['responsible', 'Fotógrafo o responsable', 'text', true],
      ['location', 'Ubicación', 'text', true], ['status', 'Estado', 'select', true, ['Pendiente', 'Confirmada', 'En preparación', 'Realizada', 'Cancelada']],
      ['notes', 'Notas', 'textarea', false],
    ],
    columns: [['date', 'Fecha'], ['time', 'Hora'], ['type', 'Sesión'], ['customer', 'Cliente'], ['location', 'Ubicación'], ['status', 'Estado']],
  },
  prints: {
    title: 'Impresiones',
    description: 'Administra solicitudes, formatos y producción fotográfica.',
    addLabel: 'Nueva solicitud',
    search: 'Buscar impresión, pedido o cliente',
    statuses: ['Pendiente', 'En producción', 'Revisión', 'Lista', 'Entregada'],
    fields: [
      ['customer', 'Cliente', 'text', true], ['order', 'Pedido asociado', 'text', true],
      ['format', 'Formato', 'select', true, ['Infantil', 'Óvalo', 'Mignon', 'Otro tamaño']],
      ['size', 'Tamaño', 'text', true], ['quantity', 'Cantidad', 'number', true],
      ['finish', 'Acabado', 'text', true], ['date', 'Fecha', 'date', true],
      ['status', 'Estado', 'select', true, ['Pendiente', 'En producción', 'Revisión', 'Lista', 'Entregada']],
    ],
    columns: [['format', 'Formato'], ['size', 'Tamaño'], ['quantity', 'Cantidad'], ['order', 'Pedido'], ['customer', 'Cliente'], ['status', 'Estado']],
  },
  customers: {
    title: 'Clientes',
    description: 'Consulta clientes y su historial de pedidos, sesiones e impresiones.',
    addLabel: 'Registrar cliente',
    search: 'Buscar por nombre, teléfono o correo',
    statuses: [],
    fields: [
      ['name', 'Nombre', 'text', true], ['phone', 'Teléfono', 'tel', false],
      ['email', 'Correo electrónico', 'email', false], ['notes', 'Observaciones', 'textarea', false],
    ],
    columns: [['name', 'Cliente'], ['phone', 'Teléfono'], ['email', 'Correo'], ['notes', 'Observaciones']],
  },
  attendance: {
    title: 'Asistencia',
    description: 'Registra entradas y salidas del personal y revisa su jornada.',
    addLabel: 'Registrar entrada',
    search: 'Buscar trabajador',
    statuses: ['Presente', 'Pendiente de salida', 'Jornada completada', 'Ausencia'],
    fields: [
      ['employee', 'Trabajador', 'text', true], ['date', 'Fecha', 'date', true],
      ['checkIn', 'Hora de entrada', 'time', true], ['checkOut', 'Hora de salida', 'time', false],
      ['status', 'Estado', 'select', true, ['Presente', 'Pendiente de salida', 'Jornada completada', 'Ausencia']],
    ],
    columns: [['employee', 'Trabajador'], ['date', 'Fecha'], ['checkIn', 'Hora de entrada'], ['checkOut', 'Hora de salida'], ['status', 'Estado']],
  },
};

const entityLabels = {
  orders: 'Pedido',
  products: 'Producto',
  sessions: 'Sesión',
  prints: 'Solicitud de impresión',
  customers: 'Cliente',
  attendance: 'Registro de asistencia',
};

const emptyMessages = {
  orders: 'Aún no hay pedidos registrados.',
  products: 'Aún no hay productos registrados.',
  sessions: 'No hay sesiones programadas.',
  prints: 'Aún no hay impresiones registradas.',
  customers: 'Aún no hay clientes.',
  attendance: 'No hay registros de asistencia.',
};

const moduleIcons = {
  orders: ClipboardList,
  products: Package,
  sessions: CalendarDays,
  prints: Images,
  customers: Users,
  attendance: UserCheck,
};

function statusClass(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
}

function StatusBadge({ children }) {
  return <span className={`studio-badge studio-badge-${statusClass(children)}`}>{children || '—'}</span>;
}

function RecordForm({ config, initial, onCancel, onSave }) {
  const [form, setForm] = useState(() => initial || Object.fromEntries(config.fields.map(([key]) => [key, key === 'date' ? today() : ''])));
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  return (
    <form className="studio-form" onSubmit={(event) => { event.preventDefault(); onSave(form); }}>
      <div className="studio-form-grid">
        {config.fields.map(([key, label, type, required, options]) => (
          <label className={`studio-field${type === 'textarea' ? ' studio-field-wide' : ''}`} key={key}>
            <span>{label}{required && <em aria-hidden="true"> *</em>}</span>
            {type === 'select' ? (
              <select name={key} onChange={update} required={required} value={form[key] || ''}>
                <option value="">Selecciona una opción</option>
                {options.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            ) : type === 'textarea' ? (
              <textarea name={key} onChange={update} required={required} rows={4} value={form[key] || ''} />
            ) : (
              <input min={type === 'number' ? '0' : undefined} name={key} onChange={update} required={required} type={type} value={form[key] || ''} />
            )}
          </label>
        ))}
      </div>
      <p className="studio-form-hint">Los campos marcados con * son obligatorios.</p>
      <div className="studio-form-actions">
        <button className="studio-button studio-button-secondary" onClick={onCancel} type="button">Cancelar</button>
        <button className="studio-button studio-button-primary" type="submit">Guardar cambios</button>
      </div>
    </form>
  );
}

function todayLabel() {
  return new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function StudioDashboard() {
  const [orders] = useCollection('orders');
  const [sessions] = useCollection('sessions');
  const [prints] = useCollection('prints');
  const [attendance] = useCollection('attendance');
  const [products] = useCollection('products');

  const openOrders = orders.filter((row) => row.status !== 'Entregado').length;
  const readyOrders = orders.filter((row) => row.status === 'Listo para entrega').length;
  const todaySessions = sessions.filter((row) => row.date === today()).length;
  const inProduction = prints.filter((row) => row.status === 'En producción').length;
  const readyPrints = prints.filter((row) => row.status === 'Lista').length;
  const presentStaff = attendance.filter((row) => row.date === today() && row.checkIn).length;
  const todayAttendance = attendance.filter((row) => row.date === today()).length;
  const lowStock = products.filter((row) => Number(row.stock || 0) <= 3).length;

  const quickActions = [
    ['/pedidos', 'Nuevo pedido', 'Registra y da seguimiento', ClipboardList],
    ['/sesiones', 'Agenda', 'Organiza sesiones del estudio', CalendarDays],
    ['/impresiones', 'Impresiones', 'Controla producción y entrega', Images],
    ['/clientes', 'Clientes', 'Consulta historial y contacto', Users],
  ];

  return (
    <div className="studio-page">
      <div className="studio-page-heading studio-page-heading-dashboard">
        <div>
          <p className="studio-eyebrow">FOTO MINERVA · {todayLabel()}</p>
          <h1>Panel general del estudio</h1>
          <p className="studio-description">Prioridades, agenda y operación diaria en una sola vista.</p>
        </div>
        <Link className="studio-button studio-button-primary" to="/pedidos"><Plus size={16} /> Crear pedido</Link>
      </div>

      <section aria-label="Indicadores del estudio" className="studio-kpis">
        <article className="studio-card"><span>Pedidos abiertos</span><strong>{openOrders}</strong><small>{readyOrders} listos para entrega</small><Link to="/pedidos">Ver pedidos <ArrowRight size={12} /></Link></article>
        <article className="studio-card"><span>Sesiones hoy</span><strong>{todaySessions}</strong><small>{sessions.length} registradas en total</small><Link to="/sesiones">Ver agenda <ArrowRight size={12} /></Link></article>
        <article className="studio-card"><span>Impresiones activas</span><strong>{inProduction}</strong><small>{readyPrints} listas para entrega</small><Link to="/impresiones">Ver impresiones <ArrowRight size={12} /></Link></article>
        <article className="studio-card"><span>Asistencia de hoy</span><strong>{presentStaff} / {todayAttendance}</strong><small>personal con entrada registrada</small><Link to="/asistencia">Ver asistencia <ArrowRight size={12} /></Link></article>
      </section>

      <section className="studio-priority-strip" aria-label="Prioridades del estudio">
        <div><CheckCircle2 size={18} /><span><strong>{readyOrders}</strong> pedidos listos para entregar</span></div>
        <div><Images size={18} /><span><strong>{readyPrints}</strong> impresiones listas</span></div>
        <div className={lowStock ? 'is-warning' : ''}><AlertCircle size={18} /><span><strong>{lowStock}</strong> productos con stock bajo</span></div>
      </section>

      <section className="studio-quick-actions" aria-label="Acciones rápidas">
        {quickActions.map(([to, title, description, Icon]) => (
          <Link key={to} to={to}>
            <span className="studio-quick-icon"><Icon size={18} /></span>
            <span><strong>{title}</strong><small>{description}</small></span>
            <ArrowRight size={15} />
          </Link>
        ))}
      </section>

      <div className="studio-dashboard-grid">
        <section className="studio-panel">
          <div className="studio-section-heading"><div><h2>Seguimiento de pedidos</h2><p>Los pedidos que todavía requieren atención</p></div><Link to="/pedidos">Ver todos</Link></div>
          <div className="studio-table-wrap"><table className="studio-table"><thead><tr><th>Pedido</th><th>Descripción</th><th>Cliente</th><th>Productos</th><th>Estado</th></tr></thead><tbody>
            {orders.filter((row) => row.status !== 'Entregado').slice(0, 5).map((row) => <tr key={row.id}><td>{row.number}</td><td>{row.items}</td><td>{row.customer}</td><td>{row.productCount}</td><td><StatusBadge>{row.status}</StatusBadge></td></tr>)}
            {!openOrders && <tr><td className="studio-empty" colSpan="5">{orders.length ? 'No hay pedidos abiertos.' : 'Aún no hay pedidos registrados.'}</td></tr>}
          </tbody></table></div>
        </section>

        <section className="studio-panel">
          <div className="studio-section-heading"><div><h2>Agenda del día</h2><p>Sesiones fotográficas programadas</p></div><Link to="/sesiones">Abrir agenda</Link></div>
          <div className="studio-agenda">{sessions.filter((row) => row.date === today()).sort((a, b) => String(a.time || '').localeCompare(String(b.time || ''))).map((row) => <article className="studio-agenda-item" key={row.id}><strong>{row.time || '—'}</strong><div><b>{row.type}</b><span>{row.customer} · {row.location}</span></div><StatusBadge>{row.status}</StatusBadge></article>)}
            {!todaySessions && <p className="studio-empty">No hay sesiones programadas para hoy.</p>}
          </div>
        </section>

        <section className="studio-panel">
          <div className="studio-section-heading"><div><h2>Solicitudes de fotografías</h2><p>Producción reciente de impresiones</p></div><Link to="/impresiones">Ver solicitudes</Link></div>
          <div className="studio-table-wrap"><table className="studio-table"><thead><tr><th>Formato</th><th>Cantidad</th><th>Pedido</th><th>Cliente</th><th>Estado</th></tr></thead><tbody>
            {prints.slice(0, 4).map((row) => <tr key={row.id}><td>{row.format} · {row.size}</td><td>{row.quantity}</td><td>{row.order}</td><td>{row.customer}</td><td><StatusBadge>{row.status}</StatusBadge></td></tr>)}
            {!prints.length && <tr><td className="studio-empty" colSpan="5">No hay solicitudes de impresión registradas.</td></tr>}
          </tbody></table></div>
        </section>

        <section className="studio-panel">
          <div className="studio-section-heading"><div><h2>Registro de personal</h2><p>Asistencia del día</p></div><Link to="/asistencia">Ver registro</Link></div>
          <div className="studio-table-wrap"><table className="studio-table"><thead><tr><th>Trabajador</th><th>Horario</th><th>Estado</th></tr></thead><tbody>
            {attendance.filter((row) => row.date === today()).map((row) => <tr key={row.id}><td>{row.employee}</td><td>{row.checkIn || '—'} – {row.checkOut || '—'}</td><td><StatusBadge>{row.status}</StatusBadge></td></tr>)}
            {!attendance.some((row) => row.date === today()) && <tr><td className="studio-empty" colSpan="3">{attendance.length ? 'Sin registros para hoy.' : 'No hay registros de asistencia.'}</td></tr>}
          </tbody></table></div>
        </section>

        <section className="studio-panel studio-catalog-panel">
          <div className="studio-section-heading"><div><h2>Catálogo disponible</h2><p>Productos disponibles para pedidos</p></div><Link to="/productos">Administrar catálogo</Link></div>
          <div className="studio-catalog">{products.filter((product) => product.availability === 'Disponible').slice(0, 5).map((product) => <article key={product.id}><strong>{product.name}</strong><span>{product.category} · Stock {product.stock || 0}</span><b>{formatCurrency(product.price)}</b></article>)}
            {!products.some((product) => product.availability === 'Disponible') && <p className="studio-empty">{products.length ? 'No hay productos disponibles.' : 'Aún no hay productos registrados.'}</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

export function StudioModule({ module }) {
  const { token } = useAuth();
  const config = entityConfig[module];
  const Icon = moduleIcons[module];
  const [rows, setRows] = useCollection(module);
  const [allOrders] = useCollection('orders');
  const [allSessions] = useCollection('sessions');
  const [allPrints] = useCollection('prints');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
  if (module !== 'customers' || !token) return;

  const loadCustomers = async () => {
    try {
      const response = await fetch(`${API_URL}/customers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'No se pudieron cargar los clientes.'
        );
      }

      const customers = (data.data?.customers || []).map((customer) => ({
        ...customer,
        id: customer._id,
      }));

      setRows(customers);
    } catch (error) {
      setNotice(error.message);
    }
  };

  loadCustomers();
}, [module, token]);

useEffect(() => {
  if (module !== 'products' || !token) return;

  const loadProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'No se pudieron cargar los productos.'
        );
      }

      const products = (data.data?.products || []).map((product) => ({
        ...product,
        id: product._id,
      }));

      setRows(products);
    } catch (error) {
      setNotice(error.message);
    }
  };

  loadProducts();
}, [module, token]);

useEffect(() => {
  if (module !== 'sessions' || !token) return;

  const loadSessions = async () => {
    try {
      const response = await fetch(`${API_URL}/sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'No se pudieron cargar las sesiones.'
        );
      }

      const sessions = (data.data?.sessions || []).map((session) => ({
        ...session,
        id: session._id,
      }));

      setRows(sessions);
    } catch (error) {
      setNotice(error.message);
    }
  };

  loadSessions();
}, [module, token]);

useEffect(() => {
  if (module !== 'orders' || !token) return;

  const loadOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'No se pudieron cargar los pedidos.'
        );
      }

      const orders = (data.data?.orders || []).map((order) => ({
        ...order,
        id: order._id,
      }));

      setRows(orders);
    } catch (error) {
      setNotice(error.message);
    }
  };

  loadOrders();
}, [module, token]);

useEffect(() => {
  if (module !== 'prints' || !token) return;

  const loadPrints = async () => {
    try {
      const response = await fetch(`${API_URL}/prints`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'No se pudieron cargar las impresiones.'
        );
      }

      const prints = (data.data?.prints || []).map((print) => ({
        ...print,
        id: print._id,
      }));

      setRows(prints);
    } catch (error) {
      setNotice(error.message);
    }
  };

  loadPrints();
}, [module, token]);

useEffect(() => {
  if (module !== 'attendance' || !token) return;

  const loadAttendance = async () => {
    try {
      const response = await fetch(`${API_URL}/attendance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'No se pudo cargar la asistencia.'
        );
      }

      const attendance = (data.data?.attendance || []).map((record) => ({
        ...record,
        id: record._id,
      }));

      setRows(attendance);
    } catch (error) {
      setNotice(error.message);
    }
  };

  loadAttendance();
}, [module, token]);

  useEffect(() => {
    const handlePopState = () => {
      if (editing) {
        setEditing(null);
      } else if (detailId) {
        setDetailId(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [editing, detailId]);

  const handleOpenEdit = (record) => {
    window.history.pushState({ modal: true }, '');
    setEditing(record);
    setNotice('');
  };

  const handleCancelEdit = () => {
    if (editing) window.history.back();
    else setEditing(null);
  };

  const handleToggleDetail = (id) => {
    if (detailId === id) {
      window.history.back();
    } else {
      window.history.pushState({ detail: true }, '');
      setDetailId(id);
    }
  };

  const handleCloseDetail = () => window.history.back();

  const filtered = useMemo(() => rows.filter((row) => {
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery = !normalizedQuery || Object.values(row).some((value) => String(value).toLowerCase().includes(normalizedQuery));
    return matchesQuery && (!statusFilter || row.status === statusFilter || row.availability === statusFilter);
  }), [query, rows, statusFilter]);

  const save = async (form) => {
  if (module === 'customers') {
    try {
      const isEditing = Boolean(editing?.id);

      const response = await fetch(
        isEditing
          ? `${API_URL}/customers/${editing.id}`
          : `${API_URL}/customers`,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'No se pudo guardar el cliente.'
        );
      }

      const customer = data.data?.customer;

      if (customer) {
        const normalizedCustomer = {
          ...customer,
          id: customer._id,
        };

        setRows((current) => {
          if (isEditing) {
            return current.map((row) =>
              row.id === editing.id ? normalizedCustomer : row
            );
          }

          return [normalizedCustomer, ...current];
        });
      }

      setNotice(
        isEditing
          ? 'Cliente actualizado correctamente.'
          : 'Cliente guardado correctamente.'
      );

      setEditing(null);
      return;
    } catch (error) {
      setNotice(error.message);
      return;
    }
  }

  if (module === 'products') {
    try {
      const isEditing = Boolean(editing?.id);

      const response = await fetch(
        isEditing
          ? `${API_URL}/products/${editing.id}`
          : `${API_URL}/products`,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'No se pudo guardar el producto.'
        );
      }

      const product = data.data?.product;

      if (product) {
        const normalizedProduct = {
          ...product,
          id: product._id,
        };

        setRows((current) => {
          if (isEditing) {
            return current.map((row) =>
              row.id === editing.id ? normalizedProduct : row
            );
          }

          return [normalizedProduct, ...current];
        });
      }

      setNotice(
        isEditing
          ? 'Producto actualizado correctamente.'
          : 'Producto guardado correctamente.'
      );

      setEditing(null);
      return;
    } catch (error) {
      setNotice(error.message);
      return;
    }
  }

  if (module === 'sessions') {
    try {
      const isEditing = Boolean(editing?.id);

      const response = await fetch(
        isEditing
          ? `${API_URL}/sessions/${editing.id}`
          : `${API_URL}/sessions`,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'No se pudo guardar la sesión.'
        );
      }

      const session = data.data?.session;

      if (session) {
        const normalizedSession = {
          ...session,
          id: session._id,
        };

        setRows((current) => {
          if (isEditing) {
            return current.map((row) =>
              row.id === editing.id ? normalizedSession : row
            );
          }

          return [normalizedSession, ...current];
        });
      }

      setNotice(
        isEditing
          ? 'Sesión actualizada correctamente.'
          : 'Sesión guardada correctamente.'
      );

      setEditing(null);
      return;
    } catch (error) {
      setNotice(error.message);
      return;
    }
  }

  if (module === 'orders') {
  try {
    const isEditing = Boolean(editing?.id);

    const response = await fetch(
      isEditing
        ? `${API_URL}/orders/${editing.id}`
        : `${API_URL}/orders`,
      {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || 'No se pudo guardar el pedido.'
      );
    }

    const order = data.data?.order;

    if (order) {
      const normalizedOrder = {
        ...order,
        id: order._id,
      };

      setRows((current) => {
        if (isEditing) {
          return current.map((row) =>
            row.id === editing.id ? normalizedOrder : row
          );
        }

        return [normalizedOrder, ...current];
      });
    }

    setNotice(
      isEditing
        ? 'Pedido actualizado correctamente.'
        : 'Pedido guardado correctamente.'
    );

    setEditing(null);
    return;
  } catch (error) {
    setNotice(error.message);
    return;
  }
}

if (module === 'prints') {
  try {
    const isEditing = Boolean(editing?.id);

    const response = await fetch(
      isEditing
        ? `${API_URL}/prints/${editing.id}`
        : `${API_URL}/prints`,
      {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || 'No se pudo guardar la impresión.'
      );
    }

    const print = data.data?.print;

    if (print) {
      const normalizedPrint = {
        ...print,
        id: print._id,
      };

      setRows((current) => {
        if (isEditing) {
          return current.map((row) =>
            row.id === editing.id ? normalizedPrint : row
          );
        }

        return [normalizedPrint, ...current];
      });
    }

    setNotice(
      isEditing
        ? 'Impresión actualizada correctamente.'
        : 'Impresión guardada correctamente.'
    );

    setEditing(null);
    return;
  } catch (error) {
    setNotice(error.message);
    return;
  }
}
if (module === 'attendance') {
  try {
    const isEditing = Boolean(editing?.id);

    const response = await fetch(
      isEditing
        ? `${API_URL}/attendance/${editing.id}`
        : `${API_URL}/attendance`,
      {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || 'No se pudo guardar la asistencia.'
      );
    }

    const attendance = data.data?.attendance;

    if (attendance) {
      const normalizedAttendance = {
        ...attendance,
        id: attendance._id,
      };

      setRows((current) => {
        if (isEditing) {
          return current.map((row) =>
            row.id === editing.id ? normalizedAttendance : row
          );
        }

        return [normalizedAttendance, ...current];
      });
    }

    setNotice(
      isEditing
        ? 'Asistencia actualizada correctamente.'
        : 'Asistencia guardada correctamente.'
    );

    setEditing(null);
    return;
  } catch (error) {
    setNotice(error.message);
    return;
  }
}

  if (editing?.id) {
    setRows((current) =>
      current.map((row) =>
        row.id === editing.id
          ? { ...form, id: editing.id }
          : row
      )
    );

    setNotice(
      `${entityLabels[module]} actualizado correctamente.`
    );
  } else {
    const row = {
      ...form,
      id: `${module}-${Date.now()}`,
    };

    if (module === 'orders' && !row.number) {
      row.number = `FM-${String(Date.now()).slice(-5)}`;
    }

    if (module === 'attendance' && !row.status) {
      row.status = 'Pendiente de salida';
    }

    setRows((current) => [row, ...current]);

    setNotice(
      `${entityLabels[module]} guardado correctamente.`
    );
  }

  setEditing(null);
};

  const updateRecord = (id, changes) => setRows((current) => current.map((row) => row.id === id ? { ...row, ...changes } : row));

  const handleGeneratePdf = async (row) => {
    try {
      if (module === 'orders') {
        const title = `Pedido ${row.number || 'sin número'}`;
        const lines = [
          `Fecha: ${row.date || 'Sin fecha'}`,
          `Cliente: ${row.customer || 'Sin cliente'}`,
          `Estado: ${row.status || 'Sin estado'}`,
          '',
          `Artículos y servicios: ${row.items || 'Sin detalle'}`,
          `Cantidad de productos: ${row.productCount || 0}`,
          `Total: ${formatCurrency(row.total)}`,
          `Impresión asociada: ${row.prints || 'Ninguna'}`,
          `Sesión asociada: ${row.session || 'Ninguna'}`,
          '',
          `Documento generado: ${new Date().toLocaleString('es-MX')}`,
        ];
        const safeNumber = sanitizePdfText(row.number || row.id || 'pedido').replace(/[^a-zA-Z0-9_-]+/g, '-');
        const blob = await createPdfBlob(title, lines);
        await deliverPdf(`Foto-Minerva-Pedido-${safeNumber}.pdf`, blob);
        setNotice('PDF del pedido generado correctamente.');
        return;
      }

      if (module === 'customers') {
        const relatedOrders = allOrders.filter((item) => item.customer === row.name);
        const relatedSessions = allSessions.filter((item) => item.customer === row.name);
        const relatedPrints = allPrints.filter((item) => item.customer === row.name);
        const history = [
          ...relatedOrders.map((item) => `Pedido ${item.number || 'sin número'} - ${item.status || 'Sin estado'} - ${formatCurrency(item.total)}`),
          ...relatedSessions.map((item) => `Sesión ${item.type || ''} - ${item.date || ''} ${item.time || ''} - ${item.status || ''}`),
          ...relatedPrints.map((item) => `Impresión ${item.format || ''} ${item.size || ''} - ${item.status || ''}`),
        ];
        const lines = [
          `Cliente: ${row.name}`,
          `Teléfono: ${row.phone || 'Sin teléfono registrado'}`,
          `Correo: ${row.email || 'Sin correo registrado'}`,
          `Observaciones: ${row.notes || 'Sin observaciones'}`,
          '',
          `Pedidos: ${relatedOrders.length}`,
          `Sesiones: ${relatedSessions.length}`,
          `Impresiones: ${relatedPrints.length}`,
          '',
          'Historial:',
          ...(history.length ? history : ['Aún no hay operaciones asociadas.']),
          '',
          `Documento generado: ${new Date().toLocaleString('es-MX')}`,
        ];
        const safeName = sanitizePdfText(row.name || row.id || 'cliente').replace(/[^a-zA-Z0-9_-]+/g, '-');
        const blob = await createPdfBlob(`Ficha de cliente - ${row.name}`, lines);
        await deliverPdf(`Foto-Minerva-Cliente-${safeName}.pdf`, blob);
        setNotice('PDF del cliente generado correctamente.');
      }
    } catch {
      setNotice('No se pudo generar el PDF. Intenta nuevamente.');
    }
  };

  const moduleValue = module === 'orders'
    ? rows.reduce((total, row) => total + Number(row.total || 0), 0)
    : module === 'products'
      ? rows.reduce((total, row) => total + (Number(row.price || 0) * Number(row.stock || 0)), 0)
      : null;

  const summaryStatuses = config.statuses.slice(0, 3).map((status) => ({
    status,
    count: rows.filter((row) => row.status === status || row.availability === status).length,
  }));

  const clearFilters = () => {
    setQuery('');
    setStatusFilter('');
  };

  const recordDetail = (row) => {
    if (module === 'orders') {
      return (
        <div className="studio-related">
          <div className="studio-related-heading"><strong>Pedido {row.number}</strong><StatusBadge>{row.status}</StatusBadge></div>
          <div className="studio-detail-grid">
            <span><b>Cliente</b>{row.customer}</span><span><b>Fecha</b>{row.date}</span>
            <span className="studio-detail-wide"><b>Artículos y servicios</b>{row.items}</span>
            <span><b>Productos</b>{row.productCount}</span><span><b>Total</b>{formatCurrency(row.total)}</span>
            <span><b>Impresión</b>{row.prints || 'Ninguna'}</span><span><b>Sesión</b>{row.session || 'Ninguna'}</span>
          </div>
          <button className="studio-button studio-button-secondary studio-detail-close" onClick={handleCloseDetail} type="button">Volver a pedidos</button>
        </div>
      );
    }

    if (module === 'products') {
      return (
        <div className="studio-related">
          <div className="studio-related-heading"><strong>{row.name}</strong><StatusBadge>{row.availability}</StatusBadge></div>
          <div className="studio-detail-grid">
            <span><b>Categoría</b>{row.category}</span><span><b>Precio</b>{formatCurrency(row.price)}</span>
            <span><b>Existencia</b>{row.stock}</span><span><b>Valor de stock</b>{formatCurrency(Number(row.price || 0) * Number(row.stock || 0))}</span>
            <span className="studio-detail-wide"><b>Descripción</b>{row.description || 'Sin descripción'}</span>
          </div>
          <button className="studio-button studio-button-secondary studio-detail-close" onClick={handleCloseDetail} type="button">Volver a productos</button>
        </div>
      );
    }

    if (module === 'sessions') {
      return (
        <div className="studio-related">
          <div className="studio-related-heading"><strong>{row.type}</strong><StatusBadge>{row.status}</StatusBadge></div>
          <div className="studio-detail-grid">
            <span><b>Cliente</b>{row.customer}</span><span><b>Fecha y hora</b>{row.date} · {row.time}</span>
            <span><b>Responsable</b>{row.responsible}</span><span><b>Ubicación</b>{row.location}</span>
            <span className="studio-detail-wide"><b>Notas</b>{row.notes || 'Sin notas adicionales'}</span>
          </div>
          <button className="studio-button studio-button-secondary studio-detail-close" onClick={handleCloseDetail} type="button">Volver a sesiones</button>
        </div>
      );
    }

    if (module === 'prints') {
      return (
        <div className="studio-related">
          <div className="studio-related-heading"><strong>{row.format} · {row.size}</strong><StatusBadge>{row.status}</StatusBadge></div>
          <div className="studio-detail-grid">
            <span><b>Cliente</b>{row.customer}</span><span><b>Pedido</b>{row.order}</span>
            <span><b>Cantidad</b>{row.quantity}</span><span><b>Acabado</b>{row.finish}</span>
            <span><b>Fecha</b>{row.date}</span><span><b>Formato</b>{row.format}</span>
          </div>
          <button className="studio-button studio-button-secondary studio-detail-close" onClick={handleCloseDetail} type="button">Volver a impresiones</button>
        </div>
      );
    }

    if (module === 'attendance') {
      return (
        <div className="studio-related">
          <div className="studio-related-heading"><strong>{row.employee}</strong><StatusBadge>{row.status}</StatusBadge></div>
          <div className="studio-detail-grid">
            <span><b>Fecha</b>{row.date}</span><span><b>Entrada</b>{row.checkIn || 'Sin registrar'}</span>
            <span><b>Salida</b>{row.checkOut || 'Sin registrar'}</span><span><b>Estado</b>{row.status}</span>
          </div>
          <button className="studio-button studio-button-secondary studio-detail-close" onClick={handleCloseDetail} type="button">Volver a asistencia</button>
        </div>
      );
    }

    const relatedOrders = allOrders.filter((item) => item.customer === row.name);
    const relatedSessions = allSessions.filter((item) => item.customer === row.name);
    const relatedPrints = allPrints.filter((item) => item.customer === row.name);
    return (
      <div className="studio-related">
        <div className="studio-related-heading"><strong>Historial de {row.name}</strong><span className="studio-badge">{relatedOrders.length + relatedSessions.length + relatedPrints.length} movimientos</span></div>
        <div className="studio-client-history-summary"><span><strong>{relatedOrders.length}</strong> pedidos</span><span><strong>{relatedSessions.length}</strong> sesiones</span><span><strong>{relatedPrints.length}</strong> impresiones</span></div>
        <div className="studio-history-list">
          {[...relatedOrders.map((item) => `Pedido ${item.number}: ${item.status}`), ...relatedSessions.map((item) => `${item.type}: ${item.date} ${item.time}`), ...relatedPrints.map((item) => `${item.format}: ${item.status}`)].map((item) => <span key={item}>{item}</span>)}
          {!relatedOrders.length && !relatedSessions.length && !relatedPrints.length && <span>Aún no hay operaciones asociadas.</span>}
        </div>
        <button className="studio-button studio-button-secondary studio-detail-close" onClick={handleCloseDetail} type="button">Volver a clientes</button>
      </div>
    );
  };

  return (
    <div className="studio-page">
      <div className="studio-page-heading">
        <div className="studio-page-title-row">
          <span className="studio-page-icon"><Icon size={19} /></span>
          <div><p className="studio-eyebrow">FOTO MINERVA · OPERACIÓN</p><h1>{config.title}</h1><p className="studio-description">{config.description}</p></div>
        </div>
        <button className="studio-button studio-button-primary" onClick={() => handleOpenEdit({})} type="button"><Plus size={16} /> {config.addLabel}</button>
      </div>

      <section className="studio-module-summary" aria-label={`Resumen de ${config.title}`}>
        <div><span>Total</span><strong>{rows.length}</strong></div>
        <div><span>En esta vista</span><strong>{filtered.length}</strong></div>
        {summaryStatuses.map(({ status, count }) => <div key={status}><span>{status}</span><strong>{count}</strong></div>)}
        {moduleValue !== null && <div><span>{module === 'orders' ? 'Valor registrado' : 'Valor del inventario'}</span><strong>{formatCurrency(moduleValue)}</strong></div>}
      </section>

      {notice && <p className="studio-notice" role="status"><CheckCircle2 size={16} /> {notice}</p>}

      <section className="studio-panel studio-list-panel">
        <div className="studio-tools">
          <label className="studio-search"><Search aria-hidden="true" size={17} /><input aria-label={config.search} onChange={(event) => setQuery(event.target.value)} placeholder={config.search} value={query} /></label>
          {config.statuses.length > 0 && <label className="studio-filter"><span>Estado</span><select aria-label="Filtrar por estado" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}><option value="">Todos</option>{config.statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>}
          {(query || statusFilter) && <button className="studio-clear-filter" onClick={clearFilters} type="button">Limpiar filtros</button>}
          <span className="studio-result-count">{filtered.length} de {rows.length} registros</span>
        </div>

        {module === 'sessions' && <section className="studio-session-agenda" aria-label="Agenda visual de sesiones">
          <div className="studio-section-heading"><div><h2>Agenda de sesiones</h2><p>Ordenada por fecha y hora</p></div></div>
          <div className="studio-agenda studio-agenda-board">{rows.slice().sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)).map((row) => <article className="studio-agenda-item" key={row.id}><strong>{row.time || '—'}</strong><div><b>{row.type}</b><span>{row.date} · {row.customer} · {row.location}</span></div><StatusBadge>{row.status}</StatusBadge></article>)}
            {!rows.length && <p className="studio-empty">{emptyMessages.sessions}</p>}
          </div>
        </section>}

        {editing && <div className="studio-form-panel"><div className="studio-form-heading"><div><h2>{editing.id ? `Editar ${entityLabels[module].toLowerCase()}` : config.addLabel}</h2><p>Completa la información y guarda los cambios.</p></div></div><RecordForm config={config} initial={editing.id ? editing : undefined} onCancel={handleCancelEdit} onSave={save} /></div>}

        {module === 'customers' ? (
          <div className="studio-customer-grid">
            {filtered.map((row) => (
              <article className="studio-customer-card" key={row.id}>
                <div className="studio-customer-card-heading">
                  <span className="studio-customer-avatar" aria-hidden="true">
                    {String(row.name || 'CL').slice(0, 2).toUpperCase()}
                  </span>
                  <div><h2>{row.name}</h2><span>Cliente del estudio</span></div>
                </div>
                <dl className="studio-customer-contact">
                  <div><dt>Teléfono</dt><dd>{row.phone || 'Sin teléfono registrado'}</dd></div>
                  <div><dt>Correo</dt><dd>{row.email || 'Sin correo registrado'}</dd></div>
                </dl>
                {row.notes && <p className="studio-customer-notes">{row.notes}</p>}
                <div className="studio-customer-actions">
                  <button className="studio-text-button" onClick={() => handleToggleDetail(row.id)} type="button">{detailId === row.id ? 'Cerrar historial' : 'Ver historial'}</button>
                  <button className="studio-text-button" onClick={() => handleGeneratePdf(row)} type="button">Generar PDF</button>
                  <button className="studio-text-button" onClick={() => handleOpenEdit(row)} type="button">Editar cliente</button>
                </div>
                {detailId === row.id && recordDetail(row)}
              </article>
            ))}
            {!filtered.length && <p className="studio-empty studio-empty-card">{rows.length ? 'No se encontraron clientes con esa búsqueda.' : `${emptyMessages.customers} Puedes registrar uno nuevo.`}</p>}
          </div>
        ) : (
          <div className="studio-table-wrap"><table className="studio-table studio-data-table">
            <thead><tr>{config.columns.map(([, label]) => <th key={label}>{label}</th>)}<th>Acciones</th></tr></thead>
            <tbody>
              {filtered.map((row) => (
                <Fragment key={row.id}>
                  <tr>
                    {config.columns.map(([key, label]) => <td data-label={label} key={key}>{key === 'status' || key === 'availability' ? (
                      <select aria-label={`Cambiar ${config.title.toLowerCase()} ${row.number || row.name || row.employee || ''}`} className="studio-status-select" onChange={(event) => updateRecord(row.id, { [key]: event.target.value })} value={row[key] || ''}>{config.statuses.map((status) => <option key={status}>{status}</option>)}</select>
                    ) : key === 'total' || key === 'price' ? formatCurrency(row[key]) : row[key] || '—'}</td>)}
                    <td className="studio-row-actions" data-label="Acciones">
                      {module === 'attendance' && row.status !== 'Ausencia' && (row.checkIn ? (
                        <button className="studio-text-button" onClick={() => { updateRecord(row.id, { checkOut: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }), status: 'Jornada completada' }); setNotice('Salida registrada correctamente.'); }} type="button">Registrar salida</button>
                      ) : <button className="studio-text-button" onClick={() => { updateRecord(row.id, { checkIn: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }), status: 'Pendiente de salida' }); setNotice('Entrada registrada correctamente.'); }} type="button">Registrar entrada</button>)}
                      {module === 'orders' && <button className="studio-text-button" onClick={() => handleGeneratePdf(row)} type="button">Generar PDF</button>}
                      <button className="studio-text-button" onClick={() => handleToggleDetail(row.id)} type="button">{detailId === row.id ? 'Cerrar detalle' : 'Ver detalle'}</button>
                      <button className="studio-text-button" onClick={() => handleOpenEdit(row)} type="button">Editar</button>
                    </td>
                  </tr>
                  {detailId === row.id && <tr className="studio-detail-row" key={`${row.id}-detail`}><td colSpan={config.columns.length + 1}>{recordDetail(row)}</td></tr>}
                </Fragment>
              ))}
              {!filtered.length && <tr><td className="studio-empty" colSpan={config.columns.length + 1}>{rows.length ? 'No se encontraron registros con esos filtros.' : `${emptyMessages[module]} Puedes crear uno nuevo.`}</td></tr>}
            </tbody>
          </table></div>
        )}
      </section>

      <p className="studio-local-note">Los datos operativos de esta versión se guardan localmente en este dispositivo o navegador.</p>
    </div>
  );
}
