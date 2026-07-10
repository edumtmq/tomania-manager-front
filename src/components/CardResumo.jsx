function CardResumo({titulo, valor}){

    return(
        <div className="card-resumo">
            <p>{titulo}</p>
            <strong>{valor}</strong>
        </div>
    )
}

export default CardResumo