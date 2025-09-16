let mdcwlLoadingHeaders = [];
let mdcwlLoadingData = [];

// Fetch headers from Google Sheets
async function fetchMDCWLLoadingHeaders() {
    const SHEET_ID = '1cFngrabiTY-RMGDrw2eRn7Nn8LEY0IZyD0-QJT7UqTI';
    const SHEET_NAME = 'MDCWL-Loading';
    const RANGE = 'A1:Z2'; // Fetch both header rows
    const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&range=${RANGE}`;
    const res = await fetch(SHEET_URL);
    const text = await res.text();
    const json = JSON.parse(text.substr(47).slice(0, -2));
    const table = json.table;
    
    // Extract both rows
    const row1 = table.rows[0] ? table.rows[0].c.map(cell => cell ? cell.v : "") : [];
    const row2 = table.rows[1] ? table.rows[1].c.map(cell => cell ? cell.v : "") : [];
    
    // Build headers automatically
    mdcwlLoadingHeaders = ['Date']; // First column is always Date
    
    // For remaining columns, combine plant name with parameter
    for (let i = 1; i < Math.max(row1.length, row2.length); i++) {
        const plantName = row1[i] || ''; // Current cell
        const parameter = row2[i] || ''; // Parameter (Rake, Quantity, etc.)
        
        if (parameter) {
            // If we have a parameter, use it with plant name (if available)
            if (plantName) {
                mdcwlLoadingHeaders.push(`${plantName} ${parameter}`);
            } else {
                // If no plant name in current cell, find the most recent plant name
                let lastPlantName = '';
                for (let j = i - 1; j >= 1; j--) {
                    if (row1[j] && row1[j].trim() !== '') {
                        lastPlantName = row1[j];
                        break;
                    }
                }
                mdcwlLoadingHeaders.push(lastPlantName ? `${lastPlantName} ${parameter}` : parameter);
            }
        } else {
            // If no parameter, just use plant name or create generic column
            mdcwlLoadingHeaders.push(plantName || `Column${i}`);
        }
    }
    
    console.log("Auto-generated Headers:", mdcwlLoadingHeaders);
}

// Fetch data from Google Sheets
async function fetchMDCWLLoadingData() {
    const SHEET_ID = '1cFngrabiTY-RMGDrw2eRn7Nn8LEY0IZyD0-QJT7UqTI';
    const SHEET_NAME = 'MDCWL-Loading';
    const RANGE = 'A3:Z1000'; // Start from row 3 to skip both header rows
    const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&range=${RANGE}`;
    const res = await fetch(SHEET_URL);
    const text = await res.text();
    const json = JSON.parse(text.substr(47).slice(0, -2));
    const table = json.table;
    
    console.log("Raw table rows from Google Sheets:", table.rows);
    
    // More permissive filtering - only skip completely empty rows
    mdcwlLoadingData = table.rows
        .filter(row => {
            // Check if row exists and has any data in any cell
            if (!row || !row.c) return false;
            
            // Check if at least one cell has data
            return row.c.some(cell => cell && cell.v !== null && cell.v !== undefined && cell.v !== '');
        })
        .map(row => row.c.map(cell => cell ? cell.v : ""));
    
    console.log("Loaded", mdcwlLoadingData.length, "data rows");
}

function showMDCWLLoadingReport() {
    document.getElementById('main-content').innerHTML = `
        <!-- Main Title Card -->
        <div class="pachhwara-pd-card mb-2">
            <div class="pachhwara-pd-section-header">
                <h4 class="mb-0"><i class="bi bi-truck"></i> MDCWL Loading Position</h4>
            </div>
        </div>

        <!-- Data Table Container -->
        <div id="mdcwl-loading-table-container"></div>

        <!-- Export Toggle Button -->
        <button class="btn btn-success export-toggle-btn" id="MDCWLLoadingExportToggle">
            <i class="bi bi-box-arrow-up"></i>
        </button>

        <!-- Export Sidebar -->
        <div class="export-sidebar" id="MDCWLLoadingExportSidebar">
            <button class="btn export-btn pdf-btn" id="MDCWLLoadingExportPDFBtn" title="Export to PDF">
                <i class="bi bi-file-earmark-pdf"></i>
            </button>
            <button class="btn export-btn excel-btn" id="MDCWLLoadingExportExcelBtn" title="Export to Excel">
                <i class="bi bi-file-earmark-excel"></i>
            </button>
            <button class="btn export-btn jpg-btn" id="MDCWLLoadingExportImageBtn" title="Export to JPG">
                <i class="bi bi-file-earmark-image"></i>
            </button>
            <button class="btn export-btn print-btn" id="MDCWLLoadingPrintReportBtn" title="Print">
                <i class="bi bi-printer"></i>
            </button>
        </div>

        <!-- Filter Toggle Button -->
        <button class="btn btn-primary filter-toggle-btn" id="MDCWLLoadingFilterToggle">
            <i class="bi bi-funnel"></i>
        </button>

        <!-- Filter Sidebar -->
        <div class="filter-sidebar" id="MDCWLLoadingFilterSidebar">
            <button class="close-btn" id="MDCWLLoadingCloseSidebar">&times;</button>
            <h5><i class="bi bi-funnel"></i> Filters & Settings</h5>
            <hr>
            
            <!-- Date Range -->
            <div class="mb-3">
                <label class="form-label"><strong>Date Range</strong></label>
                <div class="mb-2">
                    <label class="form-label small">Start Date</label>
                    <input type="date" id="mdcwlStartDate" class="form-control form-control-sm">
                </div>
                <div class="mb-2">
                    <label class="form-label small">End Date</label>
                    <input type="date" id="mdcwlEndDate" class="form-control form-control-sm">
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

            <button class="btn btn-primary w-100" id="MDCWLLoadingApplyFilters">
                <i class="bi bi-check-circle"></i> Apply Filters
            </button>
        </div>
    `;
    fetchMDCWLLoadingHeaders().then(() => {
        fetchMDCWLLoadingData().then(() => {
            renderMDCWLLoadingFilters();
            renderMDCWLLoadingTable();
            setupMDCWLLoadingListeners();
            MDCWLLoadingSetupSidebar();
            MDCWLLoadingSetupExportSidebar();
        });
    });
}

