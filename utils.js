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
                console.log("Calculators page requested - not implemented yet");
                document.getElementById('main-content').innerHTML = "<h2>Calculators</h2><p>Coming Soon...</p>";
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