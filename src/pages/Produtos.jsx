import { useEffect, useState } from 'react'

function Produtos() {
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false)

  const [nome, setNome] = useState('')
  const [estoqueMinimo, setEstoqueMinimo] = useState('')

  const [produtoEditandoId, setProdutoEditandoId] =
    useState(null)

  const [mostrarInativos, setMostrarInativos] =
    useState(false)

  const [produtosInativos, setProdutosInativos] =
    useState([])

  const [busca, setBusca] = useState('')

  const [filtroStatus, setFiltroStatus] =
    useState('TODOS')

  useEffect(() => {
    async function carregarProdutos() {
      try {
        setErro('')

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
      } finally {
        setCarregando(false)
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

  const rotulosStatus = {
    OK: 'OK',
    ATENCAO: 'Atenção',
    COMPRAR: 'Comprar',
  }

  const prioridadeStatus = {
    COMPRAR: 1,
    ATENCAO: 2,
    OK: 3,
  }

  const produtosFiltrados = produtos
    .filter((produto) => {
      const nomeCorresponde = produto.nome
        .toLowerCase()
        .includes(busca.toLowerCase().trim())

      const statusCorresponde =
        filtroStatus === 'TODOS' ||
        produto.status === filtroStatus

      return nomeCorresponde && statusCorresponde
    })
    .sort((produtoA, produtoB) => {
      const diferencaPrioridade =
        prioridadeStatus[produtoA.status] -
        prioridadeStatus[produtoB.status]

      if (diferencaPrioridade !== 0) {
        return diferencaPrioridade
      }

      return produtoA.nome.localeCompare(
        produtoB.nome,
        'pt-BR'
      )
    })

  const resumoProdutos = {
    total: produtos.length,

    ok: produtos.filter(
      (produto) => produto.status === 'OK'
    ).length,

    atencao: produtos.filter(
      (produto) => produto.status === 'ATENCAO'
    ).length,

    comprar: produtos.filter(
      (produto) => produto.status === 'COMPRAR'
    ).length,
  }

  const produtosInativosFiltrados =
    produtosInativos
      .filter((produto) =>
        produto.nome
          .toLowerCase()
          .includes(busca.toLowerCase().trim())
      )
      .sort((produtoA, produtoB) =>
        produtoA.nome.localeCompare(
          produtoB.nome,
          'pt-BR'
        )
      )

  async function salvarProduto(evento) {
    evento.preventDefault()

    const estaEditando =
      produtoEditandoId !== null

    const url = estaEditando
      ? `http://localhost:8080/produtos/${produtoEditandoId}`
      : 'http://localhost:8080/produtos'

    const metodo = estaEditando ? 'PUT' : 'POST'

    try {
      setErro('')
      setSucesso('')

      const resposta = await fetch(url, {
        method: metodo,

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          nome: nome.trim(),
          estoqueMinimo: Number(estoqueMinimo),
        }),
      })

      if (!resposta.ok) {
        throw new Error(
          estaEditando
            ? 'Não foi possível editar o produto'
            : 'Não foi possível cadastrar o produto'
        )
      }

      const produtoSalvo = await resposta.json()

      if (estaEditando) {
        setProdutos((produtosAtuais) =>
          produtosAtuais.map((produto) =>
            produto.id === produtoEditandoId
              ? produtoSalvo
              : produto
          )
        )
      } else {
        setProdutos((produtosAtuais) => [
          ...produtosAtuais,
          produtoSalvo,
        ])
      }

      setSucesso(
        estaEditando
          ? 'Produto atualizado com sucesso.'
          : 'Produto cadastrado com sucesso.'
      )

      limparFormulario()
    } catch (erro) {
      setErro(erro.message)
    }
  }

  async function inativarProduto(
    produtoId,
    produtoNome
  ) {
    const confirmou = window.confirm(
      `Deseja realmente inativar o produto ${produtoNome}?`
    )

    if (!confirmou) {
      return
    }

    try {
      setErro('')
      setSucesso('')

      const resposta = await fetch(
        `http://localhost:8080/produtos/${produtoId}`,
        {
          method: 'DELETE',
        }
      )

      if (!resposta.ok) {
        throw new Error(
          'Não foi possível inativar o produto'
        )
      }

      const produtoInativado = produtos.find(
        (produto) => produto.id === produtoId
      )

      setProdutos((produtosAtuais) =>
        produtosAtuais.filter(
          (produto) => produto.id !== produtoId
        )
      )

      if (mostrarInativos && produtoInativado) {
        setProdutosInativos((produtosAtuais) => [
          ...produtosAtuais,
          {
            ...produtoInativado,
            ativo: false,
          },
        ])
      }

      setSucesso(
        `Produto ${produtoNome} inativado com sucesso.`
      )
    } catch (erro) {
      setErro(erro.message)
    }
  }

  function iniciarEdicao(produto) {
    setProdutoEditandoId(produto.id)
    setNome(produto.nome)
    setEstoqueMinimo(produto.estoqueMinimo)
    setMostrarFormulario(true)
    setErro('')
    setSucesso('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function limparFormulario() {
    setNome('')
    setEstoqueMinimo('')
    setProdutoEditandoId(null)
    setMostrarFormulario(false)
  }

  async function alternarProdutosInativos() {
    if (mostrarInativos) {
      setMostrarInativos(false)
      return
    }

    try {
      setErro('')

      const resposta = await fetch(
        'http://localhost:8080/produtos/inativos'
      )

      if (!resposta.ok) {
        throw new Error(
          'Não foi possível carregar os produtos inativos'
        )
      }

      const dados = await resposta.json()

      setProdutosInativos(dados)
      setMostrarInativos(true)
    } catch (erro) {
      setErro(erro.message)
    }
  }

  async function reativarProduto(
    produtoId,
    produtoNome
  ) {
    const confirmou = window.confirm(
      `Deseja realmente reativar o produto ${produtoNome}?`
    )

    if (!confirmou) {
      return
    }

    try {
      setErro('')
      setSucesso('')

      const resposta = await fetch(
        `http://localhost:8080/produtos/${produtoId}/ativar`,
        {
          method: 'PATCH',
        }
      )

      if (!resposta.ok) {
        throw new Error(
          'Não foi possível reativar o produto'
        )
      }

      const produtoReativado =
        await resposta.json()

      setProdutosInativos((produtosAtuais) =>
        produtosAtuais.filter(
          (produto) => produto.id !== produtoId
        )
      )

      setProdutos((produtosAtuais) => [
        ...produtosAtuais,
        produtoReativado,
      ])

      setSucesso(
        `Produto ${produtoNome} reativado com sucesso.`
      )
    } catch (erro) {
      setErro(erro.message)
    }
  }

  function limparBuscaEFiltros() {
    setBusca('')
    setFiltroStatus('TODOS')
  }

  return (
    <section className="conteudo">
      <div className="cabecalho-pagina">
        <div>
          <h1>Produtos</h1>

          <p>
            Gerenciamento dos produtos do estoque
          </p>
        </div>

        <div className="acoes-cabecalho">
          <button
            type="button"
            className="botao-secundario"
            onClick={alternarProdutosInativos}
          >
            {mostrarInativos
              ? 'Ocultar inativos'
              : 'Ver inativos'}
          </button>

          <button
            type="button"
            className="botao-principal"
            onClick={() => {
              if (mostrarFormulario) {
                limparFormulario()
              } else {
                setMostrarFormulario(true)
                setErro('')
                setSucesso('')
              }
            }}
          >
            {mostrarFormulario
              ? 'Cancelar'
              : '+ Novo produto'}
          </button>
        </div>
      </div>

      <div className="cards-resumo cards-produtos">
        <button
          type="button"
          className={`card-resumo card-total card-filtro ${
            filtroStatus === 'TODOS'
              ? 'card-filtro-ativo'
              : ''
          }`}
          onClick={() => setFiltroStatus('TODOS')}
        >
          <div className="card-resumo-topo">
            <p>Total de produtos</p>

            <span className="card-resumo-icone">
              📦
            </span>
          </div>

          <strong>{resumoProdutos.total}</strong>
        </button>

        <button
          type="button"
          className={`card-resumo card-ok card-filtro ${
            filtroStatus === 'OK'
              ? 'card-filtro-ativo'
              : ''
          }`}
          onClick={() => setFiltroStatus('OK')}
        >
          <div className="card-resumo-topo">
            <p>Estoque OK</p>

            <span className="card-resumo-icone">
              ✓
            </span>
          </div>

          <strong>{resumoProdutos.ok}</strong>
        </button>

        <button
          type="button"
          className={`card-resumo card-atencao card-filtro ${
            filtroStatus === 'ATENCAO'
              ? 'card-filtro-ativo'
              : ''
          }`}
          onClick={() =>
            setFiltroStatus('ATENCAO')
          }
        >
          <div className="card-resumo-topo">
            <p>Atenção</p>

            <span className="card-resumo-icone">
              ⚠️
            </span>
          </div>

          <strong>{resumoProdutos.atencao}</strong>
        </button>

        <button
          type="button"
          className={`card-resumo card-comprar card-filtro ${
            filtroStatus === 'COMPRAR'
              ? 'card-filtro-ativo'
              : ''
          }`}
          onClick={() =>
            setFiltroStatus('COMPRAR')
          }
        >
          <div className="card-resumo-topo">
            <p>Comprar urgente</p>

            <span className="card-resumo-icone">
              !
            </span>
          </div>

          <strong>{resumoProdutos.comprar}</strong>
        </button>
      </div>

      {sucesso && (
        <p className="mensagem-sucesso">
          ✅ {sucesso}
        </p>
      )}

      {mostrarFormulario && (
        <form
          className="formulario-produto"
          onSubmit={salvarProduto}
        >
          <h2>
            {produtoEditandoId !== null
              ? 'Editar produto'
              : 'Cadastrar produto'}
          </h2>

          <div className="campos-produto">
            <label>
              Nome do produto

              <input
                type="text"
                value={nome}
                placeholder="Ex.: Pão de Queijo"
                onChange={(evento) =>
                  setNome(evento.target.value)
                }
                required
              />
            </label>

            <label>
              Estoque mínimo

              <input
                type="number"
                min="1"
                value={estoqueMinimo}
                placeholder="Ex.: 5"
                onChange={(evento) =>
                  setEstoqueMinimo(
                    evento.target.value
                  )
                }
                required
              />
            </label>
          </div>

          <button
            type="submit"
            className="botao-principal"
          >
            {produtoEditandoId !== null
              ? 'Salvar alterações'
              : 'Salvar produto'}
          </button>
        </form>
      )}

      <section className="filtros-produtos">
        <div className="campo-busca-produto">
          <label htmlFor="busca-produto">
            Buscar produto
          </label>

          <input
            id="busca-produto"
            type="search"
            value={busca}
            placeholder="Digite o nome do produto..."
            onChange={(evento) =>
              setBusca(evento.target.value)
            }
          />
        </div>

        <div className="campo-filtro-status">
          <label htmlFor="filtro-status">
            Status
          </label>

          <select
            id="filtro-status"
            value={filtroStatus}
            onChange={(evento) =>
              setFiltroStatus(evento.target.value)
            }
          >
            <option value="TODOS">
              Todos os status
            </option>

            <option value="OK">
              Estoque OK
            </option>

            <option value="ATENCAO">
              Atenção
            </option>

            <option value="COMPRAR">
              Comprar
            </option>
          </select>
        </div>

        <button
          type="button"
          className="botao-limpar"
          onClick={limparBuscaEFiltros}
        >
          Limpar filtros
        </button>
      </section>

      {erro && (
        <p className="mensagem-erro">
          {erro}
        </p>
      )}

      <section className="secao-tabela">
        <div className="cabecalho-tabela-produtos">
          <div>
            <h2>Produtos ativos</h2>

            <p>
              {produtosFiltrados.length}{' '}
              {produtosFiltrados.length === 1
                ? 'produto encontrado'
                : 'produtos encontrados'}
            </p>
          </div>
        </div>

        {carregando && (
          <p>Carregando produtos...</p>
        )}

        {!carregando &&
          produtosFiltrados.length === 0 && (
            <p className="mensagem-vazia">
              Nenhum produto corresponde aos filtros
              selecionados.
            </p>
          )}

        {!carregando &&
          produtosFiltrados.length > 0 && (
            <div className="tabela-responsiva">
              <table className="tabela-produtos">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Estoque atual</th>
                    <th>Estoque mínimo</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {produtosFiltrados.map(
                    (produto) => (
                      <tr key={produto.id}>
                        <td>
                          <strong>
                            {produto.nome}
                          </strong>
                        </td>

                        <td>
                          {produto.estoqueAtual}
                        </td>

                        <td>
                          {produto.estoqueMinimo}
                        </td>

                        <td>
                          <span
                            className={`status status-${produto.status.toLowerCase()}`}
                          >
                            {rotulosStatus[
                              produto.status
                            ] || produto.status}
                          </span>
                        </td>

                        <td className="acoes-produto">
                          <button
                            type="button"
                            className="botao-editar"
                            onClick={() =>
                              iniciarEdicao(produto)
                            }
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            className="botao-inativar"
                            onClick={() =>
                              inativarProduto(
                                produto.id,
                                produto.nome
                              )
                            }
                          >
                            Inativar
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
      </section>

      {mostrarInativos && (
        <section className="secao-tabela">
          <div className="cabecalho-tabela-produtos">
            <div>
              <h2>Produtos inativos</h2>

              <p>
                {produtosInativosFiltrados.length}{' '}
                {produtosInativosFiltrados.length === 1
                  ? 'produto encontrado'
                  : 'produtos encontrados'}
              </p>
            </div>
          </div>

          {produtosInativosFiltrados.length === 0 ? (
            <p className="mensagem-vazia">
              Nenhum produto inativo corresponde à
              busca.
            </p>
          ) : (
            <div className="tabela-responsiva">
              <table className="tabela-produtos">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Estoque atual</th>
                    <th>Estoque mínimo</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {produtosInativosFiltrados.map(
                    (produto) => (
                      <tr key={produto.id}>
                        <td>
                          <strong>
                            {produto.nome}
                          </strong>
                        </td>

                        <td>
                          {produto.estoqueAtual}
                        </td>

                        <td>
                          {produto.estoqueMinimo}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="botao-reativar"
                            onClick={() =>
                              reativarProduto(
                                produto.id,
                                produto.nome
                              )
                            }
                          >
                            Reativar
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </section>
  )
}

export default Produtos