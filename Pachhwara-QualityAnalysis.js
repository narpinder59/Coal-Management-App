let PachhwaraQAData = [];
let PachhwaraQAHeaders = [];

// Plant configurations
const PLANTS = {
    'GGSSTP': 'Pachhwara-GGSSTPanalysis',
    'GHTP': 'Pachhwara-GHTPanalysis',
    'GATP': 'Pachhwara-GATPanalysis'
};

// Fetch headers from Google Sheets
async function fetchPachhwaraQAHeaders(plantName) {
    const SHEET_ID = '1cFngrabiTY-RMGDrw2eRn7Nn8LEY0IZyD0-QJT7UqTI';
    const SHEET_NAME = PLANTS[plantName];
    const RANGE = 'A1:Z1'; // Expanded range to capture all headers
    const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&range=${RANGE}`;

    const res = await fetch(SHEET_URL);
    const text = await res.text();
    const json = JSON.parse(text.substr(47).slice(0, -2));
    const table = json.table;
    PachhwaraQAHeaders = table.rows[0].c.map(cell => cell ? cell.v : "");
    console.log(`Loaded ${plantName} Headers:`, PachhwaraQAHeaders);
}

// Function to find the last row with complete data (no empty cells)
function findLastCompleteRow(data) {
    if (!data || data.length === 0) return null;
    
    // Start from the last row and work backwards
    for (let i = data.length - 1; i >= 0; i--) {
        const row = data[i];
        let hasCompleteData = true;
        
        // Check if all cells in the row have data (not empty/null/undefined)
        for (let j = 0; j < row.length; j++) {
            if (!row[j] || row[j] === '' || row[j] === null || row[j] === undefined) {
                hasCompleteData = false;
                break;
            }
        }
        
        if (hasCompleteData) {
            console.log(`Found last complete row at index ${i + 1}:`, row);
            return row;
        }
    }
    
    console.log('No complete row found');
    return null;
}

// Fetch data from Google Sheets
async function fetchPachhwaraQAData(plantName) {
    const SHEET_ID = '1cFngrabiTY-RMGDrw2eRn7Nn8LEY0IZyD0-QJT7UqTI';
    const SHEET_NAME = PLANTS[plantName];
    const RANGE = 'A2:Z3000'; // Start from row 2 to skip headers
    const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&range=${RANGE}`;

    const res = await fetch(SHEET_URL);
    const text = await res.text();
    const json = JSON.parse(text.substr(47).slice(0, -2));
    const table = json.table;
    PachhwaraQAData = table.rows
        .filter(row => row.c && row.c[0] && row.c[0].v)
        .map(row => row.c.map(cell => cell ? cell.v : ""));
    console.log(`Loaded ${plantName} Data:`, PachhwaraQAData);
}

