import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { USE_MOCK } from '../lib/api.js'
import InstallApp from '../components/InstallApp.jsx'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email.trim().toLowerCase().endsWith('@utch.edu.mx')) {
      setError('Usa tu correo institucional que termina en @utch.edu.mx.')
      return
    }
    setCargando(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="app">
      <div className="login">
        <div>
          <span className="tag-utch">UTCH</span>
          <h1>Inicia sesión en CazaObjetos</h1>
          <p className="muted">Solo la comunidad UTCH puede reclamar objetos. Entra con tu correo institucional.</p>
          <InstallApp />
        </div>
        <form className="card" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Correo institucional</label>
            <input id="email" className="input" type="email" autoComplete="username" placeholder="matricula@utch.edu.mx" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="pass">Contraseña</label>
            <input id="pass" className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <div className="notice notice--peligro" role="alert">{error}</div>}
          <button className="btn btn--primary" disabled={cargando}>{cargando ? 'Entrando…' : 'Entrar'}</button>
        </form>
        {USE_MOCK && (
          <div className="notice notice--info">
            <span>
              Modo de prueba. Entra con <b>estudiante@</b>, <b>docente@</b> o <b>vigilancia@utch.edu.mx</b> (cualquier contraseña).
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
