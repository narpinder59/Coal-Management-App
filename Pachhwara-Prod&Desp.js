// --- Chart Rendering and Export Logic ---
let PachhwaraPDChart1Instance = null;
let PachhwaraPDChart2Instance = null;

function PachhwaraPDRenderCharts() {
    // Prepare data for Chart 1: Pit Head Opening Stock & Railways Siding Opening Stock
    // Chart 1: X-axis = period, Y-axis = Pit Head Opening Stock (col 6), Railways Siding Opening Stock (col 7)
    let labels = [];
    let pitHeadData = [];
    let sidingData = [];
    let filtered = PachhwaraPDData.filter(row => {
        const d = PachhwaraPDParseDMY(row[0]);
        const startDate = new Date(document.getElementById('PachhwaraPDStartDate').value);
        const endDate = new Date(document.getElementById('PachhwaraPDEndDate').value);
        d.setHours(0,0,0,0);
        startDate.setHours(0,0,0,0);
        endDate.setHours(0,0,0,0);
        return d >= startDate && d <= endDate;
    });
    filtered.forEach(row => {
        labels.push(PachhwaraPDFormatDate(row[0]));
        pitHeadData.push(Number(row[1]) || 0); // Pit Head Opening Stock
        sidingData.push(Number(row[13]) || 0); // Railways Siding Opening Stock
    });

    // Reverse the arrays to show latest dates on the right
    labels.reverse();
    pitHeadData.reverse();
    sidingData.reverse();

    // Calculate Y-axis range for Chart 1
    const chart1AllData = [...pitHeadData, ...sidingData];
    const chart1Min = Math.min(...chart1AllData);
    const chart1Max = Math.max(...chart1AllData);
    const chart1Padding = (chart1Max - chart1Min) * 0.1;
    const chart1YMin = Math.max(0, chart1Min - chart1Padding);
    const chart1YMax = chart1Max + chart1Padding;

    // Chart 1 rendering
    const ctx1 = document.getElementById('PachhwaraPDChart1').getContext('2d');
    if (PachhwaraPDChart1Instance) PachhwaraPDChart1Instance.destroy();
    PachhwaraPDChart1Instance = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Pit Head Opening Stock',
                    data: pitHeadData,
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0,123,255,0.1)',
                    fill: false,
                    tension: 0.2,
                },
                {
                    label: 'Railways Siding Opening Stock',
                    data: sidingData,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40,167,69,0.1)',
                    fill: false,
                    tension: 0.2,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 8,
                        font: {
                            size: window.innerWidth < 768 ? 10 : 12
                        }
                    }
                },
                title: { display: false },
                tooltip: { mode: 'index', intersect: false }
            },
            interaction: { mode: 'nearest', axis: 'x', intersect: false },
            scales: {
                x: { 
                    title: { 
                        display: true, 
                        text: 'Period',
                        font: {
                            size: window.innerWidth < 768 ? 10 : 12
                        }
                    },
                    ticks: {
                        maxRotation: window.innerWidth < 768 ? 90 : 45,
                        font: {
                            size: window.innerWidth < 768 ? 8 : 10
                        }
                    }
                },
                y: { 
                    title: { 
                        display: true, 
                        text: 'Stock (Tonnes)',
                        font: {
                            size: window.innerWidth < 768 ? 10 : 12
                        }
                    },
                    position: 'left',
                    min: chart1YMin,
                    max: chart1YMax,
                    ticks: {
                        font: {
                            size: window.innerWidth < 768 ? 8 : 10
                        }
                    }
                },
                yRight: {
                    type: 'linear',
                    position: 'right',
                    title: { 
                        display: true, 
                        text: 'Stock (Tonnes)',
                        font: {
                            size: window.innerWidth < 768 ? 10 : 12
                        }
                    },
                    grid: { drawOnChartArea: false },
                    min: chart1YMin,
                    max: chart1YMax,
                    ticks: {
                        font: {
                            size: window.innerWidth < 768 ? 8 : 10
                        }
                    },
                    display: true
                }
            }
        }
    });

    // Prepare data for Chart 2: Production & OB
    // Chart 2: X-axis = period, Y-axis = Actual Production (col 2), OB Actual Production (col 14), Production Target (col 3), OB Production Target (col 15)
    // Also show % for Actual Production and OB Actual Production
    let prodData = [];
    let prodTargetData = [];
    let prodPercentData = [];
    let obData = [];
    let obTargetData = [];
    let obPercentData = [];
    labels = [];
    filtered.forEach(row => {
        labels.push(PachhwaraPDFormatDate(row[0]));
        let actualProd = Number(row[3]) || 0;
        let prodTarget = Number(row[2]) || 0;
        let obActual = Number(row[10]) || 0;
        let obTarget = Number(row[9]) || 0;
        prodData.push(actualProd);
        prodTargetData.push(prodTarget);
        prodPercentData.push(prodTarget ? ((actualProd / prodTarget) * 100).toFixed(2) : null);
        obData.push(obActual);
        obTargetData.push(obTarget);
        obPercentData.push(obTarget ? ((obActual / obTarget) * 100).toFixed(2) : null);
    });

    // Reverse the arrays to show latest dates on the right
    labels.reverse();
    prodData.reverse();
    prodTargetData.reverse();
    prodPercentData.reverse();
    obData.reverse();
    obTargetData.reverse();
    obPercentData.reverse();

    // Calculate Y-axis range for Chart 2 (for Tonnes data only)
    const chart2TonnesData = [...prodData, ...prodTargetData, ...obData, ...obTargetData];
    const chart2Min = Math.min(...chart2TonnesData);
    const chart2Max = Math.max(...chart2TonnesData);
    const chart2Padding = (chart2Max - chart2Min) * 0.1;
    const chart2YMin = Math.max(0, chart2Min - chart2Padding);
    const chart2YMax = chart2Max + chart2Padding;

    // Chart 2 rendering
    const ctx2 = document.getElementById('PachhwaraPDChart2').getContext('2d');
    if (PachhwaraPDChart2Instance) PachhwaraPDChart2Instance.destroy();
    PachhwaraPDChart2Instance = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Actual Production',
                    data: prodData,
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220,53,69,0.1)',
                    fill: false,
                    tension: 0.2,
                },
                {
                    label: 'Production Target',
                    data: prodTargetData,
                    borderColor: '#ffc107',
                    backgroundColor: 'rgba(255,193,7,0.1)',
                    borderDash: [5,5],
                    fill: false,
                    tension: 0.2,
                },
                {
                    label: 'Actual Production (%)',
                    data: prodPercentData,
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0,123,255,0.1)',
                    fill: false,
                    tension: 0.2,
                    yAxisID: 'yPercent',
                },
                {
                    label: 'OB Actual Production',
                    data: obData,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40,167,69,0.1)',
                    fill: false,
                    tension: 0.2,
                },
                {
                    label: 'OB Production Target',
                    data: obTargetData,
                    borderColor: '#6f42c1',
                    backgroundColor: 'rgba(111,66,193,0.1)',
                    borderDash: [5,5],
                    fill: false,
                    tension: 0.2,
                },
                {
                    label: 'OB Actual Production (%)',
                    data: obPercentData,
                    borderColor: '#17a2b8',
                    backgroundColor: 'rgba(23,162,184,0.1)',
                    fill: false,
                    tension: 0.2,
                    yAxisID: 'yPercent',
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 8,
                        font: {
                            size: window.innerWidth < 768 ? 10 : 12
                        }
                    }
                },
                title: { display: false },
                tooltip: { mode: 'index', intersect: false }
            },
            interaction: { mode: 'nearest', axis: 'x', intersect: false },
            scales: {
                x: { 
                    title: { 
                        display: true, 
                        text: 'Period',
                        font: {
                            size: window.innerWidth < 768 ? 10 : 12
                        }
                    },
                    ticks: {
                        maxRotation: window.innerWidth < 768 ? 90 : 45,
                        font: {
                            size: window.innerWidth < 768 ? 8 : 10
                        }
                    }
                },
                y: { 
                    title: { 
                        display: true, 
                        text: 'Tonnes',
                        font: {
                            size: window.innerWidth < 768 ? 10 : 12
                        }
                    },
                    position: 'left',
                    min: chart2YMin,
                    max: chart2YMax,
                    ticks: {
                        font: {
                            size: window.innerWidth < 768 ? 8 : 10
                        }
                    }
                },
                yRight: {
                    type: 'linear',
                    position: 'right',
                    title: { 
                        display: true, 
                        text: 'Tonnes',
                        font: {
                            size: window.innerWidth < 768 ? 10 : 12
                        }
                    },
                    grid: { drawOnChartArea: false },
                    min: chart2YMin,
                    max: chart2YMax,
                    ticks: {
                        font: {
                            size: window.innerWidth < 768 ? 8 : 10
                        }
                    },
                    display: true
                },
                yPercent: {
                    position: 'right',
                    title: { 
                        display: true, 
                        text: '% Achievement',
                        font: {
                            size: window.innerWidth < 768 ? 10 : 12
                        }
                    },
                    grid: { drawOnChartArea: false },
                    min: 0,
                    max: 120,
                    ticks: {
                        font: {
                            size: window.innerWidth < 768 ? 8 : 10
                        }
                    }
                }
            }
        }
    });
}

