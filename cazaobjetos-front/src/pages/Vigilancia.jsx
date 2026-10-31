import { useCallback, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import * as api from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../components/Toast.jsx'
import { Chip, ChipHallazgo, ChipReclamo } from '../components/Chip.jsx'
import { IconCheck, IconDownload } from '../components/Icons.jsx'

const FILTROS = ['Todos', 'Por revisar', 'En custodia']

function EntregaForm({ r, onDone }) {
  const toast = useToast()
  const [matricula, setMatricula] = useState('')
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function confirmar() {
    setError('')
    setEnviando(true)
    try {
      await api.registrarEntrega(r.id, { matricula: matricula.trim(), codigo })
      toast(`Entrega registrada. Folio ${r.folio} cerrado.`)
      onDone()
    } catch (e) {
      setError(e.message)
      setEnviando(false)
    }
  }

  return (
    <article className="card">
      <div className="pager"><span className="folio">ACTA · {r.folio}</span><Chip tipo="ok">Cierre en caseta</Chip></div>
      <h3>Entrega física y registro de acta</h3>
      <p className="muted" style={{ margin: 0 }}>{r.titulo}{r.custodia ? ` · ${r.custodia}` : ''}</p>
      <div className="field">
        <label htmlFor={`mat-${r.id}`}>Matrícula del estudiante receptor</label>
        <input id={`mat-${r.id}`} className="input mono" inputMode="numeric" placeholder="e.g., 2021034821" value={matricula} onChange={(e) => setMatricula(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor={`cod-${r.id}`}>Código de entrega (6 dígitos)</label>
        <input id={`cod-${r.id}`} className="input mono" inputMode="numeric" maxLength={6} placeholder="000000" value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))} />
      </div>
      {error && <div className="notice notice--peligro" role="alert">{error}</div>}
      <button className="btn btn--primary" disabled={!matricula || codigo.length !== 6 || enviando} onClick={confirmar}>
        <IconCheck width={18} height={18} /> Confirmar entrega y cerrar folio
      </button>
    </article>
  )
}

