let LoadingReceiptData = [];
let LoadingReceiptHeaders = [];
let LoadingReceiptGenCompanies = [];
let LoadingReceiptCoalCompanies = [];
let LoadingReceiptPlants = [];

// Fetch headers and metadata from Google Sheets
async function fetchLoadingReceiptHeaders() {
    console.log("Starting fetchLoadingReceiptHeaders");
    const SHEET_ID = '1cFngrabiTY-RMGDrw2eRn7Nn8LEY0IZyD0-QJT7UqTI';
    const SHEET_NAME = 'Daily Coal Stock'; // Your sheet name
    const RANGE = 'A1:BA3'; // Rows 1-3 for metadata
    const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&range=${RANGE}`;
    console.log("Fetching from URL:", SHEET_URL);
    try {
        const res = await fetch(SHEET_URL);
        const text = await res.text();
        console.log("Raw response text (first 100 chars):", text.substring(0, 100));
        
        // Check if the response contains "table"
        if (!text.includes("table")) {
            console.error("Response doesn't contain table data. Full response:", text);
            const tableContainer = document.getElementById('LR-table-container');
            if (tableContainer) {
                tableContainer.innerHTML = 
                    `<div class="alert alert-danger">
                        Error loading data: Invalid response from Google Sheets. 
                        Make sure your spreadsheet is published to the web and the sheet name is correct.
                    </div>`;
            }
            return;
        }
        
        // Parse the JSON response
        const json = JSON.parse(text.substr(47).slice(0, -2));
        console.log("Parsed JSON:", json);
        
        if (!json.table || !json.table.rows || json.table.rows.length < 3) {
            console.error("Missing table data in response");
            return;
        }
        
        const table = json.table;
        
        // Debug the actual rows we get
        console.log("Row 0 data:", table.rows[0]);
        console.log("Row 1 data:", table.rows[1]);
        console.log("Row 2 data:", table.rows[2]);
        
        LoadingReceiptGenCompanies = table.rows[0].c.map(cell => cell ? cell.v : "");
        LoadingReceiptCoalCompanies = table.rows[1].c.map(cell => cell ? cell.v : "");
        LoadingReceiptPlants = table.rows[2].c.map(cell => cell ? cell.v : "");
        // Use Plant names as headers for the columns
        LoadingReceiptHeaders = LoadingReceiptPlants;
        
        console.log("Headers loaded:", LoadingReceiptHeaders.length);
        console.log("First few headers:", LoadingReceiptHeaders.slice(0, 5));
        console.log("First few gen companies:", LoadingReceiptGenCompanies.slice(0, 5));
        console.log("First few coal companies:", LoadingReceiptCoalCompanies.slice(0, 5));
        console.log("First few plants:", LoadingReceiptPlants.slice(0, 5));
    } catch (error) {
        console.error("Error in fetchLoadingReceiptHeaders:", error);
        const tableContainer = document.getElementById('LR-table-container');
        if (tableContainer) {
            tableContainer.innerHTML = 
                `<div class="alert alert-danger">
                    Error loading headers: ${error.message}
                </div>`;
        }
    }
}

// Fetch data from Google Sheets
async function fetchLoadingReceiptData() {
    console.log("Starting fetchLoadingReceiptData");
    const SHEET_ID = '1cFngrabiTY-RMGDrw2eRn7Nn8LEY0IZyD0-QJT7UqTI';
    const SHEET_NAME = 'Daily Coal Stock'; // Your sheet name
    const RANGE = 'A4:BA1000'; // Data starts from row 4
    const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&range=${RANGE}`;
    console.log("Fetching data from URL:", SHEET_URL);
    try {
        const res = await fetch(SHEET_URL);
        const text = await res.text();
        console.log("Raw data response (first 100 chars):", text.substring(0, 100));
        
        // Check if the response contains "table"
        if (!text.includes("table")) {
            console.error("Response doesn't contain table data. Full response:", text);
            const tableContainer = document.getElementById('LR-table-container');
            if (tableContainer) {
                tableContainer.innerHTML = 
                    `<div class="alert alert-danger">
                        Error loading data: Invalid response from Google Sheets. 
                        Make sure your spreadsheet is published to the web and the sheet name is correct.
                    </div>`;
            }
            return;
        }
        
        const json = JSON.parse(text.substr(47).slice(0, -2));
        console.log("Data JSON parsed:", json);
        
        if (!json.table || !json.table.rows) {
            console.error("Missing table data in response");
            return;
        }
        
        const table = json.table;
        
        // Debug the first few rows of data
        if (table.rows.length > 0) {
            console.log("First data row:", table.rows[0]);
            if (table.rows.length > 1) {
                console.log("Second data row:", table.rows[1]);
            }
        }
        
        try {
            // More robust data extraction
            LoadingReceiptData = table.rows
                .filter(row => row.c && row.c.length > 0)
                .map(row => {
                    // Ensure each row has the same number of columns
                    const rowData = Array(LoadingReceiptHeaders.length).fill("");
                    row.c.forEach((cell, idx) => {
                        if (cell && cell.v !== undefined) {
                            // Store the raw value, we'll format it during display
                            rowData[idx] = cell.v;
                        }
                    });
                    return rowData;
                });
                
            console.log("Data rows loaded:", LoadingReceiptData.length);
            if (LoadingReceiptData.length > 0) {
                console.log("First row sample:", LoadingReceiptData[0]);
                console.log("Date in first row:", LoadingReceiptData[0][0], "type:", typeof LoadingReceiptData[0][0]);
            }
            
            // Log more data for debugging
            if (LoadingReceiptData.length > 0) {
                console.log("First 5 row dates:");
                for (let i = 0; i < Math.min(5, LoadingReceiptData.length); i++) {
                    console.log(`Row ${i} date:`, LoadingReceiptData[i][0], "type:", typeof LoadingReceiptData[i][0]);
                }
            }
        } catch (error) {
            console.error("Error processing data rows:", error);
            LoadingReceiptData = [];
        }
        
        // Add a test row if no data was loaded
        if (LoadingReceiptData.length === 0) {
            console.log("No data loaded, adding test row");
            // Add a test row with today's date in dd/mm/yyyy format
            const today = new Date();
            const dd = String(today.getDate()).padStart(2, '0');
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const yyyy = today.getFullYear();
            const dateStr = `${dd}/${mm}/${yyyy}`;
            
            const testRow = Array(LoadingReceiptHeaders.length).fill("");
            testRow[0] = dateStr;
            for (let i = 1; i < testRow.length; i++) {
                testRow[i] = i; // Fill with numbers for testing
            }
            LoadingReceiptData.push(testRow);
            console.log("Added test row:", testRow);
        }
    } catch (error) {
        console.error("Error in fetchLoadingReceiptData:", error);
        const tableContainer = document.getElementById('LR-table-container');
        if (tableContainer) {
            tableContainer.innerHTML = 
                `<div class="alert alert-danger">
                    Error loading data: ${error.message}
                </div>`;
        }
    }
}

