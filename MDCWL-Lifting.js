let mdcwlHeaders = [];
let mdcwlData = [];

// Fetch headers from Google Sheets
async function fetchMDCWLHeaders() {
    const SHEET_ID = '1cFngrabiTY-RMGDrw2eRn7Nn8LEY0IZyD0-QJT7UqTI';
    const SHEET_NAME = 'MDCWL-Lifting';
    const RANGE = 'A1:R1';
    const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&range=${RANGE}`;
    const res = await fetch(SHEET_URL);
    const text = await res.text();
    const json = JSON.parse(text.substr(47).slice(0, -2));
    const table = json.table;
    mdcwlHeaders = table.rows[0].c.map(cell => cell ? cell.v : "");
}

// Fetch data from Google Sheets
async function fetchMDCWLData() {
    const SHEET_ID = '1cFngrabiTY-RMGDrw2eRn7Nn8LEY0IZyD0-QJT7UqTI';
    const SHEET_NAME = 'MDCWL-Lifting';
    const RANGE = 'A2:R1000'; // Start from row 2 to skip headers
    const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&range=${RANGE}`;
    const res = await fetch(SHEET_URL);
    const text = await res.text();
    const json = JSON.parse(text.substr(47).slice(0, -2));
    const table = json.table;
    mdcwlData = table.rows
        .filter(row => row.c && row.c[0] && row.c[0].v)
        .map(row => row.c.map(cell => cell ? cell.v : ""));
}
// Show the MDCWL Lifting Report
function showMDCWLLiftingReport() {
    document.getElementById('main-content').innerHTML = `
        <!-- Main Title Card -->
        <div class="pachhwara-pd-card mb-3">
            <div class="pachhwara-pd-section-header">
                <h4 class="mb-0"><i class="bi bi-truck"></i> MDCWL Lifting Position</h4>
            </div>
        </div>

        <!-- Data Table Container -->
        <div id="mdcwl-table-container"></div>

        <!-- Export Toggle Button -->
        <button class="btn btn-success export-toggle-btn" id="MDCWLLiftingExportToggle">
            <i class="bi bi-box-arrow-up"></i>
        </button>

        <!-- Export Sidebar -->
        <div class="export-sidebar" id="MDCWLLiftingExportSidebar">
            <button class="btn export-btn pdf-btn" id="MDCWLLiftingExportPDFBtn" title="Export to PDF">
                <i class="bi bi-file-earmark-pdf"></i>
            </button>
            <button class="btn export-btn excel-btn" id="MDCWLLiftingExportExcelBtn" title="Export to Excel">
                <i class="bi bi-file-earmark-excel"></i>
            </button>
            <button class="btn export-btn jpg-btn" id="MDCWLLiftingExportImageBtn" title="Export to JPG">
                <i class="bi bi-file-earmark-image"></i>
            </button>
            <button class="btn export-btn print-btn" id="MDCWLLiftingPrintReportBtn" title="Print">
                <i class="bi bi-printer"></i>
            </button>
        </div>

        <!-- Filter Toggle Button -->
        <button class="btn btn-primary filter-toggle-btn" id="MDCWLLiftingFilterToggle">
            <i class="bi bi-funnel"></i>
        </button>

        <!-- Filter Sidebar -->
        <div class="filter-sidebar" id="MDCWLLiftingFilterSidebar">
            <button class="close-btn" id="MDCWLLiftingCloseSidebar">&times;</button>
            <h5><i class="bi bi-funnel"></i> Filters & Settings</h5>
            <hr>
            
            <!-- Date Range -->
            <div class="mb-3">
                <label class="form-label"><strong>Month Range</strong></label>
                <div class="mb-2">
                    <label class="form-label small">Start Month</label>
                    <select id="mdcwlStartMonth" class="form-select form-select-sm"></select>
                </div>
                <div class="mb-2">
                    <label class="form-label small">End Month</label>
                    <select id="mdcwlEndMonth" class="form-select form-select-sm"></select>
                </div>
            </div>
            <hr>

            <!-- Consolidation Options -->
            <div class="mb-3">
                <label class="form-label"><strong>Consolidation Options</strong></label>
                <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" id="mdcwlConsolidateMonth">
                    <label class="form-check-label" for="mdcwlConsolidateMonth">
                        Consolidate by Month
                        <small class="d-block text-muted">Group data monthly</small>
                    </label>
                </div>
                <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" id="mdcwlConsolidateFY">
                    <label class="form-check-label" for="mdcwlConsolidateFY">
                        Consolidate by Financial Year
                        <small class="d-block text-muted">Group data by FY</small>
                    </label>
                </div>
            </div>
            <hr>

            <!-- Colliery Selection -->
            <div class="mb-3">
                <label class="form-label"><strong>Colliery Selection</strong></label>
                <div id="mdcwlCollieryCheckboxes" class="d-flex flex-column gap-1"></div>
            </div>
            <hr>

            <!-- Column Selection -->
            <div class="mb-3">
                <label class="form-label"><strong>Show Columns</strong></label>
                <div class="mb-2">
                    <button type="button" class="btn btn-outline-success btn-sm me-2" id="mdcwlCheckAll">
                        <i class="bi bi-check-all"></i> All
                    </button>
                    <button type="button" class="btn btn-outline-danger btn-sm" id="mdcwlUncheckAll">
                        <i class="bi bi-x-circle"></i> None
                    </button>
                </div>
                <div id="mdcwlColumnCheckboxes" class="d-flex flex-column gap-1"></div>
            </div>
            <hr>

            <button class="btn btn-primary w-100" id="MDCWLLiftingApplyFilters">
                <i class="bi bi-check-circle"></i> Apply Filters
            </button>
        </div>
    `;
    fetchMDCWLHeaders().then(() => {
        fetchMDCWLData().then(() => {
            renderMDCWLLiftingFilters();
            renderMDCWLLiftingColumnFilter();
            renderMDCWLLiftingTable();
            setupMDCWLLiftingFilterListeners();
            MDCWLLiftingSetupSidebar();
            MDCWLLiftingSetupExportSidebar();
        });
    });
    const refreshBtn = document.getElementById('mdcwlLiftingRefreshBtn');
if (refreshBtn) {
    refreshBtn.addEventListener('click', function() {
        // Save checked columns
        const checkedCols = Array.from(document.querySelectorAll('#mdcwlColumnCheckboxes input[type=checkbox]:checked')).map(cb => Number(cb.value));
        fetchMDCWLData().then(() => {
            renderMDCWLLiftingFilters();
            renderMDCWLLiftingColumnFilter();
            // Restore checked columns
            checkedCols.forEach(idx => {
                const cb = document.getElementById(`mdcwlCol${idx}`);
                if (cb) cb.checked = true;
            });
            // Re-apply consolidation logic
            if (document.getElementById('mdcwlConsolidateMonth').checked) {
                [1,2,3,4,6,7,8,9].forEach(idx => {
                    const cb = document.getElementById(`mdcwlCol${idx}`);
                    if (cb) cb.checked = false;
                });
            }
            if (document.getElementById('mdcwlConsolidateFY').checked) {
                [1,2,3,4,6,7,8,9].forEach(idx => {
                    const cb = document.getElementById(`mdcwlCol${idx}`);
                    if (cb) cb.checked = false;
                });
            }
            renderMDCWLLiftingTable();
        });
    });
}
}

