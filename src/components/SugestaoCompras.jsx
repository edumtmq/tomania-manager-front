import { useEffect, useState } from 'react'

function SugestaoCompras() {
  const [produtos, setProdutos] = useState([])

  useEffect(() => {
    async function carregarSugestaoCompras() {
      try {
        const resposta = await fetch(
          'http://localhost:8080/dashboard/sugestao-compras'
        )

        if (!resposta.ok) {
          throw new Error('Não foi possível carregar as sugestões de compra')
        }

        const dados = await resposta.json()
        setProdutos(dados)
      } catch (erro) {
        console.error('Erro ao carregar sugestões de compra:', erro)
      }
    }

    carregarSugestaoCompras()
  }, [])

  return (
    <section className="secao-tabela">
      <h2>Sugestão de compras</h2>

      {produtos.length === 0 ? (
        <p className="mensagem-vazia">
          Nenhum produto precisa ser comprado no momento.
        </p>
      ) : (
        <table className="tabela-produtos">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Estoque atual</th>
              <th>Estoque mínimo</th>
              <th>Quantidade faltante</th>
            </tr>
          </thead>

          <tbody>
            {produtos.map((produto) => (
              <tr key={produto.id}>
                <td>{produto.nome}</td>
                <td>{produto.estoqueAtual}</td>
                <td>{produto.estoqueMinimo}</td>
                <td>{produto.estoqueMinimo - produto.estoqueAtual}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

export default SugestaoCompras