function showPachhwaraQualityAnalysisReport() {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Set default start date to current financial year's first date (01.04.2025)
    // Financial year starts from April 1st
    const currentMonth = today.getMonth(); // 0-based month (0=Jan, 3=Apr)
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1; // If current month is Apr or later, FY starts this year
    const startDate = `01/04/${fyStartYear}`;
    
    // Set default end date to yesterday (will be updated after data is loaded)
    const yesterday = new Date(today.getTime() - 86400000);
    let endDate = `${String(yesterday.getDate()).padStart(2, '0')}/${String(yesterday.getMonth() + 1).padStart(2, '0')}/${yesterday.getFullYear()}`;

    console.log('Default date range:', startDate, 'to', endDate);

    document.getElementById('main-content').innerHTML = `
        <!-- Header Card -->
        <div class="pachhwara-pd-card mb-3">
            <div class="pachhwara-pd-section-header">
                <h4 class="mb-0"><i class="bi bi-clipboard-data"></i> Pachhwara Coal Quantity & Quality Analysis</h4>
            </div>
        </div>

        <!-- Table Card -->
        <div class="pachhwara-pd-card mb-3">
            <div class="pachhwara-pd-section-header d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-2">
                    <h6 class="mb-0"><i class="bi bi-table"></i> Data Table</h6>
                    <span class="badge bg-secondary" id="pachhwaraQAEntriesCount">0 entries</span>
                </div>
                <button class="btn btn-outline-success btn-sm" id="pachhwaraQARefreshBtnTable">
                    <i class="bi bi-arrow-clockwise"></i> Refresh Data
                </button>
            </div>
        </div>

        <!-- Table Container (Outside Card) -->
        <div id="pachhwaraQA-table-container" class="mb-3"></div>

        <!-- Export Toggle Button -->
        <button class="btn btn-success export-toggle-btn" id="pachhwaraQAExportToggle">
            <i class="bi bi-box-arrow-up"></i>
        </button>

        <!-- Export Sidebar -->
        <div class="export-sidebar" id="pachhwaraQAExportSidebar">
            <button class="btn export-btn pdf-btn" id="pachhwaraQAExportPDF" title="Export to PDF">
                <i class="bi bi-file-earmark-pdf"></i>
            </button>
            <button class="btn export-btn jpg-btn" id="pachhwaraQAExportJPG" title="Export to JPG">
                <i class="bi bi-file-earmark-image"></i>
            </button>
            <button class="btn export-btn excel-btn" id="pachhwaraQAExportExcel" title="Export to Excel">
                <i class="bi bi-file-earmark-excel"></i>
            </button>
            <button class="btn export-btn print-btn" id="pachhwaraQAPrint" title="Print">
                <i class="bi bi-printer"></i>
            </button>
        </div>

        <!-- Filter Toggle Button -->
        <button class="btn btn-primary filter-toggle-btn" id="pachhwaraQAFilterToggle">
            <i class="bi bi-funnel"></i>
        </button>

        <!-- Filter Sidebar -->
        <div class="filter-sidebar" id="pachhwaraQAFilterSidebar">
            <button class="close-btn" id="pachhwaraQACloseSidebar">&times;</button>
            <h5><i class="bi bi-funnel"></i> Filters & Settings</h5>
            <hr>
            
            <!-- Plant Selection -->
            <div class="mb-3">
                <label class="form-label"><strong>Plant Selection</strong></label>
                <div class="d-flex flex-column gap-2">
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="pachhwaraQAPlant" value="GGSSTP" id="pachhwaraQAGGSSTP" checked>
                        <label class="form-check-label" for="pachhwaraQAGGSSTP">GGSSTP</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="pachhwaraQAPlant" value="GHTP" id="pachhwaraQAGHTP">
                        <label class="form-check-label" for="pachhwaraQAGHTP">GHTP</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="pachhwaraQAPlant" value="GATP" id="pachhwaraQAGATP">
                        <label class="form-check-label" for="pachhwaraQAGATP">GATP</label>
                    </div>
                </div>
            </div>
            <hr>

            <!-- Date Range -->
            <div class="mb-3">
                <label class="form-label"><strong>Date Range</strong></label>
                <div class="mb-2">
                    <label class="form-label small">Start Date</label>
                    <input type="date" id="pachhwaraQAStartDate" class="form-control form-control-sm">
                </div>
                <div class="mb-2">
                    <label class="form-label small">End Date</label>
                    <input type="date" id="pachhwaraQAEndDate" class="form-control form-control-sm">
                </div>
            </div>
            <hr>

            <!-- Consolidation Options -->
            <div class="mb-3">
                <label class="form-label"><strong>Consolidation Options</strong></label>
                <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" id="pachhwaraQAConsolidateMonth">
                    <label class="form-check-label" for="pachhwaraQAConsolidateMonth">
                        Consolidate by Month
                        <small class="d-block text-muted">Group data monthly</small>
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="pachhwaraQAConsolidateFY">
                    <label class="form-check-label" for="pachhwaraQAConsolidateFY">
                        Consolidate by Financial Year
                        <small class="d-block text-muted">Group data by FY</small>
                    </label>
                </div>
            </div>
            <hr>

            <!-- Filter by Value -->
            <div class="mb-3">
                <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" id="pachhwaraQAConsolidateValue">
                    <label class="form-check-label" for="pachhwaraQAConsolidateValue">
                        <strong>Filter by Value</strong>
                        <small class="d-block text-muted">Apply numeric filters</small>
                    </label>
                </div>
                <div id="pachhwaraQAValueControls" class="mt-2" style="display:none;">
                    <div class="mb-2">
                        <label class="form-label small" for="pachhwaraQAValueColumn">Column</label>
                        <select id="pachhwaraQAValueColumn" class="form-select form-select-sm"></select>
                    </div>
                    <div class="mb-2">
                        <label class="form-label small" for="pachhwaraQAValueOperator">Operator</label>
                        <select id="pachhwaraQAValueOperator" class="form-select form-select-sm">
                            <option value="lt">&lt;</option>
                            <option value="lte">&le;</option>
                            <option value="eq">=</option>
                            <option value="gte">&ge;</option>
                            <option value="gt">&gt;</option>
                            <option value="between">Between</option>
                        </select>
                    </div>
                    <div id="pachhwaraQAValueInputContainer" class="mb-2">
                        <label class="form-label small" for="pachhwaraQAValueInput">Value</label>
                        <input type="number" id="pachhwaraQAValueInput" class="form-control form-control-sm">
                    </div>
                    <div class="d-none" id="pachhwaraQAValueBetweenContainer">
                        <div class="row g-2">
                            <div class="col-6">
                                <label class="form-label small">From</label>
                                <input type="number" id="pachhwaraQAValueBetweenFrom" class="form-control form-control-sm">
                            </div>
                            <div class="col-6">
                                <label class="form-label small">To</label>
                                <input type="number" id="pachhwaraQAValueBetweenTo" class="form-control form-control-sm">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <hr>

            <!-- Show Columns -->
            <div class="mb-3">
                <label class="form-label"><strong>Show Columns</strong></label>
                <div class="d-flex gap-2 mb-2">
                    <button type="button" class="btn btn-outline-success btn-sm flex-fill" id="pachhwaraQACheckAll">
                        <i class="bi bi-check-all"></i> All
                    </button>
                    <button type="button" class="btn btn-outline-danger btn-sm flex-fill" id="pachhwaraQAUncheckAll">
                        <i class="bi bi-x-circle"></i> None
                    </button>
                </div>
                <div id="pachhwaraQAColumnCheckboxes" class="max-height-200 overflow-auto">
                    <!-- Column checkboxes will be populated here -->
                </div>
            </div>
            <hr>

            <button class="btn btn-primary w-100" id="pachhwaraQAApplyFilters">
                <i class="bi bi-check-circle"></i> Apply Filters
            </button>
        </div>
    `;

    // Set default dates
    pachhwaraQASetDefaultDates(startDate, endDate);
    
    // Load default plant (GGSSTP) data
    loadPachhwaraQAPlantData('GGSSTP');
    
    // Setup plant selection listeners
    document.querySelectorAll('input[name="pachhwaraQAPlant"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                loadPachhwaraQAPlantData(this.value);
            }
        });
    });
    
    // Setup refresh button in table card header
    const refreshBtnTable = document.getElementById('pachhwaraQARefreshBtnTable');
    if (refreshBtnTable) {
        refreshBtnTable.addEventListener('click', function() {
            // Get the currently selected plant
            const selectedPlant = document.querySelector('input[name="pachhwaraQAPlant"]:checked').value;
            // Only fetch data, do not reset filters or checkboxes
            fetchPachhwaraQAData(selectedPlant).then(() => {
                pachhwaraQARenderTable();
            });
        });
    }
    
    // Setup sidebar controls
    pachhwaraQASetupSidebar();
    pachhwaraQASetupExportSidebar();
}

