export function formatDate(dateStr, includeDayPrefix = false, includeYear = true) {
    const [year, month, day] = dateStr.split("-");

    if (!year || !month || !day) {
        throw new Error("Formato de data inválido. Use yyyy-mm-dd.");
    }

    const date = new Date(`${year}-${month}-${day}`);
    const shortYear = year.slice(2);
    let formattedDate = ''
    if (includeYear){
        formattedDate = `${day}.${month}.${shortYear}`;
    } else {
        formattedDate = `${day}.${month}`;
    }

    if (!includeDayPrefix) return formattedDate;

    const daysOfWeek = ['SG', 'TE', 'QA', 'QI', 'SX', 'SB', 'D'];
    const dayOfWeek = date.getDay(); // 0 (domingo) a 6 (sábado)
    const prefix = daysOfWeek[dayOfWeek];

    return `${prefix} ${formattedDate}`;
}

// Exemplos:
//console.log(formatDate("2025-05-08"));                 // Saída: 08-05-25
//console.log(formatDate("2025-05-06", true));           // Saída: Q2 08-05-25
