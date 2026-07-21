import { useEffect, useState } from 'react'
import { Link } from 'react-router'

import CardResumo from '../components/CardResumo'
import TabelaProdutos from '../components/TabelaProdutos'
import MovimentacoesRecentes from '../components/MovimentacoesRecentes'
import SugestaoCompras from '../components/SugestaoCompras'
import dashboardService from '../services/dashboardService'

function Dashboard() {
  const [resumo, setResumo] = useState({
    totalProdutosAtivos: 0,
    produtosOk: 0,
    produtosAtencao: 0,
    produtosComprar: 0,
  })

  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const dataAtual = new Date().toLocaleDateString(
    'pt-BR',
    {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }
  )

  useEffect(() => {
    async function carregarResumo() {
      try {
        setErro('')
        setCarregando(true)

        const dados =
          await dashboardService.buscarResumo()

        setResumo(dados)
      } catch (erro) {
        setErro(erro.message)
      } finally {
        setCarregando(false)
      }
    }

    carregarResumo()
  }, [])

  return (
    <section className="conteudo">
      <div className="cabecalho-dashboard">
        <div>
          <h1>Dashboard</h1>

          <p>
            Visão geral do estoque da Tomania
          </p>
        </div>

        <span className="data-dashboard">
          {dataAtual}
        </span>
      </div>

      {erro && (
        <p className="mensagem-erro">
          {erro}
        </p>
      )}

      {carregando && (
        <p>Carregando resumo do estoque...</p>
      )}

      <div className="cards-resumo">
        <CardResumo
          titulo="Produtos ativos"
          valor={resumo.totalProdutosAtivos}
          tipo="total"
          icone="🛍️"
        />

        <CardResumo
          titulo="Estoque OK"
          valor={resumo.produtosOk}
          tipo="ok"
          icone="✓"
        />

        <CardResumo
          titulo="Atenção"
          valor={resumo.produtosAtencao}
          tipo="atencao"
          icone="⚠️"
        />

        <CardResumo
          titulo="Comprar urgente"
          valor={resumo.produtosComprar}
          tipo="comprar"
          icone="!"
        />
      </div>

      <TabelaProdutos />

      <section className="secao-acoes-rapidas">
        <div className="titulo-secao">
          <div>
            <h2>Ações rápidas</h2>

            <p>
              Registre entradas e saídas do estoque
            </p>
          </div>
        </div>

        <div className="acoes-rapidas">
          <Link
            to="/movimentacoes"
            className="acao-rapida acao-entrada"
          >
            <span className="icone-acao">
              +
            </span>

            <div>
              <strong>Registrar entrada</strong>

              <p>
                Adicionar produtos ao estoque
              </p>
            </div>
          </Link>

          <Link
            to="/movimentacoes"
            className="acao-rapida acao-saida"
          >
            <span className="icone-acao">
              −
            </span>

            <div>
              <strong>Registrar saída</strong>

              <p>
                Registrar produção, perda ou validade
              </p>
            </div>
          </Link>
        </div>
      </section>

      <MovimentacoesRecentes />

      <SugestaoCompras />
    </section>
  )
}

export default Dashboard