// Toggle card visibility function
function mdcwlLoadingToggleCard(bodyId, chevronId) {
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

function renderMDCWLLoadingFilters() {
    // Get unique dates from the data (first column is always date)
    const dates = [...new Set(mdcwlLoadingData.map(row => row[0]).filter(Boolean))];
    dates.sort((a, b) => parseDate(a) - parseDate(b));
    
    if (dates.length > 0) {
        const startDate = document.getElementById('mdcwlStartDate');
        const endDate = document.getElementById('mdcwlEndDate');
        
        // Get first and last dates
        const firstDate = parseDate(dates[0]);
        const lastDate = parseDate(dates[dates.length - 1]);
        
        // Simple date formatting to avoid timezone issues
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        const firstDateStr = formatDate(firstDate);
        const lastDateStr = formatDate(lastDate);
        
        // Set the date inputs
        startDate.value = firstDateStr;
        endDate.value = lastDateStr;
        startDate.min = firstDateStr;
        startDate.max = lastDateStr;
        endDate.min = firstDateStr;
        endDate.max = lastDateStr;
    }
}

function setupMDCWLLoadingListeners() {
    document.getElementById('mdcwlStartDate').addEventListener('change', renderMDCWLLoadingTable);
    document.getElementById('mdcwlEndDate').addEventListener('change', renderMDCWLLoadingTable);
    document.getElementById('mdcwlConsolidateMonth').addEventListener('change', function() {
        if (this.checked) {
            document.getElementById('mdcwlConsolidateFY').checked = false;
        }
        renderMDCWLLoadingTable();
    });
    document.getElementById('mdcwlConsolidateFY').addEventListener('change', function() {
        if (this.checked) {
            document.getElementById('mdcwlConsolidateMonth').checked = false;
        }
        renderMDCWLLoadingTable();
    });
    
    // Apply filters button
    document.getElementById('MDCWLLoadingApplyFilters').addEventListener('click', function() {
        renderMDCWLLoadingTable();
    });
}

// Sidebar setup function
function MDCWLLoadingSetupSidebar() {
    const sidebar = document.getElementById('MDCWLLoadingFilterSidebar');
    const toggleBtn = document.getElementById('MDCWLLoadingFilterToggle');
    const closeBtn = document.getElementById('MDCWLLoadingCloseSidebar');

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
function MDCWLLoadingSetupExportSidebar() {
    const exportSidebar = document.getElementById('MDCWLLoadingExportSidebar');
    const exportToggle = document.getElementById('MDCWLLoadingExportToggle');

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
    document.getElementById('MDCWLLoadingExportPDFBtn').addEventListener('click', mdcwlLoadingExportToPDF);
    document.getElementById('MDCWLLoadingExportExcelBtn').addEventListener('click', mdcwlLoadingExportToExcel);
    document.getElementById('MDCWLLoadingExportImageBtn').addEventListener('click', mdcwlLoadingExportToJPG);
    document.getElementById('MDCWLLoadingPrintReportBtn').addEventListener('click', () => window.print());
}

function parseDate(dateStr) {
    // Handle Date(YYYY,M,D) format
    if (typeof dateStr === "string" && dateStr.startsWith("Date(")) {
        const parts = dateStr.match(/\d+/g);
        if (parts && parts.length >= 3) {
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]); // Google Sheets months are 0-based
            const day = parseInt(parts[2]);
            return new Date(year, month, day);
        }
    }
    // Handle dd/mm/yyyy format
    if (typeof dateStr === "string" && dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
    }
    // Handle other formats
    return new Date(dateStr);
}

