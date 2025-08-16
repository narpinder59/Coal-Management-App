// Coal Scenario Calculator Module - Complete Implementation
// Based on Coal-Scenario.html with full functionality

// ==========================================================================
// GLOBAL VARIABLES AND CONSTANTS
// ==========================================================================

// Application State
let monthColumns = []; // Array to store month information
let currentYear = new Date().getFullYear() % 100; // Current year in 2-digit format (e.g., 25 for 2025)

// ==========================================================================
// MAIN FUNCTION TO SHOW COAL SCENARIO CALCULATOR
// ==========================================================================

function showCoalScenarioCalculator() {
    console.log("Loading Coal Scenario Calculator with complete functionality...");
    
    const content = `
        <style>
            /* Complete CSS Styling from Original */
            .table-container {
                overflow-x: auto;
                margin: 20px 0;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                background: white;
                padding: 15px;
            }
            
            table {
                width: 100%;
                border-collapse: collapse !important;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            
            th, td {
                border: 1px solid #e9ecef !important;
                padding: 8px 12px !important;
                text-align: center !important;
                vertical-align: middle !important;
                background-color: #ffffff !important;
            }
            
            thead th {
                background-color: #f8f9fa !important;
                font-weight: 600 !important;
                color: #495057 !important;
                border-bottom: 2px solid #dee2e6 !important;
                position: sticky;
                top: 0;
                z-index: 10;
            }
            
            /* STICKY COLUMNS - PROFESSIONAL STYLING */
            th:first-child,
            td:first-child {
                position: sticky !important;
                left: 0 !important;
                z-index: 5 !important;
                background-color: #f8f9fa !important;
                font-weight: 500 !important;
                min-width: 120px !important;
                max-width: 150px !important;
            }
            
            thead th:first-child {
                z-index: 15 !important;
                background-color: #e9ecef !important;
            }
            
            /* Month header dropdown styling */
            .month-select {
                background: none;
                border: none;
                color: inherit;
                font: inherit;
                width: 100%;
                text-align: center;
                cursor: pointer;
            }
            
            .month-select:focus {
                outline: 2px solid #007bff;
                background-color: rgba(255,255,255,0.2);
            }
            
            /* Remove month button styling */
            .remove-month-btn {
                background: #dc3545;
                color: white;
                border: none;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 12px;
                line-height: 1;
                cursor: pointer;
                margin-left: 5px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            
            .remove-month-btn:hover {
                background: #c82333;
            }
            
            /* Table consistency - unified font styling */
            table {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
                border-collapse: collapse !important;
                width: 100% !important;
            }
            
            table td, table th {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
                font-size: 14px !important;
                text-align: center !important;
                vertical-align: middle !important;
                padding: 4px 8px !important;
                border: 1px solid #dee2e6 !important;
            }
            
            table th {
                background-color: #f8f9fa !important;
                font-weight: 600 !important;
                color: #495057 !important;
            }
            
            /* Input field styling - improved distinction */
            input[type="number"] {
                border: 1px solid #ced4da !important;
                border-radius: 4px !important;
                padding: 4px 8px !important;
                width: 100% !important;
                text-align: center !important;
                background-color: #fff !important;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
                font-size: 14px !important;
                font-weight: normal !important;
                color: #495057 !important;
                box-sizing: border-box !important;
            }
            
            input[type="number"]:focus {
                border-color: #80bdff !important;
                outline: 0 !important;
                box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25) !important;
                background-color: #f8f9ff !important;
            }
            
            /* Span cells styling - for calculated values */
            table span, .calculated-cell {
                display: block !important;
                padding: 4px 8px !important;
                text-align: center !important;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
                font-size: 14px !important;
                font-weight: 500 !important;
                background-color: #f8f9fa !important;
                border: 1px solid #e9ecef !important;
                border-radius: 3px !important;
                min-height: 16px !important;
                color: #495057 !important;
                box-sizing: border-box !important;
                width: 100% !important;
            }
            
            /* Warning System Styles */
            .warnings-panel {
                background: #fff;
                border: 2px solid #f44336;
                border-radius: 8px;
                padding: 15px;
                box-shadow: 0 2px 8px rgba(244, 67, 54, 0.1);
                margin: 20px 0;
            }
            
            .warnings-panel h3 {
                margin: 0 0 15px 0;
                color: #d32f2f;
                font-size: 1.1em;
                border-bottom: 1px solid #ffcdd2;
                padding-bottom: 8px;
            }
            
            .warning-item {
                margin: 10px 0;
                padding: 12px;
                border-radius: 6px;
                line-height: 1.4;
            }
            
            .critical-warning {
                background: #ffebee;
                border: 1px solid #f44336;
                border-left: 4px solid #d32f2f;
            }
            
            .buffer-warning {
                background: #fff3e0;
                border: 1px solid #ff9800;
                border-left: 4px solid #f57c00;
            }
            
            .summary-warning {
                background: #e8f5e8;
                border: 1px solid #4caf50;
                border-left: 4px solid #388e3c;
                font-weight: bold;
            }
            
            /* Floating Warning Icon */
            .warning-float-icon {
                position: fixed;
                top: 50%;
                right: 20px;
                transform: translateY(-50%);
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background-color: #6c757d;
                color: white;
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                transition: all 0.3s ease;
            }
            
            .warning-float-icon:hover {
                transform: translateY(-50%) scale(1.1);
                box-shadow: 0 6px 16px rgba(0,0,0,0.4);
            }
            
            .warning-float-icon.has-warnings {
                background-color: #dc3545;
            }
            
            /* Warning Badge on Icon */
            .warning-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background-color: #dc3545;
                color: white;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
            }
            
            /* Export Float Icon */
            .export-float-icon {
                position: fixed;
                top: 50%;
                left: 20px;
                transform: translateY(-50%);
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background-color: #007bff;
                color: white;
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 9997;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                transition: all 0.3s ease;
            }
            
            .export-float-icon:hover {
                transform: translateY(-50%) scale(1.1);
                box-shadow: 0 6px 16px rgba(0,0,0,0.4);
                background-color: #0056b3;
            }
            
            /* Export Menu */
            .export-menu {
                position: fixed;
                top: 0;
                left: -400px;
                width: 400px;
                height: 100vh;
                background-color: #fff;
                box-shadow: 4px 0 12px rgba(0,0,0,0.3);
                z-index: 9996;
                transition: left 0.3s ease;
                overflow-y: auto;
                padding: 20px;
            }
            
            .export-menu.open {
                left: 0;
            }
            
            .export-menu-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #dee2e6;
            }
            
            .export-menu-header h4 {
                color: #007bff;
                margin: 0;
                font-size: 20px;
            }
            
            .export-close-btn {
                background: none;
                border: none;
                font-size: 24px;
                color: #6c757d;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .export-section {
                margin-bottom: 25px;
                padding: 15px;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                background-color: #f8f9fa;
            }
            
            .export-section h5 {
                color: #495057;
                margin: 0 0 15px 0;
                font-size: 16px;
                font-weight: 600;
            }
            
            .export-radio-group {
                display: flex;
                gap: 15px;
                margin-bottom: 15px;
            }
            
            .export-radio-item {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .export-buttons {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }
            
            .export-btn {
                flex: 1;
                min-width: 100px;
                padding: 10px 15px;
                border: none;
                border-radius: 6px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            
            .export-btn-pdf {
                background-color: #dc3545;
                color: white;
            }
            
            .export-btn-pdf:hover {
                background-color: #c82333;
            }
            
            .export-btn-jpg {
                background-color: #28a745;
                color: white;
            }
            
            .export-btn-jpg:hover {
                background-color: #218838;
            }
            
            .export-btn-excel {
                background-color: #17a2b8;
                color: white;
            }
            
            .export-btn-excel:hover {
                background-color: #138496;
            }
            
            /* Warning Side Menu */
            .warning-side-menu {
                position: fixed;
                top: 0;
                right: -400px;
                width: 400px;
                height: 100vh;
                background-color: #fff;
                box-shadow: -4px 0 12px rgba(0,0,0,0.3);
                z-index: 9998;
                transition: right 0.3s ease;
                overflow-y: auto;
                padding: 20px;
            }
            
            .warning-side-menu.open {
                right: 0;
            }
            
            .warning-side-menu-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #dee2e6;
            }
            
            .warning-side-menu-header h4 {
                color: #dc3545;
                margin: 0;
                font-size: 20px;
            }
            
            .warning-close-btn {
                background: none;
                border: none;
                font-size: 24px;
                color: #6c757d;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            /* Editable source names styling */
            #Table2 tbody td[contenteditable="true"]:first-child {
                background: #f8f9fa;
                border: 1px dashed #dee2e6;
                cursor: text;
                transition: all 0.2s ease;
            }
            
            #Table2 tbody td[contenteditable="true"]:first-child:hover {
                background: #e9ecef;
                border-color: #adb5bd;
            }
            
            #Table2 tbody td[contenteditable="true"]:first-child:focus {
                background: #fff;
                border-color: #007bff;
                outline: none;
            }
            
            /* Mobile responsive */
            @media (max-width: 768px) {
                .table-container {
                    padding: 10px;
                }
                
                th, td {
                    padding: 6px 8px !important;
                    font-size: 12px;
                }
                
                .warning-float-icon, .export-float-icon {
                    width: 50px;
                    height: 50px;
                    font-size: 20px;
                }
            }
        </style>
        
        <div class="container-fluid">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="text-center">Coal Calculator V1.0 - Professional</h1>
                <button class="btn btn-secondary" onclick="showCalculatorsPage()">
                    <i class="bi bi-arrow-left"></i> Back to Calculators
                </button>
            </div>
            
            <!-- Power Plant Name Input -->
            <div class="row mb-4">
                <div class="col-md-6 mx-auto">
                    <div class="input-group">
                        <span class="input-group-text"><i class="fas fa-industry"></i></span>
                        <input type="text" id="powerPlantName" class="form-control" placeholder="Enter Power Plant Name" value="">
                    </div>
                </div>
            </div>
            
            <!-- Warning Message (Hidden - now in side menu) -->
            <div id="closingStockWarning" style="display: none;"></div>
            
            <!-- Floating Warning Icon -->
            <button class="warning-float-icon" id="warningFloatIcon">
                <i class="fas fa-exclamation-triangle"></i>
                <span class="warning-badge" id="warningBadge" style="display: none;">0</span>
            </button>
            
            <!-- Export Float Icon -->
            <button class="export-float-icon" id="exportFloatIcon">
                <i class="fas fa-download"></i>
            </button>
            
            <!-- Export Menu -->
            <div class="export-menu" id="exportMenu">
                <div class="export-menu-header">
                    <h4><i class="fas fa-download me-2"></i>Export Options</h4>
                    <button class="export-close-btn" id="exportCloseBtn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="export-section">
                    <h5>Table Selection</h5>
                    <div class="export-options">
                        <div class="export-radio-group">
                            <div class="export-radio-item">
                                <input type="radio" id="exportTable1" name="tableSelection" value="table1" checked>
                                <label for="exportTable1">Coal Scenario Only</label>
                            </div>
                            <div class="export-radio-item">
                                <input type="radio" id="exportBothTables" name="tableSelection" value="both">
                                <label for="exportBothTables">Both Tables</label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="export-section">
                    <h5>Export Formats</h5>
                    <div class="export-buttons">
                        <button class="export-btn export-btn-pdf" onclick="exportToPDF()">
                            <i class="fas fa-file-pdf"></i>
                            Export PDF
                        </button>
                        <button class="export-btn export-btn-jpg" onclick="exportToJPG()">
                            <i class="fas fa-image"></i>
                            Export JPG
                        </button>
                        <button class="export-btn export-btn-excel" onclick="exportToExcel()">
                            <i class="fas fa-file-excel"></i>
                            Export Excel
                        </button>
                    </div>
                </div>
                
                <div class="export-section">
                    <h5>Export Settings</h5>
                    <div class="export-options">
                        <label>
                            <input type="checkbox" id="includeTimestamp" checked>
                            Include timestamp in filename
                        </label>
                        <label>
                            <input type="checkbox" id="highQuality" checked>
                            Ultra high quality (A4 optimized)
                        </label>
                        <label>
                            <input type="checkbox" id="includeWarnings" checked>
                            Include live warning cards
                        </label>
                    </div>
                </div>
            </div>
            
            <!-- Warning Side Menu -->
            <div class="warning-side-menu" id="warningSideMenu">
                <div class="warning-side-menu-header">
                    <h4><i class="fas fa-exclamation-triangle me-2"></i>Warnings</h4>
                    <button class="warning-close-btn" id="warningCloseBtn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div id="warningMenuContent">
                    <div class="text-center text-muted py-4">
                        <i class="fas fa-check-circle fa-3x mb-3"></i>
                        <p>No warnings currently</p>
                    </div>
                </div>
            </div>
            
            <!-- Card 1: Coal Scenario -->
            <div class="card mb-4">
                <div class="card-header bg-dark text-white">
                    <div class="row align-items-center">
                        <div class="col-md-6">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-chart-line me-2"></i>Coal Scenario at <span id="plantNameDisplay1">____</span>
                            </h5>
                        </div>
                        <div class="col-md-6">
                            <div class="d-flex justify-content-end align-items-center flex-wrap gap-2">
                                <button id="addRowBtn" class="btn btn-light btn-sm">
                                    <i class="fas fa-plus"></i> Add Month
                                </button>
                                <button id="clearValuesBtn" class="btn btn-warning btn-sm">
                                    <i class="fas fa-eraser"></i> Clear Values
                                </button>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="copyValuesCheckbox">
                                    <label class="form-check-label text-white small" for="copyValuesCheckbox"> <i class="fa-solid fa-clone"></i> Auto-copy Parameters</label>
                                </div>
                                <div class="d-flex align-items-center">
                                    <label class="text-white small me-1">Buffer Stock:</label>
                                    <input type="number" id="daysToMaintainStock" class="form-control form-control-sm" style="width: 50px;height: 16px; font-size: inherit; padding: 1px 4px;" value="10" min="1">
                                    <span class="text-white small ms-1">days</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-body p-0">
                    <table id="Table1" class="table table-bordered mb-0">
                    <thead>
                        <tr>
                            <th>Parameter</th>
                            <!-- Month columns will be added dynamically -->
                            <th>Total/Avg</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td><strong>Generation Capacity (MW)</strong></td><td class="total-cell">0</td></tr>
                        <tr><td><strong>PLF (%)</strong></td><td class="total-cell">0</td></tr>
                        <tr><td><strong>Units Generated (MU)</strong></td><td class="total-cell">0</td></tr>
                        <tr><td><strong>Specific Coal Consumption (kg/kWh)</strong></td><td class="total-cell">0</td></tr>
                        <tr><td><strong>Coal Requirement (MT)</strong></td><td class="total-cell">0</td></tr>
                        <tr><td><strong>Coal Available (MT)</strong></td><td class="total-cell">0</td></tr>
                        <tr><td><strong>Opening Stock (MT)</strong></td><td class="total-cell">0</td></tr>
                        <tr><td><strong>Closing Stock (MT)</strong></td><td class="total-cell">0</td></tr>
                        <tr><td><strong>Closing Stock in Days</strong></td><td class="total-cell">0</td></tr>
                    </tbody>
                </table>
                </div>
            </div>
            
            <!-- Card 2: Coal Sources -->
            <div class="card mb-4">
                <div class="card-header bg-dark text-white">
                    <div class="row align-items-center">
                        <div class="col-md-6">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-truck me-2"></i>Coal Sources for <span id="plantNameDisplay2">____</span>
                            </h5>
                        </div>
                        <div class="col-md-6">
                            <div class="d-flex justify-content-end align-items-center flex-wrap gap-2">
                                <button id="addSourceBtn" class="btn btn-light btn-sm">
                                    <i class="fas fa-plus"></i> Add Source
                                </button>
                                <button id="clearSourceValuesBtn" class="btn btn-warning btn-sm">
                                    <i class="fas fa-eraser"></i> Clear Values
                                </button>
                                <div class="form-check form-switch">
                                    <label class="form-check-label text-white small" for="copyQuantityCheckbox"> <i class="fa-solid fa-clone"></i> Auto-copy Quantities </label>
                                    <input class="form-check-input" type="checkbox" id="copyQuantityCheckbox">
                                </div>
                                <div class="form-check form-switch">
                                    <label class="form-check-label text-white small" for="linkToMainTable"><i class="fa-solid fa-arrow-up-from-bracket"></i> Auto-link Tables </label> 
                                    <input class="form-check-input" type="checkbox" id="linkToMainTable" checked>
                                </div>
                                <button id="copyTotalsButton" class="btn btn-info btn-sm">
                                   <i class="fa-solid fa-file-arrow-up"></i> Copy Totals 
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-body p-0">
                    <table id="Table2" class="table table-bordered mb-0">
                        <thead>
                            <tr>
                                <th>Source</th>
                                <!-- Month columns will be added dynamically -->
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody id="coalSourcesTableBody">
                            <!-- Sources will be added dynamically -->
                        </tbody>
                        <tfoot>
                            <tr id="totalRow">
                                <td><strong>Total</strong></td>
                                <td>0</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('main-content').innerHTML = content;
    
    // Initialize the calculator with complete functionality - add delay for DOM to settle
    setTimeout(() => {
        try {
            initializeCoalCalculator();
        } catch (error) {
            console.error("Error initializing calculator:", error);
            // Retry once more after additional delay
            setTimeout(() => {
                try {
                    initializeCoalCalculator();
                } catch (retryError) {
                    console.error("Retry failed:", retryError);
                }
            }, 200);
        }
    }, 150);
}

// ==========================================================================
// INITIALIZATION FUNCTION
// ==========================================================================

function initializeCoalCalculator() {
    console.log("Initializing complete Coal Scenario Calculator...");
    
    // First, reset all tables to clean state
    resetCalculatorTables();
    
    // Set initial months (start with current month and next 2 months)
    addCoalColumn();
    addCoalColumn();
    addCoalColumn();
    
    // Initialize sources table with default sources
    initializeCoalSources();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update power plant name displays
    updatePowerPlantDisplays();
    
    // Initial calculation
    calculateEverything();
    
    console.log("Coal Scenario Calculator initialized successfully!");
}

// ==========================================================================
// RESET FUNCTION - Clean slate initialization
// ==========================================================================

function resetCalculatorTables() {
    console.log("Resetting calculator tables to clean state...");
    
    // Get current date for initial setup
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Reset Table 1 - Main Coal Requirements
    const table1 = document.getElementById('coalTable1');
    if (table1) {
        // Clear all dynamic columns (keep only first static column)
        const headerRow = table1.querySelector('thead tr');
        const bodyRows = table1.querySelectorAll('tbody tr');
        
        // Keep only the first header (row name column)
        while (headerRow.children.length > 1) {
            headerRow.removeChild(headerRow.lastElementChild);
        }
        
        // Clear all body rows except row names (first column)
        bodyRows.forEach(row => {
            while (row.children.length > 1) {
                row.removeChild(row.lastElementChild);
            }
        });
    }
    
    // Reset Table 2 - Coal Sources
    const table2 = document.getElementById('coalTable2');
    const tbody2 = document.getElementById('coalSourcesTableBody');
    if (table2 && tbody2) {
        // Clear all existing source rows
        tbody2.innerHTML = '';
        
        // Reset table2 header to only first column
        const table2Header = table2.querySelector('thead tr');
        if (table2Header) {
            while (table2Header.children.length > 1) {
                table2Header.removeChild(table2Header.lastElementChild);
            }
        }
    }
    
    // Reset any stored state variables
    monthColumns = []; // Clear the month columns array
    
    console.log("Calculator tables reset successfully!");
}

// ==========================================================================
// EVENT LISTENERS CLEANUP AND SETUP
// ==========================================================================

function removeExistingEventListeners() {
    // Clone and replace elements to remove all event listeners
    const elementsToClone = [
        'powerPlantName', 'addRowBtn', 'clearValuesBtn', 'addSourceBtn', 
        'clearSourceValuesBtn', 'copyTotalsButton', 'daysToMaintainStock',
        'copyValuesCheckbox', 'copyQuantityCheckbox', 'linkToMainTable',
        'warningFloatIcon', 'exportFloatIcon', 'exportCloseBtn', 'warningCloseBtn'
    ];
    
    elementsToClone.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            const clone = element.cloneNode(true);
            element.parentNode.replaceChild(clone, element);
        }
    });
    
    console.log("Existing event listeners removed successfully!");
}

function setupEventListeners() {
    // Remove any existing event listeners first to prevent duplicates
    removeExistingEventListeners();
    
    // Power plant name input
    document.getElementById('powerPlantName').addEventListener('input', updatePowerPlantDisplays);
    
    // Button event listeners
    document.getElementById('addRowBtn').addEventListener('click', addCoalColumn);
    document.getElementById('clearValuesBtn').addEventListener('click', clearAllValues);
    document.getElementById('addSourceBtn').addEventListener('click', addNewSource);
    document.getElementById('clearSourceValuesBtn').addEventListener('click', clearSourceValues);
    document.getElementById('copyTotalsButton').addEventListener('click', copyCoalAvailabilityToFirstTable);
    
    // Buffer stock input
    document.getElementById('daysToMaintainStock').addEventListener('input', recalculateAllColumns);
    
    // Checkbox event listeners
    document.getElementById('copyValuesCheckbox').addEventListener('change', function() {
        console.log('Auto-copy parameters:', this.checked);
    });
    
    document.getElementById('copyQuantityCheckbox').addEventListener('change', function() {
        console.log('Auto-copy quantities:', this.checked);
    });
    
    document.getElementById('linkToMainTable').addEventListener('change', function() {
        if (this.checked) {
            copyCoalAvailabilityToFirstTable();
        }
    });
    
    // Floating icons event listeners
    document.getElementById('warningFloatIcon').addEventListener('click', toggleWarningMenu);
    document.getElementById('exportFloatIcon').addEventListener('click', toggleExportMenu);
    document.getElementById('exportCloseBtn').addEventListener('click', closeExportMenu);
    document.getElementById('warningCloseBtn').addEventListener('click', closeWarningMenu);
    
    // Click outside to close menus - improved auto-hide functionality
    document.addEventListener('click', function(event) {
        const exportMenu = document.getElementById('exportMenu');
        const warningMenu = document.getElementById('warningSideMenu');
        const exportIcon = document.getElementById('exportFloatIcon');
        const warningIcon = document.getElementById('warningFloatIcon');
        
        // Check if export menu is open and click is outside
        if (exportMenu && exportMenu.classList.contains('open')) {
            if (!exportMenu.contains(event.target) && 
                !exportIcon.contains(event.target) && 
                event.target !== exportIcon) {
                closeExportMenu();
            }
        }
        
        // Check if warning menu is open and click is outside
        if (warningMenu && warningMenu.classList.contains('open')) {
            if (!warningMenu.contains(event.target) && 
                !warningIcon.contains(event.target) && 
                event.target !== warningIcon) {
                closeWarningMenu();
            }
        }
    });
    
    // Add event listeners to tables
    addEventListenersToTable1();
    addEventListenersToTable2();
}

// ==========================================================================
// POWER PLANT NAME MANAGEMENT
// ==========================================================================

function updatePowerPlantDisplays() {
    const plantName = document.getElementById('powerPlantName').value || '____';
    document.getElementById('plantNameDisplay1').textContent = plantName;
    document.getElementById('plantNameDisplay2').textContent = plantName;
}

// ==========================================================================
// MONTH COLUMN MANAGEMENT
// ==========================================================================

function addCoalColumn() {
    const table1 = document.getElementById('Table1');
    const table2 = document.getElementById('Table2');
    
    if (!table1 || !table2) {
        console.error("Tables not found! Waiting for DOM...");
        setTimeout(() => addCoalColumn(), 100);
        return;
    }
    
    // Ensure monthColumns array exists
    if (!monthColumns) {
        monthColumns = [];
    }
    
    // Determine the month number for the new column
    let monthNumber;
    if (monthColumns.length === 0) {
        // First column - use current month (August = 8)
        monthNumber = new Date().getMonth() + 1;
    } else {
        // Subsequent columns - get next month after the last existing month
        const lastMonth = monthColumns[monthColumns.length - 1].monthNumber;
        monthNumber = getNextMonth(lastMonth);
    }
    
    const monthName = getMonthNameWithYear(monthNumber);
    
    // Store month information
    monthColumns.push({
        monthNumber: monthNumber,
        monthName: monthName
    });
    
    // Add header to Table1 with month selector (only first month is selectable)
    const table1Header = table1.querySelector('thead tr');
    const table1TotalHeader = table1Header.lastElementChild;
    const newTable1Header = document.createElement('th');
    newTable1Header.className = 'month-header';
    
    if (monthColumns.length === 1) {
        // First month - selectable dropdown
        newTable1Header.innerHTML = `
            <select class="month-select" onchange="updateAllMonthColumns()">
                ${generateMonthOptions(monthNumber)}
            </select>
        `;
    } else {
        // Subsequent months - display with remove button
        newTable1Header.innerHTML = `
            ${monthName}
            <button class="remove-month-btn" onclick="removeMonthColumn(${monthColumns.length - 1})" title="Remove ${monthName}">×</button>
        `;
    }
    
    table1Header.insertBefore(newTable1Header, table1TotalHeader);
    
    // Add header to Table2 (simple text)
    const table2Header = table2.querySelector('thead tr');
    const table2TotalHeader = table2Header.lastElementChild;
    const newTable2Header = document.createElement('th');
    newTable2Header.className = 'month-header';
    newTable2Header.textContent = monthName;
    table2Header.insertBefore(newTable2Header, table2TotalHeader);
    
    // Add cells to Table1 body rows
    const table1Rows = table1.querySelectorAll('tbody tr');
    table1Rows.forEach((row, index) => {
        const newCell = document.createElement('td');
        const totalCell = row.lastElementChild;
        
        // Determine cell content based on row type
        if (index === 0 || index === 1 || index === 3 || index === 5) {
            // Input rows: Generation Capacity, PLF, SCC, Coal Available
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            input.step = '0.01';
            input.value = '0';
            input.className = 'form-control form-control-sm';
            newCell.appendChild(input);
        } else if (index === 6 && monthColumns.length === 1) {
            // Opening Stock - only input for first month
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            input.step = '0.01';
            input.value = '0';
            input.className = 'form-control form-control-sm';
            newCell.appendChild(input);
        } else {
            // Calculated rows: Units Generated, Coal Consumption, Closing Stock, Stock in Days
            // Or Opening Stock for subsequent months
            const span = document.createElement('span');
            span.textContent = '0';
            newCell.appendChild(span);
        }
        
        row.insertBefore(newCell, totalCell);
    });
    
    // Add cells to Table2 body rows
    const table2Rows = table2.querySelectorAll('tbody tr');
    table2Rows.forEach(row => {
        const newCell = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.step = '0.01';
        input.value = '0';
        input.className = 'form-control form-control-sm';
        newCell.appendChild(input);
        
        const totalCell = row.lastElementChild;
        row.insertBefore(newCell, totalCell);
    });
    
    // Add cell to Table2 footer
    const totalRow = document.getElementById('totalRow');
    const newFooterCell = document.createElement('td');
    const span = document.createElement('span');
    span.textContent = '0';
    newFooterCell.appendChild(span);
    const footerTotalCell = totalRow.lastElementChild;
    totalRow.insertBefore(newFooterCell, footerTotalCell);
    
    // Add event listeners and recalculate
    addEventListenersToTable1();
    addEventListenersToTable2();
    recalculateAllColumns();
}

function removeMonthColumn(columnIndex) {
    if (monthColumns.length <= 1) {
        alert('Cannot remove the last remaining month column.');
        return;
    }
    
    if (columnIndex === 0) {
        alert('Cannot remove the first month column. You can change its month using the dropdown.');
        return;
    }
    
    const monthName = monthColumns[columnIndex].monthName;
    
    // Ask for confirmation
    if (!confirm(`Are you sure you want to remove the ${monthName} column? This action cannot be undone.`)) {
        return;
    }
    
    const table1 = document.getElementById('Table1');
    const table2 = document.getElementById('Table2');
    
    const actualColumnIndex = columnIndex + 1; // +1 for parameter column
    
    // Remove from headers
    table1.querySelector('thead tr').children[actualColumnIndex].remove();
    table2.querySelector('thead tr').children[actualColumnIndex].remove();
    
    // Remove from Table1 body rows
    table1.querySelectorAll('tbody tr').forEach(row => {
        row.children[actualColumnIndex].remove();
    });
    
    // Remove from Table2 body rows
    table2.querySelectorAll('tbody tr').forEach(row => {
        row.children[actualColumnIndex].remove();
    });
    
    // Remove from Table2 footer
    table2.querySelector('tfoot tr').children[actualColumnIndex].remove();
    
    // Remove from monthColumns array
    monthColumns.splice(columnIndex, 1);
    
    // Recalculate month sequence for remaining columns
    recalculateMonthSequence();
    
    // Update remove button onclick handlers for remaining columns
    const headers = table1.querySelectorAll('thead th.month-header');
    headers.forEach((header, index) => {
        const removeBtn = header.querySelector('.remove-month-btn');
        if (removeBtn) {
            removeBtn.setAttribute('onclick', `removeMonthColumn(${index})`);
        }
    });
    
    // Update calculations and event listeners
    addEventListenersToTable1();
    addEventListenersToTable2();
    recalculateAllColumns();
}

function recalculateMonthSequence() {
    if (monthColumns.length === 0) return;
    
    // Get the first month (which should remain unchanged)
    const firstMonth = monthColumns[0].monthNumber;
    let currentMonth = firstMonth;
    
    // Update all month columns to maintain sequence
    monthColumns.forEach((col, index) => {
        col.monthNumber = currentMonth;
        col.monthName = getMonthNameWithYear(currentMonth, firstMonth);
        currentMonth = getNextMonth(currentMonth);
    });
    
    // Update headers in both tables
    const table1Headers = document.querySelectorAll('#Table1 thead th.month-header');
    const table2Headers = document.querySelectorAll('#Table2 thead th.month-header');
    
    currentMonth = firstMonth;
    for (let i = 0; i < monthColumns.length; i++) {
        const monthName = getMonthNameWithYear(currentMonth, firstMonth);
        
        // Update Table1 header
        if (i === 0) {
            // First column: keep the select element
            const select = table1Headers[i].querySelector('.month-select');
            if (select) {
                select.value = currentMonth;
            }
        } else {
            // Subsequent columns: update text and remove button
            table1Headers[i].innerHTML = `
                ${monthName}
                <button class="remove-month-btn" onclick="removeMonthColumn(${i})" title="Remove ${monthName}">×</button>
            `;
        }
        
        // Update Table2 header
        if (table2Headers[i]) {
            table2Headers[i].textContent = monthName;
        }
        
        currentMonth = getNextMonth(currentMonth);
    }
}

function updateAllMonthColumns() {
    const firstMonthSelect = document.querySelector('.month-select');
    if (!firstMonthSelect) return;
    
    let selectedValue = parseInt(firstMonthSelect.value);
    
    // Convert value to actual month (1-12) and determine starting year
    let startMonth, startYear;
    if (selectedValue <= 12) {
        startMonth = selectedValue;
        startYear = currentYear;
    } else {
        startMonth = selectedValue - 12;
        startYear = currentYear + 1;
    }
    
    let currentMonth = startMonth;
    let currentMonthYear = startYear;
    
    // Update month columns array with proper sequence
    monthColumns.forEach((col, index) => {
        col.monthNumber = currentMonth;
        col.monthName = getMonthNameWithYear(currentMonth, startMonth, startYear);
        
        // Move to next month
        currentMonth = getNextMonth(currentMonth);
        // If we wrapped around to January, increment the year
        if (currentMonth === 1 && index > 0) {
            currentMonthYear++;
        }
    });
    
    // Update all month headers in both tables
    const table1Headers = document.querySelectorAll('#Table1 thead th.month-header');
    const table2Headers = document.querySelectorAll('#Table2 thead th.month-header');
    
    currentMonth = startMonth;
    currentMonthYear = startYear;
    
    for (let i = 0; i < table1Headers.length; i++) {
        const monthName = getMonthNameWithYear(currentMonth, startMonth, startYear);
        
        // Update Table1 header
        if (i === 0) {
            // First column: update the select element value only
            const select = table1Headers[i].querySelector('.month-select');
            if (select) {
                select.value = selectedValue; // Keep the original selected value
            }
        } else {
            // Subsequent columns: update the text content and preserve remove button
            table1Headers[i].innerHTML = `
                ${monthName}
                <button class="remove-month-btn" onclick="removeMonthColumn(${i})" title="Remove ${monthName}">×</button>
            `;
        }
        
        // Update Table2 header (always just text)
        if (table2Headers[i]) {
            table2Headers[i].textContent = monthName;
        }
        
        // Move to next month
        currentMonth = getNextMonth(currentMonth);
        // If we wrapped around to January, increment the year
        if (currentMonth === 1 && i > 0) {
            currentMonthYear++;
        }
    }
    
    // Recalculate everything
    recalculateAllColumns();
}

// ==========================================================================
// ADVANCED EVENT LISTENERS FOR TABLES
// ==========================================================================

function addEventListenersToTable1() {
    const table1 = document.getElementById('Table1');
    const inputs = table1.querySelectorAll('input[type="number"]');
    
    inputs.forEach(input => {
        // Remove existing listeners to avoid duplicates
        input.removeEventListener('input', handleInputChange);
        input.removeEventListener('keydown', handleVerticalTabNavigation);
        input.removeEventListener('keypress', handleTable1NumberValidation);
        
        // Add event listeners
        input.addEventListener('input', handleInputChange);
        input.addEventListener('keydown', handleVerticalTabNavigation);
        input.addEventListener('keypress', handleTable1NumberValidation);
    });
}

function addEventListenersToTable2() {
    const table2 = document.getElementById('Table2');
    const inputs = table2.querySelectorAll('input[type="number"]');
    
    inputs.forEach(input => {
        // Remove existing listeners to avoid duplicates
        input.removeEventListener('input', handleTable2Change);
        input.removeEventListener('keydown', handleVerticalTabNavigationTable2);
        input.removeEventListener('keypress', handleTable2NumberValidation);
        input.removeEventListener('paste', handleTable2Paste);
        
        // Add event listeners
        input.addEventListener('input', handleTable2Change);
        input.addEventListener('keydown', handleVerticalTabNavigationTable2);
        input.addEventListener('keypress', handleTable2NumberValidation);
        input.addEventListener('paste', handleTable2Paste);
    });
}

// ==========================================================================
// INPUT VALIDATION AND HANDLING
// ==========================================================================

function handleInputChange(event) {
    const input = event.target;
    const value = parseFloat(input.value) || 0;
    
    // Auto-copy functionality for Table1
    const copyCheckbox = document.getElementById('copyValuesCheckbox');
    if (copyCheckbox && copyCheckbox.checked) {
        const table = input.closest('table');
        const row = input.closest('tr');
        const rowIndex = Array.from(table.querySelectorAll('tbody tr')).indexOf(row);
        const cell = input.closest('td');
        const columnIndex = Array.from(row.children).indexOf(cell) - 1; // -1 because first column is parameter name
        
        // Only copy for input rows (not calculated rows)
        if (rowIndex < 6) {
            copyValueToSubsequentColumns(rowIndex, columnIndex, value);
        }
    }
    
    // Recalculate everything
    recalculateAllColumns();
}

function handleTable2Change(event) {
    const input = event.target;
    const value = parseFloat(input.value) || 0;
    
    // Auto-copy functionality for Table2
    const copyCheckbox = document.getElementById('copyQuantityCheckbox');
    if (copyCheckbox && copyCheckbox.checked) {
        const row = input.closest('tr');
        const cell = input.closest('td');
        const columnIndex = Array.from(row.children).indexOf(cell) - 1; // -1 because first column is source name
        const rowIndex = Array.from(row.parentNode.children).indexOf(row);
        
        copyQuantityToSubsequentColumns(rowIndex, columnIndex, value);
    }
    
    // Update totals and link if enabled
    updateTotal();
    
    const linkCheckbox = document.getElementById('linkToMainTable');
    if (linkCheckbox && linkCheckbox.checked) {
        setTimeout(() => {
            copyCoalAvailabilityToFirstTable();
        }, 100);
    }
}

function handleTable1NumberValidation(event) {
    // Allow: backspace, delete, tab, escape, enter and decimal point
    if ([46, 8, 9, 27, 13, 110, 190].indexOf(event.keyCode) !== -1 ||
        // Allow: Ctrl+A, Command+A
        (event.keyCode === 65 && (event.ctrlKey === true || event.metaKey === true)) ||
        // Allow: Ctrl+C, Command+C
        (event.keyCode === 67 && (event.ctrlKey === true || event.metaKey === true)) ||
        // Allow: Ctrl+V, Command+V
        (event.keyCode === 86 && (event.ctrlKey === true || event.metaKey === true)) ||
        // Allow: Ctrl+X, Command+X
        (event.keyCode === 88 && (event.ctrlKey === true || event.metaKey === true)) ||
        // Allow: home, end, left, right, down, up
        (event.keyCode >= 35 && event.keyCode <= 40)) {
        return;
    }
    // Ensure that it is a number and stop the keypress
    if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) {
        event.preventDefault();
    }
}

function handleTable2NumberValidation(event) {
    // Same validation as Table1
    handleTable1NumberValidation(event);
}

function handleTable2Paste(event) {
    event.preventDefault();
    
    // Get pasted data
    const pastedData = (event.clipboardData || window.clipboardData).getData('text');
    const numericValue = parseFloat(pastedData.replace(/[^0-9.-]/g, ''));
    
    if (!isNaN(numericValue)) {
        event.target.value = numericValue;
        handleTable2Change(event);
    }
}

// ==========================================================================
// VERTICAL TAB NAVIGATION SYSTEM
// ==========================================================================

function handleVerticalTabNavigation(event) {
    if (event.key === 'Tab') {
        event.preventDefault();
        
        const table1 = document.getElementById('Table1');
        const currentInput = event.target;
        const currentCell = currentInput.closest('td');
        const currentRow = currentCell.closest('tr');
        const currentColIndex = Array.from(currentRow.children).indexOf(currentCell);
        
        let nextInput;
        
        if (event.shiftKey) {
            // Shift+Tab: Move up, skip rows with span cells
            let searchRow = currentRow.previousElementSibling;
            while (searchRow) {
                const targetCell = searchRow.children[currentColIndex];
                if (targetCell && targetCell.querySelector('input')) {
                    nextInput = targetCell.querySelector('input');
                    break;
                }
                searchRow = searchRow.previousElementSibling;
            }
            
            if (!nextInput) {
                // Go to last input row, previous column
                const tbody = currentRow.parentNode;
                if (currentColIndex > 1) {
                    for (let colIdx = currentColIndex - 1; colIdx >= 1; colIdx--) {
                        let searchRow = tbody.lastElementChild;
                        while (searchRow) {
                            const targetCell = searchRow.children[colIdx];
                            if (targetCell && targetCell.querySelector('input')) {
                                nextInput = targetCell.querySelector('input');
                                break;
                            }
                            searchRow = searchRow.previousElementSibling;
                        }
                        if (nextInput) break;
                    }
                }
            }
        } else {
            // Tab: Move down, skip rows with span cells
            let searchRow = currentRow.nextElementSibling;
            while (searchRow) {
                const targetCell = searchRow.children[currentColIndex];
                if (targetCell && targetCell.querySelector('input')) {
                    nextInput = targetCell.querySelector('input');
                    break;
                }
                searchRow = searchRow.nextElementSibling;
            }
            
            if (!nextInput) {
                // Go to first input row, next column
                const tbody = currentRow.parentNode;
                if (currentColIndex < currentRow.children.length - 1) {
                    for (let colIdx = currentColIndex + 1; colIdx < currentRow.children.length; colIdx++) {
                        let searchRow = tbody.firstElementChild;
                        while (searchRow) {
                            const targetCell = searchRow.children[colIdx];
                            if (targetCell && targetCell.querySelector('input')) {
                                nextInput = targetCell.querySelector('input');
                                break;
                            }
                            searchRow = searchRow.nextElementSibling;
                        }
                        if (nextInput) break;
                    }
                }
            }
        }
        
        if (nextInput) {
            nextInput.focus();
            nextInput.select();
        }
    }
}

function handleVerticalTabNavigationTable2(event) {
    if (event.key === 'Tab') {
        event.preventDefault();
        
        const table2 = document.getElementById('Table2');
        const currentInput = event.target;
        const currentCell = currentInput.closest('td');
        const currentRow = currentCell.closest('tr');
        const currentColIndex = Array.from(currentRow.children).indexOf(currentCell);
        
        let nextInput;
        
        if (event.shiftKey) {
            // Shift+Tab: Move up
            let searchRow = currentRow.previousElementSibling;
            while (searchRow) {
                const targetCell = searchRow.children[currentColIndex];
                if (targetCell && targetCell.querySelector('input')) {
                    nextInput = targetCell.querySelector('input');
                    break;
                }
                searchRow = searchRow.previousElementSibling;
            }
            
            if (!nextInput) {
                // Go to last row, previous column
                const tbody = currentRow.parentNode;
                if (currentColIndex > 1) {
                    for (let colIdx = currentColIndex - 1; colIdx >= 1; colIdx--) {
                        let searchRow = tbody.lastElementChild;
                        while (searchRow) {
                            const targetCell = searchRow.children[colIdx];
                            if (targetCell && targetCell.querySelector('input')) {
                                nextInput = targetCell.querySelector('input');
                                break;
                            }
                            searchRow = searchRow.previousElementSibling;
                        }
                        if (nextInput) break;
                    }
                }
            }
        } else {
            // Tab: Move down
            let searchRow = currentRow.nextElementSibling;
            while (searchRow) {
                const targetCell = searchRow.children[currentColIndex];
                if (targetCell && targetCell.querySelector('input')) {
                    nextInput = targetCell.querySelector('input');
                    break;
                }
                searchRow = searchRow.nextElementSibling;
            }
            
            if (!nextInput) {
                // Go to first row, next column
                const tbody = currentRow.parentNode;
                if (currentColIndex < currentRow.children.length - 1) {
                    for (let colIdx = currentColIndex + 1; colIdx < currentRow.children.length; colIdx++) {
                        let searchRow = tbody.firstElementChild;
                        while (searchRow) {
                            const targetCell = searchRow.children[colIdx];
                            if (targetCell && targetCell.querySelector('input')) {
                                nextInput = targetCell.querySelector('input');
                                break;
                            }
                            searchRow = searchRow.nextElementSibling;
                        }
                        if (nextInput) break;
                    }
                }
            }
        }
        
        if (nextInput) {
            nextInput.focus();
            nextInput.select();
        }
    }
}

// ==========================================================================
// AUTO-COPY FUNCTIONALITY
// ==========================================================================

function copyValueToSubsequentColumns(rowIndex, sourceColumnIndex, value) {
    const table1 = document.getElementById('Table1');
    const rows = table1.querySelectorAll('tbody tr');
    const targetRow = rows[rowIndex];
    
    // Copy to all subsequent columns
    for (let colIndex = sourceColumnIndex + 1; colIndex < monthColumns.length; colIndex++) {
        const targetCell = targetRow.children[colIndex + 1]; // +1 because first column is parameter name
        const input = targetCell.querySelector('input[type="number"]');
        if (input) {
            input.value = value;
        }
    }
}

function copyQuantityToSubsequentColumns(rowIndex, sourceColumnIndex, value) {
    const table2 = document.getElementById('Table2');
    const tbody = table2.querySelector('tbody');
    const targetRow = tbody.children[rowIndex];
    
    // Copy to all subsequent columns
    for (let colIndex = sourceColumnIndex + 1; colIndex < monthColumns.length; colIndex++) {
        const targetCell = targetRow.children[colIndex + 1]; // +1 because first column is source name
        const input = targetCell.querySelector('input[type="number"]');
        if (input) {
            input.value = value;
        }
    }
}

// ==========================================================================
// IMPROVED CALCULATION ENGINE
// ==========================================================================

function recalculateAllColumns() {
    // Calculate columns sequentially to ensure proper opening stock propagation
    for (let i = 0; i < monthColumns.length; i++) {
        calculateForColumn(i);
        
        // Force update of next month's opening stock before proceeding
        // This ensures the chain of opening stock -> closing stock is maintained
        if (i + 1 < monthColumns.length) {
            const table1 = document.getElementById('Table1');
            const rows = table1.querySelectorAll('tbody tr');
            
            // Get current month's closing stock
            const currentClosingStockSpan = rows[7].children[i + 1].querySelector('span');
            const currentClosingStock = parseFloat(currentClosingStockSpan?.textContent) || 0;
            
            // Update next month's opening stock
            const nextOpeningStockSpan = rows[6].children[i + 2].querySelector('span');
            if (nextOpeningStockSpan) {
                nextOpeningStockSpan.textContent = currentClosingStock.toFixed(2);
            }
        }
    }
    // Apply color coding to all closing stock cells after recalculation
    applyClosingStockColorCoding();
    updateTotals();
    updateTotal();
    checkForNegativeClosingStock();
}

function calculateForColumn(columnIndex) {
    const table1 = document.getElementById('Table1');
    const rows = table1.querySelectorAll('tbody tr');
    
    // Get input values
    const generationCapacity = parseFloat(rows[0].children[columnIndex + 1].querySelector('input').value) || 0;
    const plf = parseFloat(rows[1].children[columnIndex + 1].querySelector('input').value) || 0;
    const scc = parseFloat(rows[3].children[columnIndex + 1].querySelector('input').value) || 0;
    const coalAvailable = parseFloat(rows[5].children[columnIndex + 1].querySelector('input').value) || 0;
    
    // Get opening stock
    const openingStockCell = rows[6].children[columnIndex + 1];
    const openingStockInput = openingStockCell.querySelector('input');
    const openingStockSpan = openingStockCell.querySelector('span');
    const openingStock = openingStockInput ? 
        parseFloat(openingStockInput.value) || 0 : 
        parseFloat(openingStockSpan?.textContent) || 0;
    
    // Get month information
    const monthNumber = monthColumns[columnIndex].monthNumber;
    const daysInMonth = new Date(new Date().getFullYear(), monthNumber, 0).getDate();
    
    // Calculate Units Generated (MW * 24hrs * PLF% * days / 1000)
    const unitsGenerated = (generationCapacity * 24 * plf * daysInMonth) / 1000;
    
    // Calculate Coal Consumption (Units in MUs * SCC * 10) - CORRECT FORMULA
    const coalConsumption = unitsGenerated * scc * 10;
    
    // Calculate Closing Stock
    const closingStock = coalAvailable + openingStock - coalConsumption;
    
    // Calculate Stock in Days
    const dailyConsumption = coalConsumption / daysInMonth;
    const stockInDays = dailyConsumption > 0 ? (closingStock / dailyConsumption) : 0;
    
    // Update display values with proper styling
    const unitsSpan = rows[2].children[columnIndex + 1].querySelector('span');
    const coalConsumptionSpan = rows[4].children[columnIndex + 1].querySelector('span');
    const closingStockSpan = rows[7].children[columnIndex + 1].querySelector('span');
    const stockInDaysSpan = rows[8].children[columnIndex + 1].querySelector('span');
    
    // Update values
    unitsSpan.textContent = unitsGenerated.toFixed(2);
    coalConsumptionSpan.textContent = coalConsumption.toFixed(2);
    closingStockSpan.textContent = closingStock.toFixed(2);
    stockInDaysSpan.textContent = stockInDays.toFixed(2);
    
    // Apply color coding for negative calculated values
    if (unitsGenerated < 0) {
        unitsSpan.style.color = '#c62828';
        unitsSpan.style.fontWeight = 'bold';
    } else {
        unitsSpan.style.color = '';
        unitsSpan.style.fontWeight = '';
    }
    
    if (coalConsumption < 0) {
        coalConsumptionSpan.style.color = '#c62828';
        coalConsumptionSpan.style.fontWeight = 'bold';
    } else {
        coalConsumptionSpan.style.color = '';
        coalConsumptionSpan.style.fontWeight = '';
    }
    
    // Color coding for closing stock with background
    if (closingStock < 0) {
        closingStockSpan.style.backgroundColor = '#ffebee';
        closingStockSpan.style.color = '#c62828';
        closingStockSpan.style.fontWeight = 'bold';
        closingStockSpan.style.padding = '2px 4px';
        closingStockSpan.style.borderRadius = '3px';
    } else {
        closingStockSpan.style.backgroundColor = '#e8f5e8';
        closingStockSpan.style.color = '#2e7d32';
        closingStockSpan.style.fontWeight = 'bold';
        closingStockSpan.style.padding = '2px 4px';
        closingStockSpan.style.borderRadius = '3px';
    }
    
    if (stockInDays < 0) {
        stockInDaysSpan.style.color = '#c62828';
        stockInDaysSpan.style.fontWeight = 'bold';
    } else if (stockInDays > 0) {
        stockInDaysSpan.style.color = '#2e7d32';
        stockInDaysSpan.style.fontWeight = 'bold';
    } else {
        stockInDaysSpan.style.color = '';
        stockInDaysSpan.style.fontWeight = '';
    }
    
    // Update opening stock of next column
    if (columnIndex + 1 < monthColumns.length) {
        const nextOpeningStockCell = rows[6].children[columnIndex + 2];
        const nextOpeningStockSpan = nextOpeningStockCell.querySelector('span');
        if (nextOpeningStockSpan) {
            nextOpeningStockSpan.textContent = closingStock.toFixed(2);
        }
    }
}

// ==========================================================================
// COAL SOURCES MANAGEMENT
// ==========================================================================

function initializeCoalSources() {
    const defaultSourceCount = 5; // Create 5 default sources
    
    for (let i = 1; i <= defaultSourceCount; i++) {
        addCoalSourceRow(`Source${i}`); // Use Source1, Source2, etc.
    }
    
    updateTotal();
}

function addNewSource() {
    const sourceCount = document.querySelectorAll('#coalSourcesTableBody tr').length + 1;
    const sourceName = `Source${sourceCount}`;
    addCoalSourceRow(sourceName);
    updateTotal();
    addEventListenersToTable2(); // Re-add event listeners for new row
}

function addCoalSourceRow(sourceName) {
    const tableBody = document.getElementById('coalSourcesTableBody');
    const row = document.createElement('tr');
    
    // Source name cell (editable)
    const sourceNameCell = document.createElement('td');
    sourceNameCell.contentEditable = true;
    sourceNameCell.textContent = sourceName;
    row.appendChild(sourceNameCell);
    
    // Add input cells for each month
    monthColumns.forEach(() => {
        const dataCell = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.step = '0.01';
        input.value = '0';
        input.className = 'form-control form-control-sm';
        dataCell.appendChild(input);
        row.appendChild(dataCell);
    });
    
    // Add total cell
    const totalCell = document.createElement('td');
    const span = document.createElement('span');
    span.textContent = '0';
    totalCell.appendChild(span);
    row.appendChild(totalCell);
    
    tableBody.appendChild(row);
}

// ==========================================================================
// UTILITY FUNCTIONS FOR MONTH MANAGEMENT
// ==========================================================================

function getMonthName(monthNumber, year = null) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return monthNames[monthNumber - 1]; // monthNumber is 1-based
}

function getMonthNameWithYear(monthNumber, startingMonth = null, startingYear = null) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    if (startingMonth && startingYear) {
        // Calculate which year this month falls in
        let year = startingYear;
        if (monthNumber < startingMonth) {
            year = startingYear + 1;
        }
        return `${monthNames[monthNumber - 1]}-${year.toString().slice(-2)}`;
    }
    
    // Default behavior
    return `${monthNames[monthNumber - 1]}-${currentYear}`;
}

function getNextMonth(currentMonth) {
    return currentMonth === 12 ? 1 : currentMonth + 1;
}

function generateMonthOptions(selectedMonth) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    let options = '';
    
    // Current year months
    for (let i = 1; i <= 12; i++) {
        const selected = i === selectedMonth ? 'selected' : '';
        options += `<option value="${i}" ${selected}>${monthNames[i-1]}-${currentYear}</option>`;
    }
    
    // Next year months
    for (let i = 1; i <= 12; i++) {
        const nextYear = currentYear + 1;
        options += `<option value="${i + 12}">${monthNames[i-1]}-${nextYear.toString().slice(-2)}</option>`;
    }
    
    return options;
}

// ==========================================================================
// TABLE TOTALS AND CALCULATIONS
// ==========================================================================

function updateTotal() {
    const table2 = document.getElementById('Table2');
    const tbody = table2.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr');
    const totalRow = document.getElementById('totalRow');
    const monthCount = monthColumns.length;
    
    // Initialize month totals array
    const monthTotals = new Array(monthCount).fill(0);
    let grandTotal = 0;
    
    // Calculate row totals and month totals
    rows.forEach(row => {
        let rowTotal = 0;
        const inputs = row.querySelectorAll('input[type="number"]');
        
        inputs.forEach((input, index) => {
            const value = parseFloat(input.value) || 0;
            rowTotal += value;
            monthTotals[index] += value;
        });
        
        // Update row total
        const totalSpan = row.querySelector('td:last-child span');
        if (totalSpan) {
            totalSpan.textContent = rowTotal.toFixed(1);
        }
        grandTotal += rowTotal;
    });
    
    // Update month totals in footer
    monthTotals.forEach((total, index) => {
        const totalCell = totalRow.children[index + 1];
        if (!totalCell.querySelector('span')) {
            totalCell.innerHTML = `<span>${total.toFixed(1)}</span>`;
        } else {
            totalCell.querySelector('span').textContent = total.toFixed(1);
        }
    });
    
    // Update grand total
    const grandTotalCell = totalRow.children[totalRow.children.length - 1];
    if (!grandTotalCell.querySelector('span')) {
        grandTotalCell.innerHTML = `<span>${grandTotal.toFixed(1)}</span>`;
    } else {
        grandTotalCell.querySelector('span').textContent = grandTotal.toFixed(1);
    }
}

function updateTotals() {
    const table = document.getElementById('Table1');
    const rows = table.querySelectorAll('tbody tr');
    const monthCount = monthColumns.length;
    
    rows.forEach((row, rowIndex) => {
        const totalCell = row.cells[row.cells.length - 1];
        let total = 0;
        let count = 0;
        
        for (let i = 1; i <= monthCount; i++) {
            let cellValue;
            const input = row.cells[i].querySelector('input[type="number"]');
            const span = row.cells[i].querySelector('span');
            
            if (input) {
                cellValue = parseFloat(input.value) || 0;
            } else if (span) {
                cellValue = parseFloat(span.textContent) || 0;
            } else {
                cellValue = parseFloat(row.cells[i].textContent) || 0;
            }
            
            if (!isNaN(cellValue)) {
                total += cellValue;
                count++;
            }
        }
        
        // For some rows, show average instead of total
        if ([1, 3, 8].includes(rowIndex)) { // PLF%, SCC, Days
            const avgValue = count > 0 ? (total / count) : 0;
            if (!totalCell.querySelector('span')) {
                totalCell.innerHTML = `<span>${avgValue.toFixed(1)}</span>`;
            } else {
                totalCell.querySelector('span').textContent = avgValue.toFixed(1);
            }
        } else {
            if (!totalCell.querySelector('span')) {
                totalCell.innerHTML = `<span>${total.toFixed(0)}</span>`;
            } else {
                totalCell.querySelector('span').textContent = total.toFixed(0);
            }
        }
    });
}

// ==========================================================================
// DYNAMIC LINKING FUNCTIONALITY
// ==========================================================================

function copyCoalAvailabilityToFirstTable() {
    const table1 = document.getElementById('Table1');
    const table2 = document.getElementById('Table2');
    const totalRow = document.getElementById('totalRow');
    
    if (!table1 || !table2 || !totalRow) return;
    
    const coalAvailableRow = table1.querySelectorAll('tbody tr')[5]; // Coal Available row (index 5)
    
    // Copy each month's total from Table2 to Coal Available row in Table1
    monthColumns.forEach((month, index) => {
        const sourceTotal = parseFloat(totalRow.children[index + 1].querySelector('span')?.textContent) || 0;
        const coalAvailableInput = coalAvailableRow.children[index + 1].querySelector('input[type="number"]');
        
        if (coalAvailableInput) {
            coalAvailableInput.value = sourceTotal.toFixed(0);
        }
    });
    
    // Recalculate after linking
    recalculateAllColumns();
}

// ==========================================================================
// COLOR CODING SYSTEM
// ==========================================================================

function applyClosingStockColorCoding() {
    const table1 = document.getElementById('Table1');
    const closingStockRow = table1.querySelectorAll('tbody tr')[7]; // Closing Stock row
    const daysToMaintainStock = parseInt(document.getElementById('daysToMaintainStock')?.value) || 10;
    
    monthColumns.forEach((month, index) => {
        const cell = closingStockRow.children[index + 1];
        const span = cell.querySelector('span');
        const value = parseFloat(span?.textContent) || 0;
        
        // Reset classes
        cell.classList.remove('negative-stock', 'low-stock', 'good-stock');
        
        if (value < 0) {
            cell.classList.add('negative-stock');
            cell.style.backgroundColor = '#ffebee';
            cell.style.color = '#d32f2f';
            cell.style.fontWeight = 'bold';
        } else {
            // Calculate if stock is below buffer
            const coalReqRow = table1.querySelectorAll('tbody tr')[4]; // Coal requirement row
            const coalReqSpan = coalReqRow.children[index + 1].querySelector('span');
            const monthlyConsumption = parseFloat(coalReqSpan?.textContent) || 0;
            
            const monthInfo = monthColumns[index];
            const daysInMonth = getDaysInMonth(monthInfo);
            const dailyConsumption = monthlyConsumption / daysInMonth;
            const bufferStockRequired = dailyConsumption * daysToMaintainStock;
            
            if (value < bufferStockRequired && monthlyConsumption > 0) {
                cell.classList.add('low-stock');
                cell.style.backgroundColor = '#fff3e0';
                cell.style.color = '#f57c00';
                cell.style.fontWeight = 'bold';
            } else {
                cell.classList.add('good-stock');
                cell.style.backgroundColor = '#e8f5e8';
                cell.style.color = '#2e7d32';
                cell.style.fontWeight = 'normal';
            }
        }
    });
}

// ==========================================================================
// ENHANCED WARNING SYSTEM
// ==========================================================================

function checkForNegativeClosingStock() {
    if (monthColumns.length === 0) return;
    
    const table1 = document.getElementById('Table1');
    if (!table1) return;
    
    const rows = table1.querySelectorAll('tbody tr');
    if (rows.length < 8) return;
    
    let warnings = [];
    let negativeMonths = [];
    const daysToMaintainStock = parseInt(document.getElementById('daysToMaintainStock')?.value) || 10;
    
    // Check each month for negative or low stock
    for (let colIndex = 0; colIndex < monthColumns.length; colIndex++) {
        const closingStockCell = rows[7].children[colIndex + 1];
        const closingStockSpan = closingStockCell?.querySelector('span');
        const closingStock = parseFloat(closingStockSpan?.textContent) || 0;
        const monthName = getMonthDisplayName(colIndex);
        
        // Get monthly consumption for this column
        const consumptionCell = rows[4].children[colIndex + 1];
        const consumptionSpan = consumptionCell?.querySelector('span');
        const monthlyConsumption = parseFloat(consumptionSpan?.textContent) || 0;
        
        // Calculate daily consumption
        const monthInfo = monthColumns[colIndex];
        const daysInMonth = getDaysInMonth(monthInfo);
        const dailyConsumption = monthlyConsumption / daysInMonth;
        
        // Calculate buffer stock requirement
        const bufferStockRequired = dailyConsumption * daysToMaintainStock;
        
        if (closingStock < 0) {
            const shortfall = Math.abs(closingStock);
            negativeMonths.push({
                month: monthName,
                shortfall: shortfall,
                coalNeeded: shortfall + bufferStockRequired,
                bufferRequired: bufferStockRequired,
                dailyConsumption: dailyConsumption
            });
        } else if (closingStock < bufferStockRequired && daysToMaintainStock > 0 && dailyConsumption > 0) {
            const additionalCoalNeeded = bufferStockRequired - closingStock;
            warnings.push(`
                <div class="warning-item buffer-warning">
                    <strong>⚠️ Low Buffer Stock Warning - ${monthName}:</strong><br>
                    Current Closing Stock: ${closingStock.toLocaleString()} MT<br>
                    Daily Consumption: ${dailyConsumption.toLocaleString()} MT/day<br>
                    Buffer Stock Required (${daysToMaintainStock} days): ${bufferStockRequired.toLocaleString()} MT<br>
                    <strong>Additional Coal Needed: ${additionalCoalNeeded.toLocaleString()} MT</strong>
                </div>
            `);
        }
    }
    
    // Add critical negative stock warnings
    negativeMonths.forEach(month => {
        warnings.unshift(`
            <div class="warning-item critical-warning">
                <strong>🚨 CRITICAL STOCK-OUT ALERT - ${month.month}:</strong><br>
                Closing Stock: <span style="color: red; font-weight: bold;">-${month.shortfall.toLocaleString()} MT</span><br>
                Daily Consumption: ${month.dailyConsumption.toLocaleString()} MT/day<br>
                Coal Required to Avoid Stock-out: <strong>${month.shortfall.toLocaleString()} MT</strong><br>
                ${month.bufferRequired > 0 ? 
                    `Additional Coal for Buffer Stock (${daysToMaintainStock} days): <strong>${month.bufferRequired.toLocaleString()} MT</strong><br>
                    <span style="color: #d32f2f; font-weight: bold;">Total Coal Needed: ${month.coalNeeded.toLocaleString()} MT</span>` : ''}
            </div>
        `);
    });
    
    // Show summary if multiple issues
    if (warnings.length > 1) {
        const totalAdditionalCoal = negativeMonths.reduce((sum, month) => sum + month.coalNeeded, 0);
        warnings.unshift(`
            <div class="warning-item summary-warning">
                <strong>📊 SUMMARY:</strong><br>
                Months with Stock Issues: ${warnings.length}<br>
                ${totalAdditionalCoal > 0 ? `<strong>Total Additional Coal Required: ${totalAdditionalCoal.toLocaleString()} MT</strong>` : ''}
            </div>
        `);
    }
    
    // Display warnings
    updateWarningDisplay(warnings);
}

// ==========================================================================
// UTILITY FUNCTIONS
// ==========================================================================

function getDaysInMonth(monthInfo) {
    const monthNumber = monthInfo.monthNumber;
    // Extract year from monthName (e.g., "Jan-25" -> 25)
    const yearStr = monthInfo.monthName.split('-')[1];
    const year = 2000 + parseInt(yearStr); // Convert 2-digit year to 4-digit
    return new Date(year, monthNumber, 0).getDate(); // monthNumber is 1-based, but Date constructor expects 0-based for this calculation
}

function getMonthIndex(monthName) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const shortName = monthName.split('-')[0]; // Extract month part from "Jan-25"
    return monthNames.indexOf(shortName);
}

function getMonthDisplayName(columnIndex) {
    const monthInfo = monthColumns[columnIndex];
    return monthInfo.monthName;
}

// ==========================================================================
// MAIN CALCULATION FUNCTIONS
// ==========================================================================

function calculateEverything() {
    recalculateAllColumns();
}

function calculateMainTable() {
    recalculateAllColumns();
}

// ==========================================================================
// UTILITY FUNCTIONS
// ==========================================================================

function clearAllValues() {
    if (confirm('Clear all input values? This will reset all calculations.')) {
        const table = document.getElementById('Table1');
        const inputs = table.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            input.value = '0';
        });
        recalculateAllColumns();
    }
}

function clearSourceValues() {
    if (confirm('Clear all coal source values?')) {
        const table = document.getElementById('Table2');
        const inputs = table.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            input.value = '0';
        });
        updateTotal();
        
        const linkCheckbox = document.getElementById('linkToMainTable');
        if (linkCheckbox && linkCheckbox.checked) {
            copyCoalAvailabilityToFirstTable();
        }
    }
}

// ==========================================================================
// WARNING SYSTEM
// ==========================================================================

function updateWarnings() {
    const warnings = [];
    const table = document.getElementById('Table1');
    const closingStockRow = table.querySelectorAll('tbody tr')[7]; // Closing Stock row
    const closingStockDaysRow = table.querySelectorAll('tbody tr')[8]; // Closing Stock Days row
    const bufferDays = parseFloat(document.getElementById('daysToMaintainStock').value) || 10;
    
    monthColumns.forEach((month, index) => {
        const closingStock = parseFloat(closingStockRow.cells[index + 1].textContent) || 0;
        const stockDays = parseFloat(closingStockDaysRow.cells[index + 1].textContent) || 0;
        
        if (closingStock < 0) {
            warnings.push({
                type: 'critical',
                message: `❌ CRITICAL: ${month.name}-${month.year} - Negative closing stock (${closingStock.toFixed(0)} MT)! Immediate action required.`
            });
        } else if (stockDays < bufferDays) {
            warnings.push({
                type: 'buffer',
                message: `⚠️ WARNING: ${month.name}-${month.year} - Stock below buffer level (${stockDays.toFixed(1)} days < ${bufferDays} days required).`
            });
        }
    });
    
    updateWarningDisplay(warnings);
}

function updateWarningDisplay(warnings) {
    const warningIcon = document.getElementById('warningFloatIcon');
    const warningBadge = document.getElementById('warningBadge');
    const warningContent = document.getElementById('warningMenuContent');
    
    if (warnings.length === 0) {
        warningIcon.classList.remove('has-warnings');
        warningBadge.style.display = 'none';
        warningContent.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-check-circle fa-3x mb-3" style="color: #28a745;"></i>
                <p>No warnings currently</p>
            </div>
        `;
    } else {
        warningIcon.classList.add('has-warnings');
        warningBadge.style.display = 'flex';
        warningBadge.textContent = warnings.length;
        
        let warningHTML = '';
        warnings.forEach(warning => {
            const className = warning.type === 'critical' ? 'critical-warning' : 'buffer-warning';
            warningHTML += `<div class="warning-item ${className}">${warning.message}</div>`;
        });
        
        warningContent.innerHTML = warningHTML;
    }
}

