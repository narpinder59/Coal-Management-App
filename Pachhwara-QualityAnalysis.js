let PachhwaraQAData = [];
let PachhwaraQAHeaders = [];
let PachhwaraQASortState = {
    column: -1,
    direction: 'none' // 'none', 'asc', 'desc'
};

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
    const RANGE = 'A2:Z'; // Start from row 2 to skip headers
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
                <h4 class="mb-0"><i class="bi bi-clipboard-data"></i> Pachhwara Coal Quantity & Quality Analysis at <span id="pachhwaraQASelectedPlant">GGSSTP</span></h4>
            </div>
        </div>

        <!-- Table Card -->
        <div class="pachhwara-pd-card mb-3">
            <div class="pachhwara-pd-section-header d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-2">
                    <h6 class="mb-0"><i class="bi bi-table"></i> Data Table</h6>
                    <span class="badge bg-secondary" id="pachhwaraQAEntriesCount">0 entries</span>
                </div>
                <button class="btn btn-outline-light btn-sm" id="pachhwaraQARefreshBtnTable">
                    <i class="bi bi-arrow-clockwise"></i> Refresh Data
                </button>
            </div>
        </div>

        <!-- Table Container (Outside Card) -->
        <div id="pachhwaraQA-table-container" class="mb-3"></div>

        <!-- Report Container -->
        <div id="pachhwaraQA-report-container" class="mb-3" style="display: none;"></div>

        <!-- Report Toggle Button -->
        <button class="btn btn-info report-toggle-btn" id="pachhwaraQAReportToggle" style="position: fixed; bottom: 160px; right: 20px; z-index: 1040;">
            <i class="bi bi-file-earmark-text"></i>
        </button>

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
                pachhwaraQAUpdateHeaderPlantName(this.value);
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
    pachhwaraQASetupReportToggle();
}

