import { useState } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import './CustomerInsights.css';

const segments = [
  { name: 'VIP / Alto valor', count: 32, percentage: 13, trend: '+8%', tone: 'vip', description: 'Mayor gasto acumulado y compras recientes.' },
  { name: 'Recurrentes', count: 60, percentage: 24, trend: '+5%', tone: 'repeat', description: 'Regresan de forma constante a sesiones o productos.' },
  { name: 'Alto ticket ocasional', count: 28, percentage: 11, trend: '+2%', tone: 'ticket', description: 'Invierten mucho por visita, con menor frecuencia.' },
  { name: 'Frecuentes de bajo ticket', count: 42, percentage: 17, trend: '+4%', tone: 'frequent', description: 'Visitan seguido y suelen elegir paquetes pequeños.' },
  { name: 'Nuevos', count: 39, percentage: 16, trend: '+12%', tone: 'new', description: 'Primera compra registrada en los últimos 90 días.' },
  { name: 'En riesgo', count: 25, percentage: 10, trend: '−3%', tone: 'risk', description: 'Clientes valiosos cuya visita ya se está retrasando.' },
  { name: 'Inactivos', count: 22, percentage: 9, trend: '−1%', tone: 'inactive', description: 'Sin compras registradas durante más de 12 meses.' },
];

const clients = [
  {
    name: 'Familia Luna R.',
    initials: 'FL',
    spend: 42800,
    purchases: 6,
    sessions: 5,
    average: 7133,
    lastVisit: '25 sep 2026',
    frequency: 'Cada 2 meses',
    service: 'Sesión familiar',
    segment: 'VIP / Alto valor',
    tone: 'vip',
    products: ['Álbum premium', 'Impresiones fine art', 'Paquete digital'],
    monthlySpend: [2400, 0, 6800, 0, 3900, 0, 12400, 0, 4500, 0, 0, 12800],
    activeMonths: ['Ene', 'Mar', 'May', 'Jul', 'Sep', 'Oct'],
    reason: 'Este cliente se encuentra en el 20% superior de gasto, ha realizado 6 compras durante los últimos 12 meses y su última visita fue hace menos de 30 días.',
  },
  {
    name: 'Mariana Solís (demo)',
    initials: 'MS',
    spend: 18600,
    purchases: 4,
    sessions: 4,
    average: 4650,
    lastVisit: '28 sep 2026',
    frequency: 'Cada 3 meses',
    service: 'Maternidad',
    segment: 'Recurrentes',
    tone: 'repeat',
    products: ['Paquete digital', 'Ampliación 30 × 40'],
    monthlySpend: [0, 4200, 0, 0, 5600, 0, 0, 4100, 0, 4700, 0, 0],
    activeMonths: ['Feb', 'May', 'Ago', 'Oct'],
    reason: 'Ha completado 4 compras en el último año, con visitas distribuidas durante el periodo y una recencia menor a 45 días.',
  },
  {
    name: 'Estudio Nube (demo)',
    initials: 'EN',
    spend: 24600,
    purchases: 2,
    sessions: 2,
    average: 12300,
    lastVisit: '20 ago 2026',
    frequency: 'Cada 6 meses',
    service: 'Corporativo',
    segment: 'Alto ticket ocasional',
    tone: 'ticket',
    products: ['Paquete digital', 'Impresiones corporativas'],
    monthlySpend: [0, 0, 11200, 0, 0, 0, 0, 13400, 0, 0, 0, 0],
    activeMonths: ['Mar', 'Ago'],
    reason: 'Su ticket promedio supera ampliamente la media del estudio, aunque registra solo 2 compras durante los últimos 12 meses.',
  },
  {
    name: 'Familia Robles (demo)',
    initials: 'FR',
    spend: 9600,
    purchases: 5,
    sessions: 4,
    average: 1920,
    lastVisit: '26 sep 2026',
    frequency: 'Cada 2 meses',
    service: 'Retrato individual',
    segment: 'Frecuentes de bajo ticket',
    tone: 'frequent',
    products: ['Impresiones 13 × 18'],
    monthlySpend: [900, 0, 1600, 0, 2100, 0, 1750, 0, 0, 3250, 0, 0],
    activeMonths: ['Ene', 'Mar', 'May', 'Jul', 'Oct'],
    reason: 'Ha realizado 5 compras en el último año con visitas frecuentes; su gasto y ticket promedio permanecen por debajo de la media.',
  },
  {
    name: 'Valeria Campos (demo)',
    initials: 'VC',
    spend: 5800,
    purchases: 1,
    sessions: 1,
    average: 5800,
    lastVisit: '01 oct 2026',
    frequency: 'Primera visita',
    service: 'XV años',
    segment: 'Nuevos',
    tone: 'new',
    products: ['Álbum 20 × 20'],
    monthlySpend: [0, 0, 0, 0, 0, 0, 0, 0, 0, 5800, 0, 0],
    activeMonths: ['Oct'],
    reason: 'Su primera compra quedó registrada hace menos de 90 días y aún no cuenta con compras previas para estimar recurrencia.',
  },
  {
    name: 'Familia Prado (demo)',
    initials: 'FP',
    spend: 22400,
    purchases: 3,
    sessions: 3,
    average: 7467,
    lastVisit: '14 jun 2026',
    frequency: 'Cada 4 meses',
    service: 'Sesión familiar',
    segment: 'En riesgo',
    tone: 'risk',
    products: ['Álbum clásico', 'Ampliación 40 × 60'],
    monthlySpend: [0, 7200, 0, 0, 8400, 0, 0, 6800, 0, 0, 0, 0],
    activeMonths: ['Feb', 'May', 'Ago'],
    reason: 'Acumula un gasto por encima de la media, pero lleva más de 100 días sin comprar; su historial anterior muestra una visita cada 4 meses.',
  },
];

