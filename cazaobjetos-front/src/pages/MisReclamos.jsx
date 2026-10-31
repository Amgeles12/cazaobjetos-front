import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as api from '../lib/api.js'
import { ESTADOS_RECLAMO, ETAPAS } from '../lib/constants.js'
import { useToast } from '../components/Toast.jsx'
import { Chip, ChipReclamo } from '../components/Chip.jsx'
import { IconCheck, IconImage, IconPlus, IconX } from '../components/Icons.jsx'
import { fechaCorta } from '../lib/format.js'

function Progreso({ etapa }) {
  return (
    <div className="metabox">
      <div className="mono muted">ETAPA {etapa} DE 4</div>
      <div className="progress" role="progressbar" aria-valuemin={1} aria-valuemax={4} aria-valuenow={etapa}>
        {ETAPAS.map((_, i) => <i key={i} className={i < etapa ? 'on' : ''} />)}
      </div>
      <div className="progress-labels">
        {ETAPAS.map((e, i) => <span key={e} className={i === etapa - 1 ? 'on' : ''}>{e}</span>)}
      </div>
    </div>
  )
}

export default function MisReclamos() {
  const navigate = useNavigate()
  const toast = useToast()
  const [tab, setTab] = useState('activos')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [respondiendo, setRespondiendo] = useState(null)
  const [texto, setTexto] = useState('')

  const cargar = useCallback(() => { api.misReclamos().then(setData).catch((e) => setError(e.message)) }, [])
  useEffect(cargar, [cargar])

  async function run(fn, mensaje) {
    setError('')
    try { await fn(); if (mensaje) toast(mensaje); setRespondiendo(null); setTexto(''); cargar() } catch (e) { setError(e.message) }
  }
  function pedirTexto(titulo) {
    const t = window.prompt(titulo)
    return t && t.trim() ? t.trim() : null
  }
  function descargar(r) {
    const contenido = `COMPROBANTE DE ENTREGA\nFolio: ${r.folio}\nObjeto: ${r.titulo}\nFecha: ${r.entrega ? fechaCorta(r.entrega.fecha) : ''}\nCierre: ${r.entrega?.agente ?? ''}\n`
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([contenido], { type: 'text/plain' }))
    a.download = `comprobante-${r.folio.replace('#', '')}.txt`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  if (error && !data) return <div className="notice notice--peligro" role="alert">{error}</div>
  if (!data) return <p className="empty">Cargando tus reclamos…</p>

  const tabs = [
    { id: 'activos', label: 'Activos', n: data.activos.length },
    { id: 'revisar', label: 'Por revisar', n: data.porRevisar.length, hot: data.porRevisar.length > 0 },
    { id: 'alertas', label: 'Alertas', n: data.alertas.length, hot: data.alertas.length > 0 },
    { id: 'historial', label: 'Historial', n: data.historial.length },
  ]

  return (
    <>
      <div className="tabs" role="tablist">
        {tabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'is-active' : ''} onClick={() => setTab(t.id)}>
            {t.label} <span className={t.hot ? 'badge' : ''}>({t.n})</span>
          </button>
        ))}
      </div>

      {error && <div className="notice notice--peligro" role="alert">{error}</div>}

      {/* ----- Como solicitante ----- */}
      {tab === 'activos' && (
        <>
          {data.activos.map((r) => (
            <article key={r.id} className="card">
              <div className="pager"><span className="folio">{r.folio}</span><ChipReclamo estado={r.estado} /></div>
              <h3>{r.titulo}</h3>
              <Progreso etapa={ESTADOS_RECLAMO[r.estado].etapa} />

              {['enviado', 'en_revision'].includes(r.estado) && (
                <div className="notice notice--info"><span>Se comunican por correo institucional. {r.gestor && <>Responsable: <a href={`mailto:${r.gestor.correo}`}><b>{r.gestor.nombre}</b></a>.</>}</span></div>
              )}
              {r.estado === 'requiere_pruebas' && (
                <>
                  <div className="notice notice--pend"><span><b>Te piden más información:</b> {r.observaciones || 'Agrega otro detalle que solo el dueño conozca.'}</span></div>
                  {respondiendo === r.id ? (
                    <>
                      <textarea className="textarea" placeholder="Escribe tu respuesta" value={texto} onChange={(e) => setTexto(e.target.value)} aria-label="Respuesta de verificación" />
                      <button className="btn btn--primary" disabled={texto.trim().length < 10} onClick={() => run(() => api.responderPruebas(r.id, texto.trim()), 'Respuesta enviada.')}>Enviar respuesta</button>
                    </>
                  ) : (
                    <button className="btn btn--secondary" onClick={() => setRespondiendo(r.id)}>Responder</button>
                  )}
                </>
              )}
              {r.estado === 'aprobado' && (
                <>
                  <div className="notice notice--ok"><span>Aprobado. Recógelo {r.custodia ? <>en <b>{r.custodia}</b></> : 'en el encuentro acordado'} con tu credencial.</span></div>
                  <button className="btn btn--primary" onClick={() => { if (window.confirm('¿Confirmas que ya tienes tu objeto? Se cerrará el reclamo.')) run(() => api.marcarRecuperado(r.id), 'Listo. Reclamo cerrado.') }}>
                    <IconCheck width={18} height={18} /> Ya recuperé mi objeto
                  </button>
                </>
              )}
              {['enviado', 'en_revision', 'requiere_pruebas', 'aprobado'].includes(r.estado) && (
                <button className="btn btn--link-danger" onClick={() => { if (window.confirm(`¿Cancelar el reclamo ${r.folio}? El objeto quedará disponible para otros.`)) run(() => api.cancelarReclamo(r.id), 'Reclamo cancelado.') }}>
                  <IconX width={18} height={18} /> Cancelar reclamo
                </button>
              )}
            </article>
          ))}
          {!data.activos.length && <p className="empty">No tienes reclamos activos. Busca tu objeto en Explorar y reclámalo.</p>}
        </>
      )}

      {/* ----- Como responsable ----- */}
      {tab === 'revisar' && (
        <>
          {data.porRevisar.map((r) => (
            <article key={r.id} className="card">
              <div className="pager"><span className="folio">{r.folio}</span><ChipReclamo estado={r.estado} /></div>
              <h3>{r.titulo}</h3>
              <span className="mono muted" style={{ fontSize: 12 }}>
                {r.solicitante.nombre} · <a href={`mailto:${r.solicitante.correo}`}>{r.solicitante.correo}</a>
              </span>
              <div className="quote">“{r.descripcionPrivada}”</div>
              {r.estado === 'enviado' && (
                <button className="btn btn--primary" onClick={() => run(() => api.iniciarRevision(r.id), 'Revisión iniciada.')}>Iniciar revisión</button>
              )}
              {r.estado === 'en_revision' && (
                <>
                  <button className="btn btn--primary" onClick={() => run(() => api.aprobarReclamo(r.id), 'Propiedad validada. Coordina la entrega por correo.')}>
                    <IconCheck width={18} height={18} /> Propiedad validada
                  </button>
                  <div className="btn-row">
                    <button className="btn btn--secondary" onClick={() => { const t = pedirTexto('¿Qué información adicional necesitas?'); if (t) run(() => api.pedirPruebas(r.id, t), 'Se pidió más información.') }}>Pedir pruebas</button>
                    <button className="btn btn--danger" onClick={() => { const t = pedirTexto('Motivo del rechazo (pruebas insuficientes)'); if (t) run(() => api.rechazarReclamo(r.id, t), 'Reclamo rechazado.') }}>Rechazar</button>
                  </div>
                </>
              )}
              {r.estado === 'requiere_pruebas' && <div className="notice notice--pend"><span>Esperando respuesta del solicitante.</span></div>}
              {r.estado === 'aprobado' && <div className="notice notice--ok"><span>Aprobado. Coordina la entrega por correo; el solicitante cerrará el reclamo al recibirlo.</span></div>}
            </article>
          ))}
          {!data.porRevisar.length && <p className="empty">No tienes solicitudes por revisar. Aquí llegan los reclamos de los objetos que gestionas.</p>}
        </>
      )}

      {tab === 'alertas' && (
        <>
          {data.alertas.map((a) => (
            <article key={a.id} className="card card--match">
              <div className="pager"><Chip tipo="ok" dot>Coincidencia detectada</Chip><span className="folio">{a.folio}</span></div>
              <h3>{a.titulo}</h3>
              <p style={{ margin: 0 }}>{a.texto}</p>
              <div className="photo"><IconImage width={28} height={28} /></div>
              <button className="btn btn--primary" onClick={() => navigate(`/reclamo/${a.hallazgoId}`)}>
                <IconCheck width={18} height={18} /> Revisar coincidencia
              </button>
            </article>
          ))}
          {!data.alertas.length && <p className="empty">Sin alertas por ahora. Cuando aparezca algo parecido a lo que perdiste, te avisamos aquí.</p>}
        </>
      )}

      {tab === 'historial' && (
        <>
          {data.historial.map((r) => (
            <article key={r.id} className="card">
              <div className="pager"><span className="folio">{r.folio}</span><ChipReclamo estado={r.estado} /></div>
              <h3>{r.titulo}</h3>
              {r.estado === 'rechazado' && r.observaciones && <div className="notice notice--peligro"><span>{r.observaciones}</span></div>}
              {r.entrega && (
                <div className="metabox">
                  <div><span className="k">ENTREGA</span> {fechaCorta(r.entrega.fecha)}</div>
                  <div><span className="k">CIERRE</span> {r.entrega.agente}</div>
                </div>
              )}
              {r.estado === 'entregado' && <button className="btn btn--secondary" onClick={() => descargar(r)}>Descargar comprobante</button>}
            </article>
          ))}
          {!data.historial.length && <p className="empty">Aquí verás tus reclamos cerrados.</p>}
        </>
      )}

      <button className="btn btn--dark" onClick={() => navigate('/reportar?tab=perdi')}>
        <IconPlus width={18} height={18} /> Crear nuevo reporte de extravío
      </button>
    </>
  )
}
