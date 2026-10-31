/**
 * Capa de datos del front, alineada a los diagramas del back
 * (flujo de devolución, ER, estados del reclamo y secuencia).
 *
 * - Sin VITE_API_URL -> datos de prueba (mock) en memoria.
 * - Con VITE_API_URL -> back real. Los endpoints son el CONTRATO PROPUESTO:
 *   acuérdenlo con quien hace el back y ajusten solo este archivo.
 */
import { seed } from './mockData.js'
import { ESTADOS_ACTIVOS, ESTADOS_CERRADOS } from './constants.js'

const BASE = import.meta.env.VITE_API_URL || ''
export const USE_MOCK = !BASE

let token = sessionStorage.getItem('co_token') || null
let yo = null
export const setToken = (t) => {
  token = t
  t ? sessionStorage.setItem('co_token', t) : sessionStorage.removeItem('co_token')
}
export const setUsuario = (u) => { yo = u }

async function http(method, path, body, isForm = false) {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body && !isForm) headers['Content-Type'] = 'application/json'
  const res = await fetch(`${BASE}${path}`, { method, headers, body: body ? (isForm ? body : JSON.stringify(body)) : undefined })
  if (!res.ok) {
    let msg = 'Ocurrió un error. Intenta de nuevo.'
    try { msg = (await res.json()).message || msg } catch {}
    throw new Error(msg)
  }
  if (res.status === 204) return null
  return (res.headers.get('content-type') || '').includes('json') ? res.json() : res.text()
}

// ---------- Mock ----------
const db = structuredClone(seed)
let nextId = 1000
const wait = (v) => new Promise((r) => setTimeout(() => r(structuredClone(v)), 250))
const fail = (m) => Promise.reject(new Error(m))
const hallazgoDe = (r) => db.hallazgos.find((h) => h.id === r.hallazgoId)
const estadoLibre = (h) => (h.resguardo === 'oficina' ? 'bajo_custodia' : 'con_finder')
const reclamo = (id) => db.reclamos.find((r) => r.id === id)

// ---------- Auth ----------
export async function login(email, password) {
  if (!USE_MOCK) return http('POST', '/auth/login', { email, password })
  const u = db.usuarios[email.trim().toLowerCase()]
  return u ? wait({ token: 'mock-token', usuario: u }) : fail('Usa tu correo institucional @utch.edu.mx.')
}

// ---------- Hallazgos ----------
export async function listHallazgos({ q = '', categoria = 'Todos', zona = 'Todos', orden = 'recientes', page = 1, pageSize = 5 } = {}) {
  if (!USE_MOCK) return http('GET', `/hallazgos?${new URLSearchParams({ q, categoria, zona, orden, page, pageSize })}`) // -> { items, total }
  let items = db.hallazgos.filter((h) => h.estado !== 'entregado')
  if (q) items = items.filter((h) => (h.titulo + h.lugar + h.categoria).toLowerCase().includes(q.toLowerCase()))
  if (categoria !== 'Todos') items = items.filter((h) => h.categoria === categoria)
  if (zona !== 'Todos') items = items.filter((h) => h.zona === zona)
  items.sort((a, b) => (orden === 'recientes' ? new Date(b.fecha) - new Date(a.fecha) : new Date(a.fecha) - new Date(b.fecha)))
  return wait({ items: items.slice((page - 1) * pageSize, page * pageSize), total: items.length })
}

export async function getHallazgo(id) {
  if (!USE_MOCK) return http('GET', `/hallazgos/${id}`)
  const h = db.hallazgos.find((x) => x.id === Number(id))
  return h ? wait(h) : fail('No encontramos ese objeto.')
}

// Responsables posibles al delegar: docentes o secretaría
export async function listDelegados() {
  if (!USE_MOCK) return http('GET', '/usuarios/delegados')
  return wait(db.delegados)
}

/**
 * data: { titulo, categoria, lugar, fecha, hora, descripcion, foto, fotoPreview,
 *         gestion: 'yo' | 'delegar', delegadoId, enOficina: bool, caseta }
 */