// Chart Export/Print Functions
function PachhwaraPDChartExportToPDF(chartId, title) {
    if (typeof window.jspdf === 'undefined') {
        alert('PDF export library not loaded. Please ensure jsPDF is included.');
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4');
    const canvas = document.getElementById(chartId);
    doc.setFontSize(16);
    doc.text(title, 20, 20);
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    doc.addImage(imgData, 'JPEG', 20, 30, 250, 80);
    doc.save(`${title.replace(/\s+/g,'_')}_${new Date().toISOString().split('T')[0]}.pdf`);
}

function PachhwaraPDChartExportToJPG(chartId, title) {
    try {
        const canvas = document.getElementById(chartId);
        if (!canvas) {
            alert('Chart not found for export.');
            return;
        }

        // Get the chart instance to temporarily increase resolution
        const chartInstance = chartId === 'PachhwaraPDChart1' ? PachhwaraPDChart1Instance : PachhwaraPDChart2Instance;
        
        if (!chartInstance) {
            alert('Chart instance not found for export.');
            return;
        }

        // Store original dimensions
        const originalWidth = canvas.width;
        const originalHeight = canvas.height;
        const originalStyle = {
            width: canvas.style.width,
            height: canvas.style.height
        };

        // Temporarily increase canvas resolution for higher quality export
        const scaleFactor = 3; // Increase resolution by 3x
        canvas.width = originalWidth * scaleFactor;
        canvas.height = originalHeight * scaleFactor;
        canvas.style.width = originalStyle.width;
        canvas.style.height = originalStyle.height;

        // Get canvas context and scale it
        const ctx = canvas.getContext('2d');
        ctx.scale(scaleFactor, scaleFactor);

        // Re-render the chart at higher resolution
        chartInstance.resize();
        chartInstance.render();

        // Wait a moment for the chart to fully render
        setTimeout(() => {
            // Export the high-resolution chart
            const link = document.createElement('a');
            link.download = `${title.replace(/\s+/g,'_')}_${new Date().toISOString().split('T')[0]}.jpg`;
            link.href = canvas.toDataURL('image/jpeg', 0.98); // Higher quality JPEG
            link.click();

            // Restore original canvas dimensions
            canvas.width = originalWidth;
            canvas.height = originalHeight;
            canvas.style.width = originalStyle.width;
            canvas.style.height = originalStyle.height;

            // Reset context and re-render at original size
            const newCtx = canvas.getContext('2d');
            newCtx.scale(1, 1);
            chartInstance.resize();
            chartInstance.render();
        }, 100);

    } catch (error) {
        console.error('Error generating high-quality chart image:', error);
        alert('Error generating chart image.');
    }
}

function PachhwaraPDSetupChartExportListeners() {
    document.getElementById('PachhwaraPDChart1PrintPDF').onclick = function() {
        PachhwaraPDChartExportToPDF('PachhwaraPDChart1', 'Pit Head & Railways Siding Opening Stock');
    };
    document.getElementById('PachhwaraPDChart1ExportJPG').onclick = function() {
        PachhwaraPDChartExportToJPG('PachhwaraPDChart1', 'Pit Head & Railways Siding Opening Stock');
    };
    document.getElementById('PachhwaraPDChart2PrintPDF').onclick = function() {
        PachhwaraPDChartExportToPDF('PachhwaraPDChart2', 'Production & OB Analysis');
    };
    document.getElementById('PachhwaraPDChart2ExportJPG').onclick = function() {
        PachhwaraPDChartExportToJPG('PachhwaraPDChart2', 'Production & OB Analysis');
    };
}
let PachhwaraPDData = [];
let PachhwaraPDHeaders = [];
let PachhwaraPDSortState = {
    column: -1,
    direction: 'none' // 'none', 'asc', 'desc'
};

// Fetch headers from Google Sheets
async function fetchPachhwaraPDHeaders() {
    const SHEET_ID = '1cFngrabiTY-RMGDrw2eRn7Nn8LEY0IZyD0-QJT7UqTI';
    const SHEET_NAME = 'Pachhwara-Prod&Desp';
    const RANGE = 'A1:W1';
    const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&range=${RANGE}`;

    const res = await fetch(SHEET_URL);
    const text = await res.text();
    const json = JSON.parse(text.substr(47).slice(0, -2));
    const table = json.table;
    PachhwaraPDHeaders = table.rows[0].c.map(cell => cell ? cell.v : "");
}
// Fetch data from Google Sheets
async function fetchPachhwaraPDData() {
    const SHEET_ID = '1cFngrabiTY-RMGDrw2eRn7Nn8LEY0IZyD0-QJT7UqTI';
    const SHEET_NAME = 'Pachhwara-Prod&Desp';
    const RANGE = 'A3:W'; // Start from row 3 to skip headers
    // Adjust range as needed, e.g., A3:W for all rows
    const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&range=${RANGE}`;

    const res = await fetch(SHEET_URL);
    const text = await res.text();
    const json = JSON.parse(text.substr(47).slice(0, -2));
    const table = json.table;
    PachhwaraPDData = table.rows
        .filter(row => row.c && row.c[0] && row.c[0].v)
        .map(row => row.c.map(cell => cell ? cell.v : ""));
}


function showPachhwaraPDReport() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const startDate = `01/04/${currentYear}`;
    const yesterday = new Date(today.getTime() - 86400000);
    const endDate = `${String(yesterday.getDate()).padStart(2, '0')}/${String(yesterday.getMonth() + 1).padStart(2, '0')}/${yesterday.getFullYear()}`;

    document.getElementById('main-content').innerHTML = `
        <!-- Main Title Card -->
        <div class="pachhwara-pd-card mb-2">
            <div class="pachhwara-pd-section-header">
                <h4 class="mb-0"><i class="bi bi-truck"></i> Pachhwara Production & Despatch</h4>
            </div>
        </div>

        <!-- Data Table Card -->
        <div id="PachhwaraPD-table-container"></div>

        <!-- Chart 1 Card: Pit Head & Railways Siding Opening Stock -->
        <div class="pachhwara-pd-card mb-3">
            <div class="pachhwara-pd-section-header d-flex justify-content-between align-items-center expandable" style="cursor: pointer;" onclick="PachhwaraPDToggleCard('PachhwaraPDChart1Body', 'PachhwaraPDChart1Chevron')">
                <h6 class="mb-0"><i class="bi bi-bar-chart-line"></i> Pit Head & Railways Siding Opening Stock</h6>
                <i class="bi bi-chevron-down" id="PachhwaraPDChart1Chevron"></i>
            </div>
            <div class="card-body" id="PachhwaraPDChart1Body" style="display: none;">
                <div class="chart-container mb-3" style="position: relative; height: 300px; width: 100%;">
                    <canvas id="PachhwaraPDChart1"></canvas>
                </div>
                <div class="d-flex gap-2 flex-wrap">
                    <button type="button" class="btn btn-outline-success btn-sm" id="PachhwaraPDChart1PrintPDF"><i class="bi bi-file-pdf"></i> PDF</button>
                    <button type="button" class="btn btn-outline-primary btn-sm" id="PachhwaraPDChart1ExportJPG"><i class="bi bi-image"></i> JPG</button>
                </div>
            </div>
        </div>

        <!-- Chart 2 Card: Production & OB -->
        <div class="pachhwara-pd-card mb-3">
            <div class="pachhwara-pd-section-header d-flex justify-content-between align-items-center expandable" style="cursor: pointer;" onclick="PachhwaraPDToggleCard('PachhwaraPDChart2Body', 'PachhwaraPDChart2Chevron')">
                <h6 class="mb-0"><i class="bi bi-bar-chart-line"></i> Production & OB Analysis</h6>
                <i class="bi bi-chevron-down" id="PachhwaraPDChart2Chevron"></i>
            </div>
            <div class="card-body" id="PachhwaraPDChart2Body" style="display: none;">
                <div class="chart-container mb-3" style="position: relative; height: 300px; width: 100%;">
                    <canvas id="PachhwaraPDChart2"></canvas>
                </div>
                <div class="d-flex gap-2 flex-wrap">
                    <button type="button" class="btn btn-outline-success btn-sm" id="PachhwaraPDChart2PrintPDF"><i class="bi bi-file-pdf"></i> PDF</button>
                    <button type="button" class="btn btn-outline-primary btn-sm" id="PachhwaraPDChart2ExportJPG"><i class="bi bi-image"></i> JPG</button>
                </div>
            </div>
        </div>

        <!-- Export Toggle Button -->
        <button class="btn btn-success export-toggle-btn" id="PachhwaraPDExportToggle">
            <i class="bi bi-box-arrow-up"></i>
        </button>

        <!-- Export Sidebar -->
        <div class="export-sidebar" id="PachhwaraPDExportSidebar">
            <button class="btn export-btn pdf-btn" id="PachhwaraPDExportPDFBtn" title="Export to PDF">
                <i class="bi bi-file-earmark-pdf"></i>
            </button>
            <button class="btn export-btn excel-btn" id="PachhwaraPDExportExcelBtn" title="Export to Excel">
                <i class="bi bi-file-earmark-excel"></i>
            </button>
            <button class="btn export-btn jpg-btn" id="PachhwaraPDExportImageBtn" title="Export to JPG">
                <i class="bi bi-file-earmark-image"></i>
            </button>
            <button class="btn export-btn print-btn" id="PachhwaraPDPrintReportBtn" title="Print">
                <i class="bi bi-printer"></i>
            </button>
        </div>

        <!-- Filter Toggle Button -->
        <button class="btn btn-primary filter-toggle-btn" id="PachhwaraPDFilterToggle">
            <i class="bi bi-funnel"></i>
        </button>

        <!-- Filter Sidebar -->
        <div class="filter-sidebar" id="PachhwaraPDFilterSidebar">
            <button class="close-btn" id="PachhwaraPDCloseSidebar">&times;</button>
            <h5><i class="bi bi-funnel"></i> Filters & Settings</h5>
            <hr>
            
            <!-- Quick Period Selection -->
            <div class="mb-3">
                <label class="form-label"><strong>Quick Period Selection</strong></label>
                <div class="d-flex flex-column gap-1">
                    <button type="button" class="btn btn-outline-primary btn-sm" id="PachhwaraPDPeriod7">Last 7 Days</button>
                    <button type="button" class="btn btn-outline-primary btn-sm" id="PachhwaraPDPeriod15">Last 15 Days</button>
                    <button type="button" class="btn btn-outline-primary btn-sm" id="PachhwaraPDPeriod30">Last 1 Month</button>
                    <button type="button" class="btn btn-outline-primary btn-sm" id="PachhwaraPDPeriod60">Last 2 Months</button>
                    <button type="button" class="btn btn-outline-primary btn-sm" id="PachhwaraPDPeriod90">Last 3 Months</button>
                    <button type="button" class="btn btn-outline-primary btn-sm" id="PachhwaraPDPeriod180">Last 6 Months</button>
                </div>
            </div>
            <hr>

            <!-- Date Range -->
            <div class="mb-3">
                <label class="form-label"><strong>Date Range</strong></label>
                <div class="mb-2">
                    <label class="form-label small">Start Date</label>
                    <input type="date" id="PachhwaraPDStartDate" class="form-control form-control-sm">
                </div>
                <div class="mb-2">
                    <label class="form-label small">End Date</label>
                    <input type="date" id="PachhwaraPDEndDate" class="form-control form-control-sm">
                </div>
            </div>
            <hr>

            <!-- Consolidation Options -->
            <div class="mb-3">
                <label class="form-label"><strong>Consolidation Options</strong></label>
                <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" id="PachhwaraPDConsolidateMonth">
                    <label class="form-check-label" for="PachhwaraPDConsolidateMonth">
                        Consolidate by Month
                        <small class="d-block text-muted">Group data monthly</small>
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="PachhwaraPDConsolidateFY">
                    <label class="form-check-label" for="PachhwaraPDConsolidateFY">
                        Consolidate by Financial Year
                        <small class="d-block text-muted">Group data by FY</small>
                    </label>
                </div>
            </div>
            <hr>

            <!-- Filter by Value -->
            <div class="mb-3">
                <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" id="PachhwaraPDConsolidateValue">
                    <label class="form-check-label" for="PachhwaraPDConsolidateValue">
                        <strong>Filter by Value</strong>
                        <small class="d-block text-muted">Apply numeric filters</small>
                    </label>
                </div>
                <div id="PachhwaraPDValueControls" class="mt-2" style="display:none;">
                    <div class="mb-2">
                        <label class="form-label small" for="PachhwaraPDValueColumn">Column</label>
                        <select id="PachhwaraPDValueColumn" class="form-select form-select-sm"></select>
                    </div>
                    <div class="mb-2">
                        <label class="form-label small" for="PachhwaraPDValueOperator">Operator</label>
                        <select id="PachhwaraPDValueOperator" class="form-select form-select-sm">
                            <option value="lt">&lt;</option>
                            <option value="lte">&le;</option>
                            <option value="eq">=</option>
                            <option value="gte">&ge;</option>
                            <option value="gt">&gt;</option>
                            <option value="between">Between</option>
                        </select>
                    </div>
                    <div id="PachhwaraPDValueInputContainer" class="mb-2">
                        <label class="form-label small" for="PachhwaraPDValueInput">Value</label>
                        <input type="number" id="PachhwaraPDValueInput" class="form-control form-control-sm">
                    </div>
                    <div class="d-none" id="PachhwaraPDValueBetweenContainer">
                        <div class="row g-2">
                            <div class="col-6">
                                <label class="form-label small">From</label>
                                <input type="number" id="PachhwaraPDValueBetweenFrom" class="form-control form-control-sm">
                            </div>
                            <div class="col-6">
                                <label class="form-label small">To</label>
                                <input type="number" id="PachhwaraPDValueBetweenTo" class="form-control form-control-sm">
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
                    <button type="button" class="btn btn-outline-success btn-sm flex-fill" id="PachhwaraPDCheckAll">
                        <i class="bi bi-check-all"></i> All
                    </button>
                    <button type="button" class="btn btn-outline-danger btn-sm flex-fill" id="PachhwaraPDUncheckAll">
                        <i class="bi bi-x-circle"></i> None
                    </button>
                </div>
                <div id="PachhwaraPDColumnCheckboxes" class="max-height-200 overflow-auto">
                    <!-- Column checkboxes will be populated here -->
                </div>
            </div>
            <hr>

            <button class="btn btn-primary w-100" id="PachhwaraPDApplyFilters">
                <i class="bi bi-check-circle"></i> Apply Filters
            </button>
        </div>
    `;

    fetchPachhwaraPDHeaders().then(() => {
        fetchPachhwaraPDData().then(() => {
            PachhwaraPDRenderColumnFilter();
            PachhwaraPDSetDefaultDates(startDate, endDate);
            PachhwaraPDRenderTable();
            PachhwaraPDRenderCharts();
            PachhwaraPDSetupListeners();
            PachhwaraPDRenderValueColumnDropdown();
            PachhwaraPDSetupSidebar();
            PachhwaraPDSetupExportSidebar();
            PachhwaraPDSetupChartExportListeners();
            PachhwaraPDSetupPeriodButtons();
        });
    });
}

