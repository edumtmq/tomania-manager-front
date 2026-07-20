const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:8080'

export async function apiFetch(
  caminho,
  opcoes = {}
) {
  const headers = {
    ...opcoes.headers,
  }

  if (opcoes.body) {
    headers['Content-Type'] = 'application/json'
  }

  const resposta = await fetch(
    `${API_URL}${caminho}`,
    {
      ...opcoes,
      headers,
    }
  )

  if (!resposta.ok) {
    let mensagem =
      'Não foi possível realizar a operação'

    try {
      const dadosErro = await resposta.json()

      mensagem =
        dadosErro.mensagem ||
        dadosErro.message ||
        mensagem
    } catch {
      // Mantém a mensagem padrão.
    }

    throw new Error(mensagem)
  }

  if (resposta.status === 204) {
    return null
  }

  const tipoConteudo =
    resposta.headers.get('content-type')

  if (
    tipoConteudo?.includes('application/json')
  ) {
    return resposta.json()
  }

  return null
}

export { API_URL }