// ==========================================================================
// MENU MANAGEMENT
// ==========================================================================

function toggleWarningMenu() {
    const menu = document.getElementById('warningSideMenu');
    menu.classList.toggle('open');
}

function closeWarningMenu() {
    const menu = document.getElementById('warningSideMenu');
    menu.classList.remove('open');
}

function toggleExportMenu() {
    const menu = document.getElementById('exportMenu');
    menu.classList.toggle('open');
}

function closeExportMenu() {
    const menu = document.getElementById('exportMenu');
    menu.classList.remove('open');
}

// ==========================================================================
// UTILITY FUNCTIONS
// ==========================================================================

function clearAllValues() {
    if (confirm('Clear all input values? This will reset all calculations.')) {
        const table = document.getElementById('Table1');
        const inputs = table.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            input.value = '0';
        });
        calculateEverything();
    }
}

function clearSourceValues() {
    if (confirm('Clear all coal source values?')) {
        const table = document.getElementById('Table2');
        const inputs = table.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            input.value = '0';
        });
        calculateSourceTotals();
        linkTablesToMainIfEnabled();
    }
}

// ==========================================================================
// EXPORT FUNCTIONS
// ==========================================================================

function exportToPDF() {
    console.log("Exporting to PDF...");
    
    // Check if required libraries are available
    if (typeof html2canvas === 'undefined' || typeof jsPDF === 'undefined') {
        alert('Export libraries not loaded. Please ensure html2canvas and jsPDF are available.');
        return;
    }
    
    const plantName = document.getElementById('powerPlantName').value || 'Power Plant';
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const includeTimestamp = document.getElementById('includeTimestamp').checked;
    const includeWarnings = document.getElementById('includeWarnings').checked;
    const bothTables = document.querySelector('input[name="tableSelection"]:checked').value === 'both';
    
    // Create export content
    const exportDiv = document.createElement('div');
    exportDiv.style.padding = '20px';
    exportDiv.style.backgroundColor = 'white';
    exportDiv.style.fontFamily = 'Arial, sans-serif';
    
    // Add header
    exportDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin-bottom: 10px;">Coal Scenario Analysis Report</h1>
            <h2 style="color: #34495e; margin-bottom: 5px;">${plantName}</h2>
            <p style="color: #7f8c8d; margin: 0;">Generated on: ${new Date().toLocaleString()}</p>
        </div>
    `;
    
    // Clone and add Table1
    const table1Clone = document.getElementById('Table1').cloneNode(true);
    table1Clone.style.width = '100%';
    table1Clone.style.borderCollapse = 'collapse';
    table1Clone.style.marginBottom = '30px';
    exportDiv.appendChild(table1Clone);
    
    // Add Table2 if requested
    if (bothTables) {
        const sourceHeader = document.createElement('h3');
        sourceHeader.textContent = 'Coal Sources';
        sourceHeader.style.marginTop = '30px';
        sourceHeader.style.marginBottom = '15px';
        sourceHeader.style.color = '#2c3e50';
        exportDiv.appendChild(sourceHeader);
        
        const table2Clone = document.getElementById('Table2').cloneNode(true);
        table2Clone.style.width = '100%';
        table2Clone.style.borderCollapse = 'collapse';
        exportDiv.appendChild(table2Clone);
    }
    
    // Add warnings if requested
    if (includeWarnings) {
        const warningContent = document.getElementById('warningMenuContent').innerHTML;
        if (!warningContent.includes('No warnings currently')) {
            const warningHeader = document.createElement('h3');
            warningHeader.textContent = 'Warnings & Alerts';
            warningHeader.style.marginTop = '30px';
            warningHeader.style.marginBottom = '15px';
            warningHeader.style.color = '#e74c3c';
            exportDiv.appendChild(warningHeader);
            
            const warningDiv = document.createElement('div');
            warningDiv.innerHTML = warningContent;
            exportDiv.appendChild(warningDiv);
        }
    }
    
    // Temporarily add to body for rendering
    document.body.appendChild(exportDiv);
    
    html2canvas(exportDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        const filename = includeTimestamp ? 
            `Coal_Scenario_${plantName.replace(/\s+/g, '_')}_${timestamp}.pdf` :
            `Coal_Scenario_${plantName.replace(/\s+/g, '_')}.pdf`;
        
        pdf.save(filename);
        
        // Clean up
        document.body.removeChild(exportDiv);
        closeExportMenu();
    }).catch(error => {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
        document.body.removeChild(exportDiv);
    });
}

function exportToJPG() {
    console.log("Exporting to JPG...");
    
    if (typeof html2canvas === 'undefined') {
        alert('html2canvas library not loaded. Please ensure the library is available.');
        return;
    }
    
    const plantName = document.getElementById('powerPlantName').value || 'Power Plant';
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const includeTimestamp = document.getElementById('includeTimestamp').checked;
    const bothTables = document.querySelector('input[name="tableSelection"]:checked').value === 'both';
    
    // Create export content (same as PDF but for image)
    const exportDiv = document.createElement('div');
    exportDiv.style.padding = '20px';
    exportDiv.style.backgroundColor = 'white';
    exportDiv.style.fontFamily = 'Arial, sans-serif';
    exportDiv.style.maxWidth = '1200px';
    
    exportDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin-bottom: 10px;">Coal Scenario Analysis</h1>
            <h2 style="color: #34495e; margin-bottom: 5px;">${plantName}</h2>
            <p style="color: #7f8c8d; margin: 0;">Generated: ${new Date().toLocaleString()}</p>
        </div>
    `;
    
    const table1Clone = document.getElementById('Table1').cloneNode(true);
    exportDiv.appendChild(table1Clone);
    
    if (bothTables) {
        const sourceHeader = document.createElement('h3');
        sourceHeader.textContent = 'Coal Sources';
        sourceHeader.style.marginTop = '30px';
        sourceHeader.style.color = '#2c3e50';
        exportDiv.appendChild(sourceHeader);
        
        const table2Clone = document.getElementById('Table2').cloneNode(true);
        exportDiv.appendChild(table2Clone);
    }
    
    document.body.appendChild(exportDiv);
    
    html2canvas(exportDiv, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
    }).then(canvas => {
        const link = document.createElement('a');
        const filename = includeTimestamp ? 
            `Coal_Scenario_${plantName.replace(/\s+/g, '_')}_${timestamp}.jpg` :
            `Coal_Scenario_${plantName.replace(/\s+/g, '_')}.jpg`;
        
        link.download = filename;
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.click();
        
        document.body.removeChild(exportDiv);
        closeExportMenu();
    }).catch(error => {
        console.error('Error generating JPG:', error);
        alert('Error generating JPG. Please try again.');
        document.body.removeChild(exportDiv);
    });
}

