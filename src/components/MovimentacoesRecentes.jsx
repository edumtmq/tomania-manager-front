import { useEffect, useState } from 'react'

function MovimentacoesRecentes() {
  const [movimentacoes, setMovimentacoes] = useState([])

  useEffect(() => {
    async function carregarMovimentacoes() {
      try {
        const resposta = await fetch(
          'http://localhost:8080/dashboard/movimentacoes-recentes'
        )

        if (!resposta.ok) {
          throw new Error('Não foi possível carregar as movimentações')
        }

        const dados = await resposta.json()
        setMovimentacoes(dados)
      } catch (erro) {
        console.error('Erro ao carregar movimentações:', erro)
      }
    }

    carregarMovimentacoes()
  }, [])

  return (
    <section className="secao-tabela">
      <h2>Movimentações recentes</h2>

      <table className="tabela-produtos">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Tipo</th>
            <th>Motivo</th>
            <th>Quantidade</th>
            <th>Responsável</th>
          </tr>
        </thead>

        <tbody>
          {movimentacoes.map((movimentacao) => (
            <tr key={movimentacao.id}>
              <td>{movimentacao.produtoNome}</td>
              <td>{movimentacao.tipo}</td>
              <td>{movimentacao.motivo}</td>
              <td>{movimentacao.quantidade}</td>
              <td>{movimentacao.responsavel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default MovimentacoesRecentes