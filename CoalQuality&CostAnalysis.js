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
        console.log("formatMonthForDisplay: ERROR - Not a Google Sheets Date format:", typeof monthStr, monthStr);
    }
    
    console.log("formatMonthForDisplay: FALLBACK - Returning Invalid Date");
    return 'Invalid Date';
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
            </div>
            <hr>

            <button class="btn btn-primary w-100" id="QCApplyFilters">
                <i class="bi bi-check-circle"></i> Apply Filters
            </button>
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
        { id: 'perUnitCost', label: 'Per Unit Cost (Rs/kWh)', default: true }
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
function QCGetVisibleColumns() {
    // Always include Plant Name and Coal Company as they are essential columns
    const visibleColumns = [
        { id: 'plant', header: 'Plant Name', index: 1 },
        { id: 'coalCompany', header: 'Coal Company', index: 2 }
    ];
    
    const selectableColumns = [
        { id: 'qtyDispatched', header: 'Qty. Dispatched (Lakh MT)', index: 3 },
        { id: 'qtyReceived', header: 'Qty. Received (Lakh MT)', index: 4 },
        { id: 'rakesReceived', header: 'Rakes Received', index: 5 },
        { id: 'transitLoss', header: 'Transit Loss (%)', index: 6 },
        { id: 'moisture', header: 'Moisture (%)', index: 7 },
        { id: 'ash', header: 'Ash (%)', index: 8 },
        { id: 'volatileMatter', header: 'Volatile Matter (%)', index: 9 },
        { id: 'fixedCarbon', header: 'Fixed Carbon (%)', index: 10 },
        { id: 'gcv', header: 'GCV (Kcal/Kg)', index: 11 },
        { id: 'coalCost', header: 'Coal Cost (Rs/MT)', index: 12 },
        { id: 'railwayFreight', header: 'Railway Freight (Rs/MT)', index: 13 },
        { id: 'distance', header: 'Distance (KMs)', index: 14 },
        { id: 'landedCostMT', header: 'Landed Cost (Rs/MT)', index: 15 },
        { id: 'landedCostMcal', header: 'Landed Cost (Rs/Mcal)', index: 16 },
        { id: 'perUnitCost', header: 'Per Unit Cost (Rs/kWh)', index: 17 }
    ];
    
    // Add selected columns to the visible columns
    selectableColumns.forEach(col => {
        const checkbox = document.getElementById(`QCCol_${col.id}`);
        if (checkbox && checkbox.checked) {
            visibleColumns.push(col);
        }
    });
    
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
    
    visibleColumns.forEach(col => {
        let value = '';
        
        if (col.index <= 14) {
            // Original data columns
            value = row[col.index] !== undefined && row[col.index] !== '' ? row[col.index] : '&nbsp;';
            
            // Apply plant name shortening for column 1 (plant name)
            if (col.index === 1) {
                value = shortenPlantName(value);
            }
            
            // Format numbers for better display
            if (col.index >= 3 && col.index <= 14 && !isNaN(parseFloat(value))) {
                if (col.index === 3 || col.index === 4) { // Qty columns - 4 decimals
                    value = parseFloat(value).toFixed(4);
                } else if (col.index === 5) { // Rakes
                    value = Math.round(parseFloat(value));
                } else if (col.index === 11 || col.index === 12 || col.index === 13) { // GCV, Coal Cost, Railway Freight - 0 decimals
                    value = Math.round(parseFloat(value));
                } else if (col.index >= 6) { // Percentages and other costs
                    value = parseFloat(value).toFixed(2);
                }
            }
        } else {
            // Extended/calculated columns
            switch (col.index) {
                case 15: // Landed Cost Rs/MT
                    value = extendedData.landedCostPerMT ? extendedData.landedCostPerMT.toFixed(0) : '&nbsp;';
                    break;
                case 16: // Landed Cost Rs/Mcal
                    value = extendedData.landedCostPerMcal ? extendedData.landedCostPerMcal.toFixed(4) : '&nbsp;';
                    break;
                case 17: // Per Unit Cost - 3 decimals
                    value = extendedData.perUnitCost ? extendedData.perUnitCost.toFixed(3) : '&nbsp;';
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
    
    // Get visible columns based on user selection
    const visibleColumns = QCGetVisibleColumns();
    
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
            
            const extendedData = {
                shr: psppclSHR,
                landedCostPerMT: landedCostPerMT,
                landedCostPerMcal: landedCostPerMcal,
                perUnitCost: perUnitCost
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
                    
                    const extendedData = {
                        shr: shr,
                        landedCostPerMT: landedCostPerMT,
                        landedCostPerMcal: landedCostPerMcal,
                        perUnitCost: perUnitCost
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
                
                const extendedData = {
                    shr: shr,
                    landedCostPerMT: landedCostPerMT,
                    landedCostPerMcal: landedCostPerMcal,
                    perUnitCost: perUnitCost
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
        // Filter data by month range
        const monthFilteredData = QCFilterDataByMonth(QualityCostData1);
        
        // Filter out RCR Mode and Imported rows unless coal company consolidation is selected
        const filteredData = QCFilterRCRAndImported(monthFilteredData);
        
        // Consolidate data based on selected options
        const processedData = QCConsolidateData(filteredData);
        
        return processedData;
    } catch (error) {
        console.error('Error getting processed data:', error);
        return [];
    }
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
        const visibleColumns = QCGetVisibleColumns(); // This respects user's column selection
        
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