// Setup export sidebar controls
function pachhwaraQASetupExportSidebar() {
    const exportToggle = document.getElementById('pachhwaraQAExportToggle');
    const exportSidebar = document.getElementById('pachhwaraQAExportSidebar');
    const printBtn = document.getElementById('pachhwaraQAPrint');
    const pdfBtn = document.getElementById('pachhwaraQAExportPDF');
    const jpgBtn = document.getElementById('pachhwaraQAExportJPG');
    const excelBtn = document.getElementById('pachhwaraQAExportExcel');

    // Toggle export sidebar
    exportToggle.addEventListener('click', () => {
        exportSidebar.classList.toggle('open');
    });

    // Setup export button event listeners
    if (pdfBtn) {
        pdfBtn.addEventListener('click', () => {
            pachhwaraQAExportToPDF();
            setTimeout(() => exportSidebar.classList.remove('open'), 500);
        });
    }

    if (jpgBtn) {
        jpgBtn.addEventListener('click', () => {
            pachhwaraQAExportToJPG();
            setTimeout(() => exportSidebar.classList.remove('open'), 500);
        });
    }

    if (excelBtn) {
        excelBtn.addEventListener('click', () => {
            pachhwaraQAExportToExcel();
            setTimeout(() => exportSidebar.classList.remove('open'), 500);
        });
    }

    // Setup print button
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
            exportSidebar.classList.remove('open');
        });
    }

    // Close export sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (!exportSidebar.contains(e.target) && 
            !exportToggle.contains(e.target) && 
            exportSidebar.classList.contains('open')) {
            exportSidebar.classList.remove('open');
        }
    });
}

// Setup sidebar controls
function pachhwaraQASetupSidebar() {
    const filterToggle = document.getElementById('pachhwaraQAFilterToggle');
    const closeSidebar = document.getElementById('pachhwaraQACloseSidebar');
    const sidebar = document.getElementById('pachhwaraQAFilterSidebar');
    const applyFilters = document.getElementById('pachhwaraQAApplyFilters');

    // Open sidebar
    filterToggle.addEventListener('click', () => {
        sidebar.classList.add('open');
    });

    // Close sidebar
    closeSidebar.addEventListener('click', () => {
        sidebar.classList.remove('open');
    });

    // Apply filters and close sidebar
    applyFilters.addEventListener('click', () => {
        pachhwaraQARenderTable();
        sidebar.classList.remove('open');
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !filterToggle.contains(e.target) && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });
}

// Toggle card visibility function (removed - no longer needed)
function pachhwaraQAToggleCard(bodyId, chevronId) {
    // This function is no longer used with the sidebar design
}

function loadPachhwaraQAPlantData(plantName) {
    console.log('Loading plant data for:', plantName);
    fetchPachhwaraQAHeaders(plantName).then(() => {
        fetchPachhwaraQAData(plantName).then(() => {
            console.log('Data loaded, setting up components...');
            
            // Find the last complete row and update end date accordingly
            const lastCompleteRow = findLastCompleteRow(PachhwaraQAData);
            if (lastCompleteRow && lastCompleteRow[5]) { // DOP column is at index 5
                const lastDate = pachhwaraQAParseDMY(lastCompleteRow[5]);
                if (lastDate) {
                    const formattedEndDate = `${String(lastDate.getDate()).padStart(2, '0')}/${String(lastDate.getMonth() + 1).padStart(2, '0')}/${lastDate.getFullYear()}`;
                    console.log('Updated end date based on last complete row:', formattedEndDate);
                    
                    // Update the current end date value
                    const currentStartDate = document.getElementById('pachhwaraQAStartDate').value;
                    if (currentStartDate) {
                        const [year, month, day] = currentStartDate.split('-');
                        const startDateFormatted = `${day}/${month}/${year}`;
                        pachhwaraQASetDefaultDates(startDateFormatted, formattedEndDate);
                    }
                }
            }
            
            pachhwaraQARenderColumnFilter();
            pachhwaraQASetupListeners();
            pachhwaraQARenderValueColumnDropdown();
            // Render table after all components are set up
            setTimeout(() => {
                pachhwaraQARenderTable();
            }, 100);
        });
    });
}

