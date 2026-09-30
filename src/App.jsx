// import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import Routes from './routes/index.jsx'
import AuthHydrator from './hooks/AuthHydrator.jsx'
import DemoBadge from './demo/DemoBadge.jsx'


function App() {

  return (
    // basename: las rutas (/login, /admin…) cuelgan de la subcarpeta donde se publica la demo
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <AuthHydrator>
        <Routes></Routes>
      </AuthHydrator>
      <DemoBadge />
    </BrowserRouter>
  )
}

export default App
