//  Aqui serão funções independentes para tratamento de dados. Como deixar a data bem formatada, ou arrumar um valor monetário.

export function formatDate(dateStr) {
    // Verifica se a data está no formato esperado
    const [year, month, day] = dateStr.split("-");
    
    if (!year || !month || !day) {
        throw new Error("Formato de data inválido. Use yyyy-mm-dd.");
    }

    const shortYear = year.slice(2); // Pega apenas os dois últimos dígitos do ano
    return `${day}-${month}-${shortYear}`;
}


console.log(formatDate("2025-05-08")); // Saída: 08-05-25
