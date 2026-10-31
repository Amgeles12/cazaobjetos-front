import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useOnline } from '../lib/pwa.js'
import InstallApp from './InstallApp.jsx'
import { IconBack, IconClipboard, IconGrid, IconPlus, IconSearch, IconShield, IconUser } from './Icons.jsx'

const TITULOS = {
  '/': 'Explorar',
  '/reportar': 'Reportar',
  '/reclamos': 'Mis reclamos',
  '/vigilancia': 'Admin Vig',
}

export default function Layout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { usuario, logout, esStaff } = useAuth()
  const online = useOnline()
  const enReclamo = pathname.startsWith('/reclamo/')
  const titulo = enReclamo ? 'Flujo de reclamo' : TITULOS[pathname] || 'CazaObjetos'

  const items = [
    { to: '/', label: 'Explorar', icon: <IconGrid />, end: true },
    { to: '/reportar', label: 'Reportar', icon: <IconPlus /> },
    { to: '/reclamos', label: 'Reclamos', icon: <IconClipboard /> },
    ...(esStaff ? [{ to: '/vigilancia', label: 'Admin/Vig', icon: <IconShield /> }] : []),
  ]

  return (
    <div className="app app--shell">
      <header className="topbar">
        {enReclamo && (
          <button className="back-btn" onClick={() => navigate(-1)} aria-label="Volver">
            <IconBack />
          </button>
        )}
        <div className="topbar__main">
          {!enReclamo && (
            <div className="topbar__brand">
              <span className="utch-logo-frame">
                <img className="utch-logo" src="/utch-logo.png" alt="Universidad Tecnológica de Chihuahua" />
              </span>
              Caza objetos UTCH
            </div>
          )}
          <h1 className="topbar__title">{titulo}</h1>
        </div>
        <InstallApp compact />
        {enReclamo && (
          <span className="utch-logo-frame">
            <img className="utch-logo" src="/utch-logo.png" alt="Universidad Tecnológica de Chihuahua" />
          </span>
        )}
        {!enReclamo && (
          <button className="icon-btn" aria-label="Buscar" onClick={() => navigate('/')}>
            <IconSearch />
          </button>
        )}
        <button
          className="avatar"
          aria-label={`Cerrar sesión de ${usuario?.nombre ?? ''}`}
          title="Cerrar sesión"
          onClick={() => { if (window.confirm('¿Quieres cerrar sesión?')) logout() }}
        >
          <IconUser width={20} height={20} />
        </button>
      </header>

      <main className="screen">
        {!online && (
          <div className="notice notice--pend" role="status">
            Sin conexión. Verás lo último que cargaste, pero no podrás enviar ni revisar solicitudes hasta reconectarte.
          </div>
        )}
        <Outlet />
      </main>

      <nav className="bottomnav" aria-label="Navegación principal">
        {items.map((it) => (
          <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="pill">{it.icon}</span>
            {it.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
