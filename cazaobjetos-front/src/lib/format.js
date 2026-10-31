const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const p = (n) => String(n).padStart(2, '0')

export function fechaCorta(iso) {
  const d = new Date(iso)
  return `${p(d.getDate())} ${MESES[d.getMonth()]} ${d.getFullYear()} · ${p(d.getHours())}:${p(d.getMinutes())}`
}
export const hoyISO = () => new Date().toISOString().slice(0, 10)
export const ahoraHora = () => new Date().toTimeString().slice(0, 5)