function pachhwaraQASetDefaultDates(start, end) {
    // start and end are in dd/mm/yyyy format, convert to yyyy-mm-dd for HTML date input
    function toInputDate(str) {
        const [d, m, y] = str.split('/');
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    
    console.log('Setting default dates:', start, 'to', end);
    document.getElementById('pachhwaraQAStartDate').value = toInputDate(start);
    document.getElementById('pachhwaraQAEndDate').value = toInputDate(end);
    console.log('HTML date inputs set to:', toInputDate(start), 'and', toInputDate(end));
}

function pachhwaraQARenderColumnFilter() {
    console.log('Setting up column filter...');
    const container = document.getElementById('pachhwaraQAColumnCheckboxes');
    if (!container) {
        console.error('Column filter container not found!');
        return;
    }
    
    container.innerHTML = '';
    
    // Show all headers except the first one (Serial No) - start from index 1
    // Initially uncheck columns 1,2,3,4,6 (Plant, Rake No, RR Date, RR No, DOP)
    const uncheckedColumns = [1, 2, 3, 4, 6];
    
    for (let i = 1; i < PachhwaraQAHeaders.length; i++) {
        if (PachhwaraQAHeaders[i] && PachhwaraQAHeaders[i].trim() !== '') {
            const isChecked = !uncheckedColumns.includes(i);
            container.innerHTML += `
                <div class="form-check mb-1">
                    <input class="form-check-input" type="checkbox" value="${i}" id="pachhwaraQACol${i}" ${isChecked ? 'checked' : ''}>
                    <label class="form-check-label" for="pachhwaraQACol${i}">${PachhwaraQAHeaders[i]}</label>
                </div>
            `;
        }
    }
    
    // Add listeners for column filter
    container.querySelectorAll('input[type=checkbox]').forEach(cb => {
        cb.addEventListener('change', pachhwaraQARenderTable);
    });
    
    // Add listeners for Check All / Uncheck All
    document.getElementById('pachhwaraQACheckAll').onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        container.querySelectorAll('input[type=checkbox]').forEach(cb => { cb.checked = true; });
        pachhwaraQARenderTable();
    };
    document.getElementById('pachhwaraQAUncheckAll').onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        container.querySelectorAll('input[type=checkbox]').forEach(cb => { cb.checked = false; });
        pachhwaraQARenderTable();
    };
}

function pachhwaraQASetupListeners() {
    document.getElementById('pachhwaraQAStartDate').addEventListener('change', pachhwaraQARenderTable);
    document.getElementById('pachhwaraQAEndDate').addEventListener('change', pachhwaraQARenderTable);
    document.getElementById('pachhwaraQAConsolidateMonth').addEventListener('change', pachhwaraQARenderTable);
    document.getElementById('pachhwaraQAConsolidateFY').addEventListener('change', pachhwaraQARenderTable);
    document.getElementById('pachhwaraQAConsolidateValue').addEventListener('change', function() {
        document.getElementById('pachhwaraQAValueControls').style.display = this.checked ? '' : 'none';
        pachhwaraQARenderTable();
    });
    ['pachhwaraQAValueColumn', 'pachhwaraQAValueOperator', 'pachhwaraQAValueInput', 'pachhwaraQAValueBetweenFrom', 'pachhwaraQAValueBetweenTo'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', pachhwaraQARenderTable);
    });
    // Show/hide value input(s) based on operator
    document.getElementById('pachhwaraQAValueOperator').addEventListener('change', function() {
        const op = this.value;
        const inputContainer = document.getElementById('pachhwaraQAValueInputContainer');
        const betweenContainer = document.getElementById('pachhwaraQAValueBetweenContainer');
        if (op === 'between') {
            inputContainer.classList.add('d-none');
            betweenContainer.classList.remove('d-none');
        } else {
            inputContainer.classList.remove('d-none');
            betweenContainer.classList.add('d-none');
        }
    });
}

// Enhanced date parsing function with more debugging
function pachhwaraQAParseDMY(str) {
    console.log('Parsing date:', str, 'Type:', typeof str);
    
    // Handle Google Sheets Date(YYYY,M,D) format
    if (typeof str === "string" && str.startsWith("Date(")) {
        const parts = str.match(/\d+/g);
        if (parts && parts.length >= 3) {
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]); // This is already 0-based (0=Jan, 1=Feb, etc.)
            const day = parseInt(parts[2]);
            const result = new Date(year, month, day);
            console.log('✅ Parsed Date() format:', result, 'Year:', year, 'Month:', month, 'Day:', day);
            return result;
        }
    }
    
    // Handle dd-mm-yyyy format
    if (typeof str === "string" && str.includes('-')) {
        const parts = str.split('-');
        if (parts.length === 3) {
            const day = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1; // Convert to 0-based month
            const year = parseInt(parts[2]);
            if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 1900) {
                const result = new Date(year, month, day);
                console.log('✅ Parsed dd-mm-yyyy format:', result);
                return result;
            }
        }
    }
    
    // Handle dd/mm/yyyy format
    if (typeof str === "string" && str.includes('/')) {
        const parts = str.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1; // Convert to 0-based month
            const year = parseInt(parts[2]);
            if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 1900) {
                const result = new Date(year, month, day);
                console.log('✅ Parsed dd/mm/yyyy format:', result);
                return result;
            }
        }
    }
    
    // Handle numeric values (might be Excel serial numbers)
    if (typeof str === "number" || (typeof str === "string" && !isNaN(str))) {
        const num = parseFloat(str);
        if (num > 25000 && num < 50000) { // Reasonable range for Excel dates
            // Excel serial date: days since January 1, 1900
            const excelEpoch = new Date(1900, 0, 1);
            const result = new Date(excelEpoch.getTime() + (num - 2) * 24 * 60 * 60 * 1000);
            console.log('✅ Parsed Excel serial:', result, 'from number:', num);
            return result;
        }
    }
    
    // Handle empty or null values
    if (!str || str === '' || str === null || str === undefined) {
        console.log('❌ Empty date value');
        return null;
    }
    
    console.log('❌ Could not parse date:', str);
    return null;
}

