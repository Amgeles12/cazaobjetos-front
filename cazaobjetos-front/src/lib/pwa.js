import { useEffect, useState } from 'react'

/** Botón «Instalar app»: Chrome, Edge y Android disparan beforeinstallprompt. */
export function useInstall() {
  const [evento, setEvento] = useState(null)
  const [instalada, setInstalada] = useState(
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  )
  const [mostrarAyuda, setMostrarAyuda] = useState(false)

  useEffect(() => {
    const antes = (e) => { e.preventDefault(); setEvento(e) }
    const despues = () => { setEvento(null); setInstalada(true) }
    window.addEventListener('beforeinstallprompt', antes)
    window.addEventListener('appinstalled', despues)
    return () => {
      window.removeEventListener('beforeinstallprompt', antes)
      window.removeEventListener('appinstalled', despues)
    }
  }, [])

  async function instalar() {
    if (!evento) {
      setMostrarAyuda(true)
      return
    }

    try {
      await evento.prompt()
      const { outcome } = await evento.userChoice
      setEvento(null)
      if (outcome === 'dismissed') setMostrarAyuda(true)
    } catch (error) {
      setEvento(null)
      setMostrarAyuda(true)
      console.error('No se pudo abrir el diálogo de instalación de CazaObjetos.', error)
    }
  }
  return {
    instalada,
    mostrarAyuda,
    cerrarAyuda: () => setMostrarAyuda(false),
    instalar,
  }
}

export function useOnline() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  return online
}
