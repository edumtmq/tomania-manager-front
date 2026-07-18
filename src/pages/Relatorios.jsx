import { useEffect, useState } from 'react'

function Relatorios() {
  const [relatorios, setRelatorios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [dias, setDias] = useState('7')
  const [periodoAplicado, setPeriodoAplicado] =
    useState(7)

  const [produtos, setProdutos] = useState([])
  const [produtoId, setProdutoId] = useState('')

  const [
    produtoAplicadoNome,
    setProdutoAplicadoNome,
  ] = useState('Todos os produtos')

  useEffect(() => {
    carregarRelatorio(7, '')
  }, [])

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const resposta = await fetch(
          'http://localhost:8080/produtos'
        )

        if (!resposta.ok) {
          throw new Error(
            'Não foi possível carregar os produtos'
          )
        }

        const dados = await resposta.json()

        const produtosOrdenados = [...dados].sort(
          (produtoA, produtoB) =>
            produtoA.nome.localeCompare(
              produtoB.nome,
              'pt-BR'
            )
        )

        setProdutos(produtosOrdenados)
      } catch (erro) {
        setErro(erro.message)
      }
    }

    carregarProdutos()
  }, [])

  const relatoriosOrdenados = [...relatorios].sort(
    (relatorioA, relatorioB) =>
      Number(relatorioB.totalSaidas || 0) -
      Number(relatorioA.totalSaidas || 0)
  )

  const resumoRelatorio = {
    produtos: relatorios.length,

    entradas: relatorios.reduce(
      (total, relatorio) =>
        total +
        Number(relatorio.totalEntradas || 0),
      0
    ),

    saidas: relatorios.reduce(
      (total, relatorio) =>
        total +
        Number(relatorio.totalSaidas || 0),
      0
    ),

    perdas: relatorios.reduce(
      (total, relatorio) =>
        total +
        Number(relatorio.saidaPerda || 0),
      0
    ),
  }

  async function carregarRelatorio(
    periodo,
    produtoSelecionado
  ) {
    try {
      setErro('')
      setCarregando(true)

      const parametros = new URLSearchParams()

      parametros.append('dias', periodo)

      if (produtoSelecionado) {
        parametros.append(
          'produtoId',
          produtoSelecionado
        )
      }

      const resposta = await fetch(
        `http://localhost:8080/relatorios/produtos-movimentacao?${parametros.toString()}`
      )

      if (!resposta.ok) {
        let mensagemErro =
          'Não foi possível carregar o relatório'

        try {
          const dadosErro = await resposta.json()

          if (dadosErro.mensagem) {
            mensagemErro = dadosErro.mensagem
          }
        } catch {
          // Mantém a mensagem padrão.
        }

        throw new Error(mensagemErro)
      }

      const dados = await resposta.json()
      setRelatorios(dados)
      setPeriodoAplicado(Number(periodo))

      if (produtoSelecionado) {
        const produtoSelecionadoEncontrado =
          produtos.find(
            (produto) =>
              String(produto.id) ===
              String(produtoSelecionado)
          )

        setProdutoAplicadoNome(
          produtoSelecionadoEncontrado?.nome ||
            'Produto selecionado'
        )
      } else {
        setProdutoAplicadoNome(
          'Todos os produtos'
        )
      }
    } catch (erro) {
      setErro(erro.message)
    } finally {
      setCarregando(false)
    }
  }

  function aplicarFiltros(evento) {
    evento.preventDefault()

    carregarRelatorio(
      Number(dias),
      produtoId
    )
  }

  function limparFiltros() {
    setDias('7')
    setProdutoId('')
    carregarRelatorio(7, '')
  }

  function formatarNumero(valor) {
    return Number(valor || 0).toLocaleString(
      'pt-BR'
    )
  }

  function formatarMedia(valor) {
    return Number(valor || 0).toLocaleString(
      'pt-BR',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )
  }

  return (
    <section className="conteudo">
      <div className="cabecalho-pagina">
        <div>
          <h1>Relatórios</h1>

          <p>
            Análise das entradas, saídas e consumo dos
            produtos
          </p>
        </div>
      </div>

      <div className="cards-resumo cards-relatorios">
        <div className="card-resumo card-total">
          <div className="card-resumo-topo">
            <p>Produtos analisados</p>

            <span className="card-resumo-icone">
              📦
            </span>
          </div>

          <strong>
            {resumoRelatorio.produtos}
          </strong>
        </div>

        <div className="card-resumo card-ok">
          <div className="card-resumo-topo">
            <p>Total de entradas</p>

            <span className="card-resumo-icone">
              +
            </span>
          </div>

          <strong>
            {formatarNumero(
              resumoRelatorio.entradas
            )}
          </strong>
        </div>

        <div className="card-resumo card-comprar">
          <div className="card-resumo-topo">
            <p>Total de saídas</p>

            <span className="card-resumo-icone">
              −
            </span>
          </div>

          <strong>
            {formatarNumero(
              resumoRelatorio.saidas
            )}
          </strong>
        </div>

        <div className="card-resumo card-atencao">
          <div className="card-resumo-topo">
            <p>Perdas registradas</p>

            <span className="card-resumo-icone">
              ⚠️
            </span>
          </div>

          <strong>
            {formatarNumero(
              resumoRelatorio.perdas
            )}
          </strong>
        </div>
      </div>

      <form
        className="formulario-relatorio"
        onSubmit={aplicarFiltros}
      >
        <div className="cabecalho-filtros">
          <div>
            <h2>Gerar relatório</h2>

            <p>
              Selecione um produto e o período de
              análise.
            </p>
          </div>

          <button
            type="button"
            className="botao-limpar"
            onClick={limparFiltros}
          >
            Limpar filtros
          </button>
        </div>

        <div className="campos-relatorio">
          <label>
            Produto

            <select
              value={produtoId}
              onChange={(evento) =>
                setProdutoId(evento.target.value)
              }
            >
              <option value="">
                Todos os produtos
              </option>

              {produtos.map((produto) => (
                <option
                  key={produto.id}
                  value={produto.id}
                >
                  {produto.nome}
                </option>
              ))}
            </select>
          </label>

          <label>
            Período analisado

            <select
              value={dias}
              onChange={(evento) =>
                setDias(evento.target.value)
              }
            >
              <option value="7">
                Últimos 7 dias
              </option>

              <option value="15">
                Últimos 15 dias
              </option>

              <option value="30">
                Últimos 30 dias
              </option>

              <option value="60">
                Últimos 60 dias
              </option>
            </select>
          </label>
        </div>

        <button
          type="submit"
          className="botao-principal"
        >
          Gerar relatório
        </button>
      </form>

      {erro && (
        <p className="mensagem-erro">
          {erro}
        </p>
      )}

      <section className="secao-tabela">
        <div className="cabecalho-tabela-produtos">
          <div>
            <h2>Movimentações por produto</h2>

            <p>
              {produtoAplicadoNome} • Últimos{' '}
              {periodoAplicado} dias •{' '}
              {relatoriosOrdenados.length}{' '}
              {relatoriosOrdenados.length === 1
                ? 'produto encontrado'
                : 'produtos encontrados'}
            </p>
          </div>
        </div>

        {carregando && (
          <p>Carregando relatório...</p>
        )}

        {!carregando &&
          !erro &&
          relatoriosOrdenados.length === 0 && (
            <p className="mensagem-vazia">
              Nenhuma informação encontrada para o
              período.
            </p>
          )}

        {!carregando &&
          !erro &&
          relatoriosOrdenados.length > 0 && (
            <div className="tabela-responsiva">
              <table className="tabela-produtos">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Estoque atual</th>
                    <th>Entradas</th>
                    <th>Saídas</th>
                    <th>Produção</th>
                    <th>Perdas</th>
                    <th>Validade</th>
                    <th>Média diária</th>
                  </tr>
                </thead>

                <tbody>
                  {relatoriosOrdenados.map(
                    (relatorio) => (
                      <tr key={relatorio.produtoId}>
                        <td>
                          <strong>
                            {relatorio.produtoNome}
                          </strong>
                        </td>

                        <td>
                          {formatarNumero(
                            relatorio.estoqueAtual
                          )}
                        </td>

                        <td className="valor-entrada">
                          {formatarNumero(
                            relatorio.totalEntradas
                          )}
                        </td>

                        <td className="valor-saida">
                          {formatarNumero(
                            relatorio.totalSaidas
                          )}
                        </td>

                        <td>
                          {formatarNumero(
                            relatorio.saidaProducao
                          )}
                        </td>

                        <td className="valor-perda">
                          {formatarNumero(
                            relatorio.saidaPerda
                          )}
                        </td>

                        <td className="valor-perda">
                          {formatarNumero(
                            relatorio.saidaValidade
                          )}
                        </td>

                        <td>
                          {formatarMedia(
                            relatorio.consumoMedioDiario
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
      </section>
    </section>
  )
}

export default Relatorios