export async function crearHallazgo(data) {
  if (!USE_MOCK) {
    const f = new FormData()
    const { fotoPreview, ...resto } = data
    Object.entries(resto).forEach(([k, v]) => v != null && f.append(k, v))
    return http('POST', '/hallazgos', f, true)
  }
  const gestor = data.gestion === 'yo' ? { id: yo.id, nombre: yo.nombre, correo: yo.correo } : db.delegados.find((d) => d.id === Number(data.delegadoId))
  const id = nextId++
  const h = {
    id, folio: `#UTCH-2026-${String(id).padStart(4, '0')}`, titulo: data.titulo, categoria: data.categoria,
    estado: data.enOficina ? 'bajo_custodia' : 'con_finder', resguardo: data.enOficina ? 'oficina' : 'persona',
    custodia: data.enOficina ? data.caseta : null, gestor,
    fecha: new Date(`${data.fecha}T${data.hora || '00:00'}`).toISOString(), lugar: data.lugar, zona: 'Salones',
    foto: data.fotoPreview || null, descripcionPublica: data.descripcion,
  }
  db.hallazgos.unshift(h)
  return wait(h)
}

// "Lo dejé en oficina": actualiza el lugar de resguardo
export async function marcarEnOficina(id, caseta) {
  if (!USE_MOCK) return http('POST', `/hallazgos/${id}/resguardo`, { caseta })
  const h = db.hallazgos.find((x) => x.id === id)
  h.resguardo = 'oficina'; h.custodia = caseta
  if (h.estado === 'con_finder') h.estado = 'bajo_custodia'
  return wait(h)
}

export async function crearExtravio(data) {
  if (!USE_MOCK) return http('POST', '/extravios', data)
  const id = nextId++
  return wait({ id, folio: `#EXT-${id}`, ...data })
}

export async function reportarInformacionIncorrecta(hallazgoId) {
  if (!USE_MOCK) return http('POST', `/hallazgos/${hallazgoId}/reportar-incorrecto`)
  return wait({ ok: true })
}

// ---------- Reclamos: solicitante ----------
// data: { hallazgoId, descripcionPrivada, declaracion, evidencia }
export async function crearReclamo(data) {
  if (!USE_MOCK) {
    const f = new FormData()
    f.append('hallazgoId', data.hallazgoId)
    f.append('descripcionPrivada', data.descripcionPrivada)
    f.append('declaracion', data.declaracion)
    if (data.evidencia) f.append('evidencia', data.evidencia)
    return http('POST', '/reclamos', f, true)
  }
  const h = db.hallazgos.find((x) => x.id === Number(data.hallazgoId))
  if (h.gestor.id === yo.id) return fail('Este objeto lo gestionas tú. No puedes reclamarlo.')
  const id = nextId++
  const r = {
    id, folio: `#REC-${id}`, hallazgoId: h.id, titulo: h.titulo, estado: 'enviado',
    descripcionPrivada: data.descripcionPrivada, observaciones: '', creado: new Date().toISOString(),
    solicitante: { id: yo.id, nombre: yo.nombre, correo: yo.correo, matricula: yo.matricula, carrera: yo.carrera },
  }
  db.reclamos.unshift(r)
  h.estado = 'en_revision'
  return wait(r)
}

// -> { activos, porRevisar, alertas, historial }
export async function misReclamos() {
  if (!USE_MOCK) return http('GET', '/reclamos/mios')
  const mios = db.reclamos.filter((r) => r.solicitante.id === yo.id).map((r) => ({ ...r, gestor: hallazgoDe(r)?.gestor, custodia: hallazgoDe(r)?.custodia }))
  const porRevisar = db.reclamos
    .filter((r) => hallazgoDe(r)?.gestor.id === yo.id && ESTADOS_ACTIVOS.includes(r.estado))
  return wait({
    activos: mios.filter((r) => ESTADOS_ACTIVOS.includes(r.estado)),
    porRevisar,
    alertas: db.alertas,
    historial: mios.filter((r) => ESTADOS_CERRADOS.includes(r.estado)),
  })
}

export async function cancelarReclamo(id) {
  if (!USE_MOCK) return http('POST', `/reclamos/${id}/cancelar`)
  const r = reclamo(id); r.estado = 'cancelado'
  const h = hallazgoDe(r); if (h) h.estado = estadoLibre(h)
  return wait(r)
}

export async function responderPruebas(id, texto) {
  if (!USE_MOCK) return http('POST', `/reclamos/${id}/respuesta`, { texto })
  const r = reclamo(id); r.estado = 'en_revision'; r.descripcionPrivada += `\n${texto}`
  return wait(r)
}

