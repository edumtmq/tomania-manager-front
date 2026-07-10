import './App.css'
import Sidebar from './components/Sidebar'
import CardResumo from './components/CardResumo'

function App() {
  return (
    <main className="app">
      <Sidebar />

      <section className="conteudo">
        <div className="cabecalho-dashboard">
          <h1>Dashboard</h1>
          <p>Controle de estoque da Tomania</p>
        </div>

        <div className="cards-resumo">
          <CardResumo titulo="Produtos ativos" valor={10} />
          <CardResumo titulo="Estoque OK" valor={6} />
          <CardResumo titulo="Atenção" valor={2} />
          <CardResumo titulo="Comprar" valor={2} />
        </div>
      </section>
    </main>
  )
}

export default App