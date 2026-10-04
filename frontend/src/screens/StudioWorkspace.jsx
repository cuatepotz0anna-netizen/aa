import { Fragment, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './StudioWorkspace.css';

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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
    search: 'Buscar pedido o cliente',
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
    search: 'Buscar producto',
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
    search: 'Buscar sesión o cliente',
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
    search: 'Buscar impresión o cliente',
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

function StatusBadge({ children }) {
  return <span className="studio-badge">{children || '—'}</span>;
}

function RecordForm({ config, initial, onCancel, onSave }) {
  const [form, setForm] = useState(() => initial || Object.fromEntries(config.fields.map(([key]) => [key, key === 'date' ? today() : ''])));
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  return (
    <form className="studio-form" onSubmit={(event) => { event.preventDefault(); onSave(form); }}>
      <div className="studio-form-grid">
        {config.fields.map(([key, label, type, required, options]) => (
          <label className={`studio-field${type === 'textarea' ? ' studio-field-wide' : ''}`} key={key}>
            <span>{label}</span>
            {type === 'select' ? (
              <select name={key} onChange={update} required={required} value={form[key] || ''}>
                <option value="">Selecciona</option>
                {options.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            ) : type === 'textarea' ? (
              <textarea name={key} onChange={update} required={required} rows={3} value={form[key] || ''} />
            ) : (
              <input name={key} onChange={update} required={required} type={type} value={form[key] || ''} />
            )}
          </label>
        ))}
      </div>
      <div className="studio-form-actions">
        <button className="studio-button studio-button-secondary" onClick={onCancel} type="button">Cancelar</button>
        <button className="studio-button studio-button-primary" type="submit">Guardar</button>
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
  const todaySessions = sessions.filter((row) => row.date === today()).length;
  const inProduction = prints.filter((row) => row.status === 'En producción').length;
  const presentStaff = attendance.filter((row) => row.date === today() && row.checkIn).length;

  return (
    <div className="studio-page">
      <div className="studio-page-heading">
        <div><p className="studio-eyebrow">FOTO MINERVA · {todayLabel()}</p><h1>Panel general del estudio</h1><p className="studio-description">Pedidos, sesiones y trabajo del equipo en un solo lugar.</p></div>
        <Link className="studio-button studio-button-primary" to="/pedidos"><Plus size={16} /> Crear pedido</Link>
      </div>
      <section aria-label="Indicadores del estudio" className="studio-kpis">
        <article className="studio-card"><span>Pedidos abiertos</span><strong>{openOrders}</strong><Link to="/pedidos">Ver pedidos</Link></article>
        <article className="studio-card"><span>Sesiones hoy</span><strong>{todaySessions}</strong><Link to="/sesiones">Ver agenda</Link></article>
        <article className="studio-card"><span>Impresiones en producción</span><strong>{inProduction}</strong><Link to="/impresiones">Ver impresiones</Link></article>
        <article className="studio-card"><span>Asistencia de hoy</span><strong>{presentStaff} / {attendance.filter((row) => row.date === today()).length}</strong><Link to="/asistencia">Ver asistencia</Link></article>
      </section>
      <div className="studio-dashboard-grid">
        <section className="studio-panel">
          <div className="studio-section-heading"><div><h2>Seguimiento de pedidos</h2><p>Estado actual de los pedidos abiertos</p></div><Link to="/pedidos">Ver todos</Link></div>
          <div className="studio-table-wrap"><table className="studio-table"><thead><tr><th>Pedido</th><th>Descripción</th><th>Cliente</th><th>Productos</th><th>Estado</th></tr></thead><tbody>
            {orders.filter((row) => row.status !== 'Entregado').slice(0, 5).map((row) => <tr key={row.id}><td>{row.number}</td><td>{row.items}</td><td>{row.customer}</td><td>{row.productCount}</td><td><StatusBadge>{row.status}</StatusBadge></td></tr>)}
            {!openOrders && <tr><td className="studio-empty" colSpan="5">{orders.length ? 'No hay pedidos abiertos.' : 'Aún no hay pedidos registrados.'}</td></tr>}
          </tbody></table></div>
        </section>
        <section className="studio-panel">
          <div className="studio-section-heading"><div><h2>Agenda del día</h2><p>Sesiones fotográficas</p></div><Link to="/sesiones">Abrir agenda</Link></div>
          <div className="studio-agenda">{sessions.filter((row) => row.date === today()).sort((a, b) => a.time.localeCompare(b.time)).map((row) => <article className="studio-agenda-item" key={row.id}><strong>{row.time}</strong><div><b>{row.type}</b><span>{row.customer} · {row.location}</span></div><StatusBadge>{row.status}</StatusBadge></article>)}
            {!todaySessions && <p className="studio-empty">No hay sesiones programadas para hoy.</p>}
          </div>
        </section>
        <section className="studio-panel">
          <div className="studio-section-heading"><div><h2>Solicitudes de fotografías</h2><p>Formatos y pedidos asociados</p></div><Link to="/impresiones">Ver solicitudes</Link></div>
          <div className="studio-table-wrap"><table className="studio-table"><thead><tr><th>Formato</th><th>Cantidad</th><th>Pedido</th><th>Cliente</th><th>Estado</th></tr></thead><tbody>
            {prints.slice(0, 4).map((row) => <tr key={row.id}><td>{row.format} · {row.size}</td><td>{row.quantity}</td><td>{row.order}</td><td>{row.customer}</td><td><StatusBadge>{row.status}</StatusBadge></td></tr>)}
            {!prints.length && <tr><td className="studio-empty" colSpan="5">No hay impresiones en producción.</td></tr>}
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
          <div className="studio-section-heading"><div><h2>Catálogo disponible</h2><p>Productos y artículos para pedidos</p></div><Link to="/productos">Administrar catálogo</Link></div>
          <div className="studio-catalog">{products.filter((product) => product.availability === 'Disponible').slice(0, 5).map((product) => <article key={product.id}><strong>{product.name}</strong><span>{product.category}</span><b>${Number(product.price).toLocaleString('es-MX')}</b></article>)}
            {!products.some((product) => product.availability === 'Disponible') && <p className="studio-empty">{products.length ? 'No hay productos disponibles.' : 'Aún no hay productos registrados.'}</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

export function StudioModule({ module }) {
  const config = entityConfig[module];
  const [rows, setRows] = useCollection(module);
  const [allOrders] = useCollection('orders');
  const [allSessions] = useCollection('sessions');
  const [allPrints] = useCollection('prints');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [notice, setNotice] = useState('');

  const filtered = rows.filter((row) => {
    const matchesQuery = Object.values(row).some((value) => String(value).toLowerCase().includes(query.toLowerCase()));
    return matchesQuery && (!statusFilter || row.status === statusFilter || row.availability === statusFilter);
  });

  const save = (form) => {
    if (editing?.id) {
      setRows((current) => current.map((row) => row.id === editing.id ? { ...form, id: editing.id } : row));
      setNotice(`${entityLabels[module]} actualizado.`);
    } else {
      const row = { ...form, id: `${module}-${Date.now()}` };
      if (module === 'orders' && !row.number) row.number = `FM-${String(Date.now()).slice(-5)}`;
      if (module === 'attendance' && !row.status) row.status = 'Pendiente de salida';
      setRows((current) => [row, ...current]);
      setNotice(`${entityLabels[module]} guardado.`);
    }
    setEditing(null);
  };

  const updateRecord = (id, changes) => setRows((current) => current.map((row) => row.id === id ? { ...row, ...changes } : row));

  const recordDetail = (row) => {
    if (module === 'orders') {
      return <div className="studio-related"><strong>Detalle del pedido {row.number}</strong><span>Fecha: {row.date} · Cliente: {row.customer}</span><span>Artículos y servicios: {row.items}</span><span>Productos: {row.productCount} · Total: ${Number(row.total || 0).toLocaleString('es-MX')}</span><span>Impresión asociada: {row.prints || 'Ninguna'} · Sesión: {row.session || 'Ninguna'}</span></div>;
    }
    if (module !== 'customers') return null;
    const relatedOrders = allOrders.filter((item) => item.customer === row.name);
    const relatedSessions = allSessions.filter((item) => item.customer === row.name);
    const relatedPrints = allPrints.filter((item) => item.customer === row.name);
    return (
      <div className="studio-related">
        <strong>Historial del cliente</strong>
        <span>Pedidos: {relatedOrders.length} · Sesiones: {relatedSessions.length} · Impresiones: {relatedPrints.length}</span>
        {[...relatedOrders.map((item) => `Pedido ${item.number}: ${item.status}`), ...relatedSessions.map((item) => `${item.type}: ${item.date} ${item.time}`), ...relatedPrints.map((item) => `${item.format}: ${item.status}`)].map((item) => <span key={item}>{item}</span>)}
        {!relatedOrders.length && !relatedSessions.length && !relatedPrints.length && <span>Aún no hay operaciones asociadas.</span>}
      </div>
    );
  };

  return (
    <div className="studio-page">
      <div className="studio-page-heading">
        <div><p className="studio-eyebrow">FOTO MINERVA · OPERACIÓN</p><h1>{config.title}</h1><p className="studio-description">{config.description}</p></div>
        <button className="studio-button studio-button-primary" onClick={() => { setEditing({}); setNotice(''); }} type="button"><Plus size={16} /> {config.addLabel}</button>
      </div>
      {notice && <p className="studio-notice" role="status">{notice}</p>}
      <section className="studio-panel studio-list-panel">
        <div className="studio-tools">
          <label className="studio-search"><Search aria-hidden="true" size={17} /><input aria-label={config.search} onChange={(event) => setQuery(event.target.value)} placeholder={config.search} value={query} /></label>
          {config.statuses.length > 0 && <label className="studio-filter"><span>Estado</span><select aria-label="Filtrar por estado" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}><option value="">Todos</option>{config.statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>}
          <span className="studio-result-count">{filtered.length} registros</span>
        </div>
        {module === 'sessions' && <section className="studio-session-agenda" aria-label="Agenda visual de sesiones">
          <h2>Agenda de sesiones</h2>
          <div className="studio-agenda studio-agenda-board">{rows.slice().sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)).map((row) => <article className="studio-agenda-item" key={row.id}><strong>{row.time}</strong><div><b>{row.type}</b><span>{row.date} · {row.customer} · {row.location}</span></div><StatusBadge>{row.status}</StatusBadge></article>)}
            {!rows.length && <p className="studio-empty">{emptyMessages.sessions}</p>}
          </div>
        </section>}
        {editing && <div className="studio-form-panel"><h2>{editing.id ? `Editar ${entityLabels[module].toLowerCase()}` : config.addLabel}</h2><RecordForm config={config} initial={editing.id ? editing : undefined} onCancel={() => setEditing(null)} onSave={save} /></div>}
        {module === 'customers' ? (
          <div className="studio-customer-grid">
            {filtered.map((row) => (
              <article className="studio-customer-card" key={row.id}>
                <div className="studio-customer-card-heading">
                  <span className="studio-customer-avatar" aria-hidden="true">{row.name.slice(0, 2).toUpperCase()}</span>
                  <div><h2>{row.name}</h2><span>Cliente del estudio</span></div>
                </div>
                <dl className="studio-customer-contact">
                  <div><dt>Teléfono</dt><dd>{row.phone || 'Sin teléfono registrado'}</dd></div>
                  <div><dt>Correo</dt><dd>{row.email || 'Sin correo registrado'}</dd></div>
                </dl>
                {row.notes && <p className="studio-customer-notes">{row.notes}</p>}
                <div className="studio-customer-actions">
                  <button className="studio-text-button" onClick={() => setDetailId(detailId === row.id ? null : row.id)} type="button">{detailId === row.id ? 'Ocultar historial' : 'Ver historial'}</button>
                  <button className="studio-text-button" onClick={() => { setEditing(row); setNotice(''); }} type="button">Editar cliente</button>
                </div>
                {detailId === row.id && recordDetail(row)}
              </article>
            ))}
            {!filtered.length && <p className="studio-empty">{rows.length ? 'No se encontraron clientes con esa búsqueda.' : `${emptyMessages.customers} Puedes registrar uno nuevo.`}</p>}
          </div>
        ) : (
          <div className="studio-table-wrap"><table className="studio-table">
            <thead><tr>{config.columns.map(([, label]) => <th key={label}>{label}</th>)}<th>Acciones</th></tr></thead>
            <tbody>
              {filtered.map((row) => (
                <Fragment key={row.id}>
                  <tr>
                    {config.columns.map(([key]) => <td key={key}>{key === 'status' || key === 'availability' ? (
                      <select aria-label={`Cambiar ${config.title.toLowerCase()} ${row.number || row.name || row.employee || ''}`} className="studio-status-select" onChange={(event) => updateRecord(row.id, { [key]: event.target.value })} value={row[key] || ''}>{config.statuses.map((status) => <option key={status}>{status}</option>)}</select>
                    ) : key === 'total' || key === 'price' ? `$${Number(row[key] || 0).toLocaleString('es-MX')}` : row[key] || '—'}</td>)}
                    <td className="studio-row-actions">
                      {module === 'attendance' && row.status !== 'Ausencia' && (row.checkIn ? (
                        <button className="studio-text-button" onClick={() => { updateRecord(row.id, { checkOut: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }), status: 'Jornada completada' }); setNotice('Salida registrada.'); }} type="button">Registrar salida</button>
                      ) : <button className="studio-text-button" onClick={() => { updateRecord(row.id, { checkIn: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }), status: 'Pendiente de salida' }); setNotice('Entrada registrada.'); }} type="button">Registrar entrada</button>)}
                      {module === 'orders' && <button className="studio-text-button" onClick={() => setDetailId(detailId === row.id ? null : row.id)} type="button">{detailId === row.id ? 'Ocultar detalle' : 'Ver detalle'}</button>}
                      <button className="studio-text-button" onClick={() => { setEditing(row); setNotice(''); }} type="button">Editar</button>
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
      <p className="studio-local-note">Los cambios de esta vista se guardan localmente en este navegador.</p>
    </div>
  );
}
