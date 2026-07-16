import { useEffect, useState } from 'react'

function Movimentacoes() {
  const [movimentacoes, setMovimentacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false)

  const [produtos, setProdutos] = useState([])

  // Campos da nova movimentação
  const [produtoId, setProdutoId] = useState('')
  const [tipo, setTipo] = useState('')
  const [motivo, setMotivo] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [responsavel, setResponsavel] = useState('')

  // Campos dos filtros
  const [filtroProdutoId, setFiltroProdutoId] =
    useState('')

  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroInicio, setFiltroInicio] = useState('')
  const [filtroFim, setFiltroFim] = useState('')

  useEffect(() => {
    async function carregarMovimentacoes() {
      try {
        setErro('')

        const resposta = await fetch(
          'http://localhost:8080/movimentacoes'
        )

        if (!resposta.ok) {
          throw new Error(
            'Não foi possível carregar as movimentações'
          )
        }

        const dados = await resposta.json()
        setMovimentacoes(dados)
      } catch (erro) {
        setErro(erro.message)
      } finally {
        setCarregando(false)
      }
    }

    carregarMovimentacoes()
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
        setProdutos(dados)
      } catch (erro) {
        setErro(erro.message)
      }
    }

    carregarProdutos()
  }, [])

  const motivosPorTipo = {
    ENTRADA: [
      'COMPRA',
      'AJUSTE',
      'BONIFICACAO',
    ],

    SAIDA: [
      'PRODUCAO',
      'PERDA',
      'VALIDADE',
      'AJUSTE',
    ],
  }

  function formatarData(data) {
    return new Date(data).toLocaleString('pt-BR')
  }

  async function salvarMovimentacao(evento) {
    evento.preventDefault()

    try {
      setErro('')

      const resposta = await fetch(
        'http://localhost:8080/movimentacoes',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            produtoId: Number(produtoId),
            tipo: tipo,
            motivo: motivo,
            quantidade: Number(quantidade),
            responsavel: responsavel.trim(),
          }),
        }
      )

      if (!resposta.ok) {
        let mensagemErro =
          'Não foi possível registrar a movimentação'

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

      const novaMovimentacao = await resposta.json()

      setMovimentacoes((movimentacoesAtuais) => [
        novaMovimentacao,
        ...movimentacoesAtuais,
      ])

      setProdutoId('')
      setTipo('')
      setMotivo('')
      setQuantidade('')
      setResponsavel('')
      setMostrarFormulario(false)
    } catch (erro) {
      setErro(erro.message)
    }
  }

  async function aplicarFiltros(evento) {
    evento.preventDefault()

    if (
      (filtroInicio && !filtroFim) ||
      (!filtroInicio && filtroFim)
    ) {
      setErro(
        'Informe a data inicial e a data final do período'
      )

      return
    }

    try {
      setErro('')
      setCarregando(true)

      const parametros = new URLSearchParams()

      if (filtroProdutoId) {
        parametros.append(
          'produtoId',
          filtroProdutoId
        )
      }

      if (filtroTipo) {
        parametros.append('tipo', filtroTipo)
      }

      if (filtroInicio) {
        parametros.append('inicio', filtroInicio)
      }

      if (filtroFim) {
        parametros.append('fim', filtroFim)
      }

      const resposta = await fetch(
        `http://localhost:8080/movimentacoes/filtro?${parametros.toString()}`
      )

      if (!resposta.ok) {
        let mensagemErro =
          'Não foi possível filtrar as movimentações'

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
      setMovimentacoes(dados)
    } catch (erro) {
      setErro(erro.message)
    } finally {
      setCarregando(false)
    }
  }

  async function limparFiltros() {
    setFiltroProdutoId('')
    setFiltroTipo('')
    setFiltroInicio('')
    setFiltroFim('')
    setErro('')
    setCarregando(true)

    try {
      const resposta = await fetch(
        'http://localhost:8080/movimentacoes'
      )

      if (!resposta.ok) {
        throw new Error(
          'Não foi possível carregar as movimentações'
        )
      }

      const dados = await resposta.json()
      setMovimentacoes(dados)
    } catch (erro) {
      setErro(erro.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <section className="conteudo">
      <div className="cabecalho-pagina">
        <div>
          <h1>Movimentações</h1>

          <p>
            Histórico de entradas e saídas do estoque
          </p>
        </div>

        <button
          type="button"
          className="botao-principal"
          onClick={() =>
            setMostrarFormulario(!mostrarFormulario)
          }
        >
          {mostrarFormulario
            ? 'Cancelar'
            : '+ Nova movimentação'}
        </button>
      </div>

      {mostrarFormulario && (
        <form
          className="formulario-movimentacao"
          onSubmit={salvarMovimentacao}
        >
          <h2>Registrar movimentação</h2>

          <div className="campos-formulario">
            <label>
              Produto

              <select
                value={produtoId}
                onChange={(evento) =>
                  setProdutoId(evento.target.value)
                }
                required
              >
                <option value="">
                  Selecione um produto
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
              Tipo

              <select
                value={tipo}
                onChange={(evento) => {
                  setTipo(evento.target.value)
                  setMotivo('')
                }}
                required
              >
                <option value="">
                  Selecione o tipo
                </option>

                <option value="ENTRADA">
                  Entrada
                </option>

                <option value="SAIDA">
                  Saída
                </option>
              </select>
            </label>

            <label>
              Motivo

              <select
                value={motivo}
                onChange={(evento) =>
                  setMotivo(evento.target.value)
                }
                disabled={!tipo}
                required
              >
                <option value="">
                  Selecione o motivo
                </option>

                {tipo &&
                  motivosPorTipo[tipo].map(
                    (motivoDisponivel) => (
                      <option
                        key={motivoDisponivel}
                        value={motivoDisponivel}
                      >
                        {motivoDisponivel}
                      </option>
                    )
                  )}
              </select>
            </label>

            <label>
              Quantidade

              <input
                type="number"
                min="1"
                value={quantidade}
                onChange={(evento) =>
                  setQuantidade(evento.target.value)
                }
                required
              />
            </label>

            <label>
              Responsável

              <input
                type="text"
                value={responsavel}
                onChange={(evento) =>
                  setResponsavel(evento.target.value)
                }
                required
              />
            </label>
          </div>

          <button
            type="submit"
            className="botao-principal"
          >
            Registrar movimentação
          </button>
        </form>
      )}

      <form
        className="formulario-filtros"
        onSubmit={aplicarFiltros}
      >
        <div className="cabecalho-filtros">
          <h2>Filtrar movimentações</h2>

          <button
            type="button"
            className="botao-limpar"
            onClick={limparFiltros}
          >
            Limpar filtros
          </button>
        </div>

        <div className="campos-filtros">
          <label>
            Produto

            <select
              value={filtroProdutoId}
              onChange={(evento) =>
                setFiltroProdutoId(
                  evento.target.value
                )
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
            Tipo

            <select
              value={filtroTipo}
              onChange={(evento) =>
                setFiltroTipo(evento.target.value)
              }
            >
              <option value="">
                Todos os tipos
              </option>

              <option value="ENTRADA">
                Entrada
              </option>

              <option value="SAIDA">
                Saída
              </option>
            </select>
          </label>

          <label>
            Data inicial

            <input
              type="datetime-local"
              value={filtroInicio}
              onChange={(evento) =>
                setFiltroInicio(evento.target.value)
              }
            />
          </label>

          <label>
            Data final

            <input
              type="datetime-local"
              value={filtroFim}
              onChange={(evento) =>
                setFiltroFim(evento.target.value)
              }
            />
          </label>
        </div>

        <button
          type="submit"
          className="botao-principal"
        >
          Aplicar filtros
        </button>
      </form>

      <section className="secao-tabela">
        <h2>Histórico de movimentações</h2>

        {carregando && (
          <p>Carregando movimentações...</p>
        )}

        {erro && (
          <p className="mensagem-erro">
            {erro}
          </p>
        )}

        {!carregando &&
          !erro &&
          movimentacoes.length === 0 && (
            <p className="mensagem-vazia">
              Nenhuma movimentação encontrada.
            </p>
          )}

        {!carregando &&
          !erro &&
          movimentacoes.length > 0 && (
            <table className="tabela-produtos">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Produto</th>
                  <th>Tipo</th>
                  <th>Motivo</th>
                  <th>Quantidade</th>
                  <th>Responsável</th>
                </tr>
              </thead>

              <tbody>
                {movimentacoes.map(
                  (movimentacao) => (
                    <tr key={movimentacao.id}>
                      <td>
                        {formatarData(
                          movimentacao.dataMovimentacao
                        )}
                      </td>

                      <td>
                        {movimentacao.produtoNome}
                      </td>

                      <td>
                        {movimentacao.tipo}
                      </td>

                      <td>
                        {movimentacao.motivo}
                      </td>

                      <td>
                        {movimentacao.quantidade}
                      </td>

                      <td>
                        {movimentacao.responsavel}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
      </section>
    </section>
  )
}

export default Movimentacoes