// Enhanced filtering with better error reporting
function pachhwaraQAFilterByDate(data, startDate, endDate) {
    console.log('=== DATE FILTERING DEBUG ===');
    console.log('Filtering data by date range:', startDate, 'to', endDate);
    console.log('Total data rows to filter:', data.length);
    
    if (!data || data.length === 0) {
        console.log('No data to filter');
        return [];
    }
    
    let successCount = 0;
    let failCount = 0;
    let invalidCount = 0;
    
    const filtered = data.filter((row, index) => {
        const dopDateStr = row[5]; // DOP column (Column F, index 5)
        console.log(`Row ${index + 1}: DOP value:`, dopDateStr);
        
        const dopDate = pachhwaraQAParseDMY(dopDateStr);
        
        if (!dopDate) {
            console.log(`❌ Row ${index + 1}: Invalid DOP date:`, dopDateStr);
            invalidCount++;
            return false;
        }
        
        // Create clean date objects for comparison (remove time component)
        const cleanDopDate = new Date(dopDate.getFullYear(), dopDate.getMonth(), dopDate.getDate());
        const cleanStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const cleanEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        
        const isInRange = cleanDopDate >= cleanStartDate && cleanDopDate <= cleanEndDate;
        
        if (isInRange) {
            successCount++;
            console.log(`✅ Row ${index + 1}: ${dopDateStr} -> ${dopDate.toDateString()} (PASS)`);
        } else {
            failCount++;
            console.log(`❌ Row ${index + 1}: ${dopDateStr} -> ${dopDate.toDateString()} (FAIL)`);
        }
        
        return isInRange;
    });
    
    console.log('=== FILTER SUMMARY ===');
    console.log(`✅ Passed: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`🚫 Invalid: ${invalidCount}`);
    console.log(`📊 Total filtered: ${filtered.length}`);
    
    return filtered;
}

function pachhwaraQARenderTable() {
    console.log('=== Starting table render ===');
    console.log('PachhwaraQAData length:', PachhwaraQAData.length);
    console.log('PachhwaraQAHeaders:', PachhwaraQAHeaders);
    
    // Check if data exists
    if (!PachhwaraQAData || PachhwaraQAData.length === 0) {
        console.error('No data available to render table');
        document.getElementById('pachhwaraQA-table-container').innerHTML = '<div class="alert alert-warning">No data loaded. Please select a plant.</div>';
        return;
    }
    
    // Get checked columns
    const checkedCols = Array.from(document.querySelectorAll('#pachhwaraQAColumnCheckboxes input[type=checkbox]:checked')).map(cb => Number(cb.value));
    console.log('Checked columns:', checkedCols);
    
    if (checkedCols.length === 0) {
        console.warn('No columns selected');
        document.getElementById('pachhwaraQA-table-container').innerHTML = '<div class="alert alert-info">Please select at least one column to display.</div>';
        return;
    }
    
    const startDateValue = document.getElementById('pachhwaraQAStartDate').value;
    const endDateValue = document.getElementById('pachhwaraQAEndDate').value;
    
    if (!startDateValue || !endDateValue) {
        console.error('Start or end date not set!');
        document.getElementById('pachhwaraQA-table-container').innerHTML = '<div class="alert alert-warning">Please set both start and end dates.</div>';
        return;
    }
    
    // Simple date conversion from input format (yyyy-mm-dd) to Date object
    const startDate = new Date(startDateValue);
    const endDate = new Date(endDateValue);
    
    console.log('Date range:', startDate, 'to', endDate);
    
    // Filter data by date range
    const filtered = pachhwaraQAFilterByDate(PachhwaraQAData, startDate, endDate);
    
    console.log('Filtered by date:', filtered.length, 'rows');

    // Check consolidation options
    const byMonth = document.getElementById('pachhwaraQAConsolidateMonth').checked;
    const byFY = document.getElementById('pachhwaraQAConsolidateFY').checked;
    
    // If both are checked, only use consolidateFY
    if (byMonth && byFY) {
        byMonth = false;
    }
    let finalData = filtered;

    // Filter by value if enabled
    const byValue = document.getElementById('pachhwaraQAConsolidateValue').checked;
    if (byValue) {
        const valueCol = parseInt(document.getElementById('pachhwaraQAValueColumn').value);
        const valueOp = document.getElementById('pachhwaraQAValueOperator').value;
        const valueVal = parseFloat(document.getElementById('pachhwaraQAValueInput').value);
        const valueFrom = parseFloat(document.getElementById('pachhwaraQAValueBetweenFrom')?.value);
        const valueTo = parseFloat(document.getElementById('pachhwaraQAValueBetweenTo')?.value);
        if (!isNaN(valueCol)) {
            finalData = finalData.filter(row => {
                const cellVal = parseFloat(row[valueCol]);
                if (isNaN(cellVal)) return false;
                if (valueOp === 'lt') return cellVal < valueVal;
                if (valueOp === 'lte') return cellVal <= valueVal;
                if (valueOp === 'eq') return cellVal === valueVal;
                if (valueOp === 'gte') return cellVal >= valueVal;
                if (valueOp === 'gt') return cellVal > valueVal;
                if (valueOp === 'between') {
                    if (!isNaN(valueFrom) && !isNaN(valueTo)) {
                        return cellVal >= valueFrom && cellVal <= valueTo;
                    }
                    return false;
                }
                return false;
            });
        }
    }

    // Consolidate data if needed
    if (byMonth || byFY) {
        const grouped = {};
        
        finalData.forEach(row => {
            const dopDate = pachhwaraQAParseDMY(row[5]);
            if (!dopDate) return;
            
            let groupKey;
            
            if (byFY) {
                const year = dopDate.getFullYear();
                const month = dopDate.getMonth();
                const fyStart = month >= 3 ? year : year - 1; // April to March
                groupKey = `FY ${fyStart}-${(fyStart + 1).toString().slice(-2)}`;
            } else if (byMonth) {
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                groupKey = `${monthNames[dopDate.getMonth()]} ${dopDate.getFullYear()}`;
            }
            
            if (!grouped[groupKey]) {
                grouped[groupKey] = [];
            }
            grouped[groupKey].push(row);
        });
        
        // Convert grouped data back to array format
        finalData = Object.entries(grouped).map(([key, rows]) => {
            const newRow = Array(PachhwaraQAHeaders.length).fill('');
            newRow[0] = '1'; // Will be replaced with proper serial number later
            newRow[1] = rows[0][1]; // Plant name
            newRow[2] = 'Multiple'; // Rake No
            newRow[3] = 'Multiple'; // RR Date
            newRow[4] = 'Multiple'; // RR No
            newRow[5] = key; // DOP shows group key
            
            // Calculate aggregated values for other columns
            for (let i = 6; i < PachhwaraQAHeaders.length; i++) {
    const values = rows.map(r => parseFloat(r[i])).filter(v => !isNaN(v));
    if (values.length > 0) {
        if (i === 7 || i === 8) { // Sum for columns 8 & 9
            newRow[i] = values.reduce((a, b) => a + b, 0).toFixed(2);
        } else {
            // Weighted average for all other columns using Plant End Weight (index 8)
            const weightedSum = rows.reduce((sum, r) => {
                const v = parseFloat(r[i]);
                const w = parseFloat(r[8]);
                return (!isNaN(v) && !isNaN(w)) ? sum + v * w : sum;
            }, 0);
            const totalWeight = rows.reduce((sum, r) => {
                const w = parseFloat(r[8]);
                return !isNaN(w) ? sum + w : sum;
            }, 0);
            newRow[i] = totalWeight > 0 ? (weightedSum / totalWeight).toFixed(2) : '';
        }
    }
}
            // 👉 Set GCV Band-Eq grade based on GCV-Eq value
const gcvEqIdx = PachhwaraQAHeaders.findIndex(h => h.trim().toLowerCase() === 'gcv-eq');
const gcvBandEqIdx = PachhwaraQAHeaders.findIndex(h => h.trim().toLowerCase() === 'gcv band-eq');
if (gcvEqIdx !== -1 && gcvBandEqIdx !== -1) {
    const gcvEqValue = parseFloat(newRow[gcvEqIdx]);
    newRow[gcvBandEqIdx] = !isNaN(gcvEqValue) ? getGCVBandEqGrade(gcvEqValue) : '';
}
            return newRow;
        });
    }

    console.log('Final data for table:', finalData.length, 'rows');

    // Generate table HTML
    const tableContainer = document.getElementById('pachhwaraQA-table-container');
    let html = '';
    // Update entries count in table card header
    const entriesCountSpan = document.getElementById('pachhwaraQAEntriesCount');
    if (entriesCountSpan) {
        entriesCountSpan.textContent = `${finalData ? finalData.length : 0} entries`;
    }
    if (!PachhwaraQAData || PachhwaraQAData.length === 0) {
        html = '<div class="alert alert-warning">No data loaded. Please select a plant.</div>';
    } else {
        html += `<div class="table-responsive" style="max-height: 70vh; overflow: auto; border: 1px solid #dee2e6; border-radius: 5px;">
                    <table class="table table-sm table-bordered table-striped align-middle table-quality-analysis">
                        <thead class="table-primary">
                            <tr>
                                <th class="sticky-col bg-primary text-white" style="left:0;z-index:2;">Sr. No.</th>`;
        for (let i = 1; i < PachhwaraQAHeaders.length; i++) {
            if (checkedCols.includes(i)) {
                html += `<th>${PachhwaraQAHeaders[i]}</th>`;
            }
        }
        html += `</tr></thead><tbody>`;
        if (finalData.length > 0) {
            finalData.forEach((row, index) => {
                html += `<tr>
                    <td class="sticky-col bg-white" style="left:0;z-index:1;">${index + 1}</td>`;
                for (let i = 1; i < PachhwaraQAHeaders.length; i++) {
                    if (checkedCols.includes(i)) {
                        let cellValue = row[i] || '';
                        if (i === 3 || i === 5) { cellValue = pachhwaraQAFormatDate(cellValue); }
                        if ((i === 7 || i === 8) && !isNaN(Number(cellValue)) && cellValue !== '') { cellValue = Number(cellValue).toFixed(2); }
                        html += `<td>${cellValue}</td>`;
                    }
                }
                html += `</tr>`;
            });
            // Add total/average row
            html += `<tr class="table-warning fw-bold">
                <td class="sticky-col bg-warning" style="left:0;z-index:1;"><b>TOTAL/AVG</b></td>`;
            for (let i = 1; i < PachhwaraQAHeaders.length; i++) {
                if (checkedCols.includes(i)) {
                    let result = '';
                    // Leave these columns blank in total row: Plant, Rake No, RR Date, RR No, DOP, Consigned/Div-in
                    const headerName = PachhwaraQAHeaders[i].trim().toLowerCase();
                    const blankColumns = ['plant', 'rake no', 'rake no.', 'rr date', 'rr no', 'rr no.', 'dop', 'consigned', 'div-in', 'consigned/div-in', 'consigned/ div-in'];
                    
                    // Check for exact matches or specific patterns to avoid false matches like "Plant Weight"
                    const shouldBlank = blankColumns.some(col => {
                        if (col === 'plant') {
                            // Only match if it's exactly "plant" or "plant name", not "plant weight" etc.
                            return headerName === 'plant' || headerName === 'plant name';
                        }
                        return headerName.includes(col);
                    });
                    
                    if (shouldBlank) {
                        result = ''; // Leave blank for specified columns
                    } else if (i === 7 || i === 8) {
                        const values = finalData.map(r => parseFloat(r[i])).filter(v => !isNaN(v));
                        if (values.length > 0) { result = values.reduce((a, b) => a + b, 0).toFixed(2); }
                    } else if (PachhwaraQAHeaders[i].trim().toLowerCase() === 'gcv band-eq') {
                        const gcvEqIdx = PachhwaraQAHeaders.findIndex(h => h.trim().toLowerCase() === 'gcv-eq');
                        if (gcvEqIdx !== -1) {
                            const weightedSum = finalData.reduce((sum, r) => {
                                const v = parseFloat(r[gcvEqIdx]);
                                const w = parseFloat(r[8]);
                                return (!isNaN(v) && !isNaN(w)) ? sum + v * w : sum;
                            }, 0);
                            const totalWeight = finalData.reduce((sum, r) => {
                                const w = parseFloat(r[8]);
                                return !isNaN(w) ? sum + w : sum;
                            }, 0);
                            const avgGcvEq = totalWeight > 0 ? (weightedSum / totalWeight) : NaN;
                            result = !isNaN(avgGcvEq) ? getGCVBandEqGrade(avgGcvEq) : '';
                        }
                    } else {
                        const weightedSum = finalData.reduce((sum, r) => {
                            const v = parseFloat(r[i]);
                            const w = parseFloat(r[8]);
                            return (!isNaN(v) && !isNaN(w)) ? sum + v * w : sum;
                        }, 0);
                        const totalWeight = finalData.reduce((sum, r) => {
                            const w = parseFloat(r[8]);
                            return !isNaN(w) ? sum + w : sum;
                        }, 0);
                        result = totalWeight > 0 ? (weightedSum / totalWeight).toFixed(2) : '';
                    }
                    html += `<td>${result}</td>`;
                }
            }
            html += `</tr>`;
        } else {
            const colCount = 1 + checkedCols.length;
            html += `<tr><td colspan="${colCount}" class="text-center">No data found for selected date range.</td></tr>`;
        }
        html += `</tbody></table></div>`;
    }
    if (tableContainer) {
        tableContainer.innerHTML = html;
    }
}

// Simple date formatting function
function pachhwaraQAFormatDate(str) {
    if (!str) return '';
    
    // Handle Google Sheets Date(YYYY,M,D) format
    if (typeof str === "string" && str.startsWith("Date(")) {
        const parts = str.match(/\d+/g);
        if (parts && parts.length >= 3) {
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]) + 1; // Convert 0-based to 1-based month
            const day = parseInt(parts[2]);
            return `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
        }
    }
    
    // Handle dd-mm-yyyy format (already in correct format)
    if (typeof str === "string" && str.includes('-')) {
        return str;
    }
    
    // Handle dd/mm/yyyy format (convert to dd-mm-yyyy)
    if (typeof str === "string" && str.includes('/')) {
        return str.replace(/\//g, '-');
    }
    
    // Handle consolidated date strings like "Jan 2025"
    if (typeof str === "string" && str.includes(' ')) {
        return str;
    }
    
    return str;
}