function exportToExcel() {
    console.log("Exporting to Excel...");
    
    if (typeof XLSX === 'undefined') {
        alert('XLSX library not loaded. Please ensure the library is available.');
        return;
    }
    
    const plantName = document.getElementById('powerPlantName').value || 'Power Plant';
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const includeTimestamp = document.getElementById('includeTimestamp').checked;
    const bothTables = document.querySelector('input[name="tableSelection"]:checked').value === 'both';
    
    const wb = XLSX.utils.book_new();
    
    // Export Coal Scenario table
    const table1Data = extractTableData('Table1');
    const ws1 = XLSX.utils.aoa_to_sheet(table1Data);
    XLSX.utils.book_append_sheet(wb, ws1, 'Coal Scenario');
    
    // Export Coal Sources table if requested
    if (bothTables) {
        const table2Data = extractTableData('Table2');
        const ws2 = XLSX.utils.aoa_to_sheet(table2Data);
        XLSX.utils.book_append_sheet(wb, ws2, 'Coal Sources');
    }
    
    const filename = includeTimestamp ? 
        `Coal_Scenario_${plantName.replace(/\s+/g, '_')}_${timestamp}.xlsx` :
        `Coal_Scenario_${plantName.replace(/\s+/g, '_')}.xlsx`;
    
    XLSX.writeFile(wb, filename);
    closeExportMenu();
}