function PachhwaraPDSetDefaultDates(start, end) {
    function toInputDate(str) {
        const [d, m, y] = str.split('/');
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    document.getElementById('PachhwaraPDStartDate').value = toInputDate(start);
    document.getElementById('PachhwaraPDEndDate').value = toInputDate(end);
}

function PachhwaraPDRenderColumnFilter() {
    const container = document.getElementById('PachhwaraPDColumnCheckboxes');
    container.innerHTML = '';
    
    for (let i = 1; i < PachhwaraPDHeaders.length; i++) {
        container.innerHTML += `
            <div class="form-check mb-2">
                <input class="form-check-input" type="checkbox" value="${i}" id="PachhwaraPDCol${i}" checked>
                <label class="form-check-label" for="PachhwaraPDCol${i}">${PachhwaraPDHeaders[i]}</label>
            </div>
        `;
    }
    
    // Listeners for column filter
    container.querySelectorAll('input[type=checkbox]').forEach(cb => {
        cb.addEventListener('change', PachhwaraPDRenderTable);
    });
    
    // Add listeners for Check All / Uncheck All
    document.getElementById('PachhwaraPDCheckAll').onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        container.querySelectorAll('input[type=checkbox]').forEach(cb => { cb.checked = true; });
        PachhwaraPDRenderTable();
    };
    document.getElementById('PachhwaraPDUncheckAll').onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        container.querySelectorAll('input[type=checkbox]').forEach(cb => { cb.checked = false; });
        PachhwaraPDRenderTable();
    };
}