const opportunities = [
  { title: 'VIP sin reservar en 60 días', count: '8 clientes', detail: 'Invítalos a una sesión de temporada antes de su ventana habitual.', tone: 'wine' },
  { title: 'Recurrentes sin álbum', count: '19 clientes', detail: 'Ofrece un álbum para convertir sus sesiones en un recuerdo duradero.', tone: 'rose' },
  { title: 'Alto ticket y baja frecuencia', count: '12 clientes', detail: 'Presenta paquetes de seguimiento y fechas de reserva anticipada.', tone: 'plum' },
  { title: 'Familias con recompra anual', count: '31 familias', detail: 'Activa recordatorios antes de la temporada en que suelen regresar.', tone: 'pale' },
  { title: 'Corporativos en crecimiento', count: '6 cuentas', detail: 'Su gasto subió en los últimos dos periodos; prepara una propuesta anual.', tone: 'wine' },
];

const mainServices = [
  { name: 'Sesión familiar', share: '28%' },
  { name: 'XV años', share: '18%' },
  { name: 'Retrato individual', share: '16%' },
  { name: 'Maternidad y newborn', share: '14%' },
];

const formatMoney = (amount) => `$${amount.toLocaleString('es-MX')}`;

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {action}
    </div>
  );
}

function MetricCard({ label, value, note, trend, tone = '' }) {
  return (
    <article className={`metric-panel insight-metric ${tone}`}>
      <div className="insight-metric-heading">
        <p className="metric-label">{label}</p>
        {trend && <span className="metric-trend"><ArrowUpRight size={13} /> {trend}</span>}
      </div>
      <p className="metric-value">{value}</p>
      <p className="metric-detail">{note}</p>
    </article>
  );
}

function SegmentCards({ compact = false }) {
  return (
    <div className={`segment-grid${compact ? ' segment-grid-compact' : ''}`}>
      {segments.map((segment) => (
        <article className={`segment-card segment-${segment.tone}`} key={segment.name}>
          <div className="segment-card-top">
            <span className="segment-dot" aria-hidden="true" />
            <span className={`segment-trend${segment.trend.startsWith('−') ? ' trend-down' : ''}`}>
              {segment.trend.startsWith('−') ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}
              {segment.trend}
            </span>
          </div>
          <p className="segment-count">{segment.count}</p>
          <h3>{segment.name}</h3>
          {!compact && <p className="segment-description">{segment.description}</p>}
          <div className="segment-progress" aria-label={`${segment.percentage}% de clientes`}>
            <span style={{ width: `${segment.percentage}%` }} />
          </div>
          <p className="segment-share">{segment.percentage}% de la cartera</p>
        </article>
      ))}
    </div>
  );
}

function RfmNote() {
  return (
    <aside className="rfm-note">
      <span className="rfm-mark" aria-hidden="true">RFM</span>
      <div>
        <h3>Segmentación por comportamiento real</h3>
        <p><strong>R</strong> Recencia <span>·</span> <strong>F</strong> Frecuencia <span>·</span> <strong>M</strong> Valor monetario</p>
        <small>Los segmentos se calculan usando compras reales registradas, no respuestas declaradas en encuestas.</small>
      </div>
    </aside>
  );
}

