// Dynamically load the navbar/sidebar and set up listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('Loading navbar...');
    fetch('components/navbar.html')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            console.log('Navbar loaded, setting up menu listeners...');
            document.getElementById('navbar-container').innerHTML = data;
            setupMenuListeners();
            console.log('Menu listeners set up complete');
        })
        .catch(error => {
            console.error('Error loading navbar:', error);
            document.getElementById('navbar-container').innerHTML = '<div class="alert alert-danger">Failed to load navigation</div>';
        });
});

function setupMenuListeners() {
    console.log('Setting up menu listeners...');
    
    // Main navigation items (data-page)
    const mainNavItems = document.querySelectorAll('[data-page]');
    console.log('Found main nav items:', mainNavItems.length);
    
    mainNavItems.forEach((item, index) => {
        const pageType = item.getAttribute('data-page');
        console.log(`Main nav item ${index}: ${pageType}`);
        
        item.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Main nav item clicked:", pageType);
            
            // Stop Punjab Generation updates when navigating away
            if (typeof stopPunjabGenerationUpdates === 'function') {
                stopPunjabGenerationUpdates();
            }
            if (typeof stopPunjabGenerationCompactUpdates === 'function') {
                stopPunjabGenerationCompactUpdates();
            }
            
            if (pageType === 'dashboard') {
                console.log("Loading Main Dashboard...");
                if (typeof showMainDashboard === 'function') {
                    try {
                        showMainDashboard();
                        console.log("Main Dashboard loaded successfully");
                    } catch (error) {
                        console.error("Error loading Main Dashboard:", error);
                        alert("Error loading Main Dashboard: " + error.message);
                    }
                } else {
                    console.error('Main Dashboard function not found');
                    alert("Error: The Main Dashboard function is not available. Please check if the script is loaded properly.");
                }
            } else if (pageType === 'punjabgen') {
                console.log("Punjab Generation page requested");
                if (typeof showPunjabGenerationCompact === 'function') {
                    showPunjabGenerationCompact();
                } else {
                    console.error("showPunjabGenerationCompact function not found!");
                    document.getElementById('main-content').innerHTML = "<h2>Punjab Generation</h2><p>Error: Compact function not loaded. Please refresh the page.</p>";
                }
            } else if (pageType === 'calculators') {
                console.log("Calculators page requested");
                showCalculatorsPage();
            } else if (pageType === 'settings') {
                console.log("Settings page requested - not implemented yet");
                document.getElementById('main-content').innerHTML = "<h2>Settings</h2><p>Coming Soon...</p>";
            } else {
                console.log("Unknown page type:", pageType);
            }
            
            // Close sidebar after click (for mobile)
            const sidebar = bootstrap.Offcanvas.getOrCreateInstance(document.getElementById('sidebar'));
            sidebar.hide();
        });
    });
    
    // Progress Reports menu items
    const menuItems = document.querySelectorAll('.progress-menu-item');
    console.log('Found menu items:', menuItems.length);
    
    menuItems.forEach((item, index) => {
        const reportType = item.getAttribute('data-report');
        console.log(`Menu item ${index}: ${reportType}`);
        
        item.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Menu item clicked:", reportType);
            
            // Stop Punjab Generation updates when navigating away
            if (typeof stopPunjabGenerationUpdates === 'function') {
                stopPunjabGenerationUpdates();
            }
            if (typeof stopPunjabGenerationCompactUpdates === 'function') {
                stopPunjabGenerationCompactUpdates();
            }
            
            if (reportType === 'mdcwl-lifting') {
                showMDCWLLiftingReport();
            } else if (reportType === 'mdcwl-loading') {
                showMDCWLLoadingReport(); 
            } else if (reportType === 'pachhwara-prod-desp') {
                showPachhwaraPDReport();
            } else if (reportType === 'pachhwara-quality') {
                showPachhwaraQualityAnalysisReport();
            } else if (reportType === 'loading-receipt') {
                console.log("Loading & Receipt report requested");
                if (typeof showLoadingReceiptReport === 'function') {
                    showLoadingReceiptReport();
                } else {
                    console.error("Function showLoadingReceiptReport is not defined!");
                    alert("Error: The Loading & Receipt report function is not available.");
                }
            } else if (reportType === 'coal-quality-cost') {
                console.log("Coal Quality & Cost Analysis report requested");
                if (typeof showQualityCostAnalysis === 'function') {
                    showQualityCostAnalysis();
                } else {
                    console.error("Function showQualityCostAnalysis is not defined!");
                    alert("Error: The Coal Quality & Cost Analysis function is not available.");
                }
            } else if (reportType === 'daily-coal-position') {
                console.log("Daily Coal Position report requested");
                if (typeof showDailyCoalDashboard === 'function') {
                    showDailyCoalDashboard();
                } else {
                    console.error("Function showDailyCoalDashboard is not defined!");
                    alert("Error: The Daily Coal Position dashboard function is not available.");
                }
            } else if (reportType === 'pachhwara-dashboard') {
                console.log("Pachhwara Dashboard report requested");
                console.log("Function type:", typeof showPachhwaraDashboard);
                if (typeof showPachhwaraDashboard === 'function') {
                    try {
                        showPachhwaraDashboard();
                        console.log("Pachhwara Dashboard loaded successfully");
                    } catch (error) {
                        console.error("Error loading Pachhwara Dashboard:", error);
                        alert("Error loading Pachhwara Dashboard: " + error.message);
                    }
                } else {
                    console.error('Pachhwara Dashboard function not found');
                    alert("Error: The Pachhwara Dashboard function is not available. Please check if the script is loaded properly.");
                }
            } else {
                console.log("Unknown report type:", reportType);
            }
            // Close sidebar after click (for mobile)
            const sidebar = bootstrap.Offcanvas.getOrCreateInstance(document.getElementById('sidebar'));
            sidebar.hide();
        });
    });