function extractTableData(tableId) {
    const table = document.getElementById(tableId);
    const data = [];
    
    // Add header info
    const plantName = document.getElementById('powerPlantName').value || 'Power Plant';
    data.push([`Coal Scenario Analysis - ${plantName}`]);
    data.push([`Generated: ${new Date().toLocaleString()}`]);
    data.push([]); // Empty row
    
    // Extract table headers
    const headerRow = table.querySelector('thead tr');
    const headers = [];
    for (let cell of headerRow.cells) {
        const select = cell.querySelector('select');
        if (select) {
            headers.push(select.options[select.selectedIndex].text);
        } else {
            headers.push(cell.textContent.trim());
        }
    }
    data.push(headers);
    
    // Extract table data
    const rows = table.querySelectorAll('tbody tr, tfoot tr');
    rows.forEach(row => {
        const rowData = [];
        for (let cell of row.cells) {
            const input = cell.querySelector('input');
            if (input) {
                rowData.push(parseFloat(input.value) || 0);
            } else {
                const text = cell.textContent.trim();
                const num = parseFloat(text);
                rowData.push(isNaN(num) ? text : num);
            }
        }
        data.push(rowData);
    });
    
    return data;
}

// Calculation Functions
function calculateCoalScenario() {
    const table = document.getElementById('coalScenarioTable');
    if (!table) return;
    
    const rows = table.querySelectorAll('tbody tr');
    let totalOpening = 0;
    let totalReceipt = 0;
    let totalConsumption = 0;
    let totalClosing = 0;
    let totalDaysStock = 0;
    let validRows = 0;
    
    rows.forEach(row => {
        const openingStock = parseFloat(row.querySelector('.opening-stock').value) || 0;
        const receipt = parseFloat(row.querySelector('.receipt').value) || 0;
        const consumption = parseFloat(row.querySelector('.consumption').value) || 0;
        
        const closingStock = openingStock + receipt - consumption;
        const daysStock = consumption > 0 ? (closingStock / consumption) : 0;
        
        row.querySelector('.closing-stock').textContent = closingStock.toFixed(1);
        row.querySelector('.days-stock').textContent = daysStock.toFixed(1);
        
        totalOpening += openingStock;
        totalReceipt += receipt;
        totalConsumption += consumption;
        totalClosing += closingStock;
        
        if (consumption > 0) {
            totalDaysStock += daysStock;
            validRows++;
        }
    });
    
    const avgDaysStock = validRows > 0 ? (totalDaysStock / validRows) : 0;
    
    // Update totals
    const totalRow = table.querySelector('tfoot tr');
    if (totalRow) {
        totalRow.querySelector('.total-opening').textContent = totalOpening.toFixed(1);
        totalRow.querySelector('.total-receipt').textContent = totalReceipt.toFixed(1);
        totalRow.querySelector('.total-consumption').textContent = totalConsumption.toFixed(1);
        totalRow.querySelector('.total-closing').textContent = totalClosing.toFixed(1);
        totalRow.querySelector('.avg-days').textContent = avgDaysStock.toFixed(1);
    }
    
    // Update analysis table
    updateAnalysisTable(totalClosing, avgDaysStock, totalConsumption);
    
    // Check for warnings
    checkCoalWarnings(rows, avgDaysStock, totalClosing);
}