function SpendingChart({ onSelectClient }) {
  const plotClients = clients.slice(0, 6);
  return (
    <article className="content-panel behavior-panel">
      <div className="panel-heading">
        <div><h2>Gasto vs frecuencia</h2><p>Cada punto representa un cliente; el tamaño refleja su ticket promedio.</p></div>
        <span className="chart-legend"><i /> Clientes</span>
      </div>
      <div className="scatter-chart" role="img" aria-label="Gráfico de dispersión de gasto total frente a frecuencia de compra">
        <div className="scatter-y-label">Gasto total</div>
        <div className="scatter-y-ticks"><span>$40 mil</span><span>$30 mil</span><span>$20 mil</span><span>$10 mil</span><span>$0</span></div>
        <div className="scatter-plot">
          {[0, 1, 2, 3, 4].map((line) => <span className="scatter-gridline" key={line} />)}
          {plotClients.map((client, index) => (
            <button
              aria-label={`${client.name}, ${client.purchases} compras, ${formatMoney(client.spend)} acumulados`}
              className={`scatter-point point-${client.tone}`}
              key={client.name}
              onClick={() => onSelectClient(client)}
              style={{
                left: `${14 + index * 15}%`,
                bottom: `${Math.max(9, Math.min(87, (client.spend / 48000) * 88))}%`,
                width: `${12 + Math.round(client.average / 1100)}px`,
                height: `${12 + Math.round(client.average / 1100)}px`,
              }}
              title={`${client.name} · ${client.purchases} compras · ${formatMoney(client.spend)}`}
              type="button"
            />
          ))}
        </div>
        <div className="scatter-x-ticks"><span>1 compra</span><span>3 compras</span><span>5 compras</span><span>7+ compras</span></div>
        <div className="scatter-x-label">Frecuencia de compra en 12 meses</div>
      </div>
      <div className="chart-footnote"><span className="chart-size-key" aria-hidden="true"><i /><i /></span> El tamaño del punto representa el ticket promedio</div>
    </article>
  );
}

function OpportunityList({ compact = false }) {
  const shown = compact ? opportunities.slice(0, 3) : opportunities;
  return (
    <div className={`opportunity-list${compact ? ' opportunity-list-compact' : ''}`}>
      {shown.map((item) => (
        <article className="opportunity-item" key={item.title}>
          <span className={`opportunity-marker opportunity-${item.tone}`} aria-hidden="true" />
          <div className="opportunity-copy">
            <div className="opportunity-heading"><h3>{item.title}</h3><span>{item.count}</span></div>
            <p>{item.detail}</p>
          </div>
          {!compact && <ArrowRight size={16} aria-hidden="true" />}
        </article>
      ))}
    </div>
  );
}

function ClientTable({ onSelectClient }) {
  return (
    <div className="client-table-wrap">
      <table className="client-table">
        <thead>
          <tr><th>Cliente</th><th>Gasto total</th><th>Sesiones</th><th>Ticket promedio</th><th>Última visita</th><th>Frecuencia</th><th>Servicio principal</th><th>Segmento</th></tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.name}>
              <td><button className="client-name-button" onClick={() => onSelectClient(client)} type="button"><span className="client-avatar">{client.initials}</span><span>{client.name}<small>Perfil de comportamiento</small></span></button></td>
              <td className="table-money">{formatMoney(client.spend)}</td>
              <td>{client.sessions}</td>
              <td>{formatMoney(client.average)}</td>
              <td>{client.lastVisit}</td>
              <td>{client.frequency}</td>
              <td>{client.service}</td>
              <td><span className={`segment-badge badge-${client.tone}`}>{client.segment}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mock-data-note">Datos de demostración · nombres y cifras ficticios</p>
    </div>
  );
}