// Function to render the value column dropdown
function pachhwaraQARenderValueColumnDropdown() {
    const dropdown = document.getElementById('pachhwaraQAValueColumn');
    if (!dropdown) return;
    
    dropdown.innerHTML = '<option value="">Select Column</option>';
    
    // Add all columns except Serial No (start from index 1)
    for (let i = 1; i < PachhwaraQAHeaders.length; i++) {
        if (PachhwaraQAHeaders[i] && PachhwaraQAHeaders[i].trim() !== '') {
            dropdown.innerHTML += `<option value="${i}">${PachhwaraQAHeaders[i]}</option>`;
        }
    }

    
}
// Function to get GCV Band equivalent grade
// This function maps GCV equivalent values to grades
function getGCVBandEqGrade(gcvEq) {
    if (gcvEq > 7000) return 'G1';
    if (gcvEq >= 6701) return 'G2';
    if (gcvEq >= 6401) return 'G3';
    if (gcvEq >= 6101) return 'G4';
    if (gcvEq >= 5801) return 'G5';
    if (gcvEq >= 5501) return 'G6';
    if (gcvEq >= 5201) return 'G7';
    if (gcvEq >= 4901) return 'G8';
    if (gcvEq >= 4601) return 'G9';
    if (gcvEq >= 4301) return 'G10';
    if (gcvEq >= 4001) return 'G11';
    if (gcvEq >= 3701) return 'G12';
    if (gcvEq >= 3401) return 'G13';
    if (gcvEq >= 3101) return 'G14';
    if (gcvEq >= 2801) return 'G15';
    if (gcvEq >= 2501) return 'G16';
    if (gcvEq >= 2201) return 'G17';
    return '';
}

