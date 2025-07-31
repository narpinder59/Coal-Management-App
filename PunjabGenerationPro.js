// Professional Punjab Generation Dashboard
function showPunjabGenerationPro() {
    const punjabGenerationProHTML = `
        <style>
            /* Professional Design Variables */
            :root {
                --primary-color: #3b82f6;
                --secondary-color: #1e40af;
                --success-color: #10b981;
                --warning-color: #f59e0b;
                --danger-color: #ef4444;
                --info-color: #06b6d4;
                --light-bg: #f8fafc;
                --card-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
                --card-hover-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
                --border-radius: 8px;
                --gradient-primary: linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%);
                --gradient-success: linear-gradient(135deg, #10b981 0%, #059669 100%);
                --gradient-warning: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                --gradient-danger: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                --gradient-res: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
            }

            /* Professional Header */
            .punjab-pro {
                font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%);
                min-height: 100vh;
                padding: 15px;
            }

            .dashboard-header {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: var(--border-radius);
                padding: 12px;
                margin-bottom: 12px;
                box-shadow: var(--card-shadow);
                text-align: center;
            }

            .dashboard-title {
                font-size: 1.6rem;
                font-weight: 700;
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 4px;
                letter-spacing: -0.025em;
            }

            .dashboard-subtitle {
                color: #64748b;
                font-size: 0.85rem;
                font-weight: 500;
            }

            /* System Status Bar - Compact */
            .system-status-bar {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: var(--border-radius);
                padding: 8px 16px;
                margin-bottom: 12px;
                box-shadow: var(--card-shadow);
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 8px;
            }

            .status-item {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 0.75rem;
                font-weight: 600;
            }

            .status-label {
                color: #64748b;
            }

            .status-value {
                color: #1e293b;
                font-weight: 700;
            }

            .timestamp-display {
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                color: white;
                padding: 4px 10px;
                border-radius: 16px;
                font-size: 0.65rem;
                font-weight: 600;
            }

            /* Professional Cards */
            .pro-card {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: var(--border-radius);
                box-shadow: var(--card-shadow);
                transition: all 0.3s ease;
                border: 1px solid rgba(255, 255, 255, 0.2);
                margin-bottom: 20px;
                overflow: hidden;
            }

            .pro-card:hover {
                box-shadow: var(--card-hover-shadow);
                transform: translateY(-2px);
            }

            .pro-card-header {
                background: var(--gradient-primary);
                color: white;
                padding: 16px 20px;
                font-weight: 600;
                font-size: 1.1rem;
                display: flex;
                justify-content: between;
                align-items: center;
                border-bottom: none;
            }

            .pro-card-body {
                padding: 20px;
                background: white;
            }

            /* Status Overview Cards - Compact */
            .status-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                gap: 10px;
                margin-bottom: 15px;
            }

            .status-card {
                background: white;
                border-radius: var(--border-radius);
                padding: 12px;
                box-shadow: var(--card-shadow);
                transition: all 0.3s ease;
                border-left: 3px solid var(--primary-color);
            }

            .status-card:hover {
                box-shadow: var(--card-hover-shadow);
                transform: translateY(-1px);
            }

            .status-card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }

            .status-card-title {
                font-size: 0.65rem;
                font-weight: 600;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .status-card-icon {
                width: 24px;
                height: 24px;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
                color: white;
            }

            .status-card-value {
                font-size: 1.4rem;
                font-weight: 700;
                color: #1e293b;
                margin-bottom: 2px;
                display: flex;
                align-items: baseline;
                gap: 4px;
            }

            .status-card-unit {
                font-size: 0.75rem;
                font-weight: 500;
                color: #64748b;
            }

            .status-card-change {
                font-size: 0.875rem;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            /* Professional Plant Cards - Compact Design */
            .plant-section {
                margin-bottom: 15px;
            }

            .plant-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
                padding: 0 4px;
            }

            .plant-title {
                font-size: 1rem;
                font-weight: 700;
                color: #1e293b;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .plant-summary {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 0.75rem;
                font-weight: 600;
                color: #64748b;
            }

            .plant-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                gap: 10px;
            }

            .plant-card {
                background: white;
                border-radius: var(--border-radius);
                box-shadow: var(--card-shadow);
                overflow: hidden;
                transition: all 0.3s ease;
            }

            .plant-card:hover {
                box-shadow: var(--card-hover-shadow);
                transform: translateY(-1px);
            }

            .plant-card-header {
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                color: white;
                padding: 10px 14px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .plant-name {
                font-weight: 700;
                font-size: 0.9rem;
            }

            .plant-capacity {
                font-size: 0.75rem;
                opacity: 0.9;
            }

            .plant-card-body {
                padding: 12px;
            }

            /* Unit Status Grid - Compact Professional Design */
            .units-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
                gap: 6px;
                margin-bottom: 12px;
            }

            .unit-card {
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 8px 4px;
                text-align: center;
                transition: all 0.3s ease;
                cursor: pointer;
                position: relative;
                overflow: hidden;
            }

            .unit-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
                transition: all 0.3s ease;
            }

            .unit-card.active {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                border-color: #059669;
                box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
                transform: translateY(-1px);
            }

            .unit-card.active::before {
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            }

            .unit-card.inactive {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                color: white;
                border-color: #dc2626;
                box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);
            }

            .unit-card.inactive::before {
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            }

            .unit-number {
                font-size: 0.625rem;
                font-weight: 600;
                margin-bottom: 3px;
                opacity: 0.8;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .unit-value {
                font-size: 0.875rem;
                font-weight: 800;
                margin-bottom: 2px;
                display: block;
            }

            .unit-card.active .unit-value,
            .unit-card.inactive .unit-value {
                color: white;
            }

            .unit-card .unit-value {
                color: #1e293b;
            }

            .unit-capacity {
                font-size: 0.55rem;
                opacity: 0.7;
                font-weight: 500;
            }

            /* Professional Progress Bar - Compact */
            .progress-section {
                margin-top: 10px;
                padding-top: 10px;
                border-top: 1px solid #e2e8f0;
            }

            .progress-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 4px;
            }

            .progress-label {
                font-size: 0.7rem;
                font-weight: 600;
                color: #374151;
            }

            .progress-value {
                font-size: 0.7rem;
                font-weight: 700;
                color: var(--primary-color);
            }

            .progress-bar-container {
                background: #e5e7eb;
                border-radius: 3px;
                overflow: hidden;
                height: 4px;
                position: relative;
            }

            .progress-bar {
                height: 100%;
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                border-radius: 3px;
                transition: width 0.6s ease;
                position: relative;
                overflow: hidden;
            }

            .progress-bar::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                animation: shimmer 2s infinite;
            }

            @keyframes shimmer {
                0% { left: -100%; }
                100% { left: 100%; }
            }

            /* Frequency Display */
            .frequency-display {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                border-radius: var(--border-radius);
                padding: 20px;
                text-align: center;
                box-shadow: var(--card-shadow);
                margin-bottom: 15px;
            }

            .frequency-value {
                font-size: 2.5rem;
                font-weight: 800;
                margin-bottom: 4px;
                text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .frequency-unit {
                font-size: 1.1rem;
                font-weight: 600;
                opacity: 0.9;
            }

            .frequency-label {
                font-size: 0.8rem;
                opacity: 0.8;
                margin-top: 6px;
            }

            /* RES Section */
            .res-section {
                background: var(--gradient-res);
                color: white;
                border-radius: var(--border-radius);
                padding: 20px;
                box-shadow: var(--card-shadow);
            }

            .res-title {
                font-size: 1.1rem;
                font-weight: 700;
                margin-bottom: 12px;
                text-align: center;
            }

            .res-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                gap: 12px;
            }

            .res-item {
                text-align: center;
                background: rgba(255, 255, 255, 0.15);
                border-radius: 6px;
                padding: 12px 8px;
                backdrop-filter: blur(10px);
            }

            .res-label {
                font-size: 0.7rem;
                opacity: 0.9;
                margin-bottom: 6px;
                font-weight: 600;
            }

            .res-value {
                font-size: 1.3rem;
                font-weight: 800;
                margin-bottom: 2px;
            }

            .res-unit {
                font-size: 0.8rem;
                opacity: 0.8;
            }

            /* Responsive Design - Optimized for Mobile */
            @media (max-width: 768px) {
                .punjab-pro {
                    padding: 8px;
                }

                .dashboard-title {
                    font-size: 1.4rem;
                }

                .dashboard-subtitle {
                    font-size: 0.85rem;
                }

                .status-grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                }

                .plant-grid {
                    grid-template-columns: 1fr;
                    gap: 8px;
                }

                .units-grid {
                    grid-template-columns: repeat(4, 1fr);
                    gap: 4px;
                }

                .plant-card-body {
                    padding: 10px;
                }

                .status-card {
                    padding: 10px;
                }

                .system-status-bar {
                    flex-direction: column;
                    gap: 6px;
                    text-align: center;
                    padding: 6px 12px;
                }

                .status-item {
                    font-size: 0.7rem;
                }

                .unit-card {
                    padding: 6px 3px;
                }

                .unit-value {
                    font-size: 0.8rem;
                }

                .unit-number {
                    font-size: 0.55rem;
                }

                .unit-capacity {
                    font-size: 0.5rem;
                }
            }

            @media (max-width: 480px) {
                .dashboard-title {
                    font-size: 1.2rem;
                }

                .status-grid {
                    grid-template-columns: 1fr 1fr;
                    gap: 6px;
                }

                .units-grid {
                    grid-template-columns: repeat(3, 1fr);
                    gap: 3px;
                }

                .plant-card-body {
                    padding: 8px;
                }

                .status-card-value {
                    font-size: 1.2rem;
                }

                .plant-name {
                    font-size: 0.8rem;
                }

                .plant-capacity {
                    font-size: 0.7rem;
                }

                .progress-header {
                    margin-bottom: 3px;
                }

                .progress-label,
                .progress-value {
                    font-size: 0.65rem;
                }
            }

            /* Loading Animation */
            .loading-shimmer {
                background: linear-gradient(-90deg, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%);
                background-size: 400% 400%;
                animation: shimmer-loading 1.6s ease-in-out infinite;
            }

            @keyframes shimmer-loading {
                0% { background-position: 0% 0%; }
                100% { background-position: -135% 0%; }
            }

            /* Update Timestamp */
            .update-timestamp {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 0.75rem;
                font-weight: 600;
                color: var(--primary-color);
                box-shadow: var(--card-shadow);
                z-index: 1000;
            }

            /* Success/Error States */
            .success-state { border-left-color: var(--success-color); }
            .warning-state { border-left-color: var(--warning-color); }
            .danger-state { border-left-color: var(--danger-color); }
            .info-state { border-left-color: var(--info-color); }
        </style>

        <div class="punjab-pro">
            <!-- Dashboard Header -->
            <div class="dashboard-header">
                <h1 class="dashboard-title">Punjab Power Generation</h1>
                <p class="dashboard-subtitle">Real-time Power Generation Monitoring Dashboard</p>
            </div>

            <!-- System Status Bar -->
            <div class="system-status-bar">
                <div class="status-item">
                    <span class="status-label">Load:</span>
                    <span class="status-value" id="loadMW">0 MW</span>
                </div>
                <div class="status-item">
                    <span class="status-label">Drawal:</span>
                    <span class="status-value" id="drawalMW">0 MW</span>
                </div>
                <div class="status-item">
                    <span class="status-label">Schedule:</span>
                    <span class="status-value" id="scheduleMW">0 MW</span>
                </div>
                <div class="status-item">
                    <span class="status-label">OD/UD:</span>
                    <span class="status-value" id="odUD">0 MW</span>
                </div>
                <div class="status-item">
                    <span class="status-label">Frequency:</span>
                    <span class="status-value" id="frequencyHz">50.00 Hz</span>
                </div>
                <div class="timestamp-display" id="updateTimestamp">
                    <span id="updateDate">Loading...</span>
                </div>
            </div>

            <!-- Status Overview -->
            <div class="status-grid">
                <div class="status-card success-state">
                    <div class="status-card-header">
                        <div class="status-card-title">PSPCL Gross Generation</div>
                        <div class="status-card-icon" style="background: var(--gradient-primary);">⚡</div>
                    </div>
                    <div class="status-card-value">
                        <span id="grossGen">0</span>
                        <span class="status-card-unit">MW</span>
                    </div>
                </div>

                <div class="status-card info-state">
                    <div class="status-card-header">
                        <div class="status-card-title">Total Thermal</div>
                        <div class="status-card-icon" style="background: var(--gradient-danger);">�</div>
                    </div>
                    <div class="status-card-value">
                        <span id="totalThermalGen">0</span>
                        <span class="status-card-unit">MW</span>
                    </div>
                </div>

                <div class="status-card warning-state">
                    <div class="status-card-header">
                        <div class="status-card-title">Total Hydro</div>
                        <div class="status-card-icon" style="background: var(--gradient-success);">�</div>
                    </div>
                    <div class="status-card-value">
                        <span id="totalHydroGen">0</span>
                        <span class="status-card-unit">MW</span>
                    </div>
                </div>

                <div class="status-card" style="border-left-color: var(--success-color);">
                    <div class="status-card-header">
                        <div class="status-card-title">Total RES</div>
                        <div class="status-card-icon" style="background: var(--gradient-res);">🌱</div>
                    </div>
                    <div class="status-card-value">
                        <span id="totalRESGen">0</span>
                        <span class="status-card-unit">MW</span>
                    </div>
                </div>
            </div>

            <!-- PSPCL Thermal Plants -->
            <div class="plant-section">
                <div class="plant-header">
                    <div class="plant-title">
                        🏭 PSPCL Thermal Plants
                    </div>
                    <div class="plant-summary">
                        Total: <span id="PSPCLThermalText">0 / 2300 MW</span>
                    </div>
                </div>

                <div class="plant-grid">
                    <!-- GGSSTP -->
                    <div class="plant-card">
                        <div class="plant-card-header">
                            <div class="plant-name">GGSSTP Ropar</div>
                            <div class="plant-capacity">840 MW</div>
                        </div>
                        <div class="plant-card-body">
                            <div class="units-grid">
                                <div class="unit-card" id="GGSSTP3Card">
                                    <div class="unit-number">Unit 3</div>
                                    <div class="unit-value" id="GGSSTP3Badge">0</div>
                                    <div class="unit-capacity">210 MW</div>
                                </div>
                                <div class="unit-card" id="GGSSTP4Card">
                                    <div class="unit-number">Unit 4</div>
                                    <div class="unit-value" id="GGSSTP4Badge">0</div>
                                    <div class="unit-capacity">210 MW</div>
                                </div>
                                <div class="unit-card" id="GGSSTP5Card">
                                    <div class="unit-number">Unit 5</div>
                                    <div class="unit-value" id="GGSSTP5Badge">0</div>
                                    <div class="unit-capacity">210 MW</div>
                                </div>
                                <div class="unit-card" id="GGSSTP6Card">
                                    <div class="unit-number">Unit 6</div>
                                    <div class="unit-value" id="GGSSTP6Badge">0</div>
                                    <div class="unit-capacity">210 MW</div>
                                </div>
                            </div>
                            <div class="progress-section">
                                <div class="progress-header">
                                    <div class="progress-label">Total Generation</div>
                                    <div class="progress-value" id="GGSSTPTotalProgressText">0 / 840 MW</div>
                                </div>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" id="GGSSTPTotalProgress" style="width: 0%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- GHTP -->
                    <div class="plant-card">
                        <div class="plant-card-header">
                            <div class="plant-name">GHTP Lehra Mohabbat</div>
                            <div class="plant-capacity">920 MW</div>
                        </div>
                        <div class="plant-card-body">
                            <div class="units-grid">
                                <div class="unit-card" id="GHTP1Card">
                                    <div class="unit-number">Unit 1</div>
                                    <div class="unit-value" id="GHTP1Badge">0</div>
                                    <div class="unit-capacity">210 MW</div>
                                </div>
                                <div class="unit-card" id="GHTP2Card">
                                    <div class="unit-number">Unit 2</div>
                                    <div class="unit-value" id="GHTP2Badge">0</div>
                                    <div class="unit-capacity">210 MW</div>
                                </div>
                                <div class="unit-card" id="GHTP3Card">
                                    <div class="unit-number">Unit 3</div>
                                    <div class="unit-value" id="GHTP3Badge">0</div>
                                    <div class="unit-capacity">250 MW</div>
                                </div>
                                <div class="unit-card" id="GHTP4Card">
                                    <div class="unit-number">Unit 4</div>
                                    <div class="unit-value" id="GHTP4Badge">0</div>
                                    <div class="unit-capacity">250 MW</div>
                                </div>
                            </div>
                            <div class="progress-section">
                                <div class="progress-header">
                                    <div class="progress-label">Total Generation</div>
                                    <div class="progress-value" id="GHTPTotalProgressText">0 / 920 MW</div>
                                </div>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" id="GHTPTotalProgress" style="width: 0%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- GATP -->
                    <div class="plant-card">
                        <div class="plant-card-header">
                            <div class="plant-name">GATP GVK</div>
                            <div class="plant-capacity">540 MW</div>
                        </div>
                        <div class="plant-card-body">
                            <div class="units-grid">
                                <div class="unit-card" id="GATP1Card">
                                    <div class="unit-number">Unit 1</div>
                                    <div class="unit-value" id="GATP1Badge">0</div>
                                    <div class="unit-capacity">270 MW</div>
                                </div>
                                <div class="unit-card" id="GATP2Card">
                                    <div class="unit-number">Unit 2</div>
                                    <div class="unit-value" id="GATP2Badge">0</div>
                                    <div class="unit-capacity">270 MW</div>
                                </div>
                            </div>
                            <div class="progress-section">
                                <div class="progress-header">
                                    <div class="progress-label">Total Generation</div>
                                    <div class="progress-value" id="GATPTotalProgressText">0 / 540 MW</div>
                                </div>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" id="GATPTotalProgress" style="width: 0%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- IPPs -->
            <div class="plant-section">
                <div class="plant-header">
                    <div class="plant-title">
                        🏢 Independent Power Producers (IPPs)
                    </div>
                    <div class="plant-summary">
                        Total: <span id="IPPsTotalText">0 / 3380 MW</span>
                    </div>
                </div>

                <div class="plant-grid">
                    <!-- NPL -->
                    <div class="plant-card">
                        <div class="plant-card-header">
                            <div class="plant-name">NPL Rajpura</div>
                            <div class="plant-capacity">1400 MW</div>
                        </div>
                        <div class="plant-card-body">
                            <div class="units-grid">
                                <div class="unit-card" id="NPL1Card">
                                    <div class="unit-number">Unit 1</div>
                                    <div class="unit-value" id="NPL1Badge">0</div>
                                    <div class="unit-capacity">700 MW</div>
                                </div>
                                <div class="unit-card" id="NPL2Card">
                                    <div class="unit-number">Unit 2</div>
                                    <div class="unit-value" id="NPL2Badge">0</div>
                                    <div class="unit-capacity">700 MW</div>
                                </div>
                            </div>
                            <div class="progress-section">
                                <div class="progress-header">
                                    <div class="progress-label">Total Generation</div>
                                    <div class="progress-value" id="NPLTotalProgressText">0 / 1400 MW</div>
                                </div>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" id="NPLTotalProgress" style="width: 0%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- TSPL -->
                    <div class="plant-card">
                        <div class="plant-card-header">
                            <div class="plant-name">TSPL Talwandi Sabo</div>
                            <div class="plant-capacity">1980 MW</div>
                        </div>
                        <div class="plant-card-body">
                            <div class="units-grid">
                                <div class="unit-card" id="TSPL1Card">
                                    <div class="unit-number">Unit 1</div>
                                    <div class="unit-value" id="TSPL1Badge">0</div>
                                    <div class="unit-capacity">660 MW</div>
                                </div>
                                <div class="unit-card" id="TSPL2Card">
                                    <div class="unit-number">Unit 2</div>
                                    <div class="unit-value" id="TSPL2Badge">0</div>
                                    <div class="unit-capacity">660 MW</div>
                                </div>
                                <div class="unit-card" id="TSPL3Card">
                                    <div class="unit-number">Unit 3</div>
                                    <div class="unit-value" id="TSPL3Badge">0</div>
                                    <div class="unit-capacity">660 MW</div>
                                </div>
                            </div>
                            <div class="progress-section">
                                <div class="progress-header">
                                    <div class="progress-label">Total Generation</div>
                                    <div class="progress-value" id="TSPLTotalProgressText">0 / 1980 MW</div>
                                </div>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" id="TSPLTotalProgress" style="width: 0%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Total Punjab Thermal -->
            <div class="pro-card">
                <div class="pro-card-header">
                    🔥 Total Punjab Thermal Generation
                    <div style="font-size: 1rem; font-weight: 600;">
                        <span id="PunjabThermalTotalText">0 / 5680 MW</span>
                    </div>
                </div>
                <div class="pro-card-body">
                    <div class="progress-bar-container" style="height: 12px;">
                        <div class="progress-bar" id="PunjabThermalProgress" style="width: 0%;"></div>
                    </div>
                </div>
            </div>

            <!-- Hydro Plants -->
            <div class="plant-section">
                <div class="plant-header">
                    <div class="plant-title">
                        💧 PSPCL Hydro Plants
                    </div>
                    <div class="plant-summary">
                        Total: <span id="PunjabHydroTotalText">0 / 1093.35 MW</span>
                    </div>
                </div>

                <div class="plant-grid">
                    <!-- RSD -->
                    <div class="plant-card">
                        <div class="plant-card-header">
                            <div class="plant-name">RSD Ranjit Sagar Dam</div>
                            <div class="plant-capacity">600 MW</div>
                        </div>
                        <div class="plant-card-body">
                            <div class="units-grid">
                                <div class="unit-card" id="RSD1Card">
                                    <div class="unit-number">Unit 1</div>
                                    <div class="unit-value" id="RSD1Badge">0</div>
                                    <div class="unit-capacity">150 MW</div>
                                </div>
                                <div class="unit-card" id="RSD2Card">
                                    <div class="unit-number">Unit 2</div>
                                    <div class="unit-value" id="RSD2Badge">0</div>
                                    <div class="unit-capacity">150 MW</div>
                                </div>
                                <div class="unit-card" id="RSD3Card">
                                    <div class="unit-number">Unit 3</div>
                                    <div class="unit-value" id="RSD3Badge">0</div>
                                    <div class="unit-capacity">150 MW</div>
                                </div>
                                <div class="unit-card" id="RSD4Card">
                                    <div class="unit-number">Unit 4</div>
                                    <div class="unit-value" id="RSD4Badge">0</div>
                                    <div class="unit-capacity">150 MW</div>
                                </div>
                            </div>
                            <div class="progress-section">
                                <div class="progress-header">
                                    <div class="progress-label">Total Generation</div>
                                    <div class="progress-value" id="RSDTotalProgressText">0 / 600 MW</div>
                                </div>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" id="RSDTotalProgress" style="width: 0%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- UBDC-1 -->
                    <div class="plant-card">
                        <div class="plant-card-header">
                            <div class="plant-name">UBDC-1</div>
                            <div class="plant-capacity">30.45 MW</div>
                        </div>
                        <div class="plant-card-body">
                            <div class="units-grid">
                                <div class="unit-card" id="UBDC1_1Card">
                                    <div class="unit-number">Unit 1</div>
                                    <div class="unit-value" id="UBDC1_1Badge">0</div>
                                    <div class="unit-capacity">15 MW</div>
                                </div>
                                <div class="unit-card" id="UBDC1_2Card">
                                    <div class="unit-number">Unit 2</div>
                                    <div class="unit-value" id="UBDC1_2Badge">0</div>
                                    <div class="unit-capacity">15.45 MW</div>
                                </div>
                            </div>
                            <div class="progress-section">
                                <div class="progress-header">
                                    <div class="progress-label">Total Generation</div>
                                    <div class="progress-value" id="UBDC1TotalProgressText">0 / 30.45 MW</div>
                                </div>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" id="UBDC1TotalProgress" style="width: 0%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- UBDC-2 -->
                    <div class="plant-card">
                        <div class="plant-card-header">
                            <div class="plant-name">UBDC-2</div>
                            <div class="plant-capacity">30.45 MW</div>
                        </div>
                        <div class="plant-card-body">
                            <div class="units-grid">
                                <div class="unit-card" id="UBDC2_1Card">
                                    <div class="unit-number">Unit 1</div>
                                    <div class="unit-value" id="UBDC2_1Badge">0</div>
                                    <div class="unit-capacity">15 MW</div>
                                </div>
                                <div class="unit-card" id="UBDC2_2Card">
                                    <div class="unit-number">Unit 2</div>
                                    <div class="unit-value" id="UBDC2_2Badge">0</div>
                                    <div class="unit-capacity">15.45 MW</div>
                                </div>
                            </div>
                            <div class="progress-section">
                                <div class="progress-header">
                                    <div class="progress-label">Total Generation</div>
                                    <div class="progress-value" id="UBDC2TotalProgressText">0 / 30.45 MW</div>
                                </div>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" id="UBDC2TotalProgress" style="width: 0%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- UBDC-3 -->
                    <div class="plant-card">
                        <div class="plant-card-header">
                            <div class="plant-name">UBDC-3</div>
                            <div class="plant-capacity">30.45 MW</div>
                        </div>
                        <div class="plant-card-body">
                            <div class="units-grid">
                                <div class="unit-card" id="UBDC3_1Card">
                                    <div class="unit-number">Unit 1</div>
                                    <div class="unit-value" id="UBDC3_1Badge">0</div>
                                    <div class="unit-capacity">15 MW</div>
                                </div>
                                <div class="unit-card" id="UBDC3_2Card">
                                    <div class="unit-number">Unit 2</div>
                                    <div class="unit-value" id="UBDC3_2Badge">0</div>
                                    <div class="unit-capacity">15.45 MW</div>
                                </div>
                            </div>
                            <div class="progress-section">
                                <div class="progress-header">
                                    <div class="progress-label">Total Generation</div>
                                    <div class="progress-value" id="UBDC3TotalProgressText">0 / 30.45 MW</div>
                                </div>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" id="UBDC3TotalProgress" style="width: 0%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- MHP-1 -->
                    <div class="plant-card">
                        <div class="plant-card-header">
                            <div class="plant-name">MHP-1</div>
                            <div class="plant-capacity">45 MW</div>
                        </div>
                        <div class="plant-card-body">
                            <div class="units-grid">
                                <div class="unit-card" id="MHP1_1Card">
                                    <div class="unit-number">Unit 1</div>
                                    <div class="unit-value" id="MHP1_1Badge">0</div>
                                    <div class="unit-capacity">15 MW</div>
                                </div>
                                <div class="unit-card" id="MHP1_2Card">
                                    <div class="unit-number">Unit 2</div>
                                    <div class="unit-value" id="MHP1_2Badge">0</div>
                                    <div class="unit-capacity">15 MW</div>
                                </div>
                                <div class="unit-card" id="MHP1_3Card">
                                    <div class="unit-number">Unit 3</div>
                                    <div class="unit-value" id="MHP1_3Badge">0</div>
                                    <div class="unit-capacity">15 MW</div>
                                </div>
                            </div>
                            <div class="progress-section">
                                <div class="progress-header">
                                    <div class="progress-label">Total Generation</div>
                                    <div class="progress-value" id="MHP1TotalProgressText">0 / 45 MW</div>
                                </div>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" id="MHP1TotalProgress" style="width: 0%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- MHP-2 -->
                    <div class="plant-card">
                        <div class="plant-card-header">
                            <div class="plant-name">MHP-2</div>
                            <div class="plant-capacity">45 MW</div>
                        </div>
                        <div class="plant-card-body">
                            <div class="units-grid">
                                <div class="unit-card" id="MHP2_1Card">
                                    <div class="unit-number">Unit 1</div>
                                    <div class="unit-value" id="MHP2_1Badge">0</div>
                                    <div class="unit-capacity">15 MW</div>
                                </div>
                                <div class="unit-card" id="MHP2_2Card">
                                    <div class="unit-number">Unit 2</div>
                                    <div class="unit-value" id="MHP2_2Badge">0</div>
                                    <div class="unit-capacity">15 MW</div>
                                </div>
                                <div class="unit-card" id="MHP2_3Card">
                                    <div class="unit-number">Unit 3</div>
                                    <div class="unit-value" id="MHP2_3Badge">0</div>
                                    <div class="unit-capacity">15 MW</div>
                                </div>
                            </div>
                            <div class="progress-section">
                                <div class="progress-header">
                                    <div class="progress-label">Total Generation</div>
                                    <div class="progress-value" id="MHP2TotalProgressText">0 / 45 MW</div>
                                </div>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" id="MHP2TotalProgress" style="width: 0%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- MHP-3 -->
                    <div class="plant-card">
                        <div class="plant-card-header">
                            <div class="plant-name">MHP-3</div>
                            <div class="plant-capacity">58.5 MW</div>
                        </div>
                        <div class="plant-card-body">
                            <div class="units-grid">
                                <div class="unit-card" id="MHP3_1Card">
                                    <div class="unit-number">Unit 1</div>
                                    <div class="unit-value" id="MHP3_1Badge">0</div>
                                    <div class="unit-capacity">19.5 MW</div>
                                </div>
                                <div class="unit-card" id="MHP3_2Card">
                                    <div class="unit-number">Unit 2</div>
                                    <div class="unit-value" id="MHP3_2Badge">0</div>
                                    <div class="unit-capacity">19.5 MW</div>
                                </div>
                                <div class="unit-card" id="MHP3_3Card">
                                    <div class="unit-number">Unit 3</div>
                                    <div class="unit-value" id="MHP3_3Badge">0</div>
                                    <div class="unit-capacity">19.5 MW</div>
                                </div>
                            </div>
                            <div class="progress-section">
                                <div class="progress-header">
                                    <div class="progress-label">Total Generation</div>
                                    <div class="progress-value" id="MHP3TotalProgressText">0 / 58.5 MW</div>
                                </div>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" id="MHP3TotalProgress" style="width: 0%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- MHP-4 -->
                    <div class="plant-card">
                        <div class="plant-card-header">
                            <div class="plant-name">MHP-4</div>
                            <div class="plant-capacity">58.5 MW</div>
                        </div>
                        <div class="plant-card-body">
                            <div class="units-grid">
                                <div class="unit-card" id="MHP4_1Card">
                                    <div class="unit-number">Unit 1</div>
                                    <div class="unit-value" id="MHP4_1Badge">0</div>
                                    <div class="unit-capacity">19.5 MW</div>
                                </div>
                                <div class="unit-card" id="MHP4_2Card">
                                    <div class="unit-number">Unit 2</div>
                                    <div class="unit-value" id="MHP4_2Badge">0</div>
                                    <div class="unit-capacity">19.5 MW</div>
                                </div>
                                <div class="unit-card" id="MHP4_3Card">
                                    <div class="unit-number">Unit 3</div>
                                    <div class="unit-value" id="MHP4_3Badge">0</div>
                                    <div class="unit-capacity">19.5 MW</div>
                                </div>
                            </div>
                            <div class="progress-section">
                                <div class="progress-header">
                                    <div class="progress-label">Total Generation</div>
                                    <div class="progress-value" id="MHP4TotalProgressText">0 / 58.5 MW</div>
                                </div>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" id="MHP4TotalProgress" style="width: 0%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- MHP-5 -->
                    <div class="plant-card">
                        <div class="plant-card-header">
                            <div class="plant-name">MHP-5</div>
                            <div class="plant-capacity">18 MW</div>
                        </div>
                        <div class="plant-card-body">
                            <div class="units-grid">
                                <div class="unit-card" id="MHP5_1Card">
                                    <div class="unit-number">Unit 1</div>
                                    <div class="unit-value" id="MHP5_1Badge">0</div>
                                    <div class="unit-capacity">9 MW</div>
                                </div>
                                <div class="unit-card" id="MHP5_2Card">
                                    <div class="unit-number">Unit 2</div>
                                    <div class="unit-value" id="MHP5_2Badge">0</div>
                                    <div class="unit-capacity">9 MW</div>
                                </div>
                            </div>
                            <div class="progress-section">
                                <div class="progress-header">
                                    <div class="progress-label">Total Generation</div>
                                    <div class="progress-value" id="MHP5TotalProgressText">0 / 18 MW</div>
                                </div>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" id="MHP5TotalProgress" style="width: 0%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ASHP-1 -->
                    <div class="plant-card">
                        <div class="plant-card-header">
                            <div class="plant-name">ASHP-1</div>
                            <div class="plant-capacity">67 MW</div>
                        </div>
                        <div class="plant-card-body">
                            <div class="units-grid">
                                <div class="unit-card" id="ASHP1_1Card">
                                    <div class="unit-number">Unit 1</div>
                                    <div class="unit-value" id="ASHP1_1Badge">0</div>
                                    <div class="unit-capacity">33.5 MW</div>
                                </div>
                                <div class="unit-card" id="ASHP1_2Card">
                                    <div class="unit-number">Unit 2</div>
                                    <div class="unit-value" id="ASHP1_2Badge">0</div>
                                    <div class="unit-capacity">33.5 MW</div>
                                </div>
                            </div>
                            <div class="progress-section">
                                <div class="progress-header">
                                    <div class="progress-label">Total Generation</div>
                                    <div class="progress-value" id="ASHP1TotalProgressText">0 / 67 MW</div>
                                </div>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" id="ASHP1TotalProgress" style="width: 0%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ASHP-2 -->
                    <div class="plant-card">
                        <div class="plant-card-header">
                            <div class="plant-name">ASHP-2</div>
                            <div class="plant-capacity">67 MW</div>
                        </div>
                        <div class="plant-card-body">
                            <div class="units-grid">
                                <div class="unit-card" id="ASHP2_1Card">
                                    <div class="unit-number">Unit 1</div>
                                    <div class="unit-value" id="ASHP2_1Badge">0</div>
                                    <div class="unit-capacity">33.5 MW</div>
                                </div>
                                <div class="unit-card" id="ASHP2_2Card">
                                    <div class="unit-number">Unit 2</div>
                                    <div class="unit-value" id="ASHP2_2Badge">0</div>
                                    <div class="unit-capacity">33.5 MW</div>
                                </div>
                            </div>
                            <div class="progress-section">
                                <div class="progress-header">
                                    <div class="progress-label">Total Generation</div>
                                    <div class="progress-value" id="ASHP2TotalProgressText">0 / 67 MW</div>
                                </div>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" id="ASHP2TotalProgress" style="width: 0%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- SHANAN -->
                    <div class="plant-card">
                        <div class="plant-card-header">
                            <div class="plant-name">SHANAN</div>
                            <div class="plant-capacity">110 MW</div>
                        </div>
                        <div class="plant-card-body">
                            <div class="units-grid">
                                <div class="unit-card" id="SHANAN1Card">
                                    <div class="unit-number">Unit 1</div>
                                    <div class="unit-value" id="SHANAN1Badge">0</div>
                                    <div class="unit-capacity">15 MW</div>
                                </div>
                                <div class="unit-card" id="SHANAN2Card">
                                    <div class="unit-number">Unit 2</div>
                                    <div class="unit-value" id="SHANAN2Badge">0</div>
                                    <div class="unit-capacity">15 MW</div>
                                </div>
                                <div class="unit-card" id="SHANAN3Card">
                                    <div class="unit-number">Unit 3</div>
                                    <div class="unit-value" id="SHANAN3Badge">0</div>
                                    <div class="unit-capacity">15 MW</div>
                                </div>
                                <div class="unit-card" id="SHANAN4Card">
                                    <div class="unit-number">Unit 4</div>
                                    <div class="unit-value" id="SHANAN4Badge">0</div>
                                    <div class="unit-capacity">15 MW</div>
                                </div>
                                <div class="unit-card" id="SHANAN5Card">
                                    <div class="unit-number">Unit 5</div>
                                    <div class="unit-value" id="SHANAN5Badge">0</div>
                                    <div class="unit-capacity">50 MW</div>
                                </div>
                            </div>
                            <div class="progress-section">
                                <div class="progress-header">
                                    <div class="progress-label">Total Generation</div>
                                    <div class="progress-value" id="SHANANTotalProgressText">0 / 110 MW</div>
                                </div>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" id="SHANANTotalProgress" style="width: 0%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- RES Section -->
            <div class="res-section">
                <div class="res-title">🌱 Renewable Energy Sources (RES)</div>
                <div class="res-grid">
                    <div class="res-item">
                        <div class="res-label">Solar RES</div>
                        <div class="res-value" id="solarRes">0</div>
                        <div class="res-unit">MW</div>
                    </div>
                    <div class="res-item">
                        <div class="res-label">Non-Solar RES</div>
                        <div class="res-value" id="nonSolarRes">0</div>
                        <div class="res-unit">MW</div>
                    </div>
                    <div class="res-item">
                        <div class="res-label">Total RES</div>
                        <div class="res-value" id="resTotal">0</div>
                        <div class="res-unit">MW</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('main-content').innerHTML = punjabGenerationProHTML;
    
    // Initialize the Professional Punjab Generation dashboard
    initializePunjabGenerationPro();
}

// Professional Punjab Generation utility functions
function setProBadge(elementId, value, cardId) {
    const badge = document.getElementById(elementId);
    const card = document.getElementById(cardId);
    
    if (badge && card) {
        badge.textContent = Math.round(value);
        
        if (value > 0) {
            card.classList.add('active');
            card.classList.remove('inactive');
        } else {
            card.classList.add('inactive');
            card.classList.remove('active');
        }
    }
}

function setProProgress(elementId, textId, value, maxValue) {
    const progressBar = document.getElementById(elementId);
    const progressText = document.getElementById(textId);
    
    if (progressBar) {
        const percentage = Math.min((value / maxValue) * 100, 100);
        progressBar.style.width = `${percentage}%`;
        
        // Add color coding based on performance
        if (percentage >= 80) {
            progressBar.style.background = 'var(--gradient-success)';
        } else if (percentage >= 60) {
            progressBar.style.background = 'var(--gradient-warning)';
        } else if (percentage >= 40) {
            progressBar.style.background = 'var(--gradient-primary)';
        } else {
            progressBar.style.background = 'var(--gradient-danger)';
        }
    }
    
    if (progressText) {
        progressText.textContent = `${Math.round(value)} / ${maxValue} MW`;
    }
}

function updateProDynamicData() {
    console.log("Fetching professional Punjab generation data...");
    var xmlhttp = new XMLHttpRequest();
    var url = "https://sldcapi.pstcl.org/wsDataService.asmx/pbGenData2"; 
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            try {
                var myArr = JSON.parse(this.responseText);
                console.log("Professional Punjab generation data received:", myArr);
                updateProPbGenData(myArr);
                // Call system data update after generation data to ensure proper sequence
                updateProSystemData();
            } catch (error) {
                console.error("Error parsing professional Punjab generation data:", error);
                showErrorState();
            }
        } else if (this.status != 200 && this.readyState == 4) {
            console.log("Professional Punjab generation API error - Ready state: " + this.readyState + " Status: " + this.status);
            showErrorState();
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function updateProSystemData() {
    var xmlhttp = new XMLHttpRequest();
    var url = "https://sldcapi.pstcl.org/wsDataService.asmx/dynamicData"; 
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            try {
                var myArr = JSON.parse(this.responseText);
                updateProSystemStatus(myArr);
            } catch (error) {
                console.error("Error parsing system data:", error);
            }
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function updateProPbGenData(data) {
    // GGSSTP
    setProBadge("GGSSTP3Badge", data.thermalGGSSTPRopar3.value, "GGSSTP3Card");
    setProBadge("GGSSTP4Badge", data.thermalGGSSTPRopar4.value, "GGSSTP4Card");
    setProBadge("GGSSTP5Badge", data.thermalGGSSTPRopar5.value, "GGSSTP5Card");
    setProBadge("GGSSTP6Badge", data.thermalGGSSTPRopar6.value, "GGSSTP6Card");
    setProProgress("GGSSTPTotalProgress", "GGSSTPTotalProgressText", data.totalGGSSTPRopar.value, 840);

    // GHTP
    setProBadge("GHTP1Badge", data.thermalGHTPLehraMohabbat1.value, "GHTP1Card");
    setProBadge("GHTP2Badge", data.thermalGHTPLehraMohabbat2.value, "GHTP2Card");
    setProBadge("GHTP3Badge", data.thermalGHTPLehraMohabbat3.value, "GHTP3Card");
    setProBadge("GHTP4Badge", data.thermalGHTPLehraMohabbat4.value, "GHTP4Card");
    setProProgress("GHTPTotalProgress", "GHTPTotalProgressText", data.totalGHTPLehraMohabbat.value, 920);

    // GATP
    setProBadge("GATP1Badge", data.ippGVK1.value, "GATP1Card");
    setProBadge("GATP2Badge", data.ippGVK2.value, "GATP2Card");
    setProProgress("GATPTotalProgress", "GATPTotalProgressText", data.totalIppGVK.value, 540);

    // PSPCL Thermal Total
    const totalPSPCLThermal = data.totalGGSSTPRopar.value + data.totalGHTPLehraMohabbat.value + data.totalIppGVK.value;
    const pspclthermalText = document.getElementById("PSPCLThermalText");
    if (pspclthermalText) {
        pspclthermalText.textContent = `${Math.round(totalPSPCLThermal)} / 2300 MW`;
    }

    // NPL
    setProBadge("NPL1Badge", data.ippRajpura1.value, "NPL1Card");
    setProBadge("NPL2Badge", data.ippRajpura2.value, "NPL2Card");
    setProProgress("NPLTotalProgress", "NPLTotalProgressText", data.totalIppRajpura.value, 1400);

    // TSPL
    setProBadge("TSPL1Badge", data.ippTalwandiSabo1.value, "TSPL1Card");
    setProBadge("TSPL2Badge", data.ippTalwandiSabo2.value, "TSPL2Card");
    setProBadge("TSPL3Badge", data.ippTalwandiSabo3.value, "TSPL3Card");
    setProProgress("TSPLTotalProgress", "TSPLTotalProgressText", data.totalIppTalwandiSabo.value, 1980);

    // IPPs Total
    const ippsTotal = document.getElementById("IPPsTotalText");
    if (ippsTotal) {
        ippsTotal.textContent = `${Math.round(data.totalIpp.value)} / 3380 MW`;
    }
    
    // Total Punjab Thermal
    const totalPunjabThermal = totalPSPCLThermal + data.totalIpp.value;
    setProProgress("PunjabThermalProgress", "PunjabThermalTotalText", totalPunjabThermal, 5680);

    // RSD
    setProBadge("RSD1Badge", data.hydroRSD1.value, "RSD1Card");
    setProBadge("RSD2Badge", data.hydroRSD2.value, "RSD2Card");
    setProBadge("RSD3Badge", data.hydroRSD3.value, "RSD3Card");
    setProBadge("RSD4Badge", data.hydroRSD4.value, "RSD4Card");
    setProProgress("RSDTotalProgress", "RSDTotalProgressText", data.totalRSD.value, 600);

    // UBDC-1
    setProBadge("UBDC1_1Badge", data.hydroUBDC1_1.value, "UBDC1_1Card");
    setProBadge("UBDC1_2Badge", data.hydroUBDC1_2.value, "UBDC1_2Card");
    setProProgress("UBDC1TotalProgress", "UBDC1TotalProgressText", data.totalUBDC1.value, 30.45);

    // UBDC-2
    setProBadge("UBDC2_1Badge", data.hydroUBDC2_1.value, "UBDC2_1Card");
    setProBadge("UBDC2_2Badge", data.hydroUBDC2_2.value, "UBDC2_2Card");
    setProProgress("UBDC2TotalProgress", "UBDC2TotalProgressText", data.totalUBDC2.value, 30.45);

    // UBDC-3
    setProBadge("UBDC3_1Badge", data.hydroUBDC3_1.value, "UBDC3_1Card");
    setProBadge("UBDC3_2Badge", data.hydroUBDC3_2.value, "UBDC3_2Card");
    setProProgress("UBDC3TotalProgress", "UBDC3TotalProgressText", data.totalUBDC3.value, 30.45);

    // MHP-1
    setProBadge("MHP1_1Badge", data.hydroMHP1_1.value, "MHP1_1Card");
    setProBadge("MHP1_2Badge", data.hydroMHP1_2.value, "MHP1_2Card");
    setProBadge("MHP1_3Badge", data.hydroMHP1_3.value, "MHP1_3Card");
    setProProgress("MHP1TotalProgress", "MHP1TotalProgressText", data.totalMHP1.value, 45);

    // MHP-2
    setProBadge("MHP2_1Badge", data.hydroMHP2_1.value, "MHP2_1Card");
    setProBadge("MHP2_2Badge", data.hydroMHP2_2.value, "MHP2_2Card");
    setProBadge("MHP2_3Badge", data.hydroMHP2_3.value, "MHP2_3Card");
    setProProgress("MHP2TotalProgress", "MHP2TotalProgressText", data.totalMHP2.value, 45);

    // MHP-3
    setProBadge("MHP3_1Badge", data.hydroMHP3_1.value, "MHP3_1Card");
    setProBadge("MHP3_2Badge", data.hydroMHP3_2.value, "MHP3_2Card");
    setProBadge("MHP3_3Badge", data.hydroMHP3_3.value, "MHP3_3Card");
    setProProgress("MHP3TotalProgress", "MHP3TotalProgressText", data.totalMHP3.value, 58.5);

    // MHP-4
    setProBadge("MHP4_1Badge", data.hydroMHP4_1.value, "MHP4_1Card");
    setProBadge("MHP4_2Badge", data.hydroMHP4_2.value, "MHP4_2Card");
    setProBadge("MHP4_3Badge", data.hydroMHP4_3.value, "MHP4_3Card");
    setProProgress("MHP4TotalProgress", "MHP4TotalProgressText", data.totalMHP4.value, 58.5);

    // MHP-5
    setProBadge("MHP5_1Badge", data.hydroMHP5_1.value, "MHP5_1Card");
    setProBadge("MHP5_2Badge", data.hydroMHP5_2.value, "MHP5_2Card");
    setProProgress("MHP5TotalProgress", "MHP5TotalProgressText", data.totalMHP5.value, 18);

    // ASHP-1
    setProBadge("ASHP1_1Badge", data.hydroASHP1_1.value, "ASHP1_1Card");
    setProBadge("ASHP1_2Badge", data.hydroASHP1_2.value, "ASHP1_2Card");
    setProProgress("ASHP1TotalProgress", "ASHP1TotalProgressText", data.totalASHP1.value, 67);

    // ASHP-2
    setProBadge("ASHP2_1Badge", data.hydroASHP2_1.value, "ASHP2_1Card");
    setProBadge("ASHP2_2Badge", data.hydroASHP2_2.value, "ASHP2_2Card");
    setProProgress("ASHP2TotalProgress", "ASHP2TotalProgressText", data.totalASHP2.value, 67);

    // SHANAN
    setProBadge("SHANAN1Badge", data.hydroShanan1.value, "SHANAN1Card");
    setProBadge("SHANAN2Badge", data.hydroShanan2.value, "SHANAN2Card");
    setProBadge("SHANAN3Badge", data.hydroShanan3.value, "SHANAN3Card");
    setProBadge("SHANAN4Badge", data.hydroShanan4.value, "SHANAN4Card");
    setProBadge("SHANAN5Badge", data.hydroShanan5.value, "SHANAN5Card");
    setProProgress("SHANANTotalProgress", "SHANANTotalProgressText", data.totalShanan.value, 110);

    // Hydro Summary - Remove references to non-existing elements
    const ubdcTotal = data.totalUBDC1.value + data.totalUBDC2.value + data.totalUBDC3.value;
    const mhpTotal = data.totalMHP1.value + data.totalMHP2.value + data.totalMHP3.value + data.totalMHP4.value + data.totalMHP5.value;
    const ashpTotal = data.totalASHP1.value + data.totalASHP2.value;

    // Update status overview cards
    const totalThermalGenElement = document.getElementById("totalThermalGen");
    if (totalThermalGenElement) {
        totalThermalGenElement.textContent = Math.round(totalPunjabThermal);
    }

    const totalHydroGenElement = document.getElementById("totalHydroGen");
    if (totalHydroGenElement) {
        totalHydroGenElement.textContent = Math.round(data.totalHydro.value);
    }

    const totalRESGenElement = document.getElementById("totalRESGen");
    if (totalRESGenElement) {
        totalRESGenElement.textContent = Math.round(data.totalResGeneration.value);
    }

    // Total Hydro
    const hydroTotal = document.getElementById("PunjabHydroTotalText");
    if (hydroTotal) {
        hydroTotal.textContent = `${Math.round(data.totalHydro.value)} / 1093.35 MW`;
    }

    // RES
    document.getElementById("solarRes").textContent = Math.round(data.resSolar.value);
    document.getElementById("nonSolarRes").textContent = Math.round(data.resNonSolar.value);
    document.getElementById("resTotal").textContent = Math.round(data.totalResGeneration.value);

    // Gross Generation with MW unit
    const grossGenElement = document.getElementById("grossGen");
    if (grossGenElement && data.grossGeneration && data.grossGeneration.value) {
        grossGenElement.textContent = Math.round(data.grossGeneration.value);
    }
}

function updateProSystemStatus(data) {
    if (data.updateDate && data.updateDate !== "") {
        // Update timestamp
        const updateDateElement = document.getElementById("updateDate");
        if (updateDateElement) {
            updateDateElement.textContent = data.updateDate;
        }
        
        // Update Load
        const loadElement = document.getElementById("loadMW");
        if (loadElement) {
            loadElement.textContent = Math.round(data.loadMW) + " MW";
        }
        
        // Update Drawal
        const drawalElement = document.getElementById("drawalMW");
        if (drawalElement) {
            drawalElement.textContent = Math.round(data.drawalMW) + " MW";
        }
        
        // Update Schedule
        const scheduleElement = document.getElementById("scheduleMW");
        if (scheduleElement) {
            scheduleElement.textContent = Math.round(data.scheduleMW) + " MW";
        }
        
        // Update OD/UD with color coding
        const odUDValue = Math.round(data.odUD);
        const odUDElement = document.getElementById("odUD");
        if (odUDElement) {
            odUDElement.textContent = odUDValue + " MW";
            
            // Update color based on OD/UD value
            if (odUDValue > 0) {
                odUDElement.style.color = "var(--danger-color)"; // Over Drawal - Red
                odUDElement.style.fontWeight = "700";
            } else if (odUDValue < 0) {
                odUDElement.style.color = "var(--success-color)"; // Under Drawal - Green
                odUDElement.style.fontWeight = "700";
            } else {
                odUDElement.style.color = "var(--primary-color)"; // Balanced - Blue
                odUDElement.style.fontWeight = "600";
            }
        }
        
        // Update Frequency
        const frequencyElement = document.getElementById("frequencyHz");
        if (frequencyElement) {
            frequencyElement.textContent = data.frequencyHz + " Hz";
        }
    }
}

function showErrorState() {
    const elements = ['loadMW', 'drawalMW', 'scheduleMW', 'odUD', 'frequencyHz', 'grossGen'];
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = 'Error';
            element.style.color = 'var(--danger-color)';
        }
    });
}

// Global variables for professional dashboard
let proPunjabGenUpdateInterval;
let proPunjabSystemUpdateInterval;

function initializePunjabGenerationPro() {
    // Clear any existing intervals
    if (proPunjabGenUpdateInterval) {
        clearInterval(proPunjabGenUpdateInterval);
    }
    if (proPunjabSystemUpdateInterval) {
        clearInterval(proPunjabSystemUpdateInterval);
    }
    
    console.log("Initializing Professional Punjab Generation dashboard...");
    
    // Add loading state
    document.getElementById("updateDate").textContent = "Loading...";
    
    // Add a small delay to ensure DOM is ready
    setTimeout(() => {
        // Initialize data updates - single call that chains system data automatically
        updateProDynamicData();
        
        // Set up periodic updates - only need to update generation data as it chains system data
        proPunjabGenUpdateInterval = setInterval(updateProDynamicData, 60000); // Refresh every 60 seconds
    }, 100);
}

// Function to stop Professional Punjab Generation updates
function stopPunjabGenerationProUpdates() {
    if (proPunjabGenUpdateInterval) {
        clearInterval(proPunjabGenUpdateInterval);
        proPunjabGenUpdateInterval = null;
    }
    if (proPunjabSystemUpdateInterval) {
        clearInterval(proPunjabSystemUpdateInterval);
        proPunjabSystemUpdateInterval = null;
    }
}
