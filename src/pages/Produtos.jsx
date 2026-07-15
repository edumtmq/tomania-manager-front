import { useEffect, useState } from 'react'

function Produtos() {
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [nome, setNome] = useState('')
  const [estoqueMinimo, setEstoqueMinimo] = useState('')
  const [produtoEditandoId, setProdutoEditandoId] = useState(null)

  const [mostrarInativos, setMostrarInativos] = useState(false)
  const [produtosInativos, setProdutosInativos] = useState([])

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const resposta = await fetch(
          'http://localhost:8080/produtos'
        )

        if (!resposta.ok) {
          throw new Error('Não foi possível carregar os produtos')
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

  async function salvarProduto(evento) {
    evento.preventDefault()

    const estaEditando = produtoEditandoId !== null

    const url = estaEditando
      ? `http://localhost:8080/produtos/${produtoEditandoId}`
      : 'http://localhost:8080/produtos'

    const metodo = estaEditando ? 'PUT' : 'POST'

    try {
      setErro('')

      const resposta = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: nome,
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

      limparFormulario()
    } catch (erro) {
      setErro(erro.message)
    }
  }

  async function inativarProduto(produtoId, produtoNome) {
    const confirmou = window.confirm(
      `Deseja realmente inativar o produto ${produtoNome}?`
    )

    if (!confirmou) {
      return
    }

    try {
      setErro('')

      const resposta = await fetch(
        `http://localhost:8080/produtos/${produtoId}`,
        {
          method: 'DELETE',
        }
      )

      if (!resposta.ok) {
        throw new Error('Não foi possível inativar o produto')
      }

      setProdutos((produtosAtuais) =>
        produtosAtuais.filter(
          (produto) => produto.id !== produtoId
        )
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

async function reativarProduto(produtoId, produtoNome) {
  const confirmou = window.confirm(
    `Deseja realmente reativar o produto ${produtoNome}?`
  )

  if (!confirmou) {
    return
  }

  try {
    setErro('')

    const resposta = await fetch(
      `http://localhost:8080/produtos/${produtoId}/ativar`,
      {
        method: 'PATCH',
      }
    )

    if (!resposta.ok) {
      throw new Error('Não foi possível reativar o produto')
    }

    const produtoReativado = await resposta.json()

    setProdutosInativos((produtosAtuais) =>
      produtosAtuais.filter(
        (produto) => produto.id !== produtoId
      )
    )

    setProdutos((produtosAtuais) => [
      ...produtosAtuais,
      produtoReativado,
    ])
  } catch (erro) {
    setErro(erro.message)
  }
}

  return (
    <section className="conteudo">
      <div className="cabecalho-pagina">
        <div>
          <h1>Produtos</h1>
          <p>Gerenciamento dos produtos do estoque</p>
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
              }
            }}
          >
            {mostrarFormulario
              ? 'Cancelar'
              : '+ Novo produto'}
          </button>
        </div>
      </div>

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

          <label>
            Nome
            <input
              type="text"
              value={nome}
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
              onChange={(evento) =>
                setEstoqueMinimo(evento.target.value)
              }
              required
            />
          </label>

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

      <section className="secao-tabela">
        <h2>Produtos ativos</h2>

        {carregando && <p>Carregando produtos...</p>}

        {erro && (
          <p className="mensagem-erro">{erro}</p>
        )}

        {!carregando && !erro && (
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
              {produtos.map((produto) => (
                <tr key={produto.id}>
                  <td>{produto.nome}</td>
                  <td>{produto.estoqueAtual}</td>
                  <td>{produto.estoqueMinimo}</td>

                  <td>
                    <span
                      className={`status status-${produto.status.toLowerCase()}`}
                    >
                      {produto.status}
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
              ))}
            </tbody>
          </table>
        )}
      </section>

      {mostrarInativos && (
        <section className="secao-tabela">
          <h2>Produtos inativos</h2>

          {produtosInativos.length === 0 ? (
            <p className="mensagem-vazia">
              Nenhum produto inativo encontrado.
            </p>
          ) : (
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
                {produtosInativos.map((produto) => (
                  <tr key={produto.id}>
                    <td>{produto.nome}</td>
                    <td>{produto.estoqueAtual}</td>
                    <td>{produto.estoqueMinimo}</td>

                    <td>
                      <button
                        type="button"
                        className="botao-reativar"
                        onClick={() => 
                          reativarProduto(produto.id, produto.nome)
                        }
                      >
                        Reativar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </section>
  )
}

export default Produtos