// Main Dashboard - Simple Welcome Page
// Shows a welcome message for users

// Function to show main dashboard with welcome message
function showMainDashboard() {
    console.log("Loading Main Dashboard");
    
    // Set main content with simple welcome message
    document.getElementById('main-content').innerHTML = `
        <div class="container-fluid py-5">
            <div class="row justify-content-center">
                <div class="col-md-8 col-lg-6">
                    <div class="card shadow-lg border-0">
                        <div class="card-body text-center py-5">
                            <div class="mb-4">
                                <i class="bi bi-house-door-fill text-primary" style="font-size: 4rem;"></i>
                            </div>
                            <h1 class="display-4 fw-bold text-dark mb-3">Welcome</h1>
                            <p class="lead text-muted mb-4">
                                Welcome to the Fuel Management Application
                            </p>
                            <p class="text-muted">
                                Use the navigation menu to access different reports and dashboards.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <style>
            .card {
                border-radius: 15px;
                transition: transform 0.2s ease-in-out;
            }
            
            .card:hover {
                transform: translateY(-5px);
            }
            
            .bi {
                transition: color 0.3s ease;
            }
            
            .card:hover .bi {
                color: #0d6efd !important;
            }
        </style>
    `;
}

// Export function for global access
window.showMainDashboard = showMainDashboard;
