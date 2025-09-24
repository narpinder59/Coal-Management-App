let QualityCostData1 = [];
let QualityCostData2 = [];
let QualityCostHeaders1 = [];
let QualityCostHeaders2 = [];

// Fetch data from Quality&CostAnalysis1 sheet
async function fetchQualityCostData1() {
    const SHEET_ID = '1cFngrabiTY-RMGDrw2eRn7Nn8LEY0IZyD0-QJT7UqTI';
    const SHEET_NAME = 'Quality&CostAnalysis1';
    const RANGE = 'A1:Z';
    const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&range=${RANGE}`;
    
    try {
        const res = await fetch(SHEET_URL);
        const text = await res.text();
        
        if (!text.includes("table")) {
            throw new Error("Invalid response from Google Sheets");
        }
        
        const jsonStart = text.substr(47);
        const jsonData = jsonStart.slice(0, -2);
        const json = JSON.parse(jsonData);
        
        if (!json.table || !json.table.rows) {
            throw new Error("Missing table data in response");
        }
        
        const table = json.table;
        
        // Extract headers from first row
        if (table.rows.length > 0) {
            QualityCostHeaders1 = table.rows[0].c.map(cell => cell ? cell.v : "");
        }
        
        // Extract data from remaining rows
        const dataRows = table.rows.slice(1);
        
        QualityCostData1 = dataRows
            .map((row, index) => {
                // Check if row has cells
                if (!row.c || row.c.length === 0) {
                    return null;
                }
                
                const rowData = Array(QualityCostHeaders1.length).fill("");
                row.c.forEach((cell, idx) => {
                    if (cell && cell.v !== undefined) {
                        rowData[idx] = cell.v;
                    }
                });
                
                // Check if this row has any meaningful data
                const hasData = rowData.some(cell => cell !== "" && cell !== null && cell !== undefined);
                if (!hasData) {
                    return null;
                }
                
                return rowData;
            })
            .filter(row => row !== null);
            
    } catch (error) {
        console.error("Error in fetchQualityCostData1:", error);
        throw error;
    }
}

// Fetch data from Quality&CostAnalysis2 sheet
async function fetchQualityCostData2() {
    const SHEET_ID = '1cFngrabiTY-RMGDrw2eRn7Nn8LEY0IZyD0-QJT7UqTI';
    const SHEET_NAME = 'Quality&CostAnalysis2';
    const RANGE = 'A1:E';
    const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&range=${RANGE}`;
    
    try {
        const res = await fetch(SHEET_URL);
        const text = await res.text();
        
        if (!text.includes("table")) {
            throw new Error("Invalid response from Google Sheets");
        }
        
        const json = JSON.parse(text.substr(47).slice(0, -2));
        
        if (!json.table || !json.table.rows) {
            throw new Error("Missing table data in response");
        }
        
        const table = json.table;
        
        // Extract headers from first row
        if (table.rows.length > 0) {
            QualityCostHeaders2 = table.rows[0].c.map(cell => cell ? cell.v : "");
        }
        
        // Extract data from remaining rows
        QualityCostData2 = table.rows.slice(1)
            .filter(row => row.c && row.c.length > 0)
            .map(row => {
                const rowData = Array(QualityCostHeaders2.length).fill("");
                row.c.forEach((cell, idx) => {
                    if (cell && cell.v !== undefined) {
                        rowData[idx] = cell.v;
                    }
                });
                return rowData;
            });
            
    } catch (error) {
        console.error("Error in fetchQualityCostData2:", error);
        throw error;
    }
}

// Parse month-year string to Date object
function parseMonthYear(monthStr) {
    if (!monthStr) return null;
    
    // Handle Google Sheets Date format like "Date(2025,3,1)"
    if (typeof monthStr === 'string' && monthStr.includes('Date(')) {
        try {
            const match = monthStr.match(/Date\((\d{4}),\s*(\d{1,2}),\s*(\d{1,2})\)/);
            if (match) {
                const year = parseInt(match[1]);
                const month = parseInt(match[2]); // Google format is 0-based
                const day = parseInt(match[3]);
                return new Date(year, month, day);
            }
        } catch (e) {
            console.error("Error parsing Google date format:", e);
        }
    }
    
    // Handle various month formats (e.g., "Jan-24", "January 2024", etc.)
    try {
        const parts = monthStr.toString().split(/[-\s]/);
        if (parts.length >= 2) {
            const monthMap = {
                'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
                'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11,
                'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
                'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
            };
            
            const month = monthMap[parts[0]] !== undefined ? monthMap[parts[0]] : parseInt(parts[0]) - 1;
            let year = parseInt(parts[1]);
            
            // Handle 2-digit years
            if (year < 100) {
                year += 2000;
            }
            
            return new Date(year, month, 1);
        }
    } catch (e) {
        console.error("Error parsing month:", monthStr, e);
    }
    
    return null;
}

// Parse date format from Quality&CostAnalysis2 sheet (01/04/2025)
function parseSheetDate(dateStr) {
    if (!dateStr) return null;
    
    try {
        // Handle string format like "01/04/2025" (DD/MM/YYYY)
        if (typeof dateStr === 'string' && dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                const day = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1; // JavaScript months are 0-based
                const year = parseInt(parts[2]);
                return new Date(year, month, day);
            }
        }
        
        // Handle Google Sheets Date object
        if (typeof dateStr === 'object' && dateStr.v !== undefined) {
            return parseSheetDate(dateStr.v);
        }
        
        // Handle Google Sheets Date format like "Date(2025,3,1)"
        if (typeof dateStr === 'string' && dateStr.includes('Date(')) {
            const match = dateStr.match(/Date\((\d{4}),\s*(\d{1,2}),\s*(\d{1,2})\)/);
            if (match) {
                const year = parseInt(match[1]);
                const month = parseInt(match[2]); // Google format is 0-based
                const day = parseInt(match[3]);
                return new Date(year, month, day);
            }
        }
        
    } catch (e) {
        console.error("Error parsing sheet date:", dateStr, e);
    }
    
    return null;
}

// Format date for display in dropdown - BULLETPROOF VERSION
function formatMonthForDisplay(monthStr) {
    console.log("formatMonthForDisplay input:", monthStr);
    
    if (!monthStr || monthStr === "") {
        console.log("formatMonthForDisplay: Empty input, returning Invalid Date");
        return 'Invalid Date';
    }
    
    // Handle YYYY-MM format first (e.g., "2025-01")
    if (typeof monthStr === 'string' && /^\d{4}-\d{2}$/.test(monthStr)) {
        const [year, month] = monthStr.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const monthIndex = parseInt(month) - 1; // Convert to 0-based index
        if (monthIndex >= 0 && monthIndex < 12) {
            const result = `${monthNames[monthIndex]}-${year}`;
            console.log("formatMonthForDisplay: SUCCESS - YYYY-MM format converted to:", result);
            return result;
        } else {
            console.log("formatMonthForDisplay: ERROR - Invalid month in YYYY-MM format:", month);
            return 'Invalid Date';
        }
    }
    
    // Handle Google Sheets Date format: Date(2025,3,1)
    if (typeof monthStr === 'string' && monthStr.includes('Date(')) {
        // Use a more specific regex pattern
        const match = monthStr.match(/Date\((\d{4}),(\d{1,2}),(\d{1,2})\)/);
        if (match) {
            const year = parseInt(match[1]);
            const month = parseInt(match[2]); // Google uses 0-based months (0=Jan, 1=Feb, etc.)
            
            console.log(`formatMonthForDisplay: Parsed year=${year}, month=${month} from "${monthStr}"`);
            
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                               'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            // Validate month is in valid range
            if (month >= 0 && month < 12) {
                const result = `${monthNames[month]} ${year}`;
                console.log("formatMonthForDisplay: SUCCESS - Formatted to:", result);
                return result;
            } else {
                console.log("formatMonthForDisplay: ERROR - Month out of range:", month);
                return 'Invalid Date';
            }
        } else {
            console.log("formatMonthForDisplay: ERROR - Failed to match Date pattern in:", monthStr);
        }
    } else {
        console.log("formatMonthForDisplay: ERROR - Not a recognized date format:", typeof monthStr, monthStr);
    }
    
    console.log("formatMonthForDisplay: FALLBACK - Returning Invalid Date");
    return 'Invalid Date';
}

// Calculate Financial Year from a date (April to March)
function getFinancialYear(date) {
    if (!date) return null;
    
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-based (0 = January, 3 = April, 11 = December)
    
    // Financial Year: April (month 3) to March (month 2 of next year)
    if (month >= 3) { // April to December
        return `FY ${year}-${(year + 1).toString().slice(-2)}`;
    } else { // January to March
        return `FY ${year - 1}-${year.toString().slice(-2)}`;
    }
}

// Get Financial Year display format
function getFinancialYearDisplay(fyString) {
    return fyString; // Already in desired format like "FY 2024-25"
}

// Check if a date falls within a specific Financial Year
function isDateInFinancialYear(date, fyString) {
    if (!date || !fyString) return false;
    
    const fyFromDate = getFinancialYear(date);
    return fyFromDate === fyString;
}

// Get unique months from data for dropdown - SIMPLE VERSION
function getUniqueMonths() {
    console.log("getUniqueMonths: Starting");
    console.log("QualityCostData1 length:", QualityCostData1 ? QualityCostData1.length : 'null');
    
    const months = new Set();
    
    if (!QualityCostData1 || QualityCostData1.length === 0) {
        console.log("getUniqueMonths: No data available");
        return [];
    }
    
    // Sample first few rows to debug
    QualityCostData1.slice(0, 5).forEach((row, index) => {
        console.log(`Row ${index}:`, row);
        if (row && row[0]) {
            console.log(`  Month value in row ${index}:`, row[0]);
        }
    });
    
    QualityCostData1.forEach((row, index) => {
        if (row && row[0]) { // Month is in column A
            const monthValue = row[0];
            
            // Add to set if it's a valid date string
            if (typeof monthValue === 'string' && monthValue.includes('Date(')) {
                months.add(monthValue);
                console.log("Added month:", monthValue);
            }
        }
    });
    
    // Convert set to array - NO SORTING FOR NOW
    const monthsArray = Array.from(months);
    
    console.log("getUniqueMonths: Found", monthsArray.length, "unique months");
    console.log("First 5 months:", monthsArray.slice(0, 5));
    
    return monthsArray;
}

