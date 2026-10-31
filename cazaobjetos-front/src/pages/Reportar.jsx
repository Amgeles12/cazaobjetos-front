import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { crearExtravio, crearHallazgo, listDelegados } from '../lib/api.js'
import { useToast } from '../components/Toast.jsx'
import { CASETAS, CATEGORIAS } from '../lib/constants.js'
import { ahoraHora, hoyISO } from '../lib/format.js'
import { IconImage, IconInfo, IconSend } from '../components/Icons.jsx'

function Categorias({ value, onChange }) {
  return (
    <div className="chips" role="group" aria-label="Categoría">
      {CATEGORIAS.map((c) => (
        <button type="button" key={c} className={`filter ${value === c ? 'is-active' : ''}`} aria-pressed={value === c} onClick={() => onChange(c)}>{c}</button>
      ))}
    </div>
  )
}

function FormEncontre() {
  const navigate = useNavigate()
  const toast = useToast()
  const [f, setF] = useState({ titulo: '', categoria: 'Electrónica', lugar: '', fecha: hoyISO(), hora: ahoraHora(), descripcion: '', gestion: 'yo', delegadoId: '', enOficina: false, caseta: CASETAS[0] })
  const [delegados, setDelegados] = useState([])
  useEffect(() => { listDelegados().then(setDelegados).catch(() => {}) }, [])
  const [foto, setFoto] = useState(null)
  const [preview, setPreview] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  function onFoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return setError('Sube una imagen JPG o PNG.')
    setError('')
    setFoto(file)
    const r = new FileReader()
    r.onload = () => setPreview(r.result)
    r.readAsDataURL(file)
  }

  const valido = f.titulo.trim() && f.lugar.trim() && f.fecha && (f.gestion === 'yo' || f.delegadoId) && (!f.enOficina || f.caseta)

  async function enviar(e) {
    e.preventDefault()
    if (!valido) return setError('Completa el nombre, el lugar, la fecha y quién gestionará la devolución.')
    setEnviando(true)
    setError('')
    try {
      const h = await crearHallazgo({ ...f, foto, fotoPreview: preview })
      toast(`Hallazgo publicado. Folio ${h.folio}`)
      navigate('/')
    } catch (err) {
      setError(err.message)
      setEnviando(false)
    }
  }

  return (
    <form className="card" onSubmit={enviar} noValidate>
      <label className="dropzone">
        {preview ? <img src={preview} alt="Vista previa del objeto" /> : <IconImage width={28} height={28} />}
        <strong>Tomar o subir foto del objeto</strong>
        <span className="muted">Evita mostrar datos personales</span>
        <input type="file" accept="image/*" capture="environment" onChange={onFoto} aria-label="Foto del objeto" />
      </label>
      <div className="field"><label htmlFor="titulo">Nombre del objeto</label><input id="titulo" className="input" placeholder="ej. Calculadora Casio fx-991" value={f.titulo} onChange={set('titulo')} /></div>
      <div className="field"><span className="label">Categoría</span><Categorias value={f.categoria} onChange={(c) => setF({ ...f, categoria: c })} /></div>
      <div className="field"><label htmlFor="lugar">¿Dónde lo encontraste?</label><input id="lugar" className="input" placeholder="ej. Biblioteca piso 2, Mesa 14" value={f.lugar} onChange={set('lugar')} /></div>
      <div className="row2">
        <div className="field"><label htmlFor="fecha">Fecha</label><input id="fecha" type="date" className="input mono" max={hoyISO()} value={f.fecha} onChange={set('fecha')} /></div>
        <div className="field"><label htmlFor="hora">Hora</label><input id="hora" type="time" className="input mono" value={f.hora} onChange={set('hora')} /></div>
      </div>
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="label">¿Quién gestionará la devolución?</legend>
        <label className="check"><input type="radio" name="gestion" checked={f.gestion === 'yo'} onChange={() => setF({ ...f, gestion: 'yo' })} /><span>Yo, la persona que lo encontró</span></label>
        <label className="check"><input type="radio" name="gestion" checked={f.gestion === 'delegar'} onChange={() => setF({ ...f, gestion: 'delegar' })} /><span>Delegar a un docente o a la secretaría</span></label>
        {f.gestion === 'delegar' && (
          <select className="select" aria-label="Responsable" value={f.delegadoId} onChange={set('delegadoId')}>
            <option value="">Elige al responsable</option>
            {delegados.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
          </select>
        )}
      </fieldset>
      <label className="check">
        <input type="checkbox" checked={f.enOficina} onChange={(e) => setF({ ...f, enOficina: e.target.checked })} />
        <span>Lo dejé en oficina</span>
      </label>
      {f.enOficina && (
        <div className="field">
          <label htmlFor="caseta">Lugar de resguardo</label>
          <select id="caseta" className="select" value={f.caseta} onChange={set('caseta')}>{CASETAS.map((c) => <option key={c}>{c}</option>)}</select>
        </div>
      )}
      <div className="field"><label htmlFor="desc">Descripción visible</label><textarea id="desc" className="textarea" placeholder="Color, marca, estado… (no describas detalles privados)" value={f.descripcion} onChange={set('descripcion')} /></div>
      {error && <div className="notice notice--peligro" role="alert">{error}</div>}
      <button className="btn btn--primary" disabled={enviando}><IconSend width={18} height={18} /> {enviando ? 'Publicando…' : 'Publicar hallazgo'}</button>
      <p className="help" style={{ textAlign: 'center', margin: 0 }}>SE GENERARÁ UN FOLIO #UTCH-AAAA-NNNN</p>
    </form>
  )
}

