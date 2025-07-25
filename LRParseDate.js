// Specialized function to handle Date(yyyy,m,d) format
function LRParseGoogleDate(dateStr) {
    if (!dateStr) return null;
    
    console.log("Parsing Google date:", dateStr, typeof dateStr);
    
    // Handle "Date(yyyy,m,d)" format specifically
    if (typeof dateStr === "string" && dateStr.indexOf("Date(") !== -1) {
        try {
            const match = dateStr.match(/Date\((\d{4}),\s*(\d{1,2}),\s*(\d{1,2})\)/);
            if (match) {
                const year = parseInt(match[1]);
                const month = parseInt(match[2]); // Already 0-based in Google format
                const day = parseInt(match[3]);
                console.log(`Parsed Date string: year=${year}, month=${month}, day=${day}`);
                return new Date(year, month, day);
            }
        } catch (e) {
            console.error("Error parsing Google Date() string:", e);
        }
    }
    
    return null;
}

// Main date parsing function for Loading & Receipt module
function LRParseDate(dateStr) {
    if (!dateStr) return null;
    
    console.log("Parsing date:", dateStr, typeof dateStr);
    
    // If it's already a Date object from Google Sheets or JavaScript
    if (dateStr instanceof Date && !isNaN(dateStr.getTime())) {
        return dateStr;
    }
    
    // Check if it's a Google Sheets Date format string
    const googleDate = LRParseGoogleDate(dateStr);
    if (googleDate) {
        return googleDate;
    }
    
    // For standard dd/mm/yyyy format
    if (typeof dateStr === "string" && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
        const [d, m, y] = dateStr.split('/').map(Number);
        return new Date(y, m - 1, d);
    }
    
    // Try JavaScript's built-in date parsing as a last resort
    try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            return date;
        }
    } catch (e) {
        console.error("Error using standard date parsing:", e);
    }
    
    console.log("Failed to parse date:", dateStr);
    return null;
}

// Format a date to dd/mm/yyyy string
function LRFormatDate(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return "Invalid Date";
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}
