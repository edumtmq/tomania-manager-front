import { useEffect, useState } from 'react'
import { Link } from 'react-router'

function MovimentacoesRecentes() {
  const [movimentacoes, setMovimentacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function carregarMovimentacoes() {
      try {
        setErro('')

        const resposta = await fetch(
          'http://localhost:8080/dashboard/movimentacoes-recentes'
        )

        if (!resposta.ok) {
          throw new Error(
            'Não foi possível carregar as movimentações recentes'
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

  function formatarData(data) {
    if (!data) {
      return '—'
    }

    return new Date(data).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  }

  const movimentacoesOrdenadas = [...movimentacoes]
    .sort(
      (movimentacaoA, movimentacaoB) =>
        new Date(movimentacaoB.dataMovimentacao) -
        new Date(movimentacaoA.dataMovimentacao)
    )
    .slice(0, 5)

  return (
    <section className="secao-tabela">
      <div className="cabecalho-secao-dashboard">
        <div>
          <h2>Movimentações recentes</h2>

          <p>
            Últimas entradas e saídas registradas
          </p>
        </div>

        <Link
          to="/movimentacoes"
          className="link-ver-todos"
        >
          Ver histórico completo
        </Link>
      </div>

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
        movimentacoesOrdenadas.length === 0 && (
          <p className="mensagem-vazia">
            Nenhuma movimentação registrada.
          </p>
        )}

      {!carregando &&
        !erro &&
        movimentacoesOrdenadas.length > 0 && (
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
                {movimentacoesOrdenadas.map(
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
                          {rotulosTipo[movimentacao.tipo]}
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
  )
}

export default MovimentacoesRecentes