// Utility: Parse dd/mm/yyyy
function LRParseDMY(str) {
    console.log("Parsing date:", str, "type:", typeof str);
    
    // Check if it's already a date object
    if (str instanceof Date) return str;
    
    if (typeof str === "string") {
        try {
            // Handle dd/mm/yyyy format
            if (str.includes('/')) {
                const [d, m, y] = str.split('/').map(Number);
                console.log("Split date parts:", d, m, y);
                const date = new Date(y, m - 1, d);
                console.log("Parsed date result:", date);
                return date;
            }
            // Try to handle other string formats if needed
            const parsedDate = new Date(str);
            if (!isNaN(parsedDate.getTime())) {
                console.log("Parsed using Date constructor:", parsedDate);
                return parsedDate;
            }
        } catch (error) {
            console.error("Error parsing date:", str, error);
            // Don't return current date as fallback, return the original string
            return str;
        }
    }
    
    // If we can't parse it, return the original value
    return str;
}

// Utility: Get Month-Year
function LRGetMonthYear(str) {
    console.log("Getting month-year for:", str);
    
    try {
        let date;
        
        // Handle dd/mm/yyyy format directly
        if (typeof str === "string" && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
            const [d, m, y] = str.split('/').map(Number);
            date = new Date(y, m - 1, d);
        }
        // Check if it's an actual Date object from Google Sheets
        else if (str && typeof str === 'object' && str.getFullYear) {
            date = str;
        }
        // If it's a JavaScript Date object
        else if (str instanceof Date && !isNaN(str.getTime())) {
            date = str;
        }
        // Handle the string "Date(yyyy,m,d)" format specifically
        else if (typeof str === "string" && str.indexOf("Date(") !== -1) {
            const match = str.match(/Date\((\d{4}),\s*(\d{1,2}),\s*(\d{1,2})\)/);
            if (match) {
                const year = parseInt(match[1]);
                const month = parseInt(match[2]); // Already 0-based in Google format
                const day = parseInt(match[3]);
                date = new Date(year, month, day);
            }
        }
        // Try standard date parsing as last resort
        else {
            date = new Date(str);
        }
        
        // If we have a valid date, format it
        if (date && !isNaN(date.getTime())) {
            return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        }
    } catch (e) {
        console.error("Error getting month-year:", e);
    }
    
    // Return something meaningful if we can't parse
    return "Unknown Date";
}

// Utility: Get Financial Year
function LRGetFinancialYear(str) {
    console.log("Getting financial year for:", str);
    
    try {
        let date;
        
        // Handle dd/mm/yyyy format directly
        if (typeof str === "string" && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
            const [d, m, y] = str.split('/').map(Number);
            date = new Date(y, m - 1, d);
        }
        // Check if it's an actual Date object from Google Sheets
        else if (str && typeof str === 'object' && str.getFullYear) {
            date = str;
        }
        // If it's a JavaScript Date object
        else if (str instanceof Date && !isNaN(str.getTime())) {
            date = str;
        }
        // Handle the string "Date(yyyy,m,d)" format specifically
        else if (typeof str === "string" && str.indexOf("Date(") !== -1) {
            const match = str.match(/Date\((\d{4}),\s*(\d{1,2}),\s*(\d{1,2})\)/);
            if (match) {
                const year = parseInt(match[1]);
                const month = parseInt(match[2]); // Already 0-based in Google format
                const day = parseInt(match[3]);
                date = new Date(year, month, day);
            }
        }
        // Try standard date parsing as last resort
        else {
            date = new Date(str);
        }
        
        // If we have a valid date, calculate financial year
        if (date && !isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = date.getMonth() + 1; // 1-12
            const fyStart = month >= 4 ? year : year - 1;
            return `FY ${fyStart}-${(fyStart + 1).toString().slice(-2)}`;
        }
    } catch (e) {
        console.error("Error getting financial year:", e);
    }
    
    return "Unknown FY";
}

// Render filters and table
function showLoadingReceiptReport() {
    console.log("Starting showLoadingReceiptReport");
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-12
    const startDate = `01/${String(currentMonth).padStart(2, '0')}/${currentYear}`;
    const yesterday = new Date(today.getTime() - 86400000);
    const endDate = `${String(yesterday.getDate()).padStart(2, '0')}/${String(yesterday.getMonth() + 1).padStart(2, '0')}/${yesterday.getFullYear()}`;
    console.log("Default date range:", startDate, "to", endDate);

    document.getElementById('main-content').innerHTML = `
        <!-- Main Title Card -->
        <div class="pachhwara-pd-card mb-3">
            <div class="pachhwara-pd-section-header">
                <h4 class="mb-0"><i class="bi bi-truck"></i> Loading & Receipt Report</h4>
            </div>
        </div>

        <!-- Export Toggle Button -->
        <button class="btn btn-success export-toggle-btn" id="LRExportToggle">
            <i class="bi bi-box-arrow-up"></i>
        </button>

        <!-- Export Sidebar -->
        <div class="export-sidebar" id="LRExportSidebar">
            <button class="btn export-btn pdf-btn" id="LRExportPDFBtn" title="Export to PDF">
                <i class="bi bi-file-earmark-pdf"></i>
            </button>
            <button class="btn export-btn excel-btn" id="LRExportExcelBtn" title="Export to Excel">
                <i class="bi bi-file-earmark-excel"></i>
            </button>
            <button class="btn export-btn jpg-btn" id="LRExportImageBtn" title="Export to JPG">
                <i class="bi bi-file-earmark-image"></i>
            </button>
            <button class="btn export-btn print-btn" id="LRPrintReportBtn" title="Print">
                <i class="bi bi-printer"></i>
            </button>
        </div>

        <!-- Filter Toggle Button -->
        <button class="btn btn-primary filter-toggle-btn" id="LRFilterToggle">
            <i class="bi bi-funnel"></i>
        </button>

        <!-- Filter Sidebar -->
        <div class="filter-sidebar" id="LRFilterSidebar">
            <button class="close-btn" id="LRCloseSidebar">&times;</button>
            <h5><i class="bi bi-funnel"></i> Filters & Settings</h5>
            <hr>
            
            <!-- Date Range -->
            <div class="mb-3">
                <label class="form-label"><strong>Date Range</strong></label>
                <div class="mb-2">
                    <label class="form-label small">Start Date</label>
                    <input type="date" id="LRStartDate" class="form-control form-control-sm">
                </div>
                <div class="mb-2">
                    <label class="form-label small">End Date</label>
                    <input type="date" id="LREndDate" class="form-control form-control-sm">
                </div>
            </div>
            <hr>

            <!-- Consolidation Options -->
            <div class="mb-3">
                <label class="form-label"><strong>Consolidation Options</strong></label>
                <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" id="LRConsolidateMonth">
                    <label class="form-check-label" for="LRConsolidateMonth">
                        Consolidate by Month
                        <small class="d-block text-muted">Group data monthly</small>
                    </label>
                </div>
                <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" id="LRConsolidateFY">
                    <label class="form-check-label" for="LRConsolidateFY">
                        Consolidate by Financial Year
                        <small class="d-block text-muted">Group data by FY</small>
                    </label>
                </div>
            </div>
            <hr>

            <!-- Column Selection -->
            <div class="mb-3">
                <label class="form-label"><strong>Column Selection</strong></label>
                <div class="d-flex gap-2 mb-2">
                    <button type="button" class="btn btn-outline-success btn-sm" id="LRCheckAll">
                        <i class="bi bi-check-all"></i> All
                    </button>
                    <button type="button" class="btn btn-outline-danger btn-sm" id="LRUncheckAll">
                        <i class="bi bi-x-circle"></i> None
                    </button>
                </div>
                <div class="max-height-200" id="LRColumnCheckboxes"></div>
            </div>
        </div>

        <!-- Data Table Container -->
        <div id="LR-table-container"></div>
    `;

    console.log("Starting data fetch sequence");
    
    // Wait for DOM to be updated before proceeding
    setTimeout(() => {
        Promise.all([
            fetchLoadingReceiptHeaders(),
            LRSetupSidebars(),
            LRSetupExportFunctionality()
        ]).then(() => {
            console.log("Headers fetched, now fetching data");
            return fetchLoadingReceiptData();
        }).then(() => {
            console.log("Data fetched, rendering UI components");
            LRRenderColumnFilter();
            LRSetDefaultDates(startDate, endDate);
            LRRenderExtraFilters();
            LRRenderTable();
            LRSetupListeners();
        }).catch(err => {
            console.error("Error in data fetch:", err);
            const tableContainer = document.getElementById('LR-table-container');
            if (tableContainer) {
                tableContainer.innerHTML = `<div class="alert alert-danger">Error loading data: ${err.message}</div>`;
            }
        });
    }, 100); // Close setTimeout
}