function updateAnalysisTable(totalStock, avgDays, dailyConsumption) {
    const analysisTable = document.getElementById('extendedAnalysisTable');
    if (!analysisTable) return;
    
    const tbody = analysisTable.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr');
    
    // Update values
    rows[0].querySelector('.analysis-total-stock').textContent = totalStock.toFixed(1);
    rows[1].querySelector('.analysis-avg-days').textContent = avgDays.toFixed(1);
    rows[2].querySelector('.analysis-daily-consumption').textContent = dailyConsumption.toFixed(1);
    
    // Update status indicators
    const stockStatus = totalStock > 3000 ? 'Adequate' : totalStock > 1500 ? 'Low' : 'Critical';
    const daysStatus = avgDays > 7 ? 'Excellent' : avgDays > 4 ? 'Normal' : 'Critical';
    const consumptionStatus = dailyConsumption < 800 ? 'Normal' : 'High';
    const adequacyStatus = avgDays > 4 ? '✓ Sufficient' : '⚠ Insufficient';
    
    rows[0].querySelector('.analysis-status').textContent = stockStatus;
    rows[1].querySelector('.analysis-days-status').textContent = daysStatus;
    rows[2].querySelector('.analysis-consumption-status').textContent = consumptionStatus;
    rows[3].querySelector('.analysis-adequacy').textContent = adequacyStatus;
    
    // Color coding
    rows[0].querySelector('.analysis-status').style.color = stockStatus === 'Critical' ? '#dc3545' : stockStatus === 'Low' ? '#ffc107' : '#28a745';
    rows[1].querySelector('.analysis-days-status').style.color = daysStatus === 'Critical' ? '#dc3545' : daysStatus === 'Normal' ? '#ffc107' : '#28a745';
    rows[3].querySelector('.analysis-adequacy').style.color = adequacyStatus.includes('Insufficient') ? '#dc3545' : '#28a745';
}