// Helper function to load external scripts
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Helper function to get current table data for export
function pachhwaraQAGetExportData() {
    const tableContainer = document.getElementById('pachhwaraQA-table-container');
    const table = tableContainer.querySelector('table');
    if (!table) return null;

    const headers = [];
    const rows = [];
    
    // Get headers
    const headerRow = table.querySelector('thead tr');
    if (headerRow) {
        headerRow.querySelectorAll('th').forEach(th => {
            headers.push(th.textContent.trim());
        });
    }
    
    // Get data rows (excluding total row)
    const dataRows = table.querySelectorAll('tbody tr:not(.table-warning)');
    dataRows.forEach(tr => {
        const row = [];
        tr.querySelectorAll('td').forEach(td => {
            row.push(td.textContent.trim());
        });
        rows.push(row);
    });
    
    // Get total row
    const totalRow = table.querySelector('tbody tr.table-warning');
    let totalRowData = null;
    if (totalRow) {
        totalRowData = [];
        totalRow.querySelectorAll('td').forEach(td => {
            totalRowData.push(td.textContent.trim());
        });
    }
    
    // Get selected plant and date range
    const selectedPlant = document.querySelector('input[name="pachhwaraQAPlant"]:checked')?.value || '';
    const startDate = document.getElementById('pachhwaraQAStartDate')?.value || '';
    const endDate = document.getElementById('pachhwaraQAEndDate')?.value || '';
    
    return {
        headers,
        rows,
        totalRow: totalRowData,
        selectedPlant,
        startDate,
        endDate,
        title: `Pachhwara Coal Quality Analysis - ${selectedPlant}`
    };
}

