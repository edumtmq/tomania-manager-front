import { useEffect, useState } from 'react'
import { Link } from 'react-router'

function TabelaProdutos() {
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function carregarProdutos() {
      try {
        setErro('')

        const resposta = await fetch(
          'http://localhost:8080/dashboard/produtos-situacao'
        )

        if (!resposta.ok) {
          throw new Error(
            'Não foi possível carregar a situação do estoque'
          )
        }

        const dados = await resposta.json()
        setProdutos(dados)
      } catch (erro) {
        setErro(erro.message)
      } finally {
        setCarregando(false)
      }
    }

    carregarProdutos()
  }, [])

  const prioridadeStatus = {
    COMPRAR: 1,
    ATENCAO: 2,
    OK: 3,
  }

  const rotulosStatus = {
    COMPRAR: 'Comprar',
    ATENCAO: 'Atenção',
    OK: 'OK',
  }

  const produtosOrdenados = [...produtos]
    .sort(
      (produtoA, produtoB) =>
        prioridadeStatus[produtoA.status] -
        prioridadeStatus[produtoB.status]
    )
    .slice(0, 5)

  return (
    <section className="secao-tabela">
      <div className="cabecalho-secao-dashboard">
        <div>
          <h2>Situação do estoque</h2>

          <p>
            Produtos que precisam de maior atenção
          </p>
        </div>

        <Link
          to="/produtos"
          className="link-ver-todos"
        >
          Ver todos os produtos
        </Link>
      </div>

      {carregando && (
        <p>Carregando situação do estoque...</p>
      )}

      {erro && (
        <p className="mensagem-erro">
          {erro}
        </p>
      )}

      {!carregando &&
        !erro &&
        produtosOrdenados.length === 0 && (
          <p className="mensagem-vazia">
            Nenhum produto ativo encontrado.
          </p>
        )}

      {!carregando &&
        !erro &&
        produtosOrdenados.length > 0 && (
          <div className="tabela-responsiva">
            <table className="tabela-produtos">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Estoque atual</th>
                  <th>Estoque mínimo</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {produtosOrdenados.map((produto) => (
                  <tr key={produto.id}>
                    <td>
                      <strong>{produto.nome}</strong>
                    </td>

                    <td>{produto.estoqueAtual}</td>

                    <td>{produto.estoqueMinimo}</td>

                    <td>
                      <span
                        className={`status status-${produto.status.toLowerCase()}`}
                      >
                        {rotulosStatus[produto.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </section>
  )
}

export default TabelaProdutos