function PachhwaraPDSetupPeriodButtons() {
    // Period selection buttons
    document.getElementById('PachhwaraPDPeriod7').addEventListener('click', () => PachhwaraPDSetPeriod(7));
    document.getElementById('PachhwaraPDPeriod15').addEventListener('click', () => PachhwaraPDSetPeriod(15));
    document.getElementById('PachhwaraPDPeriod30').addEventListener('click', () => PachhwaraPDSetPeriod(30));
    document.getElementById('PachhwaraPDPeriod60').addEventListener('click', () => PachhwaraPDSetPeriod(60));
    document.getElementById('PachhwaraPDPeriod90').addEventListener('click', () => PachhwaraPDSetPeriod(90));
    document.getElementById('PachhwaraPDPeriod180').addEventListener('click', () => PachhwaraPDSetPeriod(180));
}

function PachhwaraPDSetPeriod(days) {
    const today = new Date();
    const endDate = new Date(today.getTime() - 86400000); // Yesterday
    const startDate = new Date(endDate.getTime() - (days * 86400000));
    
    function toInputDate(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    
    document.getElementById('PachhwaraPDStartDate').value = toInputDate(startDate);
    document.getElementById('PachhwaraPDEndDate').value = toInputDate(endDate);
    
    // Remove active class from all period buttons
    ['PachhwaraPDPeriod7', 'PachhwaraPDPeriod15', 'PachhwaraPDPeriod30', 'PachhwaraPDPeriod60', 'PachhwaraPDPeriod90', 'PachhwaraPDPeriod180'].forEach(id => {
        document.getElementById(id).classList.remove('btn-primary');
        document.getElementById(id).classList.add('btn-outline-primary');
    });
    
    // Add active class to clicked button
    const activeButton = document.getElementById(`PachhwaraPDPeriod${days}`);
    if (activeButton) {
        activeButton.classList.remove('btn-outline-primary');
        activeButton.classList.add('btn-primary');
    }
    
    PachhwaraPDRenderTable();
    PachhwaraPDRenderCharts();
}

function PachhwaraPDSetupListeners() {
    document.getElementById('PachhwaraPDStartDate').addEventListener('change', function() {
        PachhwaraPDRenderTable();
        PachhwaraPDRenderCharts();
    });
    document.getElementById('PachhwaraPDEndDate').addEventListener('change', function() {
        PachhwaraPDRenderTable();
        PachhwaraPDRenderCharts();
    });
    document.getElementById('PachhwaraPDConsolidateMonth').addEventListener('change', function() {
        PachhwaraPDRenderTable();
        PachhwaraPDRenderCharts();
    });
    document.getElementById('PachhwaraPDConsolidateFY').addEventListener('change', function() {
        PachhwaraPDRenderTable();
        PachhwaraPDRenderCharts();
    });
    document.getElementById('PachhwaraPDConsolidateValue').addEventListener('change', function() {
        document.getElementById('PachhwaraPDValueControls').style.display = this.checked ? '' : 'none';
        PachhwaraPDRenderTable();
    });
    ['PachhwaraPDValueColumn', 'PachhwaraPDValueOperator', 'PachhwaraPDValueInput', 'PachhwaraPDValueBetweenFrom', 'PachhwaraPDValueBetweenTo'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', PachhwaraPDRenderTable);
    });
    // Show/hide value input(s) based on operator
    const valueOperatorEl = document.getElementById('PachhwaraPDValueOperator');
    const inputContainer = document.getElementById('PachhwaraPDValueInputContainer');
    const betweenContainer = document.getElementById('PachhwaraPDValueBetweenContainer');
    if (valueOperatorEl && inputContainer && betweenContainer) {
        valueOperatorEl.addEventListener('change', function() {
            const op = this.value;
            if (op === 'between') {
                inputContainer.classList.add('d-none');
                betweenContainer.classList.remove('d-none');
            } else {
                inputContainer.classList.remove('d-none');
                betweenContainer.classList.add('d-none');
            }
        });
        // Set initial visibility on page load
        if (valueOperatorEl.value === 'between') {
            inputContainer.classList.add('d-none');
            betweenContainer.classList.remove('d-none');
        } else {
            inputContainer.classList.remove('d-none');
            betweenContainer.classList.add('d-none');
        }
    }

    // Apply filters button
    document.getElementById('PachhwaraPDApplyFilters').addEventListener('click', function() {
        PachhwaraPDRenderTable();
        PachhwaraPDRenderCharts();
    });
}