function getMonthYear(dateStr) {
    const d = parseDate(dateStr);
    return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function getFinancialYearFromDate(dateStr) {
    // Handle Date(YYYY,M,D) format from Google Sheets
    let year, month;
    if (typeof dateStr === "string" && dateStr.startsWith("Date(")) {
        const parts = dateStr.match(/\d+/g);
        if (parts && parts.length >= 3) {
            year = parseInt(parts[0]);
            month = parseInt(parts[1]) + 1; // Google Sheets months are 0-based
        }
    } else {
        const d = parseDate(dateStr);
        year = d.getFullYear();
        month = d.getMonth() + 1; // JS months are 0-based
    }
    
    if (!year || !month) return '';
    const fyStart = month >= 4 ? year : year - 1;
    return `${fyStart}-${(fyStart + 1).toString().slice(-2)}`;
}

function renderMDCWLLoadingTable() {
    const startDateInput = document.getElementById('mdcwlStartDate').value;
    const endDateInput = document.getElementById('mdcwlEndDate').value;
    const consolidate = document.getElementById('mdcwlConsolidateMonth').checked;
    const consolidateFY = document.getElementById('mdcwlConsolidateFY').checked;

    // Convert date picker values to Date objects for comparison (ensure local timezone)
    const startDateObj = new Date(startDateInput + 'T00:00:00');
    const endDateObj = new Date(endDateInput + 'T23:59:59');

    // Find date column (always first column)
    const dateIdx = 0;

    // Filter by date range
    let filtered = mdcwlLoadingData.filter(row => {
        const rowDate = parseDate(row[dateIdx]);
        return rowDate >= startDateObj && rowDate <= endDateObj;
    });

    // Consolidate by FY if checked
    if (consolidateFY) {
        const grouped = {};
        filtered.forEach(row => {
            const fyKey = getFinancialYearFromDate(row[dateIdx]);
            if (!grouped[fyKey]) {
                grouped[fyKey] = Array(mdcwlLoadingHeaders.length).fill('');
                grouped[fyKey][dateIdx] = fyKey;
            }
            // Sum all numeric columns except the date column
            for (let i = 1; i < mdcwlLoadingHeaders.length; i++) {
                const value = Number(row[i]) || 0;
                grouped[fyKey][i] = (Number(grouped[fyKey][i]) || 0) + value;
            }
        });
        filtered = Object.values(grouped);
    } else if (consolidate) {
        // Consolidate by month
        const grouped = {};
        filtered.forEach(row => {
            const monthKey = getMonthYearFromDate(row[dateIdx]);
            if (!grouped[monthKey]) {
                grouped[monthKey] = Array(mdcwlLoadingHeaders.length).fill('');
                grouped[monthKey][dateIdx] = monthKey;
            }
            // Sum all numeric columns except the date column
            for (let i = 1; i < mdcwlLoadingHeaders.length; i++) {
                const value = Number(row[i]) || 0;
                grouped[monthKey][i] = (Number(grouped[monthKey][i]) || 0) + value;
            }
        });
        filtered = Object.values(grouped);
    }

    // Calculate totals for all numeric columns
    const columnTotals = Array(mdcwlLoadingHeaders.length).fill(0);
    filtered.forEach(row => {
        for (let i = 1; i < mdcwlLoadingHeaders.length; i++) {
            columnTotals[i] += Number(row[i]) || 0;
        }
    });

    // Create table HTML
    let html = `<div class="table-responsive" style="max-height: 70vh; overflow: auto;">
<table class="table table-sm table-bordered table-striped align-middle mdcwl-loading-data-table">
        <thead class="table-primary">
            <tr>
                ${mdcwlLoadingHeaders.map((header, index) => {
                    if (consolidateFY && index === 0) {
                        return `<th class="sticky-col">FY</th>`;
                    } else if (consolidate && index === 0) {
                        return `<th class="sticky-col">Month-Year</th>`;
                    }
                    return `<th class="${index === 0 ? 'sticky-col' : ''}">${header}</th>`;
                }).join('')}
            </tr>
        </thead>
        <tbody>
    `;
    
    if (filtered.length) {
        // Data rows
        filtered.forEach(row => {
            html += `<tr>`;
            mdcwlLoadingHeaders.forEach((header, idx) => {
                let val = row[idx] || '';
                if (idx === 0) {
                    // Date column
                    if (consolidateFY || consolidate) {
                        val = val; // Already formatted
                    } else {
                        val = formatDateDMY(val);
                    }
                } else {
                    // Numeric columns
                    val = Number(val) || 0;
                }
                const cellClass = idx === 0 ? 'sticky-col' : '';
                html += `<td class="${cellClass}">${val}</td>`;
            });
            html += `</tr>`;
        });
        
        // Total row
        html += `<tr class="total-row table-primary" style="font-weight: bold;">`;
        mdcwlLoadingHeaders.forEach((header, idx) => {
            let val = idx === 0 ? 'TOTAL' : columnTotals[idx];
            const cellClass = idx === 0 ? 'sticky-col' : '';
            html += `<th class="${cellClass}" style="font-weight: bold;">${val}</th>`;
        });
        html += `</tr>`;
    } else {
        html += `<tr><td colspan="${mdcwlLoadingHeaders.length}" class="text-center">No data found.</td></tr>`;
    }
    
    html += `</tbody></table></div>`;
    
    // Render the table
    const tableContainer = document.getElementById('mdcwl-loading-table-container');
    if (tableContainer) {
        tableContainer.innerHTML = `
            <div class="pachhwara-pd-card mb-2">
                <div class="pachhwara-pd-section-header d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <h6 class="mb-0"><i class="bi bi-table"></i>Loading Position Data</h6>
                        <span class="badge bg-light text-dark ms-2">${filtered.length} entries</span>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-light" id="mdcwlLoadingTableRefreshBtn">
                            <i class="bi bi-arrow-clockwise"></i> Refresh
                        </button>
                    </div>
                </div>
            </div>
            <div class="mb-3">${html}</div>
        `;
        
        // Add refresh button functionality
        const tableRefreshBtn = document.getElementById('mdcwlLoadingTableRefreshBtn');
        if (tableRefreshBtn) {
            tableRefreshBtn.addEventListener('click', function() {
                fetchMDCWLLoadingData().then(() => {
                    renderMDCWLLoadingFilters();
                    renderMDCWLLoadingTable();
                });
            });
        }
    }
}

function getMonthYearFromDate(dateStr) {
    // Handle Date(YYYY,M,D) format from Google Sheets
    if (typeof dateStr === "string" && dateStr.startsWith("Date(")) {
        const parts = dateStr.match(/\d+/g);
        if (parts && parts.length >= 3) {
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]); // Google Sheets months are 0-based
            const date = new Date(year, month, 1);
            return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        }
    }
    // Handle other formats
    const d = parseDate(dateStr);
    return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function formatDateDMY(dateStr) {
    // Handle Date(YYYY,M,D) format from Google Sheets
    if (typeof dateStr === "string" && dateStr.startsWith("Date(")) {
        const parts = dateStr.match(/\d+/g);
        if (parts && parts.length >= 3) {
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]) + 1; // Google Sheets months are 0-based, so add 1
            const day = parseInt(parts[2]);
            return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
        }
    }
    // Handle dd/mm/yyyy format (already formatted)
    if (typeof dateStr === "string" && dateStr.includes('/')) {
        return dateStr;
    }
    // Handle other date formats
    return dateStr;
}

