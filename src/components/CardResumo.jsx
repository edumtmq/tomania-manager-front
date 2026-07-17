function CardResumo({
  titulo,
  valor,
  tipo = 'total',
  icone,
}) {
  return (
    <div className={`card-resumo card-${tipo}`}>
      <div className="card-resumo-topo">
        <p>{titulo}</p>

        <span
          className="card-resumo-icone"
          aria-hidden="true"
        >
          {icone}
        </span>
      </div>

      <strong>{valor}</strong>
    </div>
  )
}

export default CardResumo