// Sidebar setup function
function PachhwaraPDSetupSidebar() {
    const sidebar = document.getElementById('PachhwaraPDFilterSidebar');
    const toggleBtn = document.getElementById('PachhwaraPDFilterToggle');
    const closeBtn = document.getElementById('PachhwaraPDCloseSidebar');

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
function PachhwaraPDSetupExportSidebar() {
    const exportSidebar = document.getElementById('PachhwaraPDExportSidebar');
    const exportToggle = document.getElementById('PachhwaraPDExportToggle');

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
    document.getElementById('PachhwaraPDExportPDFBtn').addEventListener('click', PachhwaraPDExportToPDF);
    document.getElementById('PachhwaraPDExportExcelBtn').addEventListener('click', PachhwaraPDExportToExcel);
    document.getElementById('PachhwaraPDExportImageBtn').addEventListener('click', PachhwaraPDExportToImage);
    document.getElementById('PachhwaraPDPrintReportBtn').addEventListener('click', () => window.print());
}

function PachhwaraPDParseDMY(str) {
    // Handles both Date(YYYY,M,D) and dd/mm/yyyy
    if (typeof str === "string" && str.startsWith("Date(")) {
        const parts = str.match(/\d+/g);
        if (parts && parts.length >= 3) {
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]); // 0-based in JS Date
            const day = parseInt(parts[2]);
            return new Date(year, month, day);
        }
    } else if (typeof str === "string" && str.includes('/')) {
        const [d, m, y] = str.split('/').map(Number);
        return new Date(y, m - 1, d);
    }
    return new Date(str); // fallback
}