export default function Vigilancia() {
  const { usuario, esStaff } = useAuth()
  const toast = useToast()
  const [data, setData] = useState(null)
  const [filtro, setFiltro] = useState('Todos')
  const [error, setError] = useState('')

  const cargar = useCallback(() => { api.colaVigilancia().then(setData).catch((e) => setError(e.message)) }, [])
  useEffect(() => { if (esStaff) cargar() }, [cargar, esStaff])

  if (!esStaff) return <Navigate to="/" replace />

  async function run(fn, mensaje) {
    setError('')
    try { await fn(); toast(mensaje); cargar() } catch (e) { setError(e.message) }
  }
  const pedir = (t) => { const v = window.prompt(t); return v && v.trim() ? v.trim() : null }

  async function auditoria() {
    try {
      const csv = await api.auditoriaCSV()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
      a.download = 'auditoria-cazaobjetos.csv'
      a.click()
      URL.revokeObjectURL(a.href)
    } catch (e) { setError(e.message) }
  }

  if (error && !data) return <div className="notice notice--peligro" role="alert">{error}</div>
  if (!data) return <p className="empty">Cargando panel…</p>

  const verRec = filtro !== 'En custodia'
  const verEnt = filtro !== 'Por revisar'
  const verPub = filtro !== 'Por revisar'
  const vacio = !(verRec && data.reclamos.length) && !(verEnt && data.entregas.length) && !(verPub && data.publicaciones.length)

  return (
    <>
      <section className="vig-head">
        <Chip tipo="ok">Modo vigilancia</Chip>
        <h2>Módulo de Vigilancia y Custodia UTCH</h2>
        <div className="vig-officer">
          <div className="grow">
            <b>{usuario.rol === 'vigilancia' ? 'Oficial' : 'Responsable'}: {usuario.nombre}</b>
            <div className="mono" style={{ fontSize: 12, color: '#c9ccd4' }}>{usuario.turno}</div>
          </div>
        </div>
      </section>

      <div className="counters">
        <div className="counter"><span className="code">01-CST</span><b>{data.stats.enCustodia}</b><span>En custodia</span></div>
        <div className="counter counter--hot"><span className="code">02-REV</span><b>{data.stats.porAprobar}</b><span>Reclamos por revisar</span></div>
        <div className="counter"><span className="code">03-ENT</span><b>{data.stats.entregasHoy}</b><span>Por entregar</span></div>
      </div>

      <div className="chips" role="group" aria-label="Filtro de estado">
        {FILTROS.map((f) => (
          <button key={f} className={`filter ${filtro === f ? 'is-active' : ''}`} aria-pressed={filtro === f} onClick={() => setFiltro(f)}>{f}</button>
        ))}
      </div>

      {error && <div className="notice notice--peligro" role="alert">{error}</div>}
      <h2 className="section-title">Cola de acciones críticas</h2>

      {verRec && data.reclamos.map((r) => (
        <article key={r.id} className="card">
          <div className="pager"><span className="folio">FOLIO {r.folio}</span><ChipReclamo estado={r.estado} /></div>
          <h3>Solicitud de reclamo · {r.titulo}</h3>
          <span className="mono muted" style={{ fontSize: 12 }}>Alumno #{r.solicitante.matricula} · {r.solicitante.carrera}</span>
          <div className="quote">“{r.descripcionPrivada}”</div>
          {r.estado === 'enviado' && <button className="btn btn--primary" onClick={() => run(() => api.iniciarRevision(r.id), 'Revisión iniciada.')}>Iniciar revisión</button>}
          {r.estado === 'en_revision' && (
            <>
              <button className="btn btn--primary" onClick={() => run(() => api.aprobarReclamo(r.id), 'Propiedad validada. Listo para entrega.')}>
                <IconCheck width={18} height={18} /> Validar y marcar listo para entrega
              </button>
              <div className="btn-row">
                <button className="btn btn--secondary" onClick={() => { const t = pedir('¿Qué información adicional necesitas?'); if (t) run(() => api.pedirPruebas(r.id, t), 'Se pidió más información.') }}>Solicitar más pruebas</button>
                <button className="btn btn--danger" onClick={() => { const t = pedir('Motivo del rechazo'); if (t) run(() => api.rechazarReclamo(r.id, t), 'Reclamo rechazado.') }}>Rechazar</button>
              </div>
            </>
          )}
        </article>
      ))}

      {verEnt && data.entregas.map((r) => <EntregaForm key={r.id} r={r} onDone={cargar} />)}

      {verPub && data.publicaciones.length > 0 && (
        <>
          <h2 className="section-title">Publicaciones recientes</h2>
          {data.publicaciones.map((h) => (
            <article key={h.id} className="card">
              <div className="pager"><span className="folio">FOLIO {h.folio}</span><ChipHallazgo estado={h.estado} custodia={h.custodia} /></div>
              <h3>{h.titulo}</h3>
              <span className="muted">Gestiona: {h.gestor?.nombre}</span>
              <div className="btn-row">
                <button className="btn btn--secondary" onClick={() => { const t = pedir('Nuevo nombre del objeto'); if (t) run(() => api.editarHallazgo(h.id, { titulo: t }), 'Datos actualizados.') }}>Editar</button>
                <button className="btn btn--danger" onClick={() => { if (window.confirm('¿Retirar esta publicación?')) run(() => api.retirarHallazgo(h.id), 'Publicación retirada.') }}>Retirar</button>
              </div>
            </article>
          ))}
        </>
      )}

      {vacio && <p className="empty">No hay acciones pendientes con este filtro.</p>}

      <button className="link-green" onClick={auditoria}>
        <IconDownload width={16} height={16} style={{ verticalAlign: 'middle' }} /> Descargar reporte de auditoría CSV
      </button>
    </>
  )
}