// Toggle card visibility function
function mdcwlToggleCard(bodyId, chevronId) {
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
}
// Render the MDCWL Lifting filters and table
function renderMDCWLLiftingFilters() {
    // Get unique months and collieries
    const monthIdx = mdcwlHeaders.indexOf('Month');
    const collieryIdx = mdcwlHeaders.indexOf('Colliery');
    const months = [...new Set(mdcwlData.map(row => row[monthIdx]).filter(Boolean))];
    const collieries = [...new Set(mdcwlData.map(row => row[collieryIdx]).filter(Boolean))];

    // Month dropdowns
    const startMonth = document.getElementById('mdcwlStartMonth');
    const endMonth = document.getElementById('mdcwlEndMonth');
    startMonth.innerHTML = months.map(m => `<option value="${m}">${parseAndFormatDateMonthYear(m)}</option>`).join('');
    endMonth.innerHTML = months.map(m => `<option value="${m}">${parseAndFormatDateMonthYear(m)}</option>`).join('');
    
    // Set default start month to current financial year start (April of current FY)
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    
    // Determine current financial year start
    const fyStartYear = currentMonth >= 4 ? currentYear : currentYear - 1;
    const fyStartMonth = 4; // April
    
    // Find the closest match to April of current FY in available months
    let defaultStartIndex = 0;
    for (let i = 0; i < months.length; i++) {
        const monthData = months[i];
        if (typeof monthData === "string" && monthData.startsWith("Date(")) {
            const parts = monthData.match(/\d+/g);
            if (parts && parts.length >= 2) {
                const year = parseInt(parts[0]);
                const month = parseInt(parts[1]) + 1; // Convert from 0-based to 1-based
                
                // Check if this matches April of current FY or later
                if (year === fyStartYear && month >= fyStartMonth) {
                    defaultStartIndex = i;
                    break;
                } else if (year > fyStartYear) {
                    defaultStartIndex = i;
                    break;
                }
            }
        }
    }
    
    startMonth.selectedIndex = defaultStartIndex;
    endMonth.selectedIndex = months.length - 1;

    // Colliery checkboxes
    const collieryDiv = document.getElementById('mdcwlCollieryCheckboxes');
    collieryDiv.innerHTML = collieries.map((c, i) =>
        `<div class="form-check">
            <input class="form-check-input" type="checkbox" value="${c}" id="colliery${i}" checked>
            <label class="form-check-label" for="colliery${i}">${c}</label>
        </div>`
    ).join('');
}