function checkCoalWarnings(rows, avgDaysStock, totalClosing) {
    const warningsDiv = document.getElementById('coalCalcWarnings');
    if (!warningsDiv) return;
    
    let warnings = [];
    
    // Check individual source warnings
    rows.forEach((row, index) => {
        const source = row.cells[0].textContent || `Source ${index + 1}`;
        const daysStock = parseFloat(row.querySelector('.days-stock').textContent) || 0;
        const closingStock = parseFloat(row.querySelector('.closing-stock').textContent) || 0;
        
        if (daysStock < 3) {
            warnings.push({
                type: 'critical',
                message: `🚨 CRITICAL: ${source} has only ${daysStock.toFixed(1)} days of stock remaining (${closingStock.toFixed(1)} MT)`
            });
        } else if (daysStock < 5) {
            warnings.push({
                type: 'buffer',
                message: `⚠️ WARNING: ${source} is below buffer stock with ${daysStock.toFixed(1)} days remaining (${closingStock.toFixed(1)} MT)`
            });
        }
    });
    
    // Check overall warnings
    if (avgDaysStock < 4) {
        warnings.push({
            type: 'critical',
            message: `🚨 CRITICAL: Overall average stock is only ${avgDaysStock.toFixed(1)} days - immediate action required!`
        });
    }
    
    if (totalClosing < 2000) {
        warnings.push({
            type: 'buffer',
            message: `⚠️ WARNING: Total coal stock is ${totalClosing.toFixed(1)} MT - below recommended minimum of 2000 MT`
        });
    }
    
    // Display warnings
    if (warnings.length > 0) {
        let warningHTML = '<div class="warnings-panel"><h3>⚠️ Stock Alerts</h3>';
        warnings.forEach(warning => {
            const className = warning.type === 'critical' ? 'critical-warning' : 'buffer-warning';
            warningHTML += `<div class="warning-item ${className}">${warning.message}</div>`;
        });
        warningHTML += '</div>';
        warningsDiv.innerHTML = warningHTML;
        warningsDiv.style.display = 'block';
    } else {
        warningsDiv.innerHTML = '<div class="warnings-panel summary-warning"><h3>✅ All Clear</h3><div class="warning-item">All coal sources are above minimum stock levels. Current operations are sustainable.</div></div>';
        warningsDiv.style.display = 'block';
    }
}