function ClientDetail({ client, onClose }) {
  return (
    <div className="detail-backdrop" onClick={onClose} role="presentation">
      <aside aria-label={`Detalle de ${client.name}`} aria-modal="true" className="client-detail" onClick={(event) => event.stopPropagation()} role="dialog">
        <div className="detail-header">
          <div><p className="eyebrow">PERFIL DE CLIENTE · DEMO</p><h2>Detalle de cliente</h2></div>
          <button aria-label="Cerrar detalle" className="detail-close" onClick={onClose} type="button"><X size={19} /></button>
        </div>
        <div className="detail-client-identity">
          <span className="detail-avatar">{client.initials}</span>
          <div><h3>{client.name}</h3><span className={`segment-badge badge-${client.tone}`}>{client.segment}</span></div>
        </div>

        <section className="detail-section">
          <h3>Resumen</h3>
          <div className="detail-stat-grid">
            <div><span>Gasto acumulado</span><strong>{formatMoney(client.spend)}</strong></div>
            <div><span>Número de compras</span><strong>{client.purchases}</strong></div>
            <div><span>Sesiones</span><strong>{client.sessions}</strong></div>
            <div><span>Ticket promedio</span><strong>{formatMoney(client.average)}</strong></div>
            <div><span>Última compra</span><strong>{client.lastVisit}</strong></div>
            <div><span>Frecuencia</span><strong>{client.frequency}</strong></div>
          </div>
        </section>

        <section className="detail-section">
          <h3>Comportamiento</h3>
          <p className="detail-label">Servicio más contratado</p>
          <div className="service-highlight"><span>{client.service}</span><strong>{client.sessions} sesiones</strong></div>
          <p className="detail-label">Productos adicionales</p>
          <div className="product-tags">{client.products.map((product) => <span key={product}>{product}</span>)}</div>
          <p className="detail-label">Evolución de gasto · últimos 12 meses</p>
          <div className="mini-spend-chart" aria-label="Evolución mensual de gasto">
            {client.monthlySpend.map((value, index) => <span key={index} style={{ height: `${Math.max(6, (value / Math.max(...client.monthlySpend, 1)) * 100)}%` }} title={`${['Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct'][index]}: ${formatMoney(value)}`} />)}
          </div>
          <div className="mini-month-labels"><span>Nov</span><span>Feb</span><span>May</span><span>Ago</span><span>Oct</span></div>
          <p className="detail-label">Meses activos</p>
          <div className="product-tags">{client.activeMonths.map((month) => <span key={month}>{month}</span>)}</div>
        </section>

        <section className="detail-segmentation">
          <p className="eyebrow">SEGMENTACIÓN ACTUAL</p>
          <h3>{client.segment}</h3>
          <p>{client.reason}</p>
          <div className="detail-rfm"><span><strong>R</strong> {client.lastVisit}</span><span><strong>F</strong> {client.purchases} compras</span><span><strong>M</strong> {formatMoney(client.spend)}</span></div>
        </section>
      </aside>
    </div>
  );
}

function ClientDirectory({ onSelectClient }) {
  return (
    <>
      <PageHeading eyebrow="CLIENTES" title="Clientes" description="Consulta el valor, recurrencia y comportamiento de compra de cada cliente." />
      <div className="client-table-summary"><span><strong>248</strong> clientes en cartera</span><span>Actualizado con compras registradas · Datos de demostración</span></div>
      <section className="content-panel client-directory-panel"><ClientTable onSelectClient={onSelectClient} /></section>
    </>
  );
}

export default function DashboardView() {
  const [selectedClient, setSelectedClient] = useState(null);
  return (
    <div className="page-content insight-page">
      <PageHeading eyebrow="ESTUDIO FOTOGRÁFICO · RESUMEN" title="Dashboard" description="Ingresos y comportamiento real de compra de tus clientes." action={<span className="demo-period">Periodo · Ene–Oct 2026</span>} />

      <section aria-label="Indicadores principales" className="metric-grid insight-metric-grid">
        <MetricCard label="Ingresos del periodo" value="$482,650" note="MXN · vs. periodo anterior" trend="+12.8%" tone="metric-revenue" />
        <MetricCard label="Ticket promedio" value="$3,420" note="Por compra registrada" trend="+4.2%" />
        <MetricCard label="Clientes recurrentes" value="102" note="41% de la cartera activa" trend="+6.1%" />
        <MetricCard label="Clientes de alto valor" value="32" note="20% superior de gasto" trend="+8.0%" />
      </section>

      <section aria-label="Indicadores complementarios" className="metric-grid insight-metric-grid secondary-metrics">
        <MetricCard label="Sesiones realizadas" value="386" note="En lo que va del periodo" />
        <MetricCard label="Clientes en riesgo" value="25" note="Con historial de compra" tone="metric-warning" />
        <MetricCard label="Clientes nuevos" value="39" note="Primera compra en 90 días" />
        <MetricCard label="Frecuencia promedio" value="2.8" note="Compras por cliente / año" />
      </section>

      <section className="insight-section">
        <div className="section-title-row"><div><p className="eyebrow">COMPORTAMIENTO DE CLIENTES</p><h2>Segmentos por comportamiento real</h2></div><Link to="/clientes" className="section-text-link">Ver todos los segmentos <ArrowRight size={15} /></Link></div>
        <SegmentCards compact />
      </section>

      <section className="dashboard-insight-grid">
        <SpendingChart onSelectClient={setSelectedClient} />
        <article className="content-panel dashboard-opportunities">
          <div className="panel-heading"><div><h2>Oportunidades</h2><p>Acciones sugeridas según el historial de compra</p></div><span className="opportunity-count">5</span></div>
          <OpportunityList compact />
          <Link className="section-text-link" to="/clientes">Explorar oportunidades <ArrowRight size={15} /></Link>
        </article>
      </section>

      <RfmNote />
      {selectedClient && <ClientDetail client={selectedClient} onClose={() => setSelectedClient(null)} />}
    </div>
  );
}