// Calculate weighted average
function calculateWeightedAverage(values, weights) {
    let totalWeight = 0;
    let weightedSum = 0;
    
    for (let i = 0; i < values.length; i++) {
        const val = parseFloat(values[i]);
        const weight = parseFloat(weights[i]);
        
        if (!isNaN(val) && !isNaN(weight) && weight > 0) {
            weightedSum += val * weight;
            totalWeight += weight;
        }
    }
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

// Calculate simple average of non-zero values
function calculateSimpleAverage(values) {
    const nonZeroValues = values
        .map(v => parseFloat(v))
        .filter(v => !isNaN(v) && v > 0);
    
    return nonZeroValues.length > 0 
        ? nonZeroValues.reduce((a, b) => a + b, 0) / nonZeroValues.length 
        : 0;
}

// Get SHR data from Quality&CostAnalysis2
function getSHRData(plant, month) {
    if (!QualityCostData2 || QualityCostData2.length === 0) return 4.0; // Default SHR
    
    // Find matching record: Column A = month, Column B = plant, Column C = SHR
    for (let i = 0; i < QualityCostData2.length; i++) {
        const row = QualityCostData2[i];
        if (!row || row.length < 3) continue;
        
        // Get month from Column A (could be in format 01/04/2025)
        const rowMonth = (typeof row[0] === 'object' && row[0].v !== undefined) ? 
            row[0].v : row[0];
        
        // Get plant from Column B  
        const rowPlant = (typeof row[1] === 'object' && row[1].v !== undefined) ? 
            String(row[1].v).trim() : String(row[1] || '').trim();
        
        // Parse both dates to compare month/year
        const rowDate = parseSheetDate(rowMonth);
        const targetDate = parseMonthYear(month);
        
        if (rowDate && targetDate) {
            const rowMonthYear = new Date(rowDate.getFullYear(), rowDate.getMonth(), 1);
            const targetMonthYear = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
            
            // Check if month/year and plant match
            if (rowMonthYear.getTime() === targetMonthYear.getTime() && rowPlant.toLowerCase() === plant.toLowerCase()) {
                // Get SHR from Column C
                const shrValue = (typeof row[2] === 'object' && row[2].v !== undefined) ? 
                    parseFloat(row[2].v) : parseFloat(row[2]);
                
                return isNaN(shrValue) ? 4.0 : shrValue;
            }
        }
    }
    
    return 4.0; // Default if not found
}

// Get weighted average SHR for a plant over the selected period (weighted by Units Generated)
function getWeightedAverageSHRForPlant(plant) {
    if (!QualityCostData2 || QualityCostData2.length === 0) {
        // console.log("No QualityCostData2 available, returning default SHR");
        return 4.0; // Default SHR
    }
    
    let totalWeightedSHR = 0;
    let totalUnitsGenerated = 0;
    
    // Get selected month range
    const startMonth = document.getElementById('QCStartMonth').value;
    const endMonth = document.getElementById('QCEndMonth').value;
    
    if (!startMonth || !endMonth) {
        // console.log("No month range selected, returning default SHR");
        return 4.0;
    }
    
    const startDate = parseMonthYear(startMonth);
    const endDate = parseMonthYear(endMonth);
    
    // console.log(`\n=== Calculating SHR for plant: ${plant} ===`);
    // console.log(`Period: ${startMonth} to ${endMonth}`);
    // console.log(`Parsed dates: ${startDate} to ${endDate}`);
    // console.log("Available data rows:", QualityCostData2.length);
    // console.log("Headers:", QualityCostHeaders2);
    
    // Find all matching records for this plant in the period
    for (let i = 0; i < QualityCostData2.length; i++) {
        const row = QualityCostData2[i];
        if (!row || row.length < 5) continue;
        
        // Get data from correct columns based on headers:
        // Column A (0): Month
        // Column B (1): Plant  
        // Column C (2): SHR (Kcal/Kwh)
        // Column D (3): Specific Coal Consumption (Kg/Kwh)
        // Column E (4): Units Generated (Lus)
        
        const rowMonth = row[0];
        const rowPlant = (typeof row[1] === 'object' && row[1].v !== undefined) ? 
            String(row[1].v).trim() : String(row[1] || '').trim();
        const shrValue = (typeof row[2] === 'object' && row[2].v !== undefined) ? 
            parseFloat(row[2].v) : parseFloat(row[2]);
        const unitsGenerated = (typeof row[4] === 'object' && row[4].v !== undefined) ? 
            parseFloat(row[4].v) : parseFloat(row[4]);
        
        // console.log(`\nRow ${i}: Month=${rowMonth}, Plant="${rowPlant}", SHR=${shrValue}, Units=${unitsGenerated}`);
        
        // For "no consolidation" case (PSPCL), include all plants
        let plantMatches = false;
        if (plant === 'PSPCL') {
            plantMatches = true; // Include all plants for PSPCL calculation
            // console.log(`  - PSPCL mode: including all plants`);
        } else {
            plantMatches = rowPlant.toLowerCase() === plant.toLowerCase();
            // console.log(`  - Plant match check: "${rowPlant}" vs "${plant}" = ${plantMatches}`);
        }
        
        if (!plantMatches) {
            // console.log(`  - Skipping: plant doesn't match`);
            continue;
        }
        
        // Parse date from the sheet (format: 01/04/2025)
        const rowDate = parseSheetDate(rowMonth);
        // console.log(`  - Parsed row date: ${rowDate}`);
        
        if (!rowDate) {
            // console.log(`  - Skipping: couldn't parse date`);
            continue;
        }
        
        // Check if date is in range (compare month and year only)
        const rowMonthYear = new Date(rowDate.getFullYear(), rowDate.getMonth(), 1);
        const startMonthYear = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const endMonthYear = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        
        const inRange = rowMonthYear >= startMonthYear && rowMonthYear <= endMonthYear;
        // console.log(`  - Date range check: ${rowMonthYear} between ${startMonthYear} and ${endMonthYear} = ${inRange}`);
        
        if (inRange && !isNaN(shrValue) && !isNaN(unitsGenerated) && unitsGenerated > 0 && shrValue > 0) {
            totalWeightedSHR += shrValue * unitsGenerated;
            totalUnitsGenerated += unitsGenerated;
            // console.log(`  - ✓ Added to calculation: SHR=${shrValue}, Units=${unitsGenerated}`);
            // console.log(`  - Running totals: WeightedSHR=${totalWeightedSHR}, TotalUnits=${totalUnitsGenerated}`);
        } else {
            // console.log(`  - Skipping: validation failed - inRange=${inRange}, shrValue=${shrValue}, unitsGenerated=${unitsGenerated}`);
        }
    }
    
    const result = totalUnitsGenerated > 0 ? totalWeightedSHR / totalUnitsGenerated : 4.0;
    // console.log(`\n=== Final Result for ${plant} ===`);
    // console.log(`Total Weighted SHR: ${totalWeightedSHR}`);
    // console.log(`Total Units Generated: ${totalUnitsGenerated}`);
    // console.log(`Calculated SHR: ${result}`);
    // console.log(`=====================================\n`);
    
    return result; // Return weighted average or default
}

// Get weighted average SHR for coal company consolidation (all plants receiving from that coal company)
function getWeightedAverageSHRForCoalCompany(coalCompany, filteredRows) {
    if (!QualityCostData2 || QualityCostData2.length === 0) {
        // console.log("No QualityCostData2 available for coal company SHR, returning default");
        return 4.0; // Default SHR
    }
    
    let totalWeightedSHR = 0;
    let totalUnitsGenerated = 0;
    
    // Get selected month range
    const startMonth = document.getElementById('QCStartMonth').value;
    const endMonth = document.getElementById('QCEndMonth').value;
    
    if (!startMonth || !endMonth) {
        // console.log("No month range selected for coal company SHR, returning default");
        return 4.0;
    }
    
    const startDate = parseMonthYear(startMonth);
    const endDate = parseMonthYear(endMonth);
    
    // console.log(`\n=== Calculating SHR for coal company: ${coalCompany} ===`);
    
    // Get all unique plants that receive coal from this coal company from original data
    const plantsForCoalCompany = [];
    if (QualityCostData1 && QualityCostData1.length > 0) {
        for (let i = 0; i < QualityCostData1.length; i++) {
            const row = QualityCostData1[i];
            if (row && row.length >= 3) {
                const rowCoalCompany = String(row[2] || '').trim();
                const rowPlant = String(row[1] || '').trim();
                if (rowCoalCompany.toLowerCase() === coalCompany.toLowerCase()) {
                    if (!plantsForCoalCompany.includes(rowPlant)) {
                        plantsForCoalCompany.push(rowPlant);
                    }
                }
            }
        }
    }
    
    // console.log(`Plants receiving from ${coalCompany}:`, plantsForCoalCompany);
    
    // If no plants found, fallback to using plants from filtered rows
    if (plantsForCoalCompany.length === 0) {
        const fallbackPlants = [...new Set(filteredRows.map(row => row[1]))];
        plantsForCoalCompany.push(...fallbackPlants);
        // console.log(`Fallback to filtered row plants:`, plantsForCoalCompany);
    }
    
    // Find all matching records for plants receiving from this coal company
    for (let i = 0; i < QualityCostData2.length; i++) {
        const row = QualityCostData2[i];
        if (!row || row.length < 5) continue;
        
        const rowMonth = row[0];
        const rowPlant = (typeof row[1] === 'object' && row[1].v !== undefined) ? 
            String(row[1].v).trim() : String(row[1] || '').trim();
        const shrValue = (typeof row[2] === 'object' && row[2].v !== undefined) ? 
            parseFloat(row[2].v) : parseFloat(row[2]);
        const unitsGenerated = (typeof row[4] === 'object' && row[4].v !== undefined) ? 
            parseFloat(row[4].v) : parseFloat(row[4]);
        
        // Check if this plant receives coal from the specified coal company
        const plantReceivesFromCoalCompany = plantsForCoalCompany.some(plant => 
            plant.toLowerCase() === rowPlant.toLowerCase()
        );
        
        if (!plantReceivesFromCoalCompany) continue;
        
        // Parse date from the sheet
        const rowDate = parseSheetDate(rowMonth);
        if (!rowDate) continue;
        
        // Check if date is in range
        const rowMonthYear = new Date(rowDate.getFullYear(), rowDate.getMonth(), 1);
        const startMonthYear = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const endMonthYear = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        
        const inRange = rowMonthYear >= startMonthYear && rowMonthYear <= endMonthYear;
        
        if (inRange && !isNaN(shrValue) && !isNaN(unitsGenerated) && unitsGenerated > 0 && shrValue > 0) {
            totalWeightedSHR += shrValue * unitsGenerated;
            totalUnitsGenerated += unitsGenerated;
            // console.log(`  - Added: Plant=${rowPlant}, SHR=${shrValue}, Units=${unitsGenerated}`);
        }
    }
    
    const result = totalUnitsGenerated > 0 ? totalWeightedSHR / totalUnitsGenerated : 4.0;
    // console.log(`\n=== Final SHR for coal company ${coalCompany}: ${result} ===\n`);
    
    return result;
}

// Helper function to get coal consumption for a plant in a specific month
function getCoalConsumptionForPlantMonth(plant, month) {
    if (!QualityCostData1 || QualityCostData1.length === 0) return 0;
    
    for (let i = 0; i < QualityCostData1.length; i++) {
        const row = QualityCostData1[i];
        if (!row || row.length < 5) continue;
        
        const rowPlant = String(row[1] || '').trim();
        const rowMonth = row[0];
        
        if (rowPlant.toLowerCase() === plant.toLowerCase() && rowMonth === month) {
            return parseFloat(row[4]) || 0; // Qty Received column
        }
    }
    
    return 0;
}

// Main render function
function showQualityCostAnalysis() {
    console.log("Starting showQualityCostAnalysis");
    
    document.getElementById('main-content').innerHTML = `
        <!-- Main Title Card -->
        <div class="quality-cost-card mb-3">
            <div class="quality-cost-section-header">
                <h4 class="mb-0"><i class="bi bi-graph-up"></i> Coal Quality & Cost Analysis</h4>
            </div>
        </div>
        
        <!-- Data Tables Container -->
        <div id="QC-main-table"></div>
        <div id="QC-summary-table" class="mb-4"></div>

        <!-- Export Toggle Button -->
        <button class="btn btn-success export-toggle-btn" id="QCExportToggle">
            <i class="bi bi-box-arrow-up"></i>
        </button>

        <!-- Export Sidebar -->
        <div class="export-sidebar" id="QCExportSidebar">
            <button class="btn export-btn pdf-btn" id="QCExportPDFBtn" title="Export to PDF">
                <i class="bi bi-file-earmark-pdf"></i>
            </button>
            <button class="btn export-btn excel-btn" id="QCExportExcelBtn" title="Export to Excel">
                <i class="bi bi-file-earmark-excel"></i>
            </button>
            <button class="btn export-btn jpg-btn" id="QCExportImageBtn" title="Export to JPG">
                <i class="bi bi-file-earmark-image"></i>
            </button>
            <button class="btn export-btn print-btn" id="QCPrintReportBtn" title="Print">
                <i class="bi bi-printer"></i>
            </button>
            <button class="btn export-btn special-report-btn" id="QCSpecialReportBtn" title="Special Report">
                <i class="bi bi-file-earmark-bar-graph"></i>
            </button>
        </div>

        <!-- Filter Toggle Button -->
        <button class="btn btn-primary filter-toggle-btn" id="QCFilterToggle">
            <i class="bi bi-funnel"></i>
        </button>

        <!-- Filter Sidebar -->
        <div class="filter-sidebar" id="QCFilterSidebar">
            <button class="close-btn" id="QCCloseSidebar">&times;</button>
            <h5><i class="bi bi-funnel"></i> Filters & Settings</h5>
            <hr>
            
            <!-- Period Selection -->
            <div class="mb-3">
                <label class="form-label"><strong>Period Selection</strong></label>
                <div class="mb-2">
                    <label class="form-label small">Start Month</label>
                    <select class="form-select form-select-sm" id="QCStartMonth">
                        <option value="">Select Start Month</option>
                    </select>
                </div>
                <div class="mb-2">
                    <label class="form-label small">End Month</label>
                    <select class="form-select form-select-sm" id="QCEndMonth">
                        <option value="">Select End Month</option>
                    </select>
                </div>
            </div>
            <hr>

            <!-- Consolidation Options -->
            <div class="mb-3">
                <label class="form-label"><strong>Consolidation Options</strong></label>
                <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" id="QCConsolidatePlant">
                    <label class="form-check-label" for="QCConsolidatePlant">
                        Plant wise consolidation
                        <small class="d-block text-muted">Group data by individual plants</small>
                    </label>
                </div>
                <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" id="QCConsolidateCoalCompany" disabled>
                    <label class="form-check-label" for="QCConsolidateCoalCompany">
                        Coal Company wise consolidation
                        <small class="d-block text-muted">Group data by coal companies</small>
                    </label>
                </div>
            </div>
            <hr>

            <!-- Filter Options -->
            <div id="QCFilterOptions" style="display: none;">
                <div class="mb-3" id="QCPlantFilterDiv" style="display: none;">
                    <label class="form-label"><strong>Select Plants</strong></label>
                    <select class="form-select form-select-sm" id="QCPlantFilter" multiple size="4">
                    </select>
                    <small class="text-muted">Hold Ctrl to select multiple plants</small>
                </div>
                <div class="mb-3" id="QCCoalCompanyFilterDiv" style="display: none;">
                    <label class="form-label"><strong>Select Coal Companies</strong></label>
                    <select class="form-select form-select-sm" id="QCCoalCompanyFilter" multiple size="4">
                    </select>
                    <small class="text-muted">Hold Ctrl to select multiple companies</small>
                </div>
                <hr>
            </div>

            <!-- Column Selection -->
            <div class="mb-3">
                <label class="form-label"><strong>Show Columns</strong></label>
                <div class="mb-2">
                    <button type="button" class="btn btn-outline-success btn-sm me-2" id="QCSelectAllCols">
                        <i class="bi bi-check-all"></i> All
                    </button>
                    <button type="button" class="btn btn-outline-danger btn-sm" id="QCDeselectAllCols">
                        <i class="bi bi-x-circle"></i> None
                    </button>
                </div>
                <div id="QCColumnSelector" class="d-flex flex-column gap-1" style="max-height: 200px; overflow-y: auto;">
                    <!-- Column checkboxes will be populated here -->
                </div>
                
                <!-- Month-wise Display Option -->
                <div class="mt-2 pt-2 border-top">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="QCMonthWiseDisplay" onchange="QCToggleMonthWiseMode()">
                        <label class="form-check-label small" for="QCMonthWiseDisplay">
                            <i class="bi bi-calendar-month"></i> Show Month-wise Data
                        </label>
                    </div>
                    <small class="text-muted">Display data grouped by individual months</small>
                </div>
            </div>
            <hr>

            <button class="btn btn-primary w-100" id="QCApplyFilters">
                <i class="bi bi-check-circle"></i> Apply Filters
            </button>
        </div>

        <!-- Special Report Modal -->
        <div class="modal fade" id="QCSpecialReportModal" tabindex="-1" aria-labelledby="QCSpecialReportModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="QCSpecialReportModalLabel">
                            <i class="bi bi-file-earmark-bar-graph"></i> Special Report Generator
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6><i class="bi bi-calendar-range"></i> Period Selection</h6>
                                <div class="mb-3">
                                    <label class="form-label">From Date</label>
                                    <input type="month" class="form-control" id="QCSpecialFromDate">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">To Date</label>
                                    <input type="month" class="form-control" id="QCSpecialToDate">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Grouping</label>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="QCSpecialGrouping" id="QCSpecialMonthWise" value="month" checked>
                                        <label class="form-check-label" for="QCSpecialMonthWise">Month-wise</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="QCSpecialGrouping" id="QCSpecialYearWise" value="year">
                                        <label class="form-check-label" for="QCSpecialYearWise">Year-wise</label>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <h6><i class="bi bi-collection"></i> Consolidation Options</h6>
                                <div class="mb-3">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="QCSpecialPlantWise">
                                        <label class="form-check-label" for="QCSpecialPlantWise">Plant-wise consolidation</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="QCSpecialCoalCompanyWise">
                                        <label class="form-check-label" for="QCSpecialCoalCompanyWise">Coal Company-wise consolidation</label>
                                    </div>
                                </div>
                                <h6><i class="bi bi-download"></i> Export Options</h6>
                                <div class="mb-3">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="QCSpecialExportPDF" checked>
                                        <label class="form-check-label" for="QCSpecialExportPDF">Export as PDF</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="QCSpecialExportExcel" checked>
                                        <label class="form-check-label" for="QCSpecialExportExcel">Export as Excel</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Selection Filters -->
                        <div class="row mt-3">
                            <div class="col-md-4">
                                <h6><i class="bi bi-building"></i> Plant Selection</h6>
                                <div class="mb-2">
                                    <button type="button" class="btn btn-sm btn-outline-primary" id="QCSelectAllPlants">Select All</button>
                                    <button type="button" class="btn btn-sm btn-outline-secondary ms-1" id="QCDeselectAllPlants">Deselect All</button>
                                </div>
                                <div id="QCPlantSelection" class="border rounded p-2" style="max-height: 150px; overflow-y: auto;">
                                    <!-- Plant checkboxes will be populated here -->
                                </div>
                            </div>
                            <div class="col-md-4">
                                <h6><i class="bi bi-truck"></i> Coal Company Selection</h6>
                                <div class="mb-2">
                                    <button type="button" class="btn btn-sm btn-outline-primary" id="QCSelectAllCoalCompanies">Select All</button>
                                    <button type="button" class="btn btn-sm btn-outline-secondary ms-1" id="QCDeselectAllCoalCompanies">Deselect All</button>
                                </div>
                                <div id="QCCoalCompanySelection" class="border rounded p-2" style="max-height: 150px; overflow-y: auto;">
                                    <!-- Coal company checkboxes will be populated here -->
                                </div>
                            </div>
                            <div class="col-md-4">
                                <h6><i class="bi bi-table"></i> Column Selection</h6>
                                <div class="mb-2">
                                    <button type="button" class="btn btn-sm btn-outline-primary" id="QCSelectAllColumns">Select All</button>
                                    <button type="button" class="btn btn-sm btn-outline-secondary ms-1" id="QCDeselectAllColumns">Deselect All</button>
                                </div>
                                <div id="QCColumnSelection" class="border rounded p-2" style="max-height: 150px; overflow-y: auto;">
                                    <!-- Column checkboxes will be populated here -->
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="QCGenerateSpecialReport">
                            <i class="bi bi-play-circle"></i> Generate Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add unified toggle function for all cards
    window.toggleCard = function(bodyId, chevronId) {
        const body = document.getElementById(bodyId);
        const chevron = document.getElementById(chevronId);
        
        if (body.style.display === 'none') {
            body.style.display = 'block';
            chevron.classList.remove('bi-chevron-down');
            chevron.classList.add('bi-chevron-up');
        } else {
            body.style.display = 'none';
            chevron.classList.remove('bi-chevron-up');
            chevron.classList.add('bi-chevron-down');
        }
    };

    // Legacy function for backward compatibility
    window.toggleColumnSelector = function() {
        toggleCard('QCColumnSelectorBody', 'QCColumnChevron');
    };

    // Load data and initialize
    Promise.all([fetchQualityCostData1(), fetchQualityCostData2()])
        .then(() => {
            console.log("Both datasets loaded successfully");
            QCPopulateMonthDropdowns();
            QCPopulateColumnSelector();
            QCSetupListeners();
            QCAddColumnEventListeners(); // Add this after populating column selector
            QCSetupSidebar();
            QCSetupExportSidebar();
            QCRenderTables();
        })
        .catch(err => {
            console.error("Error loading data:", err);
            document.getElementById('QC-main-table').innerHTML = 
                `<div class="alert alert-danger">Error loading data: ${err.message}</div>`;
        });
}

// Populate month dropdowns - SIMPLE VERSION
function QCPopulateMonthDropdowns() {
    console.log("QCPopulateMonthDropdowns: Starting");
    
    const months = getUniqueMonths();
    console.log("QCPopulateMonthDropdowns: Got months array:", months);
    
    const startDropdown = document.getElementById('QCStartMonth');
    const endDropdown = document.getElementById('QCEndMonth');
    
    console.log("Dropdowns found:", !!startDropdown, !!endDropdown);
    
    if (!startDropdown || !endDropdown) {
        console.log("QCPopulateMonthDropdowns: Dropdown elements not found");
        return;
    }
    
    if (!months || months.length === 0) {
        console.log("QCPopulateMonthDropdowns: No months data");
        startDropdown.innerHTML = '<option value="">No data available</option>';
        endDropdown.innerHTML = '<option value="">No data available</option>';
        return;
    }
    
    // Clear existing options
    startDropdown.innerHTML = '<option value="">Select Start Month</option>';
    endDropdown.innerHTML = '<option value="">Select End Month</option>';
    
    console.log("QCPopulateMonthDropdowns: Processing", months.length, "months");
    
    // Add each month as an option
    months.forEach((month, index) => {
        console.log(`Processing month ${index}:`, month);
        const displayText = formatMonthForDisplay(month);
        console.log(`Display text for month ${index}:`, displayText);
        
        // Skip invalid months
        if (displayText === 'Invalid Date') {
            console.log(`Skipping invalid month ${index}`);
            return;
        }
        
        const option1 = document.createElement('option');
        option1.value = month;
        option1.textContent = displayText;
        startDropdown.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = month;
        option2.textContent = displayText;
        endDropdown.appendChild(option2);
        
        console.log(`Added option ${index}: ${displayText}`);
    });
    
    console.log("QCPopulateMonthDropdowns: Finished adding options");
    console.log("Start dropdown options count:", startDropdown.children.length);
    console.log("End dropdown options count:", endDropdown.children.length);
    
    // AUTO-SELECT MONTHS if we have valid options
    if (months.length > 0) {
        // Remove invalid options from our months array for selection
        const validMonths = months.filter(month => {
            const displayText = formatMonthForDisplay(month);
            return displayText !== 'Invalid Date';
        });
        
        console.log("QCPopulateMonthDropdowns: Valid months for auto-selection:", validMonths.length);
        
        if (validMonths.length > 0) {
            // Default to 2 quarters back: Jan 2025 and Mar 2025
            let defaultStartMonth = null;
            let defaultEndMonth = null;
            
            // Look for Jan 2025 (Date(2025,0,1)) and Mar 2025 (Date(2025,2,1))
            const jan2025Pattern = /Date\(2025,0,1\)/;
            const mar2025Pattern = /Date\(2025,2,1\)/;
            
            validMonths.forEach(month => {
                if (jan2025Pattern.test(month)) {
                    defaultStartMonth = month;
                }
                if (mar2025Pattern.test(month)) {
                    defaultEndMonth = month;
                }
            });
            
            // If Jan 2025 and Mar 2025 are not found, fallback to first and last available months
            if (!defaultStartMonth || !defaultEndMonth) {
                console.log("QCPopulateMonthDropdowns: Jan 2025 or Mar 2025 not found, using first and last available months");
                defaultStartMonth = validMonths[0];
                defaultEndMonth = validMonths[validMonths.length - 1];
            }
            
            console.log("QCPopulateMonthDropdowns: Auto-selecting:", defaultStartMonth, "to", defaultEndMonth);
            
            startDropdown.value = defaultStartMonth;
            endDropdown.value = defaultEndMonth;
            
            // Trigger the render after auto-selection
            console.log("QCPopulateMonthDropdowns: Triggering table render after auto-selection");
            setTimeout(() => QCRenderTables(), 100);
        }
    }
}

// Populate column selector checkboxes
function QCPopulateColumnSelector() {
    const columns = [
        { id: 'qtyDispatched', label: 'Qty. Dispatched', default: true },
        { id: 'qtyReceived', label: 'Qty. Received', default: true },
        { id: 'rakesReceived', label: 'Rakes Received', default: true },
        { id: 'transitLoss', label: 'Transit Loss (%)', default: true },
        { id: 'moisture', label: 'Moisture (%)', default: true },
        { id: 'ash', label: 'Ash (%)', default: true },
        { id: 'volatileMatter', label: 'Volatile Matter (%)', default: false },
        { id: 'fixedCarbon', label: 'Fixed Carbon (%)', default: false },
        { id: 'gcv', label: 'GCV (Kcal/Kg)', default: true },
        { id: 'coalCost', label: 'Coal Cost (Rs/MT)', default: true },
        { id: 'railwayFreight', label: 'Railway Freight (Rs/MT)', default: true },
        { id: 'distance', label: 'Distance (KMs)', default: false },
        { id: 'landedCostMT', label: 'Landed Cost (Rs/MT)', default: true },
        { id: 'landedCostMcal', label: 'Landed Cost (Rs/Mcal)', default: true },
        { id: 'perUnitCost', label: 'Per Unit Cost (Rs/kWh)', default: true },
        { id: 'totalAmount', label: 'Total Amount (Rs. Crore)', default: true }
    ];
    
    const columnSelector = document.getElementById('QCColumnSelector');
    columnSelector.innerHTML = '';
    
    columns.forEach(col => {
        const colDiv = document.createElement('div');
        colDiv.className = 'form-check';
        colDiv.innerHTML = `
            <input class="form-check-input" type="checkbox" id="QCCol_${col.id}" ${col.default ? 'checked' : ''}>
            <label class="form-check-label small" for="QCCol_${col.id}">
                ${col.label}
            </label>
        `;
        columnSelector.appendChild(colDiv);
    });
    
    // Add event listeners for select/deselect all
    document.getElementById('QCSelectAllCols').addEventListener('click', () => {
        const checkboxes = columnSelector.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = true);
        QCRenderTables();
    });
    
    document.getElementById('QCDeselectAllCols').addEventListener('click', () => {
        const checkboxes = columnSelector.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = false);
        QCRenderTables();
    });
}

// Get visible columns based on user selection
function QCGetVisibleColumns(useSpecialReportColumns = null, forMonthWiseTable = false) {
    // Always include Plant Name and Coal Company as they are essential columns
    const visibleColumns = [];
    
    // Add Month column ONLY if this is specifically for the month-wise table
    if (forMonthWiseTable) {
        visibleColumns.push({ id: 'month', header: 'Month', index: 0 });
    }
    
    // Add standard essential columns (adjust indices based on month column for month-wise table only)
    const indexOffset = forMonthWiseTable ? 1 : 0;
    visibleColumns.push(
        { id: 'plant', header: 'Plant Name', index: 1 + indexOffset },
        { id: 'coalCompany', header: 'Coal Company', index: 2 + indexOffset }
    );
    
    const selectableColumns = [
        { id: 'qtyDispatched', header: 'Qty. Dispatched (Lakh MT)', index: 3 + indexOffset },
        { id: 'qtyReceived', header: 'Qty. Received (Lakh MT)', index: 4 + indexOffset },
        { id: 'rakesReceived', header: 'Rakes Received', index: 5 + indexOffset },
        { id: 'transitLoss', header: 'Transit Loss (%)', index: 6 + indexOffset },
        { id: 'moisture', header: 'Moisture (%)', index: 7 + indexOffset },
        { id: 'ash', header: 'Ash (%)', index: 8 + indexOffset },
        { id: 'volatileMatter', header: 'Volatile Matter (%)', index: 9 + indexOffset },
        { id: 'fixedCarbon', header: 'Fixed Carbon (%)', index: 10 + indexOffset },
        { id: 'gcv', header: 'GCV (Kcal/Kg)', index: 11 + indexOffset },
        { id: 'coalCost', header: 'Coal Cost (Rs/MT)', index: 12 + indexOffset },
        { id: 'railwayFreight', header: 'Railway Freight (Rs/MT)', index: 13 + indexOffset },
        { id: 'distance', header: 'Distance (KMs)', index: 14 + indexOffset },
        { id: 'landedCostMT', header: 'Landed Cost (Rs/MT)', index: 15 + indexOffset },
        { id: 'landedCostMcal', header: 'Landed Cost (Rs/Mcal)', index: 16 + indexOffset },
        { id: 'perUnitCost', header: 'Per Unit Cost (Rs/kWh)', index: 17 + indexOffset },
        { id: 'totalAmount', header: 'Total Amount (Rs. Crore)', index: 18 + indexOffset }
    ];
    
    // Debug: Log checkbox selection status
    console.log('QCGetVisibleColumns - Checking column selections:');
    console.log('useSpecialReportColumns parameter:', useSpecialReportColumns);
    
    // Determine which column selection system to use
    const specialReportColumns = document.querySelectorAll('.column-checkbox');
    const shouldUseSpecialReport = useSpecialReportColumns === true || 
                                   (useSpecialReportColumns === null && specialReportColumns.length > 0);
    
    if (shouldUseSpecialReport && specialReportColumns.length > 0) {
        console.log("Using Special Report column selections");
        const selectedColumnKeys = Array.from(document.querySelectorAll('.column-checkbox:checked')).map(cb => cb.value);
        console.log("Selected column keys from Special Report:", selectedColumnKeys);
        
        // Create mapping between Special Report keys and selectableColumns IDs
        const keyMapping = {
            'Date': null, // Date is not in selectableColumns (it's always included in data)
            'Plant': null, // Plant Name is always included
            'Coal Company': null, // Coal Company is always included
            'Qty Dispatched (MT)': 'qtyDispatched',
            'Qty Received (MT)': 'qtyReceived', 
            'Rakes Received': 'rakesReceived',
            'Transit Loss %': 'transitLoss',
            'Moisture %': 'moisture',
            'Ash %': 'ash',
            'Volatile Matter %': 'volatileMatter',
            'Fixed Carbon %': 'fixedCarbon',
            'GCV (Kcal/Kg)': 'gcv',
            'Coal Cost (Rs/MT)': 'coalCost',
            'Railway Freight (Rs/MT)': 'railwayFreight',
            'Distance (KMs)': 'distance',
            'Landed Cost Rs/MT': 'landedCostMT',
            'Landed Cost Rs/Mcal': 'landedCostMcal',
            'Per Unit Cost': 'perUnitCost',
            'Total Amount (Rs. Crore)': 'totalAmount'
        };
        
        // Add selected columns to the visible columns using mapping
        selectableColumns.forEach(col => {
            // Find the Special Report key that maps to this column ID
            const specialReportKey = Object.keys(keyMapping).find(key => keyMapping[key] === col.id);
            if (specialReportKey && selectedColumnKeys.includes(specialReportKey)) {
                visibleColumns.push(col);
                console.log(`Adding column ${col.id}: ${col.header} (mapped from "${specialReportKey}")`);
            }
        });
    } else {
        console.log("Using regular column selections (QCCol_ checkboxes)");
        // Add selected columns to the visible columns (original logic)
        selectableColumns.forEach(col => {
            const checkbox = document.getElementById(`QCCol_${col.id}`);
            const isChecked = checkbox && checkbox.checked;
            console.log(`Column ${col.id}: checkbox found = ${!!checkbox}, checked = ${isChecked}`);
            
            if (checkbox && checkbox.checked) {
                visibleColumns.push(col);
            }
        });
    }
    
    console.log('Final visible columns:', visibleColumns.map(col => col.header));
    return visibleColumns;
}

// Setup event listeners
function QCSetupListeners() {
    document.getElementById('QCStartMonth').addEventListener('change', QCRenderTables);
    document.getElementById('QCEndMonth').addEventListener('change', QCRenderTables);
    document.getElementById('QCConsolidatePlant').addEventListener('change', QCToggleFilters);
    document.getElementById('QCConsolidateCoalCompany').addEventListener('change', QCToggleFilters);
    document.getElementById('QCPlantFilter').addEventListener('change', QCRenderTables);
    document.getElementById('QCCoalCompanyFilter').addEventListener('change', QCRenderTables);
    
    // Apply filters button
    document.getElementById('QCApplyFilters').addEventListener('click', function() {
        QCRenderTables();
    });
    
    // Add event listeners for export functionality
    QCSetupExportListeners();
    
    // Add event listeners for column checkboxes (called after populating)
    QCAddColumnEventListeners();
}

// Sidebar setup function
function QCSetupSidebar() {
    const sidebar = document.getElementById('QCFilterSidebar');
    const toggleBtn = document.getElementById('QCFilterToggle');
    const closeBtn = document.getElementById('QCCloseSidebar');

    // Toggle sidebar
    toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('open');
    });

    // Close sidebar
    closeBtn.addEventListener('click', function() {
        sidebar.classList.remove('open');
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', function(event) {
        if (!sidebar.contains(event.target) && !toggleBtn.contains(event.target)) {
            sidebar.classList.remove('open');
        }
    });
}

// Export sidebar setup function
function QCSetupExportSidebar() {
    const exportSidebar = document.getElementById('QCExportSidebar');
    const exportToggle = document.getElementById('QCExportToggle');

    // Toggle export sidebar
    exportToggle.addEventListener('click', function() {
        exportSidebar.classList.toggle('open');
    });

    // Close export sidebar when clicking outside
    document.addEventListener('click', function(event) {
        if (!exportSidebar.contains(event.target) && !exportToggle.contains(event.target)) {
            exportSidebar.classList.remove('open');
        }
    });
}

// Setup export functionality event listeners
function QCSetupExportListeners() {
    // PDF Export
    document.getElementById('QCExportPDFBtn').addEventListener('click', () => {
        if (typeof QCExportToPDF === 'function') {
            QCShowLoadingState('QCExportPDFBtn', 'Generating PDF...');
            setTimeout(() => {
                try {
                    QCGeneratePDFFromScratch();
                } catch (error) {
                    console.error("PDF export error:", error);
                    alert(`Error generating PDF: ${error.message}`);
                } finally {
                    QCHideLoadingState('QCExportPDFBtn', '<i class="bi bi-file-earmark-pdf"></i>');
                }
            }, 100);
        } else {
            alert("PDF export functionality is not available. Please ensure CoalQualityPDF.js is loaded.");
        }
    });
    
    // Excel Export
    document.getElementById('QCExportExcelBtn').addEventListener('click', () => {
        if (typeof QCExportToExcel === 'function') {
            QCShowLoadingState('QCExportExcelBtn', 'Generating Excel...');
            setTimeout(() => {
                try {
                    QCExportToExcel();
                } catch (error) {
                    console.error("Excel export error:", error);
                    alert(`Error generating Excel file: ${error.message}`);
                } finally {
                    QCHideLoadingState('QCExportExcelBtn', '<i class="bi bi-file-earmark-excel"></i>');
                }
            }, 100);
        } else {
            alert("Excel export functionality is not available. Please ensure XLSX library is loaded.");
        }
    });
    
    // Image Export (JPG)
    document.getElementById('QCExportImageBtn').addEventListener('click', () => {
        QCShowLoadingState('QCExportImageBtn', 'Generating Image...');
        setTimeout(() => {
            try {
                QCExportToImage();
            } catch (error) {
                console.error("Image export error:", error);
                alert(`Error generating image: ${error.message}`);
            } finally {
                QCHideLoadingState('QCExportImageBtn', '<i class="bi bi-file-earmark-image"></i>');
            }
        }, 100);
    });
    
    // Print Report
    document.getElementById('QCPrintReportBtn').addEventListener('click', () => {
        if (typeof QCPrintReport === 'function') {
            QCPrintReport();
        } else {
            window.print();
        }
    });
    
    // Special Report
    document.getElementById('QCSpecialReportBtn').addEventListener('click', () => {
        QCShowSpecialReportModal();
    });
}

// Helper functions for loading states
function QCShowLoadingState(buttonId, loadingText) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = `<i class="bi bi-hourglass-split"></i>`;
        button.disabled = true;
    }
}

function QCHideLoadingState(buttonId, originalText) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.innerHTML = originalText || button.dataset.originalText || button.innerHTML;
        button.disabled = false;
        delete button.dataset.originalText;
    }
}

// Add event listeners to column checkboxes
function QCAddColumnEventListeners() {
    const columnCheckboxes = document.querySelectorAll('#QCColumnSelector input[type="checkbox"]');
    columnCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', QCRenderTables);
    });
}

// Toggle filter visibility and populate options
function QCToggleFilters() {
    const consolidatePlant = document.getElementById('QCConsolidatePlant').checked;
    const consolidateCoalCompany = document.getElementById('QCConsolidateCoalCompany').checked;
    
    const filterOptionsDiv = document.getElementById('QCFilterOptions');
    const plantFilterDiv = document.getElementById('QCPlantFilterDiv');
    const coalCompanyFilterDiv = document.getElementById('QCCoalCompanyFilterDiv');
    const coalCompanyCheckbox = document.getElementById('QCConsolidateCoalCompany');
    
    // Enable/disable coal company checkbox based on plant checkbox
    if (consolidatePlant) {
        coalCompanyCheckbox.disabled = false;
    } else {
        coalCompanyCheckbox.disabled = true;
        coalCompanyCheckbox.checked = false; // Uncheck when disabled
        coalCompanyFilterDiv.style.display = 'none'; // Hide filter div when disabled
    }
    
    if (consolidatePlant || consolidateCoalCompany) {
        filterOptionsDiv.style.display = 'block';
        
        if (consolidatePlant) {
            plantFilterDiv.style.display = 'block';
            QCPopulatePlantFilter();
        } else {
            plantFilterDiv.style.display = 'none';
        }
        
        if (consolidateCoalCompany && consolidatePlant) {
            coalCompanyFilterDiv.style.display = 'block';
            QCPopulateCoalCompanyFilter();
        } else {
            coalCompanyFilterDiv.style.display = 'none';
        }
    } else {
        filterOptionsDiv.style.display = 'none';
    }
    
    QCRenderTables();
}

// Toggle month-wise display mode
function QCToggleMonthWiseMode() {
    const monthWiseDisplay = document.getElementById('QCMonthWiseDisplay').checked;
    const consolidatePlantCheckbox = document.getElementById('QCConsolidatePlant');
    const consolidateCoalCompanyCheckbox = document.getElementById('QCConsolidateCoalCompany');
    
    if (monthWiseDisplay) {
        // When month-wise is enabled, disable consolidation options
        if (consolidatePlantCheckbox.checked) {
            consolidatePlantCheckbox.checked = false;
        }
        if (consolidateCoalCompanyCheckbox.checked) {
            consolidateCoalCompanyCheckbox.checked = false;
        }
        
        // Update filter visibility
        QCToggleFilters();
        
        console.log("Month-wise display enabled - consolidation options disabled");
    } else {
        console.log("Month-wise display disabled - consolidation options re-enabled");
    }
    
    // Re-render tables
    QCRenderTables();
}

// Populate plant filter dropdown
function QCPopulatePlantFilter() {
    const plants = new Set();
    
    QualityCostData1.forEach(row => {
        if (row[1]) { // Plant name in column B
            plants.add(row[1]);
        }
    });
    
    const plantFilter = document.getElementById('QCPlantFilter');
    plantFilter.innerHTML = '';
    
    Array.from(plants).sort().forEach(plant => {
        const option = document.createElement('option');
        option.value = plant;
        option.textContent = plant;
        option.selected = true; // Select all by default
        plantFilter.appendChild(option);
    });
}

// Populate coal company filter dropdown
function QCPopulateCoalCompanyFilter() {
    const coalCompanies = [];
    
    QualityCostData1.forEach(row => {
        if (row[2] && !coalCompanies.includes(row[2])) { // Coal company in column C, avoid duplicates
            coalCompanies.push(row[2]);
        }
    });
    
    const coalCompanyFilter = document.getElementById('QCCoalCompanyFilter');
    coalCompanyFilter.innerHTML = '';
    
    coalCompanies.forEach(company => {
        const option = document.createElement('option');
        option.value = company;
        option.textContent = company;
        option.selected = true; // Select all by default
        coalCompanyFilter.appendChild(option);
    });
}

// Filter data by month range
function QCFilterDataByMonth(data) {
    const startMonth = document.getElementById('QCStartMonth').value;
    const endMonth = document.getElementById('QCEndMonth').value;
    
    if (!startMonth || !endMonth) {
        return data;
    }
    
    const startDate = parseMonthYear(startMonth);
    const endDate = parseMonthYear(endMonth);
    
    if (!startDate || !endDate) {
        return data;
    }
    
    return data.filter(row => {
        const rowDate = parseMonthYear(row[0]);
        return rowDate && rowDate >= startDate && rowDate <= endDate;
    });
}

// Filter data to hide RCR Mode and Imported rows unless coal company consolidation is selected
function QCFilterRCRAndImported(data) {
    const consolidateCoalCompany = document.getElementById('QCConsolidateCoalCompany').checked;
    
    // If coal company consolidation is not selected, hide RCR Mode and Imported rows
    if (!consolidateCoalCompany) {
        return data.filter(row => {
            const coalCompany = row[2]; // Coal company is in column C (index 2)
            return coalCompany !== 'RCR Mode' && coalCompany !== 'Imported';
        });
    }
    
    // If coal company consolidation is selected, show all rows
    return data;
}

// Consolidate data based on selected options
function QCConsolidateData(filteredData) {
    const consolidatePlant = document.getElementById('QCConsolidatePlant').checked;
    const consolidateCoalCompany = document.getElementById('QCConsolidateCoalCompany').checked;
    
    // Get selected filters
    const selectedPlants = Array.from(document.getElementById('QCPlantFilter').selectedOptions).map(option => option.value);
    const selectedCoalCompanies = Array.from(document.getElementById('QCCoalCompanyFilter').selectedOptions).map(option => option.value);
    
    // Filter data based on selections
    let dataToProcess = filteredData;
    
    if (consolidatePlant && selectedPlants.length > 0) {
        dataToProcess = dataToProcess.filter(row => selectedPlants.includes(row[1]));
    }
    
    if (consolidateCoalCompany && selectedCoalCompanies.length > 0) {
        dataToProcess = dataToProcess.filter(row => selectedCoalCompanies.includes(row[2]));
    }
    
    const grouped = {};
    const groupOrder = []; // Track order of groups as they first appear
    
    dataToProcess.forEach((row, index) => {
        let key = '';
        let plantName = '';
        let coalCompany = '';
        
        if (!consolidatePlant && !consolidateCoalCompany) {
            // No consolidation: Show PSPCL in plant column, individual coal companies
            key = row[2]; // Group by coal company
            plantName = 'PSPCL';
            coalCompany = row[2];
        } else if (consolidatePlant && consolidateCoalCompany) {
            // Both selected: group by plant-coalcompany combination
            key = `${row[1]} | ${row[2]}`;
            plantName = row[1];
            coalCompany = row[2];
        } else if (consolidateCoalCompany && !consolidatePlant) {
            // Coal company only: group by coal company
            key = row[2];
            plantName = 'PSPCL'; // Merged PSPCL in plant column
            coalCompany = row[2]; // Coal company name in coal company column
        } else if (consolidatePlant && !consolidateCoalCompany) {
            // Plant only: group by plant - show "All Sources" for coal company
            key = row[1];
            plantName = row[1];
            coalCompany = 'All Sources';
        }
        
        if (!grouped[key]) {
            grouped[key] = {
                rows: [],
                plantName: plantName,
                coalCompany: coalCompany
            };
            // Track the order of first appearance
            groupOrder.push(key);
        }
        grouped[key].rows.push(row);
    });
    
    // Aggregate grouped data in the order they first appeared
    return groupOrder.map(key => {
        const groupData = grouped[key];
        return createAggregatedRow(groupData);
    });
}

// Helper function to create aggregated row
function createAggregatedRow(groupData) {
    const rows = groupData.rows;
    const aggregated = new Array(QualityCostHeaders1.length).fill('');
    
    // Set the consolidated key information
    const startMonth = document.getElementById('QCStartMonth').value;
    const endMonth = document.getElementById('QCEndMonth').value;
    const periodDisplay = startMonth && endMonth ? 
        `${formatMonthForDisplay(startMonth)} to ${formatMonthForDisplay(endMonth)}` : 
        'Selected Period';
    
    aggregated[0] = periodDisplay; // Period for internal use
    aggregated[1] = groupData.plantName; // Plant Name or Coal Company
    aggregated[2] = groupData.coalCompany; // Coal Company (empty for coal company consolidation)
    
    // Sum columns D (3), E (4), F (5) - Qty Dispatched, Qty Received, Rakes Received
    [3, 4, 5].forEach(colIdx => {
        aggregated[colIdx] = rows.reduce((sum, row) => {
            return sum + (parseFloat(row[colIdx]) || 0);
        }, 0);
    });
    
    // Calculate Transit Loss (G) = (1 - Qty Received / Qty Dispatched) * 100
    const qtyDispatched = parseFloat(aggregated[3]) || 0;
    const qtyReceived = parseFloat(aggregated[4]) || 0;
    aggregated[6] = qtyDispatched > 0 ? (((qtyDispatched - qtyReceived) / qtyDispatched) * 100).toFixed(2) : 0;
    
    // Weighted average for columns H to N (7-13) w.r.t. Quantity Received
    for (let colIdx = 7; colIdx <= 13; colIdx++) {
        const values = rows.map(row => row[colIdx]);
        const weights = rows.map(row => row[4]); // Qty Received as weight
        aggregated[colIdx] = calculateWeightedAverage(values, weights).toFixed(2);
    }
    
    // Simple average for column O (14) - non-zero values only
    const columnOValues = rows.map(row => row[14]);
    aggregated[14] = calculateSimpleAverage(columnOValues).toFixed(2);
    
    return aggregated;
}

// Helper function to calculate total/summary row for a group of data rows
function QCCalculateTotalRow(dataRows, label, visibleColumns) {
    if (!dataRows || dataRows.length === 0) return null;
    
    // Initialize totals
    const totalRow = [];
    
    // Set label (Plant name or "Grand Total")
    totalRow[1] = label;
    totalRow[2] = ''; // Empty coal company column for totals
    
    // Sum columns that should be totaled (Qty Dispatched, Qty Received, Rakes Received)
    [3, 4, 5].forEach(colIdx => {
        totalRow[colIdx] = dataRows.reduce((sum, row) => {
            return sum + (parseFloat(row[colIdx]) || 0);
        }, 0);
    });
    
    // Calculate Transit Loss for total
    const qtyDispatched = parseFloat(totalRow[3]) || 0;
    const qtyReceived = parseFloat(totalRow[4]) || 0;
    totalRow[6] = qtyDispatched > 0 ? (((qtyDispatched - qtyReceived) / qtyDispatched) * 100) : 0;
    
    // Calculate weighted averages for columns 7-13 w.r.t. Quantity Received
    for (let colIdx = 7; colIdx <= 13; colIdx++) {
        const values = dataRows.map(row => row[colIdx]);
        const weights = dataRows.map(row => row[4]); // Qty Received as weight
        totalRow[colIdx] = calculateWeightedAverage(values, weights);
    }
    
    // Simple average for column 14 (Distance)
    const columnOValues = dataRows.map(row => row[14]);
    totalRow[14] = calculateSimpleAverage(columnOValues);
    
    // Add individual rows for calculated column calculations
    totalRow.individualRows = dataRows;
    
    return totalRow;
}

// Helper function to render a total row
function QCRenderTotalRow(totalRowData, visibleColumns, label, cssClass = 'table-warning total-row') {
    if (!totalRowData) return '';
    
    let html = `<tr class="${cssClass} fw-bold">`;
    
    visibleColumns.forEach(col => {
        let value = '';
        let cellClass = 'text-center';
        
        if (col.index === 1) {
            // Plant/Label column - apply plant name shortening
            const shortenedLabel = shortenPlantName(label);
            value = `<strong>${shortenedLabel}</strong>`;
        } else if (col.index === 2) {
            // Coal Company column
            value = totalRowData[2] || '';
        } else if (col.index <= 14) {
            // Original data columns
            if (totalRowData[col.index] !== undefined) {
                const val = parseFloat(totalRowData[col.index]);
                if (!isNaN(val)) {
                    if (col.index === 3 || col.index === 4) { // Qty columns - 4 decimals
                        value = val.toFixed(4);
                    } else if (col.index === 5) { // Rakes
                        value = Math.round(val);
                    } else if (col.index === 11 || col.index === 12 || col.index === 13) { // GCV, Coal Cost, Railway Freight - 0 decimals
                        value = Math.round(val);
                    } else if (col.index >= 6) { // Percentages and other costs
                        value = val.toFixed(2);
                    }
                } else {
                    value = '&nbsp;';
                }
            } else {
                value = '&nbsp;';
            }
        } else {
            // Extended/calculated columns - these need special calculation
            switch (col.index) {
                case 15: // Landed Cost Rs/MT - weighted average based on quantity received
                    if (totalRowData.individualRows && totalRowData.individualRows.length > 0) {
                        const values = totalRowData.individualRows.map(row => {
                            const coalCost = parseFloat(row[12]) || 0;
                            const railwayFreight = parseFloat(row[13]) || 0;
                            return coalCost + railwayFreight;
                        });
                        const weights = totalRowData.individualRows.map(row => parseFloat(row[4]) || 0); // Qty Received
                        value = calculateWeightedAverage(values, weights).toFixed(0);
                    } else {
                        // Fallback to simple calculation
                        const coalCost = parseFloat(totalRowData[12]) || 0;
                        const railwayFreight = parseFloat(totalRowData[13]) || 0;
                        value = (coalCost + railwayFreight).toFixed(0);
                    }
                    cellClass += ' qc-calculated-col';
                    break;
                case 16: // Landed Cost Rs/Mcal - weighted average based on quantity received
                    if (totalRowData.individualRows && totalRowData.individualRows.length > 0) {
                        const values = totalRowData.individualRows.map(row => {
                            const coalCost = parseFloat(row[12]) || 0;
                            const railwayFreight = parseFloat(row[13]) || 0;
                            const gcv = parseFloat(row[11]) || 1;
                            const landedCostPerMT = coalCost + railwayFreight;
                            return gcv > 0 ? landedCostPerMT / gcv : 0;
                        });
                        const weights = totalRowData.individualRows.map(row => parseFloat(row[4]) || 0); // Qty Received
                        value = calculateWeightedAverage(values, weights).toFixed(4);
                    } else {
                        // Fallback to simple calculation
                        const coalCost2 = parseFloat(totalRowData[12]) || 0;
                        const railwayFreight2 = parseFloat(totalRowData[13]) || 0;
                        const gcv = parseFloat(totalRowData[11]) || 1;
                        const landedCostPerMT = coalCost2 + railwayFreight2;
                        value = gcv > 0 ? (landedCostPerMT / gcv).toFixed(4) : '0.0000';
                    }
                    cellClass += ' qc-calculated-col';
                    break;
                case 17: // Per Unit Cost - weighted average based on quantity received
                    if (totalRowData.individualRows && totalRowData.individualRows.length > 0) {
                        const plant3 = totalRowData[1];
                        const shr3 = (plant3 === 'Grand Total') ? 
                            getWeightedAverageSHRForPlant('PSPCL') : 
                            getWeightedAverageSHRForPlant(plant3);
                        
                        const values = totalRowData.individualRows.map(row => {
                            const coalCost = parseFloat(row[12]) || 0;
                            const railwayFreight = parseFloat(row[13]) || 0;
                            const gcv = parseFloat(row[11]) || 1;
                            const landedCostPerMT = coalCost + railwayFreight;
                            const landedCostPerMcal = gcv > 0 ? landedCostPerMT / gcv : 0;
                            return shr3 * landedCostPerMcal / 1000;
                        });
                        const weights = totalRowData.individualRows.map(row => parseFloat(row[4]) || 0); // Qty Received
                        value = calculateWeightedAverage(values, weights).toFixed(3);
                    } else {
                        // Fallback to simple calculation
                        const coalCost3 = parseFloat(totalRowData[12]) || 0;
                        const railwayFreight3 = parseFloat(totalRowData[13]) || 0;
                        const gcv3 = parseFloat(totalRowData[11]) || 1;
                        const landedCostPerMT3 = coalCost3 + railwayFreight3;
                        const landedCostPerMcal3 = gcv3 > 0 ? landedCostPerMT3 / gcv3 : 0;
                        const plant3 = totalRowData[1];
                        const shr3 = (plant3 === 'Grand Total') ? 
                            getWeightedAverageSHRForPlant('PSPCL') : 
                            getWeightedAverageSHRForPlant(plant3);
                        value = (shr3 * landedCostPerMcal3 / 1000).toFixed(3);
                    }
                    cellClass += ' qc-calculated-col';
                    break;
                case 18: // Total Amount (Rs. Crore) - sum of individual row total amounts
                    if (totalRowData.individualRows && totalRowData.individualRows.length > 0) {
                        const totalAmount = totalRowData.individualRows.reduce((sum, row) => {
                            const qtyReceived = parseFloat(row[4]) || 0; // Qty Received in Lakh MT
                            const coalCost = parseFloat(row[12]) || 0;
                            const railwayFreight = parseFloat(row[13]) || 0;
                            const landedCostPerMT = coalCost + railwayFreight;
                            const rowTotalAmount = (qtyReceived * landedCostPerMT) / 100; // Convert to crores
                            return sum + rowTotalAmount;
                        }, 0);
                        value = totalAmount.toFixed(2);
                    } else {
                        // Fallback to simple calculation
                        const qtyReceived = parseFloat(totalRowData[4]) || 0;
                        const coalCost = parseFloat(totalRowData[12]) || 0;
                        const railwayFreight = parseFloat(totalRowData[13]) || 0;
                        const landedCostPerMT = coalCost + railwayFreight;
                        const totalAmount = (qtyReceived * landedCostPerMT) / 100;
                        value = totalAmount.toFixed(2);
                    }
                    cellClass += ' qc-calculated-col';
                    break;
                default:
                    value = '&nbsp;';
            }
        }
        
        html += `<td class="${cellClass}">${value}</td>`;
    });
    
    html += '</tr>';
    return html;
}

// Function to shorten plant names for better table display
function shortenPlantName(plantName) {
    if (!plantName || plantName === '&nbsp;') return plantName;
    
    const plantNameStr = String(plantName).trim();
    
    // Apply shortening rules
    if (plantNameStr.includes('GGSSTP') && plantNameStr.includes('Ropar')) {
        return 'GGSSTP';
    } else if (plantNameStr.includes('GHTP') && plantNameStr.includes('Lehra')) {
        return 'GHTP';
    } else if (plantNameStr.includes('GVK') && plantNameStr.includes('Goindwal')) {
        return 'GATP';
    }
    
    // Return original name if no shortening rule applies
    return plantNameStr;
}

// Helper function to render table cells based on visible columns
function QCRenderTableCells(row, visibleColumns, extendedData = {}) {
    let html = '';
    
    // Check if this column set includes a month column (for offset calculation)
    const hasMonthColumn = visibleColumns.some(col => col.id === 'month');
    
    visibleColumns.forEach(col => {
        let value = '';
        
        // Check if this is the month column (index 0)
        if (col.id === 'month') {
            // Month column - show as-is
            value = row[col.index] !== undefined && row[col.index] !== '' ? row[col.index] : '&nbsp;';
        } else if (col.index <= 14) {
            // Original data columns (adjusted for month column if present)
            value = row[col.index] !== undefined && row[col.index] !== '' ? row[col.index] : '&nbsp;';
            
            // Apply plant name shortening for plant name column
            if (col.id === 'plant') {
                value = shortenPlantName(value);
            }
            
            // Format numbers for better display (skip month, plant, and coal company columns)
            if (col.index >= 3 && col.index <= 14 && !isNaN(parseFloat(value))) {
                const baseIndex = col.index - (hasMonthColumn ? 1 : 0);
                
                if (baseIndex === 3 || baseIndex === 4) { // Qty columns - 4 decimals
                    value = parseFloat(value).toFixed(4);
                } else if (baseIndex === 5) { // Rakes
                    value = Math.round(parseFloat(value));
                } else if (baseIndex === 11 || baseIndex === 12 || baseIndex === 13) { // GCV, Coal Cost, Railway Freight - 0 decimals
                    value = Math.round(parseFloat(value));
                } else if (baseIndex >= 6) { // Percentages and other costs
                    value = parseFloat(value).toFixed(2);
                }
            }
        } else {
            // Extended/calculated columns
            const baseIndex = col.index - (hasMonthColumn ? 1 : 0);
            switch (baseIndex) {
                case 15: // Landed Cost Rs/MT
                    value = extendedData.landedCostPerMT ? extendedData.landedCostPerMT.toFixed(0) : '&nbsp;';
                    break;
                case 16: // Landed Cost Rs/Mcal
                    value = extendedData.landedCostPerMcal ? extendedData.landedCostPerMcal.toFixed(4) : '&nbsp;';
                    break;
                case 17: // Per Unit Cost - 3 decimals
                    value = extendedData.perUnitCost ? extendedData.perUnitCost.toFixed(3) : '&nbsp;';
                    break;
                case 18: // Total Amount (Rs. Crore)
                    value = extendedData.totalAmount ? extendedData.totalAmount.toFixed(2) : '&nbsp;';
                    break;
            }
        }
        
        // Add special classes for calculated columns
        let cellClass = 'text-center';
        if (col.index >= 15) cellClass += ' qc-calculated-col';
        
        html += `<td class="${cellClass}">${value}</td>`;
    });
    
    return html;
}

// Render main analysis table
function QCRenderMainTable(processedData) {
    if (!processedData || processedData.length === 0) {
        return '<div class="alert alert-info">No data available for the selected period.</div>';
    }
    
    // Get visible columns based on user selection - NEVER include month column for main table
    const visibleColumns = QCGetVisibleColumns(false, false);
    
    // Generate dynamic table header
    const startMonth = document.getElementById('QCStartMonth').value;
    const endMonth = document.getElementById('QCEndMonth').value;
    
    let periodText = '';
    if (startMonth && endMonth) {
        const startDisplay = formatMonthForDisplay(startMonth);
        const endDisplay = formatMonthForDisplay(endMonth);
        
        if (startDisplay === endDisplay) {
            periodText = `during ${startDisplay}`;
        } else {
            periodText = `from ${startDisplay} to ${endDisplay}`;
        }
    } else {
        periodText = 'for selected period';
    }
    
    // Main table header should NEVER mention month-wise - it's always consolidated
    const tableHeader = `Details of coal received at PSPCL thermal power stations from all linked sources ${periodText}`;
    
    let html = `
        <div class="table-responsive ">
            <table class="table table-hover table-sm table-fixed-first ">
                <thead class="table-primary">
                    <tr>
    `;
    
    // Only show headers for visible columns
    visibleColumns.forEach(col => {
        html += `<th class="text-center">${col.header}</th>`;
    });
    
    html += `</tr></thead><tbody>`;
    
    // Group data for merged cells when no consolidation is selected
    const consolidatePlant = document.getElementById('QCConsolidatePlant').checked;
    const consolidateCoalCompany = document.getElementById('QCConsolidateCoalCompany').checked;
    const noConsolidation = !consolidatePlant && !consolidateCoalCompany;
    
    // MAIN TABLE SHOULD NEVER USE MONTH-WISE RENDERING - always use normal consolidation logic
    if (noConsolidation) {
        // For no consolidation, merge PSPCL and SHR cells
        let psppclRowCount = processedData.length;
        
        // Calculate SHR once for all rows (since it's the same for PSPCL)
        const psppclSHR = getWeightedAverageSHRForPlant('PSPCL');
        
        processedData.forEach((row, index) => {
            // Determine row type for visual merging
            const isFirstRow = index === 0;
            const isLastRow = index === psppclRowCount - 1;
            
            // Build row classes for visual merging (PSPCL is typically plant-group-1)
            let rowClasses = ['plant-group-1'];
            if (isFirstRow) {
                rowClasses.push('plant-group-first');
            } else {
                rowClasses.push('plant-group-continuation');
            }
            if (isLastRow) {
                rowClasses.push('plant-group-last');
            }
            
            html += `<tr class="${rowClasses.join(' ')}">`;
            
            const coalCost = parseFloat(row[12]) || 0;
            const railwayFreight = parseFloat(row[13]) || 0;
            const gcv = parseFloat(row[11]) || 1;
            
            // Prepare extended data
            const landedCostPerMT = coalCost + railwayFreight;
            const landedCostPerMcal = gcv > 0 ? landedCostPerMT / gcv : 0;
            const perUnitCost = psppclSHR * landedCostPerMcal / 1000;
            
            // Calculate Total Amount (Rs. Crore)
            const qtyReceived = parseFloat(row[4]) || 0; // Qty Received in Lakh MT
            const totalAmount = (qtyReceived * landedCostPerMT) / 100; // Convert to crores
            
            const extendedData = {
                shr: psppclSHR,
                landedCostPerMT: landedCostPerMT,
                landedCostPerMcal: landedCostPerMcal,
                perUnitCost: perUnitCost,
                totalAmount: totalAmount
            };
            
            // Handle visual merging for Plant Name
            visibleColumns.forEach(col => {
                if (col.index === 1) {
                    // Plant Name - show only in first row, empty in continuation rows
                    if (isFirstRow) {
                        html += `<td class="text-center align-middle">PSPCL</td>`;
                    } else {
                        // Empty cell for visual merging (but cell exists for sticky positioning)
                        html += `<td class="text-center align-middle"></td>`;
                    }
                } else {
                    // Other columns
                    let value = '';
                    
                    if (col.index <= 14) {
                        value = row[col.index] !== undefined && row[col.index] !== '' ? row[col.index] : '&nbsp;';
                        
                        // Apply plant name shortening for column 1 (plant name)
                        if (col.index === 1) {
                            value = shortenPlantName(value);
                        }
                        
                        // Format numbers
                        if (col.index >= 3 && col.index <= 14 && !isNaN(parseFloat(value))) {
                            if (col.index === 3 || col.index === 4) { // Qty columns - 4 decimals
                                value = parseFloat(value).toFixed(4);
                            } else if (col.index === 5) {
                                value = Math.round(parseFloat(value));
                            } else if (col.index === 11 || col.index === 12 || col.index === 13) { // GCV, Coal Cost, Railway Freight - 0 decimals
                                value = Math.round(parseFloat(value));
                            } else if (col.index >= 6) {
                                value = parseFloat(value).toFixed(2);
                            }
                        }
                    } else {
                        // Extended columns
                        switch (col.index) {
                            case 15:
                                value = landedCostPerMT.toFixed(0);
                                break;
                            case 16:
                                value = landedCostPerMcal.toFixed(4);
                                break;
                            case 17:
                                value = perUnitCost.toFixed(3);
                                break;
                            case 18:
                                // Total Amount (Rs. Crore) = Qty Received * Landed Cost (Rs/MT) / 10000000
                                const qtyReceived = parseFloat(row[4]) || 0; // Qty Received in Lakh MT
                                const totalAmount = (qtyReceived * landedCostPerMT) / 100; // Convert Lakh MT to MT (multiply by 100000) then divide by 10000000 for crore = divide by 100
                                value = totalAmount.toFixed(2);
                                break;
                        }
                    }
                    
                    let cellClass = 'text-center';
                    if (col.index >= 15) cellClass += ' qc-calculated-col';
                    
                    html += `<td class="${cellClass}">${value}</td>`;
                }
            });
            
            html += '</tr>';
        });
        
        // Add Grand Total row for no consolidation only if there are multiple coal companies
        const uniqueCoalCompanies = [...new Set(processedData.map(row => row[2]))];
        if (uniqueCoalCompanies.length > 1) {
            const grandTotalRow = QCCalculateTotalRow(processedData, 'Grand Total', visibleColumns);
            html += QCRenderTotalRow(grandTotalRow, visibleColumns, 'Grand Total', 'table-success calculated-total-row');
        }
        
    } else {
        // Normal rendering for consolidated data
        
        // Check if both plant and coal company consolidation are selected for merging
        const bothConsolidated = consolidatePlant && consolidateCoalCompany;
        
        if (bothConsolidated) {
            // Group data by plant for merging cells, preserving order
            const plantGroups = {};
            const plantOrder = []; // Track order of plants as they first appear
            
            processedData.forEach((row, index) => {
                const plantName = row[1];
                if (!plantGroups[plantName]) {
                    plantGroups[plantName] = [];
                    plantOrder.push(plantName); // Track order of first appearance
                }
                plantGroups[plantName].push({ row, originalIndex: index });
            });
            
            // Render with visual merging (no rowspan) - plant names and SHR in the correct order
            let plantGroupIndex = 0;
            plantOrder.forEach(plantName => {
                const plantData = plantGroups[plantName];
                const plantRowCount = plantData.length;
                const plantColorClass = `plant-group-${(plantGroupIndex % 8) + 1}`;
                
                plantData.forEach((item, plantIndex) => {
                    const row = item.row;
                    
                    // Determine row type for visual merging
                    const isFirstRow = plantIndex === 0;
                    const isLastRow = plantIndex === plantData.length - 1;
                    
                    // Build row classes for visual merging
                    let rowClasses = [plantColorClass];
                    if (isFirstRow) {
                        rowClasses.push('plant-group-first');
                    } else {
                        rowClasses.push('plant-group-continuation');
                    }
                    if (isLastRow) {
                        rowClasses.push('plant-group-last');
                    }
                    
                    html += `<tr class="${rowClasses.join(' ')}">`;
                    
                    const coalCost = parseFloat(row[12]) || 0;
                    const railwayFreight = parseFloat(row[13]) || 0;
                    const gcv = parseFloat(row[11]) || 1;
                    
                    // Get weighted average SHR for the plant (same for all rows of this plant)
                    const shr = getWeightedAverageSHRForPlant(plantName);
                    
                    // Prepare extended data
                    const landedCostPerMT = coalCost + railwayFreight;
                    const landedCostPerMcal = gcv > 0 ? landedCostPerMT / gcv : 0;
                    const perUnitCost = shr * landedCostPerMcal / 1000;
                    
                    // Calculate Total Amount (Rs. Crore)
                    const qtyReceived = parseFloat(row[4]) || 0; // Qty Received in Lakh MT
                    const totalAmount = (qtyReceived * landedCostPerMT) / 100; // Convert to crores
                    
                    const extendedData = {
                        shr: shr,
                        landedCostPerMT: landedCostPerMT,
                        landedCostPerMcal: landedCostPerMcal,
                        perUnitCost: perUnitCost,
                        totalAmount: totalAmount
                    };
                    
                    // Handle visual merging for Plant Name based on visible columns
                    visibleColumns.forEach(col => {
                        if (col.index === 1) {
                            // Plant Name - show only in first row, empty in continuation rows
                            if (isFirstRow) {
                                const shortenedPlantName = shortenPlantName(plantName);
                                html += `<td class="text-center align-middle">${shortenedPlantName}</td>`;
                            } else {
                                // Empty cell for visual merging (but cell exists for sticky positioning)
                                html += `<td class="text-center align-middle"></td>`;
                            }
                        } else {
                            // Other columns
                            let value = '';
                            
                            if (col.index <= 14) {
                                value = row[col.index] !== undefined && row[col.index] !== '' ? row[col.index] : '&nbsp;';
                                
                                // Apply plant name shortening for column 1 (plant name)
                                if (col.index === 1) {
                                    value = shortenPlantName(value);
                                }
                                
                                // Format numbers
                                if (col.index >= 3 && col.index <= 14 && !isNaN(parseFloat(value))) {
                                    if (col.index === 3 || col.index === 4) { // Qty columns - 4 decimals
                                        value = parseFloat(value).toFixed(4);
                                    } else if (col.index === 5) {
                                        value = Math.round(parseFloat(value));
                                    } else if (col.index === 11 || col.index === 12 || col.index === 13) { // GCV, Coal Cost, Railway Freight - 0 decimals
                                        value = Math.round(parseFloat(value));
                                    } else if (col.index >= 6) {
                                        value = parseFloat(value).toFixed(2);
                                    }
                                }
                            } else {
                                // Extended columns
                                switch (col.index) {
                                    case 15:
                                        value = landedCostPerMT.toFixed(0);
                                        break;
                                    case 16:
                                        value = landedCostPerMcal.toFixed(4);
                                        break;
                                    case 17:
                                        value = perUnitCost.toFixed(3);
                                        break;
                                    case 18:
                                        // Total Amount (Rs. Crore) = Qty Received * Landed Cost (Rs/MT) / 10000000
                                        const qtyReceived = parseFloat(row[4]) || 0; // Qty Received in Lakh MT
                                        const totalAmount = (qtyReceived * landedCostPerMT) / 100; // Convert Lakh MT to MT (multiply by 100000) then divide by 10000000 for crore = divide by 100
                                        value = totalAmount.toFixed(2);
                                        break;
                                }
                            }
                            
                            let cellClass = 'text-center';
                            if (col.index >= 15) cellClass += ' qc-calculated-col';
                            
                            html += `<td class="${cellClass}">${value}</td>`;
                        }
                    });
                    
                    html += '</tr>';
                });
                
                // Add plant-wise total row after each plant only if there are multiple coal companies for this plant
                const plantRows = plantData.map(item => item.row);
                const plantCoalCompanies = [...new Set(plantRows.map(row => row[2]))];
                if (plantCoalCompanies.length > 1) {
                    const plantTotalRow = QCCalculateTotalRow(plantRows, plantName, visibleColumns);
                    html += QCRenderTotalRow(plantTotalRow, visibleColumns, `Total ${shortenPlantName(plantName)}`, 'table-warning total-row');
                }
                
                plantGroupIndex++;
            });
            
            // Add Grand Total row at the end only if there are multiple plants
            const uniquePlants = [...new Set(processedData.map(row => row[1]))];
            if (uniquePlants.length > 1) {
                const grandTotalRow = QCCalculateTotalRow(processedData, 'Grand Total', visibleColumns);
                html += QCRenderTotalRow(grandTotalRow, visibleColumns, 'Grand Total', 'table-success calculated-total-row');
            }
            
        } else {
            // Normal rendering without cell merging
            processedData.forEach(row => {
                html += '<tr>';
                
                const coalCost = parseFloat(row[12]) || 0;
                const railwayFreight = parseFloat(row[13]) || 0;
                const gcv = parseFloat(row[11]) || 1;
                
                // Calculate extended columns
                const plant = row[1];
                const coalCompany = row[2];
                
                // Get weighted average SHR based on consolidation type
                let shr;
                if (consolidateCoalCompany && !consolidatePlant) {
                    // For coal company consolidation, calculate SHR for all plants receiving from this coal company
                    // Need to find all rows for this coal company to pass to the function
                    const coalCompanyRows = processedData.filter(r => r[2] === coalCompany);
                    shr = getWeightedAverageSHRForCoalCompany(coalCompany, coalCompanyRows);
                } else {
                    // For plant consolidation or both, use plant-specific SHR
                    shr = getWeightedAverageSHRForPlant(plant);
                }
                
                // Prepare extended data
                const landedCostPerMT = coalCost + railwayFreight;
                const landedCostPerMcal = gcv > 0 ? landedCostPerMT / gcv : 0;
                const perUnitCost = shr * landedCostPerMcal / 1000;
                
                // Calculate Total Amount (Rs. Crore)
                const qtyReceived = parseFloat(row[4]) || 0; // Qty Received in Lakh MT
                const totalAmount = (qtyReceived * landedCostPerMT) / 100; // Convert to crores
                
                const extendedData = {
                    shr: shr,
                    landedCostPerMT: landedCostPerMT,
                    landedCostPerMcal: landedCostPerMcal,
                    perUnitCost: perUnitCost,
                    totalAmount: totalAmount
                };
                
                // Render cells based on visible columns
                html += QCRenderTableCells(row, visibleColumns, extendedData);
                
                html += '</tr>';
            });
            
            // Add Grand Total row for other consolidation types only when appropriate
            if (consolidateCoalCompany && !consolidatePlant) {
                // For coal company consolidation, show grand total only if multiple companies
                const uniqueCoalCompanies = [...new Set(processedData.map(row => row[2]))];
                if (uniqueCoalCompanies.length > 1) {
                    const grandTotalRow = QCCalculateTotalRow(processedData, 'Grand Total', visibleColumns);
                    html += QCRenderTotalRow(grandTotalRow, visibleColumns, 'Grand Total', 'table-success calculated-total-row');
                }
            } else if (consolidatePlant && !consolidateCoalCompany) {
                // For plant consolidation only, show grand total only if multiple plants
                const uniquePlants = [...new Set(processedData.map(row => row[1]))];
                if (uniquePlants.length > 1) {
                    const grandTotalRow = QCCalculateTotalRow(processedData, 'Grand Total', visibleColumns);
                    html += QCRenderTotalRow(grandTotalRow, visibleColumns, 'Grand Total', 'table-success calculated-total-row');
                }
            }
        }
    }
    
    html += '</tbody></table></div>';
    
    return html;
}

// Render summary table for SCC and Units Generated
function QCRenderSummaryTable(processedData) {
    console.log("QCRenderSummaryTable: Starting");
    console.log("QCRenderSummaryTable: processedData length:", processedData ? processedData.length : 'null');
    
    if (!processedData || processedData.length === 0) {
        console.log("QCRenderSummaryTable: No processed data, returning empty string");
        return '';
    }
    
    const startMonth = document.getElementById('QCStartMonth').value;
    const endMonth = document.getElementById('QCEndMonth').value;
    
    console.log("QCRenderSummaryTable: startMonth:", startMonth);
    console.log("QCRenderSummaryTable: endMonth:", endMonth);
    
    if (!startMonth || !endMonth) {
        console.log("QCRenderSummaryTable: No month selection, returning empty string");
        return '';
    }
    
    const startDate = parseMonthYear(startMonth);
    const endDate = parseMonthYear(endMonth);
    
    console.log("QCRenderSummaryTable: parsed dates:", startDate, endDate);
    
    if (!startDate || !endDate) {
        console.log("QCRenderSummaryTable: Could not parse dates, returning empty string");
        return '';
    }
    
    // Format month range for display
    const startDisplay = formatMonthForDisplay(startMonth);
    const endDisplay = formatMonthForDisplay(endMonth);
    const monthRange = startDisplay === endDisplay ? startDisplay : `${startDisplay} to ${endDisplay}`;
    
    // Get unique plants from the Quality&CostAnalysis2 data for the selected period
    const plantsData = {};
    let psppclTotalSCC = 0;
    let psppclTotalUnits = 0;
    let psppclWeightedGCV = 0;
    let psppclTotalCoalQty = 0;
    
    // Process Quality&CostAnalysis2 data to get SCC and Units Generated
    if (QualityCostData2 && QualityCostData2.length > 0) {
        QualityCostData2.forEach(row => {
            if (!row || row.length < 5) return;
            
            const rowMonth = row[0];
            const rowPlant = (typeof row[1] === 'object' && row[1].v !== undefined) ? 
                String(row[1].v).trim() : String(row[1] || '').trim();
            const shr = (typeof row[2] === 'object' && row[2].v !== undefined) ? 
                parseFloat(row[2].v) : parseFloat(row[2]);
            const scc = (typeof row[3] === 'object' && row[3].v !== undefined) ? 
                parseFloat(row[3].v) : parseFloat(row[3]);
            const unitsGenerated = (typeof row[4] === 'object' && row[4].v !== undefined) ? 
                parseFloat(row[4].v) : parseFloat(row[4]);
                
            // Parse date and check if it's in the selected range
            const rowDate = parseSheetDate(rowMonth);
            if (!rowDate) return;
            
            const rowMonthYear = new Date(rowDate.getFullYear(), rowDate.getMonth(), 1);
            const startMonthYear = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
            const endMonthYear = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
            
            const inRange = rowMonthYear >= startMonthYear && rowMonthYear <= endMonthYear;
            
            if (inRange && !isNaN(scc) && !isNaN(unitsGenerated) && unitsGenerated > 0 && scc > 0) {
                if (!plantsData[rowPlant]) {
                    plantsData[rowPlant] = {
                        totalSCC: 0,
                        totalUnits: 0,
                        count: 0
                    };
                }
                
                plantsData[rowPlant].totalSCC += scc * unitsGenerated; // Weighted by units
                plantsData[rowPlant].totalUnits += unitsGenerated;
                plantsData[rowPlant].count++;
                
                // Add to PSPCL totals
                psppclTotalSCC += scc * unitsGenerated;
                psppclTotalUnits += unitsGenerated;
            }
        });
    }
    
    // Calculate PSPCL weighted average GCV from Quality&CostAnalysis1
    if (QualityCostData1 && QualityCostData1.length > 0) {
        let totalWeightedGCV = 0;
        let totalQty = 0;
        
        QualityCostData1.forEach(row => {
            if (!row || row.length < 12) return;
            
            const rowMonth = row[0];
            const gcv = parseFloat(row[11]) || 0;
            const qtyReceived = parseFloat(row[4]) || 0;
            
            // Parse date and check if it's in the selected range
            const rowDate = parseMonthYear(rowMonth);
            if (!rowDate) return;
            
            const rowMonthYear = new Date(rowDate.getFullYear(), rowDate.getMonth(), 1);
            const startMonthYear = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
            const endMonthYear = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
            
            const inRange = rowMonthYear >= startMonthYear && rowMonthYear <= endMonthYear;
            
            if (inRange && gcv > 0 && qtyReceived > 0) {
                totalWeightedGCV += gcv * qtyReceived;
                totalQty += qtyReceived;
            }
        });
        
        psppclWeightedGCV = totalQty > 0 ? totalWeightedGCV / totalQty : 0;
    }
    
    // Calculate averages for each plant
    Object.keys(plantsData).forEach(plant => {
        const data = plantsData[plant];
        data.avgSCC = data.totalUnits > 0 ? data.totalSCC / data.totalUnits : 0;
    });
    
    // Calculate PSPCL overall SCC and SHR
    const psppclAvgSCC = psppclTotalUnits > 0 ? psppclTotalSCC / psppclTotalUnits : 0;
    const psppclSHR = getWeightedAverageSHRForPlant('PSPCL');
    
    // Sort plants alphabetically
    const sortedPlants = Object.keys(plantsData).sort();
    
    // Generate table HTML
    let html = `
        <div class="table-responsive quality-cost-table">
            <table class="table table-hover mb-0 table-sm quality-cost-table">
                <thead class="table-primary summary-table-header">
                    <tr>
                        <th class="text-center">${monthRange}</th>
    `;
    
    // Add plant columns
    sortedPlants.forEach(plant => {
        html += `<th class="text-center">${plant}</th>`;
    });
    
    html += `<th class="text-center">PSPCL</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="text-start"><strong>Specific Coal Consumption (Kg/kWh)</strong></td>`;
    
    // Add SCC values for each plant
    sortedPlants.forEach(plant => {
        const avgSCC = plantsData[plant].avgSCC;
        html += `<td class="text-center">${avgSCC > 0 ? avgSCC.toFixed(3) : '-'}</td>`;
    });
    
    // Calculate SHR/GCV ratio for PSPCL
    const psppclSHRtoGCVRatio = psppclWeightedGCV > 0 ? psppclSHR / psppclWeightedGCV : 0;
    html += `<td class="text-center">${psppclSHRtoGCVRatio.toFixed(6)}</td>`;
    
    html += `</tr>
                            <tr>
                                <td class="text-start"><strong>SHR (Kg/kWh)</strong></td>`;
    
    // Add SHR values for each plant
    sortedPlants.forEach(plant => {
        const plantSHR = getWeightedAverageSHRForPlant(plant);
        html += `<td class="text-center">${plantSHR > 0 ? plantSHR.toFixed(2) : '-'}</td>`;
    });
    
    // Add PSPCL SHR
    html += `<td class="text-center">${psppclSHR.toFixed(2)}</td>`;
    
    html += `</tr>
                            <tr>
                                <td class="text-start"><strong>Units Generated (Lus)</strong></td>`;
    
    // Add Units Generated for each plant
    sortedPlants.forEach(plant => {
        const totalUnits = plantsData[plant].totalUnits;
        html += `<td class="text-center">${totalUnits > 0 ? totalUnits.toFixed(2) : '-'}</td>`;
    });
    
    // Add PSPCL total units
    html += `<td class="text-center">${psppclTotalUnits.toFixed(2)}</td>`;
    
    html += `</tr>
                        </tbody>
                    </table>
                </div>
    `;
    
    console.log("QCRenderSummaryTable: Generated HTML length:", html.length);
    console.log("QCRenderSummaryTable: Finished successfully");
    
    return html;
}

// Get processed data specifically for month-wise display
function QCGetMonthWiseData() {
    console.log("QCGetMonthWiseData: Starting");
    
    // Filter data by month range first
    const monthFilteredData = QCFilterDataByMonth(QualityCostData1);
    console.log("QCGetMonthWiseData: Month filtered data length:", monthFilteredData.length);
    
    if (!monthFilteredData || monthFilteredData.length === 0) {
        return [];
    }
    
    // Filter out RCR Mode and Imported rows based on consolidation settings
    let filteredData = QCFilterRCRAndImported(monthFilteredData);
    console.log("QCGetMonthWiseData: After RCR/Imported filter:", filteredData.length);
    
    // Apply plant and coal company filters if any consolidation options are set
    const consolidatePlant = document.getElementById('QCConsolidatePlant').checked;
    const consolidateCoalCompany = document.getElementById('QCConsolidateCoalCompany').checked;
    
    if (consolidatePlant) {
        const selectedPlants = Array.from(document.getElementById('QCPlantFilter').selectedOptions).map(option => option.value);
        if (selectedPlants.length > 0) {
            filteredData = filteredData.filter(row => selectedPlants.includes(row[1]));
            console.log("QCGetMonthWiseData: After plant filter:", filteredData.length);
        }
    }
    
    if (consolidateCoalCompany && consolidatePlant) {
        const selectedCoalCompanies = Array.from(document.getElementById('QCCoalCompanyFilter').selectedOptions).map(option => option.value);
        if (selectedCoalCompanies.length > 0) {
            filteredData = filteredData.filter(row => selectedCoalCompanies.includes(row[2]));
            console.log("QCGetMonthWiseData: After coal company filter:", filteredData.length);
        }
    }
    
    // Sort data by month chronologically
    filteredData.sort((a, b) => {
        const dateA = parseMonthYear(a[0]);
        const dateB = parseMonthYear(b[0]);
        if (!dateA || !dateB) return 0;
        return dateA - dateB;
    });
    
    // Process each row to add month information
    const monthWiseData = filteredData.map(row => {
        const monthStr = row[0]; // Month is in first column
        const monthDisplay = formatMonthForDisplay(monthStr);
        
        // Create new row with month display as first column, preserving all original data
        const newRow = [monthDisplay, ...row];
        return newRow;
    });
    
    console.log("QCGetMonthWiseData: Final processed data length:", monthWiseData.length);
    console.log("QCGetMonthWiseData: First few months:", monthWiseData.slice(0, 3).map(row => row[0]));
    return monthWiseData;
}

// Render month-wise table (separate from main table)
function QCRenderMonthWiseTable() {
    console.log("QCRenderMonthWiseTable: Starting");
    
    const monthWiseData = QCGetMonthWiseData();
    
    if (!monthWiseData || monthWiseData.length === 0) {
        return '<div class="alert alert-info">No month-wise data available for the selected period.</div>';
    }
    
    // Get visible columns for month-wise display
    const visibleColumns = QCGetVisibleColumns(false, true);
    
    // Generate table header
    const startMonth = document.getElementById('QCStartMonth').value;
    const endMonth = document.getElementById('QCEndMonth').value;
    
    let periodText = '';
    if (startMonth && endMonth) {
        const startDisplay = formatMonthForDisplay(startMonth);
        const endDisplay = formatMonthForDisplay(endMonth);
        
        if (startDisplay === endDisplay) {
            periodText = `during ${startDisplay}`;
        } else {
            periodText = `from ${startDisplay} to ${endDisplay}`;
        }
    } else {
        periodText = 'for selected period';
    }
    
    const tableHeader = `Month-wise details of coal received at PSPCL thermal power stations ${periodText}`;
    
    let html = `
        <div class="quality-cost-card mb-3">
            <div class="quality-cost-section-header">
                <h5 class="mb-0"><i class="bi bi-calendar-month"></i> ${tableHeader}</h5>
            </div>
        </div>
        <div class="table-responsive">
            <table class="table table-hover table-sm table-fixed-first">
                <thead class="table-primary">
                    <tr>
    `;
    
    // Add headers based on visible columns
    visibleColumns.forEach(col => {
        html += `<th class="text-center">${col.header}</th>`;
    });
    
    html += `</tr></thead><tbody>`;
    
    // Group data by month for totals
    const monthGroups = {};
    monthWiseData.forEach(row => {
        const month = row[0]; // Month is first column
        if (!monthGroups[month]) {
            monthGroups[month] = [];
        }
        monthGroups[month].push(row);
    });
    
    // Get month order chronologically
    const monthOrder = Object.keys(monthGroups).sort((a, b) => {
        // Try to parse the month display format for sorting
        const monthA = a.includes('-') ? new Date(a.split('-')[1] + '-' + (a.split('-')[0] === 'Jan' ? '01' : 
                                                                              a.split('-')[0] === 'Feb' ? '02' :
                                                                              a.split('-')[0] === 'Mar' ? '03' :
                                                                              a.split('-')[0] === 'Apr' ? '04' :
                                                                              a.split('-')[0] === 'May' ? '05' :
                                                                              a.split('-')[0] === 'Jun' ? '06' :
                                                                              a.split('-')[0] === 'Jul' ? '07' :
                                                                              a.split('-')[0] === 'Aug' ? '08' :
                                                                              a.split('-')[0] === 'Sep' ? '09' :
                                                                              a.split('-')[0] === 'Oct' ? '10' :
                                                                              a.split('-')[0] === 'Nov' ? '11' : '12') + '-01') : new Date();
        const monthB = b.includes('-') ? new Date(b.split('-')[1] + '-' + (b.split('-')[0] === 'Jan' ? '01' : 
                                                                              b.split('-')[0] === 'Feb' ? '02' :
                                                                              b.split('-')[0] === 'Mar' ? '03' :
                                                                              b.split('-')[0] === 'Apr' ? '04' :
                                                                              b.split('-')[0] === 'May' ? '05' :
                                                                              b.split('-')[0] === 'Jun' ? '06' :
                                                                              b.split('-')[0] === 'Jul' ? '07' :
                                                                              b.split('-')[0] === 'Aug' ? '08' :
                                                                              b.split('-')[0] === 'Sep' ? '09' :
                                                                              b.split('-')[0] === 'Oct' ? '10' :
                                                                              b.split('-')[0] === 'Nov' ? '11' : '12') + '-01') : new Date();
        return monthA - monthB;
    });
    
    // Render data grouped by month with plant-wise totals
    const allRows = [];
    monthOrder.forEach(month => {
        const monthRows = monthGroups[month];
        
        // Group month rows by plant
        const plantGroups = {};
        monthRows.forEach(row => {
            let plantName = row[2]; // Plant name at index 2
            if (typeof plantName === 'object' && plantName.v !== undefined) {
                plantName = plantName.v;
            } else {
                plantName = String(plantName).trim();
            }
            
            if (!plantGroups[plantName]) {
                plantGroups[plantName] = [];
            }
            plantGroups[plantName].push(row);
        });
        
        // Get plant order (maintain consistent order)
        const plantOrder = Object.keys(plantGroups).sort();
        
        // Render each plant's data with plant totals
        plantOrder.forEach(plantName => {
            const plantRows = plantGroups[plantName];
            
            // Add data rows for this plant in this month
            plantRows.forEach(row => {
                html += '<tr>';
                
                // Calculate extended data for each row
                const coalCost = parseFloat(row[13]) || 0; // Coal cost at index 13
                const railwayFreight = parseFloat(row[14]) || 0; // Railway freight at index 14
                const gcv = parseFloat(row[12]) || 1; // GCV at index 12
                const qtyReceived = parseFloat(row[5]) || 0; // Qty received at index 5
                
                const landedCostPerMT = coalCost + railwayFreight;
                const landedCostPerMcal = gcv > 0 ? landedCostPerMT / gcv : 0;
                
                const plantSHR = getWeightedAverageSHRForPlant(plantName) || getWeightedAverageSHRForPlant('PSPCL');
                const perUnitCost = plantSHR * landedCostPerMcal / 1000;
                
                // Calculate Total Amount (Rs. Crore)
                const coalCostTotal = (qtyReceived * 100000 * coalCost) / 10000000;
                const railwayFreightTotal = (qtyReceived * 100000 * railwayFreight) / 10000000;
                const totalAmount = coalCostTotal + railwayFreightTotal;
                
                const extendedData = {
                    landedCostPerMT,
                    landedCostPerMcal,
                    perUnitCost,
                    totalAmount
                };
                
                html += QCRenderTableCells(row, visibleColumns, extendedData);
                html += '</tr>';
                
                // Store for grand total calculation
                allRows.push(row);
            });
            
            // Add plant total row for this month (only if there are multiple coal companies for this plant)
            if (plantRows.length > 1) {
                const plantTotalRow = QCCalculateMonthWiseTotalRow(plantRows, `${shortenPlantName(plantName)} Total`, visibleColumns);
                html += QCRenderMonthWiseTotalRow(plantTotalRow, visibleColumns, `${shortenPlantName(plantName)} Total`, 'table-info plant-total-row');
            }
        });
        
        // Add month total row (only if there are multiple plants in this month)
        if (plantOrder.length > 1) {
            const monthTotalRow = QCCalculateMonthWiseTotalRow(monthRows, `${month} Total`, visibleColumns);
            html += QCRenderMonthWiseTotalRow(monthTotalRow, visibleColumns, `${month} Total`, 'table-warning total-row');
        }
    });
    
    // Add grand total row
    if (monthOrder.length > 1) {
        const grandTotalRow = QCCalculateMonthWiseTotalRow(allRows, 'Grand Total', visibleColumns);
        html += QCRenderMonthWiseTotalRow(grandTotalRow, visibleColumns, 'Grand Total', 'table-success calculated-total-row');
    }
    
    html += '</tbody></table></div>';
    
    console.log("QCRenderMonthWiseTable: Generated HTML length:", html.length);
    return html;
}

// Helper function to calculate total row for month-wise data
function QCCalculateMonthWiseTotalRow(dataRows, label, visibleColumns) {
    if (!dataRows || dataRows.length === 0) return null;
    
    // Initialize totals with month column if present
    const totalRow = [];
    
    // Set month column (empty for totals)
    totalRow[0] = ''; // Month column empty for totals
    totalRow[1] = ''; // Original month data column (empty for totals)
    totalRow[2] = label; // Plant name becomes the label (was index 1 in original, now index 2)
    totalRow[3] = ''; // Empty coal company column for totals (was index 2 in original, now index 3)
    
    // Sum columns that should be totaled (Qty Dispatched, Qty Received, Rakes Received)
    // These are now at indices 4, 5, 6 (were 3, 4, 5 in original)
    [4, 5, 6].forEach(colIdx => {
        totalRow[colIdx] = dataRows.reduce((sum, row) => {
            return sum + (parseFloat(row[colIdx]) || 0);
        }, 0);
    });
    
    // Calculate Transit Loss for total (now at index 7, was 6)
    const qtyDispatched = parseFloat(totalRow[4]) || 0;
    const qtyReceived = parseFloat(totalRow[5]) || 0;
    totalRow[7] = qtyDispatched > 0 ? (((qtyDispatched - qtyReceived) / qtyDispatched) * 100) : 0;
    
    // Calculate weighted averages for columns 8-14 w.r.t. Quantity Received (were 7-13)
    for (let colIdx = 8; colIdx <= 14; colIdx++) {
        const values = dataRows.map(row => row[colIdx]);
        const weights = dataRows.map(row => row[5]); // Qty Received as weight (now at index 5)
        totalRow[colIdx] = calculateWeightedAverage(values, weights);
    }
    
    // Simple average for column 15 (Distance) (was 14)
    const columnOValues = dataRows.map(row => row[15]);
    totalRow[15] = calculateSimpleAverage(columnOValues);
    
    // Add individual rows for calculated column calculations
    totalRow.individualRows = dataRows;
    
    return totalRow;
}

// Helper function to render a month-wise total row
function QCRenderMonthWiseTotalRow(totalRowData, visibleColumns, label, cssClass = 'table-warning total-row') {
    if (!totalRowData) return '';
    
    let html = `<tr class="${cssClass} fw-bold">`;
    
    visibleColumns.forEach(col => {
        let value = '';
        let cellClass = 'text-center';
        
        if (col.id === 'month') {
            // Month column - empty for totals
            value = '&nbsp;';
        } else if (col.id === 'plant') {
            // Plant/Label column (now at index 2 in totalRowData)
            const shortenedLabel = shortenPlantName(label);
            value = `<strong>${shortenedLabel}</strong>`;
        } else if (col.id === 'coalCompany') {
            // Coal company column - empty for totals
            value = '&nbsp;';
        } else if (col.index >= 4 && col.index <= 15) {
            // Data columns (adjusted for month column shift)
            const rawValue = totalRowData[col.index];
            if (rawValue !== undefined && rawValue !== '') {
                if (col.index === 4 || col.index === 5) { // Qty columns (were 3,4)
                    value = parseFloat(rawValue).toFixed(4);
                } else if (col.index === 6) { // Rakes (was 5)
                    value = Math.round(parseFloat(rawValue));
                } else if (col.index >= 7) { // Other columns (were 6+)
                    value = parseFloat(rawValue).toFixed(2);
                }
            } else {
                value = '&nbsp;';
            }
        } else if (col.index >= 16) {
            // Extended/calculated columns (indices shifted by 1)
            let calcValue = 0;
            
            switch (col.index) {
                case 16: // Landed Cost Rs/MT (coal cost + railway freight at indices 13, 14)
                    const coalCost = parseFloat(totalRowData[13]) || 0;
                    const railwayFreight = parseFloat(totalRowData[14]) || 0;
                    calcValue = coalCost + railwayFreight;
                    value = calcValue.toFixed(0);
                    break;
                case 17: // Landed Cost Rs/Mcal
                    const landedCostMT = (parseFloat(totalRowData[13]) || 0) + (parseFloat(totalRowData[14]) || 0);
                    const gcv = parseFloat(totalRowData[12]) || 1;
                    calcValue = gcv > 0 ? landedCostMT / gcv : 0;
                    value = calcValue.toFixed(4);
                    break;
                case 18: // Per Unit Cost
                    const landedCostMcal = ((parseFloat(totalRowData[13]) || 0) + (parseFloat(totalRowData[14]) || 0)) / (parseFloat(totalRowData[12]) || 1);
                    const shr = getWeightedAverageSHRForPlant('PSPCL');
                    calcValue = shr * landedCostMcal / 1000;
                    value = calcValue.toFixed(3);
                    break;
                case 19: // Total Amount (Rs. Crore)
                    const qtyRec = parseFloat(totalRowData[5]) || 0; // Qty received at index 5
                    const coalCostAmt = parseFloat(totalRowData[13]) || 0;
                    const railwayFreightAmt = parseFloat(totalRowData[14]) || 0;
                    const coalCostTotalCalc = (qtyRec * 100000 * coalCostAmt) / 10000000;
                    const railwayFreightTotalCalc = (qtyRec * 100000 * railwayFreightAmt) / 10000000;
                    calcValue = coalCostTotalCalc + railwayFreightTotalCalc;
                    value = calcValue.toFixed(2);
                    break;
                default:
                    value = '&nbsp;';
            }
        } else {
            value = '&nbsp;';
        }
        
        html += `<td class="${cellClass}">${value}</td>`;
    });
    
    html += '</tr>';
    return html;
}

// Main table rendering function
function QCRenderTables() {
    console.log("Rendering Quality Cost Analysis tables");
    
    try {
        // Filter data by month range
        const monthFilteredData = QCFilterDataByMonth(QualityCostData1);
        
        // Filter out RCR Mode and Imported rows unless coal company consolidation is selected
        const filteredData = QCFilterRCRAndImported(monthFilteredData);
        
        // Consolidate data based on selected options
        const processedData = QCConsolidateData(filteredData);
        
        // Generate dynamic table header
        const startMonth = document.getElementById('QCStartMonth').value;
        const endMonth = document.getElementById('QCEndMonth').value;
        
        let periodText = '';
        if (startMonth && endMonth) {
            const startDisplay = formatMonthForDisplay(startMonth);
            const endDisplay = formatMonthForDisplay(endMonth);
            
            if (startDisplay === endDisplay) {
                periodText = `during ${startDisplay}`;
            } else {
                periodText = `from ${startDisplay} to ${endDisplay}`;
            }
        } else {
            periodText = 'for selected period';
        }
        
        const tableHeader = `Details of coal received at PSPCL thermal power stations from all linked sources ${periodText}`;
        
        // Render main table header card and table separately
        const mainTableHtml = QCRenderMainTable(processedData);
        document.getElementById('QC-main-table').innerHTML = `
            <!-- Table Header Card -->
            <div class="quality-cost-card mb-3">
                <div class="quality-cost-section-header d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-0">${tableHeader}</h6>
                        <small class="text-light opacity-75">
                            ${processedData.length} records
                        </small>
                    </div>
                    <div>
                        <button class="btn btn-outline-light btn-sm" id="QCRefreshDataBtnMain">
                            <i class="bi bi-arrow-clockwise"></i> Refresh Data
                        </button>
                    </div>
                </div>
            </div>
            <!-- Main Table Outside Card for Sticky Headers -->
            ${mainTableHtml}
        `;
        
        // Setup refresh button event listener for main table
        document.getElementById('QCRefreshDataBtnMain').addEventListener('click', () => {
            QCShowLoadingState('QCRefreshDataBtnMain', 'Refreshing...');
            Promise.all([fetchQualityCostData1(), fetchQualityCostData2()])
                .then(() => {
                    QCPopulateMonthDropdowns();
                    QCPopulateColumnSelector();
                    QCAddColumnEventListeners();
                    QCRenderTables();
                })
                .catch(err => {
                    console.error("Error in refresh:", err);
                    alert(`Error refreshing data: ${err.message}`);
                })
                .finally(() => {
                    QCHideLoadingState('QCRefreshDataBtnMain', '<i class="bi bi-arrow-clockwise"></i> Refresh Data');
                });
        });
        
        // Render summary table below main table
        console.log("QCRenderTables: About to render summary table");
        const summaryTableHtml = QCRenderSummaryTable(processedData);
        console.log("QCRenderTables: Summary table HTML length:", summaryTableHtml.length);
        document.getElementById('QC-summary-table').innerHTML = summaryTableHtml;
        console.log("QCRenderTables: Summary table inserted into DOM");
        
        // Check if month-wise display is enabled and render month-wise table
        const monthWiseDisplay = document.getElementById('QCMonthWiseDisplay')?.checked || false;
        if (monthWiseDisplay) {
            console.log("QCRenderTables: Month-wise display enabled, rendering month-wise table");
            
            // Create or update month-wise table container
            let monthWiseContainer = document.getElementById('QC-month-wise-table');
            if (!monthWiseContainer) {
                monthWiseContainer = document.createElement('div');
                monthWiseContainer.id = 'QC-month-wise-table';
                monthWiseContainer.className = 'mb-4 month-wise-container';
                
                // Insert after summary table
                const summaryTable = document.getElementById('QC-summary-table');
                summaryTable.parentNode.insertBefore(monthWiseContainer, summaryTable.nextSibling);
            }
            
            // Render month-wise table
            const monthWiseTableHtml = QCRenderMonthWiseTable();
            monthWiseContainer.innerHTML = monthWiseTableHtml;
            monthWiseContainer.style.display = 'block';
            
            console.log("QCRenderTables: Month-wise table rendered successfully");
        } else {
            // Hide month-wise table if it exists
            const monthWiseContainer = document.getElementById('QC-month-wise-table');
            if (monthWiseContainer) {
                monthWiseContainer.style.display = 'none';
            }
            console.log("QCRenderTables: Month-wise display disabled, hiding month-wise table");
        }
        
        console.log("Tables rendered successfully");
        
    } catch (error) {
        console.error("Error rendering tables:", error);
        document.getElementById('QC-main-table').innerHTML = 
            `<div class="alert alert-danger">Error rendering tables: ${error.message}</div>`;
    }
}

// Image Export Function (JPG)
function QCExportToImage() {
    try {
        // Check if html2canvas library is available
        if (typeof html2canvas === 'undefined') {
            alert('Image export library not loaded. Please ensure html2canvas is included.');
            return;
        }
        
        // Get the main content area for capture
        const mainTable = document.getElementById('QC-main-table');
        const summaryTable = document.getElementById('QC-summary-table');
        
        if (!mainTable) {
            alert('No table data to export as image.');
            return;
        }
        
        // Create a temporary container for the export
        const exportContainer = document.createElement('div');
        exportContainer.style.background = 'white';
        exportContainer.style.padding = '20px';
        exportContainer.style.fontFamily = 'Arial, sans-serif';
        exportContainer.style.position = 'absolute';
        exportContainer.style.left = '-9999px';
        exportContainer.style.top = '0';
        exportContainer.style.width = '1200px';
        
        // Add title
        const startMonth = document.getElementById('QCStartMonth').value;
        const endMonth = document.getElementById('QCEndMonth').value;
        const startDisplay = formatMonthForDisplay(startMonth);
        const endDisplay = formatMonthForDisplay(endMonth);
        
        let periodText = '';
        if (startDisplay === endDisplay) {
            periodText = `during ${startDisplay}`;
        } else {
            periodText = `from ${startDisplay} to ${endDisplay}`;
        }
        
        const title = `Coal Quality & Cost Analysis Report ${periodText}`;
        const titleElement = document.createElement('h2');
        titleElement.textContent = title;
        titleElement.style.textAlign = 'center';
        titleElement.style.marginBottom = '20px';
        titleElement.style.color = '#333';
        
        exportContainer.appendChild(titleElement);
        
        // Clone the main table
        const mainTableClone = mainTable.cloneNode(true);
        // Remove action buttons from the cloned header
        const actionButtons = mainTableClone.querySelector('.d-flex.gap-2');
        if (actionButtons) {
            actionButtons.remove();
        }
        exportContainer.appendChild(mainTableClone);
        
        // Add summary table if it exists
        if (summaryTable && summaryTable.innerHTML.trim()) {
            const summaryTitle = document.createElement('h3');
            summaryTitle.textContent = 'Summary';
            summaryTitle.style.marginTop = '30px';
            summaryTitle.style.marginBottom = '15px';
            summaryTitle.style.color = '#333';
            exportContainer.appendChild(summaryTitle);
            
            const summaryTableClone = summaryTable.cloneNode(true);
            exportContainer.appendChild(summaryTableClone);
        }
        
        // Add to document temporarily
        document.body.appendChild(exportContainer);
        
        // Generate image with high quality settings
        html2canvas(exportContainer, {
            backgroundColor: '#ffffff',
            scale: 3, // Higher resolution for better quality
            useCORS: true,
            allowTaint: true,
            logging: false,
            width: 1200,
            height: exportContainer.scrollHeight
        }).then(canvas => {
            // Remove temporary container
            document.body.removeChild(exportContainer);
            
            // Convert to high-quality JPEG and download
            const imgData = canvas.toDataURL('image/jpeg', 0.98); // Higher quality
            const link = document.createElement('a');
            link.download = `Coal_Quality_Analysis_${startDisplay}_to_${endDisplay}.jpg`.replace(/[^a-zA-Z0-9_-]/g, '_');
            link.href = imgData;
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log('Image export completed successfully');
        }).catch(error => {
            // Remove temporary container on error
            if (document.body.contains(exportContainer)) {
                document.body.removeChild(exportContainer);
            }
            throw error;
        });
        
    } catch (error) {
        console.error('Image export error:', error);
        alert(`Error generating image: ${error.message}`);
    }
}

// Helper function to get processed data for export functions
function QCGetProcessedData() {
    try {
        // Check if month-wise display is enabled
        const monthWiseDisplay = document.getElementById('QCMonthWiseDisplay')?.checked || false;
        
        if (monthWiseDisplay) {
            return QCGetMonthWiseProcessedData();
        } else {
            // Original logic for consolidated data
            // Filter data by month range
            const monthFilteredData = QCFilterDataByMonth(QualityCostData1);
            
            // Filter out RCR Mode and Imported rows unless coal company consolidation is selected
            const filteredData = QCFilterRCRAndImported(monthFilteredData);
            
            // Consolidate data based on selected options
            const processedData = QCConsolidateData(filteredData);
            
            return processedData;
        }
    } catch (error) {
        console.error('Error getting processed data:', error);
        return [];
    }
}

// New function to get month-wise processed data
function QCGetMonthWiseProcessedData() {
    try {
        const startMonth = document.getElementById('QCStartMonth').value;
        const endMonth = document.getElementById('QCEndMonth').value;
        
        if (!startMonth || !endMonth) {
            return [];
        }
        
        // Parse start and end dates
        const startDate = parseMonthYear(startMonth);
        const endDate = parseMonthYear(endMonth);
        
        if (!startDate || !endDate) {
            return [];
        }
        
        // Generate list of months in the range
        const monthsInRange = [];
        let currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
            const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
            const shortYear = String(currentDate.getFullYear()).slice(-2);
            const monthName = currentDate.toLocaleDateString('en-US', { month: 'short' });
            const displayName = `${monthName}-${shortYear}`;
            
            monthsInRange.push({
                key: monthKey,
                date: new Date(currentDate),
                displayName: displayName
            });
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        
        const allMonthWiseData = [];
        
        // Process each month separately
        monthsInRange.forEach(month => {
            // Filter data for this specific month
            const monthFilteredData = QCFilterDataBySpecificMonth(QualityCostData1, month.key);
            
            if (monthFilteredData.length === 0) {
                return; // Skip months with no data
            }
            
            // Filter out RCR Mode and Imported rows unless coal company consolidation is selected
            const filteredData = QCFilterRCRAndImported(monthFilteredData);
            
            if (filteredData.length === 0) {
                return; // Skip months with no data after filtering
            }
            
            // For month-wise display, we want to show individual rows, not consolidated data
            // So we'll create separate entries for each row with month prepended
            filteredData.forEach(row => {
                // Create a new row with month as first column
                const monthWiseRow = [month.displayName, ...row.slice(1)]; // Skip the original date column, add month, then rest of data
                allMonthWiseData.push(monthWiseRow);
            });
        });
        
        return allMonthWiseData;
    } catch (error) {
        console.error('Error getting month-wise processed data:', error);
        return [];
    }
}

// Helper function to filter data by a specific month
function QCFilterDataBySpecificMonth(data, monthKey) {
    if (!data || !Array.isArray(data)) {
        return [];
    }
    
    return data.filter(row => {
        if (!row || row.length === 0) return false;
        
        const rowDate = row[0];
        if (!rowDate) return false;
        
        // Handle different date formats
        let rowMonthKey;
        if (typeof rowDate === 'object' && rowDate.v !== undefined) {
            // Google Sheets date object
            const date = new Date(rowDate.v);
            rowMonthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        } else if (typeof rowDate === 'string') {
            // String format like "2024-04"
            rowMonthKey = rowDate.substring(0, 7); // Extract YYYY-MM
        } else {
            return false;
        }
        
        return rowMonthKey === monthKey;
    });
}

// Helper function to get summary data for export functions
function QCGetSummaryData() {
    try {
        const startMonth = document.getElementById('QCStartMonth').value;
        const endMonth = document.getElementById('QCEndMonth').value;
        
        if (!startMonth || !endMonth) {
            return [];
        }
        
        const startDate = parseMonthYear(startMonth);
        const endDate = parseMonthYear(endMonth);
        
        if (!startDate || !endDate) {
            return [];
        }
        
        // Get plants data from Quality&CostAnalysis2
        const plantsData = {};
        let psppclTotalSCC = 0;
        let psppclTotalUnits = 0;
        let psppclWeightedGCV = 0;
        
        // Process Quality&CostAnalysis2 data
        if (QualityCostData2 && QualityCostData2.length > 0) {
            QualityCostData2.forEach(row => {
                if (!row || row.length < 5) return;
                
                const rowMonth = row[0];
                const rowPlant = (typeof row[1] === 'object' && row[1].v !== undefined) ? 
                    String(row[1].v).trim() : String(row[1] || '').trim();
                const shr = (typeof row[2] === 'object' && row[2].v !== undefined) ? 
                    parseFloat(row[2].v) : parseFloat(row[2]);
                const scc = (typeof row[3] === 'object' && row[3].v !== undefined) ? 
                    parseFloat(row[3].v) : parseFloat(row[3]);
                const unitsGenerated = (typeof row[4] === 'object' && row[4].v !== undefined) ? 
                    parseFloat(row[4].v) : parseFloat(row[4]);
                    
                const rowDate = parseSheetDate(rowMonth);
                if (!rowDate) return;
                
                const rowMonthYear = new Date(rowDate.getFullYear(), rowDate.getMonth(), 1);
                const startMonthYear = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
                const endMonthYear = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
                
                const inRange = rowMonthYear >= startMonthYear && rowMonthYear <= endMonthYear;
                
                if (inRange && !isNaN(scc) && !isNaN(unitsGenerated) && unitsGenerated > 0 && scc > 0) {
                    if (!plantsData[rowPlant]) {
                        plantsData[rowPlant] = {
                            totalSCC: 0,
                            totalUnits: 0,
                            totalSHR: 0,
                            count: 0
                        };
                    }
                    
                    plantsData[rowPlant].totalSCC += scc * unitsGenerated;
                    plantsData[rowPlant].totalSHR += shr * unitsGenerated;
                    plantsData[rowPlant].totalUnits += unitsGenerated;
                    plantsData[rowPlant].count++;
                    
                    // Add to PSPCL totals
                    psppclTotalSCC += scc * unitsGenerated;
                    psppclTotalUnits += unitsGenerated;
                }
            });
        }
        
        // Calculate PSPCL weighted average GCV from Quality&CostAnalysis1
        if (QualityCostData1 && QualityCostData1.length > 0) {
            let totalWeightedGCV = 0;
            let totalQty = 0;
            
            QualityCostData1.forEach(row => {
                if (!row || row.length < 12) return;
                
                const rowMonth = row[0];
                const gcv = parseFloat(row[11]) || 0;
                const qtyReceived = parseFloat(row[4]) || 0;
                
                const rowDate = parseMonthYear(rowMonth);
                if (!rowDate) return;
                
                const rowMonthYear = new Date(rowDate.getFullYear(), rowDate.getMonth(), 1);
                const startMonthYear = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
                const endMonthYear = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
                
                const inRange = rowMonthYear >= startMonthYear && rowMonthYear <= endMonthYear;
                
                if (inRange && gcv > 0 && qtyReceived > 0) {
                    totalWeightedGCV += gcv * qtyReceived;
                    totalQty += qtyReceived;
                }
            });
            
            psppclWeightedGCV = totalQty > 0 ? totalWeightedGCV / totalQty : 0;
        }
        
        // Calculate averages for each plant
        Object.keys(plantsData).forEach(plant => {
            const data = plantsData[plant];
            data.avgSCC = data.totalUnits > 0 ? data.totalSCC / data.totalUnits : 0;
            data.avgSHR = data.totalUnits > 0 ? data.totalSHR / data.totalUnits : 0;
        });
        
        // Calculate PSPCL overall values
        const psppclAvgSCC = psppclTotalUnits > 0 ? psppclTotalSCC / psppclTotalUnits : 0;
        const psppclSHR = getWeightedAverageSHRForPlant('PSPCL');
        const psppclSHRtoGCVRatio = psppclWeightedGCV > 0 ? psppclSHR / psppclWeightedGCV : 0;
        
        // Prepare summary data array
        const summaryData = [];
        
        // Add plant-wise data
        const sortedPlants = Object.keys(plantsData).sort();
        sortedPlants.forEach(plant => {
            const data = plantsData[plant];
            summaryData.push({
                parameter: `${plant} - SCC`,
                value: data.avgSCC > 0 ? data.avgSCC.toFixed(3) : '-',
                unit: 'Kg/kWh'
            });
            summaryData.push({
                parameter: `${plant} - SHR`,
                value: data.avgSHR > 0 ? data.avgSHR.toFixed(2) : '-',
                unit: 'Kg/kWh'
            });
            summaryData.push({
                parameter: `${plant} - Units Generated`,
                value: data.totalUnits.toFixed(2),
                unit: 'Lus'
            });
        });
        
        // Add PSPCL totals
        summaryData.push({
            parameter: 'PSPCL - SCC',
            value: psppclSHRtoGCVRatio.toFixed(6),
            unit: 'Kg/kWh'
        });
        summaryData.push({
            parameter: 'PSPCL - SHR',
            value: psppclSHR.toFixed(2),
            unit: 'Kg/kWh'
        });
        summaryData.push({
            parameter: 'PSPCL - Total Units Generated',
            value: psppclTotalUnits.toFixed(2),
            unit: 'Lus'
        });
        summaryData.push({
            parameter: 'PSPCL - Weighted Average GCV',
            value: psppclWeightedGCV.toFixed(2),
            unit: 'Kcal/Kg'
        });
        
        return summaryData;
        
    } catch (error) {
        console.error('Error getting summary data:', error);
        return [];
    }
}

// Complete PDF Generation Function from Scratch
function QCGeneratePDFFromScratch() {
    try {
        // Check if jsPDF is available
        if (typeof window.jspdf === 'undefined') {
            alert('PDF library not loaded. Please ensure jsPDF is included.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4'); // Portrait, mm units, A4 size
        
        // Page settings
        const pageWidth = doc.internal.pageSize.width; // 210mm for A4
        const pageHeight = doc.internal.pageSize.height; // 297mm for A4
        const margin = 10;
        let currentY = 20;
        
        // Get current data - only what's visible on the web page
        const processedData = QCGetProcessedData();
        const visibleColumns = QCGetVisibleColumns(false); // This respects user's column selection
        
        if (!processedData || processedData.length === 0) {
            alert('No data to export. Please select a valid date range and ensure data is loaded.');
            return;
        }
        
        // Get period information
        const startMonth = document.getElementById('QCStartMonth').value;
        const endMonth = document.getElementById('QCEndMonth').value;
        const startDisplay = formatMonthForDisplay(startMonth);
        const endDisplay = formatMonthForDisplay(endMonth);
        
        let periodText = '';
        if (startDisplay === endDisplay) {
            periodText = `during ${startDisplay}`;
        } else {
            periodText = `from ${startDisplay} to ${endDisplay}`;
        }
        
        // Add main title
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        const mainTitle = "Coal Quality & Cost Analysis Report";
        const titleWidth = doc.getTextWidth(mainTitle);
        doc.text(mainTitle, (pageWidth - titleWidth) / 2, currentY);
        currentY += 8;
        
        // Add period subtitle
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        const subtitle = `Details of coal received at PSPCL thermal power stations ${periodText}`;
        const subtitleLines = doc.splitTextToSize(subtitle, pageWidth - 2 * margin);
        subtitleLines.forEach(line => {
            const lineWidth = doc.getTextWidth(line);
            doc.text(line, (pageWidth - lineWidth) / 2, currentY);
            currentY += 5;
        });
        currentY += 5;
        
        // Check if autoTable plugin is available
        if (typeof doc.autoTable !== 'function') {
            alert('PDF table plugin not loaded. Please ensure jsPDF autoTable plugin is included.');
            return;
        }
        
        // Prepare main table data
        const headers = visibleColumns.map(col => col.header);
        const tableData = [];
        
        // Process each row of data
        processedData.forEach(row => {
            const rowData = visibleColumns.map(col => {
                let value = '';
                
                if (col.index <= 14) {
                    // Original data columns
                    value = row[col.index] !== undefined && row[col.index] !== '' ? row[col.index] : '';
                    
                    // Apply plant name shortening for column 1
                    if (col.index === 1) {
                        value = shortenPlantName(value);
                    }
                    
                    // Format numbers for better display
                    if (col.index >= 3 && col.index <= 14 && !isNaN(parseFloat(value))) {
                        if (col.index === 3 || col.index === 4) { // Qty columns - 4 decimals
                            value = parseFloat(value).toFixed(4);
                        } else if (col.index === 5) { // Rakes - integer
                            value = Math.round(parseFloat(value)).toString();
                        } else if (col.index === 11 || col.index === 12 || col.index === 13) { // GCV, Coal Cost, Railway Freight - integer
                            value = Math.round(parseFloat(value)).toString();
                        } else {
                            value = parseFloat(value).toFixed(2);
                        }
                    }
                } else {
                    // Extended/calculated columns
                    const coalCost = parseFloat(row[12]) || 0;
                    const railwayFreight = parseFloat(row[13]) || 0;
                    const gcv = parseFloat(row[11]) || 1;
                    const plantName = row[1] || 'PSPCL';
                    
                    // Determine SHR based on consolidation
                    const consolidateCoalCompany = document.getElementById('QCConsolidateCoalCompany').checked;
                    const consolidatePlant = document.getElementById('QCConsolidatePlant').checked;
                    
                    let shr;
                    if (consolidateCoalCompany && !consolidatePlant) {
                        const coalCompany = row[2];
                        const coalCompanyRows = processedData.filter(r => r[2] === coalCompany);
                        shr = getWeightedAverageSHRForCoalCompany(coalCompany, coalCompanyRows);
                    } else {
                        shr = getWeightedAverageSHRForPlant(plantName);
                    }
                    
                    switch (col.index) {
                        case 15: // Landed Cost Rs/MT
                            value = (coalCost + railwayFreight).toFixed(0);
                            break;
                        case 16: // Landed Cost Rs/Mcal
                            const landedCostPerMT = coalCost + railwayFreight;
                            value = gcv > 0 ? (landedCostPerMT / gcv).toFixed(4) : '0.0000';
                            break;
                        case 17: // Per Unit Cost
                            const landedCostPerMcal = gcv > 0 ? (coalCost + railwayFreight) / gcv : 0;
                            value = (shr * landedCostPerMcal / 1000).toFixed(3);
                            break;
                        case 18: // Total Amount (Rs. Crore)
                            const qtyReceived = parseFloat(row[4]) || 0;
                            const landedCostTotal = coalCost + railwayFreight;
                            const totalAmount = (qtyReceived * landedCostTotal) / 100;
                            value = totalAmount.toFixed(2);
                            break;
                        default:
                            value = '';
                    }
                }
                
                return String(value);
            });
            
            tableData.push(rowData);
        });
        
        // Add Grand Total row if multiple entries exist
        if (processedData.length > 1) {
            const consolidatePlant = document.getElementById('QCConsolidatePlant').checked;
            const consolidateCoalCompany = document.getElementById('QCConsolidateCoalCompany').checked;
            
            // Add totals based on current display mode
            if (!consolidatePlant && !consolidateCoalCompany) {
                // No consolidation: add grand total only if multiple coal companies
                const uniqueCoalCompanies = [...new Set(processedData.map(row => row[2]))];
                if (uniqueCoalCompanies.length > 1) {
                    const totalRow = QCCalculateTotalRow(processedData, 'Grand Total', visibleColumns);
                    if (totalRow) {
                        const totalRowData = QCFormatTotalRowForPDF(totalRow, visibleColumns);
                        tableData.push(totalRowData);
                    }
                }
            } else if (consolidateCoalCompany && !consolidatePlant) {
                // Coal company consolidation: add grand total if multiple companies
                const uniqueCoalCompanies = [...new Set(processedData.map(row => row[2]))];
                if (uniqueCoalCompanies.length > 1) {
                    const totalRow = QCCalculateTotalRow(processedData, 'Grand Total', visibleColumns);
                    if (totalRow) {
                        const totalRowData = QCFormatTotalRowForPDF(totalRow, visibleColumns);
                        tableData.push(totalRowData);
                    }
                }
            } else if (consolidatePlant) {
                // Plant consolidation: add grand total if multiple plants
                const uniquePlants = [...new Set(processedData.map(row => row[1]))];
                if (uniquePlants.length > 1) {
                    const totalRow = QCCalculateTotalRow(processedData, 'Grand Total', visibleColumns);
                    if (totalRow) {
                        const totalRowData = QCFormatTotalRowForPDF(totalRow, visibleColumns);
                        tableData.push(totalRowData);
                    }
                }
            }
        }
        
        // Calculate optimal column widths
        const tableWidth = pageWidth - 2 * margin;
        const columnWidths = QCCalculateOptimalColumnWidths(visibleColumns, tableWidth);
        
        // Generate main data table
        doc.autoTable({
            head: [headers],
            body: tableData,
            startY: currentY,
            margin: { left: margin, right: margin },
            tableWidth: 'auto',
            styles: {
                fontSize: 6,
                cellPadding: 1,
                overflow: 'linebreak',
                halign: 'center',
                valign: 'middle',
                lineWidth: 0.1,
                lineColor: [128, 128, 128]
            },
            headStyles: {
                fillColor: [65, 105, 225], // Royal Blue
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 7,
                halign: 'center'
            },
            alternateRowStyles: {
                fillColor: [248, 249, 250]
            },
            columnStyles: columnWidths,
            didDrawPage: function (data) {
                // Store Y position after main table
                window.mainTableEndY = data.cursor.y;
            }
        });
        
        // Add summary table if it exists and is visible
        const summaryTableElement = document.getElementById('QC-summary-table');
        if (summaryTableElement && summaryTableElement.innerHTML.trim()) {
            const summaryData = QCGetSummaryTableDataForPDF();
            if (summaryData && summaryData.length > 0) {
                let summaryStartY = window.mainTableEndY + 15;
                
                // Check if summary table fits on current page
                const estimatedSummaryHeight = (summaryData.length + 1) * 8 + 20;
                if (summaryStartY + estimatedSummaryHeight > pageHeight - 20) {
                    doc.addPage();
                    summaryStartY = 20;
                }
                
                // Add summary table title
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                const summaryTitle = "Summary - Station Heat Rate (SHR) Details";
                const summaryTitleWidth = doc.getTextWidth(summaryTitle);
                doc.text(summaryTitle, (pageWidth - summaryTitleWidth) / 2, summaryStartY);
                summaryStartY += 10;
                
                // Generate summary table
                doc.autoTable({
                    head: [summaryData.headers],
                    body: summaryData.rows,
                    startY: summaryStartY,
                    margin: { left: margin + 20, right: margin + 20 },
                    styles: {
                        fontSize: 8,
                        cellPadding: 2,
                        halign: 'center',
                        valign: 'middle',
                        lineWidth: 0.1,
                        lineColor: [128, 128, 128]
                    },
                    headStyles: {
                        fillColor: [65, 105, 225],
                        textColor: [255, 255, 255],
                        fontStyle: 'bold',
                        fontSize: 9
                    },
                    columnStyles: {
                        0: { halign: 'left' }  // First column left-aligned
                    }
                });
            }
        }
        
        // Add footer with page numbers and generation date
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            
            // Generation date (left)
            doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, pageHeight - 10);
            
            // Page number (right)
            const pageText = `Page ${i} of ${pageCount}`;
            const pageTextWidth = doc.getTextWidth(pageText);
            doc.text(pageText, pageWidth - margin - pageTextWidth, pageHeight - 10);
        }
        
        // Save the PDF
        const filename = `Coal_Quality_Analysis_${startDisplay}_to_${endDisplay}.pdf`.replace(/[^a-zA-Z0-9_-]/g, '_');
        doc.save(filename);
        
        console.log('PDF generated successfully');
        
    } catch (error) {
        console.error('PDF generation error:', error);
        alert(`Error generating PDF: ${error.message}`);
    }
}

// Helper function to calculate optimal column widths for PDF
function QCCalculateOptimalColumnWidths(visibleColumns, totalWidth) {
    const columnStyles = {};
    
    // Define preferred widths for different column types
    const getPreferredWidth = (column) => {
        const header = column.header.toLowerCase();
        
        if (header.includes('plant name')) return 25;
        if (header.includes('coal company')) return 22;
        if (header.includes('qty') && header.includes('lakh')) return 15;
        if (header.includes('rakes')) return 12;
        if (header.includes('transit loss')) return 12;
        if (header.includes('moisture') || header.includes('ash') || header.includes('volatile') || header.includes('fixed carbon')) return 10;
        if (header.includes('gcv')) return 12;
        if (header.includes('cost') || header.includes('freight')) return 15;
        if (header.includes('distance')) return 12;
        if (header.includes('landed cost')) return 15;
        if (header.includes('per unit cost')) return 15;
        if (header.includes('total amount')) return 18;
        
        return 12; // Default width
    };
    
    // Calculate total preferred width
    let totalPreferredWidth = 0;
    const preferredWidths = visibleColumns.map(col => {
        const width = getPreferredWidth(col);
        totalPreferredWidth += width;
        return width;
    });
    
    // Scale widths if they exceed available space
    const scaleFactor = totalPreferredWidth > totalWidth ? totalWidth / totalPreferredWidth : 1;
    
    // Apply scaled widths
    visibleColumns.forEach((col, index) => {
        const finalWidth = Math.max(preferredWidths[index] * scaleFactor, 8); // Minimum 8mm
        columnStyles[index] = { cellWidth: finalWidth };
    });
    
    return columnStyles;
}

// Helper function to format total row for PDF
function QCFormatTotalRowForPDF(totalRow, visibleColumns) {
    return visibleColumns.map(col => {
        if (col.index === 1) {
            return 'Grand Total';
        } else if (col.index === 2) {
            return '';
        } else if (col.index <= 14) {
            const val = parseFloat(totalRow[col.index]);
            if (!isNaN(val)) {
                if (col.index === 3 || col.index === 4) {
                    return val.toFixed(4);
                } else if (col.index === 5) {
                    return Math.round(val).toString();
                } else if (col.index === 11 || col.index === 12 || col.index === 13) {
                    return Math.round(val).toString();
                } else {
                    return val.toFixed(2);
                }
            }
            return '';
        } else {
            // Calculate extended columns for total
            const coalCost = parseFloat(totalRow[12]) || 0;
            const railwayFreight = parseFloat(totalRow[13]) || 0;
            const gcv = parseFloat(totalRow[11]) || 1;
            const shr = getWeightedAverageSHRForPlant('PSPCL');
            
            switch (col.index) {
                case 15:
                    return (coalCost + railwayFreight).toFixed(0);
                case 16:
                    const landedCostPerMT = coalCost + railwayFreight;
                    return gcv > 0 ? (landedCostPerMT / gcv).toFixed(4) : '0.0000';
                case 17:
                    const landedCostPerMcal = gcv > 0 ? (coalCost + railwayFreight) / gcv : 0;
                    return (shr * landedCostPerMcal / 1000).toFixed(3);
                case 18:
                    // Total Amount (Rs. Crore) = Qty Received * Landed Cost (Rs/MT) / 10000000
                    const qtyReceived = parseFloat(totalRow[4]) || 0; // Qty Received in Lakh MT
                    const landedCostTotal = coalCost + railwayFreight;
                    const totalAmount = (qtyReceived * landedCostTotal) / 100; // Convert Lakh MT to MT then divide by 10000000 for crore = divide by 100
                    return totalAmount.toFixed(2);
                default:
                    return '';
            }
        }
    });
}

// Helper function to get summary table data for PDF
function QCGetSummaryTableDataForPDF() {
    try {
        const summaryTableElement = document.getElementById('QC-summary-table');
        if (!summaryTableElement || !summaryTableElement.innerHTML.trim()) {
            return null;
        }
        
        // Extract data from the actual summary table in the DOM
        const table = summaryTableElement.querySelector('table');
        if (!table) return null;
        
        const headers = [];
        const rows = [];
        
        // Get headers
        const headerRow = table.querySelector('thead tr');
        if (headerRow) {
            const headerCells = headerRow.querySelectorAll('th');
            headerCells.forEach(cell => {
                headers.push(cell.textContent.trim());
            });
        }
        
        // Get data rows
        const bodyRows = table.querySelectorAll('tbody tr');
        bodyRows.forEach(row => {
            const rowData = [];
            const cells = row.querySelectorAll('td');
            cells.forEach(cell => {
                rowData.push(cell.textContent.trim());
            });
            if (rowData.length > 0) {
                rows.push(rowData);
            }
        });
        
        return { headers, rows };
        
    } catch (error) {
        console.error('Error extracting summary table data:', error);
        return null;
    }
}

// Excel Export Function
function QCExportToExcel() {
    try {
        // Check if SheetJS is available
        if (typeof XLSX === 'undefined') {
            alert('Excel library not loaded. Please ensure SheetJS is included.');
            return;
        }
        
        // Get current data and visible columns
        const processedData = QCGetProcessedData();
        const visibleColumns = QCGetVisibleColumns(false);
        
        if (!processedData || processedData.length === 0) {
            alert('No data to export. Please select a valid date range and ensure data is loaded.');
            return;
        }
        
        // Prepare headers
        const headers = visibleColumns.map(col => col.header);
        
        // Prepare data rows
        const excelData = [];
        excelData.push(headers); // Add headers as first row
        
        // Process each row of data
        processedData.forEach(row => {
            const rowData = visibleColumns.map(col => {
                let value = '';
                
                if (col.index <= 14) {
                    // Original data columns
                    value = row[col.index] !== undefined && row[col.index] !== '' ? row[col.index] : '';
                    
                    // Apply plant name shortening for column 1
                    if (col.index === 1) {
                        value = shortenPlantName(value);
                    }
                    
                    // Keep numbers as numbers for Excel
                    if (col.index >= 3 && col.index <= 14 && !isNaN(parseFloat(value))) {
                        value = parseFloat(value);
                    }
                } else {
                    // Extended/calculated columns
                    const coalCost = parseFloat(row[12]) || 0;
                    const railwayFreight = parseFloat(row[13]) || 0;
                    const gcv = parseFloat(row[11]) || 1;
                    const plantName = row[1] || 'PSPCL';
                    
                    // Determine SHR based on consolidation
                    const consolidateCoalCompany = document.getElementById('QCConsolidateCoalCompany').checked;
                    const consolidatePlant = document.getElementById('QCConsolidatePlant').checked;
                    
                    let shr;
                    if (consolidateCoalCompany && !consolidatePlant) {
                        const coalCompany = row[2];
                        const coalCompanyRows = processedData.filter(r => r[2] === coalCompany);
                        shr = getWeightedAverageSHRForCoalCompany(coalCompany, coalCompanyRows);
                    } else {
                        shr = getWeightedAverageSHRForPlant(plantName);
                    }
                    
                    switch (col.index) {
                        case 15: // Landed Cost Rs/MT
                            value = coalCost + railwayFreight;
                            break;
                        case 16: // Landed Cost Rs/Mcal
                            const landedCostPerMT = coalCost + railwayFreight;
                            value = gcv > 0 ? landedCostPerMT / gcv : 0;
                            break;
                        case 17: // Per Unit Cost
                            const landedCostPerMcal = gcv > 0 ? (coalCost + railwayFreight) / gcv : 0;
                            value = shr * landedCostPerMcal / 1000;
                            break;
                        case 18: // Total Amount (Rs. Crore)
                            const qtyReceived = parseFloat(row[4]) || 0;
                            const landedCostTotal = coalCost + railwayFreight;
                            value = (qtyReceived * landedCostTotal) / 100;
                            break;
                        default:
                            value = '';
                    }
                }
                
                return value;
            });
            
            excelData.push(rowData);
        });
        
        // Add total row if multiple entries exist
        if (processedData.length > 1) {
            const totalRow = QCCalculateTotalRow(processedData, 'Grand Total', visibleColumns);
            if (totalRow) {
                const totalRowData = visibleColumns.map(col => {
                    if (col.index === 1) {
                        return 'Grand Total';
                    } else if (col.index === 2) {
                        return '';
                    } else if (col.index <= 14) {
                        const val = parseFloat(totalRow[col.index]);
                        return !isNaN(val) ? val : '';
                    } else {
                        // Calculate extended columns for total
                        const coalCost = parseFloat(totalRow[12]) || 0;
                        const railwayFreight = parseFloat(totalRow[13]) || 0;
                        const gcv = parseFloat(totalRow[11]) || 1;
                        const shr = getWeightedAverageSHRForPlant('PSPCL');
                        
                        switch (col.index) {
                            case 15:
                                return coalCost + railwayFreight;
                            case 16:
                                const landedCostPerMT = coalCost + railwayFreight;
                                return gcv > 0 ? landedCostPerMT / gcv : 0;
                            case 17:
                                const landedCostPerMcal = gcv > 0 ? (coalCost + railwayFreight) / gcv : 0;
                                return shr * landedCostPerMcal / 1000;
                            case 18:
                                const qtyReceived = parseFloat(totalRow[4]) || 0;
                                const landedCostTotal = coalCost + railwayFreight;
                                return (qtyReceived * landedCostTotal) / 100;
                            default:
                                return '';
                        }
                    }
                });
                excelData.push(totalRowData);
            }
        }
        
        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(excelData);
        
        // Add the worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Coal Quality Analysis');
        
        // Generate filename
        const startMonth = document.getElementById('QCStartMonth').value;
        const endMonth = document.getElementById('QCEndMonth').value;
        const startDisplay = formatMonthForDisplay(startMonth);
        const endDisplay = formatMonthForDisplay(endMonth);
        const filename = `Coal_Quality_Analysis_${startDisplay}_to_${endDisplay}.xlsx`.replace(/[^a-zA-Z0-9_.-]/g, '_');
        
        // Save the file
        XLSX.writeFile(workbook, filename);
        
        console.log('Excel file generated successfully');
        
    } catch (error) {
        console.error('Excel export error:', error);
        alert(`Error generating Excel file: ${error.message}`);
    }
}

// Show Special Report Modal
function QCShowSpecialReportModal() {
    // Set default dates to current period
    const startMonth = document.getElementById('QCStartMonth').value;
    const endMonth = document.getElementById('QCEndMonth').value;
    
    if (startMonth && endMonth) {
        // Convert the Google Sheets date format to month input format
        const startDate = parseMonthYear(startMonth);
        const endDate = parseMonthYear(endMonth);
        
        if (startDate && endDate) {
            const startFormatted = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
            const endFormatted = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`;
            
            document.getElementById('QCSpecialFromDate').value = startFormatted;
            document.getElementById('QCSpecialToDate').value = endFormatted;
        }
    }
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('QCSpecialReportModal'));
    modal.show();
    
    // Populate selection options
    QCPopulateSpecialReportSelections();
    
    // Restore saved preferences after populating selections
    QCRestoreModalPreferences();
    
    // Set up the generate button listener
    document.getElementById('QCGenerateSpecialReport').onclick = QCGenerateSpecialReport;
}