function renderMDCWLLiftingColumnFilter() {
    const container = document.getElementById('mdcwlColumnCheckboxes');
    container.innerHTML = '';
    
    // Start from 0 or 1 depending on whether you want to allow hiding Month/Colliery
    for (let i = 0; i < mdcwlHeaders.length; i++) {
        container.innerHTML += `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${i}" id="mdcwlCol${i}" checked>
                <label class="form-check-label" for="mdcwlCol${i}">${mdcwlHeaders[i]}</label>
            </div>
        `;
    }
    // Add listeners for column filter
    container.querySelectorAll('input[type=checkbox]').forEach(cb => {
        cb.addEventListener('change', renderMDCWLLiftingTable);
    });
    // Check All / Uncheck All
    document.getElementById('mdcwlCheckAll').onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        container.querySelectorAll('input[type=checkbox]').forEach(cb => { cb.checked = true; });
        renderMDCWLLiftingTable();
    };
    document.getElementById('mdcwlUncheckAll').onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        container.querySelectorAll('input[type=checkbox]').forEach(cb => { cb.checked = false; });
        renderMDCWLLiftingTable();
    };
}

function setupMDCWLLiftingFilterListeners() {
    document.getElementById('mdcwlStartMonth').addEventListener('change', renderMDCWLLiftingTable);
    document.getElementById('mdcwlEndMonth').addEventListener('change', renderMDCWLLiftingTable);
    document.getElementById('mdcwlConsolidateMonth').addEventListener('change', function() {
        if (this.checked) {
            [1,2,3,4,6,7,8,9].forEach(idx => {
                const cb = document.getElementById(`mdcwlCol${idx}`);
                if (cb) cb.checked = false;
            });
        }
        renderMDCWLLiftingTable();
    });
    document.getElementById('mdcwlConsolidateFY').addEventListener('change', function() {
        if (this.checked) {
            [1,2,3,4,6,7,8,9].forEach(idx => {
                const cb = document.getElementById(`mdcwlCol${idx}`);
                if (cb) cb.checked = false;
            });
        }
        renderMDCWLLiftingTable();
    });
    document.querySelectorAll('#mdcwlCollieryCheckboxes input[type=checkbox]').forEach(cb => {
        cb.addEventListener('change', renderMDCWLLiftingTable);
    });

    // Apply filters button
    document.getElementById('MDCWLLiftingApplyFilters').addEventListener('click', function() {
        renderMDCWLLiftingTable();
    });
}

