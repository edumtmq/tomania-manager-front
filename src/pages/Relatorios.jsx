import { useEffect, useState } from 'react'

function Relatorios() {
  const [relatorios, setRelatorios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [dias, setDias] = useState('7')

  useEffect(() => {
    carregarRelatorio(7)
  }, [])

  async function carregarRelatorio(periodo) {
    try {
      setErro('')
      setCarregando(true)

      const resposta = await fetch(
        `http://localhost:8080/relatorios/produtos-movimentacao?dias=${periodo}`
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
        }

        throw new Error(mensagemErro)
      }

      const dados = await resposta.json()
      setRelatorios(dados)
    } catch (erro) {
      setErro(erro.message)
    } finally {
      setCarregando(false)
    }
  }

  function aplicarPeriodo(evento) {
    evento.preventDefault()
    carregarRelatorio(Number(dias))
  }

  function formatarNumero(valor) {
    return Number(valor || 0)
      .toFixed(2)
      .replace('.', ',')
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

      <form
        className="formulario-relatorio"
        onSubmit={aplicarPeriodo}
      >
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
        <h2>
          Movimentações por produto — {dias} dias
        </h2>

        {carregando && (
          <p>Carregando relatório...</p>
        )}

        {!carregando &&
          !erro &&
          relatorios.length === 0 && (
            <p className="mensagem-vazia">
              Nenhuma informação encontrada para o
              período.
            </p>
          )}

        {!carregando &&
          !erro &&
          relatorios.length > 0 && (
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
                  {relatorios.map((relatorio) => (
                    <tr key={relatorio.produtoId}>
                      <td>
                        {relatorio.produtoNome}
                      </td>

                      <td>
                        {relatorio.estoqueAtual}
                      </td>

                      <td>
                        {relatorio.totalEntradas}
                      </td>

                      <td>
                        {relatorio.totalSaidas}
                      </td>

                      <td>
                        {relatorio.saidaProducao}
                      </td>

                      <td>
                        {relatorio.saidaPerda}
                      </td>

                      <td>
                        {relatorio.saidaValidade}
                      </td>

                      <td>
                        {formatarNumero(
                          relatorio.consumoMedioDiario
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </section>
    </section>
  )
}

export default Relatorios