// Enable Bootstrap 5 nested dropdowns (submenu support)
    document.querySelectorAll('.dropdown-submenu > .dropdown-toggle').forEach(function (element) {
        element.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            // Close any other open submenus
            document.querySelectorAll('.dropdown-submenu').forEach(function (submenu) {
                if (submenu !== element.parentElement) submenu.classList.remove('show');
            });
            // Toggle this submenu
            element.parentElement.classList.toggle('show');
        });
    });
    // Hide all submenus when parent dropdown is closed
    document.querySelectorAll('.dropdown').forEach(function (dropdown) {
        dropdown.addEventListener('hide.bs.dropdown', function () {
            this.querySelectorAll('.dropdown-submenu').forEach(function (submenu) {
                submenu.classList.remove('show');
            });
        });
    });

}

// Example stub functions for new pages/reports:
function showDailyReportsPage() {
    document.getElementById('main-content').innerHTML = "<h2>Daily Reports</h2><p>Daily reports content goes here.</p>";
}
function showProgressReport(type) {
    if (type === "mdcwl") {
        document.getElementById('main-content').innerHTML = "<h2>Progress Report: MDCWL</h2><p>MDCWL report content goes here.</p>";
    } else if (type === "pachhwara") {
        document.getElementById('main-content').innerHTML = "<h2>Progress Report: Pachhwara</h2><p>Pachhwara report content goes here.</p>";
    }
}

// Format a Google Sheets date string like Date(2025,3,1) to "April-2025"
function formatMonthYear(cellValue) {
    // Handles Google Sheets date format: Date(YYYY,MM,DD)
    if (typeof cellValue === "string" && cellValue.startsWith("Date(")) {
        const parts = cellValue.match(/\d+/g);
        if (parts && parts.length >= 2) {
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]); // zero-based
            const dateObj = new Date(year, month);
            const monthName = dateObj.toLocaleString('en-US', { month: 'long' });
            return `${monthName}-${year}`;
        }
    }
    return cellValue || "";
}

// Format a Google Sheets date string like Date(2025,3,1) to "01-Apr-2025"
function formatDate(cellValue) {
    // Handles Google Sheets date format: Date(YYYY,MM,DD)
    if (typeof cellValue === "string" && cellValue.startsWith("Date(")) {
        const parts = cellValue.match(/\d+/g);
        if (parts && parts.length >= 3) {
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]);
            const day = parseInt(parts[2]);
            const dateObj = new Date(year, month, day);
            return dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        }
    }
    return cellValue || "";
}