// Save Modal Preferences to localStorage
function QCSaveModalPreferences() {
    const preferences = {
        // Date preferences
        fromDate: document.getElementById('QCSpecialFromDate').value,
        toDate: document.getElementById('QCSpecialToDate').value,
        
        // Grouping preferences
        grouping: document.querySelector('input[name="QCSpecialGrouping"]:checked')?.value || 'month',
        
        // Consolidation preferences
        plantWise: document.getElementById('QCSpecialPlantWise').checked,
        coalCompanyWise: document.getElementById('QCSpecialCoalCompanyWise').checked,
        
        // Export preferences
        exportPDF: document.getElementById('QCSpecialExportPDF').checked,
        exportExcel: document.getElementById('QCSpecialExportExcel').checked,
        
        // Selection preferences
        selectedPlants: [],
        selectedCoalCompanies: [],
        selectedColumns: []
    };
    
    // Get selected plants
    const plantCheckboxes = document.querySelectorAll('#QCPlantSelection input[type="checkbox"]');
    plantCheckboxes.forEach(cb => {
        if (cb.checked) {
            preferences.selectedPlants.push(cb.value);
        }
    });
    
    // Get selected coal companies
    const coalCompanyCheckboxes = document.querySelectorAll('#QCCoalCompanySelection input[type="checkbox"]');
    coalCompanyCheckboxes.forEach(cb => {
        if (cb.checked) {
            preferences.selectedCoalCompanies.push(cb.value);
        }
    });
    
    // Get selected columns
    const columnCheckboxes = document.querySelectorAll('#QCColumnSelection input[type="checkbox"]');
    columnCheckboxes.forEach(cb => {
        if (cb.checked) {
            preferences.selectedColumns.push(cb.value);
        }
    });
    
    // Save to localStorage
    localStorage.setItem('QCSpecialReportPreferences', JSON.stringify(preferences));
    console.log('Modal preferences saved:', preferences);
}

