// Analyze Dashboard-Config sheet structure
import fetch from 'node-fetch';

const SHEET_ID = '1cFngrabiTY-RMGDrw2eRn7Nn8LEY0IZyD0-QJT7UqTI';
const CONFIG_SHEET_NAME = 'Dashboard-Config';
const CONFIG_SHEET_URL = `https://docs.google.com/spreadsheets/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(CONFIG_SHEET_NAME)}`;

async function analyzeConfigSheet() {
    try {
        console.log("=== DASHBOARD-CONFIG SHEET ANALYSIS ===");
        console.log("Fetching sheet:", CONFIG_SHEET_NAME);
        
        const res = await fetch(CONFIG_SHEET_URL);
        const text = await res.text();
        
        console.log("Raw response length:", text.length);
        console.log("First 200 characters:", text.substring(0, 200));
        console.log("Contains 'table':", text.includes("table"));
        console.log("Contains 'error':", text.includes("error"));
        
        if (!text.includes("table")) {
            console.log("Full response:", text);
            throw new Error("Invalid response from Dashboard-Config sheet");
        }
        
        const json = JSON.parse(text.substr(47).slice(0, -2));
        const rows = json.table.rows;
        
        console.log(`Total rows found: ${rows.length}`);
        console.log("");
        
        // Analyze each row showing all cell values
        for (let i = 0; i < Math.min(50, rows.length); i++) {
            const row = rows[i];
            if (row && row.c) {
                const cellValues = [];
                
                // Show up to 10 columns (A-J)
                for (let j = 0; j < Math.min(10, row.c.length); j++) {
                    const cell = row.c[j];
                    const cellValue = cell ? cell.v : null;
                    const columnLetter = String.fromCharCode(65 + j);
                    cellValues.push(`${columnLetter}: "${cellValue}"`);
                }
                
                console.log(`Row ${i + 1}: [${cellValues.join(' | ')}]`);
            } else {
                console.log(`Row ${i + 1}: [EMPTY ROW]`);
            }
        }
        
        console.log("");
        console.log("=== COLUMN MAPPING EXPLANATION ===");
        console.log("IMPORTANT: In your Google Sheet structure:");
        console.log("- Column A = Date");
        console.log("- Column B = Config Column 1 (data array index 0)");
        console.log("- Column C = Config Column 2 (data array index 1)");
        console.log("- Column D = Config Column 3 (data array index 2)");
        console.log("- etc...");
        console.log("");
        console.log("So when config says 'Column 1-18' for rakes loaded, it means:");
        console.log("- Google Sheet Columns B-S (data array indexes 0-17)");
        console.log("- Config Column 36 = Google Sheet Column AJ (data array index 35)");
        console.log("- Config Column 37 = Google Sheet Column AK (data array index 36)");
        console.log("");
        
        console.log("=== SECTION IDENTIFICATION ===");
        
        // Identify key sections
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (row && row.c && row.c[0] && row.c[0].v) {
                const cellValue = row.c[0].v.toString().toLowerCase().trim();
                
                if (cellValue.includes('plant mapping') || 
                    cellValue.includes('coal compan') || 
                    cellValue.includes('table 1') || 
                    cellValue.includes('table 2') || 
                    cellValue.includes('table 3')) {
                    console.log(`*** SECTION FOUND at Row ${i + 1}: "${row.c[0].v}" ***`);
                }
            }
        }
        
    } catch (error) {
        console.error("Error analyzing config sheet:", error.message);
    }
}

analyzeConfigSheet();
