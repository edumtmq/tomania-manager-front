import { useEffect, useState } from 'react'

function TabelaProdutos() {
  const [produtos, setProdutos] = useState([])

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const resposta = await fetch(
          'http://localhost:8080/dashboard/produtos-situacao'
        )

        if (!resposta.ok) {
          throw new Error('Não foi possível carregar os produtos')
        }

        const dados = await resposta.json()
        setProdutos(dados)
      } catch (erro) {
        console.error('Erro ao carregar produtos:', erro)
      }
    }

    carregarProdutos()
  }, [])

  return (
    <section className="secao-tabela">
      <h2>Situação dos produtos</h2>

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
                <span className={`status status-${produto.status.toLowerCase()}`}>
                {produto.status}
                    </span>
                </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default TabelaProdutos