function formatDateDMY(cellValue) {
    if (typeof cellValue === "string" && cellValue.startsWith("Date(")) {
        const parts = cellValue.match(/\d+/g);
        if (parts && parts.length >= 3) {
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]) + 1; // JS months are 0-based
            const day = parseInt(parts[2]);
            return `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
        }
    }
    return cellValue || "";
}    

function getMonthYearFromDate(cellValue) {
    // Handles both Date(YYYY,M,D) and dd-mm-yyyy
    if (typeof cellValue === "string" && cellValue.startsWith("Date(")) {
        const parts = cellValue.match(/\d+/g);
        if (parts && parts.length >= 2) {
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]) + 1; // JS months are 0-based
            return `${String(month).padStart(2, '0')}-${year}`;
        }
    } else if (typeof cellValue === "string" && cellValue.includes('-')) {
        // dd-mm-yyyy
        const [, month, year] = cellValue.split('-');
        return `${month}-${year}`;
    }
    return cellValue;
}

// Professional Calculators Page - Simple list format
function showCalculatorsPage() {
    console.log("Loading Professional Calculators Suite...");
    document.getElementById('main-content').innerHTML = `
        <div class="container-fluid">
            <div class="row mb-4">
                <div class="col-12">
                    <h2 class="text-center mb-4">
                        <i class="bi bi-calculator-fill text-primary me-2"></i>
                        Coal Calculators
                    </h2>
                </div>
            </div>

            <div class="row justify-content-center">
                <div class="col-12 col-lg-8">
                    <div class="list-group shadow-sm">
                        <!-- Coal Scenario Calculator -->
                        <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center border-primary">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-bar-chart-line text-primary me-3 fs-5"></i>
                                <span class="fw-medium">Coal Scenario</span>
                            </div>
                            <button class="btn btn-primary btn-sm" onclick="window.open('Coal-Scenario.html', '_blank')">
                                <i class="bi bi-box-arrow-up-right me-1"></i>Open
                            </button>
                        </div>

                        <!-- Coal Linkage -->
                        <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center border-success">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-link-45deg text-success me-3 fs-5"></i>
                                <span class="fw-medium">Coal Linkage</span>
                            </div>
                            <button class="btn btn-success btn-sm" onclick="window.open('Coal Linkage.html', '_blank')">
                                <i class="bi bi-box-arrow-up-right me-1"></i>Open
                            </button>
                        </div>

                        <!-- Coal Linkage Advance -->
                        <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center border-info">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-diagram-3 text-info me-3 fs-5"></i>
                                <span class="fw-medium">Coal Linkage Advance</span>
                            </div>
                            <button class="btn btn-info btn-sm" onclick="window.open('Coal Linkage Advance.html', '_blank')">
                                <i class="bi bi-box-arrow-up-right me-1"></i>Open
                            </button>
                        </div>

                        <!-- Coal Requirement -->
                        <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center border-warning">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-calculator text-warning me-3 fs-5"></i>
                                <span class="fw-medium">Coal Requirement</span>
                            </div>
                            <button class="btn btn-warning btn-sm" onclick="window.open('Coal Requirement Calculator.html', '_blank')">
                                <i class="bi bi-box-arrow-up-right me-1"></i>Open
                            </button>
                        </div>

                        <!-- Energy Charges -->
                        <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center border-danger">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-lightning-charge text-danger me-3 fs-5"></i>
                                <span class="fw-medium">Energy Charges</span>
                            </div>
                            <button class="btn btn-danger btn-sm" onclick="window.open('Energy Charges.html', '_blank')">
                                <i class="bi bi-box-arrow-up-right me-1"></i>Open
                            </button>
                        </div>

                        <!-- Cost Analysis of 2 Types of Coal -->
                        <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center border-info">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-clipboard-data text-info me-3 fs-5"></i>
                                <span class="fw-medium">Cost Analysis of 2 Types of Coal</span>
                            </div>
                            <button class="btn btn-info btn-sm" onclick="window.open('Cost Analysis of 2 Types of Coal.html', '_blank')">
                                <i class="bi bi-box-arrow-up-right me-1"></i>Open
                            </button>
                        </div>

                        <!-- Blended Coal Analysis -->
                        <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center border-primary">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-shuffle text-primary me-3 fs-5"></i>
                                <span class="fw-medium">Blended Coal Analysis</span>
                            </div>
                            <button class="btn btn-outline-secondary btn-sm" onclick="showComingSoon('Blended Coal Analysis')" disabled>
                                <i class="bi bi-hourglass-split me-1"></i>Soon
                            </button>
                        </div>

                        <!-- Alternate Fuel Cost Economics -->
                        <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center border-success">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-fuel-pump text-success me-3 fs-5"></i>
                                <span class="fw-medium">Alternate Fuel Cost Economics</span>
                            </div>
                            <button class="btn btn-outline-secondary btn-sm" onclick="showComingSoon('Alternate Fuel Cost Economics')" disabled>
                                <i class="bi bi-hourglass-split me-1"></i>Soon
                            </button>
                        </div>

                        <!-- GCV Ash Moisture -->
                        <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center border-info">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-moisture text-info me-3 fs-5"></i>
                                <span class="fw-medium">GCV Ash Moisture</span>
                            </div>
                            <button class="btn btn-outline-secondary btn-sm" onclick="showComingSoon('GCV Ash Moisture')" disabled>
                                <i class="bi bi-hourglass-split me-1"></i>Soon
                            </button>
                        </div>

                        <!-- GCV Equilibrium ↔ GCV ARB -->
                        <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center border-warning">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-arrow-left-right text-warning me-3 fs-5"></i>
                                <span class="fw-medium">GCV Equilibrium ↔ GCV ARB</span>
                            </div>
                            <button class="btn btn-outline-secondary btn-sm" onclick="showComingSoon('GCV Equilibrium ARB Converter')" disabled>
                                <i class="bi bi-hourglass-split me-1"></i>Soon
                            </button>
                        </div>
                    </div>

                    <!-- Info Footer -->
                    <div class="alert alert-light border mt-4 text-center">
                        <i class="bi bi-info-circle text-primary me-2"></i>
                        <span class="text-muted">Professional coal management calculators for power plant operations</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Coming Soon function for future calculators
function showComingSoon(calculatorName) {
    alert(`${calculatorName} calculator is coming soon! Currently under development.\n\nWe're working hard to bring you more professional calculators. Stay tuned for updates.`);
}

// Load Coal Scenario Calculator in new tab (preferred approach)
async function loadCoalScenarioCalculator() {
    console.log("Opening Coal Scenario Calculator in new tab...");
    // Open the original HTML file in new tab for best experience
    window.open('Coal-Scenario.html', '_blank');
}

// Compatibility function for any remaining references
function showCoalScenarioCalculator() {
    console.log("Redirecting to new tab approach...");
    window.open('Coal-Scenario.html', '_blank');
}

// Load Coal Requirement Calculator in new tab
async function loadCoalRequirementCalculator() {
    console.log("Opening Coal Requirement Calculator in new tab...");
    window.open('Coal Requirement Calculator.html', '_blank');
}

// Compatibility function for Coal Requirement Calculator
function showCoalRequirementCalculator() {
    console.log("Redirecting to Coal Requirement Calculator...");
    window.open('Coal Requirement Calculator.html', '_blank');
}

// Load Energy Charges Calculator in new tab
async function loadEnergyChargesCalculator() {
    console.log("Opening Energy Charges Calculator in new tab...");
    window.open('Energy Charges.html', '_blank');
}

// Compatibility function for Energy Charges Calculator
function showEnergyChargesCalculator() {
    console.log("Redirecting to Energy Charges Calculator...");
    window.open('Energy Charges.html', '_blank');
}

// Load Cost Analysis of 2 Types of Coal Calculator in new tab
async function loadCostAnalysisCalculator() {
    console.log("Opening Cost Analysis of 2 Types of Coal Calculator in new tab...");
    window.open('Cost Analysis of 2 Types of Coal.html', '_blank');
}

// Compatibility function for Cost Analysis Calculator
function showCostAnalysisCalculator() {
    console.log("Redirecting to Cost Analysis of 2 Types of Coal Calculator...");
    window.open('Cost Analysis of 2 Types of Coal.html', '_blank');
}
