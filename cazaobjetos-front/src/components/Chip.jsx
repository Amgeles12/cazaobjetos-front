import { ESTADOS_HALLAZGO, ESTADOS_RECLAMO } from '../lib/constants.js'

/** Chip genérico. tipo: ok | pend | info | peligro | cat. El estado nunca se comunica solo con color: siempre lleva texto. */
export function Chip({ tipo = 'cat', dot = false, children }) {
  const cls = ['chip', tipo !== 'cat' && `chip--${tipo}`, dot && 'chip--dot'].filter(Boolean).join(' ')
  return <span className={cls}>{children}</span>
}

export function ChipHallazgo({ estado, custodia }) {
  const e = ESTADOS_HALLAZGO[estado] || { label: estado, chip: 'cat' }
  return <Chip tipo={e.chip} dot>{e.label}{custodia && estado === 'bajo_custodia' ? ` · ${custodia}` : ''}</Chip>
}

export function ChipReclamo({ estado }) {
  const e = ESTADOS_RECLAMO[estado] || { label: estado, chip: 'cat' }
  return <Chip tipo={e.chip}>{e.label}</Chip>
}
