export const CATEGORIAS = ['Electrónica', 'Documentos', 'Llaves', 'Ropa/Mochilas', 'Otro']
export const CASETAS = ['Caseta A', 'Caseta Central', 'Caseta Poniente', 'Vigilancia', 'Servicios Escolares']
export const UBICACIONES = ['Biblioteca', 'Cafetería', 'Laboratorios', 'Canchas', 'Estacionamiento', 'Salones', 'Gimnasio']

// Estados del reclamo: igual al diagrama de estados del back
// Enviado -> EnRevision <-> RequierePruebas ; EnRevision -> Aprobado | Rechazado ; Aprobado -> Entregado | Cancelado
export const ESTADOS_RECLAMO = {
  enviado: { label: 'Enviado', chip: 'info', etapa: 1 },
  en_revision: { label: 'En revisión', chip: 'info', etapa: 2 },
  requiere_pruebas: { label: 'Requiere pruebas', chip: 'pend', etapa: 2 },
  aprobado: { label: 'Aprobado · listo para entrega', chip: 'ok', etapa: 3 },
  rechazado: { label: 'Rechazado', chip: 'peligro', etapa: 2 },
  entregado: { label: 'Cerrado · Entregado', chip: 'cat', etapa: 4 },
  cancelado: { label: 'Cancelado', chip: 'cat', etapa: 1 },
}
export const ESTADOS_ACTIVOS = ['enviado', 'en_revision', 'requiere_pruebas', 'aprobado']
export const ESTADOS_CERRADOS = ['entregado', 'cancelado', 'rechazado']

// Estado del hallazgo (publicación + resguardo)
export const ESTADOS_HALLAZGO = {
  bajo_custodia: { label: 'Bajo custodia', chip: 'ok' },
  con_finder: { label: 'Con quien lo encontró', chip: 'info' },
  en_revision: { label: 'Reclamo en revisión', chip: 'pend' },
  entregado: { label: 'Entregado', chip: 'cat' },
}

export const ETAPAS = ['Enviado', 'Revisión', 'Aprobado', 'Entregado']
