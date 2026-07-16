import { NavLink } from 'react-router'

function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>Tomania Manager</h2>

      <nav>
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/produtos">Produtos</NavLink>
        <NavLink to="/movimentacoes">Movimentações</NavLink>
        <NavLink to="/relatorios">Relatórios</NavLink>
      </nav>
    </aside>
  )
}

export default Sidebar