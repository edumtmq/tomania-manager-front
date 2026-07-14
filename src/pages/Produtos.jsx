import { useEffect, useState } from 'react'

function Produtos() {
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const [nome, setNome] = useState('')
  const [estoqueMinimo, setEstoqueMinimo] = useState('')
  
  useEffect(() => {
    async function carregarProdutos() {
      try {
        const resposta = await fetch('http://localhost:8080/produtos')

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

  async function cadastrarProduto(evento) {
  evento.preventDefault()

  try {
    const resposta = await fetch('http://localhost:8080/produtos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome: nome,
        estoqueMinimo: Number(estoqueMinimo),
      }),
    })

    if (!resposta.ok) {
      throw new Error('Não foi possível cadastrar o produto')
    }

    const produtoCriado = await resposta.json()

    setProdutos((produtosAtuais) => [
      ...produtosAtuais,
      produtoCriado,
    ])

    setNome('')
    setEstoqueMinimo('')
    setMostrarFormulario(false)
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

        <button
          type="button"
          className="botao-principal"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          {mostrarFormulario ? 'Cancelar' : '+ Novo produto'}
        </button>
      </div>

      {mostrarFormulario && (
  <form
    className="formulario-produto"
    onSubmit={cadastrarProduto}
  >
    <h2>Cadastrar produto</h2>

    <label>
      Nome
      <input
        type="text"
        value={nome}
        onChange={(evento) => setNome(evento.target.value)}
        required
      />
    </label>

    <label>
      Estoque mínimo
      <input
        type="number"
        min="1"
        value={estoqueMinimo}
        onChange={(evento) => setEstoqueMinimo(evento.target.value)}
        required
      />
    </label>

    <button type="submit" className="botao-principal">
      Salvar produto
    </button>
  </form>
)}

      <section className="secao-tabela">
        <h2>Produtos ativos</h2>

        {carregando && <p>Carregando produtos...</p>}

        {erro && <p className="mensagem-erro">{erro}</p>}

        {!carregando && !erro && (
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </section>
  )
}

export default Produtos