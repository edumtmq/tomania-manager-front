import { apiFetch } from './api'

const dashboardService = {
  buscarResumo() {
    return apiFetch('/dashboard/resumo')
  },

  buscarProdutosSituacao() {
    return apiFetch(
      '/dashboard/produtos-situacao'
    )
  },

  buscarMovimentacoesRecentes() {
    return apiFetch(
      '/dashboard/movimentacoes-recentes'
    )
  },

  buscarSugestaoCompras() {
    return apiFetch(
      '/dashboard/sugestao-compras'
    )
  },
}

export default dashboardService