import { useInstall } from '../lib/pwa.js'
import { IconDownload } from './Icons.jsx'

function instruccionesInstalacion() {
  const ua = navigator.userAgent
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

  if (ios) {
    return ['Abre esta página en Safari.', 'Toca Compartir y elige «Agregar a pantalla de inicio».']
  }
  if (/Android/i.test(ua)) {
    return ['Abre esta página en Chrome.', 'Toca el menú ⋮ y elige «Instalar aplicación» o «Agregar a pantalla principal».']
  }
  return ['En Chrome o Edge, abre el menú del navegador.', 'Elige «Instalar CazaObjetos UTCH»; también puede aparecer el icono de instalación en la barra de direcciones.']
}

export default function InstallApp({ compact = false }) {
  const { instalada, mostrarAyuda, cerrarAyuda, instalar } = useInstall()
  if (instalada) return null

  return (
    <div className={`install-control${compact ? ' install-control--compact' : ''}`}>
      <button
        className={compact ? 'icon-btn install-btn' : 'btn btn--secondary install-action'}
        onClick={instalar}
        aria-label="Instalar CazaObjetos"
        title="Instalar CazaObjetos"
        aria-expanded={mostrarAyuda}
      >
        <IconDownload /> <span className="install-btn__txt">Instalar</span>
      </button>
      {mostrarAyuda && (
        <div className="install-help" role="region" aria-label="Cómo instalar CazaObjetos">
          <button className="install-help__close" onClick={cerrarAyuda} aria-label="Cerrar instrucciones">×</button>
          <strong>Instala CazaObjetos en tu dispositivo</strong>
          <ol>{instruccionesInstalacion().map((paso) => <li key={paso}>{paso}</li>)}</ol>
          <p>Si no aparece la opción, abre el sitio con conexión segura (HTTPS).</p>
        </div>
      )}
    </div>
  )
}
