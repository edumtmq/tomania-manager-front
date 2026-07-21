import { useEffect, useState } from 'react'
import movimentacaoService from '../services/movimentacaoService'
import produtoService from '../services/produtoService'

function Movimentacoes() {
  const [movimentacoes, setMovimentacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [produtos, setProdutos] = useState([])

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false)

  const [mostrarEntradaLote, setMostrarEntradaLote] =
    useState(false)

  const [produtoId, setProdutoId] = useState('')
  const [tipo, setTipo] = useState('')
  const [motivo, setMotivo] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [responsavel, setResponsavel] = useState('')

  const [responsavelLote, setResponsavelLote] =
    useState('')

  const [itensLote, setItensLote] = useState([
    {
      produtoId: '',
      quantidade: '',
    },
  ])

  const [filtroProdutoId, setFiltroProdutoId] =
    useState('')

  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroInicio, setFiltroInicio] = useState('')
  const [filtroFim, setFiltroFim] = useState('')

  const [busca, setBusca] = useState('')
  const [sucesso, setSucesso] = useState('')

  useEffect(() => {
    async function carregarMovimentacoes() {
      try {
        setErro('')

        const dados =
          await movimentacaoService.listar()

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
        const dados =
          await produtoService.listar()

        setProdutos(dados)
      } catch (erro) {
        setErro(erro.message)
      }
    }

    carregarProdutos()
  }, [])

  useEffect(() => {
    if (!sucesso) {
      return
    }

    const temporizador = setTimeout(() => {
      setSucesso('')
    }, 3000)

    return () => clearTimeout(temporizador)
  }, [sucesso])

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

  const rotulosTipo = {
    ENTRADA: 'Entrada',
    SAIDA: 'Saída',
  }

  const rotulosMotivo = {
    COMPRA: 'Compra',
    PRODUCAO: 'Produção',
    PERDA: 'Perda',
    VALIDADE: 'Validade',
    AJUSTE: 'Ajuste',
    BONIFICACAO: 'Bonificação',
  }

  const movimentacoesFiltradas = [...movimentacoes]
    .filter((movimentacao) => {
      const termoBusca = busca
        .toLowerCase()
        .trim()

      if (!termoBusca) {
        return true
      }

      const produtoCorresponde =
        movimentacao.produtoNome
          ?.toLowerCase()
          .includes(termoBusca)

      const responsavelCorresponde =
        movimentacao.responsavel
          ?.toLowerCase()
          .includes(termoBusca)

      return (
        produtoCorresponde ||
        responsavelCorresponde
      )
    })
    .sort(
      (movimentacaoA, movimentacaoB) =>
        new Date(
          movimentacaoB.dataMovimentacao
        ) -
        new Date(
          movimentacaoA.dataMovimentacao
        )
    )

  const resumoMovimentacoes = {
    total: movimentacoesFiltradas.length,

    entradas: movimentacoesFiltradas.filter(
      (movimentacao) =>
        movimentacao.tipo === 'ENTRADA'
    ).length,

    saidas: movimentacoesFiltradas.filter(
      (movimentacao) =>
        movimentacao.tipo === 'SAIDA'
    ).length,

    quantidade: movimentacoesFiltradas.reduce(
      (total, movimentacao) =>
        total +
        (Number(movimentacao.quantidade) || 0),
      0
    ),
  }

  function formatarData(data) {
    return new Date(data).toLocaleString('pt-BR')
  }

  async function salvarMovimentacao(evento) {
    evento.preventDefault()

    try {
      setErro('')
      setSucesso('')

      const dadosMovimentacao = {
        produtoId: Number(produtoId),
        tipo,
        motivo,
        quantidade: Number(quantidade),
        responsavel: responsavel.trim(),
      }

      const novaMovimentacao =
        await movimentacaoService.registrar(
          dadosMovimentacao
        )

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

      setSucesso(
        tipo === 'ENTRADA'
          ? 'Entrada registrada com sucesso.'
          : 'Saída registrada com sucesso.'
      )
    } catch (erro) {
      setErro(erro.message)
    }
  }

  function atualizarItemLote(
    indice,
    campo,
    valor
  ) {
    setItensLote((itensAtuais) =>
      itensAtuais.map((item, itemIndice) =>
        itemIndice === indice
          ? {
              ...item,
              [campo]: valor,
            }
          : item
      )
    )
  }

  function adicionarItemLote() {
    setItensLote((itensAtuais) => [
      ...itensAtuais,
      {
        produtoId: '',
        quantidade: '',
      },
    ])
  }

  function removerItemLote(indice) {
    setItensLote((itensAtuais) =>
      itensAtuais.filter(
        (_, itemIndice) => itemIndice !== indice
      )
    )
  }

  async function salvarEntradaLote(evento) {
    evento.preventDefault()

    const produtosSelecionados = itensLote.map(
      (item) => item.produtoId
    )

    const possuiProdutoDuplicado =
      new Set(produtosSelecionados).size !==
      produtosSelecionados.length

    if (possuiProdutoDuplicado) {
      setSucesso('')
      setErro(
        'Não selecione o mesmo produto mais de uma vez'
      )

      return
    }

    try {
      setErro('')
      setSucesso('')

      const itensParaEnviar = itensLote.map(
        (item) => ({
          produtoId: Number(item.produtoId),
          quantidade: Number(item.quantidade),
          responsavel: responsavelLote.trim(),
        })
      )

      const novasMovimentacoes =
        await movimentacaoService.registrarEntradaLote(
          itensParaEnviar
        )

      setMovimentacoes((movimentacoesAtuais) => [
        ...novasMovimentacoes,
        ...movimentacoesAtuais,
      ])

      setItensLote([
        {
          produtoId: '',
          quantidade: '',
        },
      ])

      setResponsavelLote('')
      setMostrarEntradaLote(false)
      setSucesso(
        `${novasMovimentacoes.length} entradas registradas com sucesso.`
      )
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
      setSucesso('')
      setErro(
        'Informe a data inicial e a data final do período'
      )

      return
    }

    try {
      setErro('')
      setSucesso('')
      setCarregando(true)

      const filtros = {
        produtoId: filtroProdutoId,
        tipo: filtroTipo,
        inicio: filtroInicio,
        fim: filtroFim,
      }

      const dados =
        await movimentacaoService.filtrar(
          filtros
        )

      setMovimentacoes(dados)
    } catch (erro) {
      setErro(erro.message)
    } finally {
      setCarregando(false)
    }
  }

  async function limparFiltros() {
    setBusca('')
    setFiltroProdutoId('')
    setFiltroTipo('')
    setFiltroInicio('')
    setFiltroFim('')
    setErro('')
    setSucesso('')
    setCarregando(true)

    try {
      const dados =
        await movimentacaoService.listar()

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

        <div className="acoes-cabecalho">
          <button
            type="button"
            className="botao-secundario"
            onClick={() => {
              setMostrarEntradaLote(
                !mostrarEntradaLote
              )
              setMostrarFormulario(false)
              setErro('')
              setSucesso('')
            }}
          >
            {mostrarEntradaLote
              ? 'Cancelar lote'
              : 'Entrada em lote'}
          </button>

          <button
            type="button"
            className="botao-principal"
            onClick={() => {
              setMostrarFormulario(
                !mostrarFormulario
              )
              setMostrarEntradaLote(false)
              setErro('')
              setSucesso('')
            }}
          >
            {mostrarFormulario
              ? 'Cancelar'
              : '+ Nova movimentação'}
          </button>
        </div>
      </div>

      <div className="cards-resumo cards-movimentacoes">
        <div className="card-resumo card-total">
          <div className="card-resumo-topo">
            <p>Total de registros</p>

            <span className="card-resumo-icone">
              🔄
            </span>
          </div>

          <strong>
            {resumoMovimentacoes.total}
          </strong>
        </div>

        <div className="card-resumo card-ok">
          <div className="card-resumo-topo">
            <p>Entradas</p>

            <span className="card-resumo-icone">
              +
            </span>
          </div>

          <strong>
            {resumoMovimentacoes.entradas}
          </strong>
        </div>

        <div className="card-resumo card-comprar">
          <div className="card-resumo-topo">
            <p>Saídas</p>

            <span className="card-resumo-icone">
              −
            </span>
          </div>

          <strong>
            {resumoMovimentacoes.saidas}
          </strong>
        </div>

        <div className="card-resumo card-atencao">
          <div className="card-resumo-topo">
            <p>Quantidade movimentada</p>

            <span className="card-resumo-icone">
              ∑
            </span>
          </div>

          <strong>
            {resumoMovimentacoes.quantidade}
          </strong>
        </div>
      </div>

      {sucesso && (
        <p className="mensagem-sucesso">
          ✅ {sucesso}
        </p>
      )}

      {erro && (
        <p className="mensagem-erro">
          {erro}
        </p>
      )}

      {mostrarEntradaLote && (
        <form
          className="formulario-movimentacao"
          onSubmit={salvarEntradaLote}
        >
          <h2>Registrar entrada em lote</h2>

          <label className="campo-responsavel-lote">
            Responsável

            <input
              type="text"
              value={responsavelLote}
              onChange={(evento) =>
                setResponsavelLote(
                  evento.target.value
                )
              }
              required
            />
          </label>

          <div className="itens-lote">
            {itensLote.map((item, indice) => (
              <div
                className="item-lote"
                key={indice}
              >
                <label>
                  Produto

                  <select
                    value={item.produtoId}
                    onChange={(evento) =>
                      atualizarItemLote(
                        indice,
                        'produtoId',
                        evento.target.value
                      )
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
                  Quantidade

                  <input
                    type="number"
                    min="1"
                    value={item.quantidade}
                    onChange={(evento) =>
                      atualizarItemLote(
                        indice,
                        'quantidade',
                        evento.target.value
                      )
                    }
                    required
                  />
                </label>

                {itensLote.length > 1 && (
                  <button
                    type="button"
                    className="botao-inativar"
                    onClick={() =>
                      removerItemLote(indice)
                    }
                  >
                    Remover
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="acoes-lote">
            <button
              type="button"
              className="botao-secundario"
              onClick={adicionarItemLote}
            >
              + Adicionar produto
            </button>

            <button
              type="submit"
              className="botao-principal"
            >
              Registrar entradas
            </button>
          </div>
        </form>
      )}

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
                        {rotulosMotivo[
                          motivoDisponivel
                        ] || motivoDisponivel}
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

        <div className="campo-busca-movimentacao">
          <label htmlFor="busca-movimentacao">
            Buscar no histórico
          </label>

          <input
            id="busca-movimentacao"
            type="search"
            value={busca}
            placeholder="Buscar por produto ou responsável..."
            onChange={(evento) =>
              setBusca(evento.target.value)
            }
          />
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
        <div className="cabecalho-tabela-produtos">
          <div>
            <h2>Histórico de movimentações</h2>

            <p>
              {movimentacoesFiltradas.length}{' '}
              {movimentacoesFiltradas.length === 1
                ? 'movimentação encontrada'
                : 'movimentações encontradas'}
            </p>
          </div>
        </div>

        {carregando && (
          <p>Carregando movimentações...</p>
        )}

        {!carregando &&
          movimentacoesFiltradas.length === 0 && (
            <p className="mensagem-vazia">
              Nenhuma movimentação encontrada.
            </p>
          )}

        {!carregando &&
          movimentacoesFiltradas.length > 0 && (
            <div className="tabela-responsiva">
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
                  {movimentacoesFiltradas.map(
                    (movimentacao) => (
                      <tr key={movimentacao.id}>
                        <td>
                          {formatarData(
                            movimentacao.dataMovimentacao
                          )}
                        </td>

                        <td>
                          <strong>
                            {movimentacao.produtoNome}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={`tipo-movimentacao tipo-${movimentacao.tipo.toLowerCase()}`}
                          >
                            {rotulosTipo[
                              movimentacao.tipo
                            ] || movimentacao.tipo}
                          </span>
                        </td>

                        <td>
                          {rotulosMotivo[
                            movimentacao.motivo
                          ] || movimentacao.motivo}
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
            </div>
          )}
      </section>
    </section>
  )
}

export default Movimentacoes