// Toggle card visibility function
// Set default dates
function LRSetDefaultDates(start, end) {
    function toInputDate(str) {
        const [d, m, y] = str.split('/');
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    const startDateInput = document.getElementById('LRStartDate');
    const endDateInput = document.getElementById('LREndDate');
    
    if (startDateInput) startDateInput.value = toInputDate(start);
    if (endDateInput) endDateInput.value = toInputDate(end);
}

// Render column filter checkboxes
function LRRenderColumnFilter() {
    const container = document.getElementById('LRColumnCheckboxes');
    if (!container) {
        console.error('LRColumnCheckboxes element not found');
        return;
    }
    
    // Get unique names for each header row (skip empty)
    const genCompanies = [...new Set(LoadingReceiptGenCompanies.filter(Boolean))];
    const coalCompanies = [...new Set(LoadingReceiptCoalCompanies.filter(Boolean))];
    const plants = [...new Set(LoadingReceiptPlants.filter(Boolean))];

    // Build checkboxes in a vertical sidebar layout
    let checkboxHtml = '';
    
    function addCheckboxes(items, indexMap, labelPrefix, sectionTitle) {
        if (items.length === 0) return;
        
        checkboxHtml += `<div class="mb-3"><h6 class="text-muted mb-2">${sectionTitle}</h6>`;
        
        items.forEach(item => {
            // Find all column indexes that match this item
            const matchingIndexes = [];
            for (let i = 1; i < LoadingReceiptHeaders.length; i++) {
                if (indexMap[i] === item) {
                    matchingIndexes.push(i);
                }
            }
            
            if (matchingIndexes.length > 0) {
                const safeItemId = (labelPrefix + item).replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
                checkboxHtml += `
                    <div class="form-check mb-2">
                        <input class="form-check-input" type="checkbox" value="${matchingIndexes.join(',')}" id="LRCol${safeItemId}" checked>
                        <label class="form-check-label" for="LRCol${safeItemId}">${item}</label>
                    </div>
                `;
            }
        });
        
        checkboxHtml += `</div>`;
    }
    
    addCheckboxes(genCompanies, LoadingReceiptGenCompanies, 'gen', 'Generation Companies');
    addCheckboxes(plants, LoadingReceiptPlants, 'plant', 'Plants');
    addCheckboxes(coalCompanies, LoadingReceiptCoalCompanies, 'coal', 'Coal Companies and Position');

    container.innerHTML = checkboxHtml;

    // Set up event listeners for all checkboxes
    container.querySelectorAll('input[type=checkbox]').forEach(cb => {
        cb.addEventListener('change', LRRenderTable);
    });

    // Set up check/uncheck all handlers for the main buttons
    const checkAllBtn = document.getElementById('LRCheckAll');
    const uncheckAllBtn = document.getElementById('LRUncheckAll');
    
    if (checkAllBtn) {
        checkAllBtn.addEventListener('click', function(e) {
            e.preventDefault();
            container.querySelectorAll('input[type=checkbox]').forEach(cb => { cb.checked = true; });
            LRRenderTable();
        });
    }
    
    if (uncheckAllBtn) {
        uncheckAllBtn.addEventListener('click', function(e) {
            e.preventDefault();
            container.querySelectorAll('input[type=checkbox]').forEach(cb => { cb.checked = false; });
            LRRenderTable();
        });
    }
}

// Render extra filters for specific columns
function LRRenderExtraFilters() {
    const filterCols = [
        { idx: LoadingReceiptHeaders.findIndex(h => h && h.toLowerCase().includes('rakes loaded')), label: 'Rakes Loaded' },
        { idx: LoadingReceiptHeaders.findIndex(h => h && h.toLowerCase().includes('rakes received')), label: 'Rakes Received' },
        { idx: LoadingReceiptHeaders.findIndex(h => h && h.toLowerCase().includes('rakes pipeline')), label: 'Rakes Pipeline' },
        { idx: LoadingReceiptHeaders.findIndex(h => h && h.toLowerCase().includes('coal stock mt')), label: 'Coal Stock MT' },
        { idx: LoadingReceiptHeaders.findIndex(h => h && h.toLowerCase().includes('coal stock days')), label: 'Coal Stock Days' },
        { idx: LoadingReceiptHeaders.findIndex(h => h && h.toLowerCase().includes('units in operation')), label: 'Units in Operation' }
    ];
    const container = document.getElementById('LRExtraFilters');
    if (!container) {
        console.error('LRExtraFilters element not found');
        return;
    }
    
    container.innerHTML = '';
    filterCols.forEach(f => {
        if (f.idx > 0) {
            container.innerHTML += `
                <div>
                    <label class="form-label mb-0">${f.label}</label>
                    <input type="number" class="form-control form-control-sm" id="LRFilter${f.idx}" style="width:100px;">
                </div>
            `;
        }
    });
    filterCols.forEach(f => {
        if (f.idx > 0) {
            const filterElement = document.getElementById(`LRFilter${f.idx}`);
            if (filterElement) {
                filterElement.addEventListener('change', LRRenderTable);
            }
        }
    });
}

// Setup listeners for filters
function LRSetupListeners() {
    const startDate = document.getElementById('LRStartDate');
    const endDate = document.getElementById('LREndDate');
    const consolidateMonth = document.getElementById('LRConsolidateMonth');
    const consolidateFY = document.getElementById('LRConsolidateFY');
    
    if (startDate) startDate.addEventListener('change', LRRenderTable);
    if (endDate) endDate.addEventListener('change', LRRenderTable);
    if (consolidateMonth) consolidateMonth.addEventListener('change', LRRenderTable);
    if (consolidateFY) consolidateFY.addEventListener('change', LRRenderTable);
}

// Main table render logic
function LRRenderTable() {
    console.log("Starting LRRenderTable");
    
    // Check if the table container exists
    const mainTableContainer = document.getElementById('LR-table-container');
    if (!mainTableContainer) {
        console.error('LR-table-container element not found');
        return;
    }
    
    // Get all the checked columns
    const allCheckedCols = [];
    document.querySelectorAll('#LRColumnCheckboxes input[type=checkbox]:checked').forEach(cb => {
        const colIndexes = cb.value.split(',').map(Number);
        allCheckedCols.push(...colIndexes);
    });
    // Remove duplicates and sort
    const checkedCols = [...new Set(allCheckedCols)].sort((a, b) => a - b);
    console.log("Checked columns:", checkedCols.length);
    
    const startDateInput = document.getElementById('LRStartDate');
    const endDateInput = document.getElementById('LREndDate');
    const startDateValue = startDateInput ? startDateInput.value : '';
    const endDateValue = endDateInput ? endDateInput.value : '';
    console.log("Date input values:", startDateValue, endDateValue);
    
    // Convert input dates to dd/mm/yyyy format for comparison
    function toCompareFormat(dateStr) {
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    }
    
    // Process dates in each row to handle Google's Date(yyyy,m,d) format
    let processedData = LoadingReceiptData.map(row => {
        const newRow = [...row];
        
        // If the first column is a date, try to parse it properly
        if (row[0]) {
            console.log("Processing date:", row[0], typeof row[0]);
            
            // Try to parse the date using our robust parser
            if (typeof row[0] === 'string' && row[0].indexOf("Date(") !== -1) {
                try {
                    const match = row[0].match(/Date\((\d{4}),\s*(\d{1,2}),\s*(\d{1,2})\)/);
                    if (match) {
                        const year = parseInt(match[1]);
                        const month = parseInt(match[2]); // Already 0-based in Google format
                        const day = parseInt(match[3]);
                        console.log(`Converting Date(${year},${month},${day}) to JS Date object`);
                        newRow[0] = new Date(year, month, day);
                    }
                } catch (e) {
                    console.error("Error parsing Google date format:", e);
                }
            }
        }
        
        return newRow;
    });
    
    // Filter by date if dates are selected
    let filtered = [...processedData];
    console.log("Data before filtering:", filtered.length, "rows");
    
    // Dump the first few rows for debugging
    if (filtered.length > 0) {
        console.log("First row date after processing:", filtered[0][0], "type:", typeof filtered[0][0]);
        if (filtered.length > 1) {
            console.log("Second row date after processing:", filtered[1][0], "type:", typeof filtered[1][0]);
        }
    }
    
    // Enable date filtering now that we've fixed the date parsing
    let dateFilteringEnabled = true;
    if (startDateValue && endDateValue && dateFilteringEnabled) {
        const startDateFormatted = toCompareFormat(startDateValue);
        const endDateFormatted = toCompareFormat(endDateValue);
        console.log("Date range for filtering:", startDateFormatted, "to", endDateFormatted);
        
        // Parse dates for comparison - set to beginning of day for start date and end of day for end date
        const startDate = new Date(startDateValue);
        startDate.setHours(0, 0, 0, 0); // Set to beginning of the day
        
        const endDate = new Date(endDateValue);
        endDate.setHours(23, 59, 59, 999); // Set to end of the day
        
        console.log("Start date for comparison:", startDate);
        console.log("End date for comparison:", endDate);
        
        filtered = filtered.filter(row => {
            try {
                // Skip rows without date
                if (!row[0]) {
                    console.log("Skipping row with no date");
                    return false;
                }
                
                let rowDate;
                
                // If it's already a Date object
                if (row[0] instanceof Date && !isNaN(row[0].getTime())) {
                    rowDate = row[0];
                    console.log("Row has Date object:", rowDate);
                }
                // If date is in dd/mm/yyyy format
                else if (typeof row[0] === 'string' && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(row[0])) {
                    const [d, m, y] = row[0].split('/').map(Number);
                    rowDate = new Date(y, m - 1, d);
                    console.log("Parsed dd/mm/yyyy date:", rowDate);
                }
                // Try parsing as a generic date
                else {
                    rowDate = new Date(row[0]);
                    if (isNaN(rowDate.getTime())) {
                        console.log("Could not parse date:", row[0]);
                        return true; // Keep rows with unparseable dates for debugging
                    }
                }
                
                const inRange = rowDate >= startDate && rowDate <= endDate;
                console.log("Date comparison result:", inRange, rowDate);
                return inRange;
            } catch (e) {
                console.error("Error filtering date:", row[0], e);
                return true; // Keep all rows on error
            }
        });
        console.log("After date filtering:", filtered.length, "rows");
    } else {
        console.log("Using all data without date filtering:", filtered.length, "rows");
    }
    
    let byMonth = document.getElementById('LRConsolidateMonth');
    let byFY = document.getElementById('LRConsolidateFY');
    byMonth = byMonth ? byMonth.checked : false;
    byFY = byFY ? byFY.checked : false;

    if (byMonth && byFY) byMonth = false;

    // Apply extra filters
    checkedCols.forEach(idx => {
        const filterInput = document.getElementById(`LRFilter${idx}`);
        if (filterInput && filterInput.value !== '') {
            const val = Number(filterInput.value);
            filtered = filtered.filter(row => Number(row[idx]) === val);
        }
    });
    
    console.log("Data after all filtering:", filtered.length, "rows");

    // Consolidation logic
    let groupKeys = [];
    if (byFY) groupKeys.push({ fn: LRGetFinancialYear, idx: 0 });
    else if (byMonth) groupKeys.push({ fn: LRGetMonthYear, idx: 0 });

    if (groupKeys.length > 0) {
        console.log("Grouping data by:", groupKeys.map(k => k.fn ? "Date Function" : "Metadata Array").join(", "));
        let grouped = {};
        filtered.forEach(row => {
            let keyParts = [];
            groupKeys.forEach(gk => {
                if (gk.fn) keyParts.push(gk.fn(row[gk.idx]));
                else if (gk.arr) keyParts.push(gk.arr[row.length === LoadingReceiptHeaders.length ? row.indexOf(row[0]) : 0]);
            });
            const key = keyParts.join(' | ');
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(row);
        });
        console.log("Created", Object.keys(grouped).length, "groups");
        filtered = Object.entries(grouped).map(([key, rows]) => {
            let agg = [];
            agg[0] = key;
            // Sum columns: B to S (1-18), W to Y (22-24), AI to AN (34-40)
            const sumCols = [...Array(18).keys()].map(i => i+1)
                .concat([22,23,24])
                .concat([34,35,36,37,38,39]);
            // Avg columns: T,U,V,Z,AA,AB,AC,AD,AE,AF,AG,AH,AO to BA (20,21,22,26-33,41-52)
            const avgCols = [19,20,21,25,26,27,28,29,30,31,32,33,40,41,42,43,44,45,46,47,48,49,50,51,52];
            for (let i = 1; i < LoadingReceiptHeaders.length; i++) {
                if (sumCols.includes(i)) {
                    agg[i] = rows.reduce((sum, r) => sum + (Number(r[i]) || 0), 0);
                } else if (avgCols.includes(i)) {
                    const nums = rows.map(r => Number(r[i])).filter(n => !isNaN(n));
                    agg[i] = nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2) : '';
                } else {
                    agg[i] = '';
                }
            }
            return agg;
        });
        console.log("After grouping, data has", filtered.length, "rows");
    }

    // Table HTML
    console.log("Building HTML table with", filtered.length, "data rows and", checkedCols.length, "columns");
    
    // Determine first column header title based on consolidation
    let firstColTitle = "Date";
    if (byMonth) firstColTitle = "Month-Year";
    if (byFY) firstColTitle = "FY";
    
    // Add the headers for generation companies, coal companies, and plants
    let html = `<div class="table-responsive" style="max-height: 70vh; overflow: auto;">
        <table class="table table-bordered table-striped align-middle table-loading-receipt mb-0">
        <thead class="table-primary sticky-top">
        <tr>
            <th rowspan="3" class="text-center">${firstColTitle}</th>`;
    checkedCols.forEach(i => {
        if (i !== 0) { // Skip date column
            html += `<th class="text-center">${LoadingReceiptGenCompanies[i] || '&nbsp;'}</th>`;
        }
    });
    html += `</tr>
        <tr>`;
    // Only add first column in first row since it's rowspan=3
    checkedCols.forEach(i => {
        if (i !== 0) { // Skip date column
            html += `<th class="text-center">${LoadingReceiptCoalCompanies[i] || '&nbsp;'}</th>`;
        }
    });
    html += `</tr>
        <tr>`;
    checkedCols.forEach(i => {
        if (i !== 0) { // Skip date column
            html += `<th class="text-center">${LoadingReceiptPlants[i] || '&nbsp;'}</th>`;
        }
    });
    html += `</tr>
        </thead>
        <tbody>`;
    
    // Format the display value for the first column (date)
    function formatFirstColumnDisplay(value) {
        console.log("Formatting first column:", value, typeof value);
        
        // If it's a consolidated group key, just return it
        if (groupKeys.length > 0) return value;
        
        // If it's a Date object
        if (value instanceof Date && !isNaN(value.getTime())) {
            const day = String(value.getDate()).padStart(2, '0');
            const month = String(value.getMonth() + 1).padStart(2, '0');
            const year = value.getFullYear();
            return `${day}/${month}/${year}`;
        }
        
        // Handle "Date(yyyy,mm,dd)" string format
        if (typeof value === 'string' && value.indexOf("Date(") !== -1) {
            try {
                const match = value.match(/Date\((\d{4}),\s*(\d{1,2}),\s*(\d{1,2})\)/);
                if (match) {
                    const year = parseInt(match[1]);
                    const month = parseInt(match[2]); // Already 0-based in Google format
                    const day = parseInt(match[3]);
                    return `${day.toString().padStart(2, '0')}/${(month+1).toString().padStart(2, '0')}/${year}`;
                }
            } catch (e) {
                console.error("Error formatting Date string:", e);
            }
        }
        
        // If it's already in dd/mm/yyyy format, return as is
        if (typeof value === 'string' && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
            return value;
        }
        
        return value;
    }

    if (filtered.length) {
        filtered.forEach(row => {
            html += `<tr><td class="fw-medium">${formatFirstColumnDisplay(row[0])}</td>`;
            checkedCols.forEach(i => {
                if (i !== 0) { // Skip date column
                    html += `<td class="text-end">${row[i] !== undefined && row[i] !== '' ? row[i] : '&nbsp;'}</td>`;
                }
            });
            html += `</tr>`;
        });
        
        // Total row
        let totalRow = [];
        totalRow[0] = '<b>TOTAL</b>';
        checkedCols.forEach(i => {
            if (i === 0) return; // Skip date column
            
            // Sum columns
            const sumCols = [...Array(18).keys()].map(idx => idx+1).concat([22,23,24]).concat([34,35,36,37,38,39]);
            // Avg columns
            const avgCols = [19,20,21,25,26,27,28,29,30,31,32,33,40,41,42,43,44,45,46,47,48,49,50,51,52];
            
            if (sumCols.includes(i)) {
                totalRow[i] = filtered.reduce((sum, row) => {
                    const val = Number(row[i]) || 0;
                    return sum + val;

                }, 0);
            } else if (avgCols.includes(i)) {
                const nums = filtered.map(row => Number(row[i])).filter(n => !isNaN(n));
                totalRow[i] = nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2) : '';
            } else {
                totalRow[i] = '';
            }
        });
        
        html += `<tr class="loading-receipt-total-row"><td>${totalRow[0]}</td>`;
        checkedCols.forEach(i => {
            if (i !== 0) { // Skip date column
                html += `<td class="text-end">${totalRow[i] !== undefined && totalRow[i] !== '' ? totalRow[i] : '&nbsp;'}</td>`;
            }
        });
        html += `</tr>`;
    } else {
        html += `<tr><td colspan="${checkedCols.length}" class="text-center">No data found.</td></tr>`;
    }
    html += `</tbody></table></div>`;

    console.log("Rendering final table to DOM");
    
    const tableContainer = document.getElementById('LR-table-container');
    if (tableContainer) {
        tableContainer.innerHTML = `
            <!-- Table Header Card -->
            <div class="pachhwara-pd-card mb-2">
                <div class="pachhwara-pd-section-header d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <h6 class="mb-0"><i class="bi bi-table"></i> Loading & Receipt Data</h6>
                        <span class="badge bg-light text-dark ms-2">${filtered.length} entries</span>
                    </div>
                    <button class="btn btn-outline-primary btn-sm" id="LRRefreshBtn">
                        <i class="bi bi-arrow-clockwise"></i> Refresh
                    </button>
                </div>
            </div>
            
            <!-- Table Data Card -->
            <div class="pachhwara-pd-card">
                <div class="pachhwara-pd-card-body p-0" id="LR-table">${html}</div>
            </div>
        `;
        console.log("Table rendering complete");
        
        // Setup refresh button
        const refreshBtn = document.getElementById('LRRefreshBtn');
        if (refreshBtn) {
            refreshBtn.onclick = () => {
                console.log("Refresh button clicked");
                fetchLoadingReceiptData().then(LRRenderTable).catch(err => {
                    console.error("Error in refresh:", err);
                });
            };
        }
    } else {
        console.error('LR-table-container element not found when trying to render table');
    }
}