// PDF Export Function
async function pachhwaraQAExportToPDF() {
    try {
        // Check if jsPDF is available
        if (typeof window.jsPDF === 'undefined') {
            // Load jsPDF dynamically
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js');
        }
        
        const data = pachhwaraQAGetExportData();
        if (!data) {
            alert('No data available to export');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'mm', 'a4'); // Landscape A4
        
        // Add title
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text(data.title, 20, 20);
        
        // Add date range
        if (data.startDate && data.endDate) {
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            doc.text(`Date Range: ${data.startDate} to ${data.endDate}`, 20, 30);
        }
        
        // Prepare table data
        const tableData = [...data.rows];
        if (data.totalRow) {
            tableData.push(data.totalRow);
        }
        
        // Create table
        doc.autoTable({
            head: [data.headers],
            body: tableData,
            startY: 40,
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [44, 90, 160], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 249, 250] },
            // Highlight total row
            didParseCell: function(data) {
                if (data.row.index === tableData.length - 1 && data.totalRow) {
                    data.cell.styles.fillColor = [255, 243, 205];
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        });
        
        // Save the PDF
        doc.save(`${data.selectedPlant}_Quality_Analysis_${new Date().toISOString().split('T')[0]}.pdf`);
        
    } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Error exporting PDF. Please try again.');
    }
}

// JPG Export Function
async function pachhwaraQAExportToJPG() {
    try {
        // Check if html2canvas is available
        if (typeof html2canvas === 'undefined') {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        }
        
        const tableContainer = document.getElementById('pachhwaraQA-table-container');
        if (!tableContainer) {
            alert('No table found to export');
            return;
        }
        
        const data = pachhwaraQAGetExportData();
        if (!data) {
            alert('No data available to export');
            return;
        }
        
        // Create a temporary container for export
        const exportContainer = document.createElement('div');
        exportContainer.style.position = 'absolute';
        exportContainer.style.left = '-9999px';
        exportContainer.style.background = 'white';
        exportContainer.style.padding = '20px';
        exportContainer.style.fontFamily = 'Arial, sans-serif';
        
        // Add title and date range
        exportContainer.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #2c5aa0; margin: 0 0 10px 0;">${data.title}</h2>
                ${data.startDate && data.endDate ? `<p style="margin: 0; color: #666;">Date Range: ${data.startDate} to ${data.endDate}</p>` : ''}
            </div>
            ${tableContainer.innerHTML}
        `;
        
        document.body.appendChild(exportContainer);
        
        // Generate canvas and download
        const canvas = await html2canvas(exportContainer, {
            backgroundColor: 'white',
            scale: 2,
            useCORS: true
        });
        
        // Remove temporary container
        document.body.removeChild(exportContainer);
        
        // Download image
        const link = document.createElement('a');
        link.download = `${data.selectedPlant}_Quality_Analysis_${new Date().toISOString().split('T')[0]}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
        
    } catch (error) {
        console.error('Error exporting JPG:', error);
        alert('Error exporting JPG. Please try again.');
    }
}

// Excel Export Function
async function pachhwaraQAExportToExcel() {
    try {
        // Check if SheetJS is available
        if (typeof XLSX === 'undefined') {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
        }
        
        const data = pachhwaraQAGetExportData();
        if (!data) {
            alert('No data available to export');
            return;
        }
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Prepare data for worksheet
        const wsData = [data.headers, ...data.rows];
        if (data.totalRow) {
            wsData.push(data.totalRow);
        }
        
        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        
        // Set column widths
        const colWidths = data.headers.map(() => ({ wch: 15 }));
        ws['!cols'] = colWidths;
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Quality Analysis');
        
        // Save file
        XLSX.writeFile(wb, `${data.selectedPlant}_Quality_Analysis_${new Date().toISOString().split('T')[0]}.xlsx`);
        
    } catch (error) {
        console.error('Error exporting Excel:', error);
        alert('Error exporting Excel. Please try again.');
    }
}