// Sidebar setup function
function MDCWLLiftingSetupSidebar() {
    const sidebar = document.getElementById('MDCWLLiftingFilterSidebar');
    const toggleBtn = document.getElementById('MDCWLLiftingFilterToggle');
    const closeBtn = document.getElementById('MDCWLLiftingCloseSidebar');

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
function MDCWLLiftingSetupExportSidebar() {
    const exportSidebar = document.getElementById('MDCWLLiftingExportSidebar');
    const exportToggle = document.getElementById('MDCWLLiftingExportToggle');

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

    // Export button event listeners
    document.getElementById('MDCWLLiftingExportPDFBtn').addEventListener('click', mdcwlExportToPDF);
    document.getElementById('MDCWLLiftingExportExcelBtn').addEventListener('click', mdcwlExportToExcel);
    document.getElementById('MDCWLLiftingExportImageBtn').addEventListener('click', mdcwlExportToJPG);
    document.getElementById('MDCWLLiftingPrintReportBtn').addEventListener('click', () => window.print());
}

function renderMDCWLLiftingTable() {
    const startMonth = document.getElementById('mdcwlStartMonth').value;
    const endMonth = document.getElementById('mdcwlEndMonth').value;
    const checkedCollieries = Array.from(document.querySelectorAll('#mdcwlCollieryCheckboxes input[type=checkbox]:checked')).map(cb => cb.value);
    const consolidate = document.getElementById('mdcwlConsolidateMonth').checked;
    const consolidateFY = document.getElementById('mdcwlConsolidateFY').checked;
    // If both are checked, only use consolidateFY
if (consolidate && consolidateFY) {
    consolidate = false;
}

    // Get selected columns
    let selectedCols = Array.from(document.querySelectorAll('#mdcwlColumnCheckboxes input[type=checkbox]:checked')).map(cb => Number(cb.value));

    // Filter by month range and colliery
    const monthIdx = mdcwlHeaders.indexOf('Month');
    const collieryIdx = mdcwlHeaders.indexOf('Colliery');
    const months = [...new Set(mdcwlData.map(row => row[monthIdx]).filter(Boolean))];
    const startIdx = months.indexOf(startMonth);
    const endIdx = months.indexOf(endMonth);
    const monthRange = months.slice(Math.min(startIdx, endIdx), Math.max(startIdx, endIdx) + 1);

    let filtered = mdcwlData.filter(row =>
        monthRange.includes(row[monthIdx]) &&
        checkedCollieries.includes(row[collieryIdx])
    );

    // Consolidate by FY if checked
    if (consolidateFY) {
        // Group by FY
        const grouped = {};
    filtered.forEach(row => {
        const fy = MDCWLGetFinancialYear(row[monthIdx]);
        if (!grouped[fy]) {
            grouped[fy] = Array(mdcwlHeaders.length).fill('');
            grouped[fy][monthIdx] = fy;
            grouped[fy][collieryIdx] = 'All';
        }
            // Sum all numeric columns except Month and Colliery
            for (let i = 0; i < mdcwlHeaders.length; i++) {
                if (i !== monthIdx && i !== collieryIdx && !isNaN(Number(row[i]))) {
                    grouped[fy][i] = (Number(grouped[fy][i]) || 0) + (Number(row[i]) || 0);
                }
            }
        });
        filtered = Object.values(grouped);
    } else if (consolidate) {
        // Group by Month (existing logic)
        const grouped = {};
    filtered.forEach(row => {
        const month = MDCWLGetMonthYear(row[monthIdx]);
        if (!grouped[month]) {
            grouped[month] = Array(mdcwlHeaders.length).fill('');
            grouped[month][monthIdx] = month;
            grouped[month][collieryIdx] = 'All';
        }
            // Sum all numeric columns except Month and Colliery
            for (let i = 0; i < mdcwlHeaders.length; i++) {
                if (i !== monthIdx && i !== collieryIdx && !isNaN(Number(row[i]))) {
                    grouped[month][i] = (Number(grouped[month][i]) || 0) + (Number(row[i]) || 0);
                }
            }
        });
        filtered = Object.values(grouped);
    }

    // Calculate totals for numeric columns
    let totals = Array(mdcwlHeaders.length).fill('');
    totals[0] = 'TOTAL'; // Put TOTAL in first column (index 0)
    totals[monthIdx] = '';
    totals[collieryIdx] = '';
    filtered.forEach(row => {
        for (let i = 0; i < mdcwlHeaders.length; i++) {
            // Exclude month, colliery, first column (0), column 7, and column 14 from summing
            if (i !== monthIdx && i !== collieryIdx && i !== 0 && i !== 7 && i !== 14 && !isNaN(Number(row[i]))) {
                totals[i] = (Number(totals[i]) || 0) + (Number(row[i]) || 0);
            }
        }
    });

    // Table headers
    let html = `<div class="table-responsive" style="max-height: 70vh; overflow: auto;">
<table class="table table-sm table-bordered table-striped align-middle mdcwl-lifting-data-table">
    <thead class="table-primary">
        <tr>
            ${selectedCols.map((i, idx) => {
                // If consolidating by FY and this is the Month column, show "FY"
                if (consolidateFY && mdcwlHeaders[i] === 'Month') return `<th class="${idx === 0 ? 'sticky-col' : ''}">FY</th>`;
                return `<th class="${idx === 0 ? 'sticky-col' : ''}">${mdcwlHeaders[i]}</th>`;
            }).join('')}
        </tr>
    </thead>
    <tbody>
`;
    if (filtered.length) {
        filtered.forEach(row => {
            html += `<tr>`;
           selectedCols.forEach((i, colIndex) => {
    let val = row[i] || '';
    if (mdcwlHeaders[i] === 'Month') {
    if (consolidate) {
        val = MDCWLGetMonthYear(val);
    } else if (consolidateFY) {
        val = val;
    } else {
        val = MDCWLGetMonthYear(val);
    }
}
    // Always format index 0 as dd-mm-yyyy if not "Month"
    if (i === 0 && mdcwlHeaders[i] !== 'Month') {
        val = parseAndFormatDate(val);
    }
    // Format other date columns
    if ([0, 1,8,9].includes(i)) {
        val = parseAndFormatDate(val);
    }
    // Format columns 12, 15, 16, 17 with 0 decimal places and comma separation
    if ([12, 15, 16, 17].includes(i) && !isNaN(Number(val))) {
        val = Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    // Format numeric values with comma separation for column 5 and columns 10-14 (excluding 12)
    else if ((i === 5 || (i >= 10 && i <= 14 && i !== 12)) && !isNaN(Number(val))) {
        val = Number(val).toLocaleString();
    } else if (!isNaN(Number(val)) && mdcwlHeaders[i] !== 'Colliery' && mdcwlHeaders[i] !== 'Month' && ![0,1,8,9].includes(i)) {
        val = Number(val).toFixed(0);
    }
    const cellClass = colIndex === 0 ? 'sticky-col' : '';
    html += `<td class="${cellClass}">${val}</td>`;
});
            html += `</tr>`;
        });
        // Total Row
        html += `<tr class="total-row-mdcwl-lifting">`;
        selectedCols.forEach((i, colIndex) => {
            let val = '';
            
            // Put "TOTAL" in the first visible column
            if (colIndex === 0) {
                val = 'TOTAL';
            } else {
                val = totals[i];
                // Format columns 12, 15, 16, 17 with 0 decimal places and comma separation
                if ([12, 15, 16, 17].includes(i) && !isNaN(Number(val))) {
                    val = Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                }
                // Format column 5 and columns 10-14 (excluding 12) with comma separation
                else if ((i === 5 || (i >= 10 && i <= 14 && i !== 12)) && !isNaN(Number(val))) {
                    val = Number(val).toLocaleString();
                } else if (!isNaN(Number(val)) && mdcwlHeaders[i] !== 'Colliery' && mdcwlHeaders[i] !== 'Month') {
                    val = Number(val).toFixed(0);
                }
                
                // Hide data for specific columns (1,2,3,4,6,7,8,9,14) if value is 0
                if ([1,2,3,4,6,7,8,9,14].includes(i) && Number(val) === 0) {
                    val = '';
                }
            }
            
            const cellClass = colIndex === 0 ? 'sticky-col' : '';
            // Add vertical lines for column 5 and columns 10-17 in total row with white borders for better contrast
            const borderStyle = (i === 5 || (i >= 10 && i <= 17)) ? 'border-left: 1px solid #1e3d73 !important; border-right: 1px solid #1e3d73 !important;' : '';
            html += `<td class="${cellClass}" style="${borderStyle}">${val !== undefined ? val : ''}</td>`;
        });
        html += `</tr>`;
    } else {
        html += `<tr><td colspan="${selectedCols.length}" class="text-center">No data found.</td></tr>`;
    }
    html += `</tbody></table></div>`;
    
    const tableContainer = document.getElementById('mdcwl-table-container');
    if (tableContainer) {
        tableContainer.innerHTML = `
            <!-- Table Header Card -->
            <div class="pachhwara-pd-card mb-2">
                <div class="pachhwara-pd-section-header d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <h6 class="mb-0"><i class="bi bi-table"></i> Data Table</h6>
                        <span class="badge bg-light text-dark ms-2">${filtered.length} entries</span>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-light" id="mdcwlTableRefreshBtn">
                            <i class="bi bi-arrow-clockwise"></i> Refresh
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Table Outside Card -->
            <div class="mb-3">
                ${html}
            </div>
        `;
        
        // Add event listener for the refresh button in the table header
        const tableRefreshBtn = document.getElementById('mdcwlTableRefreshBtn');
        if (tableRefreshBtn) {
            tableRefreshBtn.addEventListener('click', function() {
                // Save checked columns
                const checkedCols = Array.from(document.querySelectorAll('#mdcwlColumnCheckboxes input[type=checkbox]:checked')).map(cb => Number(cb.value));
                fetchMDCWLData().then(() => {
                    renderMDCWLLiftingFilters();
                    renderMDCWLLiftingColumnFilter();
                    // Restore checked columns
                    checkedCols.forEach(idx => {
                        const cb = document.getElementById(`mdcwlCol${idx}`);
                        if (cb) cb.checked = true;
                    });
                    // Re-apply consolidation logic
                    if (document.getElementById('mdcwlConsolidateMonth').checked) {
                        [1,2,3,4,6,7,8,9].forEach(idx => {
                            const cb = document.getElementById(`mdcwlCol${idx}`);
                            if (cb) cb.checked = false;
                        });
                    }
                    if (document.getElementById('mdcwlConsolidateFY').checked) {
                        [1,2,3,4,6,7,8,9].forEach(idx => {
                            const cb = document.getElementById(`mdcwlCol${idx}`);
                            if (cb) cb.checked = false;
                        });
                    }
                    renderMDCWLLiftingTable();
                });
            });
        }
    }
}



function parseAndFormatDate(val) {
    if (typeof val === "string" && val.startsWith("Date(")) {
        const parts = val.match(/\d+/g);
        if (parts && parts.length >= 3) {
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]) + 1; // JS months are 0-based
            const day = parseInt(parts[2]);
            return `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
        }
    }
    return val;
}

function parseAndFormatDateMonthYear(val) {
    if (typeof val === "string" && val.startsWith("Date(")) {
        const parts = val.match(/\d+/g);
        if (parts && parts.length >= 3) {
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]) + 1; // JS months are 0-based
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${monthNames[month - 1]}-${year}`;
        }
    }
    return val;
}