// Export Functions for MDCWL Loading

// Export to PDF function
async function mdcwlLoadingExportToPDF() {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        alert('PDF library not loaded. Please refresh the page and try again.');
        return;
    }

    try {
        const table = document.querySelector('.mdcwl-loading-data-table');
        if (!table) {
            alert('No table found to export.');
            return;
        }

        const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
        
        // Add title
        pdf.setFontSize(16);
        pdf.text('MDCWL Loading Position Report', 15, 15);
        
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
            headStyles: { fillColor: [40, 167, 69] }, // Green matching table
            alternateRowStyles: { fillColor: [248, 249, 250] },
            margin: { left: 15, right: 15 }
        });

        pdf.save('MDCWL_Loading_Report.pdf');
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
    }
}

// Export to JPG function
async function mdcwlLoadingExportToJPG() {
    if (!window.html2canvas) {
        alert('Image export library not loaded. Please refresh the page and try again.');
        return;
    }

    try {
        const table = document.querySelector('.mdcwl-loading-data-table');
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
        title.textContent = 'MDCWL Loading Position Report';
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
            a.download = `MDCWL_Loading_Report_${new Date().toISOString().split('T')[0]}.jpg`;
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
function mdcwlLoadingExportToExcel() {
    if (!window.XLSX) {
        alert('Excel export library not loaded. Please refresh the page and try again.');
        return;
    }

    try {
        const table = document.querySelector('.mdcwl-loading-data-table');
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
                fill: { fgColor: { rgb: "28a745" } },
                font: { color: { rgb: "FFFFFF" }, bold: true },
                alignment: { horizontal: "center" }
            };
        }

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, "MDCWL Loading");

        // Save file
        XLSX.writeFile(wb, 'MDCWL_Loading_Report.xlsx');

    } catch (error) {
        console.error('Error generating Excel:', error);
        alert('Error generating Excel file. Please try again.');
    }
}