function PachhwaraPDGetMonthYear(str) {
    const d = PachhwaraPDParseDMY(str);
    return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function PachhwaraPDGetFinancialYear(str) {
    const d = PachhwaraPDParseDMY(str);
    const year = d.getFullYear();
    const fyStart = d.getMonth() + 1 >= 4 ? year : year - 1;
    return `FY ${fyStart}-${(fyStart + 1).toString().slice(-2)}`;
}

function PachhwaraPDRenderTable() {
    // Get checked columns
    const checkedCols = Array.from(document.querySelectorAll('#PachhwaraPDColumnCheckboxes input[type=checkbox]:checked')).map(cb => Number(cb.value));
    const startDate = new Date(document.getElementById('PachhwaraPDStartDate').value);
    const endDate = new Date(document.getElementById('PachhwaraPDEndDate').value);
    let byMonth = document.getElementById('PachhwaraPDConsolidateMonth').checked;
    let byFY = document.getElementById('PachhwaraPDConsolidateFY').checked;
    
    // If both are checked, only use consolidateFY
    if (byMonth && byFY) {
        byMonth = false;
    }

    let filtered = PachhwaraPDData.filter(row => {
        const d = PachhwaraPDParseDMY(row[0]);
        // Set both dates to midnight for accurate comparison
        d.setHours(0,0,0,0);
        startDate.setHours(0,0,0,0);
        endDate.setHours(0,0,0,0);
        return d >= startDate && d <= endDate;
    });

    // Apply value filtering
    const byValue = document.getElementById('PachhwaraPDConsolidateValue').checked;
    let valueCol = +document.getElementById('PachhwaraPDValueColumn').value;
    let valueOp = document.getElementById('PachhwaraPDValueOperator').value;
    let valueVal = document.getElementById('PachhwaraPDValueInput').value;
    let valueFrom = document.getElementById('PachhwaraPDValueBetweenFrom')?.value;
    let valueTo = document.getElementById('PachhwaraPDValueBetweenTo')?.value;

    if (byValue && !isNaN(valueCol) && valueOp) {
        filtered = filtered.filter(row => {
            let cellVal = Number(row[valueCol]);
            if (isNaN(cellVal)) return false;
            if (valueOp === 'between') {
                let cmpFrom = Number(valueFrom);
                let cmpTo = Number(valueTo);
                if (!isNaN(cmpFrom) && !isNaN(cmpTo)) {
                    return cellVal >= cmpFrom && cellVal <= cmpTo;
                }
                return false;
            }
            let cmpVal = Number(valueVal);
            if (valueOp === 'lt') return cellVal < cmpVal;
            if (valueOp === 'lte') return cellVal <= cmpVal;
            if (valueOp === 'eq') return cellVal === cmpVal;
            if (valueOp === 'gte') return cellVal >= cmpVal;
            if (valueOp === 'gt') return cellVal > cmpVal;
            return false;
        });
    }




    // Only consolidate if a checkbox is checked
    if (byFY || byMonth) {
        let grouped = {};
        let groupKeyFunc = byFY ? PachhwaraPDGetFinancialYear : PachhwaraPDGetMonthYear;
        filtered.forEach(row => {
            const key = groupKeyFunc(row[0]);
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(row);
        });
        filtered = Object.entries(grouped).map(([key, rows]) => {
            let agg = [];
            agg[0] = key;
            for (let i = 1; i < PachhwaraPDHeaders.length; i++) {
                if ([2, 3, 6, 7, 9, 10, 12, 14, 15, 16, 17, 18, 19].includes(i)) { // Sum columns
                    agg[i] = rows.reduce((sum, r) => sum + (Number(r[i]) || 0), 0);
                } else if ([1, 5, 8, 11, 13, 20, 21, 22].includes(i)) { // Avg columns
                    const nums = rows.map(r => Number(r[i])).filter(n => !isNaN(n));
                    agg[i] = nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2) : '';
                } else if (i === 4) { // E: Percentage D/C
                    const sumC = rows.reduce((sum, r) => sum + (Number(r[2]) || 0), 0);
                    const sumD = rows.reduce((sum, r) => sum + (Number(r[3]) || 0), 0);
                    agg[i] = sumC ? ((sumD / sumC) * 100).toFixed(2) + '%' : '';
                } else {
                    agg[i] = '';
                }
            }
            // Format columns with comma separation for display
    // Columns 3, 9, 10 with 0 decimal places
    [3, 9, 10].forEach(idx => {
        if (agg[idx] !== undefined && agg[idx] !== '' && !isNaN(agg[idx])) {
            agg[idx] = Number(agg[idx]).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        }
    });
    // Other columns with 2 decimal places (excluding 3, 9, 10)
    [1,2,7,8,13,14,15,22].forEach(idx => {
        if (agg[idx] !== undefined && agg[idx] !== '' && !isNaN(agg[idx])) {
            agg[idx] = Number(agg[idx]).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
    });
            return agg;
        });
    }

    // Reverse filtered data to show latest dates first (which will be on the right in charts)
    filtered.reverse();

    // Apply sorting if active
    if (PachhwaraPDSortState.direction !== 'none' && PachhwaraPDSortState.column >= 0) {
        const sortColumn = PachhwaraPDSortState.column;
        const isAscending = PachhwaraPDSortState.direction === 'asc';
        
        console.log('Applying sort to column:', sortColumn, 'direction:', PachhwaraPDSortState.direction);
        
        filtered.sort((a, b) => {
            let aVal = a[sortColumn];
            let bVal = b[sortColumn];
            
            // Handle empty/null values
            if (aVal === '' || aVal === null || aVal === undefined) aVal = 0;
            if (bVal === '' || bVal === null || bVal === undefined) bVal = 0;
            
            // Convert to numbers for numeric comparison
            const aNum = Number(aVal);
            const bNum = Number(bVal);
            
            // If both are valid numbers, sort numerically
            if (!isNaN(aNum) && !isNaN(bNum)) {
                return isAscending ? aNum - bNum : bNum - aNum;
            }
            
            // Otherwise, sort as strings
            const aStr = String(aVal).toLowerCase();
            const bStr = String(bVal).toLowerCase();
            
            if (aStr < bStr) return isAscending ? -1 : 1;
            if (aStr > bStr) return isAscending ? 1 : -1;
            return 0;
        });
    }

    // Calculate min/max values for highlighting (only for sortable columns)
    const minMaxValues = {};
    checkedCols.forEach(i => {
        const headerName = PachhwaraPDHeaders[i];
        const headerLower = headerName.toLowerCase();
        
        const shouldHaveSorting = (headerLower.includes('production') && !headerLower.includes('target')) || 
                                headerLower.includes('stock') || 
                                headerLower.includes('opening') || 
                                headerLower.includes('actual') || 
                                headerLower.includes('percentage') || 
                                headerLower.includes('%') ||
                                headerLower.includes('pit') ||
                                headerLower.includes('rail') ||
                                headerLower.includes('siding') ||
                                (headerLower.includes('ob') && !headerLower.includes('target')) ||
                                headerLower.includes('overburden') ||
                                headerLower.includes('despatch') ||
                                headerLower.includes('dispatch') ||
                                // Numeric value columns for production data, but exclude target columns
                                (i >= 2 && i <= 23 && headerName && headerName.trim() !== '' && 
                                 !headerLower.includes('target'));
        
        if (shouldHaveSorting) {
            const values = filtered.map(row => {
                const val = row[i];
                return val !== '' && val !== null && val !== undefined && !isNaN(Number(val)) ? Number(val) : null;
            }).filter(val => val !== null);
            
            if (values.length > 0) {
                // For minimum calculation, exclude zero values to get the next smallest value
                const nonZeroValues = values.filter(val => val > 0);
                
                minMaxValues[i] = {
                    min: nonZeroValues.length > 0 ? Math.min(...nonZeroValues) : Math.min(...values),
                    max: Math.max(...values)
                };
            }
        }
    });

    let html = `<table class="table table-sm table-bordered table-striped align-middle pachhwara-data-table">
    <thead class="table-primary sticky-top"><tr>
        <th class="sticky-header">Date</th>`;
checkedCols.forEach(i => {
    const headerName = PachhwaraPDHeaders[i];
    const headerLower = headerName.toLowerCase();
    
    // Determine which columns should have sorting functionality
    // Target specific production and despatch related columns, but exclude "Production Target" and "OB Production Target"
    const shouldHaveSorting = (headerLower.includes('production') && !headerLower.includes('target')) || 
                            headerLower.includes('stock') || 
                            headerLower.includes('opening') || 
                            headerLower.includes('actual') || 
                            headerLower.includes('percentage') || 
                            headerLower.includes('%') ||
                            headerLower.includes('pit') ||
                            headerLower.includes('rail') ||
                            headerLower.includes('siding') ||
                            (headerLower.includes('ob') && !headerLower.includes('target')) ||
                            headerLower.includes('overburden') ||
                            headerLower.includes('despatch') ||
                            headerLower.includes('dispatch') ||
                            // Numeric value columns for production data, but exclude target columns
                            (i >= 2 && i <= 23 && headerName && headerName.trim() !== '' && 
                             !headerLower.includes('target')); // Exclude all target columns
    
    if (shouldHaveSorting) {
        const isActive = PachhwaraPDSortState.column === i;
        const sortIcon = isActive 
            ? (PachhwaraPDSortState.direction === 'asc' ? '↑' : PachhwaraPDSortState.direction === 'desc' ? '↓' : '↕')
            : '↕';
        const arrowClass = isActive ? 'sort-arrow active' : 'sort-arrow';
        
        html += `<th class="sticky-header" onclick="pachhwaraPDSortColumn(${i})" title="Click to sort" style="user-select: none;">
                    ${headerName}<span class="${arrowClass}">${sortIcon}</span>
                 </th>`;
    } else {
        html += `<th class="sticky-header">${headerName}</th>`;
    }
});
html += `</tr></thead><tbody>`;

    if (filtered.length) {
    filtered.forEach(row => {
        html += `<tr><td>${PachhwaraPDFormatDate(row[0])}</td>`;
        checkedCols.forEach(i => {
            let cellValue = PachhwaraPDFormatCell(row[i], i);
            
            // Check for min/max highlighting
            let cellClass = '';
            if (minMaxValues[i] && !isNaN(parseFloat(row[i]))) {
                const numValue = parseFloat(row[i]);
                if (numValue === minMaxValues[i].min && minMaxValues[i].min !== minMaxValues[i].max) {
                    cellClass = ' class="min-value"';
                } else if (numValue === minMaxValues[i].max && minMaxValues[i].min !== minMaxValues[i].max) {
                    cellClass = ' class="max-value"';
                }
            }
            
            html += `<td${cellClass}>${cellValue}</td>`;
        });
        html += `</tr>`;
    });
        // Total row
        let totalRow = [];
        totalRow[0] = '<b>TOTAL</b>';
        checkedCols.forEach(i => {
    if ([2, 3, 6, 7, 9, 10, 12, 14, 15, 16, 17, 18, 19, 20].includes(i)) { // Sum columns (added column 20)
        let sum = filtered.reduce((sum, r) => sum + (Number(r[i]) || 0), 0);
        // Format columns 3, 9, 10 with 0 decimal places
        if ([3, 9, 10].includes(i)) {
            totalRow[i] = sum.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        }
        // Format with comma separation and 2 decimals for specific columns (excluding 3, 9, 10)
        else if ([1,2,7,8,14,22].includes(i)) {
            totalRow[i] = sum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else {
            totalRow[i] = sum.toLocaleString();
        }
    } else if ([1, 5, 8, 11, 13, 21, 22].includes(i)) { // Avg columns (removed column 20)
        const nums = filtered.map(r => Number(r[i])).filter(n => !isNaN(n));
        let avg = nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length) : '';
        if (avg !== '') {
            totalRow[i] = avg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else {
            totalRow[i] = '';
        }
    } else if (i === 4) { // E: Percentage D/C
        const sumC = filtered.reduce((sum, r) => sum + (Number(r[2]) || 0), 0);
        const sumD = filtered.reduce((sum, r) => sum + (Number(r[3]) || 0), 0);
        totalRow[i] = sumC ? ((sumD / sumC) * 100).toFixed(2) + '%' : '';
    } else {
        totalRow[i] = '';
    }
});
        html += `<tr class="pachhwara-total-row"><td>${totalRow[0]}</td>`;
        checkedCols.forEach(i => html += `<td>${totalRow[i]}</td>`);
        html += `</tr>`;
    } else {
    html += `<tr><td colspan="${checkedCols.length + 1}" class="text-center">No data found.</td></tr>`;
}
html += `</tbody></table>`;

    // Add pagination/info bar and Print Table button
    const paginationHtml = `
        <div class="d-flex justify-content-between align-items-center my-2">
            <div>
                <span class="badge bg-secondary">${filtered.length} entries</span>
            </div>
            <button class="btn btn-sm btn-outline-light" id="PachhwaraPDRefreshBtn">
                <i class="bi bi-arrow-clockwise"></i> Refresh Data
            </button>
        </div>
    `;
    
    // Render table in card format
    document.getElementById('PachhwaraPD-table-container').innerHTML = `
        <!-- Table Header Card -->
        <div class="pachhwara-pd-card mb-2">
            <div class="pachhwara-pd-section-header d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-0"><i class="bi bi-table"></i>Data Table</h6>
                    <small class="text-light opacity-75">
                        ${filtered.length} records
                    </small>
                </div>
                <div>
                    <button class="btn btn-outline-light btn-sm" id="PachhwaraPDRefreshBtn">
                        <i class="bi bi-arrow-clockwise"></i> Refresh Data
                    </button>
                </div>
            </div>
        </div>
        <!-- Table Data -->
        <div style="max-height: 70vh; overflow: auto; border: 1px solid #dee2e6; border-radius: 8px; background: white; margin-bottom: 1.5rem;">
            ${html}
        </div>
    `;

    // Setup refresh button event listener
    const refreshBtn = document.getElementById('PachhwaraPDRefreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            PachhwaraPDShowLoadingState('PachhwaraPDRefreshBtn', 'Refreshing...');
            fetchPachhwaraPDData().then(() => {
                PachhwaraPDRenderTable();
                PachhwaraPDRenderCharts();
                PachhwaraPDHideLoadingState('PachhwaraPDRefreshBtn', '<i class="bi bi-arrow-clockwise"></i> Refresh Data');
            }).catch(error => {
                console.error('Error refreshing data:', error);
                alert('Error refreshing data. Please try again.');
                PachhwaraPDHideLoadingState('PachhwaraPDRefreshBtn', '<i class="bi bi-arrow-clockwise"></i> Refresh Data');
            });
        });
    }
}