function FormPerdi() {
  const navigate = useNavigate()
  const toast = useToast()
  const [f, setF] = useState({ titulo: '', categoria: 'Electrónica', lugar: '', fecha: hoyISO(), descripcion: '', alertas: true })
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function enviar(e) {
    e.preventDefault()
    if (!f.titulo.trim() || !f.lugar.trim()) return setError('Escribe qué perdiste y dónde crees que fue.')
    setEnviando(true)
    setError('')
    try {
      await crearExtravio(f)
      toast('Reporte creado. Te avisaremos si aparece algo parecido.')
      navigate('/reclamos')
    } catch (err) {
      setError(err.message)
      setEnviando(false)
    }
  }

  return (
    <form className="card" onSubmit={enviar} noValidate>
      <div className="field"><label htmlFor="p-titulo">¿Qué perdiste?</label><input id="p-titulo" className="input" placeholder="ej. Mouse inalámbrico negro" value={f.titulo} onChange={set('titulo')} /></div>
      <div className="field"><span className="label">Categoría</span><Categorias value={f.categoria} onChange={(c) => setF({ ...f, categoria: c })} /></div>
      <div className="field"><label htmlFor="p-lugar">¿Dónde crees que lo perdiste?</label><input id="p-lugar" className="input" placeholder="ej. Salón 12, Edif. C" value={f.lugar} onChange={set('lugar')} /></div>
      <div className="field"><label htmlFor="p-fecha">Fecha aproximada</label><input id="p-fecha" type="date" className="input mono" max={hoyISO()} value={f.fecha} onChange={set('fecha')} /></div>
      <div className="field"><label htmlFor="p-desc">Descripción</label><textarea id="p-desc" className="textarea" placeholder="Color, marca, señas particulares…" value={f.descripcion} onChange={set('descripcion')} /></div>
      <label className="check">
        <input type="checkbox" checked={f.alertas} onChange={(e) => setF({ ...f, alertas: e.target.checked })} />
        <span>Avísame por correo cuando aparezca un objeto parecido.</span>
      </label>
      {error && <div className="notice notice--peligro" role="alert">{error}</div>}
      <button className="btn btn--primary" disabled={enviando}><IconSend width={18} height={18} /> {enviando ? 'Enviando…' : 'Crear reporte de extravío'}</button>
    </form>
  )
}

export default function Reportar() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'perdi' ? 'perdi' : 'encontre'

  return (
    <>
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'encontre'} className={tab === 'encontre' ? 'is-active' : ''} onClick={() => setParams({})}>Encontré algo</button>
        <button role="tab" aria-selected={tab === 'perdi'} className={tab === 'perdi' ? 'is-active' : ''} onClick={() => setParams({ tab: 'perdi' })}>Perdí algo</button>
      </div>
      {tab === 'encontre' && (
        <div className="notice notice--info"><IconInfo width={20} height={20} /><span>Quien gestione la devolución recibirá las solicitudes y se comunicará por correo institucional.</span></div>
      )}
      {tab === 'encontre' ? <FormEncontre /> : <FormPerdi />}
    </>
  )
}
