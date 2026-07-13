import { useEffect, useState } from 'react'

import CardResumo from '../components/CardResumo'
import TabelaProdutos from '../components/TabelaProdutos'
import MovimentacoesRecentes from '../components/MovimentacoesRecentes'
import SugestaoCompras from '../components/SugestaoCompras'

function Dashboard() {
  const [resumo, setResumo] = useState({
    totalProdutosAtivos: 0,
    produtosOk: 0,
    produtosAtencao: 0,
    produtosComprar: 0,
  })

  useEffect(() => {
    async function carregarResumo() {
      try {
        const resposta = await fetch(
          'http://localhost:8080/dashboard/resumo'
        )

        if (!resposta.ok) {
          throw new Error('Não foi possível carregar o resumo')
        }

        const dados = await resposta.json()
        setResumo(dados)
      } catch (erro) {
        console.error('Erro ao carregar resumo:', erro)
      }
    }

    carregarResumo()
  }, [])

  return (
    <section className="conteudo">
      <div className="cabecalho-dashboard">
        <h1>Dashboard</h1>
        <p>Controle de estoque da Tomania</p>
      </div>

      <div className="cards-resumo">
        <CardResumo
          titulo="Produtos ativos"
          valor={resumo.totalProdutosAtivos}
        />

        <CardResumo
          titulo="Estoque OK"
          valor={resumo.produtosOk}
        />

        <CardResumo
          titulo="Atenção"
          valor={resumo.produtosAtencao}
        />

        <CardResumo
          titulo="Comprar"
          valor={resumo.produtosComprar}
        />
      </div>

      <TabelaProdutos />
      <MovimentacoesRecentes />
      <SugestaoCompras />
    </section>
  )
}

export default Dashboard