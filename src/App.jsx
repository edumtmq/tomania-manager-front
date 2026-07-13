import { BrowserRouter, Route, Routes } from 'react-router'

import './App.css'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Produtos from './pages/Produtos'
import Movimentacoes from './pages/Movimentacoes'
import Relatorios from './pages/Relatorios'

function App() {

  return (
    <BrowserRouter>
      <main className="app">
        <Sidebar />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/movimentacoes" element={<Movimentacoes />} />
          <Route path="/relatorios" element={<Relatorios />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App