export function CustomersView() {
  const [activeView, setActiveView] = useState('general');
  const [selectedClient, setSelectedClient] = useState(null);
  const viewTabs = [
    { id: 'general', label: 'Vista general' },
    { id: 'segments', label: 'Segmentos' },
    { id: 'clients', label: 'Clientes' },
    { id: 'opportunities', label: 'Oportunidades' },
  ];

  return (
    <div className="page-content insight-page customer-page">
      <nav aria-label="Secciones de clientes" className="customer-tabs">
        {viewTabs.map((tab) => <button aria-current={activeView === tab.id ? 'page' : undefined} className={activeView === tab.id ? 'is-active' : ''} key={tab.id} onClick={() => setActiveView(tab.id)} type="button">{tab.label}</button>)}
      </nav>

      {activeView === 'general' && (
        <>
          <PageHeading eyebrow="RELACIÓN CON CLIENTES" title="Vista general" description="Una lectura de la cartera basada en compras y visitas registradas." action={<span className="demo-data-chip">Datos ficticios de demostración</span>} />
          <section aria-label="Indicadores de clientes" className="metric-grid insight-metric-grid">
            <MetricCard label="Clientes en cartera" value="248" note="Con historial registrado" />
            <MetricCard label="Recurrentes" value="102" note="41% de la cartera" trend="+6.1%" />
            <MetricCard label="Gasto acumulado" value="$1.84 M" note="MXN · últimos 12 meses" trend="+9.4%" />
            <MetricCard label="Ticket promedio" value="$3,420" note="Por compra registrada" trend="+4.2%" />
          </section>
          <div className="insight-section">
            <div className="section-title-row"><div><p className="eyebrow">CARTERA</p><h2>Segmentos por comportamiento real</h2></div><button className="text-action" onClick={() => setActiveView('segments')} type="button">Ver segmentos <ArrowRight size={15} /></button></div>
            <SegmentCards compact />
          </div>
          <div className="customer-overview-grid">
            <article className="content-panel service-panel"><div className="panel-heading"><div><h2>Servicios principales</h2><p>Participación en sesiones registradas</p></div></div><div className="service-list">{mainServices.map((service, index) => <div className="service-row" key={service.name}><span className="service-index">0{index + 1}</span><span>{service.name}</span><strong>{service.share}</strong></div>)}</div></article>
            <RfmNote />
          </div>
        </>
      )}

      {activeView === 'segments' && (
        <>
          <PageHeading eyebrow="ANÁLISIS DE CARTERA" title="Segmentos" description="Grupos calculados con recencia, frecuencia y valor monetario de compras." action={<span className="demo-data-chip">248 clientes · Datos de demostración</span>} />
          <SegmentCards />
          <RfmNote />
        </>
      )}

      {activeView === 'clients' && <ClientDirectory onSelectClient={setSelectedClient} />}

      {activeView === 'opportunities' && (
        <>
          <PageHeading eyebrow="ACCIONES SUGERIDAS" title="Oportunidades" description="Ideas para fortalecer la recurrencia y aumentar el valor de cada relación." action={<span className="demo-data-chip">Basado en compras registradas</span>} />
          <section className="content-panel opportunities-panel"><OpportunityList /></section>
          <RfmNote />
        </>
      )}

      {selectedClient && <ClientDetail client={selectedClient} onClose={() => setSelectedClient(null)} />}
    </div>
  );
}
