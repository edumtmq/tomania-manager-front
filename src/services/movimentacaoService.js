import { apiFetch } from './api'

const movimentacaoService = {
  listar() {
    return apiFetch('/movimentacoes')
  },

  registrar(movimentacao) {
    return apiFetch('/movimentacoes', {
      method: 'POST',
      body: JSON.stringify(movimentacao),
    })
  },

  registrarEntradaLote(itens) {
    return apiFetch(
      '/movimentacoes/entrada-lote',
      {
        method: 'POST',
        body: JSON.stringify(itens),
      }
    )
  },

  filtrar(filtros) {
    const parametros = new URLSearchParams()

    if (filtros.produtoId) {
      parametros.append(
        'produtoId',
        filtros.produtoId
      )
    }

    if (filtros.tipo) {
      parametros.append('tipo', filtros.tipo)
    }

    if (filtros.inicio) {
      parametros.append('inicio', filtros.inicio)
    }

    if (filtros.fim) {
      parametros.append('fim', filtros.fim)
    }

    return apiFetch(
      `/movimentacoes/filtro?${parametros.toString()}`
    )
  },
}

export default movimentacaoService 