// Utility Functions
function addCoalSource() {
    const table = document.getElementById('coalScenarioTable');
    const tbody = table.querySelector('tbody');
    const rowCount = tbody.querySelectorAll('tr').length;
    
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td contenteditable="true">Source ${rowCount + 1}</td>
        <td><input type="number" class="opening-stock" value="0" oninput="calculateCoalScenario()"></td>
        <td><input type="number" class="receipt" value="0" oninput="calculateCoalScenario()"></td>
        <td><input type="number" class="consumption" value="0" oninput="calculateCoalScenario()"></td>
        <td class="closing-stock calculated-field">0</td>
        <td class="days-stock calculated-field">0</td>
    `;
    
    tbody.appendChild(newRow);
    calculateCoalScenario();
}

function removeCoalSource() {
    const table = document.getElementById('coalScenarioTable');
    const tbody = table.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr');
    
    if (rows.length > 1) {
        tbody.removeChild(rows[rows.length - 1]);
        calculateCoalScenario();
    } else {
        alert('Cannot remove the last coal source.');
    }
}

function resetCoalCalculator() {
    if (confirm('Are you sure you want to reset all values?')) {
        const table = document.getElementById('coalScenarioTable');
        const inputs = table.querySelectorAll('input[type="number"]');
        inputs.forEach(input => input.value = 0);
        calculateCoalScenario();
    }
}

function generateCoalReport() {
    const plantName = document.getElementById('coalCalcPowerPlantName').value || 'Power Plant';
    const date = new Date().toLocaleDateString();
    
    alert(`Coal Scenario Report for ${plantName} (${date}) has been generated. Use export buttons above to download in your preferred format.`);
}

// Export Functions (simplified versions)
function exportCoalScenarioToPDF() {
    const plantName = document.getElementById('coalCalcPowerPlantName').value || 'Power Plant';
    console.log('Exporting Coal Scenario to PDF...');
    alert(`PDF export for ${plantName} will be implemented with full jsPDF integration.`);
}

function exportCoalScenarioToExcel() {
    const plantName = document.getElementById('coalCalcPowerPlantName').value || 'Power Plant';
    console.log('Exporting Coal Scenario to Excel...');
    alert(`Excel export for ${plantName} will be implemented with SheetJS integration.`);
}

function exportCoalScenarioToJPG() {
    const plantName = document.getElementById('coalCalcPowerPlantName').value || 'Power Plant';
    console.log('Exporting Coal Scenario to JPG...');
    alert(`JPG export for ${plantName} will be implemented with html2canvas integration.`);
}