function getFinancialYear(val) {
    // val is "YYYY-MM" or Date(YYYY,M,D)
    let y, m;
    if (typeof val === "string" && val.startsWith("Date(")) {
        const parts = val.match(/\d+/g);
        if (parts && parts.length >= 2) {
            y = parseInt(parts[0]);
            m = parseInt(parts[1]) + 1;
        }
    } else if (typeof val === "string" && val.includes('-')) {
        [y, m] = val.split('-').map(Number);
    }
    if (!y || !m) return '';
    const fyStart = m >= 4 ? y : y - 1;
    return `${fyStart}-${(fyStart + 1).toString().slice(-2)}`;
}


function MDCWLGetMonthYear(str) {
    // Accepts "YYYY-MM" or "Date(YYYY,M,D)" or "YYYY-M"
    if (typeof str === "string" && str.startsWith("Date(")) {
        const parts = str.match(/\d+/g);
        if (parts && parts.length >= 2) {
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]);
            const date = new Date(year, month, 1);
            return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        }
    } else if (typeof str === "string" && str.includes('-')) {
        const [y, m] = str.split('-');
        if (y && m) {
            const date = new Date(Number(y), Number(m) - 1, 1);
            return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        }
    }
    return str;
}

function MDCWLGetFinancialYear(str) {
    // Accepts "YYYY-MM" or "Date(YYYY,M,D)" or "YYYY-M"
    let y, m;
    if (typeof str === "string" && str.startsWith("Date(")) {
        const parts = str.match(/\d+/g);
        if (parts && parts.length >= 2) {
            y = parseInt(parts[0]);
            m = parseInt(parts[1]) + 1;
        }
    } else if (typeof str === "string" && str.includes('-')) {
        [y, m] = str.split('-').map(Number);
    }
    if (!y || !m) return '';
    const fyStart = m >= 4 ? y : y - 1;
    return `${fyStart}-${(fyStart + 1).toString().slice(-2)}`;
}

