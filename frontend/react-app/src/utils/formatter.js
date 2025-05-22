export function formatDate(
    dateInput,
    includeDayPrefix = false,
    includeYear = true
) {
    let year, month, day;

if (typeof dateInput === "string") {
    // Handle datetime strings by splitting at 'T'
    const datePart = dateInput.split("T")[0];
    [year, month, day] = datePart.split("-");
    if (!year || !month || !day) {
        throw new Error(
        "Formato de data inválido. Use yyyy-mm-dd ou yyyy-mm-ddTHH:mm:ss."
        );
    }
} else if (dateInput instanceof Date && !isNaN(dateInput)) {
    year = String(dateInput.getFullYear());
    month = String(dateInput.getMonth() + 1).padStart(2, "0");
    day = String(dateInput.getDate()).padStart(2, "0");
} else {
    throw new Error(
        "Entrada inválida. Use uma string no formato yyyy-mm-dd, yyyy-mm-ddTHH:mm:ss ou um objeto Date."
    );
}

    const date = new Date(`${year}-${month}-${day}`);
    const shortYear = year.slice(2);
    let formattedDate = includeYear
    ? `${day}.${month}.${shortYear}`
    : `${day}.${month}`;

    if (!includeDayPrefix) return formattedDate;

    const daysOfWeek = ["SG", "TE", "QA", "QI", "SX", "SB", "D"];
    const dayOfWeek = date.getDay();
    const prefix = daysOfWeek[dayOfWeek];

    return `${prefix} ${formattedDate}`;
}

// Exemplos:
// console.log(formatDate("2025-05-08"));                 // Saída: 08-05-25
// console.log(formatDate("2025-05-06", true));           // Saída: Q2 08-05-25