// Restore Modal Preferences from localStorage
function QCRestoreModalPreferences() {
    try {
        const savedPreferences = localStorage.getItem('QCSpecialReportPreferences');
        if (!savedPreferences) {
            console.log('No saved preferences found');
            return;
        }
        
        const preferences = JSON.parse(savedPreferences);
        console.log('Restoring modal preferences:', preferences);
        
        // Restore date preferences
        if (preferences.fromDate) {
            document.getElementById('QCSpecialFromDate').value = preferences.fromDate;
        }
        if (preferences.toDate) {
            document.getElementById('QCSpecialToDate').value = preferences.toDate;
        }
        
        // Restore grouping preferences
        if (preferences.grouping) {
            const groupingRadio = document.querySelector(`input[name="QCSpecialGrouping"][value="${preferences.grouping}"]`);
            if (groupingRadio) {
                groupingRadio.checked = true;
            }
        }
        
        // Restore consolidation preferences
        if (preferences.plantWise !== undefined) {
            document.getElementById('QCSpecialPlantWise').checked = preferences.plantWise;
        }
        if (preferences.coalCompanyWise !== undefined) {
            document.getElementById('QCSpecialCoalCompanyWise').checked = preferences.coalCompanyWise;
        }
        
        // Restore export preferences
        if (preferences.exportPDF !== undefined) {
            document.getElementById('QCSpecialExportPDF').checked = preferences.exportPDF;
        }
        if (preferences.exportExcel !== undefined) {
            document.getElementById('QCSpecialExportExcel').checked = preferences.exportExcel;
        }
        
        // Restore plant selections (only if preferences exist, otherwise keep default checked state)
        if (preferences.selectedPlants && preferences.selectedPlants.length >= 0) {
            // First uncheck all plants
            document.querySelectorAll('.plant-checkbox').forEach(cb => cb.checked = false);
            // Then check the saved ones
            preferences.selectedPlants.forEach(plantValue => {
                const checkbox = document.querySelector(`.plant-checkbox[value="${plantValue}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
        
        // Restore coal company selections (only if preferences exist, otherwise keep default checked state)
        if (preferences.selectedCoalCompanies && preferences.selectedCoalCompanies.length >= 0) {
            // First uncheck all coal companies
            document.querySelectorAll('.coal-company-checkbox').forEach(cb => cb.checked = false);
            // Then check the saved ones
            preferences.selectedCoalCompanies.forEach(companyValue => {
                const checkbox = document.querySelector(`.coal-company-checkbox[value="${companyValue}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
        
        // Restore column selections (only if preferences exist, otherwise keep default checked state)
        if (preferences.selectedColumns && preferences.selectedColumns.length >= 0) {
            // First uncheck all columns
            document.querySelectorAll('.column-checkbox').forEach(cb => cb.checked = false);
            // Then check the saved ones
            preferences.selectedColumns.forEach(columnValue => {
                const checkbox = document.querySelector(`.column-checkbox[value="${columnValue}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
        
    } catch (error) {
        console.error('Error restoring modal preferences:', error);
    }
}

// Populate Special Report Selection Options
function QCPopulateSpecialReportSelections() {
    console.log("QCPopulateSpecialReportSelections called");
    
    // Check if containers exist
    const plantContainer = document.getElementById('QCPlantSelection');
    const coalCompanyContainer = document.getElementById('QCCoalCompanySelection');
    const columnContainer = document.getElementById('QCColumnSelection');
    
    console.log("Containers found:", {
        plant: !!plantContainer,
        coalCompany: !!coalCompanyContainer,
        column: !!columnContainer
    });
    
    if (!plantContainer || !coalCompanyContainer || !columnContainer) {
        console.error("Selection containers not found in DOM");
        return;
    }
    
    // Get unique plants and coal companies from the available data
    const allData = [...(QualityCostData1 || []), ...(QualityCostData2 || [])];
    const uniquePlants = [...new Set(allData.map(row => row[1]).filter(plant => plant && plant !== ''))].sort();
    
    // Filter coal companies to only include non-numeric values (actual company names)
    const uniqueCoalCompanies = [...new Set(allData.map(row => row[2])
        .filter(company => company && 
                          company !== '' && 
                          typeof company === 'string' && 
                          isNaN(parseFloat(company)) && // Exclude numeric values
                          company.length > 1))].sort(); // Ensure it's more than 1 character
    
    console.log("Data found:", {
        totalRows: allData.length,
        plants: uniquePlants.length,
        companies: uniqueCoalCompanies.length,
        samplePlants: uniquePlants.slice(0, 3),
        sampleCompanies: uniqueCoalCompanies.slice(0, 3)
    });
    
    // Column options (based on the headers used in reports)
    const columnOptions = [
        { key: 'Date', label: 'Date', checked: true },
        { key: 'Plant', label: 'Plant', checked: true },
        { key: 'Coal Company', label: 'Coal Company', checked: true },
        { key: 'Qty Dispatched (MT)', label: 'Qty Dispatched (MT)', checked: true },
        { key: 'Qty Received (MT)', label: 'Qty Received (MT)', checked: true },
        { key: 'Rakes Received', label: 'Rakes Received', checked: true },
        { key: 'GCV (Kcal/Kg)', label: 'GCV (Kcal/Kg)', checked: true },
        { key: 'Ash %', label: 'Ash %', checked: true },
        { key: 'Moisture %', label: 'Moisture %', checked: true },
        { key: 'Coal Cost (Rs/MT)', label: 'Coal Cost (Rs/MT)', checked: true },
        { key: 'Railway Freight (Rs/MT)', label: 'Railway Freight (Rs/MT)', checked: true },
        { key: 'Transit Loss %', label: 'Transit Loss %', checked: true },
        { key: 'Landed Cost Rs/MT', label: 'Landed Cost Rs/MT', checked: true },
        { key: 'Landed Cost Rs/Mcal', label: 'Landed Cost Rs/Mcal', checked: true },
        { key: 'Per Unit Cost', label: 'Per Unit Cost', checked: true },
        { key: 'Total Amount (Rs. Crore)', label: 'Total Amount (Rs. Crore)', checked: true }
    ];
    
    // Populate plant selection
    plantContainer.innerHTML = '';
    console.log("Populating plant container with", uniquePlants.length, "plants");
    uniquePlants.forEach((plant, index) => {
        const div = document.createElement('div');
        div.className = 'form-check';
        const safeId = `plant_${index}`;
        div.innerHTML = `
            <input class="form-check-input plant-checkbox" type="checkbox" value="${plant}" id="${safeId}" checked>
            <label class="form-check-label" for="${safeId}">${plant}</label>
        `;
        plantContainer.appendChild(div);
    });
    
    // Populate coal company selection
    coalCompanyContainer.innerHTML = '';
    console.log("Populating coal company container with", uniqueCoalCompanies.length, "companies");
    uniqueCoalCompanies.forEach((company, index) => {
        const div = document.createElement('div');
        div.className = 'form-check';
        const safeId = `company_${index}`;
        div.innerHTML = `
            <input class="form-check-input coal-company-checkbox" type="checkbox" value="${company}" id="${safeId}" checked>
            <label class="form-check-label" for="${safeId}">${company}</label>
        `;
        coalCompanyContainer.appendChild(div);
    });
    
    // Populate column selection
    columnContainer.innerHTML = '';
    console.log("Populating column container with", columnOptions.length, "columns");
    columnOptions.forEach((column, index) => {
        const div = document.createElement('div');
        div.className = 'form-check';
        const safeId = `column_${index}`;
        div.innerHTML = `
            <input class="form-check-input column-checkbox" type="checkbox" value="${column.key}" id="${safeId}" ${column.checked ? 'checked' : ''}>
            <label class="form-check-label" for="${safeId}">${column.label}</label>
        `;
        columnContainer.appendChild(div);
    });
    
    // Add event listeners for select/deselect all buttons
    document.getElementById('QCSelectAllPlants').onclick = () => {
        document.querySelectorAll('.plant-checkbox').forEach(cb => cb.checked = true);
        QCSaveModalPreferences(); // Save preferences after select all
    };
    document.getElementById('QCDeselectAllPlants').onclick = () => {
        document.querySelectorAll('.plant-checkbox').forEach(cb => cb.checked = false);
        QCSaveModalPreferences(); // Save preferences after deselect all
    };
    
    document.getElementById('QCSelectAllCoalCompanies').onclick = () => {
        document.querySelectorAll('.coal-company-checkbox').forEach(cb => cb.checked = true);
        QCSaveModalPreferences(); // Save preferences after select all
    };
    document.getElementById('QCDeselectAllCoalCompanies').onclick = () => {
        document.querySelectorAll('.coal-company-checkbox').forEach(cb => cb.checked = false);
        QCSaveModalPreferences(); // Save preferences after deselect all
    };
    
    document.getElementById('QCSelectAllColumns').onclick = () => {
        document.querySelectorAll('.column-checkbox').forEach(cb => cb.checked = true);
        QCSaveModalPreferences(); // Save preferences after select all
    };
    document.getElementById('QCDeselectAllColumns').onclick = () => {
        document.querySelectorAll('.column-checkbox').forEach(cb => cb.checked = false);
        QCSaveModalPreferences(); // Save preferences after deselect all
    };
    
    // Add event listeners to save preferences when individual checkboxes change
    document.querySelectorAll('.plant-checkbox, .coal-company-checkbox, .column-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', QCSaveModalPreferences);
    });
    
    // Add event listeners for form controls
    document.getElementById('QCSpecialFromDate').addEventListener('change', QCSaveModalPreferences);
    document.getElementById('QCSpecialToDate').addEventListener('change', QCSaveModalPreferences);
    document.getElementById('QCSpecialPlantWise').addEventListener('change', QCSaveModalPreferences);
    document.getElementById('QCSpecialCoalCompanyWise').addEventListener('change', QCSaveModalPreferences);
    document.getElementById('QCSpecialExportPDF').addEventListener('change', QCSaveModalPreferences);
    document.getElementById('QCSpecialExportExcel').addEventListener('change', QCSaveModalPreferences);
    
    // Add event listeners for radio buttons
    document.querySelectorAll('input[name="QCSpecialGrouping"]').forEach(radio => {
        radio.addEventListener('change', QCSaveModalPreferences);
    });
}

// Generate Special Report
function QCGenerateSpecialReport() {
    try {
        // Get form values
        const fromDate = document.getElementById('QCSpecialFromDate').value;
        const toDate = document.getElementById('QCSpecialToDate').value;
        const grouping = document.querySelector('input[name="QCSpecialGrouping"]:checked').value;
        const plantWise = document.getElementById('QCSpecialPlantWise').checked;
        const coalCompanyWise = document.getElementById('QCSpecialCoalCompanyWise').checked;
        const exportPDF = document.getElementById('QCSpecialExportPDF').checked;
        const exportExcel = document.getElementById('QCSpecialExportExcel').checked;
        
        // Get selected filters
        const selectedPlants = Array.from(document.querySelectorAll('.plant-checkbox:checked')).map(cb => cb.value);
        const selectedCoalCompanies = Array.from(document.querySelectorAll('.coal-company-checkbox:checked')).map(cb => cb.value);
        const selectedColumns = Array.from(document.querySelectorAll('.column-checkbox:checked')).map(cb => cb.value);
        
        // Save current preferences before generating report
        QCSaveModalPreferences();
        
        console.log("Selected filters:", {
            plants: selectedPlants,
            coalCompanies: selectedCoalCompanies,
            columns: selectedColumns,
            plantCount: selectedPlants.length,
            companyCount: selectedCoalCompanies.length,
            columnCount: selectedColumns.length
        });
        
        // Validate inputs
        if (!fromDate || !toDate) {
            alert('Please select both from and to dates.');
            return;
        }
        
        if (new Date(fromDate) > new Date(toDate)) {
            alert('From date cannot be after to date.');
            return;
        }
        
        if (!exportPDF && !exportExcel) {
            alert('Please select at least one export format.');
            return;
        }
        
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('QCSpecialReportModal'));
        modal.hide();
        
        // Show loading indication
        const loadingAlert = document.createElement('div');
        loadingAlert.className = 'alert alert-info position-fixed top-50 start-50 translate-middle';
        loadingAlert.style.zIndex = '9999';
        loadingAlert.innerHTML = '<i class="bi bi-hourglass-split"></i> Generating special report...';
        document.body.appendChild(loadingAlert);
        
        // Generate the report data
        setTimeout(() => {
            try {
                const reportData = QCPrepareSpecialReportData(fromDate, toDate, grouping, plantWise, coalCompanyWise, selectedPlants, selectedCoalCompanies, selectedColumns);
                
                if (exportPDF) {
                    QCGenerateSpecialReportPDF(reportData, fromDate, toDate, grouping, plantWise, coalCompanyWise);
                }
                
                if (exportExcel) {
                    QCGenerateSpecialReportExcel(reportData, fromDate, toDate, grouping, plantWise, coalCompanyWise);
                }
                
                // Remove loading indication
                document.body.removeChild(loadingAlert);
                
                // Show success message
                const successAlert = document.createElement('div');
                successAlert.className = 'alert alert-success position-fixed top-50 start-50 translate-middle';
                successAlert.style.zIndex = '9999';
                successAlert.innerHTML = '<i class="bi bi-check-circle"></i> Special report generated successfully!';
                document.body.appendChild(successAlert);
                
                setTimeout(() => {
                    if (document.body.contains(successAlert)) {
                        document.body.removeChild(successAlert);
                    }
                }, 3000);
                
            } catch (error) {
                console.error('Special report generation error:', error);
                document.body.removeChild(loadingAlert);
                alert(`Error generating special report: ${error.message}`);
            }
        }, 500);
        
    } catch (error) {
        console.error('Special report setup error:', error);
        alert(`Error setting up special report: ${error.message}`);
    }
}

// Calculate totals and averages for a group of data
function QCCalculateGroupTotals(dataArray) {
    if (!dataArray || dataArray.length === 0) {
        return null;
    }
    
    // Initialize totals object
    const totals = {
        rowCount: dataArray.length,
        qtyDispatched: 0,       // Index 3 - should be summed
        qtyReceived: 0,         // Index 4 - should be summed (not averaged)
        rakesReceived: 0,       // Index 5 - should be summed
        transitLoss: { sum: 0, count: 0, avg: 0 },  // Index 6 - should be averaged
        moisture: { sum: 0, count: 0, avg: 0 },     // Index 7 - weighted average
        ash: { sum: 0, count: 0, avg: 0 },          // Index 8 - weighted average
        vm: { sum: 0, count: 0, avg: 0 },           // Index 9 - weighted average
        fc: { sum: 0, count: 0, avg: 0 },           // Index 10 - weighted average
        gcv: { sum: 0, count: 0, avg: 0 },          // Index 11 - weighted average
        coalCost: { sum: 0, count: 0, avg: 0 },     // Index 12 - weighted average
        railwayFreight: { sum: 0, count: 0, avg: 0 }, // Index 13 - weighted average
        distance: { sum: 0, count: 0, avg: 0 },     // Index 14 - weighted average
        // Extended calculated columns
        landedCostPerMT: { sum: 0, count: 0, avg: 0 },
        landedCostPerMcal: { sum: 0, count: 0, avg: 0 },
        perUnitCost: { sum: 0, count: 0, avg: 0 },
        totalAmount: 0
    };
    
    // Calculate sums and counts
    dataArray.forEach(row => {
        // Direct sums for quantities
        const qtyDispatched = parseFloat(row[3]) || 0;
        const qtyReceived = parseFloat(row[4]) || 0;
        const rakesReceived = parseFloat(row[5]) || 0;
        const coalCost = parseFloat(row[12]) || 0;
        const railwayFreight = parseFloat(row[13]) || 0;
        const gcv = parseFloat(row[11]) || 1;
        const plantName = row[1] || 'PSPCL';
        
        // Sum quantities and rakes
        totals.qtyDispatched += qtyDispatched;
        totals.qtyReceived += qtyReceived;
        totals.rakesReceived += rakesReceived;
        
        // Calculate extended columns for each row
        const landedCostPerMT = coalCost + railwayFreight;
        const landedCostPerMcal = gcv > 0 ? landedCostPerMT / gcv : 0;
        const shr = getWeightedAverageSHRForPlant(plantName);
        const perUnitCost = shr * landedCostPerMcal / 1000;
        const totalAmount = (qtyReceived * landedCostPerMT) / 100;
        
        totals.totalAmount += totalAmount;
        
        // Weighted averages for quality parameters and costs (weighted by qtyReceived)
        if (qtyReceived > 0) {
            // Add to weighted averages
            const addToWeightedAverage = (value, property, weight) => {
                const numValue = parseFloat(value);
                if (!isNaN(numValue)) {
                    totals[property].sum += numValue * weight;
                    totals[property].count += weight;
                }
            };
            
            addToWeightedAverage(row[6], 'transitLoss', qtyReceived);  // Transit Loss
            addToWeightedAverage(row[7], 'moisture', qtyReceived);     // Moisture
            addToWeightedAverage(row[8], 'ash', qtyReceived);          // Ash
            addToWeightedAverage(row[9], 'vm', qtyReceived);           // Volatile Matter
            addToWeightedAverage(row[10], 'fc', qtyReceived);          // Fixed Carbon
            addToWeightedAverage(row[11], 'gcv', qtyReceived);         // GCV
            addToWeightedAverage(row[12], 'coalCost', qtyReceived);    // Coal Cost
            addToWeightedAverage(row[13], 'railwayFreight', qtyReceived); // Railway Freight
            addToWeightedAverage(row[14], 'distance', qtyReceived);    // Distance
        }
    });
    
    // Calculate weighted averages
    Object.keys(totals).forEach(key => {
        if (typeof totals[key] === 'object' && totals[key].count > 0) {
            totals[key].avg = totals[key].sum / totals[key].count;
        }
    });
    
    // Calculate extended columns from total values (not weighted averages)
    const totalCoalCost = totals.coalCost.avg || 0;
    const totalRailwayFreight = totals.railwayFreight.avg || 0;
    const totalGCV = totals.gcv.avg || 1;
    
    // Landed Cost Rs/MT = Coal Cost + Railway Freight
    totals.landedCostPerMT = {
        sum: 0,
        count: 0,
        avg: totalCoalCost + totalRailwayFreight
    };
    
    // Landed Cost Rs/Mcal = Landed Cost Rs/MT / GCV
    totals.landedCostPerMcal = {
        sum: 0,
        count: 0,
        avg: totalGCV > 0 ? (totalCoalCost + totalRailwayFreight) / totalGCV : 0
    };
    
    // Per Unit Cost Rs/kWh = SHR * Landed Cost Rs/Mcal / 1000
    const avgSHR = getWeightedAverageSHRForPlant('PSPCL'); // Use average SHR
    totals.perUnitCost = {
        sum: 0,
        count: 0,
        avg: avgSHR * (totals.landedCostPerMcal.avg) / 1000
    };
    
    // Fix transit loss - multiply by 100 if it's in decimal form
    if (totals.transitLoss.avg < 1 && totals.transitLoss.avg > 0) {
        totals.transitLoss.avg *= 100;
    }
    
    return totals;
}

// Prepare Special Report Data
function QCPrepareSpecialReportData(fromDate, toDate, grouping, plantWise, coalCompanyWise, selectedPlants = [], selectedCoalCompanies = [], selectedColumns = []) {
    if (!QualityCostData1 || QualityCostData1.length === 0) {
        throw new Error('No data available for the selected period.');
    }
    
    // Parse the from and to dates
    const fromDateObj = new Date(fromDate + '-01');
    const toDateObj = new Date(toDate + '-01');
    
    console.log("Date filtering:", {
        fromDate: fromDate,
        toDate: toDate,
        fromDateObj: fromDateObj,
        toDateObj: toDateObj,
        totalDataRows: QualityCostData1.length
    });
    
    // Filter data based on date range
    let filteredData = QualityCostData1.filter(row => {
        if (!row || !row[0]) return false;
        
        const rowDate = parseMonthYear(row[0]);
        if (!rowDate) return false;
        
        const rowMonthYear = new Date(rowDate.getFullYear(), rowDate.getMonth(), 1);
        const fromMonthYear = new Date(fromDateObj.getFullYear(), fromDateObj.getMonth(), 1);
        const toMonthYear = new Date(toDateObj.getFullYear(), toDateObj.getMonth(), 1);
        
        return rowMonthYear >= fromMonthYear && rowMonthYear <= toMonthYear;
    });
    
    // Apply plant and coal company filters
    console.log("Initial filtered data after date range:", filteredData.length);
    
    if (selectedPlants.length > 0) {
        console.log("Filtering by plants:", selectedPlants);
        const beforePlantFilter = filteredData.length;
        filteredData = filteredData.filter(row => selectedPlants.includes(row[1])); // Fix: use row[1] for plant names
        console.log("After plant filter:", filteredData.length, "rows (was", beforePlantFilter, ")");
    } else {
        console.log("No plant filter applied (all plants selected)");
    }
    
    if (selectedCoalCompanies.length > 0) {
        console.log("Filtering by coal companies:", selectedCoalCompanies);
        const beforeCoalFilter = filteredData.length;
        // More lenient coal company filtering - check if row[2] contains any of the selected companies
        filteredData = filteredData.filter(row => {
            const company = row[2];
            return selectedCoalCompanies.some(selected => 
                company && company.toString().includes(selected) || selected.includes(company?.toString())
            );
        });
        console.log("After coal company filter:", filteredData.length, "rows (was", beforeCoalFilter, ")");
    } else {
        console.log("No coal company filter applied (all companies selected)");
    }
    
    console.log("Final filtered data length:", filteredData.length);
    console.log("Filter summary:", {
        originalData: QualityCostData1?.length || 0,
        afterDateFilter: filteredData.length,
        selectedPlants: selectedPlants.length,
        selectedCoalCompanies: selectedCoalCompanies.length,
        fromDate: fromDate,
        toDate: toDate
    });
    
    if (filteredData.length === 0) {
        throw new Error('No data found for the selected period and filters.');
    }
    
    let groupedData = {};
    
    if (grouping === 'month') {
        // Group by month first
        filteredData.forEach(row => {
            const rowDate = parseMonthYear(row[0]);
            if (!rowDate) return;
            
            const monthKey = `${rowDate.getFullYear()}-${String(rowDate.getMonth() + 1).padStart(2, '0')}`;
            const monthDisplayKey = formatMonthForDisplay(row[0]);
            
            if (!groupedData[monthKey]) {
                groupedData[monthKey] = {
                    monthDisplay: monthDisplayKey,
                    monthKey: monthKey,
                    data: [],
                    subGroups: {}
                };
            }
            
            // Add the row to month data
            groupedData[monthKey].data.push(row);
            
            // Sub-group by coal company if selected
            if (coalCompanyWise) {
                const coalCompany = row[2] || 'Unknown';
                if (!groupedData[monthKey].subGroups[coalCompany]) {
                    groupedData[monthKey].subGroups[coalCompany] = {
                        name: coalCompany,
                        data: [],
                        plantGroups: {}
                    };
                }
                groupedData[monthKey].subGroups[coalCompany].data.push(row);
                
                // Sub-group by plant if both are selected
                if (plantWise) {
                    const plant = row[1] || 'Unknown';
                    if (!groupedData[monthKey].subGroups[coalCompany].plantGroups[plant]) {
                        groupedData[monthKey].subGroups[coalCompany].plantGroups[plant] = {
                            name: plant,
                            data: []
                        };
                    }
                    groupedData[monthKey].subGroups[coalCompany].plantGroups[plant].data.push(row);
                }
            } else if (plantWise) {
                // Group by plant only (no coal company grouping)
                const plant = row[1] || 'Unknown';
                if (!groupedData[monthKey].subGroups[plant]) {
                    groupedData[monthKey].subGroups[plant] = {
                        name: plant,
                        data: [],
                        plantGroups: {}
                    };
                }
                groupedData[monthKey].subGroups[plant].data.push(row);
            }
        });
    } else {
        // Financial Year-wise grouping (April to March)
        filteredData.forEach(row => {
            const rowDate = parseMonthYear(row[0]);
            if (!rowDate) return;
            
            const fyKey = getFinancialYear(rowDate);
            if (!fyKey) return;
            
            if (!groupedData[fyKey]) {
                groupedData[fyKey] = {
                    monthDisplay: getFinancialYearDisplay(fyKey),
                    monthKey: fyKey,
                    data: [],
                    subGroups: {}
                };
            }
            
            groupedData[fyKey].data.push(row);
            
            // Apply same sub-grouping logic for financial year-wise
            if (coalCompanyWise) {
                const coalCompany = row[2] || 'Unknown';
                if (!groupedData[fyKey].subGroups[coalCompany]) {
                    groupedData[fyKey].subGroups[coalCompany] = {
                        name: coalCompany,
                        data: [],
                        plantGroups: {}
                    };
                }
                groupedData[fyKey].subGroups[coalCompany].data.push(row);
                
                if (plantWise) {
                    const plant = row[1] || 'Unknown';
                    if (!groupedData[fyKey].subGroups[coalCompany].plantGroups[plant]) {
                        groupedData[fyKey].subGroups[coalCompany].plantGroups[plant] = {
                            name: plant,
                            data: []
                        };
                    }
                    groupedData[fyKey].subGroups[coalCompany].plantGroups[plant].data.push(row);
                }
            } else if (plantWise) {
                const plant = row[1] || 'Unknown';
                if (!groupedData[fyKey].subGroups[plant]) {
                    groupedData[fyKey].subGroups[plant] = {
                        name: plant,
                        data: [],
                        plantGroups: {}
                    };
                }
                groupedData[fyKey].subGroups[plant].data.push(row);
            }
        });
    }
    
    // Sort the grouped data by month/year
    const sortedKeys = Object.keys(groupedData).sort();
    const sortedGroupedData = {};
    sortedKeys.forEach(key => {
        const group = groupedData[key];
        
        // Calculate totals for main group
        group.totals = QCCalculateGroupTotals(group.data);
        
        // Calculate totals for sub-groups
        Object.keys(group.subGroups).forEach(subKey => {
            const subGroup = group.subGroups[subKey];
            subGroup.totals = QCCalculateGroupTotals(subGroup.data);
            
            // Calculate totals for plant groups within coal company
            Object.keys(subGroup.plantGroups || {}).forEach(plantKey => {
                const plantGroup = subGroup.plantGroups[plantKey];
                plantGroup.totals = QCCalculateGroupTotals(plantGroup.data);
            });
        });
        
        sortedGroupedData[key] = group;
    });
    
    // Calculate grand totals
    const allData = Object.values(sortedGroupedData).reduce((acc, group) => {
        return acc.concat(group.data);
    }, []);
    const grandTotals = QCCalculateGroupTotals(allData);
    
    return {
        groupedData: sortedGroupedData,
        grandTotals: grandTotals,
        fromDate: fromDate,
        toDate: toDate,
        grouping: grouping,
        plantWise: plantWise,
        coalCompanyWise: coalCompanyWise,
        totalRecords: filteredData.length,
        selectedColumns: selectedColumns
    };
}

// Generate Special Report PDF
function QCGenerateSpecialReportPDF(reportData, fromDate, toDate, grouping, plantWise, coalCompanyWise) {
    try {
        if (typeof window.jspdf === 'undefined') {
            alert('PDF library not loaded. Please ensure jsPDF is included.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for better table fit
        
        // Page settings - reduced margins
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 8; // Reduced from 10
        let currentY = 15; // Reduced from 20
        let pageNumber = 1; // Track page numbers
        
        // Calculate dynamic column widths
        const plantNameWidth = 20; // mm
        const coalCompanyWidth = 18; // mm
        const availableWidth = pageWidth - (2 * margin) - plantNameWidth - coalCompanyWidth; // Total width minus margins minus first two columns
        const visibleColumns = QCGetVisibleColumns(true);
        const dataColumnCount = visibleColumns.length - 2; // Exclude Plant Name and Coal Company columns
        const dataColumnWidth = Math.floor(availableWidth / dataColumnCount); // Equal width for all data columns
        
        // Function to add page number to footer
        const addPageNumber = () => {
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            const pageText = `Page ${pageNumber}`;
            const pageTextWidth = doc.getTextWidth(pageText);
            doc.text(pageText, pageWidth - margin - pageTextWidth, pageHeight - 5); // 5mm from bottom, right aligned
        };
        
        // Add title - single line with period
        doc.setFontSize(14); // Reduced font size to fit in one line
        doc.setFont("helvetica", "bold");
        // Format period - handle both YYYY-MM format and Google Sheets Date format
        const fromDateFormatted = fromDate.includes('Date(') ? formatMonthForDisplay(fromDate) : 
                                 fromDate.match(/^\d{4}-\d{2}$/) ? fromDate.replace(/(\d{4})-(\d{2})/, (match, year, month) => {
                                     const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                     return `${monthNames[parseInt(month) - 1]}-${year}`;
                                 }) : formatMonthForDisplay(fromDate);
        const toDateFormatted = toDate.includes('Date(') ? formatMonthForDisplay(toDate) : 
                               toDate.match(/^\d{4}-\d{2}$/) ? toDate.replace(/(\d{4})-(\d{2})/, (match, year, month) => {
                                   const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                   return `${monthNames[parseInt(month) - 1]}-${year}`;
                               }) : formatMonthForDisplay(toDate);
        const title = `Details of coal received at PSPCL thermal power stations during ${fromDateFormatted} to ${toDateFormatted}`;
        const titleWidth = doc.getTextWidth(title);
        doc.text(title, (pageWidth - titleWidth) / 2, currentY);
        currentY += 8; // Reduced margin between main heading and month heading
        
        // Get visible columns for headers (already defined above for width calculation)
        const headers = visibleColumns.map(col => col.header);
        
        // Function to format a row for PDF
        const formatRowForPDF = (row) => {
            return visibleColumns.map(col => {
                let value = '';
                
                if (col.index <= 14) {
                    value = row[col.index] !== undefined && row[col.index] !== '' ? row[col.index] : '';
                    if (col.index === 1) value = shortenPlantName(value);
                    if (col.index >= 3 && col.index <= 14 && !isNaN(parseFloat(value))) {
                        if (col.index === 3 || col.index === 4) {
                            value = parseFloat(value).toFixed(4);
                        } else {
                            value = parseFloat(value).toFixed(2);
                        }
                    }
                } else {
                    // Calculate extended columns
                    const coalCost = parseFloat(row[12]) || 0;
                    const railwayFreight = parseFloat(row[13]) || 0;
                    const gcv = parseFloat(row[11]) || 1;
                    const qtyReceived = parseFloat(row[4]) || 0;
                    const plantName = row[1] || 'PSPCL';
                    
                    switch (col.index) {
                        case 15: // Landed Cost Rs/MT
                            const landedCostPerMT = coalCost + railwayFreight;
                            value = landedCostPerMT.toFixed(0);
                            break;
                        case 16: // Landed Cost Rs/Mcal
                            const landedCostPerMT2 = coalCost + railwayFreight;
                            const landedCostPerMcal = gcv > 0 ? landedCostPerMT2 / gcv : 0;
                            value = landedCostPerMcal.toFixed(4);
                            break;
                        case 17: // Per Unit Cost Rs./Kwh
                            const landedCostPerMT3 = coalCost + railwayFreight;
                            const landedCostPerMcal3 = gcv > 0 ? landedCostPerMT3 / gcv : 0;
                            const shr = getWeightedAverageSHRForPlant(plantName);
                            const perUnitCost = shr * landedCostPerMcal3 / 1000;
                            value = perUnitCost.toFixed(3);
                            break;
                        case 18: // Total Amount (Rs. Crore)
                            const landedCostPerMT4 = coalCost + railwayFreight;
                            const totalAmount = (qtyReceived * landedCostPerMT4) / 100; // Convert to crores
                            value = totalAmount.toFixed(2);
                            break;
                        default:
                            value = '';
                    }
                }
                
                return value;
            });
        };
        
        // Function to format totals row for PDF
        const formatTotalsForPDF = (totals) => {
            return visibleColumns.map(col => {
                let value = '';
                
                switch (col.index) {
                    case 0: value = 'TOTAL/AVG'; break;
                    case 1: value = ''; break;
                    case 2: value = ''; break;
                    case 3: value = totals.qtyDispatched.toFixed(4); break;      // Qty Dispatched - Sum
                    case 4: value = totals.qtyReceived.toFixed(4); break;        // Qty Received - Sum 
                    case 5: value = totals.rakesReceived.toFixed(0); break;      // Rakes Received - Sum
                    case 6: value = totals.transitLoss.avg.toFixed(2); break;    // Transit Loss - Avg
                    case 7: value = totals.moisture.avg.toFixed(2); break;       // Moisture - Weighted Avg
                    case 8: value = totals.ash.avg.toFixed(2); break;            // Ash - Weighted Avg
                    case 9: value = totals.vm.avg.toFixed(2); break;             // Volatile Matter - Weighted Avg
                    case 10: value = totals.fc.avg.toFixed(2); break;            // Fixed Carbon - Weighted Avg
                    case 11: value = totals.gcv.avg.toFixed(0); break;           // GCV - Weighted Avg
                    case 12: value = totals.coalCost.avg.toFixed(0); break;      // Coal Cost - Weighted Avg
                    case 13: value = totals.railwayFreight.avg.toFixed(0); break; // Railway Freight - Weighted Avg
                    case 14: value = totals.distance.avg.toFixed(0); break;      // Distance - Weighted Avg
                    case 15: value = totals.landedCostPerMT.avg.toFixed(0); break; // Landed Cost Rs/MT - Weighted Avg
                    case 16: value = totals.landedCostPerMcal.avg.toFixed(4); break; // Landed Cost Rs/Mcal - Weighted Avg
                    case 17: value = totals.perUnitCost.avg.toFixed(3); break;   // Per Unit Cost - Weighted Avg
                    case 18: value = totals.totalAmount.toFixed(2); break;       // Total Amount - Sum
                    default: value = '';
                }
                
                return value;
            });
        };
        
        // Function to check if new page is needed
        const checkNewPage = (additionalHeight) => {
            if (currentY + additionalHeight > pageHeight - margin - 5) { // Further reduced bottom margin from 10 to 5
                doc.addPage();
                currentY = 15; // Reduced top margin for new pages
                return true;
            }
            return false;
        };
        
        // Generate report based on grouping
        const groupedData = reportData.groupedData;
        
        // Handle Financial Year grouping differently
        if (grouping === 'year') {
            // Financial Year specific table structure
            Object.keys(groupedData).forEach(fyKey => {
                const fyGroup = groupedData[fyKey];
                
                // Generate FY title
                checkNewPage(30);
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text(`${fyGroup.monthDisplay} - Financial Year Report`, margin, currentY);
                currentY += 10;
                
                // Group data by plant for FY structure
                const fyPlantGroups = {};
                fyGroup.data.forEach(row => {
                    const plantName = row[1] || 'Unknown Plant';
                    if (!fyPlantGroups[plantName]) {
                        fyPlantGroups[plantName] = [];
                    }
                    fyPlantGroups[plantName].push(row);
                });
                
                const fyPlantNames = Object.keys(fyPlantGroups);
                
                // Generate plant-wise tables with coal company-wise consolidated values
                fyPlantNames.forEach(plantName => {
                    const plantData = fyPlantGroups[plantName];
                    
                    checkNewPage(20);
                    // Removed plant header as requested
                    
                    // Group plant data by coal company
                    const coalCompanyGroups = {};
                    plantData.forEach(row => {
                        const coalCompany = row[2] || 'Unknown';
                        if (!coalCompanyGroups[coalCompany]) {
                            coalCompanyGroups[coalCompany] = [];
                        }
                        coalCompanyGroups[coalCompany].push(row);
                    });
                    
                    // Create table data with coal company totals
                    const plantTableData = [];
                    const plantRowSpans = []; // Track plant name rows for merging
                    let plantStartRow = 0;
                    
                    Object.keys(coalCompanyGroups).forEach((coalCompany, index) => {
                        const companyData = coalCompanyGroups[coalCompany];
                        const companyTotals = QCCalculateGroupTotals(companyData);
                        const companyRow = formatTotalsForPDF(companyTotals);
                        
                        // Show plant name only in first row, empty for others (for merging)
                        if (index === 0) {
                            companyRow[0] = plantName;  // Plant name only in first row
                        } else {
                            companyRow[0] = '';  // Empty for merging effect
                        }
                        companyRow[1] = coalCompany;  // Coal company
                        plantTableData.push(companyRow);
                    });
                    
                    // Track plant name span for styling
                    const coalCompanyCount = Object.keys(coalCompanyGroups).length;
                    const hasMultipleCoalCompanies = coalCompanyCount > 1;
                    
                    if (coalCompanyCount > 0) {
                        plantRowSpans.push({
                            startRow: plantStartRow,
                            endRow: coalCompanyCount - 1,
                            rowCount: coalCompanyCount
                        });
                    }
                    
                    // Add plant total row only if multiple coal companies
                    if (hasMultipleCoalCompanies) {
                        const plantTotals = QCCalculateGroupTotals(plantData);
                        const plantTotalRow = formatTotalsForPDF(plantTotals);
                        plantTotalRow[0] = plantName;  // Show plant name separately for total
                        plantTotalRow[1] = 'All Sources';
                        plantTableData.push(plantTotalRow);
                    }
                    
                    // Generate the table
                    doc.autoTable({
                        head: [headers],
                        body: plantTableData,
                        startY: currentY,
                        margin: { left: margin, right: margin },
                        styles: { fontSize: 8, cellPadding: 1 },
                        headStyles: { fillColor: [220, 220, 220], fontSize: 8, textColor: [0, 0, 0], halign: 'center' },
                        bodyStyles: { fontSize: 8 },
                        columnStyles: {
                            0: { halign: 'center', cellWidth: plantNameWidth },
                            1: { halign: 'center', cellWidth: coalCompanyWidth },
                            2: { halign: 'center', cellWidth: dataColumnWidth },
                            3: { halign: 'center', cellWidth: dataColumnWidth },
                            4: { halign: 'center', cellWidth: dataColumnWidth },
                            5: { halign: 'center', cellWidth: dataColumnWidth },
                            6: { halign: 'center', cellWidth: dataColumnWidth },
                            7: { halign: 'center', cellWidth: dataColumnWidth },
                            8: { halign: 'center', cellWidth: dataColumnWidth },
                            9: { halign: 'center', cellWidth: dataColumnWidth },
                            10: { halign: 'center', cellWidth: dataColumnWidth },
                            11: { halign: 'center', cellWidth: dataColumnWidth },
                            12: { halign: 'center', cellWidth: dataColumnWidth },
                            13: { halign: 'center', cellWidth: dataColumnWidth },
                            14: { halign: 'center', cellWidth: dataColumnWidth },
                            15: { halign: 'center', cellWidth: dataColumnWidth },
                            16: { halign: 'center', cellWidth: dataColumnWidth },
                            17: { halign: 'center', cellWidth: dataColumnWidth },
                            18: { halign: 'center', cellWidth: dataColumnWidth },
                            19: { halign: 'center', cellWidth: dataColumnWidth },
                            20: { halign: 'center', cellWidth: dataColumnWidth }
                        },
                        theme: 'striped',
                        didParseCell: function(data) {
                            // Handle plant name cell merging
                            if (data.column.index === 0 && hasMultipleCoalCompanies) {
                                const isPlantTotalRow = data.row.index === plantTableData.length - 1;
                                const isFirstCompanyRow = data.row.index === 0;
                                
                                if (!isPlantTotalRow) {
                                    if (isFirstCompanyRow) {
                                        // First row shows plant name with styling
                                        data.cell.styles.fillColor = [245, 245, 245]; // Light gray
                                        data.cell.styles.fontStyle = 'bold';
                                    } else {
                                        // Subsequent rows should be empty for visual merging
                                        data.cell.text = '';
                                        data.cell.styles.fillColor = [245, 245, 245]; // Same background
                                    }
                                } else {
                                    // Plant total row styling - grey like headers
                                    data.cell.styles.fillColor = [220, 220, 220]; // Grey like headers
                                    data.cell.styles.textColor = [0, 0, 0]; // Black text
                                    data.cell.styles.fontStyle = 'bold';
                                }
                            }
                            
                            // Style coal company column for total row
                            if (data.column.index === 1) {
                                const isPlantTotalRow = data.row.index === plantTableData.length - 1;
                                if (isPlantTotalRow && hasMultipleCoalCompanies) {
                                    data.cell.styles.fillColor = [220, 220, 220]; // Grey like headers
                                    data.cell.styles.textColor = [0, 0, 0]; // Black text
                                    data.cell.styles.fontStyle = 'bold';
                                }
                            }
                        }
                    });
                    
                    currentY = doc.lastAutoTable.finalY + 8;
                });
                
                // Generate consolidated grand totals table for all plants in FY
                if (fyPlantNames.length > 1) {
                    checkNewPage(20);
                    doc.setFontSize(14);
                    doc.setFont("helvetica", "bold");
                    doc.text(`${fyGroup.monthDisplay} - All Plants Consolidated`, margin, currentY);
                    currentY += 8;
                    
                    // Create grand totals by coal company (like overall period grand total)
                    const grandTotalsData = [];
                    const allCoalCompanyGroups = {};
                    
                    // Group all FY data by coal company
                    fyGroup.data.forEach(row => {
                        const coalCompany = row[2] || 'Unknown';
                        if (!allCoalCompanyGroups[coalCompany]) {
                            allCoalCompanyGroups[coalCompany] = [];
                        }
                        allCoalCompanyGroups[coalCompany].push(row);
                    });
                    
                    // Add coal company totals
                    Object.keys(allCoalCompanyGroups).forEach((coalCompany, index) => {
                        const companyData = allCoalCompanyGroups[coalCompany];
                        const companyTotals = QCCalculateGroupTotals(companyData);
                        const companyRow = formatTotalsForPDF(companyTotals);
                        
                        // Show "All Plants" only in first row, empty for others (for merging)
                        if (index === 0) {
                            companyRow[0] = 'All Plants';  // Plant name only in first row
                        } else {
                            companyRow[0] = '';  // Empty for merging effect
                        }
                        companyRow[1] = coalCompany;   // Coal company name
                        grandTotalsData.push(companyRow);
                    });
                    
                    // Track coal company count for merging logic
                    const coalCompanyCount = Object.keys(allCoalCompanyGroups).length;
                    
                    // Add overall FY total only if multiple coal companies
                    if (coalCompanyCount > 1) {
                        const fyTotals = QCCalculateGroupTotals(fyGroup.data);
                        const fyTotalRow = formatTotalsForPDF(fyTotals);
                        fyTotalRow[0] = 'All Plants';
                        fyTotalRow[1] = 'All Sources';
                        grandTotalsData.push(fyTotalRow);
                    }
                    
                    // Generate the grand totals table
                    doc.autoTable({
                        head: [headers],
                        body: grandTotalsData,
                        startY: currentY,
                        margin: { left: margin, right: margin },
                        styles: { fontSize: 8, cellPadding: 1, fontStyle: 'bold' },
                        headStyles: { fillColor: [220, 220, 220], fontSize: 8, textColor: [0, 0, 0], halign: 'center' },
                        bodyStyles: { fontSize: 8, fillColor: [240, 248, 255] },
                        columnStyles: {
                            0: { halign: 'center', cellWidth: plantNameWidth },
                            1: { halign: 'center', cellWidth: coalCompanyWidth },
                            2: { halign: 'center', cellWidth: dataColumnWidth },
                            3: { halign: 'center', cellWidth: dataColumnWidth },
                            4: { halign: 'center', cellWidth: dataColumnWidth },
                            5: { halign: 'center', cellWidth: dataColumnWidth },
                            6: { halign: 'center', cellWidth: dataColumnWidth },
                            7: { halign: 'center', cellWidth: dataColumnWidth },
                            8: { halign: 'center', cellWidth: dataColumnWidth },
                            9: { halign: 'center', cellWidth: dataColumnWidth },
                            10: { halign: 'center', cellWidth: dataColumnWidth },
                            11: { halign: 'center', cellWidth: dataColumnWidth },
                            12: { halign: 'center', cellWidth: dataColumnWidth },
                            13: { halign: 'center', cellWidth: dataColumnWidth },
                            14: { halign: 'center', cellWidth: dataColumnWidth },
                            15: { halign: 'center', cellWidth: dataColumnWidth },
                            16: { halign: 'center', cellWidth: dataColumnWidth },
                            17: { halign: 'center', cellWidth: dataColumnWidth },
                            18: { halign: 'center', cellWidth: dataColumnWidth },
                            19: { halign: 'center', cellWidth: dataColumnWidth },
                            20: { halign: 'center', cellWidth: dataColumnWidth }
                        },
                        theme: 'striped',
                        didParseCell: function(data) {
                            // Handle "All Plants" cell merging
                            if (data.column.index === 0 && coalCompanyCount > 1) {
                                const isFyTotalRow = data.row.index === grandTotalsData.length - 1;
                                const isFirstCompanyRow = data.row.index === 0;
                                
                                if (!isFyTotalRow) {
                                    if (isFirstCompanyRow) {
                                        // First row shows "All Plants" with styling
                                        data.cell.styles.fillColor = [245, 245, 245]; // Light gray
                                        data.cell.styles.fontStyle = 'bold';
                                    } else {
                                        // Subsequent rows should be empty for visual merging
                                        data.cell.text = '';
                                        data.cell.styles.fillColor = [245, 245, 245]; // Same background
                                    }
                                } else {
                                    // FY total row styling
                                    data.cell.styles.fillColor = [220, 220, 220]; // Grey like headers
                                    data.cell.styles.textColor = [0, 0, 0]; // Black text
                                    data.cell.styles.fontStyle = 'bold';
                                }
                            }
                            
                            // Style coal company column for total row
                            if (data.column.index === 1) {
                                const isFyTotalRow = data.row.index === grandTotalsData.length - 1;
                                if (isFyTotalRow && coalCompanyCount > 1) {
                                    data.cell.styles.fillColor = [220, 220, 220]; // Grey like headers
                                    data.cell.styles.textColor = [0, 0, 0]; // Black text
                                    data.cell.styles.fontStyle = 'bold';
                                }
                            }
                        }
                    });
                    
                    currentY = doc.lastAutoTable.finalY + 10;
                }
                
                // Add horizontal line after each FY section
                doc.setLineWidth(0.3);
                doc.line(margin, currentY, doc.internal.pageSize.width - margin, currentY);
                currentY += 8;
            });
            
            // Add Overall Period Grand Total (consolidating all Financial Years)
            const allFyData = [];
            Object.keys(groupedData).forEach(fyKey => {
                allFyData.push(...groupedData[fyKey].data);
            });
            
            if (allFyData.length > 0) {
                // Format dates for display (YYYY-MM to MMM-YYYY)
                function formatDateForDisplay(dateStr) {
                    const [year, month] = dateStr.split('-');
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return `${monthNames[parseInt(month) - 1]}-${year}`;
                }
                
                const formattedFromDate = formatDateForDisplay(fromDate);
                const formattedToDate = formatDateForDisplay(toDate);
                
                checkNewPage(25);
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text(`OVERALL PERIOD GRAND TOTAL (${formattedFromDate} to ${formattedToDate})`, margin, currentY);
                currentY += 10;
                
                // Group all period data by coal company
                const overallCoalCompanyGroups = {};
                allFyData.forEach(row => {
                    const coalCompany = row[2] || 'Unknown';
                    if (!overallCoalCompanyGroups[coalCompany]) {
                        overallCoalCompanyGroups[coalCompany] = [];
                    }
                    overallCoalCompanyGroups[coalCompany].push(row);
                });
                
                // Create overall period totals table
                const overallTotalsData = [];
                const hasMultipleOverallCoalCompanies = Object.keys(overallCoalCompanyGroups).length > 1;
                
                Object.keys(overallCoalCompanyGroups).forEach((coalCompany, index) => {
                    const companyData = overallCoalCompanyGroups[coalCompany];
                    const companyTotals = QCCalculateGroupTotals(companyData);
                    const companyRow = formatTotalsForPDF(companyTotals);
                    
                    if (hasMultipleOverallCoalCompanies) {
                        if (index === 0) {
                            companyRow[0] = 'All Plants';  // Show "All Plants" only in first row
                        } else {
                            companyRow[0] = '';  // Empty for merging effect
                        }
                    } else {
                        companyRow[0] = 'All Plants';
                    }
                    companyRow[1] = coalCompany;
                    overallTotalsData.push(companyRow);
                });
                
                // Add overall grand total row only if multiple coal companies
                if (hasMultipleOverallCoalCompanies) {
                    const overallGrandTotals = QCCalculateGroupTotals(allFyData);
                    const overallGrandRow = formatTotalsForPDF(overallGrandTotals);
                    overallGrandRow[0] = 'All Plants';
                    overallGrandRow[1] = 'All Sources';
                    overallTotalsData.push(overallGrandRow);
                }
                
                // Generate the overall period table
                doc.autoTable({
                    head: [headers],
                    body: overallTotalsData,
                    startY: currentY,
                    margin: { left: margin, right: margin },
                    styles: { fontSize: 8, cellPadding: 1 },
                    headStyles: { fillColor: [220, 220, 220], fontSize: 8, textColor: [0, 0, 0], halign: 'center' },
                    bodyStyles: { fontSize: 8 }, // Removed yellow background
                    alternateRowStyles: { fillColor: [245, 245, 245] }, // Light grey for alternating rows
                    columnStyles: {
                        0: { halign: 'center', cellWidth: plantNameWidth },
                        1: { halign: 'center', cellWidth: coalCompanyWidth },
                        2: { halign: 'center', cellWidth: dataColumnWidth },
                        3: { halign: 'center', cellWidth: dataColumnWidth },
                        4: { halign: 'center', cellWidth: dataColumnWidth },
                        5: { halign: 'center', cellWidth: dataColumnWidth },
                        6: { halign: 'center', cellWidth: dataColumnWidth },
                        7: { halign: 'center', cellWidth: dataColumnWidth },
                        8: { halign: 'center', cellWidth: dataColumnWidth },
                        9: { halign: 'center', cellWidth: dataColumnWidth },
                        10: { halign: 'center', cellWidth: dataColumnWidth },
                        11: { halign: 'center', cellWidth: dataColumnWidth },
                        12: { halign: 'center', cellWidth: dataColumnWidth },
                        13: { halign: 'center', cellWidth: dataColumnWidth },
                        14: { halign: 'center', cellWidth: dataColumnWidth },
                        15: { halign: 'center', cellWidth: dataColumnWidth },
                        16: { halign: 'center', cellWidth: dataColumnWidth },
                        17: { halign: 'center', cellWidth: dataColumnWidth },
                        18: { halign: 'center', cellWidth: dataColumnWidth },
                        19: { halign: 'center', cellWidth: dataColumnWidth },
                        20: { halign: 'center', cellWidth: dataColumnWidth }
                    },
                    didParseCell: function(data) {
                        // Center-align ALL headers
                        if (data.row.section === 'head') {
                            data.cell.styles.halign = 'center';
                        }
                        
                        // Handle "All Plants" cell merging for multiple coal companies
                        if (hasMultipleOverallCoalCompanies && data.column.index === 0) {
                            const currentRowIndex = data.row.index;
                            const isGrandTotalRow = currentRowIndex === overallTotalsData.length - 1;
                            
                            if (!isGrandTotalRow && currentRowIndex < Object.keys(overallCoalCompanyGroups).length) {
                                if (currentRowIndex === 0) {
                                    // First row shows "All Plants" with special styling
                                    data.cell.styles.halign = 'center';
                                    data.cell.styles.valign = 'middle';
                                    data.cell.styles.fontStyle = 'bold';
                                    data.cell.styles.fillColor = [220, 220, 220]; // Light grey background
                                    data.cell.styles.textColor = [0, 0, 0];
                                } else {
                                    // Subsequent rows have same background with no borders for merging effect
                                    data.cell.styles.lineWidth = 0;
                                    data.cell.styles.fillColor = [220, 220, 220];
                                    data.cell.styles.textColor = [0, 0, 0];
                                    data.cell.styles.halign = 'center';
                                    data.cell.styles.valign = 'middle';
                                }
                            }
                        }
                        
                        // Make total row bold for ALL cells (including first 2 columns)
                        if (hasMultipleOverallCoalCompanies) {
                            const isGrandTotalRow = data.row.index === overallTotalsData.length - 1;
                            if (isGrandTotalRow) {
                                data.cell.styles.fontStyle = 'bold';
                                data.cell.styles.fillColor = [220, 220, 220]; // Grey background for total row
                                data.cell.styles.textColor = [0, 0, 0]; // Black text
                            }
                        }
                    }
                });
                
                currentY = doc.lastAutoTable.finalY + 15;
            }
        } else {
            // Month-wise grouping - existing logic
            Object.keys(groupedData).forEach(groupKey => {
                const group = groupedData[groupKey];
            
            if (!coalCompanyWise && !plantWise) {
                // Group data by plant for enhanced structure
                const plantGroups = {};
                group.data.forEach(row => {
                    const plantName = row[1] || 'Unknown Plant';
                    if (!plantGroups[plantName]) {
                        plantGroups[plantName] = [];
                    }
                    plantGroups[plantName].push(row);
                });
                
                const plantNames = Object.keys(plantGroups);
                const hasMultiplePlants = plantNames.length > 1;
                
                // Create one merged table with all plant data
                checkNewPage(25);
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.text(`${group.monthDisplay} - Plants Wise`, margin, currentY);
                currentY += 5; // Reduced from 8 to 5
                
                // Prepare data with plant totals integrated and plant name merging
                const mergedTableData = [];
                const plantRowSpans = []; // Track which rows belong to which plant for styling
                
                plantNames.forEach((plantName, index) => {
                    const plantData = plantGroups[plantName];
                    const plantTotals = QCCalculateGroupTotals(plantData);
                    
                    // Check if this plant has multiple coal companies (check unique coal companies in plant data)
                    const uniqueCoalCompanies = [...new Set(plantData.map(row => row[2]))];
                    const hasMultipleCoalCompanies = uniqueCoalCompanies.length > 1;
                    
                    const plantStartRow = mergedTableData.length;
                    
                    // Add plant data rows
                    plantData.forEach((row, rowIndex) => {
                        const formattedRow = formatRowForPDF(row);
                        // Only show plant name in first row of each plant group
                        if (rowIndex > 0) {
                            formattedRow[0] = ''; // Hide plant name for subsequent rows
                        }
                        mergedTableData.push(formattedRow);
                    });
                    
                    // Add plant total row ONLY if there are multiple coal companies for this plant
                    if (hasMultipleCoalCompanies) {
                        const plantTotalsRow = formatTotalsForPDF(plantTotals);
                        plantTotalsRow[0] = `TOTAL`; // Show TOTAL instead of plant name
                        mergedTableData.push(plantTotalsRow);
                    }
                    
                    // Track plant row span info
                    plantRowSpans.push({
                        plantName: plantName,
                        startRow: plantStartRow,
                        endRow: mergedTableData.length - 1,
                        dataRowCount: plantData.length
                    });
                    
                    // Add spacing between plants (except for last plant)
                    if (index < plantNames.length - 1) {
                        // Add empty row for visual separation
                        const emptyRow = new Array(headers.length).fill('');
                        mergedTableData.push(emptyRow);
                    }
                });
                
                // Create the merged table
                doc.autoTable({
                    head: [headers],
                    body: mergedTableData,
                    startY: currentY,
                    margin: { left: margin, right: margin },
                    styles: { fontSize: 7, cellPadding: 1 },
                    headStyles: { fillColor: [220, 220, 220], fontSize: 7, textColor: [0, 0, 0] }, // Light grey with black text
                    bodyStyles: { fontSize: 7 },
                    alternateRowStyles: { fillColor: [245, 245, 245] },
                    columnStyles: {
                        // Plant name and Coal Company columns with fixed width
                        0: { halign: 'center', cellWidth: plantNameWidth },  // Plant Name
                        1: { halign: 'center', cellWidth: coalCompanyWidth },  // Coal Company
                        // All data columns after Coal Company (index 2+) are center-aligned with calculated width
                        2: { halign: 'center', cellWidth: dataColumnWidth },
                        3: { halign: 'center', cellWidth: dataColumnWidth },
                        4: { halign: 'center', cellWidth: dataColumnWidth },
                        5: { halign: 'center', cellWidth: dataColumnWidth },
                        6: { halign: 'center', cellWidth: dataColumnWidth },
                        7: { halign: 'center', cellWidth: dataColumnWidth },
                        8: { halign: 'center', cellWidth: dataColumnWidth },
                        9: { halign: 'center', cellWidth: dataColumnWidth },
                        10: { halign: 'center', cellWidth: dataColumnWidth },
                        11: { halign: 'center', cellWidth: dataColumnWidth },
                        12: { halign: 'center', cellWidth: dataColumnWidth },
                        13: { halign: 'center', cellWidth: dataColumnWidth },
                        14: { halign: 'center', cellWidth: dataColumnWidth },
                        15: { halign: 'center', cellWidth: dataColumnWidth },
                        16: { halign: 'center', cellWidth: dataColumnWidth },
                        17: { halign: 'center', cellWidth: dataColumnWidth },
                        18: { halign: 'center', cellWidth: dataColumnWidth },
                        19: { halign: 'center', cellWidth: dataColumnWidth },
                        20: { halign: 'center', cellWidth: dataColumnWidth }
                    },
                    didParseCell: function(data) {
                        // Center-align ALL headers
                        if (data.row.section === 'head') {
                            data.cell.styles.halign = 'center';
                        }
                        
                        // Style plant name cells (first column)
                        if (data.column.index === 0) {
                            // Find which plant group this row belongs to
                            const currentRowIndex = data.row.index;
                            const plantGroup = plantRowSpans.find(group => 
                                currentRowIndex >= group.startRow && currentRowIndex <= group.endRow
                            );
                            
                            if (plantGroup) {
                                // If this is the first row of a plant group, center the plant name
                                if (currentRowIndex === plantGroup.startRow) {
                                    data.cell.styles.halign = 'center';
                                    data.cell.styles.valign = 'middle';
                                    data.cell.styles.fontStyle = 'bold';
                                    data.cell.styles.fillColor = [220, 220, 220]; // Light grey background
                                    data.cell.styles.textColor = [0, 0, 0]; // Black text
                                    data.cell.styles.minCellHeight = 6; // Reduced height for compactness
                                }
                                // For other rows in the plant group, remove borders to simulate merging
                                else if (currentRowIndex < plantGroup.startRow + plantGroup.dataRowCount) {
                                    data.cell.styles.lineWidth = 0;
                                    data.cell.styles.fillColor = [220, 220, 220]; // Same light grey background
                                    data.cell.styles.textColor = [0, 0, 0]; // Black text
                                    data.cell.styles.halign = 'center';
                                    data.cell.styles.valign = 'middle';
                                    data.cell.styles.minCellHeight = 6; // Reduced height for compactness
                                }
                            }
                        }
                        
                        // Highlight plant total rows
                        const rowData = mergedTableData[data.row.index];
                        if (rowData && rowData[0] && rowData[0] === 'TOTAL') {
                            data.cell.styles.fontStyle = 'bold';
                            data.cell.styles.fillColor = [248, 252, 255]; // Very light blue background
                            data.cell.styles.textColor = [0, 0, 0]; // Ensure text is black for readability
                        }
                        // Make empty separator rows invisible
                        else if (data.cell.text[0] === '') {
                            data.cell.styles.fillColor = [255, 255, 255];
                            data.cell.styles.lineWidth = 0;
                        }
                    },
                    theme: 'striped'
                });
                
                currentY = doc.lastAutoTable.finalY + 5; // Reduced from 10 to 5
                
                // Add consolidated coal company totals (only if multiple plants)
                if (hasMultiplePlants) {
                    checkNewPage(25);
                    doc.setFontSize(12);
                    doc.setFont("helvetica", "bold");
                    doc.text(`${group.monthDisplay} - Coal Company-wise Totals`, margin, currentY);
                    currentY += 5; // Reduced from 8 to 5
                    
                    // Group data by coal company and calculate totals only
                    const coalCompanyGroups = {};
                    group.data.forEach(row => {
                        const coalCompany = row[2] || 'Unknown';
                        if (!coalCompanyGroups[coalCompany]) {
                            coalCompanyGroups[coalCompany] = [];
                        }
                        coalCompanyGroups[coalCompany].push(row);
                    });
                    
                    // Prepare coal company totals table (totals only, no detailed data)
                    const coalCompanyTotalsData = [];
                    const allPlantsRowSpans = []; // Track "All Plants" rows for merging
                    let allPlantsStartRow = 0;
                    const hasMultipleCoalCompanies = Object.keys(coalCompanyGroups).length > 1;
                    
                    Object.keys(coalCompanyGroups).forEach((coalCompany, index) => {
                        const companyData = coalCompanyGroups[coalCompany];
                        const companyTotals = QCCalculateGroupTotals(companyData);
                        const companyTotalsRow = formatTotalsForPDF(companyTotals);
                        // Correct column placement: Plant Name in visibleColumns index 0, Coal Company in visibleColumns index 1
                        
                        if (hasMultipleCoalCompanies) {
                            // Multiple coal companies: show "All Plants" merged format
                            if (index === 0) {
                                companyTotalsRow[0] = 'All Plants';        // Show "All Plants" only in first row
                            } else {
                                companyTotalsRow[0] = '';                  // Empty for merging effect
                            }
                        } else {
                            // Single coal company: show plant names in Plant column
                            if (hasMultiplePlants) {
                                companyTotalsRow[0] = 'All Plants';
                            } else {
                                companyTotalsRow[0] = plantNames[0] || 'Unknown Plant';  // Show single plant name
                            }
                        }
                        companyTotalsRow[1] = coalCompany;         // Coal Company column (visibleColumns[1])
                        // Keep the rest of the data as is (Qty Dispatched, etc.)
                        coalCompanyTotalsData.push(companyTotalsRow);
                    });
                    
                    // Track "All Plants" span for styling only if multiple coal companies
                    if (hasMultipleCoalCompanies && Object.keys(coalCompanyGroups).length > 0) {
                        allPlantsRowSpans.push({
                            startRow: allPlantsStartRow,
                            endRow: Object.keys(coalCompanyGroups).length - 1,
                            rowCount: Object.keys(coalCompanyGroups).length
                        });
                    }
                    
                    // Add grand total row to the same table only if multiple coal companies
                    if (hasMultipleCoalCompanies) {
                        const grandTotalsRow = formatTotalsForPDF(group.totals);
                        grandTotalsRow[0] = 'All Plants';         // Show "All Plants" for grand total separately
                        grandTotalsRow[1] = 'All Sources';        // Coal Company column (visibleColumns[1])
                        // Keep the rest of the data as is (Qty Dispatched, etc.)
                        coalCompanyTotalsData.push(grandTotalsRow);
                    }
                    
                    // Show coal company totals table with grand total
                    doc.autoTable({
                        head: [headers],
                        body: coalCompanyTotalsData,
                        startY: currentY,
                        margin: { left: margin, right: margin },
                        styles: { fontSize: 7, cellPadding: 1, fontStyle: 'bold' },
                        headStyles: { fillColor: [220, 220, 220], fontSize: 7, textColor: [0, 0, 0] }, // Light grey with black text
                        bodyStyles: { fontSize: 7, fillColor: [240, 248, 255] }, // Light blue for company totals
                        columnStyles: {
                            // Plant name and Coal Company columns with fixed width
                            0: { halign: 'center', cellWidth: plantNameWidth },  // Plant Name
                            1: { halign: 'center', cellWidth: coalCompanyWidth },  // Coal Company
                            // All data columns after Coal Company (index 2+) are center-aligned with calculated width
                            2: { halign: 'center', cellWidth: dataColumnWidth },
                            3: { halign: 'center', cellWidth: dataColumnWidth },
                            4: { halign: 'center', cellWidth: dataColumnWidth },
                            5: { halign: 'center', cellWidth: dataColumnWidth },
                            6: { halign: 'center', cellWidth: dataColumnWidth },
                            7: { halign: 'center', cellWidth: dataColumnWidth },
                            8: { halign: 'center', cellWidth: dataColumnWidth },
                            9: { halign: 'center', cellWidth: dataColumnWidth },
                            10: { halign: 'center', cellWidth: dataColumnWidth },
                            11: { halign: 'center', cellWidth: dataColumnWidth },
                            12: { halign: 'center', cellWidth: dataColumnWidth },
                            13: { halign: 'center', cellWidth: dataColumnWidth },
                            14: { halign: 'center', cellWidth: dataColumnWidth },
                            15: { halign: 'center', cellWidth: dataColumnWidth },
                            16: { halign: 'center', cellWidth: dataColumnWidth },
                            17: { halign: 'center', cellWidth: dataColumnWidth },
                            18: { halign: 'center', cellWidth: dataColumnWidth },
                            19: { halign: 'center', cellWidth: dataColumnWidth },
                            20: { halign: 'center', cellWidth: dataColumnWidth }
                        },
                        didParseCell: function(data) {
                            // Center-align ALL headers
                            if (data.row.section === 'head') {
                                data.cell.styles.halign = 'center';
                            }
                            
                            // Style "All Plants" cells (first column) for merging
                            if (data.column.index === 0) {
                                const currentRowIndex = data.row.index;
                                const isGrandTotalRow = currentRowIndex === coalCompanyTotalsData.length - 1;
                                
                                if (!isGrandTotalRow) {
                                    // Handle "All Plants" merging for coal company rows
                                    const allPlantsGroup = allPlantsRowSpans.find(group => 
                                        currentRowIndex >= group.startRow && currentRowIndex <= group.endRow
                                    );
                                    
                                    if (allPlantsGroup) {
                                        if (currentRowIndex === allPlantsGroup.startRow) {
                                            // First row shows "All Plants" with header styling
                                            data.cell.styles.halign = 'center';
                                            data.cell.styles.valign = 'middle';
                                            data.cell.styles.fontStyle = 'bold';
                                            data.cell.styles.fillColor = [220, 220, 220]; // Light grey background
                                            data.cell.styles.textColor = [0, 0, 0]; // Black text
                                            data.cell.styles.minCellHeight = 6; // Reduced height for compactness
                                        } else {
                                            // Subsequent rows have same background with no borders
                                            data.cell.styles.lineWidth = 0;
                                            data.cell.styles.fillColor = [220, 220, 220]; // Same light grey background
                                            data.cell.styles.textColor = [0, 0, 0]; // Black text
                                            data.cell.styles.halign = 'center';
                                            data.cell.styles.valign = 'middle';
                                            data.cell.styles.minCellHeight = 6; // Reduced height for compactness
                                        }
                                    }
                                }
                            }
                            
                            // Special styling for grand total row (last row)
                            if (data.row.index === coalCompanyTotalsData.length - 1) {
                                data.cell.styles.fillColor = [255, 248, 220]; // Light yellow for grand total
                                data.cell.styles.fontStyle = 'bold';
                                data.cell.styles.minCellHeight = 6; // Reduced height for compactness
                                if (data.column.index === 0) {
                                    data.cell.styles.textColor = [0, 0, 0]; // Black text for grand total
                                }
                            }
                        },
                        theme: 'striped'
                    });
                    
                    currentY = doc.lastAutoTable.finalY + 5; // Reduced from 10 to 5
                    
                    // Add horizontal line after consolidated table
                    doc.setLineWidth(0.3);
                    doc.line(margin, currentY, pageWidth - margin, currentY);
                    currentY += 5; // Reduced from 10 to 5
                }
                // Note: Removed single plant grand total table as total already appears in main table
                
            } else {
                // Sub-grouping by coal company and/or plant
                Object.keys(group.subGroups).forEach(subGroupKey => {
                    const subGroup = group.subGroups[subGroupKey];
                    
                    checkNewPage(15);
                    doc.setFontSize(12);
                    doc.setFont("helvetica", "bold");
                    // Combine month and sub-group in same line to save space
                    const subGroupType = coalCompanyWise ? 'Coal Company' : 'Plant';
                    const combinedLabel = `${group.monthDisplay} - ${subGroupType}: ${subGroup.name}`;
                    doc.text(combinedLabel, margin, currentY);
                    currentY += 8;
                    
                    if (plantWise && coalCompanyWise && subGroup.plantGroups) {
                        // Further sub-grouping by plant
                        Object.keys(subGroup.plantGroups).forEach(plantKey => {
                            const plantGroup = subGroup.plantGroups[plantKey];
                            
                            checkNewPage(10);
                            doc.setFontSize(10);
                            doc.setFont("helvetica", "bold");
                            // Combine coal company, month and plant in one line
                            doc.text(`${group.monthDisplay} - Coal Company: ${subGroup.name} - Plant: ${plantGroup.name}`, margin, currentY);
                            currentY += 8;
                            
                            const plantTableData = plantGroup.data.map(formatRowForPDF);
                            const plantTotalsRow = formatTotalsForPDF(plantGroup.totals);
                            
                            // Only add totals row if there are multiple data rows (i.e., multiple coal companies for this plant)
                            const tableBody = [...plantTableData];
                            if (plantTableData.length > 1) {
                                tableBody.push(plantTotalsRow);
                            }
                            
                            // Combine data and totals in one table
                            doc.autoTable({
                                head: [headers],
                                body: tableBody,
                                startY: currentY,
                                margin: { left: margin, right: margin },
                                styles: { fontSize: 7, cellPadding: 1 },
                                headStyles: { fillColor: [220, 220, 220], fontSize: 7, textColor: [0, 0, 0] }, // Light grey with black text
                                bodyStyles: { fontSize: 7 },
                                alternateRowStyles: { fillColor: [245, 245, 245] },
                                columnStyles: {
                                    // Plant name and Coal Company columns with fixed width
                                    0: { halign: 'center', cellWidth: plantNameWidth },  // Plant Name
                                    1: { halign: 'center', cellWidth: coalCompanyWidth },  // Coal Company
                                    // All data columns after Coal Company (index 2+) are center-aligned with calculated width
                                    2: { halign: 'center', cellWidth: dataColumnWidth },
                                    3: { halign: 'center', cellWidth: dataColumnWidth },
                                    4: { halign: 'center', cellWidth: dataColumnWidth },
                                    5: { halign: 'center', cellWidth: dataColumnWidth },
                                    6: { halign: 'center', cellWidth: dataColumnWidth },
                                    7: { halign: 'center', cellWidth: dataColumnWidth },
                                    8: { halign: 'center', cellWidth: dataColumnWidth },
                                    9: { halign: 'center', cellWidth: dataColumnWidth },
                                    10: { halign: 'center', cellWidth: dataColumnWidth },
                                    11: { halign: 'center', cellWidth: dataColumnWidth },
                                    12: { halign: 'center', cellWidth: dataColumnWidth },
                                    13: { halign: 'center', cellWidth: dataColumnWidth },
                                    14: { halign: 'center', cellWidth: dataColumnWidth },
                                    15: { halign: 'center', cellWidth: dataColumnWidth },
                                    16: { halign: 'center', cellWidth: dataColumnWidth },
                                    17: { halign: 'center', cellWidth: dataColumnWidth },
                                    18: { halign: 'center', cellWidth: dataColumnWidth },
                                    19: { halign: 'center', cellWidth: dataColumnWidth },
                                    20: { halign: 'center', cellWidth: dataColumnWidth }
                                },
                                didParseCell: function(data) {
                                    // Center-align ALL headers
                                    if (data.row.section === 'head') {
                                        data.cell.styles.halign = 'center';
                                    }
                                    
                                    // Highlight totals row
                                    if (data.row.index === plantTableData.length) {
                                        data.cell.styles.fontStyle = 'bold';
                                        data.cell.styles.fillColor = [230, 240, 250];
                                    }
                                },
                                theme: 'striped'
                            });
                            
                            currentY = doc.lastAutoTable.finalY + 5;
                        });
                    } else {
                        // Show data for this sub-group
                        const subGroupTableData = subGroup.data.map(formatRowForPDF);
                        const subGroupTotalsRow = formatTotalsForPDF(subGroup.totals);
                        
                        // Only add totals row if there are multiple data rows (i.e., multiple entries to total)
                        const tableBody = [...subGroupTableData];
                        if (subGroupTableData.length > 1) {
                            tableBody.push(subGroupTotalsRow);
                        }
                        
                        // Combine data and totals in one table
                        doc.autoTable({
                            head: [headers],
                            body: tableBody,
                            startY: currentY,
                            margin: { left: margin, right: margin },
                            styles: { fontSize: 7, cellPadding: 1 },
                            headStyles: { fillColor: [220, 220, 220], fontSize: 7, textColor: [0, 0, 0] }, // Light grey with black text
                            bodyStyles: { fontSize: 7 },
                            alternateRowStyles: { fillColor: [245, 245, 245] },
                            columnStyles: {
                                // Plant name and Coal Company columns with fixed width
                                0: { halign: 'center', cellWidth: plantNameWidth },  // Plant Name
                                1: { halign: 'center', cellWidth: coalCompanyWidth },  // Coal Company
                                // All data columns after Coal Company (index 2+) are center-aligned with calculated width
                                2: { halign: 'center', cellWidth: dataColumnWidth },
                                3: { halign: 'center', cellWidth: dataColumnWidth },
                                4: { halign: 'center', cellWidth: dataColumnWidth },
                                5: { halign: 'center', cellWidth: dataColumnWidth },
                                6: { halign: 'center', cellWidth: dataColumnWidth },
                                7: { halign: 'center', cellWidth: dataColumnWidth },
                                8: { halign: 'center', cellWidth: dataColumnWidth },
                                9: { halign: 'center', cellWidth: dataColumnWidth },
                                10: { halign: 'center', cellWidth: dataColumnWidth },
                                11: { halign: 'center', cellWidth: dataColumnWidth },
                                12: { halign: 'center', cellWidth: dataColumnWidth },
                                13: { halign: 'center', cellWidth: dataColumnWidth },
                                14: { halign: 'center', cellWidth: dataColumnWidth },
                                15: { halign: 'center', cellWidth: dataColumnWidth },
                                16: { halign: 'center', cellWidth: dataColumnWidth },
                                17: { halign: 'center', cellWidth: dataColumnWidth },
                                18: { halign: 'center', cellWidth: dataColumnWidth },
                                19: { halign: 'center', cellWidth: dataColumnWidth },
                                20: { halign: 'center', cellWidth: dataColumnWidth }
                            },
                            didParseCell: function(data) {
                                // Center-align ALL headers
                                if (data.row.section === 'head') {
                                    data.cell.styles.halign = 'center';
                                }
                                
                                // Highlight totals row
                                if (data.row.index === subGroupTableData.length) {
                                    data.cell.styles.fontStyle = 'bold';
                                    data.cell.styles.fillColor = [230, 240, 250];
                                }
                            },
                            theme: 'striped'
                        });
                        
                        currentY = doc.lastAutoTable.finalY + 5;
                    }
                });
                
                // Add monthly consolidated table (coal company-wise data for all plants)
                checkNewPage(20);
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.text(`${group.monthDisplay} - Coal Company-wise Consolidated Data`, margin, currentY);
                currentY += 5; // Reduced from 8 to 5
                
                // Create consolidated data grouped by coal company
                const consolidatedData = {};
                group.data.forEach(row => {
                    const coalCompany = row[2] || 'Unknown';
                    if (!consolidatedData[coalCompany]) {
                        consolidatedData[coalCompany] = [];
                    }
                    consolidatedData[coalCompany].push(row);
                });
                
                // Generate consolidated table for each coal company
                Object.keys(consolidatedData).forEach(coalCompany => {
                    const companyData = consolidatedData[coalCompany];
                    const companyTotals = QCCalculateGroupTotals(companyData);
                    
                    checkNewPage(25); // More space needed for full table
                    doc.setFontSize(10);
                    doc.setFont("helvetica", "bold");
                    doc.text(`Coal Company: ${coalCompany}`, margin, currentY);
                    currentY += 8;
                    
                    // Create full table with headers and data rows
                    const companyTableData = companyData.map(formatRowForPDF);
                    const companyTotalsRow = formatTotalsForPDF(companyTotals);
                    
                    // Only add totals row if there are multiple plants for this coal company
                    const tableBody = [...companyTableData];
                    if (companyTableData.length > 1) {
                        tableBody.push(companyTotalsRow);
                    }
                    
                    doc.autoTable({
                        head: [headers],
                        body: tableBody,
                        startY: currentY,
                        margin: { left: margin, right: margin },
                        styles: { fontSize: 7, cellPadding: 1 },
                        headStyles: { fillColor: [220, 220, 220], fontSize: 7, textColor: [0, 0, 0] }, // Light grey with black text
                        bodyStyles: { fontSize: 7 },
                        alternateRowStyles: { fillColor: [245, 245, 245] },
                        columnStyles: {
                            // Plant name and Coal Company columns with fixed width
                            0: { halign: 'center', cellWidth: plantNameWidth },  // Plant Name
                            1: { halign: 'center', cellWidth: coalCompanyWidth },  // Coal Company
                            // All data columns after Coal Company (index 2+) are center-aligned with calculated width
                            2: { halign: 'center', cellWidth: dataColumnWidth },
                            3: { halign: 'center', cellWidth: dataColumnWidth },
                            4: { halign: 'center', cellWidth: dataColumnWidth },
                            5: { halign: 'center', cellWidth: dataColumnWidth },
                            6: { halign: 'center', cellWidth: dataColumnWidth },
                            7: { halign: 'center', cellWidth: dataColumnWidth },
                            8: { halign: 'center', cellWidth: dataColumnWidth },
                            9: { halign: 'center', cellWidth: dataColumnWidth },
                            10: { halign: 'center', cellWidth: dataColumnWidth },
                            11: { halign: 'center', cellWidth: dataColumnWidth },
                            12: { halign: 'center', cellWidth: dataColumnWidth },
                            13: { halign: 'center', cellWidth: dataColumnWidth },
                            14: { halign: 'center', cellWidth: dataColumnWidth },
                            15: { halign: 'center', cellWidth: dataColumnWidth },
                            16: { halign: 'center', cellWidth: dataColumnWidth },
                            17: { halign: 'center', cellWidth: dataColumnWidth },
                            18: { halign: 'center', cellWidth: dataColumnWidth },
                            19: { halign: 'center', cellWidth: dataColumnWidth },
                            20: { halign: 'center', cellWidth: dataColumnWidth }
                        },
                        didParseCell: function(data) {
                            // Center-align ALL headers
                            if (data.row.section === 'head') {
                                data.cell.styles.halign = 'center';
                            }
                            
                            // Highlight totals row
                            if (data.row.index === companyTableData.length) {
                                data.cell.styles.fontStyle = 'bold';
                                data.cell.styles.fillColor = [230, 240, 250];
                            }
                        },
                        theme: 'striped'
                    });
                    
                    currentY = doc.lastAutoTable.finalY + 5;
                });
                
                currentY += 5;
                
                // Month totals
                checkNewPage(15);
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.text(`${group.monthDisplay} - Month Total/Average`, margin, currentY);
                currentY += 5;
                
                const monthTotalsRow = formatTotalsForPDF(group.totals);
                doc.autoTable({
                    body: [monthTotalsRow],
                    startY: currentY,
                    margin: { left: margin, right: margin },
                    styles: { fontSize: 9, cellPadding: 2, fontStyle: 'bold' },
                    bodyStyles: { fillColor: [220, 220, 220] },
                    theme: 'plain'
                });
                
                currentY = doc.lastAutoTable.finalY + 10;
            }
        });
        
        // Add grand totals with proper table styling
        checkNewPage(30);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text('GRAND TOTAL - Overall Coal Company-wise Summary', margin, currentY);
        currentY += 5; // Reduced from 8 to 5
        
        // Group all data by coal company for final totals
        const finalCoalCompanyGroups = {};
        const allPlantNames = new Set();  // Collect all unique plant names
        Object.keys(reportData.groupedData).forEach(groupKey => {
            const group = reportData.groupedData[groupKey];
            group.data.forEach(row => {
                const coalCompany = row[2] || 'Unknown';
                const plantName = row[1] || 'Unknown Plant';
                allPlantNames.add(plantName);  // Add plant name to set
                if (!finalCoalCompanyGroups[coalCompany]) {
                    finalCoalCompanyGroups[coalCompany] = [];
                }
                finalCoalCompanyGroups[coalCompany].push(row);
            });
        });
        
        const finalPlantNames = Array.from(allPlantNames);
        const hasFinalMultiplePlants = finalPlantNames.length > 1;
        
        // Prepare final grand total table with coal company breakdown
        const finalTotalsData = [];
        const finalAllPlantsRowSpans = []; // Track "All Plants" rows for merging
        let finalAllPlantsStartRow = 0;
        const hasMultipleFinalCoalCompanies = Object.keys(finalCoalCompanyGroups).length > 1;
        
        Object.keys(finalCoalCompanyGroups).forEach((coalCompany, index) => {
            const companyData = finalCoalCompanyGroups[coalCompany];
            const companyTotals = QCCalculateGroupTotals(companyData);
            const companyTotalsRow = formatTotalsForPDF(companyTotals);
            // Correct column placement: All Plants in plant column, coal company in coal company column
            
            if (hasMultipleFinalCoalCompanies) {
                // Multiple coal companies: show "All Plants" merged format
                if (index === 0) {
                    companyTotalsRow[0] = 'All Plants';        // Show "All Plants" only in first row
                } else {
                    companyTotalsRow[0] = '';                  // Empty for merging effect
                }
            } else {
                // Single coal company: show plant names in Plant column
                if (hasFinalMultiplePlants) {
                    companyTotalsRow[0] = 'All Plants';
                } else {
                    companyTotalsRow[0] = finalPlantNames[0] || 'Unknown Plant';  // Show single plant name
                }
            }
            companyTotalsRow[1] = coalCompany;         // Coal Company column
            finalTotalsData.push(companyTotalsRow);
        });
        
        // Track "All Plants" span for styling only if multiple coal companies
        if (hasMultipleFinalCoalCompanies && Object.keys(finalCoalCompanyGroups).length > 0) {
            finalAllPlantsRowSpans.push({
                startRow: finalAllPlantsStartRow,
                endRow: Object.keys(finalCoalCompanyGroups).length - 1,
                rowCount: Object.keys(finalCoalCompanyGroups).length
            });
        }
        
        // Add overall grand total row only if multiple coal companies
        if (hasMultipleFinalCoalCompanies) {
            const overallGrandTotalsRow = formatTotalsForPDF(reportData.grandTotals);
            overallGrandTotalsRow[0] = 'All Plants';      // Show "All Plants" for grand total separately
            overallGrandTotalsRow[1] = 'All Sources';     // Coal Company column
            finalTotalsData.push(overallGrandTotalsRow);
        }
        
        // Create the final grand total table with headers and proper styling
        doc.autoTable({
            head: [headers],
            body: finalTotalsData,
            startY: currentY,
            margin: { left: margin, right: margin },
            styles: { fontSize: 7, cellPadding: 1, fontStyle: 'bold' },
            headStyles: { fillColor: [220, 220, 220], fontSize: 7, textColor: [0, 0, 0] }, // Light grey with black text
            bodyStyles: { fontSize: 7, fillColor: [240, 248, 255] }, // Light blue for company totals
            columnStyles: {
                // Plant name and Coal Company columns with fixed width
                0: { halign: 'center', cellWidth: plantNameWidth },  // Plant Name
                1: { halign: 'center', cellWidth: coalCompanyWidth },  // Coal Company
                // All data columns after Coal Company (index 2+) are center-aligned with calculated width
                2: { halign: 'center', cellWidth: dataColumnWidth },
                3: { halign: 'center', cellWidth: dataColumnWidth },
                4: { halign: 'center', cellWidth: dataColumnWidth },
                5: { halign: 'center', cellWidth: dataColumnWidth },
                6: { halign: 'center', cellWidth: dataColumnWidth },
                7: { halign: 'center', cellWidth: dataColumnWidth },
                8: { halign: 'center', cellWidth: dataColumnWidth },
                9: { halign: 'center', cellWidth: dataColumnWidth },
                10: { halign: 'center', cellWidth: dataColumnWidth },
                11: { halign: 'center', cellWidth: dataColumnWidth },
                12: { halign: 'center', cellWidth: dataColumnWidth },
                13: { halign: 'center', cellWidth: dataColumnWidth },
                14: { halign: 'center', cellWidth: dataColumnWidth },
                15: { halign: 'center', cellWidth: dataColumnWidth },
                16: { halign: 'center', cellWidth: dataColumnWidth },
                17: { halign: 'center', cellWidth: dataColumnWidth },
                18: { halign: 'center', cellWidth: dataColumnWidth },
                19: { halign: 'center', cellWidth: dataColumnWidth },
                20: { halign: 'center', cellWidth: dataColumnWidth }
            },
            didParseCell: function(data) {
                // Center-align ALL headers
                if (data.row.section === 'head') {
                    data.cell.styles.halign = 'center';
                }
                
                // Style "All Plants" cells (first column) for merging
                if (data.column.index === 0) {
                    const currentRowIndex = data.row.index;
                    const isGrandTotalRow = currentRowIndex === finalTotalsData.length - 1;
                    
                    if (!isGrandTotalRow) {
                        // Handle "All Plants" merging for coal company rows
                        const allPlantsGroup = finalAllPlantsRowSpans.find(group => 
                            currentRowIndex >= group.startRow && currentRowIndex <= group.endRow
                        );
                        
                        if (allPlantsGroup) {
                            if (currentRowIndex === allPlantsGroup.startRow) {
                                // First row shows "All Plants" with header styling
                                data.cell.styles.halign = 'center';
                                data.cell.styles.valign = 'middle';
                                data.cell.styles.fontStyle = 'bold';
                                data.cell.styles.fillColor = [220, 220, 220]; // Light grey background
                                data.cell.styles.textColor = [0, 0, 0]; // Black text
                                data.cell.styles.minCellHeight = 6; // Reduced height for compactness
                            } else {
                                // Subsequent rows have same background with no borders
                                data.cell.styles.lineWidth = 0;
                                data.cell.styles.fillColor = [220, 220, 220]; // Same light grey background
                                data.cell.styles.textColor = [0, 0, 0]; // Black text
                                data.cell.styles.halign = 'center';
                                data.cell.styles.valign = 'middle';
                                data.cell.styles.minCellHeight = 6; // Reduced height for compactness
                            }
                        }
                    }
                }
                
                // Special styling for overall grand total row (last row)
                if (data.row.index === finalTotalsData.length - 1) {
                    data.cell.styles.fillColor = [255, 248, 220]; // Light yellow for overall grand total
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.minCellHeight = 6; // Reduced height for compactness
                    if (data.column.index === 0) {
                        data.cell.styles.textColor = [0, 0, 0]; // Black text for grand total
                    }
                }
            },
            theme: 'striped'
        });
        } // Close the else block for month-wise grouping
        
        // Add timestamp at bottom of last page
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        const timestamp = `Report generated on: ${new Date().toLocaleString()}`;
        const timestampY = pageHeight - 5; // 5mm from bottom to match reduced margin
        doc.text(timestamp, margin, timestampY);
        
        // Add page numbers to all pages
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            const pageText = `Page ${i}`;
            const pageTextWidth = doc.getTextWidth(pageText);
            doc.text(pageText, pageWidth - margin - pageTextWidth, pageHeight - 5);
        }
        
        // Save the PDF
        const filename = `coal_special_report_${fromDate}_to_${toDate}_${grouping}.pdf`;
        doc.save(filename);
        
    } catch (error) {
        console.error('Error generating special report PDF:', error);
        alert('Error generating PDF: ' + error.message);
    }
}

// Generate Special Report Excel
function QCGenerateSpecialReportExcel(reportData, fromDate, toDate, grouping, plantWise, coalCompanyWise) {
    try {
        if (typeof XLSX === 'undefined') {
            alert('Excel library not loaded. Please ensure SheetJS is included.');
            return;
        }
        
        // Get visible columns and prepare data
        const visibleColumns = QCGetVisibleColumns(true);
        const headers = visibleColumns.map(col => col.header);
        
        // Prepare Excel data
        const excelData = [];
        excelData.push(['Details of coal received at PSPCL thermal power stations']);
        // Format period - handle both YYYY-MM format and Google Sheets Date format
        const fromDateFormatted = fromDate.includes('Date(') ? formatMonthForDisplay(fromDate) : 
                                 fromDate.match(/^\d{4}-\d{2}$/) ? fromDate.replace(/(\d{4})-(\d{2})/, (match, year, month) => {
                                     const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                     return `${monthNames[parseInt(month) - 1]}-${year}`;
                                 }) : formatMonthForDisplay(fromDate);
        const toDateFormatted = toDate.includes('Date(') ? formatMonthForDisplay(toDate) : 
                               toDate.match(/^\d{4}-\d{2}$/) ? toDate.replace(/(\d{4})-(\d{2})/, (match, year, month) => {
                                   const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                   return `${monthNames[parseInt(month) - 1]}-${year}`;
                               }) : formatMonthForDisplay(toDate);
        excelData.push([`during ${fromDateFormatted} to ${toDateFormatted}`]);
        excelData.push([]); // Empty row
        
        // Function to format a row for Excel
        const formatRowForExcel = (row) => {
            return visibleColumns.map(col => {
                let value = '';
                
                if (col.index <= 14) {
                    value = row[col.index] !== undefined && row[col.index] !== '' ? row[col.index] : '';
                    if (col.index === 1) value = shortenPlantName(value);
                    if (col.index >= 3 && col.index <= 14 && !isNaN(parseFloat(value))) {
                        value = parseFloat(value);
                    }
                } else {
                    // Calculate extended columns
                    const coalCost = parseFloat(row[12]) || 0;
                    const railwayFreight = parseFloat(row[13]) || 0;
                    const gcv = parseFloat(row[11]) || 1;
                    const qtyReceived = parseFloat(row[4]) || 0;
                    const plantName = row[1] || 'PSPCL';
                    
                    switch (col.index) {
                        case 15: // Landed Cost Rs/MT
                            const landedCostPerMT = coalCost + railwayFreight;
                            value = landedCostPerMT;
                            break;
                        case 16: // Landed Cost Rs/Mcal
                            const landedCostPerMT2 = coalCost + railwayFreight;
                            const landedCostPerMcal = gcv > 0 ? landedCostPerMT2 / gcv : 0;
                            value = landedCostPerMcal;
                            break;
                        case 17: // Per Unit Cost Rs./Kwh
                            const landedCostPerMT3 = coalCost + railwayFreight;
                            const landedCostPerMcal3 = gcv > 0 ? landedCostPerMT3 / gcv : 0;
                            const shr = getWeightedAverageSHRForPlant(plantName);
                            const perUnitCost = shr * landedCostPerMcal3 / 1000;
                            value = perUnitCost;
                            break;
                        case 18: // Total Amount (Rs. Crore)
                            const landedCostPerMT4 = coalCost + railwayFreight;
                            const totalAmount = (qtyReceived * landedCostPerMT4) / 100; // Convert to crores
                            value = totalAmount;
                            break;
                        default:
                            value = '';
                    }
                }
                
                return value;
            });
        };
        
        // Function to format totals row for Excel
        const formatTotalsForExcel = (totals, label = 'TOTAL/AVG', showTotalInPlantColumn = false) => {
            return visibleColumns.map(col => {
                let value = '';
                
                switch (col.index) {
                    case 0: value = label; break;
                    case 1: value = showTotalInPlantColumn ? 'TOTAL' : ''; break;
                    case 2: value = ''; break;
                    case 3: value = totals.qtyDispatched; break;              // Qty Dispatched - Sum
                    case 4: value = totals.qtyReceived; break;                // Qty Received - Sum
                    case 5: value = totals.rakesReceived; break;              // Rakes Received - Sum
                    case 6: value = totals.transitLoss.avg; break;            // Transit Loss - Avg
                    case 7: value = totals.moisture.avg; break;               // Moisture - Weighted Avg
                    case 8: value = totals.ash.avg; break;                    // Ash - Weighted Avg
                    case 9: value = totals.vm.avg; break;                     // Volatile Matter - Weighted Avg
                    case 10: value = totals.fc.avg; break;                    // Fixed Carbon - Weighted Avg
                    case 11: value = totals.gcv.avg; break;                   // GCV - Weighted Avg
                    case 12: value = totals.coalCost.avg; break;              // Coal Cost - Weighted Avg
                    case 13: value = totals.railwayFreight.avg; break;        // Railway Freight - Weighted Avg
                    case 14: value = totals.distance.avg; break;              // Distance - Weighted Avg
                    case 15: value = totals.landedCostPerMT.avg; break;       // Landed Cost Rs/MT - Weighted Avg
                    case 16: value = totals.landedCostPerMcal.avg; break;     // Landed Cost Rs/Mcal - Weighted Avg
                    case 17: value = totals.perUnitCost.avg; break;           // Per Unit Cost - Weighted Avg
                    case 18: value = totals.totalAmount; break;               // Total Amount - Sum
                    default: value = '';
                }
                
                return value;
            });
        };
        
        // Generate report based on grouping
        const groupedData = reportData.groupedData;
        
        Object.keys(groupedData).forEach(groupKey => {
            const group = groupedData[groupKey];
            
            if (!coalCompanyWise && !plantWise) {
                // Add month/year header - simplified format
                excelData.push([]);
                excelData.push([group.monthDisplay]); // Just the month name, Excel will format with light grey BG
                excelData.push(headers);
                
                // Group data by plant for enhanced structure
                const plantGroups = {};
                group.data.forEach(row => {
                    const plantName = row[1] || 'Unknown Plant';
                    if (!plantGroups[plantName]) {
                        plantGroups[plantName] = [];
                    }
                    plantGroups[plantName].push(row);
                });
                
                const plantNames = Object.keys(plantGroups);
                const hasMultiplePlants = plantNames.length > 1;
                
                // Add each plant's data with totals
                plantNames.forEach((plantName, index) => {
                    const plantData = plantGroups[plantName];
                    const plantTotals = QCCalculateGroupTotals(plantData);
                    
                    // Add plant data rows
                    plantData.forEach(row => {
                        excelData.push(formatRowForExcel(row));
                    });
                    
                    // Add plant total row - simplified to just "TOTAL"
                    const plantTotalsRow = formatTotalsForExcel(plantTotals, 'TOTAL', true);
                    excelData.push(plantTotalsRow);
                    
                    // Add spacing between plants (except for last plant)
                    if (index < plantNames.length - 1) {
                        excelData.push([]); // Empty row for separation
                    }
                });
                
                // Add consolidated coal company totals (only if multiple plants)
                if (hasMultiplePlants) {
                    excelData.push([]);
                    excelData.push([`${group.monthDisplay} - Coal Company-wise Totals`]);
                    excelData.push(headers);
                    
                    // Group data by coal company and calculate totals only
                    const coalCompanyGroups = {};
                    group.data.forEach(row => {
                        const coalCompany = row[2] || 'Unknown';
                        if (!coalCompanyGroups[coalCompany]) {
                            coalCompanyGroups[coalCompany] = [];
                        }
                        coalCompanyGroups[coalCompany].push(row);
                    });
                    
                    // Add coal company totals and grand total
                    Object.keys(coalCompanyGroups).forEach(coalCompany => {
                        const companyData = coalCompanyGroups[coalCompany];
                        const companyTotals = QCCalculateGroupTotals(companyData);
                        const companyTotalsRow = formatTotalsForExcel(companyTotals);
                        // Set correct column values
                        companyTotalsRow[0] = 'All Plants';
                        companyTotalsRow[1] = coalCompany;
                        excelData.push(companyTotalsRow);
                    });
                    
                    // Add grand total row to the same section
                    const grandTotalsRow = formatTotalsForExcel(group.totals);
                    grandTotalsRow[0] = 'All Plants';
                    grandTotalsRow[1] = 'All Sources';
                    excelData.push(grandTotalsRow);
                }
                
            } else {
                // Add month/year header
                excelData.push([]);
                excelData.push([`${group.monthDisplay}`]);
                excelData.push(headers);
                // Sub-grouping by coal company and/or plant
                Object.keys(group.subGroups).forEach(subGroupKey => {
                    const subGroup = group.subGroups[subGroupKey];
                    
                    const subGroupLabel = coalCompanyWise ? `Coal Company: ${subGroup.name}` : `Plant: ${subGroup.name}`;
                    excelData.push([subGroupLabel]);
                    
                    if (plantWise && coalCompanyWise && subGroup.plantGroups) {
                        // Further sub-grouping by plant
                        Object.keys(subGroup.plantGroups).forEach(plantKey => {
                            const plantGroup = subGroup.plantGroups[plantKey];
                            
                            excelData.push([`  Plant: ${plantGroup.name}`]);
                            
                            plantGroup.data.forEach(row => {
                                excelData.push(formatRowForExcel(row));
                            });
                            
                            // Plant totals
                            excelData.push(formatTotalsForExcel(plantGroup.totals, `  Plant ${plantGroup.name} Total/Avg`));
                            excelData.push([]);
                        });
                    } else {
                        // Show data for this sub-group
                        subGroup.data.forEach(row => {
                            excelData.push(formatRowForExcel(row));
                        });
                        
                        // Sub-group totals
                        excelData.push(formatTotalsForExcel(subGroup.totals, `${subGroup.name} Total/Avg`));
                        excelData.push([]);
                    }
                });
                
                // Add monthly consolidated table (coal company-wise data for all plants)
                excelData.push([`${group.monthDisplay} - Coal Company-wise Consolidated Data`]);
                
                // Create consolidated data grouped by coal company
                const consolidatedData = {};
                group.data.forEach(row => {
                    const coalCompany = row[2] || 'Unknown';
                    if (!consolidatedData[coalCompany]) {
                        consolidatedData[coalCompany] = [];
                    }
                    consolidatedData[coalCompany].push(row);
                });
                
                // Generate consolidated table for each coal company
                Object.keys(consolidatedData).forEach(coalCompany => {
                    const companyData = consolidatedData[coalCompany];
                    const companyTotals = QCCalculateGroupTotals(companyData);
                    
                    excelData.push([`Coal Company: ${coalCompany}`]);
                    excelData.push(headers); // Add headers
                    
                    // Add all company data rows
                    companyData.forEach(row => {
                        excelData.push(formatRowForExcel(row));
                    });
                    
                    // Add totals row
                    excelData.push(formatTotalsForExcel(companyTotals));
                    excelData.push([]);
                });
                
                // Month totals
                excelData.push([`${group.monthDisplay} - Month Total/Average`]);
                excelData.push(formatTotalsForExcel(group.totals));
            }
            
            excelData.push([]); // Empty row after each month
        });
        
        // Add enhanced grand totals with coal company breakdown
        excelData.push([]);
        excelData.push(['GRAND TOTAL - Overall Coal Company-wise Summary']);
        excelData.push(headers);
        
        // Group all data by coal company for final totals
        const finalCoalCompanyGroups = {};
        Object.keys(reportData.groupedData).forEach(groupKey => {
            const group = reportData.groupedData[groupKey];
            group.data.forEach(row => {
                const coalCompany = row[2] || 'Unknown';
                if (!finalCoalCompanyGroups[coalCompany]) {
                    finalCoalCompanyGroups[coalCompany] = [];
                }
                finalCoalCompanyGroups[coalCompany].push(row);
            });
        });
        
        // Add final coal company totals
        Object.keys(finalCoalCompanyGroups).forEach(coalCompany => {
            const companyData = finalCoalCompanyGroups[coalCompany];
            const companyTotals = QCCalculateGroupTotals(companyData);
            const companyTotalsRow = formatTotalsForExcel(companyTotals);
            // Set correct column values
            companyTotalsRow[0] = 'All Plants';
            companyTotalsRow[1] = coalCompany;
            excelData.push(companyTotalsRow);
        });
        
        // Add overall grand total
        const overallGrandTotalsRow = formatTotalsForExcel(reportData.grandTotals);
        overallGrandTotalsRow[0] = 'All Plants';
        overallGrandTotalsRow[1] = 'All Sources';
        excelData.push(overallGrandTotalsRow);
        
        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(excelData);
        
        // Add the worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Special Report');
        
        // Generate filename
        const filename = `coal_special_report_${fromDate}_to_${toDate}_${grouping}.xlsx`;
        
        // Save the file
        XLSX.writeFile(workbook, filename);
        
        console.log('Special Report Excel generated successfully');
        
    } catch (error) {
        console.error('Special Report Excel error:', error);
        alert(`Error generating special report Excel: ${error.message}`);
    }
}
