const hoy = (h, m = 0, diasAtras = 0) => {
  const d = new Date()
  d.setDate(d.getDate() - diasAtras)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

const SECRE = { id: 5, nombre: 'Secretaría Edificio I', correo: 'secretaria@utch.edu.mx' }
const DOCENTE = { id: 4, nombre: 'Enrique (docente)', correo: 'docente@utch.edu.mx' }
const VIG = { id: 2, nombre: 'Vigilancia (G. Morales)', correo: 'vigilancia@utch.edu.mx' }
const JUAN = { id: 1, nombre: 'Juan Pérez', correo: 'estudiante@utch.edu.mx' }

// resguardo: 'oficina' (bajo custodia en caseta) | 'persona' (lo tiene quien lo encontró)
export const seed = {
  delegados: [DOCENTE, SECRE],
  hallazgos: [
    { id: 1, folio: '#UTCH-2026-0891', titulo: 'Calculadora Científica Casio fx-991LA', categoria: 'Electrónica', estado: 'en_revision', resguardo: 'oficina', custodia: 'Servicios Escolares', gestor: SECRE, fecha: hoy(10, 15, 1), lugar: 'Biblioteca piso 2, Mesa 14', zona: 'Biblioteca', foto: null },
    { id: 2, folio: '#UTCH-2026-0894', titulo: 'Credencial de Estudiante UTCH', categoria: 'Documentos', estado: 'bajo_custodia', resguardo: 'oficina', custodia: 'Servicios Escolares', gestor: SECRE, fecha: hoy(8, 40, 1), lugar: 'Cafetería Central, Barra exterior', zona: 'Cafetería', foto: null },
    { id: 3, folio: '#UTCH-2026-0889', titulo: 'Manojo de Llaves con Llavero Nissan', categoria: 'Llaves', estado: 'con_finder', resguardo: 'persona', custodia: null, gestor: DOCENTE, fecha: hoy(16, 10, 2), lugar: 'Gradas de Canchas de Fútbol', zona: 'Canchas', foto: null },
    { id: 4, folio: '#UTCH-2026-0885', titulo: 'Mochila Porta-Laptop Negra con Cuadernos', categoria: 'Ropa/Mochilas', estado: 'bajo_custodia', resguardo: 'oficina', custodia: 'Vigilancia', gestor: VIG, fecha: hoy(13, 20, 2), lugar: 'Laboratorio de Cómputo 3, Edif. A', zona: 'Laboratorios', foto: null },
    { id: 5, folio: '#UTCH-2026-0842', titulo: 'Mochila Negra con Llavero metálico', categoria: 'Ropa/Mochilas', estado: 'en_revision', resguardo: 'oficina', custodia: 'Caseta Poniente', gestor: VIG, fecha: hoy(14, 30, 3), lugar: 'Gimnasio Universitario', zona: 'Gimnasio', foto: null },
    { id: 6, folio: '#UTCH-2026-0877', titulo: 'Memoria USB Kingston 64GB Negra', categoria: 'Electrónica', estado: 'en_revision', resguardo: 'persona', custodia: null, gestor: DOCENTE, fecha: hoy(9, 5, 4), lugar: 'Lab. de Redes, Edif. D', zona: 'Laboratorios', foto: null },
    { id: 7, folio: '#UTCH-2026-0870', titulo: 'Audífonos inalámbricos blancos', categoria: 'Electrónica', estado: 'bajo_custodia', resguardo: 'oficina', custodia: 'Caseta Central', gestor: JUAN, fecha: hoy(11, 45, 5), lugar: 'Estacionamiento B', zona: 'Estacionamiento', foto: null },
  ],
  reclamos: [
    { id: 491, folio: '#REC-491', hallazgoId: 1, titulo: 'Calculadora Científica Casio fx-991LA', estado: 'en_revision', descripcionPrivada: 'Tiene una calcomanía de un gato en la tapa trasera.', solicitante: { id: 1, nombre: 'Juan Pérez', correo: 'estudiante@utch.edu.mx', matricula: '2021034821', carrera: 'Ing. Mecatrónica' }, creado: hoy(9, 0, 1), observaciones: '' },
    { id: 488, folio: '#REC-488', hallazgoId: 6, titulo: 'Memoria USB Kingston 64GB Negra', estado: 'requiere_pruebas', descripcionPrivada: 'Es negra, de 64 GB.', solicitante: { id: 1, nombre: 'Juan Pérez', correo: 'estudiante@utch.edu.mx', matricula: '2021034821', carrera: 'Ing. Mecatrónica' }, creado: hoy(16, 30, 1), observaciones: '¿Qué archivos o carpetas tiene en la raíz?' },
    { id: 102, folio: '#ENT-102', hallazgoId: 99, titulo: 'Chamarra Deportiva UTCH', estado: 'entregado', descripcionPrivada: '', solicitante: { id: 1, nombre: 'Juan Pérez', correo: 'estudiante@utch.edu.mx', matricula: '2021034821', carrera: 'Ing. Mecatrónica' }, creado: hoy(13, 15, 12), entrega: { fecha: hoy(13, 15, 12), agente: 'Of. R. Méndez (Caseta 1)' }, observaciones: '' },
    { id: 842, folio: '#REC-842', hallazgoId: 5, titulo: 'Mochila Negra con Llavero metálico', estado: 'enviado', descripcionPrivada: 'Trae credencial de gimnasio y audífonos blancos en bolsa interna', solicitante: { id: 6, nombre: 'Ana Ruiz', correo: 'ana.ruiz@utch.edu.mx', matricula: '2021034822', carrera: 'Ing. Mecatrónica' }, creado: hoy(12, 0), observaciones: '' },
  ],
  alertas: [
    { id: 84, folio: '#EXT-084', titulo: 'Credencial Universitaria', texto: 'Se encontró un objeto similar en Servicios Escolares hace 2 horas.', hallazgoId: 2 },
  ],
  usuarios: {
    'estudiante@utch.edu.mx': { id: 1, nombre: 'Juan Pérez', correo: 'estudiante@utch.edu.mx', matricula: '2021034821', carrera: 'Ing. Mecatrónica', rol: 'estudiante' },
    'docente@utch.edu.mx': { id: 4, nombre: 'Enrique (docente)', correo: 'docente@utch.edu.mx', matricula: null, carrera: null, rol: 'estudiante' },
    'vigilancia@utch.edu.mx': { id: 2, nombre: 'G. Morales', correo: 'vigilancia@utch.edu.mx', matricula: null, carrera: null, rol: 'vigilancia', turno: 'Turno matutino 07:00–15:00' },
    'admin@utch.edu.mx': { id: 3, nombre: 'Coordinación', correo: 'admin@utch.edu.mx', matricula: null, carrera: null, rol: 'administrador', turno: 'Coordinación de Seguridad' },
  },
}
