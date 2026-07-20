import { apiFetch } from './api'

const produtoService = {
  listar() {
    return apiFetch('/produtos')
  },

  listarInativos() {
    return apiFetch('/produtos/inativos')
  },

  cadastrar(produto) {
    return apiFetch('/produtos', {
      method: 'POST',
      body: JSON.stringify(produto),
    })
  },

  atualizar(produtoId, produto) {
    return apiFetch(
      `/produtos/${produtoId}`,
      {
        method: 'PUT',
        body: JSON.stringify(produto),
      }
    )
  },

  inativar(produtoId) {
    return apiFetch(
      `/produtos/${produtoId}`,
      {
        method: 'DELETE',
      }
    )
  },

  reativar(produtoId) {
    return apiFetch(
      `/produtos/${produtoId}/ativar`,
      {
        method: 'PATCH',
      }
    )
  },
}

export default produtoService