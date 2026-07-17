import { useEffect, useState } from 'react'
import { Link } from 'react-router'

function SugestaoCompras() {
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function carregarSugestaoCompras() {
      try {
        setErro('')

        const resposta = await fetch(
          'http://localhost:8080/dashboard/sugestao-compras'
        )

        if (!resposta.ok) {
          throw new Error(
            'Não foi possível carregar as sugestões de compra'
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

    carregarSugestaoCompras()
  }, [])

  function calcularQuantidadeCompra(produto) {
    return Math.max(
      produto.estoqueMinimo - produto.estoqueAtual,
      0
    )
  }

  function obterUrgencia(produto) {
    if (produto.estoqueAtual === 0) {
      return {
        texto: 'Urgente',
        classe: 'urgencia-alta',
      }
    }

    return {
      texto: 'Repor',
      classe: 'urgencia-media',
    }
  }

  const produtosOrdenados = [...produtos].sort(
    (produtoA, produtoB) =>
      calcularQuantidadeCompra(produtoB) -
      calcularQuantidadeCompra(produtoA)
  )

  return (
    <section className="secao-tabela">
      <div className="cabecalho-secao-dashboard">
        <div>
          <h2>Sugestão de compras</h2>

          <p>
            Produtos abaixo do estoque mínimo
          </p>
        </div>

        <Link
          to="/produtos"
          className="link-ver-todos"
        >
          Ver produtos
        </Link>
      </div>

      {carregando && (
        <p>Carregando sugestões de compra...</p>
      )}

      {erro && (
        <p className="mensagem-erro">
          {erro}
        </p>
      )}

      {!carregando &&
        !erro &&
        produtosOrdenados.length === 0 && (
          <div className="mensagem-estoque-ok">
            <strong>Estoque em dia</strong>

            <p>
              Nenhum produto precisa ser comprado no
              momento.
            </p>
          </div>
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
                  <th>Comprar</th>
                  <th>Urgência</th>
                </tr>
              </thead>

              <tbody>
                {produtosOrdenados.map((produto) => {
                  const urgencia =
                    obterUrgencia(produto)

                  return (
                    <tr key={produto.id}>
                      <td>
                        <strong>{produto.nome}</strong>
                      </td>

                      <td>{produto.estoqueAtual}</td>

                      <td>{produto.estoqueMinimo}</td>

                      <td>
                        <strong className="quantidade-compra">
                          {calcularQuantidadeCompra(
                            produto
                          )}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`urgencia-compra ${urgencia.classe}`}
                        >
                          {urgencia.texto}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
    </section>
  )
}

export default SugestaoCompras