// Format date for display
function LRFormatDate(str) {
    if (!str) return '';
    
    console.log("Formatting date for display:", str, typeof str);
    
    // If it's a Date object
    if (str instanceof Date && !isNaN(str.getTime())) {
        const day = String(str.getDate()).padStart(2, '0');
        const month = String(str.getMonth() + 1).padStart(2, '0');
        const year = str.getFullYear();
        return `${day}/${month}/${year}`;
    }
    
    // Handle "Date(yyyy,mm,dd)" string format
    if (typeof str === 'string' && str.indexOf("Date(") !== -1) {
        try {
            const match = str.match(/Date\((\d{4}),\s*(\d{1,2}),\s*(\d{1,2})\)/);
            if (match) {
                const year = parseInt(match[1]);
                const month = parseInt(match[2]); // Already 0-based in Google format
                const day = parseInt(match[3]);
                return `${day.toString().padStart(2, '0')}/${(month+1).toString().padStart(2, '0')}/${year}`;
            }
        } catch (e) {
            console.error("Error formatting Date string:", e);
        }
    }
    
    // If it's already in dd/mm/yyyy format, return as is
    if (typeof str === 'string' && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
        return str;
    }
    
    return str;
}

// Export Functions

// Helper function to get current table data for export
function LRGetExportData() {
    // Get all the checked columns
    const allCheckedCols = [];
    document.querySelectorAll('#LRColumnCheckboxes input[type=checkbox]:checked').forEach(cb => {
        const colIndexes = cb.value.split(',').map(Number);
        allCheckedCols.push(...colIndexes);
    });
    const checkedCols = [...new Set(allCheckedCols)].sort((a, b) => a - b);
    
    // Get date filtering settings
    const startDateInput = document.getElementById('LRStartDate');
    const endDateInput = document.getElementById('LREndDate');
    const startDateValue = startDateInput ? startDateInput.value : '';
    const endDateValue = endDateInput ? endDateInput.value : '';
    
    // Process data similar to LRRenderTable
    let processedData = LoadingReceiptData.map(row => {
        const newRow = [...row];
        if (row[0] && typeof row[0] === 'string' && row[0].indexOf("Date(") !== -1) {
            try {
                const match = row[0].match(/Date\((\d{4}),\s*(\d{1,2}),\s*(\d{1,2})\)/);
                if (match) {
                    const year = parseInt(match[1]);
                    const month = parseInt(match[2]);
                    const day = parseInt(match[3]);
                    newRow[0] = new Date(year, month, day);
                }
            } catch (e) {
                console.error("Error parsing date for export:", e);
            }
        }
        return newRow;
    });
    
    // Apply date filtering
    let filtered = [...processedData];
    if (startDateValue && endDateValue) {
        const startDate = new Date(startDateValue);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(endDateValue);
        endDate.setHours(23, 59, 59, 999);
        
        filtered = filtered.filter(row => {
            if (!row[0]) return false;
            let rowDate;
            if (row[0] instanceof Date && !isNaN(row[0].getTime())) {
                rowDate = row[0];
            } else if (typeof row[0] === 'string' && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(row[0])) {
                const [d, m, y] = row[0].split('/').map(Number);
                rowDate = new Date(y, m - 1, d);
            } else {
                rowDate = new Date(row[0]);
                if (isNaN(rowDate.getTime())) return true;
            }
            return rowDate >= startDate && rowDate <= endDate;
        });
    }
    
    // Apply consolidation
    const byMonth = document.getElementById('LRConsolidateMonth')?.checked || false;
    const byFY = document.getElementById('LRConsolidateFY')?.checked || false;
    
    if (byMonth || byFY) {
        let grouped = {};
        filtered.forEach(row => {
            let key;
            if (byFY) {
                key = LRGetFinancialYear(row[0]);
            } else if (byMonth) {
                key = LRGetMonthYear(row[0]);
            }
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(row);
        });
        
        filtered = Object.entries(grouped).map(([key, rows]) => {
            let agg = [];
            agg[0] = key;
            const sumCols = [...Array(18).keys()].map(i => i+1).concat([22,23,24]).concat([34,35,36,37,38,39]);
            const avgCols = [19,20,21,25,26,27,28,29,30,31,32,33,40,41,42,43,44,45,46,47,48,49,50,51,52];
            
            for (let i = 1; i < LoadingReceiptHeaders.length; i++) {
                if (sumCols.includes(i)) {
                    agg[i] = rows.reduce((sum, r) => sum + (Number(r[i]) || 0), 0);
                } else if (avgCols.includes(i)) {
                    const nums = rows.map(r => Number(r[i])).filter(n => !isNaN(n));
                    agg[i] = nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2) : '';
                } else {
                    agg[i] = '';
                }
            }
            return agg;
        });
    }
    
    // Format first column for display
    function formatFirstColumnDisplay(value) {
        if (byMonth || byFY) return value;
        if (value instanceof Date && !isNaN(value.getTime())) {
            const day = String(value.getDate()).padStart(2, '0');
            const month = String(value.getMonth() + 1).padStart(2, '0');
            const year = value.getFullYear();
            return `${day}/${month}/${year}`;
        }
        if (typeof value === 'string' && value.indexOf("Date(") !== -1) {
            try {
                const match = value.match(/Date\((\d{4}),\s*(\d{1,2}),\s*(\d{1,2})\)/);
                if (match) {
                    const year = parseInt(match[1]);
                    const month = parseInt(match[2]);
                    const day = parseInt(match[3]);
                    return `${day.toString().padStart(2, '0')}/${(month+1).toString().padStart(2, '0')}/${year}`;
                }
            } catch (e) {
                console.error("Error formatting date:", e);
            }
        }
        return value;
    }
    
    // Calculate totals
    let totalRow = ['TOTAL'];
    const sumCols = [...Array(18).keys()].map(i => i+1).concat([22,23,24]).concat([34,35,36,37,38,39]);
    const avgCols = [19,20,21,25,26,27,28,29,30,31,32,33,40,41,42,43,44,45,46,47,48,49,50,51,52];
    
    checkedCols.forEach(i => {
        if (i === 0) return;
        if (sumCols.includes(i)) {
            totalRow[i] = filtered.reduce((sum, row) => sum + (Number(row[i]) || 0), 0);
        } else if (avgCols.includes(i)) {
            const nums = filtered.map(row => Number(row[i])).filter(n => !isNaN(n));
            totalRow[i] = nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2) : '';
        } else {
            totalRow[i] = '';
        }
    });
    
    return {
        checkedCols,
        filtered: filtered.map(row => {
            const newRow = [...row];
            newRow[0] = formatFirstColumnDisplay(row[0]);
            return newRow;
        }),
        totalRow,
        headers: {
            genCompanies: LoadingReceiptGenCompanies,
            coalCompanies: LoadingReceiptCoalCompanies,
            plants: LoadingReceiptPlants
        },
        title: byFY ? 'FY' : byMonth ? 'Month-Year' : 'Date'
    };
}