// Format date for display
// Handles Date(YYYY,M,D) and formats it to dd-mm-yyyy
function PachhwaraPDFormatDate(str) {
    // Handles Date(YYYY,M,D)
    if (typeof str === "string" && str.startsWith("Date(")) {
        const parts = str.match(/\d+/g);
        if (parts && parts.length >= 3) {
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]) + 1; // Google is 0-based, JS is 0-based, but for display add 1
            const day = parseInt(parts[2]);
            return `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
        }
    }
    return str;
}
// Format cell values for display with comma separation
// Handles specific columns that need formatting
function PachhwaraPDFormatCell(val, colIdx) {
    // Skip empty values and non-numeric values
    if (val === '' || val === null || val === undefined || isNaN(val)) {
        return val;
    }
    
    // Check if it's a percentage column (column 4: E: Percentage D/C)
    if (colIdx === 4 && typeof val === 'string' && val.includes('%')) {
        return val; // Return percentage as-is
    }
    
    // Format all numeric columns with comma separation
    const numVal = Number(val);
    if (!isNaN(numVal)) {
        // Columns 3, 9, 10 with 0 decimal places
        if ([3, 9, 10].includes(colIdx)) {
            return numVal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        }
        // Columns that need 2 decimal places: 2,3,8,9,10,13,14,15,23 (indexes 1,2,7,8,9,10,13,14,22) - excluding 3, 9, 10
        else if ([1,2,7,8,13,14,22,23].includes(colIdx)) {
            return numVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else {
            // Other numeric columns with comma separation but no forced decimal places
            return numVal.toLocaleString();
        }
    }
    
    return val;
}
// Render the dropdown for selecting value column
function PachhwaraPDRenderValueColumnDropdown() {
    const select = document.getElementById('PachhwaraPDValueColumn');
    select.innerHTML = '';
    for (let i = 1; i < PachhwaraPDHeaders.length; i++) {
        select.innerHTML += `<option value="${i}">${PachhwaraPDHeaders[i]}</option>`;
    }
}

// Toggle function for expandable cards
function PachhwaraPDToggleCard(bodyId, chevronId) {
    const body = document.getElementById(bodyId);
    const chevron = document.getElementById(chevronId);
    
    if (body.style.display === 'none') {
        body.style.display = 'block';
        chevron.className = 'bi bi-chevron-up';
    } else {
        body.style.display = 'none';
        chevron.className = 'bi bi-chevron-down';
    }
}

// Make toggle function globally available
window.PachhwaraPDToggleCard = PachhwaraPDToggleCard;

// Make sort function globally available
window.pachhwaraPDSortColumn = pachhwaraPDSortColumn;

// Loading state functions
function PachhwaraPDShowLoadingState(buttonId, loadingText) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.disabled = true;
        button.innerHTML = `<i class="bi bi-arrow-clockwise spin"></i> ${loadingText}`;
    }
}

function PachhwaraPDHideLoadingState(buttonId, originalHtml) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.disabled = false;
        button.innerHTML = originalHtml;
    }
}



// Function to sort table by column
function pachhwaraPDSortColumn(columnIndex) {
    console.log('Sorting column:', columnIndex, PachhwaraPDHeaders[columnIndex]);
    
    // Update sort state
    if (PachhwaraPDSortState.column === columnIndex) {
        // Same column - cycle through states: none -> asc -> desc -> none
        if (PachhwaraPDSortState.direction === 'none') {
            PachhwaraPDSortState.direction = 'asc';
        } else if (PachhwaraPDSortState.direction === 'asc') {
            PachhwaraPDSortState.direction = 'desc';
        } else {
            PachhwaraPDSortState.direction = 'none';
        }
    } else {
        // New column - start with ascending
        PachhwaraPDSortState.column = columnIndex;
        PachhwaraPDSortState.direction = 'asc';
    }
    
    // Re-render table with sorting
    PachhwaraPDRenderTable();
}

// PDF Export Function
function PachhwaraPDExportToPDF() {
    try {
        // Check if jsPDF is available
        if (typeof window.jspdf === 'undefined') {
            alert('PDF export library not loaded. Please ensure jsPDF is included.');
            return;
        }
        
        PachhwaraPDShowLoadingState('PachhwaraPDExportPDFBtn', 'Generating...');
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
        
        // Get current filtered data
        const checkedCols = Array.from(document.querySelectorAll('#PachhwaraPDColumnCheckboxes input[type=checkbox]:checked')).map(cb => Number(cb.value));
        const startDate = new Date(document.getElementById('PachhwaraPDStartDate').value);
        const endDate = new Date(document.getElementById('PachhwaraPDEndDate').value);
        
        let filtered = PachhwaraPDData.filter(row => {
            const d = PachhwaraPDParseDMY(row[0]);
            d.setHours(0,0,0,0);
            startDate.setHours(0,0,0,0);
            endDate.setHours(0,0,0,0);
            return d >= startDate && d <= endDate;
        });
        
        // Apply consolidation if needed (similar to existing logic)
        const byMonth = document.getElementById('PachhwaraPDConsolidateMonth').checked;
        const byFY = document.getElementById('PachhwaraPDConsolidateFY').checked;
        
        if (byFY || byMonth) {
            // Apply consolidation logic here (simplified for PDF)
            // You can copy the existing consolidation logic from PachhwaraPDRenderTable
        }
        
        // Prepare table data for PDF
        const tableHeaders = ['Date', ...checkedCols.map(i => PachhwaraPDHeaders[i])];
        const tableData = filtered.map(row => [
            PachhwaraPDFormatDate(row[0]),
            ...checkedCols.map(i => PachhwaraPDFormatCell(row[i], i))
        ]);
        
        // Add title
        doc.setFontSize(16);
        doc.text('Pachhwara Production & Despatch Report', 20, 20);
        
        // Add date range
        doc.setFontSize(10);
        doc.text(`Period: ${document.getElementById('PachhwaraPDStartDate').value} to ${document.getElementById('PachhwaraPDEndDate').value}`, 20, 30);
        
        // Add table
        doc.autoTable({
            head: [tableHeaders],
            body: tableData,
            startY: 40,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [54, 69, 79] },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });
        
        // Save the PDF
        doc.save(`Pachhwara_ProdDesp_${new Date().toISOString().split('T')[0]}.pdf`);
        
        PachhwaraPDHideLoadingState('PachhwaraPDExportPDFBtn', '<i class="bi bi-file-earmark-pdf"></i>');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
        PachhwaraPDHideLoadingState('PachhwaraPDExportPDFBtn', '<i class="bi bi-file-earmark-pdf"></i>');
    }
}

// Excel Export Function
function PachhwaraPDExportToExcel() {
    try {
        // Check if XLSX is available
        if (typeof XLSX === 'undefined') {
            alert('Excel export library not loaded. Please ensure XLSX is included.');
            return;
        }
        
        PachhwaraPDShowLoadingState('PachhwaraPDExportExcelBtn', 'Generating...');
        
        // Get current filtered data
        const checkedCols = Array.from(document.querySelectorAll('#PachhwaraPDColumnCheckboxes input[type=checkbox]:checked')).map(cb => Number(cb.value));
        const startDate = new Date(document.getElementById('PachhwaraPDStartDate').value);
        const endDate = new Date(document.getElementById('PachhwaraPDEndDate').value);
        
        let filtered = PachhwaraPDData.filter(row => {
            const d = PachhwaraPDParseDMY(row[0]);
            d.setHours(0,0,0,0);
            startDate.setHours(0,0,0,0);
            endDate.setHours(0,0,0,0);
            return d >= startDate && d <= endDate;
        });
        
        // Prepare data for Excel
        const excelData = [
            ['Date', ...checkedCols.map(i => PachhwaraPDHeaders[i])], // Headers
            ...filtered.map(row => [
                PachhwaraPDFormatDate(row[0]),
                ...checkedCols.map(i => row[i])
            ])
        ];
        
        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        
        // Add some styling (column widths)
        ws['!cols'] = excelData[0].map(() => ({ wch: 15 }));
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Pachhwara ProdDesp');
        
        // Save the Excel file
        XLSX.writeFile(wb, `Pachhwara_ProdDesp_${new Date().toISOString().split('T')[0]}.xlsx`);
        
        PachhwaraPDHideLoadingState('PachhwaraPDExportExcelBtn', '<i class="bi bi-file-earmark-excel"></i>');
        
    } catch (error) {
        console.error('Error generating Excel:', error);
        alert('Error generating Excel file. Please try again.');
        PachhwaraPDHideLoadingState('PachhwaraPDExportExcelBtn', '<i class="bi bi-file-earmark-excel"></i>');
    }
}

// Image Export Function (JPG)
function PachhwaraPDExportToImage() {
    try {
        // Check if html2canvas is available
        if (typeof html2canvas === 'undefined') {
            alert('Image export library not loaded. Please ensure html2canvas is included.');
            return;
        }
        
        PachhwaraPDShowLoadingState('PachhwaraPDExportImageBtn', 'Generating...');
        
        // Get the table container for capture
        const tableContainer = document.getElementById('PachhwaraPD-table-container');
        
        if (!tableContainer) {
            alert('No table data to export as image.');
            PachhwaraPDHideLoadingState('PachhwaraPDExportImageBtn', '<i class="bi bi-file-earmark-image"></i>');
            return;
        }
        
        // Capture the element as canvas
        html2canvas(tableContainer, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            // Convert canvas to image and download
            const link = document.createElement('a');
            link.download = `Pachhwara_ProdDesp_${new Date().toISOString().split('T')[0]}.jpg`;
            link.href = canvas.toDataURL('image/jpeg', 0.9);
            link.click();
            
            PachhwaraPDHideLoadingState('PachhwaraPDExportImageBtn', '<i class="bi bi-file-earmark-image"></i>');
        }).catch(error => {
            console.error('Error generating image:', error);
            alert('Error generating image. Please try again.');
            PachhwaraPDHideLoadingState('PachhwaraPDExportImageBtn', '<i class="bi bi-file-earmark-image"></i>');
        });
        
    } catch (error) {
        console.error('Error in image export:', error);
        alert('Error generating image. Please try again.');
        PachhwaraPDHideLoadingState('PachhwaraPDExportImageBtn', '<i class="bi bi-file-earmark-image"></i>');
    }
}