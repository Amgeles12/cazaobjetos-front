import { createContext, useContext, useState } from 'react'
import * as api from '../lib/api.js'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

function leerUsuario() {
  try {
    const u = JSON.parse(sessionStorage.getItem('co_user'))
    if (u) api.setUsuario(u)
    return u
  } catch { return null }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuarioState] = useState(leerUsuario)

  async function login(email, password) {
    const { token, usuario: u } = await api.login(email, password)
    api.setToken(token)
    api.setUsuario(u)
    sessionStorage.setItem('co_user', JSON.stringify(u))
    setUsuarioState(u)
  }
  function logout() {
    api.setToken(null)
    api.setUsuario(null)
    sessionStorage.removeItem('co_user')
    setUsuarioState(null)
  }
  const esStaff = !!usuario && ['vigilancia', 'administrador'].includes(usuario.rol)

  return <AuthContext.Provider value={{ usuario, login, logout, esStaff }}>{children}</AuthContext.Provider>
}
