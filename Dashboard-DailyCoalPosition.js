// Dashboard for Daily Coal Position
// Fully Dynamic Configuration System - reads everything from Dashboard-Config sheet
let plantMappings = {};
let coalCompanies = [];
let plantOrder = [];
let columnStructure = [];
let dashboardData = {};

// Enhanced mapping structures for precise data extraction
let columnMappings = {
    table1: {},  // Rakes Loaded: {index: {plantCode, plantName, company}}
    table2: {},  // Rakes Received/Pipeline: {index: {plantCode, plantName, dataType}}
    table3: {}   // Coal Stock: {index: {plantCode, plantName, dataType}}
};

// Fetch configuration from Dashboard-Config sheet with completely dynamic parsing
async function fetchDashboardConfig() {
    console.log("=== FETCHING DYNAMIC DASHBOARD CONFIGURATION ===");
    
    const SHEET_ID = '1cFngrabiTY-RMGDrw2eRn7Nn8LEY0IZyD0-QJT7UqTI';
    const CONFIG_SHEET_NAME = 'Dashboard-Config';
    const CONFIG_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(CONFIG_SHEET_NAME)}`;
    
    try {
        const res = await fetch(CONFIG_SHEET_URL);
        const text = await res.text();
        
        if (!text.includes("table")) {
            throw new Error("Invalid response from Dashboard-Config sheet");
        }
        
        const json = JSON.parse(text.substr(47).slice(0, -2));
        const rows = json.table.rows;
        
        console.log(`Config sheet loaded with ${rows.length} rows`);
        
        // Debug: Show first 10 rows to understand the sheet structure
        console.log("=== SHEET STRUCTURE DEBUG ===");
        for (let i = 0; i < Math.min(10, rows.length); i++) {
            const row = rows[i];
            if (row && row.c) {
                const rowData = row.c.map(cell => cell ? cell.v : null);
                console.log(`Row ${i + 1}:`, rowData);
            }
        }
        
        // Helper function to get cell value safely
        const getCellValue = (row, colIndex) => {
            return (row && row.c && row.c[colIndex] && row.c[colIndex].v) ? row.c[colIndex].v : null;
        };
        
        // Helper function to normalize text for comparison
        const normalizeText = (text) => {
            return text ? text.toString().trim().toLowerCase() : '';
        };
        
        // Helper function to check if row is empty
        const isEmptyRow = (row) => {
            if (!row || !row.c) return true;
            return row.c.every(cell => !cell || !cell.v || cell.v.toString().trim() === '');
        };
        
        // Reset all configuration variables
        plantMappings = {};
        coalCompanies = [];
        columnStructure = [];
        
        let currentRowIndex = 0;
        
        // Parse Plant Mappings Section
        console.log("=== PARSING PLANT MAPPINGS ===");
        while (currentRowIndex < rows.length) {
            const row = rows[currentRowIndex];
            const cellValue = getCellValue(row, 0);
            const normalizedValue = normalizeText(cellValue);
            
            console.log(`Row ${currentRowIndex + 1}, Cell A: "${cellValue}" (normalized: "${normalizedValue}")`);
            
            if (normalizedValue === 'plant mappings') {
                console.log(`Found Plant Mappings header at row ${currentRowIndex + 1}`);
                currentRowIndex++; // Skip header row
                
                // Skip column headers (Plant Code, Plant Name)
                if (currentRowIndex < rows.length) {
                    const headerRow = rows[currentRowIndex];
                    const header1 = normalizeText(getCellValue(headerRow, 0));
                    const header2 = normalizeText(getCellValue(headerRow, 1));
                    console.log(`Checking headers: "${header1}", "${header2}"`);
                    
                    if (header1 === "plant code" || header1.includes("plant")) {
                        console.log("Skipping header row");
                        currentRowIndex++;
                    }
                }
                
                // Read plant mappings until empty row
                while (currentRowIndex < rows.length && !isEmptyRow(rows[currentRowIndex])) {
                    const plantCode = getCellValue(rows[currentRowIndex], 0);
                    const plantName = getCellValue(rows[currentRowIndex], 1);
                    
                    console.log(`Row ${currentRowIndex + 1}: PlantCode="${plantCode}", PlantName="${plantName}"`);
                    
                    if (plantCode && plantName) {
                        plantMappings[plantCode] = plantName;
                        console.log(`Added plant mapping: ${plantCode} → ${plantName}`);
                    }
                    currentRowIndex++;
                }
                break;
            }
            currentRowIndex++;
        }
        
        // Parse Coal Companies Section
        console.log("=== PARSING COAL COMPANIES ===");
        while (currentRowIndex < rows.length) {
            const row = rows[currentRowIndex];
            const cellValue = getCellValue(row, 0);
            const normalizedValue = normalizeText(cellValue);
            
            console.log(`Row ${currentRowIndex + 1}, Cell A: "${cellValue}" (normalized: "${normalizedValue}")`);
            
            if (normalizedValue === "coal companies") {
                console.log(`Found Coal Companies header at row ${currentRowIndex + 1}`);
                currentRowIndex++; // Skip header row
                
                // Skip column headers (Company Name)
                if (currentRowIndex < rows.length) {
                    const headerValue = normalizeText(getCellValue(rows[currentRowIndex], 0));
                    console.log(`Checking header: "${headerValue}"`);
                    
                    if (headerValue === "company name" || headerValue.includes("company")) {
                        console.log("Skipping header row");
                        currentRowIndex++;
                    }
                }
                
                // Read coal companies until empty row
                while (currentRowIndex < rows.length && !isEmptyRow(rows[currentRowIndex])) {
                    const company = getCellValue(rows[currentRowIndex], 0);
                    
                    console.log(`Row ${currentRowIndex + 1}: Company="${company}"`);
                    
                    if (company && company.toString().trim() !== '') {
                        coalCompanies.push(company);
                        console.log(`Added coal company: ${company}`);
                    }
                    currentRowIndex++;
                }
                break;
            }
            currentRowIndex++;
        }
        
        // Parse Table 1 - Rakes Loaded
        console.log("=== PARSING TABLE 1 - RAKES LOADED ===");
        while (currentRowIndex < rows.length) {
            const row = rows[currentRowIndex];
            const cellValue = getCellValue(row, 0);
            const normalizedValue = normalizeText(cellValue);
            
            console.log(`Row ${currentRowIndex + 1}, Cell A: "${cellValue}" (normalized: "${normalizedValue}")`);
            
            if (normalizedValue.includes("table 1") && normalizedValue.includes("rakes loaded")) {
                console.log(`Found Table 1 header at row ${currentRowIndex + 1}`);
                currentRowIndex++; // Skip header row
                
                // Skip column headers
                if (currentRowIndex < rows.length) {
                    const headerValue = normalizeText(getCellValue(rows[currentRowIndex], 0));
                    console.log(`Checking header: "${headerValue}"`);
                    
                    if (headerValue === "column index" || headerValue.includes("column")) {
                        console.log("Skipping header row");
                        currentRowIndex++;
                    }
                }
                
                // Define plant code pattern for regular columns (1-18)
                const plantCodes = ['R', 'L', 'G']; // Pattern repeats every 3 columns
                
                // Read table 1 columns until empty row
                while (currentRowIndex < rows.length && !isEmptyRow(rows[currentRowIndex])) {
                    const colIndex = getCellValue(rows[currentRowIndex], 0);
                    const dataType = getCellValue(rows[currentRowIndex], 1);
                    const company = getCellValue(rows[currentRowIndex], 2);
                    const explicitPlantCode = getCellValue(rows[currentRowIndex], 3); // Check for explicit plant code
                    
                    console.log(`Row ${currentRowIndex + 1}: ColIndex="${colIndex}", DataType="${dataType}", Company="${company}", PlantCode="${explicitPlantCode}"`);
                    
                    if (colIndex && !isNaN(parseInt(colIndex)) && dataType) {
                        const parsedIndex = parseInt(colIndex);
                        
                        // Handle Table 1 data: columns 1-18 (with companies), and 36-37 (NPL/TSPL without companies)
                        if ((parsedIndex >= 1 && parsedIndex <= 18 && company) || 
                            (parsedIndex >= 36 && parsedIndex <= 37)) {
                            
                            // Use explicit plant code if provided, otherwise calculate from pattern or use company logic
                            let plantCode;
                            if (explicitPlantCode) {
                                plantCode = explicitPlantCode;
                            } else if (parsedIndex >= 36 && parsedIndex <= 37) {
                                // Special handling for NPL/TSPL columns 36, 37
                                plantCode = parsedIndex === 36 ? 'N' : 'T';
                            } else {
                                // Regular pattern for columns 1-18: R, L, G repeating
                                const plantIndex = (parsedIndex - 1) % 3; // 0, 1, 2 for R, L, G
                                plantCode = plantCodes[plantIndex];
                            }
                            
                            const columnDef = {
                                index: parsedIndex,
                                type: dataType,
                                plant: plantCode,
                                table: 1
                            };
                            
                            // Add company only if it exists (not for NPL/TSPL)
                            if (company && company.toString().trim() !== '') {
                                columnDef.company = company;
                            }
                            
                            columnStructure.push(columnDef);
                            console.log(`Added Table 1 column: Index=${colIndex}, Company=${company || 'N/A'}, Plant=${plantCode} ${explicitPlantCode ? '(explicit)' : '(calculated)'}`);
                        }
                    }
                    
                    // Check if we've reached the next section (Table 2 data or Table 3)
                    const nextCellValue = getCellValue(row, 0);
                    if (nextCellValue && !isNaN(parseInt(nextCellValue))) {
                        const nextIndex = parseInt(nextCellValue);
                        // If we hit column indices that belong to Table 2 (19-24, 34-39), stop Table 1 parsing
                        if ((nextIndex >= 19 && nextIndex <= 24) || (nextIndex >= 34 && nextIndex <= 39)) {
                            console.log(`Reached Table 2 data at column ${nextIndex}, stopping Table 1 parsing`);
                            break;
                        }
                    }
                    
                    currentRowIndex++;
                }
                break;
            }
            currentRowIndex++;
        }
        
        // Parse Table 2 - Rakes Received/Pipeline (continues after Table 1 without explicit header)
        console.log("=== PARSING TABLE 2 - RAKES RECEIVED/PIPELINE ===");
        console.log("Table 2 continues directly after Table 1 in your configuration");
        
        // Continue parsing from current position - looking for rows with "Column Index" header or data rows
        let foundTable2Header = false;
        while (currentRowIndex < rows.length) {
            const row = rows[currentRowIndex];
            const cellValue = getCellValue(row, 0);
            const normalizedValue = normalizeText(cellValue);
            
            console.log(`Row ${currentRowIndex + 1}, Cell A: "${cellValue}" (normalized: "${normalizedValue}")`);
            
            // Check if this is a column header row for Table 2
            if (normalizedValue === "column index" && getCellValue(row, 1) && normalizeText(getCellValue(row, 1)) === "data type") {
                console.log(`Found Table 2 column headers at row ${currentRowIndex + 1}`);
                foundTable2Header = true;
                currentRowIndex++; // Skip header row
                continue;
            }
            
            // Check if we found data rows (numeric column index)
            const colIndex = getCellValue(row, 0);
            const dataType = getCellValue(row, 1);
            const plantCode = getCellValue(row, 2);
            
            if (colIndex && !isNaN(parseInt(colIndex)) && dataType && plantCode) {
                // This looks like Table 2 data
                const parsedIndex = parseInt(colIndex);
                
                // Table 2 data based on your config: columns 19-24, 34-35, 38-39
                if ((parsedIndex >= 19 && parsedIndex <= 24) || 
                    (parsedIndex >= 34 && parsedIndex <= 35) || 
                    (parsedIndex >= 38 && parsedIndex <= 39)) {
                    
                    columnStructure.push({
                        index: parsedIndex,
                        type: dataType,
                        plant: plantCode,
                        table: 2
                    });
                    console.log(`Added Table 2 column: Index=${colIndex}, Type=${dataType}, Plant=${plantCode}`);
                }
            }
            
            // Check if we've reached Table 3
            if (normalizedValue.includes("table 3") && normalizedValue.includes("coal stock")) {
                console.log(`Reached Table 3 at row ${currentRowIndex + 1}, stopping Table 2 parsing`);
                break;
            }
            
            currentRowIndex++;
        }
        
        // Parse Table 3 - Coal Stock
        console.log("=== PARSING TABLE 3 - COAL STOCK ===");
        while (currentRowIndex < rows.length) {
            const row = rows[currentRowIndex];
            const cellValue = getCellValue(row, 0);
            const normalizedValue = normalizeText(cellValue);
            
            if (normalizedValue.includes("table 3") && normalizedValue.includes("coal stock")) {
                console.log(`Found Table 3 header at row ${currentRowIndex + 1}`);
                currentRowIndex++; // Skip header row
                
                // Skip column headers if present
                if (currentRowIndex < rows.length) {
                    const headerValue = normalizeText(getCellValue(rows[currentRowIndex], 0));
                    if (headerValue === "column index" || headerValue.includes("column")) {
                        console.log("Skipping Table 3 header row");
                        currentRowIndex++;
                    }
                }
                
                // Read table 3 columns until empty row or end of sheet
                while (currentRowIndex < rows.length && !isEmptyRow(rows[currentRowIndex])) {
                    const colIndex = getCellValue(rows[currentRowIndex], 0);
                    const dataType = getCellValue(rows[currentRowIndex], 1);
                    const plantCode = getCellValue(rows[currentRowIndex], 2);
                    
                    console.log(`Row ${currentRowIndex + 1}: ColIndex="${colIndex}", DataType="${dataType}", PlantCode="${plantCode}"`);
                    
                    if (colIndex && !isNaN(parseInt(colIndex)) && dataType && plantCode) {
                        const parsedIndex = parseInt(colIndex);
                        
                        // Table 3 data based on your config: columns 25-33, 40-45
                        if ((parsedIndex >= 25 && parsedIndex <= 33) || 
                            (parsedIndex >= 40 && parsedIndex <= 45)) {
                            
                            columnStructure.push({
                                index: parsedIndex,
                                type: dataType,
                                plant: plantCode,
                                table: 3
                            });
                            console.log(`Added Table 3 column: Index=${colIndex}, Type=${dataType}, Plant=${plantCode}`);
                        }
                    }
                    currentRowIndex++;
                }
                break;
            }
            currentRowIndex++;
        }
        
        // Set plant order from plant mappings - EXPLICIT ORDER
        // Ensure the plant order matches exactly what you expect in the table
        plantOrder = ['GGSSTP', 'GHTP', 'GATP', 'NPL', 'TSPL']; // Fixed explicit order
        
        console.log("=== EXPLICIT PLANT ORDER SET ===");
        console.log("Plant order:", plantOrder);
        console.log("Plant mappings:", plantMappings);
        
        // Verify all plants in order exist in mappings
        plantOrder.forEach((plantName, index) => {
            const plantCode = Object.keys(plantMappings).find(code => plantMappings[code] === plantName);
            console.log(`Position ${index}: ${plantName} (code: ${plantCode || 'NOT FOUND'})`);
        });
        
        // Build enhanced column mappings for precise data extraction
        console.log("=== BUILDING ENHANCED COLUMN MAPPINGS ===");
        columnMappings = {
            table1: {},  // Rakes Loaded
            table2: {},  // Rakes Received/Pipeline
            table3: {}   // Coal Stock
        };
        
        columnStructure.forEach(colDef => {
            const plantName = plantMappings[colDef.plant];
            if (!plantName) {
                console.warn(`No plant mapping found for plant code: ${colDef.plant}`);
                return;
            }
            
            const mappingData = {
                plantCode: colDef.plant,
                plantName: plantName,
                dataType: colDef.type
            };
            
            if (colDef.table === 1) {
                // Table 1 - Rakes Loaded (includes company for regular entries, no company for NPL/TSPL totals)
                if (colDef.company) {
                    mappingData.company = colDef.company;
                    console.log(`Table 1 Mapping - Column ${colDef.index}: ${colDef.company} → ${plantName} (${colDef.plant})`);
                } else {
                    console.log(`Table 1 Mapping - Column ${colDef.index}: Total Rakes → ${plantName} (${colDef.plant})`);
                }
                columnMappings.table1[colDef.index] = mappingData;
            } else if (colDef.table === 2) {
                // Table 2 - Rakes Received/Pipeline
                columnMappings.table2[colDef.index] = mappingData;
                console.log(`Table 2 Mapping - Column ${colDef.index}: ${colDef.type} → ${plantName} (${colDef.plant})`);
            } else if (colDef.table === 3) {
                // Table 3 - Coal Stock
                columnMappings.table3[colDef.index] = mappingData;
                console.log(`Table 3 Mapping - Column ${colDef.index}: ${colDef.type} → ${plantName} (${colDef.plant})`);
            }
        });
        
        console.log("=== COLUMN MAPPINGS BUILT SUCCESSFULLY ===");
        console.log("Table 1 (Rakes Loaded) mappings:", Object.keys(columnMappings.table1).length);
        console.log("Table 2 (Rakes Received/Pipeline) mappings:", Object.keys(columnMappings.table2).length);
        console.log("Table 3 (Coal Stock) mappings:", Object.keys(columnMappings.table3).length);
        
        // Log final configuration summary
        console.log("=== CONFIGURATION LOADED SUCCESSFULLY ===");
        console.log(`Plant mappings: ${Object.keys(plantMappings).length} plants`);
        console.log(`Coal companies: ${coalCompanies.length} companies`);
        console.log(`Column structure: ${columnStructure.length} columns`);
        console.log("Plant mappings:", plantMappings);
        console.log("Coal companies:", coalCompanies);
        console.log("Plant order:", plantOrder);
        
        // Validate configuration
        if (Object.keys(plantMappings).length === 0) {
            throw new Error("No plant mappings found");
        }
        if (coalCompanies.length === 0) {
            throw new Error("No coal companies found");
        }
        if (columnStructure.length === 0) {
            throw new Error("No column structure found");
        }
        
        return true;
        
    } catch (error) {
        console.error("Error fetching dashboard configuration:", error);
        
        // Use fallback configuration only if loading fails
        console.log("=== USING FALLBACK CONFIGURATION ===");
        plantMappings = {
            'R': 'GGSSTP',
            'L': 'GHTP',
            'G': 'GATP',
            'N': 'NPL',
            'T': 'TSPL'
        };
        coalCompanies = ['CCL', 'BCCL', 'SECL', 'MDCWL', 'RCR', 'PCCM'];
        plantOrder = ['GGSSTP', 'GHTP', 'GATP', 'NPL', 'TSPL']; // Explicit order - must match table columns
        
        console.log("=== FALLBACK PLANT ORDER SET ===");
        console.log("Fallback plant order:", plantOrder);
        
        // Fallback column structure - EXACT match to user's configuration
        columnStructure = [
            // Table 1 - Rakes Loaded (exact configuration from user)
            {index: 1, type: 'Rakes Loaded', company: 'CCL', plant: 'R', table: 1},
            {index: 2, type: 'Rakes Loaded', company: 'CCL', plant: 'L', table: 1},
            {index: 3, type: 'Rakes Loaded', company: 'CCL', plant: 'G', table: 1},
            {index: 4, type: 'Rakes Loaded', company: 'BCCL', plant: 'R', table: 1},
            {index: 5, type: 'Rakes Loaded', company: 'BCCL', plant: 'L', table: 1},
            {index: 6, type: 'Rakes Loaded', company: 'BCCL', plant: 'G', table: 1},
            {index: 7, type: 'Rakes Loaded', company: 'SECL', plant: 'R', table: 1},
            {index: 8, type: 'Rakes Loaded', company: 'SECL', plant: 'L', table: 1},
            {index: 9, type: 'Rakes Loaded', company: 'SECL', plant: 'G', table: 1},
            {index: 10, type: 'Rakes Loaded', company: 'MDCWL', plant: 'R', table: 1},
            {index: 11, type: 'Rakes Loaded', company: 'MDCWL', plant: 'L', table: 1},
            {index: 12, type: 'Rakes Loaded', company: 'MDCWL', plant: 'G', table: 1},
            {index: 13, type: 'Rakes Loaded', company: 'RCR', plant: 'R', table: 1},
            {index: 14, type: 'Rakes Loaded', company: 'RCR', plant: 'L', table: 1},
            {index: 15, type: 'Rakes Loaded', company: 'RCR', plant: 'G', table: 1},
            {index: 16, type: 'Rakes Loaded', company: 'PCCM', plant: 'R', table: 1},
            {index: 17, type: 'Rakes Loaded', company: 'PCCM', plant: 'L', table: 1},
            {index: 18, type: 'Rakes Loaded', company: 'PCCM', plant: 'G', table: 1},
            // NPL and TSPL total rakes loaded (no company breakdown)
            {index: 36, type: 'Rakes Loaded', plant: 'N', table: 1},
            {index: 37, type: 'Rakes Loaded', plant: 'T', table: 1},
            
            // Table 2 - Rakes Received/Pipeline (exact configuration from user)
            {index: 22, type: 'Rakes Received', plant: 'R', table: 2},
            {index: 23, type: 'Rakes Received', plant: 'L', table: 2},
            {index: 24, type: 'Rakes Received', plant: 'G', table: 2},
            {index: 34, type: 'Rakes Received', plant: 'N', table: 2},
            {index: 35, type: 'Rakes Received', plant: 'T', table: 2},
            {index: 19, type: 'Pipeline', plant: 'R', table: 2},
            {index: 20, type: 'Pipeline', plant: 'L', table: 2},
            {index: 21, type: 'Pipeline', plant: 'G', table: 2},
            {index: 38, type: 'Pipeline', plant: 'N', table: 2},
            {index: 39, type: 'Pipeline', plant: 'T', table: 2},
            
            // Table 3 - Coal Stock (exact configuration from user)
            {index: 25, type: 'Coal Stock (MT)', plant: 'R', table: 3},
            {index: 26, type: 'Coal Stock (MT)', plant: 'L', table: 3},
            {index: 27, type: 'Coal Stock (MT)', plant: 'G', table: 3},
            {index: 40, type: 'Coal Stock (MT)', plant: 'N', table: 3},
            {index: 41, type: 'Coal Stock (MT)', plant: 'T', table: 3},
            {index: 28, type: 'Coal Stock (Days)', plant: 'R', table: 3},
            {index: 29, type: 'Coal Stock (Days)', plant: 'L', table: 3},
            {index: 30, type: 'Coal Stock (Days)', plant: 'G', table: 3},
            {index: 42, type: 'Coal Stock (Days)', plant: 'N', table: 3},
            {index: 43, type: 'Coal Stock (Days)', plant: 'T', table: 3},
            {index: 31, type: 'Units in Operation', plant: 'R', table: 3},
            {index: 32, type: 'Units in Operation', plant: 'L', table: 3},
            {index: 33, type: 'Units in Operation', plant: 'G', table: 3},
            {index: 44, type: 'Units in Operation', plant: 'N', table: 3},
            {index: 45, type: 'Units in Operation', plant: 'T', table: 3}
        ];
        
        // Build enhanced column mappings for fallback configuration
        console.log("=== BUILDING FALLBACK COLUMN MAPPINGS ===");
        columnMappings = {
            table1: {},
            table2: {},
            table3: {}
        };
        
        columnStructure.forEach(colDef => {
            const plantName = plantMappings[colDef.plant];
            if (!plantName) return;
            
            const mappingData = {
                plantCode: colDef.plant,
                plantName: plantName,
                dataType: colDef.type
            };
            
            if (colDef.table === 1) {
                if (colDef.company) {
                    mappingData.company = colDef.company;
                }
                columnMappings.table1[colDef.index] = mappingData;
            } else if (colDef.table === 2) {
                columnMappings.table2[colDef.index] = mappingData;
            } else if (colDef.table === 3) {
                columnMappings.table3[colDef.index] = mappingData;
            }
        });
        
        console.log("Fallback mappings built successfully");
        
        return false;
    }
}

// Fetch data from the Google Sheet with dynamic processing
async function fetchDailyCoalData(date) {
    console.log("=== FETCHING DAILY COAL DATA ===");
    console.log("Date requested:", date);
    
    // Load configuration first if not already loaded
    if (Object.keys(plantMappings).length === 0 || coalCompanies.length === 0 || columnStructure.length === 0) {
        console.log("Loading dashboard configuration...");
        await fetchDashboardConfig();
    }
    
    const SHEET_ID = '1cFngrabiTY-RMGDrw2eRn7Nn8LEY0IZyD0-QJT7UqTI';
    const SHEET_NAME = 'Dashboard-Daily Coal Stock';
    const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;
    
    try {
        const res = await fetch(SHEET_URL);
        const text = await res.text();
        
        if (!text.includes("table")) {
            throw new Error("Invalid response from Google Sheets");
        }
        
        const json = JSON.parse(text.substr(47).slice(0, -2));
        const rows = json.table.rows;
        
        // Format the input date to match Google Sheets format (DD/MM/YYYY)
        const dateObj = new Date(date);
        const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
        
        console.log(`Looking for date: ${formattedDate}`);
        
        // Find the row with matching date
        let matchedRowData = null;
        
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (!row.c || !row.c[0]) continue;
            
            let rowDate = row.c[0].v;
            let dateToCompare = null;
            
            // Handle Google Sheets Date format like "Date(2025,6,18)"
            if (typeof rowDate === 'string' && rowDate.includes('Date(')) {
                const match = rowDate.match(/Date\((\d{4}),(\d{1,2}),(\d{1,2})\)/);
                if (match) {
                    const year = parseInt(match[1]);
                    const month = parseInt(match[2]) + 1; // Convert from 0-based to 1-based month
                    const day = parseInt(match[3]);
                    dateToCompare = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
                }
            }
            // Handle regular date string (DD/MM/YYYY format)
            else if (typeof rowDate === 'string') {
                dateToCompare = rowDate;
            }
            // Handle Date object
            else if (rowDate instanceof Date) {
                dateToCompare = `${String(rowDate.getDate()).padStart(2, '0')}/${String(rowDate.getMonth() + 1).padStart(2, '0')}/${rowDate.getFullYear()}`;
            }
            
            if (dateToCompare === formattedDate) {
                // Extract data WITHOUT the date column - start from index 1 (Column B)
                matchedRowData = row.c.slice(1).map(cell => cell ? cell.v : 0);
                console.log(`Found matching date at row ${i+1}`);
                console.log(`Extracted ${matchedRowData.length} data columns (excluding date column)`);
                break;
            }
        }
        
        if (!matchedRowData) {
            throw new Error(`No data found for date: ${formattedDate}`);
        }
        
        console.log("=== PROCESSING DATA WITH DYNAMIC CONFIGURATION ===");
        console.log(`Processing ${matchedRowData.length} columns of data`);
        console.log(`Using ${columnStructure.length} column definitions`);
        
        // Debug: Show the enhanced column mappings being used
        console.log("=== ENHANCED COLUMN MAPPINGS DEBUG ===");
        console.log("Table 1 (Rakes Loaded) column mappings:");
        Object.keys(columnMappings.table1).forEach(col => {
            const mapping = columnMappings.table1[col];
            console.log(`  Column ${col}: ${mapping.company} → ${mapping.plantName} (${mapping.plantCode})`);
        });
        
        console.log("Table 2 (Rakes Received/Pipeline) column mappings:");
        Object.keys(columnMappings.table2).forEach(col => {
            const mapping = columnMappings.table2[col];
            console.log(`  Column ${col}: ${mapping.dataType} → ${mapping.plantName} (${mapping.plantCode})`);
        });
        
        console.log("Table 3 (Coal Stock) column mappings:");
        Object.keys(columnMappings.table3).forEach(col => {
            const mapping = columnMappings.table3[col];
            console.log(`  Column ${col}: ${mapping.dataType} → ${mapping.plantName} (${mapping.plantCode})`);
        });
        
        // Debug: Show raw data for specific columns from your exact configuration
        console.log("=== RAW DATA ANALYSIS - EXACT CONFIGURATION ===");
        console.log("*** IMPORTANT: Date column excluded, data now starts from config column 1 = data[0] ***");
        console.log("*** Config Column 1 = Google Sheet Column B = data[0] ***");
        console.log("*** Config Column 25 = Google Sheet Column Z = data[24] ***");
        console.log("");
        console.log("*** Table 1 - Rakes Loaded (Config Columns 1-18 = data[0-17]) ***");
        console.log("Config Column 1 (CCL→R) = Sheet Column B = data[0]:", matchedRowData[0]);
        console.log("Config Column 2 (CCL→L) = Sheet Column C = data[1]:", matchedRowData[1]);
        console.log("Config Column 3 (CCL→G) = Sheet Column D = data[2]:", matchedRowData[2]);
        console.log("Config Column 36 (Total→N) = Sheet Column AJ = data[35]:", matchedRowData[35]);
        console.log("Config Column 37 (Total→T) = Sheet Column AK = data[36]:", matchedRowData[36]);
        console.log("");
        console.log("*** Table 3 - Coal Stock (MT) ***");
        console.log("Config Column 25 (R Coal Stock MT) = Sheet Column Z = data[24]:", matchedRowData[24]);
        console.log("Config Column 26 (L Coal Stock MT) = Sheet Column AA = data[25]:", matchedRowData[25]);
        console.log("Config Column 27 (G Coal Stock MT) = Sheet Column AB = data[26]:", matchedRowData[26]);
        console.log("Config Column 40 (N Coal Stock MT) = Sheet Column AN = data[39]:", matchedRowData[39]);
        console.log("Config Column 41 (T Coal Stock MT) = Sheet Column AO = data[40]:", matchedRowData[40]);
        console.log("");
        console.log("*** Table 3 - Coal Stock (Days) ***");
        console.log("Config Column 28 (R Coal Stock Days) = Sheet Column AC = data[27]:", matchedRowData[27]);
        console.log("Config Column 29 (L Coal Stock Days) = Sheet Column AD = data[28]:", matchedRowData[28]);
        console.log("Config Column 30 (G Coal Stock Days) = Sheet Column AE = data[29]:", matchedRowData[29]);
        console.log("Config Column 42 (N Coal Stock Days) = Sheet Column AP = data[41]:", matchedRowData[41]);
        console.log("Config Column 43 (T Coal Stock Days) = Sheet Column AQ = data[42]:", matchedRowData[42]);
        console.log("");
        console.log("*** Table 2 - Rakes Received ***");
        console.log("Config Column 22 (R Rakes Received) = Sheet Column V = data[21]:", matchedRowData[21]);
        console.log("Config Column 23 (L Rakes Received) = Sheet Column W = data[22]:", matchedRowData[22]);
        console.log("Config Column 24 (G Rakes Received) = Sheet Column X = data[23]:", matchedRowData[23]);
        console.log("Config Column 34 (N Rakes Received) = Sheet Column AI = data[33]:", matchedRowData[33]);
        console.log("Config Column 35 (T Rakes Received) = Sheet Column AJ = data[34]:", matchedRowData[34]);
        console.log("");
        console.log("*** Table 2 - Pipeline ***");
        console.log("Config Column 19 (R Pipeline) = Sheet Column S = data[18]:", matchedRowData[18]);
        console.log("Config Column 20 (L Pipeline) = Sheet Column T = data[19]:", matchedRowData[19]);
        console.log("Config Column 21 (G Pipeline) = Sheet Column U = data[20]:", matchedRowData[20]);
        console.log("Config Column 38 (N Pipeline) = Sheet Column AL = data[37]:", matchedRowData[37]);
        console.log("Config Column 39 (T Pipeline) = Sheet Column AM = data[38]:", matchedRowData[38]);
        
        // Show more columns for debugging if needed
        console.log("=== EXTENDED RAW DATA DEBUG ===");
        for (let i = 20; i < Math.min(50, matchedRowData.length); i++) {
            console.log(`Column ${i + 1} (index ${i}):`, matchedRowData[i]);
        }
        
        // Create dynamic data structure for all plants
        const data = {};
        
        // Initialize data structure for each plant
        Object.values(plantMappings).forEach(plantName => {
            // Initialize rakesLoaded structure dynamically based on coal companies
            const rakesLoaded = {};
            coalCompanies.forEach(company => {
                rakesLoaded[company] = 0;
            });
            
            data[plantName] = {
                'rakesLoaded': rakesLoaded,
                'rakesReceived': 0,
                'rakesPipeline': 0,
                'coalStockMT': 0,
                'coalStockDays': 0,
                'unitsInOperation': 0,
                'totalRakesLoaded': 0  // For plants that have total rakes loaded (NPL, TSPL)
            };
        });
        
        console.log("Initialized data structure for plants:", Object.keys(data));
        
        // Process data using enhanced column mappings - COMPLETELY REWRITTEN
        console.log("=== PROCESSING DATA WITH ENHANCED MAPPINGS ===");
        
        // Process Table 1 - Rakes Loaded by Company
        console.log("*** Processing Table 1 - Rakes Loaded ***");
        Object.keys(columnMappings.table1).forEach(columnIndex => {
            const mapping = columnMappings.table1[columnIndex];
            // IMPORTANT: Data starts from Column B, so Column 1 in config = index 0 in data array
            // Column index in config - 1 = actual data array index (since Column A is date, Column B is index 0)
            const dataIndex = parseInt(columnIndex) - 1;
            
            if (dataIndex >= 0 && dataIndex < matchedRowData.length) {
                const value = parseFloat(matchedRowData[dataIndex]) || 0;
                const plantName = mapping.plantName;
                const company = mapping.company;
                
                console.log(`Column ${columnIndex} (${mapping.plantCode}): ${company || 'Total'} → ${plantName} = ${value} (data array index ${dataIndex}, Google Sheet column ${String.fromCharCode(66 + dataIndex)})`);
                
                if (data[plantName]) {
                    if (company) {
                        // Regular company-wise rakes loaded
                        if (data[plantName].rakesLoaded) {
                            data[plantName].rakesLoaded[company] = value;
                            console.log(`✓ Set ${plantName}.rakesLoaded.${company} = ${value}`);
                        }
                    } else {
                        // Total rakes loaded for NPL/TSPL (columns 36, 37)
                        data[plantName].totalRakesLoaded = value;
                        console.log(`✓ Set ${plantName}.totalRakesLoaded = ${value} *** TOTAL FOR ${plantName} ***`);
                    }
                } else {
                    console.log(`✗ Failed to set data for ${plantName} - plant not found in data structure`);
                }
            } else {
                console.log(`⚠ Column ${columnIndex} out of range (dataIndex: ${dataIndex}, data length: ${matchedRowData.length})`);
            }
        });
        
        // Process Table 2 - Rakes Received/Pipeline
        console.log("*** Processing Table 2 - Rakes Received/Pipeline ***");
        Object.keys(columnMappings.table2).forEach(columnIndex => {
            const mapping = columnMappings.table2[columnIndex];
            // IMPORTANT: Data starts from Column B, so Column 1 in config = index 0 in data array
            const dataIndex = parseInt(columnIndex) - 1;
            
            if (dataIndex >= 0 && dataIndex < matchedRowData.length) {
                const value = parseFloat(matchedRowData[dataIndex]) || 0;
                const plantName = mapping.plantName;
                const dataType = mapping.dataType;
                
                console.log(`Column ${columnIndex} (${mapping.plantCode}): ${dataType} → ${plantName} = ${value} (data array index ${dataIndex}, Google Sheet column ${String.fromCharCode(66 + dataIndex)})`);
                
                if (data[plantName]) {
                    switch (dataType) {
                        case 'Pipeline':
                            data[plantName].rakesPipeline = value;
                            console.log(`✓ Set ${plantName}.rakesPipeline = ${value}`);
                            break;
                        case 'Rakes Received':
                            data[plantName].rakesReceived = value;
                            console.log(`✓ Set ${plantName}.rakesReceived = ${value}`);
                            break;
                        default:
                            console.warn(`Unknown Table 2 data type: ${dataType}`);
                    }
                } else {
                    console.log(`✗ Failed to set data for ${plantName} - plant not found in data structure`);
                }
            } else {
                console.log(`⚠ Column ${columnIndex} out of range (dataIndex: ${dataIndex}, data length: ${matchedRowData.length})`);
            }
        });
        
        // Process Table 3 - Coal Stock
        console.log("*** Processing Table 3 - Coal Stock ***");
        Object.keys(columnMappings.table3).forEach(columnIndex => {
            const mapping = columnMappings.table3[columnIndex];
            // IMPORTANT: Data starts from Column B, so Column 1 in config = index 0 in data array
            const dataIndex = parseInt(columnIndex) - 1;
            
            if (dataIndex >= 0 && dataIndex < matchedRowData.length) {
                const value = parseFloat(matchedRowData[dataIndex]) || 0;
                const plantName = mapping.plantName;
                const dataType = mapping.dataType;
                
                console.log(`Column ${columnIndex} (${mapping.plantCode}): ${dataType} → ${plantName} = ${value} (data array index ${dataIndex}, Google Sheet column ${String.fromCharCode(66 + dataIndex)})`);
                
                if (data[plantName]) {
                    switch (dataType) {
                        case 'Coal Stock (MT)':
                            data[plantName].coalStockMT = value;
                            console.log(`*** COAL STOCK MT: Set ${plantName}.coalStockMT = ${value} (from config column ${columnIndex}, data index ${dataIndex}) ***`);
                            break;
                        case 'Coal Stock (Days)':
                            data[plantName].coalStockDays = value;
                            console.log(`*** COAL STOCK DAYS: Set ${plantName}.coalStockDays = ${value} (from config column ${columnIndex}, data index ${dataIndex}) ***`);
                            break;
                        case 'Units in Operation':
                            data[plantName].unitsInOperation = value;
                            console.log(`Set ${plantName}.unitsInOperation = ${value} (from config column ${columnIndex}, data index ${dataIndex})`);
                            break;
                        default:
                            console.warn(`Unknown Table 3 data type: ${dataType}`);
                    }
                } else {
                    console.log(`✗ Failed to set data for ${plantName} - plant not found in data structure`);
                }
            } else {
                console.log(`⚠ Column ${columnIndex} out of range (dataIndex: ${dataIndex}, data length: ${matchedRowData.length})`);
            }
        });
        
        console.log("=== DATA PROCESSING COMPLETE ===");
        
        // Debug: Show final coal stock assignments
        console.log("=== FINAL COAL STOCK VERIFICATION ===");
        Object.keys(data).forEach(plantName => {
            console.log(`${plantName}: Coal Stock MT = ${data[plantName].coalStockMT}, Coal Stock Days = ${data[plantName].coalStockDays}`);
        });
        
        // Debug: Check specific values for NPL and TSPL
        if (data['NPL']) {
            console.log(`*** NPL Debug: totalRakesLoaded = ${data['NPL'].totalRakesLoaded}, coalStockMT = ${data['NPL'].coalStockMT} ***`);
        }
        if (data['TSPL']) {
            console.log(`*** TSPL Debug: totalRakesLoaded = ${data['TSPL'].totalRakesLoaded}, coalStockMT = ${data['TSPL'].coalStockMT} ***`);
        }
        
        console.log("Final processed data:", data);
        return data;
        
    } catch (error) {
        console.error("Error fetching daily coal data:", error);
        showError(`Error loading data: ${error.message}`);
        return null;
    }
}

// Show error message
function showError(message) {
    const container = document.querySelector('.container');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3';
    errorDiv.textContent = message;
    
    // Remove any existing error messages
    const existingError = container.querySelector('.alert-danger');
    if (existingError) {
        container.removeChild(existingError);
    }
    
    container.insertBefore(errorDiv, container.firstChild.nextSibling);
}

// Clear any existing error messages
function clearErrorMessages() {
    const container = document.querySelector('.container');
    if (container) {
        const existingErrors = container.querySelectorAll('.alert-danger');
        existingErrors.forEach(error => {
            container.removeChild(error);
        });
    }
}

// Format numbers with commas
function formatNumber(num) {
    return new Intl.NumberFormat('en-IN').format(num);
}

// Update the dashboard with the fetched data
// Load dashboard data for selected date
async function loadDashboardData(selectedDate) {
    console.log("Loading dashboard data for:", selectedDate);
    
    // Clear any existing error messages when starting to load new data
    clearErrorMessages();
    
    // Show loading spinner
    document.getElementById('dashboard-loading').style.display = 'block';
    
    try {
        const data = await fetchDailyCoalData(selectedDate);
        document.getElementById('dashboard-loading').style.display = 'none';
        
        if (data) {
            updateDashboard(data);
        } else {
            showError(`No data available for selected date: ${selectedDate}`);
        }
    } catch (error) {
        document.getElementById('dashboard-loading').style.display = 'none';
        console.error("Error loading data for selected date:", error);
        showError(`Error loading data: ${error.message}`);
    }
}

// Update dashboard with completely dynamic data processing
function updateDashboard(data) {
    if (!data) {
        console.error("No data provided to updateDashboard");
        return;
    }
    
    // Clear any existing error messages since data loaded successfully
    clearErrorMessages();
    
    console.log("=== UPDATING DASHBOARD WITH DYNAMIC DATA ===");
    console.log("Data received:", data);
    console.log(`Updating for ${plantOrder.length} plants and ${coalCompanies.length} coal companies`);
    
    // DEBUG: Show exactly what data we have for each plant
    console.log("=== DATA VERIFICATION BEFORE UPDATE ===");
    plantOrder.forEach((plantName, index) => {
        if (data[plantName]) {
            console.log(`${index}: ${plantName} - Coal Stock MT: ${data[plantName].coalStockMT}, Days: ${data[plantName].coalStockDays}, Total Rakes: ${data[plantName].totalRakesLoaded}`);
            console.log(`    Rakes Loaded by Company:`, data[plantName].rakesLoaded);
        } else {
            console.log(`${index}: ${plantName} - NO DATA FOUND`);
        }
    });
    
    // Helper function to safely update cell content
    function updateCell(cell, value) {
        if (!cell) {
            console.warn("Attempted to update null cell");
            return;
        }
        try {
            cell.textContent = value;
        } catch (e) {
            console.error("Error updating cell:", e);
        }
    }
    
    // Update Rakes Loaded table dynamically
    const rakesLoadedBody = document.getElementById('rakesLoadedTableBody');
    if (rakesLoadedBody) {
        const rows = rakesLoadedBody.querySelectorAll('tr');
        console.log(`=== UPDATING RAKES LOADED TABLE - ${rows.length} rows found ===`);
        
        // Update coal company rows dynamically
        coalCompanies.forEach((company, index) => {
            if (index < rows.length - 1) { // Skip the total row
                const cells = rows[index].querySelectorAll('td');
                console.log(`Updating row ${index} for company ${company} - ${cells.length} cells found`);
                
                // Update cells for each plant using the correct plant order mapping
                plantOrder.forEach((plantName, plantIndex) => {
                    const cellIndex = plantIndex + 1; // +1 because first cell is company name
                    if (cellIndex < cells.length && data[plantName] && data[plantName].rakesLoaded) {
                        const value = data[plantName].rakesLoaded[company] || 0;
                        updateCell(cells[cellIndex], value);
                        console.log(`*** RAKES LOADED: ${company} → ${plantName} (table pos ${plantIndex}, cell ${cellIndex}) = ${value} ***`);
                    }
                });
            }
        });
        
        // Update the total row dynamically
        const totalRow = rows[rows.length - 1];
        if (totalRow) {
            const totalCells = totalRow.querySelectorAll('td');
            console.log(`=== UPDATING TOTAL ROW - ${totalCells.length} cells found ===`);
            
            plantOrder.forEach((plantName, plantIndex) => {
                const cellIndex = plantIndex + 1; // +1 because first cell is "Total" label
                if (cellIndex < totalCells.length && data[plantName]) {
                    let total = 0;
                    
                    // For plants that have totalRakesLoaded data (NPL, TSPL), use that value
                    if (data[plantName].totalRakesLoaded !== undefined && data[plantName].totalRakesLoaded > 0) {
                        total = data[plantName].totalRakesLoaded;
                        console.log(`*** TOTAL RAKES: Using totalRakesLoaded for ${plantName} (table pos ${plantIndex}, cell ${cellIndex}): ${total} ***`);
                    } else {
                        // For other plants (GGSSTP, GHTP, GATP), calculate total from coal companies
                        total = coalCompanies.reduce((sum, company) => {
                            return sum + (data[plantName].rakesLoaded[company] || 0);
                        }, 0);
                        console.log(`*** TOTAL RAKES: Calculated total from coal companies for ${plantName} (table pos ${plantIndex}, cell ${cellIndex}): ${total} ***`);
                    }
                    
                    updateCell(totalCells[cellIndex], total);
                    console.log(`*** FINAL TOTAL: Set total rakes loaded for ${plantName} at position ${plantIndex}: ${total} ***`);
                }
            });
        }
    }
    
    // Update Rakes Received and Pipeline table dynamically
    const rakesReceivedBody = document.getElementById('rakesReceivedTableBody');
    if (rakesReceivedBody) {
        const receivedRow = rakesReceivedBody.querySelector('tr:nth-child(1)');
        const pipelineRow = rakesReceivedBody.querySelector('tr:nth-child(2)');
        
        if (receivedRow && pipelineRow) {
            const receivedCells = receivedRow.querySelectorAll('td');
            const pipelineCells = pipelineRow.querySelectorAll('td');
            
            // Update cells based on exact plant order from configuration
            plantOrder.forEach((plantName, plantIndex) => {
                const cellIndex = plantIndex + 1; // +1 because first cell is row label
                
                if (cellIndex < receivedCells.length && data[plantName]) {
                    updateCell(receivedCells[cellIndex], data[plantName].rakesReceived || 0);
                    console.log(`Updated ${plantName} received: ${data[plantName].rakesReceived}`);
                }
                
                if (cellIndex < pipelineCells.length && data[plantName]) {
                    updateCell(pipelineCells[cellIndex], data[plantName].rakesPipeline || 0);
                    console.log(`Updated ${plantName} pipeline: ${data[plantName].rakesPipeline}`);
                }
            });
        }
    }
    
    // Update Coal Stock table dynamically - THIS IS THE KEY FIX
    const coalStockBody = document.getElementById('coalStockTableBody');
    if (coalStockBody) {
        const mtRow = coalStockBody.querySelector('tr:nth-child(1)');
        const daysRow = coalStockBody.querySelector('tr:nth-child(2)');
        const unitsRow = coalStockBody.querySelector('tr:nth-child(3)');
        
        if (mtRow && daysRow && unitsRow) {
            const mtCells = mtRow.querySelectorAll('td');
            const daysCells = daysRow.querySelectorAll('td');
            const unitsCells = unitsRow.querySelectorAll('td');
            
            // Update cells using the exact plant order from plantOrder array
            // This ensures data goes to the correct columns regardless of configuration gaps
            plantOrder.forEach((plantName, plantIndex) => {
                const cellIndex = plantIndex + 1; // +1 because first cell is row label
                
                console.log(`*** COAL STOCK UPDATE: Processing ${plantName} at table position ${plantIndex}, cell index ${cellIndex} ***`);
                
                if (cellIndex < mtCells.length && data[plantName]) {
                    updateCell(mtCells[cellIndex], formatNumber(data[plantName].coalStockMT || 0));
                    console.log(`*** Updated ${plantName} coal stock MT: ${data[plantName].coalStockMT} at cell ${cellIndex} ***`);
                }
                
                if (cellIndex < daysCells.length && data[plantName]) {
                    updateCell(daysCells[cellIndex], data[plantName].coalStockDays || 0);
                    console.log(`*** Updated ${plantName} coal stock days: ${data[plantName].coalStockDays} at cell ${cellIndex} ***`);
                }
                
                if (cellIndex < unitsCells.length && data[plantName]) {
                    updateCell(unitsCells[cellIndex], data[plantName].unitsInOperation || 0);
                    console.log(`*** Updated ${plantName} units in operation: ${data[plantName].unitsInOperation} at cell ${cellIndex} ***`);
                }
            });
        }
    }
    
    console.log("=== DASHBOARD UPDATE COMPLETE ===");
    
    // Extract data for Main Dashboard after successful update
    try {
        console.log("Extracting data for Main Dashboard...");
        extractMainDashboardData();
        console.log("Main Dashboard data extraction completed successfully");
    } catch (error) {
        console.error("Error extracting Main Dashboard data:", error);
    }
}

// Generate completely dynamic HTML for tables based on configuration
async function generateDynamicTablesHTML() {
    console.log("=== GENERATING DYNAMIC TABLES ===");
    
    // Load configuration if not already loaded
    if (Object.keys(plantMappings).length === 0 || coalCompanies.length === 0) {
        await fetchDashboardConfig();
    }
    
    console.log(`Generating tables for ${plantOrder.length} plants and ${coalCompanies.length} coal companies`);
    
    // Generate plant headers dynamically
    const plantHeaders = plantOrder.map(plant => `<th>${plant}</th>`).join('');
    
    // Generate coal company rows for Rakes Loaded table dynamically
    const coalCompanyRows = coalCompanies.map(company => {
        const cells = plantOrder.map(() => '<td>0</td>').join('');
        return `<tr><td>${company}</td>${cells}</tr>`;
    }).join('');
    
    // Generate total row
    const totalCells = plantOrder.map(() => '<td>0</td>').join('');
    const totalRow = `<tr class="fw-bold daily-coal-total-row"><td>Total</td>${totalCells}</tr>`;
    
    // Generate cells for other tables
    const receivedCells = plantOrder.map(() => '<td>0</td>').join('');
    const pipelineCells = plantOrder.map(() => '<td>0</td>').join('');
    const stockMTCells = plantOrder.map(() => '<td>0</td>').join('');
    const stockDaysCells = plantOrder.map(() => '<td>0</td>').join('');
    const unitsCells = plantOrder.map(() => '<td>0</td>').join('');
    
    console.log("Dynamic table HTML generation complete");
    
    return {
        rakesLoadedTable: `
            <style>
                .daily-coal-unified-table {
                    table-layout: fixed;
                    width: 100%;
                }
                .daily-coal-unified-table th:first-child,
                .daily-coal-unified-table td:first-child {
                    width: 20%;
                    min-width: 120px;
                }
                .daily-coal-unified-table th:not(:first-child),
                .daily-coal-unified-table td:not(:first-child) {
                    width: 16%;
                    text-align: center;
                }
                .daily-coal-unified-table th,
                .daily-coal-unified-table td {
                    vertical-align: middle;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .daily-coal-unified-table .fw-bold {
                    background-color: #f8f9fa;
                }
            </style>
            <table class="table table-sm table-bordered daily-coal-table daily-coal-unified-table">
                <thead>
                    <tr>
                        <th>Coal Source</th>
                        ${plantHeaders}
                    </tr>
                </thead>
                <tbody id="rakesLoadedTableBody">
                    ${coalCompanyRows}
                    ${totalRow}
                </tbody>
            </table>`,
        
        rakesReceivedTable: `
            <table class="table table-sm table-bordered daily-coal-table daily-coal-unified-table">
                <thead>
                    <tr>
                        <th>Status</th>
                        ${plantHeaders}
                    </tr>
                </thead>
                <tbody id="rakesReceivedTableBody">
                    <tr><td>Received</td>${receivedCells}</tr>
                    <tr><td>Pipeline</td>${pipelineCells}</tr>
                </tbody>
            </table>`,
            
        coalStockTable: `
            <table class="table table-sm table-bordered daily-coal-table daily-coal-unified-table">
                <thead>
                    <tr>
                        <th>Inventory Type</th>
                        ${plantHeaders}
                    </tr>
                </thead>
                <tbody id="coalStockTableBody">
                    <tr><td>Stock (MT)</td>${stockMTCells}</tr>
                    <tr><td>Stock (Days)</td>${stockDaysCells}</tr>
                    <tr><td>Units in Operation</td>${unitsCells}</tr>
                </tbody>
            </table>`
    };
}

// Display the dashboard
async function showDailyCoalDashboard() {
    console.log("Loading Daily Coal Position Dashboard");
    console.log("=== DYNAMIC CONFIGURATION SYSTEM ACTIVE ===");
    
    // Generate dynamic tables based on configuration
    const tables = await generateDynamicTablesHTML();
    
    console.log("Dynamic tables generated successfully");
    console.log("Configuration loaded:", {
        plantMappings: Object.keys(plantMappings).length,
        coalCompanies: coalCompanies.length,
        columnStructure: columnStructure.length
    });
    
    // Set main content with unified card design
    document.getElementById('main-content').innerHTML = `
        <!-- Main Title -->
        <div class="daily-coal-card mb-3">
            <div class="daily-coal-section-header">
                <h4 class="mb-0"><i class="bi bi-speedometer2"></i> Daily Coal Position Dashboard</h4>
            </div>
        </div>
        
        <!-- Unified Dashboard Card -->
        <div class="daily-coal-card mb-3">
            <div class="daily-coal-section-header d-flex justify-content-between align-items-center expandable" style="cursor: pointer;" onclick="toggleCard('DCUnifiedDashboardBody', 'DCUnifiedChevron')">
                <h5 class="mb-0"><i class="bi bi-grid-3x3-gap"></i> Daily Coal Position Dashboard</h5>
                <i class="bi bi-chevron-up" id="DCUnifiedChevron"></i>
            </div>
            <div class="card-body" id="DCUnifiedDashboardBody">
                <!-- Date Selection Section -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <h6 class="mb-0"><i class="bi bi-calendar-date text-primary"></i> Date Selection</h6>
                        </div>
                        <div class="row justify-content-center">
                            <div class="col-md-6">
                                <div class="date-selector-container d-flex justify-content-center align-items-center">
                                    <button type="button" class="btn btn-outline-primary btn-sm date-nav-btn" id="prevDateBtn">
                                        <i class="bi bi-chevron-left"></i>
                                    </button>
                                    <input type="date" class="form-control form-control-sm mx-2" id="datePicker" style="display: inline-block; width: auto;">
                                    <button type="button" class="btn btn-outline-primary btn-sm date-nav-btn" id="nextDateBtn">
                                        <i class="bi bi-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div id="dashboard-loading" class="text-center my-4" style="display: none;">
                    <div class="daily-coal-loading">
                        <div class="spinner-border text-success" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-2">Loading dashboard data...</p>
                    </div>
                </div>

                <!-- Rakes Loaded Section -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <h6 class="mb-0"><i class="bi bi-train-freight-front text-success"></i> Rakes Loaded - Plant Wise & Coal Company Wise</h6>
                        </div>
                        <div class="table-responsive">
                            ${tables.rakesLoadedTable}
                        </div>
                    </div>
                </div>

                <!-- Rakes Received and Pipeline Section -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <h6 class="mb-0"><i class="bi bi-arrow-down-circle text-info"></i> Rakes Received and Pipeline</h6>
                        </div>
                        <div class="table-responsive">
                            ${tables.rakesReceivedTable}
                        </div>
                    </div>
                </div>

                <!-- Coal Stock Section -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <h6 class="mb-0"><i class="bi bi-box-seam text-warning"></i> Coal Stock Inventory</h6>
                        </div>
                        <div class="table-responsive">
                            ${tables.coalStockTable}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Coal Stock Trend Chart Section -->
        <div class="daily-coal-card mb-3">
            <div class="daily-coal-section-header d-flex justify-content-between align-items-center expandable" style="cursor: pointer;" onclick="toggleCard('DCChartBody', 'DCChartChevron')">
                <h6 class="mb-0"><i class="bi bi-graph-up"></i> Coal Stock Trend Analysis</h6>
                <i class="bi bi-chevron-down" id="DCChartChevron"></i>
            </div>
            <div class="card-body" id="DCChartBody" style="display: none;">
                <!-- Chart Controls -->
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label for="chartDataType" class="form-label">Data Type:</label>
                        <select class="form-select form-select-sm" id="chartDataType" onchange="updateChart()">
                            <option value="days">Coal Stock (Days)</option>
                            <option value="mt">Coal Stock (MT)</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label for="chartPeriod" class="form-label">Period:</label>
                        <select class="form-select form-select-sm" id="chartPeriod" onchange="updateChart()">
                            <option value="7">Last 7 Days</option>
                            <option value="15">Last 15 Days</option>
                            <option value="30" selected>Last 30 Days</option>
                            <option value="60">Last 2 Months</option>
                            <option value="90">Last 3 Months</option>
                            <option value="180">Last 6 Months</option>
                        </select>
                    </div>
                </div>
                
                <!-- Chart Container -->
                <div class="chart-container mb-3" style="position: relative; height: 500px; width: 100%;">
                    <canvas id="coalStockChart"></canvas>
                </div>
                
                <!-- Chart Loading -->
                <div id="chart-loading" class="text-center my-4" style="display: none;">
                    <div class="daily-coal-loading">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading chart data...</span>
                        </div>
                        <p class="mt-2">Loading trend data...</p>
                    </div>
                </div>
                
                <!-- Chart Actions -->
                <div class="d-flex gap-2 flex-wrap">
                    <button type="button" class="btn btn-outline-primary btn-sm" onclick="refreshChart()">
                        <i class="bi bi-arrow-clockwise"></i> Refresh Chart
                    </button>
                    <button type="button" class="btn btn-outline-success btn-sm" onclick="printChart()">
                        <i class="bi bi-printer"></i> Print Chart
                    </button>
                    <button type="button" class="btn btn-outline-warning btn-sm" onclick="exportChartAsImage()">
                        <i class="bi bi-image"></i> Export Chart as Image
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Export Options Card -->
        <div class="daily-coal-card mb-3">
            <div class="daily-coal-section-header d-flex justify-content-between align-items-center expandable" style="cursor: pointer;" onclick="toggleCard('DCExportBody', 'DCExportChevron')">
                <h6 class="mb-0"><i class="bi bi-download"></i> Export Options</h6>
                <i class="bi bi-chevron-down" id="DCExportChevron"></i>
            </div>
            <div class="card-body" id="DCExportBody" style="display: none;">
                <div class="d-flex gap-2 flex-wrap">
                    <button type="button" class="btn btn-outline-success btn-sm" id="DCExportPDF" onclick="exportDashboardToPDF()">
                        <i class="bi bi-filetype-pdf"></i> Export as PDF
                    </button>
                    <button type="button" class="btn btn-outline-primary btn-sm" id="DCExportExcel">
                        <i class="bi bi-file-earmark-excel"></i> Export as Excel
                    </button>
                    <button type="button" class="btn btn-outline-warning btn-sm" id="DCExportJPG" onclick="exportDashboardToJPG()">
                        <i class="bi bi-file-earmark-image"></i> Export as JPG
                    </button>
                    <button type="button" class="btn btn-outline-info btn-sm" id="DCPrint" onclick="printDashboard()">
                        <i class="bi bi-printer"></i> Print Report
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Initialize date picker and event handlers
    initializeDateControls();
    
    // Initialize chart after DOM is ready
    setTimeout(() => {
        initializeChart();
    }, 500);
}

