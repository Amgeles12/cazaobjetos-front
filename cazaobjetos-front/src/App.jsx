import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import { ToastProvider } from './components/Toast.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Explorar from './pages/Explorar.jsx'
import Reclamo from './pages/Reclamo.jsx'
import MisReclamos from './pages/MisReclamos.jsx'
import Reportar from './pages/Reportar.jsx'
import Vigilancia from './pages/Vigilancia.jsx'

export default function App() {
  const { usuario } = useAuth()
  if (!usuario) return <Login />

  return (
    <ToastProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Explorar />} />
          <Route path="/reclamo/:id" element={<Reclamo />} />
          <Route path="/reclamos" element={<MisReclamos />} />
          <Route path="/reportar" element={<Reportar />} />
          <Route path="/vigilancia" element={<Vigilancia />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ToastProvider>
  )
}