// PDF Export Function
async function LRExportToPDF() {
    try {
        // Check if jsPDF is available
        if (typeof window.jsPDF === 'undefined') {
            // Load jsPDF dynamically
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js');
        }
        
        const data = LRGetExportData();
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'mm', 'a4'); // Landscape A4
        
        // Add title
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('Loading & Receipt Report', 20, 20);
        
        // Add date range if applicable
        const startDate = document.getElementById('LRStartDate')?.value;
        const endDate = document.getElementById('LREndDate')?.value;
        if (startDate && endDate) {
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            doc.text(`Date Range: ${startDate} to ${endDate}`, 20, 30);
        }
        
        // Prepare table data
        const headers = [];
        const headerRow1 = [data.title];
        const headerRow2 = [''];
        const headerRow3 = [''];
        
        data.checkedCols.forEach(i => {
            if (i !== 0) {
                headerRow1.push(data.headers.genCompanies[i] || '');
                headerRow2.push(data.headers.coalCompanies[i] || '');
                headerRow3.push(data.headers.plants[i] || '');
            }
        });
        
        headers.push(headerRow1, headerRow2, headerRow3);
        
        // Prepare body data
        const body = [];
        data.filtered.forEach(row => {
            const rowData = [row[0]];
            data.checkedCols.forEach(i => {
                if (i !== 0) {
                    rowData.push(row[i] !== undefined && row[i] !== '' ? row[i] : '');
                }
            });
            body.push(rowData);
        });
        
        // Add total row
        const totalRowData = [data.totalRow[0]];
        data.checkedCols.forEach(i => {
            if (i !== 0) {
                totalRowData.push(data.totalRow[i] !== undefined && data.totalRow[i] !== '' ? data.totalRow[i] : '');
            }
        });
        body.push(totalRowData);
        
        // Generate table
        doc.autoTable({
            head: headers,
            body: body,
            startY: startDate && endDate ? 40 : 30,
            styles: {
                fontSize: 8,
                cellPadding: 2,
                overflow: 'linebreak',
                halign: 'center'
            },
            headStyles: {
                fillColor: [44, 106, 79], // Green theme
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 7
            },
            bodyStyles: {
                fontSize: 7
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            columnStyles: {
                0: { halign: 'left', fontStyle: 'bold' }
            },
            didParseCell: function(data) {
                // Style total row
                if (data.row.index === body.length - 1) {
                    data.cell.styles.fillColor = [183, 228, 199]; // Light green
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        });
        
        // Save the PDF
        const fileName = `Loading_Receipt_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please check if all required libraries are loaded.');
    }
}

// JPG Export Function
async function LRExportToJPG(orientation = 'landscape') {
    try {
        // Check if html2canvas is available
        if (typeof html2canvas === 'undefined') {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        }
        
        const data = LRGetExportData();
        
        // Set dimensions based on orientation
        let containerWidth, containerHeight, fontSize, titleSize, padding;
        
        if (orientation === 'portrait') {
            containerWidth = 1754;  // A4 portrait width at high resolution (210mm * 8.36)
            containerHeight = 2480; // A4 portrait height at high resolution (297mm * 8.36)
            fontSize = 10;
            titleSize = 24;
            padding = 30;
        } else {
            containerWidth = 2480;  // A4 landscape width
            containerHeight = 1754; // A4 landscape height
            fontSize = 14;
            titleSize = 28;
            padding = 40;
        }
        
        // Create a temporary div for high-quality export
        const exportDiv = document.createElement('div');
        exportDiv.style.cssText = `
            position: absolute;
            top: -10000px;
            left: -10000px;
            width: ${containerWidth}px;
            background: white;
            padding: ${padding}px;
            font-family: Arial, sans-serif;
            box-sizing: border-box;
        `;
        
        // Build HTML content
        let html = `
            <div style="margin-bottom: ${padding * 0.75}px;">
                <h2 style="color: #2d6a4f; margin: 0 0 15px 0; font-size: ${titleSize}px;">Loading & Receipt Report</h2>
        `;
        
        const startDate = document.getElementById('LRStartDate')?.value;
        const endDate = document.getElementById('LREndDate')?.value;
        if (startDate && endDate) {
            html += `<p style="margin: 0; font-size: ${fontSize + 4}px; color: #666;">Date Range: ${startDate} to ${endDate}</p>`;
        }
        
        html += `</div>`;
        
        // Create table with responsive font size
        html += `
            <table style="width: 100%; border-collapse: collapse; font-size: ${fontSize}px;">
                <thead>
                    <tr style="background-color: #2d6a4f; color: white;">
                        <th rowspan="3" style="border: 1px solid #ddd; padding: ${Math.max(8, fontSize * 0.8)}px; text-align: center; font-weight: bold;">${data.title}</th>
        `;
        
        data.checkedCols.forEach(i => {
            if (i !== 0) {
                html += `<th style="border: 1px solid #ddd; padding: ${Math.max(8, fontSize * 0.8)}px; text-align: center; font-weight: bold; word-wrap: break-word;">${data.headers.genCompanies[i] || ''}</th>`;
            }
        });
        
        html += `</tr><tr style="background-color: #2d6a4f; color: white;">`;
        data.checkedCols.forEach(i => {
            if (i !== 0) {
                html += `<th style="border: 1px solid #ddd; padding: ${Math.max(8, fontSize * 0.8)}px; text-align: center; font-weight: bold; word-wrap: break-word;">${data.headers.coalCompanies[i] || ''}</th>`;
            }
        });
        
        html += `</tr><tr style="background-color: #2d6a4f; color: white;">`;
        data.checkedCols.forEach(i => {
            if (i !== 0) {
                html += `<th style="border: 1px solid #ddd; padding: ${Math.max(8, fontSize * 0.8)}px; text-align: center; font-weight: bold; word-wrap: break-word;">${data.headers.plants[i] || ''}</th>`;
            }
        });
        
        html += `</tr></thead><tbody>`;
        
        // Add data rows
        data.filtered.forEach((row, index) => {
            const bgColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
            html += `<tr style="background-color: ${bgColor};">`;
            html += `<td style="border: 1px solid #ddd; padding: ${Math.max(6, fontSize * 0.6)}px; font-weight: bold;">${row[0]}</td>`;
            data.checkedCols.forEach(i => {
                if (i !== 0) {
                    html += `<td style="border: 1px solid #ddd; padding: ${Math.max(6, fontSize * 0.6)}px; text-align: right;">${row[i] !== undefined && row[i] !== '' ? row[i] : ''}</td>`;
                }
            });
            html += `</tr>`;
        });
        
        // Add total row
        html += `<tr style="background-color: #b7e4c7; font-weight: bold;">`;
        html += `<td style="border: 1px solid #ddd; padding: ${Math.max(8, fontSize * 0.8)}px; font-weight: bold;">${data.totalRow[0]}</td>`;
        data.checkedCols.forEach(i => {
            if (i !== 0) {
                html += `<td style="border: 1px solid #ddd; padding: ${Math.max(8, fontSize * 0.8)}px; text-align: right; font-weight: bold;">${data.totalRow[i] !== undefined && data.totalRow[i] !== '' ? data.totalRow[i] : ''}</td>`;
            }
        });
        html += `</tr></tbody></table>`;
        
        exportDiv.innerHTML = html;
        document.body.appendChild(exportDiv);
        
        // Calculate actual height needed
        const actualHeight = Math.max(containerHeight, exportDiv.scrollHeight + (padding * 2));
        
        // Capture with high quality settings
        const canvas = await html2canvas(exportDiv, {
            scale: 2,
            useCORS: true,
            backgroundColor: 'white',
            width: containerWidth,
            height: actualHeight,
            scrollX: 0,
            scrollY: 0
        });
        
        // Clean up
        document.body.removeChild(exportDiv);
        
        // Convert to high-quality JPG
        const link = document.createElement('a');
        const orientationSuffix = orientation === 'portrait' ? '_Portrait' : '_Landscape';
        link.download = `Loading_Receipt_Report${orientationSuffix}_${new Date().toISOString().split('T')[0]}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    } catch (error) {
        console.error('Error generating JPG:', error);
        alert('Error generating JPG. Please check if html2canvas library is loaded.');
    }
}

// Excel Export Function
async function LRExportToExcel() {
    try {
        // Check if SheetJS is available
        if (typeof XLSX === 'undefined') {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
        }
        
        const data = LRGetExportData();
        
        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        
        // Prepare data for Excel
        const excelData = [];
        
        // Add title row
        excelData.push(['Loading & Receipt Report']);
        excelData.push([]); // Empty row
        
        // Add date range if applicable
        const startDate = document.getElementById('LRStartDate')?.value;
        const endDate = document.getElementById('LREndDate')?.value;
        if (startDate && endDate) {
            excelData.push([`Date Range: ${startDate} to ${endDate}`]);
            excelData.push([]); // Empty row
        }
        
        // Add headers (3 rows)
        const headerRow1 = [data.title];
        const headerRow2 = [''];
        const headerRow3 = [''];
        
        data.checkedCols.forEach(i => {
            if (i !== 0) {
                headerRow1.push(data.headers.genCompanies[i] || '');
                headerRow2.push(data.headers.coalCompanies[i] || '');
                headerRow3.push(data.headers.plants[i] || '');
            }
        });
        
        excelData.push(headerRow1, headerRow2, headerRow3);
        
        // Add data rows
        data.filtered.forEach(row => {
            const rowData = [row[0]];
            data.checkedCols.forEach(i => {
                if (i !== 0) {
                    const value = row[i] !== undefined && row[i] !== '' ? row[i] : '';
                    // Convert numeric strings to numbers for Excel
                    const numValue = Number(value);
                    rowData.push(isNaN(numValue) ? value : numValue);
                }
            });
            excelData.push(rowData);
        });
        
        // Add total row
        const totalRowData = [data.totalRow[0]];
        data.checkedCols.forEach(i => {
            if (i !== 0) {
                const value = data.totalRow[i] !== undefined && data.totalRow[i] !== '' ? data.totalRow[i] : '';
                const numValue = Number(value);
                totalRowData.push(isNaN(numValue) ? value : numValue);
            }
        });
        excelData.push(totalRowData);
        
        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        
        // Set column widths
        const colWidths = [];
        colWidths.push({ wch: 15 }); // Date column
        data.checkedCols.forEach(i => {
            if (i !== 0) {
                colWidths.push({ wch: 12 });
            }
        });
        ws['!cols'] = colWidths;
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Loading Receipt Report');
        
        // Save the file
        const fileName = `Loading_Receipt_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
        
    } catch (error) {
        console.error('Error generating Excel:', error);
        alert('Error generating Excel file. Please check if XLSX library is loaded.');
    }
}

// Utility function to load scripts dynamically
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Sidebar setup functions
function LRSetupSidebars() {
    // Filter sidebar toggle
    const filterToggleBtn = document.getElementById('LRFilterToggle');
    const filterSidebar = document.getElementById('LRFilterSidebar');
    const filterCloseBtn = document.getElementById('LRCloseSidebar');

    if (filterToggleBtn && filterSidebar) {
        filterToggleBtn.addEventListener('click', () => {
            filterSidebar.classList.add('open');
        });

        if (filterCloseBtn) {
            filterCloseBtn.addEventListener('click', () => {
                filterSidebar.classList.remove('open');
            });
        }

        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            if (!filterSidebar.contains(e.target) && !filterToggleBtn.contains(e.target)) {
                filterSidebar.classList.remove('open');
            }
        });
    }

    // Export sidebar toggle
    const exportToggleBtn = document.getElementById('LRExportToggle');
    const exportSidebar = document.getElementById('LRExportSidebar');

    if (exportToggleBtn && exportSidebar) {
        exportToggleBtn.addEventListener('click', () => {
            exportSidebar.classList.toggle('open');
        });

        // Close export sidebar when clicking outside
        document.addEventListener('click', (e) => {
            if (!exportSidebar.contains(e.target) && !exportToggleBtn.contains(e.target)) {
                exportSidebar.classList.remove('open');
            }
        });
    }
}

function LRSetupExportFunctionality() {
    // PDF Export  
    const pdfBtn = document.getElementById('LRExportPDFBtn');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', () => {
            try {
                LRExportToPDF();
            } catch (error) {
                console.error("PDF export error:", error);
                alert(`Error generating PDF: ${error.message}`);
            }
        });
    }
    
    // Excel Export
    const excelBtn = document.getElementById('LRExportExcelBtn');
    if (excelBtn) {
        excelBtn.addEventListener('click', () => {
            try {
                LRExportToExcel();
            } catch (error) {
                console.error("Excel export error:", error);
                alert(`Error generating Excel: ${error.message}`);
            }
        });
    }
    
    // JPG Export
    const jpgBtn = document.getElementById('LRExportImageBtn');
    if (jpgBtn) {
        jpgBtn.addEventListener('click', () => {
            try {
                LRExportToJPG('landscape');
            } catch (error) {
                console.error("JPG export error:", error);
                alert(`Error generating JPG: ${error.message}`);
            }
        });
    }
    
    // Print Report
    const printBtn = document.getElementById('LRPrintReportBtn');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            try {
                window.print();
            } catch (error) {
                console.error("Print error:", error);
                alert(`Error printing: ${error.message}`);
            }
        });
    }
}

// Helper functions for loading states
function LRShowLoadingState(buttonId, loadingText) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.dataset.originalContent = button.innerHTML;
        button.innerHTML = `<i class="bi bi-hourglass-split"></i><span>Loading...</span>`;
        button.disabled = true;
    }
}

function LRHideLoadingState(buttonId, originalContent) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.innerHTML = button.dataset.originalContent || originalContent;
        button.disabled = false;
        delete button.dataset.originalContent;
    }
}