// Initialize date controls and event handlers
function initializeDateControls() {
    const datePicker = document.getElementById('datePicker');
    const prevBtn = document.getElementById('prevDateBtn');
    const nextBtn = document.getElementById('nextDateBtn');
    
    if (datePicker) {
        // Set default date to today
        const today = new Date();
        datePicker.value = today.toISOString().split('T')[0];
        
        // Load data for today
        loadDashboardData(datePicker.value);
        
        // Date picker change event
        datePicker.addEventListener('change', function() {
            loadDashboardData(this.value);
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            const currentDate = new Date(datePicker.value);
            currentDate.setDate(currentDate.getDate() - 1);
            datePicker.value = currentDate.toISOString().split('T')[0];
            loadDashboardData(datePicker.value);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            const currentDate = new Date(datePicker.value);
            currentDate.setDate(currentDate.getDate() + 1);
            datePicker.value = currentDate.toISOString().split('T')[0];
            loadDashboardData(datePicker.value);
        });
    }
}

// Export dashboard to PDF using jsPDF
async function exportDashboardToPDF() {
    try {
        // Check if jsPDF is available
        if (typeof window.jspdf === 'undefined') {
            alert('jsPDF library is not loaded. Please ensure the jsPDF script is included.');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('portrait', 'mm', 'a4');
        
        // Get current date
        const datePicker = document.getElementById('datePicker');
        const selectedDate = datePicker ? datePicker.value : new Date().toISOString().split('T')[0];
        const formattedDate = new Date(selectedDate).toLocaleDateString('en-GB');
        
        // Set up PDF styling
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Daily Coal Position Dashboard', 20, 20);
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Date: ${formattedDate}`, 20, 30);
        pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, 38);
        
        let yPosition = 50;
        
        // Helper function to add table to PDF
        function addTableToPDF(title, tableElement, startY) {
            if (!tableElement) return startY;
            
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text(title, 20, startY);
            
            // Extract table data
            const rows = [];
            const headerRow = [];
            
            // Get headers
            const headerCells = tableElement.querySelectorAll('thead tr th');
            headerCells.forEach(cell => {
                headerRow.push(cell.textContent.trim());
            });
            rows.push(headerRow);
            
            // Get data rows
            const bodyRows = tableElement.querySelectorAll('tbody tr');
            bodyRows.forEach(row => {
                const rowData = [];
                const cells = row.querySelectorAll('td');
                cells.forEach(cell => {
                    rowData.push(cell.textContent.trim());
                });
                rows.push(rowData);
            });
            
            // Add table using autoTable plugin if available
            if (typeof pdf.autoTable === 'function') {
                pdf.autoTable({
                    head: [headerRow],
                    body: rows.slice(1),
                    startY: startY + 8,
                    theme: 'grid',
                    styles: { fontSize: 8 },
                    headStyles: { fillColor: [65, 105, 225] },
                    margin: { left: 20, right: 20 }
                });
                return pdf.lastAutoTable.finalY + 10;
            } else {
                // Fallback: Simple table rendering
                let currentY = startY + 8;
                rows.forEach((row, index) => {
                    let xPosition = 20;
                    pdf.setFontSize(8);
                    pdf.setFont('helvetica', index === 0 ? 'bold' : 'normal');
                    
                    row.forEach((cell, cellIndex) => {
                        pdf.text(cell.substring(0, 15), xPosition, currentY); // Truncate long text
                        xPosition += 35;
                    });
                    currentY += 6;
                });
                return currentY + 10;
            }
        }
        
        // Add tables to PDF
        const rakesLoadedTable = document.getElementById('rakesLoadedTableBody')?.closest('table');
        const rakesReceivedTable = document.getElementById('rakesReceivedTableBody')?.closest('table');
        const coalStockTable = document.getElementById('coalStockTableBody')?.closest('table');
        
        yPosition = addTableToPDF('Rakes Loaded - Plant Wise & Coal Company Wise', rakesLoadedTable, yPosition);
        
        // Check if we need a new page
        if (yPosition > 180) {
            pdf.addPage();
            yPosition = 20;
        }
        
        yPosition = addTableToPDF('Rakes Received and Pipeline', rakesReceivedTable, yPosition);
        
        // Check if we need a new page
        if (yPosition > 180) {
            pdf.addPage();
            yPosition = 20;
        }
        
        yPosition = addTableToPDF('Coal Stock Inventory', coalStockTable, yPosition);
        
        // Save the PDF
        const fileName = `Daily_Coal_Position_${selectedDate.replace(/-/g, '_')}.pdf`;
        pdf.save(fileName);
        
        console.log(`PDF exported successfully: ${fileName}`);
        
    } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Error generating PDF. Please try again.');
    }
}

// Export dashboard to JPG using html2canvas
async function exportDashboardToJPG() {
    try {
        // Check if html2canvas is available
        if (typeof html2canvas === 'undefined') {
            alert('html2canvas library is not loaded. Please ensure the html2canvas script is included.');
            return;
        }
        
        // Get current date for filename
        const datePicker = document.getElementById('datePicker');
        const selectedDate = datePicker ? datePicker.value : new Date().toISOString().split('T')[0];
        
        // Temporarily expand all cards for capture (except export options)
        const collapsedCards = [];
        document.querySelectorAll('.card-body[style*="display: none"]').forEach(card => {
            // Skip the export options card
            if (card.id !== 'DCExportBody') {
                collapsedCards.push(card);
                card.style.display = 'block';
            }
        });
        
        // Hide export options card specifically
        const exportCard = document.querySelector('#DCExportBody').closest('.daily-coal-card');
        const originalExportDisplay = exportCard ? exportCard.style.display : '';
        if (exportCard) {
            exportCard.style.display = 'none';
        }
        
        // Hide chart loading indicator if visible
        const chartLoading = document.getElementById('chart-loading');
        const originalChartLoadingDisplay = chartLoading ? chartLoading.style.display : '';
        if (chartLoading && chartLoading.style.display !== 'none') {
            chartLoading.style.display = 'none';
        }
        
        // Capture the main content area
        const element = document.getElementById('main-content');
        
        // Configure html2canvas options
        const options = {
            backgroundColor: '#ffffff',
            scale: 2, // Higher quality
            useCORS: true,
            allowTaint: true,
            scrollX: 0,
            scrollY: 0,
            width: element.scrollWidth,
            height: element.scrollHeight,
            ignoreElements: function(element) {
                // Additional check to ignore export-related elements and loading indicators
                return element.classList.contains('bi-download') || 
                       element.id === 'DCExportBody' ||
                       element.id === 'chart-loading' ||
                       element.closest('#DCExportBody') !== null ||
                       element.closest('#chart-loading') !== null;
            }
        };
        
        // Generate canvas
        const canvas = await html2canvas(element, options);
        
        // Restore export card visibility
        if (exportCard) {
            exportCard.style.display = originalExportDisplay;
        }
        
        // Restore chart loading indicator
        if (chartLoading) {
            chartLoading.style.display = originalChartLoadingDisplay;
        }
        
        // Restore collapsed cards
        collapsedCards.forEach(card => {
            card.style.display = 'none';
        });
        
        // Convert canvas to JPG blob
        canvas.toBlob(function(blob) {
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `Daily_Coal_Position_${selectedDate.replace(/-/g, '_')}.jpg`;
            
            // Trigger download
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            console.log(`JPG exported successfully: Daily_Coal_Position_${selectedDate.replace(/-/g, '_')}.jpg`);
        }, 'image/jpeg', 0.95); // High quality JPG
        
    } catch (error) {
        console.error('Error exporting JPG:', error);
        alert('Error generating JPG image. Please try again.');
    }
}

// Print dashboard
function printDashboard() {
    // Temporarily expand all cards for printing
    const collapsedCards = [];
    document.querySelectorAll('.card-body[style*="display: none"]').forEach(card => {
        collapsedCards.push(card);
        card.style.display = 'block';
    });
    
    // Get current date
    const datePicker = document.getElementById('datePicker');
    const selectedDate = datePicker ? datePicker.value : new Date().toISOString().split('T')[0];
    const formattedDate = new Date(selectedDate).toLocaleDateString('en-GB');
    
    // Create print window
    const printContent = document.getElementById('main-content').innerHTML;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Daily Coal Position Dashboard - ${formattedDate}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                @media print {
                    body { font-size: 12px; }
                    .table { font-size: 10px; }
                    .btn { display: none; }
                    .expandable { cursor: default !important; }
                    .card-body { display: block !important; }
                    h1, h2, h3, h4, h5, h6 { color: #000 !important; }
                    .table thead th { background-color: #f8f9fa !important; }
                }
                .daily-coal-card {
                    border: 1px solid #dee2e6;
                    border-radius: 0.375rem;
                    margin-bottom: 1rem;
                }
                .daily-coal-section-header {
                    background-color: #f8f9fa;
                    padding: 0.75rem 1rem;
                    border-bottom: 1px solid #dee2e6;
                }
                .card-body {
                    padding: 1rem;
                }
                .table {
                    margin-bottom: 0;
                }
            </style>
        </head>
        <body>
            <div class="container-fluid">
                <div class="text-center mb-4">
                    <h2>Daily Coal Position Dashboard</h2>
                    <p><strong>Date:</strong> ${formattedDate} | <strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                </div>
                ${printContent}
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = function() {
        printWindow.print();
        printWindow.close();
    };
    
    // Restore collapsed cards
    setTimeout(() => {
        collapsedCards.forEach(card => {
            card.style.display = 'none';
        });
    }, 1000);
}

// ===== CHART FUNCTIONALITY =====

// Global chart instance
let coalStockChart = null;

// Plant colors for consistent chart display
const plantColors = {
    'GGSSTP': '#FF6384',  // Red
    'GHTP': '#36A2EB',    // Blue  
    'GATP': '#FFCE56',    // Yellow
    'NPL': '#4BC0C0',     // Teal
    'TSPL': '#9966FF'     // Purple
};

// Initialize the chart
async function initializeChart() {
    console.log("=== INITIALIZING COAL STOCK TREND CHART ===");
    
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js library not found. Loading from CDN...');
        await loadChartJS();
    }
    
    // Initialize chart with default data
    await updateChart();
}

// Load Chart.js dynamically if not available
function loadChartJS() {
    return new Promise((resolve, reject) => {
        if (typeof Chart !== 'undefined') {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
        script.onload = () => {
            console.log('Chart.js loaded successfully');
            resolve();
        };
        script.onerror = () => {
            console.error('Failed to load Chart.js');
            reject();
        };
        document.head.appendChild(script);
    });
}

// Fetch historical data for chart
async function fetchHistoricalData(days) {
    console.log(`=== FETCHING HISTORICAL DATA FOR ${days} DAYS ===`);
    
    // Show loading spinner
    const loadingDiv = document.getElementById('chart-loading');
    if (loadingDiv) loadingDiv.style.display = 'block';
    
    try {
        // Load configuration if not already loaded
        if (Object.keys(plantMappings).length === 0) {
            await fetchDashboardConfig();
        }
        
        const historicalData = [];
        const endDate = new Date();
        
        // Generate date range
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(endDate);
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            
            try {
                console.log(`Fetching data for date: ${dateString}`);
                const dayData = await fetchDailyCoalData(dateString);
                
                if (dayData) {
                    const processedData = {
                        date: dateString,
                        formattedDate: date.toLocaleDateString('en-GB'),
                        plants: {}
                    };
                    
                    // Extract coal stock data for each plant
                    Object.keys(dayData).forEach(plantName => {
                        if (plantOrder.includes(plantName)) {
                            processedData.plants[plantName] = {
                                coalStockMT: dayData[plantName].coalStockMT || 0,
                                coalStockDays: dayData[plantName].coalStockDays || 0
                            };
                        }
                    });
                    
                    historicalData.push(processedData);
                    console.log(`✓ Data loaded for ${dateString}: ${Object.keys(processedData.plants).length} plants`);
                } else {
                    console.log(`✗ No data found for ${dateString}`);
                    // Add empty data point to maintain continuity
                    const emptyData = {
                        date: dateString,
                        formattedDate: date.toLocaleDateString('en-GB'),
                        plants: {}
                    };
                    
                    plantOrder.forEach(plantName => {
                        emptyData.plants[plantName] = {
                            coalStockMT: null,
                            coalStockDays: null
                        };
                    });
                    
                    historicalData.push(emptyData);
                }
            } catch (error) {
                console.error(`Error fetching data for ${dateString}:`, error);
                // Add empty data point for error dates
                const emptyData = {
                    date: dateString,
                    formattedDate: date.toLocaleDateString('en-GB'),
                    plants: {}
                };
                
                plantOrder.forEach(plantName => {
                    emptyData.plants[plantName] = {
                        coalStockMT: null,
                        coalStockDays: null
                    };
                });
                
                historicalData.push(emptyData);
            }
        }
        
        console.log(`=== HISTORICAL DATA FETCH COMPLETE ===`);
        console.log(`Total data points: ${historicalData.length}`);
        
        // Hide loading spinner
        if (loadingDiv) loadingDiv.style.display = 'none';
        
        return historicalData;
        
    } catch (error) {
        console.error('Error fetching historical data:', error);
        if (loadingDiv) loadingDiv.style.display = 'none';
        throw error;
    }
}

// Update chart with current settings
async function updateChart() {
    console.log("=== UPDATING CHART ===");
    
    try {
        const dataType = document.getElementById('chartDataType')?.value || 'days';
        const period = parseInt(document.getElementById('chartPeriod')?.value || '30');
        
        console.log(`Chart settings: Type=${dataType}, Period=${period} days`);
        
        // Fetch historical data
        const historicalData = await fetchHistoricalData(period);
        
        if (!historicalData || historicalData.length === 0) {
            console.error('No historical data available for chart');
            return;
        }
        
        // Prepare chart data
        const chartData = prepareChartData(historicalData, dataType);
        
        // Create or update chart
        createChart(chartData, dataType);
        
    } catch (error) {
        console.error('Error updating chart:', error);
        alert('Error loading chart data. Please try again.');
    }
}

// Prepare data for Chart.js
function prepareChartData(historicalData, dataType) {
    console.log("=== PREPARING CHART DATA ===");
    
    // Extract labels (dates)
    const labels = historicalData.map(item => item.formattedDate);
    
    // Prepare datasets for each plant
    const datasets = [];
    
    plantOrder.forEach((plantName, index) => {
        const plantColor = plantColors[plantName] || `hsl(${index * 72}, 70%, 50%)`;
        
        const data = historicalData.map(item => {
            const plantData = item.plants[plantName];
            if (!plantData) return null;
            
            if (dataType === 'mt') {
                return plantData.coalStockMT;
            } else {
                return plantData.coalStockDays;
            }
        });
        
        datasets.push({
            label: plantName,
            data: data,
            borderColor: plantColor,
            backgroundColor: plantColor + '20', // 20% opacity
            borderWidth: 3,
            fill: false,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            spanGaps: true // Connect points even if there are null values
        });
    });
    
    console.log(`Chart datasets prepared for ${datasets.length} plants`);
    
    return {
        labels: labels,
        datasets: datasets
    };
}

// Create or update the chart
function createChart(chartData, dataType) {
    console.log("=== CREATING/UPDATING CHART ===");
    
    const ctx = document.getElementById('coalStockChart');
    if (!ctx) {
        console.error('Chart canvas not found');
        return;
    }
    
    // Destroy existing chart if it exists
    if (coalStockChart) {
        coalStockChart.destroy();
    }
    
    const yAxisTitle = dataType === 'mt' ? 'Coal Stock (MT)' : 'Coal Stock (Days)';
    const chartTitle = `Coal Stock Trend - ${yAxisTitle}`;
    
    coalStockChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: chartTitle,
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    padding: 25
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 25,
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            const plantName = context.dataset.label;
                            const value = context.parsed.y;
                            const unit = dataType === 'mt' ? ' MT' : ' Days';
                            
                            if (value === null || value === undefined) {
                                return `${plantName}: No Data`;
                            }
                            
                            if (dataType === 'mt') {
                                return `${plantName}: ${new Intl.NumberFormat('en-IN').format(value)}${unit}`;
                            } else {
                                return `${plantName}: ${value}${unit}`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Date'
                    },
                    grid: {
                        display: true,
                        color: '#e0e0e0'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: yAxisTitle
                    },
                    grid: {
                        display: true,
                        color: '#e0e0e0'
                    },
                    ticks: {
                        callback: function(value) {
                            if (dataType === 'mt') {
                                return new Intl.NumberFormat('en-IN').format(value);
                            }
                            return value;
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: yAxisTitle
                    },
                    grid: {
                        drawOnChartArea: false, // Don't draw grid lines for right axis to avoid overlap
                        color: '#e0e0e0'
                    },
                    ticks: {
                        callback: function(value) {
                            if (dataType === 'mt') {
                                return new Intl.NumberFormat('en-IN').format(value);
                            }
                            return value;
                        }
                    },
                    // Ensure right axis follows left axis scale
                    afterBuildTicks: function(axis) {
                        const leftAxis = axis.chart.scales.y;
                        if (leftAxis) {
                            axis.min = leftAxis.min;
                            axis.max = leftAxis.max;
                            axis.ticks = leftAxis.ticks.map(tick => ({...tick}));
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            elements: {
                point: {
                    hoverRadius: 8
                }
            }
        }
    });
    
    console.log("Chart created successfully");
}

// Refresh chart
async function refreshChart() {
    console.log("Refreshing chart...");
    await updateChart();
}

// Print chart
function printChart() {
    console.log("Printing chart...");
    
    try {
        // Get current settings for title
        const dataType = document.getElementById('chartDataType')?.value || 'days';
        const period = document.getElementById('chartPeriod')?.value || '30';
        const yAxisTitle = dataType === 'mt' ? 'Coal Stock (MT)' : 'Coal Stock (Days)';
        
        // Create print window
        const printWindow = window.open('', '_blank');
        
        // Get chart canvas as image
        const canvas = document.getElementById('coalStockChart');
        const chartImage = canvas.toDataURL('image/png');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Coal Stock Trend Analysis</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                        text-align: center;
                    }
                    .chart-container {
                        margin: 20px 0;
                    }
                    .chart-info {
                        margin-bottom: 20px;
                        font-size: 14px;
                    }
                    @media print {
                        body { margin: 10px; }
                        .chart-container { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <h2>Daily Coal Position Dashboard</h2>
                <h3>Coal Stock Trend Analysis - ${yAxisTitle}</h3>
                <div class="chart-info">
                    <p><strong>Period:</strong> Last ${period} Days</p>
                    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                </div>
                <div class="chart-container">
                    <img src="${chartImage}" style="max-width: 100%; height: auto;" alt="Coal Stock Trend Chart">
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        
        // Wait for content to load then print
        printWindow.onload = function() {
            printWindow.print();
            printWindow.close();
        };
        
    } catch (error) {
        console.error('Error printing chart:', error);
        alert('Error printing chart. Please try again.');
    }
}

// Export chart as image
function exportChartAsImage() {
    console.log("Exporting chart as image...");
    
    try {
        const canvas = document.getElementById('coalStockChart');
        
        // Get current settings for filename
        const dataType = document.getElementById('chartDataType')?.value || 'days';
        const period = document.getElementById('chartPeriod')?.value || '30';
        const today = new Date().toISOString().split('T')[0];
        
        // Convert canvas to blob and download
        canvas.toBlob(function(blob) {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `Coal_Stock_Trend_${dataType}_${period}days_${today.replace(/-/g, '_')}.png`;
            
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            console.log(`Chart exported as: Coal_Stock_Trend_${dataType}_${period}days_${today.replace(/-/g, '_')}.png`);
        }, 'image/png');
        
    } catch (error) {
        console.error('Error exporting chart:', error);
        alert('Error exporting chart image. Please try again.');
    }
}

// Helper function to toggle card visibility (similar to Coal Quality Analysis)
function toggleCard(bodyId, chevronId) {
    const body = document.getElementById(bodyId);
    const chevron = document.getElementById(chevronId);
    
    if (body && chevron) {
        if (body.style.display === 'none') {
            body.style.display = 'block';
            chevron.classList.remove('bi-chevron-down');
            chevron.classList.add('bi-chevron-up');
            chevron.parentElement.classList.add('expanded');
        } else {
            body.style.display = 'none';
            chevron.classList.remove('bi-chevron-up');
            chevron.classList.add('bi-chevron-down');
            chevron.parentElement.classList.remove('expanded');
        }
    }
}
