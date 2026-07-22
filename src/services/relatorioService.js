import { apiFetch } from './api'

const relatorioService = {
  buscarMovimentacoesPorProduto({
    dias,
    produtoId,
  }) {
    const parametros = new URLSearchParams()

    parametros.append('dias', dias)

    if (produtoId) {
      parametros.append(
        'produtoId',
        produtoId
      )
    }

    return apiFetch(
      `/relatorios/produtos-movimentacao?${parametros.toString()}`
    )
  },
}

export default relatorioService