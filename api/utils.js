export function excelDateToYYYYMMDD(excelSerialDate) {
    if (typeof excelSerialDate !== 'number') {
        return excelSerialDate;
    }
    const date = new Date(Date.UTC(1900, 0, 1));
    date.setDate(date.getDate() + excelSerialDate - 2); 
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

// Lista de valores dinâmicos para dropdowns
export const dynamicLists = {
    pets: Array.from({ length: 15 }, (_, i) => i + 1),
    weeks: Array.from({ length: 5 }, (_, i) => i + 1),
    months: Array.from({ length: 12 }, (_, i) => i + 1),
    years: Array.from({ length: 17 }, (_, i) => 2024 + i),
    sources: [
        "Facebook", "Kommo", "Social Traffic", "SMS", "Call", "Friends", 
        "Family Member", "Neighbors", "Reminder", "Email", "Google", 
        "Website", "Grooming / Referral P", "Instagram", "Technician", "WhatsApp", "Other"
    ]
};