// Function to update the header with selected plant name
function pachhwaraQAUpdateHeaderPlantName(plantName) {
    const plantSpan = document.getElementById('pachhwaraQASelectedPlant');
    if (plantSpan) {
        plantSpan.textContent = plantName;
    }
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

// Setup report toggle functionality
function pachhwaraQASetupReportToggle() {
    const reportToggle = document.getElementById('pachhwaraQAReportToggle');
    const reportContainer = document.getElementById('pachhwaraQA-report-container');
    const tableContainer = document.getElementById('pachhwaraQA-table-container');

    if (reportToggle) {
        reportToggle.addEventListener('click', () => {
            if (reportContainer.style.display === 'none') {
                // Show report, hide table
                pachhwaraQAGenerateReport();
                reportContainer.style.display = 'block';
                tableContainer.style.display = 'none';
                reportToggle.innerHTML = '<i class="bi bi-table"></i>';
                reportToggle.title = 'Show Table';
            } else {
                // Show table, hide report
                reportContainer.style.display = 'none';
                tableContainer.style.display = 'block';
                reportToggle.innerHTML = '<i class="bi bi-file-earmark-text"></i>';
                reportToggle.title = 'Show Report';
            }
        });
    }
}

// Generate comprehensive report
function pachhwaraQAGenerateReport() {
    const reportContainer = document.getElementById('pachhwaraQA-report-container');
    const selectedPlant = document.querySelector('input[name="pachhwaraQAPlant"]:checked')?.value || 'Unknown';
    const startDate = document.getElementById('pachhwaraQAStartDate')?.value || '';
    const endDate = document.getElementById('pachhwaraQAEndDate')?.value || '';
    
    // Get filtered data (same as table)
    const filteredData = pachhwaraQAGetFilteredData();
    
    if (!filteredData || filteredData.length === 0) {
        reportContainer.innerHTML = '<div class="alert alert-warning">No data available for report generation.</div>';
        return;
    }

    const reportStats = pachhwaraQACalculateStatistics(filteredData);
    const reportHTML = pachhwaraQAGenerateReportHTML(selectedPlant, startDate, endDate, reportStats, filteredData);
    
    reportContainer.innerHTML = reportHTML;
}

// Get filtered data (same logic as table rendering)
function pachhwaraQAGetFilteredData() {
    if (!PachhwaraQAData || PachhwaraQAData.length === 0) return [];
    
    const startDateValue = document.getElementById('pachhwaraQAStartDate').value;
    const endDateValue = document.getElementById('pachhwaraQAEndDate').value;
    
    if (!startDateValue || !endDateValue) return [];
    
    const startDate = new Date(startDateValue);
    const endDate = new Date(endDateValue);
    
    return pachhwaraQAFilterByDate(PachhwaraQAData, startDate, endDate);
}

// Calculate comprehensive statistics
function pachhwaraQACalculateStatistics(data) {
    const stats = {
        totalRecords: data.length,
        weightStats: {},
        qualityStats: {},
        dateRange: {},
        rakeStats: {}
    };

    // Calculate weight statistics
    const plantWeights = data.map(r => parseFloat(r[7])).filter(v => !isNaN(v));
    const rrWeights = data.map(r => parseFloat(r[8])).filter(v => !isNaN(v));
    
    stats.weightStats = {
        totalPlantWeight: plantWeights.reduce((a, b) => a + b, 0),
        totalRRWeight: rrWeights.reduce((a, b) => a + b, 0),
        avgPlantWeight: plantWeights.length > 0 ? plantWeights.reduce((a, b) => a + b, 0) / plantWeights.length : 0,
        avgRRWeight: rrWeights.length > 0 ? rrWeights.reduce((a, b) => a + b, 0) / rrWeights.length : 0,
        weightDifference: 0
    };
    
    stats.weightStats.weightDifference = stats.weightStats.totalRRWeight - stats.weightStats.totalPlantWeight;

    // Calculate quality parameter statistics for key columns
    // Use dynamic header detection to find ALL quality parameters from actual headers
    // Skip non-quality columns: Sr. No., Plant, Rake No, RR Date, RR No, DOP, Plant Weight, RR Weight
    const skipColumns = [
        'sr. no', 'sr no', 'serial', 'plant', 'rake no', 'rake no.', 'rr date', 'rr no', 'rr no.', 
        'dop', 'plant weight', 'rr weight', 'consigned', 'div-in', 'consigned/div-in', 'consigned/ div-in'
    ];
    
    // Process all headers starting from index 1 (skip Sr. No.)
    for (let i = 1; i < PachhwaraQAHeaders.length; i++) {
        const header = PachhwaraQAHeaders[i];
        if (!header || header.trim() === '') continue;
        
        const headerLower = header.toLowerCase().trim();
        
        // Check if this column should be skipped (non-quality parameters)
        const shouldSkip = skipColumns.some(skipCol => {
            if (skipCol === 'plant') {
                // Only skip if it's exactly "plant" or "plant name", not "plant weight" etc.
                return headerLower === 'plant' || headerLower === 'plant name';
            }
            return headerLower.includes(skipCol);
        });
        
        if (shouldSkip) continue;
        
        // This is a quality parameter - process it
        const values = data.map(r => parseFloat(r[i])).filter(v => !isNaN(v));
        if (values.length > 0) {
            // Create proper display name with better formatting
            let displayName = header.trim();
            
            // Enhance display names for better presentation
            if (displayName.toLowerCase().includes('tm') && displayName.toLowerCase().includes('moist')) {
                displayName = 'TM (%)';
            } else if (displayName.toLowerCase().includes('moisture ad')) {
                displayName = 'Moisture AD (%)';
            } else if (displayName.toLowerCase().includes('ash ad')) {
                displayName = 'Ash AD (%)';
            } else if (displayName.toLowerCase().includes('vm ad')) {
                displayName = 'VM AD (%)';
            } else if (displayName.toLowerCase().includes('gcv bomb')) {
                displayName = 'GCV Bomb (kcal/kg)';
            } else if (displayName.toLowerCase().includes('moisture eq')) {
                displayName = 'Moisture Eq (%)';
            } else if (displayName.toLowerCase().includes('ash eq')) {
                displayName = 'Ash Eq (%)';
            } else if (displayName.toLowerCase().includes('vm eq')) {
                displayName = 'VM Eq (%)';
            } else if (displayName.toLowerCase().includes('gcv eq') || displayName.toLowerCase().includes('gcv-eq')) {
                displayName = 'GCV Eq (kcal/kg)';
            } else if (displayName.toLowerCase().includes('sulphur') || displayName.toLowerCase().includes('sulfur')) {
                displayName = 'Sulphur (%)';
            } else if (displayName.toLowerCase().includes('fc')) {
                displayName = 'FC (%)';
            }
            
            stats.qualityStats[displayName] = {
                min: Math.min(...values),
                max: Math.max(...values),
                avg: values.reduce((a, b) => a + b, 0) / values.length,
                count: values.length
            };
        }
    }

    // Date range analysis
    const dates = data.map(r => pachhwaraQAParseDMY(r[5])).filter(d => d !== null);
    if (dates.length > 0) {
        stats.dateRange = {
            earliestDate: new Date(Math.min(...dates)),
            latestDate: new Date(Math.max(...dates)),
            totalDays: Math.ceil((Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24)) + 1
        };
    }

    // Rake statistics
    const rakes = data.map(r => r[2]).filter(r => r && r !== '');
    const uniqueRakes = [...new Set(rakes)];
    stats.rakeStats = {
        totalRakes: uniqueRakes.length,
        totalConsignments: rakes.length,
        avgConsignmentsPerRake: rakes.length / uniqueRakes.length
    };

    return stats;
}

// Generate HTML report
function pachhwaraQAGenerateReportHTML(plant, startDate, endDate, stats, data) {
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB');
    };

    const formatNumber = (num, decimals = 2) => {
        return typeof num === 'number' ? num.toFixed(decimals) : 'N/A';
    };

    return `
        <div class="report-container">
            <!-- Report Header -->
            <div class="card mb-2">
                <div class="card-header bg-primary text-white py-2">
                    <h6 class="mb-0"><i class="bi bi-file-earmark-text"></i> Quality Analysis Report</h6>
                </div>
                <div class="card-body py-2">
                    <div class="row">
                        <div class="col-md-6">
                            <h6 class="mb-2">Report Details</h6>
                            <table class="table table-sm mb-0" style="font-size: 0.75rem;">
                                <tr><td><strong>Plant:</strong></td><td>${plant}</td></tr>
                                <tr><td><strong>Period:</strong></td><td>${formatDate(startDate)} to ${formatDate(endDate)}</td></tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <h6 class="mb-2">Period Analysis</h6>
                            <table class="table table-sm mb-0" style="font-size: 0.75rem;">
                                <tr><td><strong>Date Range:</strong></td><td>${stats.dateRange.totalDays || 0} days</td></tr>
                                <tr><td><strong>Avg Rakes/Day:</strong></td><td>${stats.dateRange.totalDays ? (stats.totalRecords / stats.dateRange.totalDays).toFixed(1) : 'N/A'}</td></tr>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Weight Analysis -->
            <div class="card mb-2">
                <div class="card-header bg-success text-white py-2">
                    <h6 class="mb-0"><i class="bi bi-speedometer2"></i> Weight Analysis</h6>
                </div>
                <div class="card-body py-2">
                    <div class="row">
                        <div class="col-md-6">
                            <h6 class="mb-2">Total Weights</h6>
                            <table class="table table-striped mb-0" style="font-size: 0.75rem;">
                                <tr><td><strong>Total Plant Weight:</strong></td><td>${formatNumber(stats.weightStats.totalPlantWeight)} MT</td></tr>
                                <tr><td><strong>Total RR Weight:</strong></td><td>${formatNumber(stats.weightStats.totalRRWeight)} MT</td></tr>
                                <tr><td><strong>Weight Difference:</strong></td><td class="${stats.weightStats.weightDifference >= 0 ? 'text-success' : 'text-danger'}">${formatNumber(stats.weightStats.weightDifference)} MT</td></tr>
                                <tr><td><strong>Variance (%):</strong></td><td class="${Math.abs(stats.weightStats.weightDifference / stats.weightStats.totalPlantWeight * 100) <= 2 ? 'text-success' : 'text-warning'}">${formatNumber(Math.abs(stats.weightStats.weightDifference / stats.weightStats.totalPlantWeight * 100))}%</td></tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <h6 class="mb-2">Average Weights</h6>
                            <table class="table table-striped mb-0" style="font-size: 0.75rem;">
                                <tr><td><strong>Avg Plant Weight/Rake:</strong></td><td>${formatNumber(stats.weightStats.avgPlantWeight)} MT</td></tr>
                                <tr><td><strong>Avg RR Weight/Rake:</strong></td><td>${formatNumber(stats.weightStats.avgRRWeight)} MT</td></tr>
                                <tr><td><strong>Total Rakes:</strong></td><td>${stats.rakeStats.totalRakes}</td></tr>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quality Parameters Analysis -->
            <div class="card mb-2">
                <div class="card-header bg-info text-white py-2">
                    <h6 class="mb-0"><i class="bi bi-graph-up"></i> Quality Parameters Analysis</h6>
                </div>
                <div class="card-body py-2">
                    <div class="table-responsive">
                        <table class="table table-striped table-hover mb-0" style="font-size: 0.7rem;">
                            <thead class="table-dark">
                                <tr>
                                    <th style="font-size: 0.65rem;">Parameter</th>
                                    <th style="font-size: 0.65rem;">Minimum</th>
                                    <th style="font-size: 0.65rem;">Maximum</th>
                                    <th style="font-size: 0.65rem;">Average</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(stats.qualityStats).map(([param, data]) => {
                                    return `
                                        <tr>
                                            <td><strong>${param}</strong></td>
                                            <td>${formatNumber(data.min)}</td>
                                            <td>${formatNumber(data.max)}</td>
                                            <td>${formatNumber(data.avg)}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
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
    console.log('All headers with indices:');
    PachhwaraQAHeaders.forEach((header, index) => {
        console.log(`Index ${index}: "${header}"`);
    });
    
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

    // Calculate min/max values for sortable columns for highlighting
    const minMaxValues = {};
    if (finalData.length > 0) {
        for (let i = 1; i < PachhwaraQAHeaders.length; i++) {
            const headerName = PachhwaraQAHeaders[i];
            const headerLower = headerName?.toLowerCase() || '';
            const shouldCalculateMinMax = headerLower.includes('weight') || 
                                        headerLower.includes('moisture') || 
                                        headerLower.includes('moist') || 
                                        headerLower.includes('tm') || 
                                        headerLower.includes('ash') || 
                                        headerLower.includes('vm') || 
                                        headerLower.includes('fc') || 
                                        headerLower.includes('gcv') || 
                                        headerLower.includes('sulphur') || 
                                        headerLower.includes('sulfur');
            
            if (shouldCalculateMinMax) {
                const values = finalData.map(r => parseFloat(r[i])).filter(v => !isNaN(v));
                if (values.length > 0) {
                    // For minimum calculation, exclude zero values to highlight the next meaningful minimum
                    const nonZeroValues = values.filter(val => val > 0);
                    const minValue = nonZeroValues.length > 0 ? Math.min(...nonZeroValues) : Math.min(...values);
                    
                    minMaxValues[i] = {
                        min: minValue,
                        max: Math.max(...values)
                    };
                }
            }
        }
    }

    // Apply sorting if enabled
    if (PachhwaraQASortState.direction !== 'none' && PachhwaraQASortState.column >= 0) {
        const sortColumn = PachhwaraQASortState.column;
        const isAscending = PachhwaraQASortState.direction === 'asc';
        
        console.log('Applying sort to column:', sortColumn, 'direction:', PachhwaraQASortState.direction);
        
        finalData.sort((a, b) => {
            let valueA = a[sortColumn] || '';
            let valueB = b[sortColumn] || '';
            
            // Try to parse as numbers first
            const numA = parseFloat(valueA);
            const numB = parseFloat(valueB);
            
            let comparison = 0;
            
            if (!isNaN(numA) && !isNaN(numB)) {
                // Both are numbers
                comparison = numA - numB;
            } else {
                // String comparison
                comparison = String(valueA).localeCompare(String(valueB));
            }
            
            return isAscending ? comparison : -comparison;
        });
        
        console.log('Data sorted');
    }

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
                                <th class="sticky-col bg-primary text-white" style="left:0;z-index:2;min-width:80px;width:80px;">Sr. No.</th>`;
        for (let i = 1; i < PachhwaraQAHeaders.length; i++) {
            if (checkedCols.includes(i)) {
                const isDateColumn = (i === 3 || i === 5) ? ' data-date-column="true"' : '';
                const headerName = PachhwaraQAHeaders[i];
                
                // Check if this column should have sorting (from RR Weight onwards)
                // Look for RR Weight, Plant Weight, and quality parameters
                const headerLower = headerName.toLowerCase();
                const shouldHaveSorting = headerLower.includes('weight') || 
                                        headerLower.includes('moisture') || 
                                        headerLower.includes('moist') || 
                                        headerLower.includes('tm') || 
                                        headerLower.includes('ash') || 
                                        headerLower.includes('vm') || 
                                        headerLower.includes('fc') || 
                                        headerLower.includes('gcv') || 
                                        headerLower.includes('sulphur') || 
                                        headerLower.includes('sulfur');
                
                if (shouldHaveSorting) {
                    const isActive = PachhwaraQASortState.column === i;
                    const sortIcon = isActive 
                        ? (PachhwaraQASortState.direction === 'asc' ? '↑' : PachhwaraQASortState.direction === 'desc' ? '↓' : '↕')
                        : '↕';
                    const arrowClass = isActive ? 'sort-arrow active' : 'sort-arrow';
                    
                    html += `<th${isDateColumn} onclick="pachhwaraQASortColumn(${i})" title="Click to sort" style="user-select: none;">
                                ${headerName}<span class="${arrowClass}">${sortIcon}</span>
                             </th>`;
                } else {
                    html += `<th${isDateColumn}>${headerName}</th>`;
                }
            }
        }
        html += `</tr></thead><tbody>`;
        if (finalData.length > 0) {
            finalData.forEach((row, index) => {
                html += `<tr>
                    <td class="sticky-col bg-white" style="left:0;z-index:1;min-width:80px;width:80px;">${index + 1}</td>`;
                for (let i = 1; i < PachhwaraQAHeaders.length; i++) {
                    if (checkedCols.includes(i)) {
                        let cellValue = row[i] || '';
                        if (i === 3 || i === 5) { cellValue = pachhwaraQAFormatDate(cellValue); }
                        if ((i === 7 || i === 8) && !isNaN(Number(cellValue)) && cellValue !== '') { cellValue = Number(cellValue).toFixed(2); }
                        
                        // Check for min/max highlighting
                        let cellClass = '';
                        if (minMaxValues[i] && !isNaN(parseFloat(cellValue))) {
                            const numValue = parseFloat(cellValue);
                            if (numValue === minMaxValues[i].min && minMaxValues[i].min !== minMaxValues[i].max) {
                                cellClass = ' class="min-value"';
                            } else if (numValue === minMaxValues[i].max && minMaxValues[i].min !== minMaxValues[i].max) {
                                cellClass = ' class="max-value"';
                            }
                        }
                        
                        const isDateColumn = (i === 3 || i === 5) ? ' data-date-column="true"' : '';
                        html += `<td${isDateColumn}${cellClass}>${cellValue}</td>`;
                    }
                }
                html += `</tr>`;
            });
            // Add total/average row
            html += `<tr class="table-primary fw-bold">
                <td class="sticky-col bg-primary text-white fw-bold" style="left:0;z-index:1;min-width:80px;width:80px;"><b>Total/Avg</b></td>`;
            for (let i = 1; i < PachhwaraQAHeaders.length; i++) {
                if (checkedCols.includes(i)) {
                    console.log('Processing total row for column:', i, PachhwaraQAHeaders[i]);
                    let result = '';
                    
                    // Handle GCV Band-Eq first (special case)
                    const headerName = PachhwaraQAHeaders[i].trim().toLowerCase();
                    console.log('Current header:', headerName, 'at index:', i);
                    
                    if (headerName === 'gcv band-eq' || headerName.includes('gcv') && headerName.includes('band')) {
                        console.log('Processing GCV Band-Eq column at index:', i);
                        const gcvEqIdx = PachhwaraQAHeaders.findIndex(h => h.trim().toLowerCase() === 'gcv-eq' || (h.trim().toLowerCase().includes('gcv') && h.trim().toLowerCase().includes('eq') && !h.trim().toLowerCase().includes('band')));
                        console.log('Found GCV-Eq column at index:', gcvEqIdx);
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
                            console.log('Calculated avgGcvEq:', avgGcvEq);
                            result = !isNaN(avgGcvEq) ? getGCVBandEqGrade(avgGcvEq) : '';
                            console.log('GCV Band result:', result);
                        }
                    } 
                    // Handle sum columns (columns 7 and 8)
                    else if (i === 7 || i === 8) {
                        const values = finalData.map(r => parseFloat(r[i])).filter(v => !isNaN(v));
                        if (values.length > 0) { result = values.reduce((a, b) => a + b, 0).toFixed(2); }
                    }
                    // Check for columns that should be blank in total row
                    else {
                        // Leave these columns blank in total row: Plant, Rake No, RR Date, RR No, DOP, Consigned/Div-in
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
                        } else {
                            // Calculate weighted average for other numeric columns
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
                    }
                    const isDateColumn = (i === 3 || i === 5) ? ' data-date-column="true"' : '';
                    html += `<td${isDateColumn} class="fw-bold">${result}</td>`;
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

// Function to sort table by column
function pachhwaraQASortColumn(columnIndex) {
    console.log('Sorting column:', columnIndex, PachhwaraQAHeaders[columnIndex]);
    
    // Update sort state
    if (PachhwaraQASortState.column === columnIndex) {
        // Same column - cycle through states: none -> asc -> desc -> none
        if (PachhwaraQASortState.direction === 'none') {
            PachhwaraQASortState.direction = 'asc';
        } else if (PachhwaraQASortState.direction === 'asc') {
            PachhwaraQASortState.direction = 'desc';
        } else {
            PachhwaraQASortState.direction = 'none';
        }
    } else {
        // New column - start with ascending
        PachhwaraQASortState.column = columnIndex;
        PachhwaraQASortState.direction = 'asc';
    }
    
    // Re-render table with sorting
    pachhwaraQARenderTable();
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
        
        // Check if report is currently shown
        const reportContainer = document.getElementById('pachhwaraQA-report-container');
        const tableContainer = document.getElementById('pachhwaraQA-table-container');
        const isReportView = reportContainer && reportContainer.style.display !== 'none';
        
        let contentToExport;
        let exportTitle;
        
        if (isReportView) {
            // Export the report
            contentToExport = reportContainer;
            exportTitle = 'Quality Analysis Report';
        } else {
            // Export the table
            contentToExport = tableContainer;
            exportTitle = 'Quality Analysis Data Table';
        }
        
        if (!contentToExport) {
            alert('No content found to export');
            return;
        }
        
        const data = pachhwaraQAGetExportData();
        const selectedPlant = document.querySelector('input[name="pachhwaraQAPlant"]:checked')?.value || 'Unknown';
        const startDate = document.getElementById('pachhwaraQAStartDate')?.value || '';
        const endDate = document.getElementById('pachhwaraQAEndDate')?.value || '';
        
        // Format dates for display
        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-GB');
        };
        
        // Create a temporary container for A4 export
        const exportContainer = document.createElement('div');
        exportContainer.style.position = 'absolute';
        exportContainer.style.left = '-9999px';
        exportContainer.style.background = 'white';
        exportContainer.style.width = '210mm'; // A4 width
        exportContainer.style.maxWidth = '210mm';
        exportContainer.style.padding = '15mm'; // A4 margins
        exportContainer.style.fontFamily = 'Arial, sans-serif';
        exportContainer.style.fontSize = '12px';
        exportContainer.style.lineHeight = '1.4';
        exportContainer.style.color = '#333';
        exportContainer.style.boxSizing = 'border-box';
        
        // Clone the content and adjust styles for A4
        const clonedContent = contentToExport.cloneNode(true);
        
        // Adjust table styles for A4 if it's table view
        if (!isReportView) {
            const tables = clonedContent.querySelectorAll('table');
            tables.forEach(table => {
                table.style.fontSize = '10px';
                table.style.width = '100%';
                table.style.borderCollapse = 'collapse';
                
                // Adjust cell padding
                const cells = table.querySelectorAll('th, td');
                cells.forEach(cell => {
                    cell.style.padding = '4px 6px';
                    cell.style.fontSize = '10px';
                    cell.style.border = '1px solid #dee2e6';
                });
                
                // Ensure headers are visible
                const headers = table.querySelectorAll('th');
                headers.forEach(header => {
                    header.style.backgroundColor = '#0d6efd';
                    header.style.color = 'white';
                    header.style.fontWeight = 'bold';
                });
            });
        } else {
            // Adjust report cards for A4
            const cards = clonedContent.querySelectorAll('.card');
            cards.forEach(card => {
                card.style.marginBottom = '10px';
                card.style.border = '1px solid #dee2e6';
                card.style.borderRadius = '5px';
            });
            
            const cardHeaders = clonedContent.querySelectorAll('.card-header');
            cardHeaders.forEach(header => {
                header.style.padding = '8px 12px';
                header.style.fontSize = '14px';
                header.style.fontWeight = 'bold';
            });
            
            const cardBodies = clonedContent.querySelectorAll('.card-body');
            cardBodies.forEach(body => {
                body.style.padding = '10px 12px';
            });
            
            const reportTables = clonedContent.querySelectorAll('table');
            reportTables.forEach(table => {
                table.style.fontSize = '10px';
                table.style.width = '100%';
                
                const cells = table.querySelectorAll('th, td');
                cells.forEach(cell => {
                    cell.style.padding = '3px 6px';
                    cell.style.fontSize = '10px';
                });
            });
        }
        
        // Add header with title and metadata
        exportContainer.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #0d6efd; padding-bottom: 15px;">
                <h1 style="color: #0d6efd; margin: 0 0 8px 0; font-size: 20px;">Pachhwara Coal Quantity & Quality Analysis</h1>
                <h2 style="color: #2c5aa0; margin: 0 0 8px 0; font-size: 16px;">${exportTitle} - ${selectedPlant}</h2>
                ${startDate && endDate ? `<p style="margin: 0; color: #666; font-size: 12px;">Period: ${formatDate(startDate)} to ${formatDate(endDate)}</p>` : ''}
                <p style="margin: 5px 0 0 0; color: #888; font-size: 10px;">Generated on: ${new Date().toLocaleString('en-GB')}</p>
            </div>
        `;
        
        exportContainer.appendChild(clonedContent);
        
        // Add footer
        const footer = document.createElement('div');
        footer.style.marginTop = '20px';
        footer.style.textAlign = 'center';
        footer.style.fontSize = '10px';
        footer.style.color = '#888';
        footer.style.borderTop = '1px solid #dee2e6';
        footer.style.paddingTop = '10px';
        footer.innerHTML = `
            <p style="margin: 0;">Generated by Pachhwara Quality Analysis System</p>
            <p style="margin: 0; font-size: 9px;">© ${new Date().getFullYear()} - All Rights Reserved</p>
        `;
        exportContainer.appendChild(footer);
        
        document.body.appendChild(exportContainer);
        
        // Generate high-quality canvas for A4
        const canvas = await html2canvas(exportContainer, {
            backgroundColor: 'white',
            scale: 3, // High quality for A4 printing
            useCORS: true,
            allowTaint: false,
            width: 794, // A4 width in pixels at 96 DPI
            height: 1123, // A4 height in pixels at 96 DPI
            scrollX: 0,
            scrollY: 0,
            logging: false
        });
        
        // Remove temporary container
        document.body.removeChild(exportContainer);
        
        // Download high-quality A4 JPG
        const link = document.createElement('a');
        const viewType = isReportView ? 'Report' : 'Table';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        link.download = `Pachhwara_${selectedPlant}_Quality_Analysis_${viewType}_${timestamp}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.95); // High quality JPEG
        link.click();
        
        console.log('JPG export completed successfully');
        
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