// Export Functions for MDCWL Lifting

// Export to PDF function
async function mdcwlExportToPDF() {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        alert('PDF library not loaded. Please refresh the page and try again.');
        return;
    }

    try {
        const table = document.querySelector('.mdcwl-lifting-data-table');
        if (!table) {
            alert('No table found to export.');
            return;
        }

        const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
        
        // Add title
        pdf.setFontSize(16);
        pdf.text('MDCWL Lifting Position Report', 15, 15);
        
        // Add date
        pdf.setFontSize(10);
        pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 25);

        // Get table data
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
        const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr => 
            Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim())
        );

        // Add table to PDF
        pdf.autoTable({
            head: [headers],
            body: rows,
            startY: 35,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [44, 90, 160] }, // Deep blue matching table
            alternateRowStyles: { fillColor: [248, 249, 250] },
            margin: { left: 15, right: 15 }
        });

        pdf.save('MDCWL_Lifting_Report.pdf');
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
    }
}

// Export to JPG function
async function mdcwlExportToJPG() {
    if (!window.html2canvas) {
        alert('Image export library not loaded. Please refresh the page and try again.');
        return;
    }

    try {
        const table = document.querySelector('.mdcwl-lifting-data-table');
        if (!table) {
            alert('No table found to export.');
            return;
        }

        // Create a wrapper div with title
        const wrapper = document.createElement('div');
        wrapper.style.background = 'white';
        wrapper.style.padding = '20px';
        wrapper.style.fontFamily = 'Arial, sans-serif';
        wrapper.style.width = 'fit-content';
        wrapper.style.minWidth = '100%';
        
        const title = document.createElement('h2');
        title.textContent = 'MDCWL Lifting Position Report';
        title.style.color = '#2c5aa0';
        title.style.marginBottom = '10px';
        title.style.textAlign = 'center';
        title.style.fontSize = '24px';
        title.style.fontWeight = 'bold';
        
        const date = document.createElement('p');
        date.textContent = `Generated on: ${new Date().toLocaleDateString()}`;
        date.style.color = '#666';
        date.style.marginBottom = '20px';
        date.style.textAlign = 'center';
        date.style.fontSize = '14px';
        
        // Clone and style the table for export
        const tableClone = table.cloneNode(true);
        tableClone.style.width = '100%';
        tableClone.style.fontSize = '12px';
        tableClone.style.borderCollapse = 'collapse';
        
        wrapper.appendChild(title);
        wrapper.appendChild(date);
        wrapper.appendChild(tableClone);
        
        document.body.appendChild(wrapper);

        const canvas = await html2canvas(wrapper, {
            backgroundColor: 'white',
            scale: 3, // Higher scale for better quality
            useCORS: true,
            allowTaint: false,
            foreignObjectRendering: false,
            logging: false,
            width: wrapper.scrollWidth,
            height: wrapper.scrollHeight
        });

        document.body.removeChild(wrapper);

        // Convert to blob and download with higher quality
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `MDCWL_Lifting_Report_${new Date().toISOString().split('T')[0]}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/jpeg', 0.98); // Higher quality JPEG

    } catch (error) {
        console.error('Error generating JPG:', error);
        alert('Error generating JPG. Please try again.');
    }
}

// Export to Excel function
function mdcwlExportToExcel() {
    if (!window.XLSX) {
        alert('Excel export library not loaded. Please refresh the page and try again.');
        return;
    }

    try {
        const table = document.querySelector('.mdcwl-lifting-data-table');
        if (!table) {
            alert('No table found to export.');
            return;
        }

        // Get table data
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
        const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr => 
            Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim())
        );

        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Create worksheet data
        const wsData = [headers, ...rows];
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Style the header row
        const headerRange = XLSX.utils.decode_range(ws['!ref']);
        for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
            if (!ws[cellAddress]) continue;
            ws[cellAddress].s = {
                fill: { fgColor: { rgb: "2c5aa0" } },
                font: { color: { rgb: "FFFFFF" }, bold: true },
                alignment: { horizontal: "center" }
            };
        }

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, "MDCWL Lifting");

        // Save file
        XLSX.writeFile(wb, 'MDCWL_Lifting_Report.xlsx');

    } catch (error) {
        console.error('Error generating Excel:', error);
        alert('Error generating Excel file. Please try again.');
    }
}