// Secuencia: el solicitante marca «Ya recuperé mi objeto» y se cierra el reclamo y el hallazgo
export async function marcarRecuperado(id) {
  if (!USE_MOCK) return http('POST', `/reclamos/${id}/recuperado`)
  const r = reclamo(id)
  if (r.estado !== 'aprobado') return fail('Solo puedes cerrar un reclamo aprobado.')
  r.estado = 'entregado'
  r.entrega = { fecha: new Date().toISOString(), agente: `Confirmado por ${r.solicitante.nombre}` }
  const h = hallazgoDe(r); if (h) h.estado = 'entregado'
  return wait(r)
}

// ---------- Reclamos: responsable (quien lo encontró, docente, secretaría o vigilancia) ----------
export async function iniciarRevision(id) {
  if (!USE_MOCK) return http('POST', `/reclamos/${id}/revision`)
  reclamo(id).estado = 'en_revision'; return wait({ ok: true })
}
export async function aprobarReclamo(id) {
  if (!USE_MOCK) return http('POST', `/reclamos/${id}/aprobar`)
  reclamo(id).estado = 'aprobado'; return wait({ ok: true })
}
export async function rechazarReclamo(id, observaciones) {
  if (!USE_MOCK) return http('POST', `/reclamos/${id}/rechazar`, { observaciones })
  const r = reclamo(id); r.estado = 'rechazado'; r.observaciones = observaciones
  const h = hallazgoDe(r); if (h) h.estado = estadoLibre(h)
  return wait({ ok: true })
}
export async function pedirPruebas(id, observaciones) {
  if (!USE_MOCK) return http('POST', `/reclamos/${id}/pedir-pruebas`, { observaciones })
  const r = reclamo(id); r.estado = 'requiere_pruebas'; r.observaciones = observaciones
  return wait({ ok: true })
}

// ---------- Vigilancia / Administrador ----------
export async function colaVigilancia() {
  if (!USE_MOCK) return http('GET', '/vigilancia/cola') // -> { stats, reclamos, entregas, publicaciones }
  const reclamos = db.reclamos.filter((r) => ['enviado', 'en_revision'].includes(r.estado))
  const entregas = db.reclamos.filter((r) => r.estado === 'aprobado').map((r) => ({ ...r, custodia: hallazgoDe(r)?.custodia }))
  return wait({
    stats: {
      enCustodia: db.hallazgos.filter((h) => h.resguardo === 'oficina' && h.estado !== 'entregado').length,
      porAprobar: reclamos.length,
      entregasHoy: entregas.length,
    },
    reclamos, entregas,
    publicaciones: db.hallazgos.filter((h) => h.estado !== 'entregado').slice(0, 3),
  })
}
export async function editarHallazgo(id, cambios) {
  if (!USE_MOCK) return http('PATCH', `/hallazgos/${id}`, cambios)
  Object.assign(db.hallazgos.find((h) => h.id === id), cambios); return wait({ ok: true })
}
export async function retirarHallazgo(id) {
  if (!USE_MOCK) return http('DELETE', `/hallazgos/${id}`)
  db.hallazgos = db.hallazgos.filter((h) => h.id !== id); return wait({ ok: true })
}
// Estado diagrama: Aprobado -> Entregado «Vigilancia confirma entrega física» (acta con matrícula y código)
export async function registrarEntrega(id, { matricula, codigo }) {
  if (!USE_MOCK) return http('POST', `/reclamos/${id}/entrega`, { matricula, codigo })
  if (!/^\d{6}$/.test(codigo)) return fail('El código de entrega tiene 6 dígitos.')
  const r = reclamo(id)
  if (matricula !== r.solicitante.matricula) return fail('La matrícula no coincide con la del solicitante.')
  r.estado = 'entregado'; r.entrega = { fecha: new Date().toISOString(), agente: `Of. ${yo.nombre}` }
  const h = hallazgoDe(r); if (h) h.estado = 'entregado'
  return wait({ ok: true })
}
export async function auditoriaCSV() {
  if (!USE_MOCK) return http('GET', '/vigilancia/auditoria.csv')
  const filas = [['folio', 'tipo', 'estado', 'fecha']]
  db.hallazgos.forEach((h) => filas.push([h.folio, 'hallazgo', h.estado, h.fecha]))
  db.reclamos.forEach((r) => filas.push([r.folio, 'reclamo', r.estado, r.creado]))
  return wait(filas.map((f) => f.join(',')).join('\n'))
}
