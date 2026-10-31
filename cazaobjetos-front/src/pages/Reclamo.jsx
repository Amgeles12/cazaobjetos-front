import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { crearReclamo, getHallazgo, reportarInformacionIncorrecta } from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../components/Toast.jsx'
import { ChipHallazgo } from '../components/Chip.jsx'
import { Foto } from '../components/ObjectCard.jsx'
import { IconCheck, IconInfo, IconSend, IconShield, IconUpload } from '../components/Icons.jsx'
import { fechaCorta } from '../lib/format.js'

const MIN = 20
const MAX_MB = 5
const PASOS = ['1 · Revisión', '2 · Evidencia', '3 · Verificación']

export default function Reclamo() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { usuario } = useAuth()
  const [h, setH] = useState(null)
  const [error, setError] = useState('')
  const [detalles, setDetalles] = useState('')
  const [archivo, setArchivo] = useState(null)
  const [errArchivo, setErrArchivo] = useState('')
  const [declaro, setDeclaro] = useState(false)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    getHallazgo(id).then(setH).catch((e) => setError(e.message))
  }, [id])

  const detallesOk = detalles.trim().length >= MIN
  const paso = detallesOk ? 3 : detalles.length > 0 ? 2 : 1
  const propio = h && h.gestor?.id === usuario.id
  const puedeEnviar = detallesOk && declaro && !enviando && !propio

  function onArchivo(e) {
    const f = e.target.files?.[0]
    setErrArchivo('')
    if (!f) return
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(f.type)) return setErrArchivo('Solo PDF, JPG o PNG.')
    if (f.size > MAX_MB * 1024 * 1024) return setErrArchivo(`El archivo pesa más de ${MAX_MB} MB.`)
    setArchivo(f)
  }

  async function enviar() {
    setEnviando(true)
    setError('')
    try {
      await crearReclamo({ hallazgoId: h.id, descripcionPrivada: detalles.trim(), declaracion: declaro, evidencia: archivo })
      toast('Solicitud enviada. El responsable te escribirá a tu correo institucional.')
      navigate('/reclamos')
    } catch (e) {
      setError(e.message)
      setEnviando(false)
    }
  }

  async function reportarIncorrecta() {
    try {
      await reportarInformacionIncorrecta(h.id)
      toast('Gracias. Avisamos a vigilancia para corregir la ficha.')
    } catch (e) { setError(e.message) }
  }

  if (error && !h) return <div className="notice notice--peligro" role="alert">{error}</div>
  if (!h) return <p className="empty">Cargando objeto…</p>

  return (
    <>
      <div className="stepper" aria-label="Pasos del reclamo">
        {PASOS.map((p, i) => <span key={p} className={paso === i + 1 ? 'is-active' : ''} aria-current={paso === i + 1 ? 'step' : undefined}>{p}</span>)}
      </div>

      <Foto src={h.foto} />

      <section className="card">
        <span className="folio">FOLIO {h.folio}</span>
        <h3>{h.titulo}</h3>
        <div><ChipHallazgo estado={h.estado} custodia={h.custodia} /></div>
        <div className="metabox">
          <div><span className="k">HALLAZGO</span> {fechaCorta(h.fecha)}</div>
          <div><span className="k">UBICACIÓN</span> {h.lugar}</div>
          <div><span className="k">RESGUARDO</span> {h.custodia ?? 'Con quien lo encontró'}</div>
          <div><span className="k">GESTIONA</span> {h.gestor?.nombre}</div>
        </div>
      </section>

      <section className="card">
        <h2 className="section-title"><IconShield width={20} height={20} /> Proceso de reclamo</h2>
        <div className="notice notice--info">
          <IconInfo width={20} height={20} />
          <span>Describe datos no visibles en la foto que demuestren tu propiedad. El responsable revisa tu solicitud y se comunica contigo por correo institucional.</span>
        </div>
        {propio && <div className="notice notice--pend"><span>Tú gestionas este objeto, así que no puedes reclamarlo.</span></div>}

        <div className="field">
          <label htmlFor="detalles">
            Detalles que prueban que es tuyo <span className="chip chip--req">Obligatorio</span>
          </label>
          <textarea id="detalles" className="textarea" placeholder="ej. qué hay dentro del bolsillo frontal, marca del llavero, stickers…" value={detalles} onChange={(e) => setDetalles(e.target.value)} aria-describedby="detalles-ayuda" />
          <span id="detalles-ayuda" className={`help ${detalles && !detallesOk ? 'help--error' : ''}`}>
            Mín. {MIN} caracteres ({detalles.trim().length}/{MIN})
          </span>
        </div>

        <div className="field">
          <span className="label">Comprobante o evidencia <span className="help">(opcional)</span></span>
          <label className="dropzone">
            <IconUpload width={24} height={24} />
            <strong>{archivo ? archivo.name : 'Adjuntar factura, foto o credencial'}</strong>
            <span className="muted">PDF, JPG, PNG · máx {MAX_MB} MB</span>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={onArchivo} aria-label="Adjuntar evidencia" />
          </label>
          {errArchivo && <span className="help help--error" role="alert">{errArchivo}</span>}
        </div>

        <div className="field">
          <span className="label">Identificación institucional</span>
          <div className="notice notice--ok">
            <IconCheck width={20} height={20} />
            <span className="mono" style={{ fontSize: 13 }}>
              {usuario.matricula ?? 'Sin matrícula'} · {usuario.nombre} · SSO UTCH
            </span>
          </div>
        </div>

        <label className="check">
          <input type="checkbox" checked={declaro} onChange={(e) => setDeclaro(e.target.checked)} />
          <span><b>Declaración:</b> Declaro bajo protesta que soy el legítimo propietario de este objeto.</span>
        </label>

        {error && <div className="notice notice--peligro" role="alert">{error}</div>}

        <button className="btn btn--primary" disabled={!puedeEnviar} onClick={enviar}>
          <IconSend width={18} height={18} /> {enviando ? 'Enviando…' : 'Enviar solicitud de reclamo'}
        </button>
        <button className="btn btn--secondary" onClick={reportarIncorrecta}>Reportar como información incorrecta</button>
      </section>

      <p className="help" style={{ textAlign: 'center' }}>EXPEDIENTE VIGENTE: 30 DÍAS</p>
    </>
  )
}
