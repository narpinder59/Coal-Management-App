// Punjab Generation Dashboard
function showPunjabGeneration() {
    const punjabGenerationHTML = `
        <style>
            /* Animated text style */
            .animate-charcter {
                text-transform: uppercase;
                background-image: linear-gradient(
                    -225deg,
                    #0de84f 0%,
                    #44107a 29%,
                    #ff1361 67%,
                    #fff800 100%
                );
                background-size: 200% auto;
                background-clip: text;
                -webkit-background-clip: text;
                color: #fff;
                -webkit-text-fill-color: transparent;
                animation: textclip 2s linear infinite;
                display: inline-block;
                font-size: 20px;
                text-align: center;
                width: 100%;
            }

            @keyframes textclip {
                to {
                    background-position: 200% center;
                }
            }

            .punjab-gen .card {
                margin-bottom: 10px; 
                box-shadow: 0 0 15px rgba(0, 0, 0, 0.1); 
            }
            
            .punjab-gen .card-header { 
                background-color: #343a40;
                color: #fff; 
                padding: 5px; 
            }
            
            .punjab-gen .card-body { 
                background-color: #fff; 
                padding: 5px;
                font-size: 10px;
            }
            
            /* Mobile responsive adjustments */
            @media (max-width: 768px) {
                .punjab-gen.container-fluid {
                    padding-left: 5px !important;
                    padding-right: 5px !important;
                    margin-left: 0 !important;
                    margin-right: 0 !important;
                    max-width: 100% !important;
                }
                
                .punjab-gen .row {
                    margin-left: -2px !important;
                    margin-right: -2px !important;
                }
                
                .punjab-gen .col-12,
                .punjab-gen .col-md-6,
                .punjab-gen .col-lg-9,
                .punjab-gen .col-lg-3 {
                    padding-left: 2px !important;
                    padding-right: 2px !important;
                }
                
                .punjab-gen .card {
                    margin-bottom: 5px;
                    border-radius: 5px;
                }
                
                .punjab-gen .card-header {
                    padding: 3px;
                    font-size: 11px;
                }
                
                .punjab-gen .card-body {
                    padding: 3px;
                }
                
                .punjab-gen .plant-title {
                    font-size: 10px;
                    width: 50px;
                }
                
                .punjab-gen .textContent {
                    font-size: 9px;
                    width: 80px;
                }
                
                .punjab-gen .animate-charcter {
                    font-size: 16px;
                    margin-bottom: 10px;
                }
                
                .punjab-gen .table-sm {
                    font-size: 9px;
                }
                
                .punjab-gen .table-sm td {
                    padding: 2px;
                }
                
                #frequencyHz {
                    font-size: 2rem !important;
                }
                
                #frequencyHzUnit {
                    font-size: 1rem !important;
                }
                
                .punjab-gen .badge {
                    font-size: 8px;
                    padding: 2px 4px;
                }
                
                .punjab-gen .progress {
                    height: 12px;
                    width: 4rem;
                }
            }
            
            .punjab-gen .card-body .textContent {
                float:right; 
                font-size: 10px;
                font-family: Verdana, Geneva, Tahoma, sans-serif; 
                font-weight: bold; 
                margin-right: 2px; 
                width: 100px;
            }
            
            .punjab-gen .card-body .RESText {
                float: inline-start; 
                font-size: 10px;
                font-family: Verdana, Geneva, Tahoma, sans-serif; 
                font-weight: bold; 
                margin-right: 15px; 
            }
            
            .punjab-gen .card-body .p {
                font-size: 10px;
            }
            
            .punjab-gen .card-footer {
                background-color: #f8f9fa;
                border-top: 1px solid #dee2e6; 
            }
            
            .punjab-gen .badge-danger { 
                background-color: red; 
            }
            
            .punjab-gen .badge-success { 
                background-color: rgb(8, 176, 8);
            }
            
            .punjab-gen .badge-primary { 
                background-color: #007bff !important;
                color: white !important;
            }
            
            .punjab-gen .progress {
                margin-top: 3px; 
                margin-right: 3px; 
                background-color: #cecece; 
                width: 5rem;
            }
            
            .punjab-gen .row-align {
                display: flex; 
                align-items: center; 
            }
            
            .punjab-gen .plant-title {
                font-size: 12px; 
                color: #0d6efd; 
                font-weight: bold; 
                width: 60px; 
                margin-right: 3px; 
                margin-top: 1px;
            }
            
            .punjab-gen .badge {
                margin: 0 1px; 
                font-size: 10px;
            }
            
            .punjab-gen .badge-container .capacity{
                font-size: 10px; 
                margin-top: 0px;
            }
        </style>

        <div class="punjab-gen container-fluid">
            <h5 class="animate-charcter">Punjab Power Generation Dashboard</h5>
            <div class="col-12 col-md-6">
                <div class="card" style="width: fit-content;">
                    <div class="card-header">
                        <p style="width:100%; margin: 0px;">Power Status at:<span class="badge badge-success" id="updateDate" style="color: rgb(246, 245, 245); float: right; font-size: large; font-family:monospace;"></span></p>
                    </div>
                    <div class="card-body" style="padding: 0px; margin-bottom: 0%;">
                        <div class="row-align" style="align-items: baseline;">
                            <table class="table table-sm" style="padding: 0px; margin-bottom: 0%; width: fit-content;">
                                <tr>
                                    <td>Load</td>
                                    <td id="loadMW"></td>   
                                    <td class="merged-column" rowspan="5" style="vertical-align: middle;">
                                        <span id="frequencyHz" style="font-size: 3rem; color: #0d6efd; "></span>
                                        <span id="frequencyHzUnit" style="font-size: 1.5rem; color: #0d6efd; "></span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Drawal</td>
                                    <td id="drawalMW"></td>
                                </tr>
                                <tr>
                                    <td>Schedule</td>
                                    <td id="scheduleMW"></td>
                                </tr>
                                <tr>
                                    <td>OD(+)/UD(-)</td>
                                    <td id="odUD"></td>
                                </tr>
                                <tr>
                                    <td>PSPCL Gross Generation</td>
                                    <td style="vertical-align: middle;"><div class="badge badge-primary" style="font-weight: bold; font-size: 14px; min-width: 60px; padding: 5px; background-color: #007bff; color: white;" id="grossGen">Loading...</div></td>
                                </tr>
                            </table>
                        </div>
                    </div>  
                </div>
            </div>

            <div class="row">
                <!-- PSPCL Thermal Plants -->
                <div class="col-12 col-md-6">
                    <div class="card">
                        <div class="card-header PSPCL">PSPCL Thermal Plants
                            <a style="float:right;" class="textContent" id="PSPCLThermalText">NA</a>
                            <div id="PSPCLTotalProgress" class="progress" style="width: auto; height: 15px;"></div> 
                        </div>
                        <div class="card-body">
                            <div class="row-align" style="align-items: baseline;">
                                <h5 class="plant-title">GGSSTP</h5>
                                <a class="textContent" id="GGSSTPTotalProgressText">NA</a>
                                <div id="GGSSTPTotalProgress" class="progress"></div><div class="badge-container">
                                    <span></span><div id="GGSSTP3Badge" class="badge"></div>
                                    <span></span><div id="GGSSTP4Badge" class="badge"></div>
                                    <span></span><div id="GGSSTP5Badge" class="badge"></div>
                                    <span></span><div id="GGSSTP6Badge" class="badge"></div>
                                    <br>
                                    <div class="badge capacity" style="font-size: 8px; width: 25px;">210</div>
                                    <div class="badge capacity" style="font-size: 8px;width: 25px ">210</div>
                                    <div class="badge capacity" style="font-size: 8px; width: 25px;">210</div>
                                    <div class="badge capacity" style="font-size: 8px; width: 25px">210</div>
                                </div>
                            </div>
                            <hr style="margin: 0px; border-width: 1px; ">
                            <div class="row-align" style="align-items: baseline;">
                                <h5 class="plant-title">GHTP</h5>
                                <a class="textContent" id="GHTPTotalProgressText">NA</a>
                                <div id="GHTPTotalProgress" class="progress"></div><div class="badge-container">
                                    <span></span><div id="GHTP1Badge" class="badge"></div>
                                    <span></span><div id="GHTP2Badge" class="badge"></div>
                                    <span></span><div id="GHTP3Badge" class="badge"></div>
                                    <span></span><div id="GHTP4Badge" class="badge"></div>
                                    <br>
                                    <span></span><div class="badge capacity" style="font-size: 8px; width: 25px;">210</div>
                                    <span></span><div class="badge capacity" style="font-size: 8px; width: 25px;">210</div>
                                    <span></span><div class="badge capacity" style="font-size: 8px; width: 25px;">250</div>
                                    <span></span><div class="badge capacity" style="font-size: 8px; width: 25px;">250</div>
                                </div>
                            </div>
                            <hr style="margin: 0px; border-width: 1px; ">
                            <div class="row-align" style="align-items: baseline;">
                                <h5 class="plant-title">GATP</h5>
                                <a class="textContent" id="GATPTotalProgressText">NA</a>
                                <div id="GATPTotalProgress" class="progress"></div><div class="badge-container">
                                    <span></span><div id="GATP1Badge" class="badge"></div>
                                    <span></span><div id="GATP2Badge" class="badge"></div>      
                                    <br>
                                    <span></span><div class="badge capacity" style="font-size: 8px; width: 25px;">270</div>
                                    <span></span><div class="badge capacity" style="font-size: 8px; width: 25px;">270</div>
                                </div>
                            </div>                                                   
                        </div>
                    </div>                       
                </div>

                <!-- IPPs -->
                <div class="col-12 col-md-6">
                    <div class="card">
                        <div class="card-header">IPPs
                            <a style="float:right;" class="textContent" id="IPPsTotalText">NA</a>
                            <div id="IPPsTotalProgress" class="progress" style="width: auto; height: 15px;"></div> 
                        </div>
                        <div class="card-body">
                            <div class="row-align" style="align-items: baseline;">
                                <h5 class="plant-title">NPL</h5>
                                <a class="textContent" id="NPLTotalProgressText">NA</a>
                                <div id="NPLTotalProgress" class="progress"></div><div class="badge-container">
                                    <span></span><div id="NPL1Badge" class="badge"></div>
                                    <span></span><div id="NPL2Badge" class="badge"></div>     
                                    <br>
                                    <span></span><div class="badge capacity" style="font-size: 8px; width: 25px;">700</div>
                                    <span></span><div class="badge capacity" style="font-size: 8px; width: 25px;">700</div>
                                </div>
                            </div>
                            <hr style="margin: 0px; border-width: 1px; ">
                            <div class="row-align" style="align-items: baseline;">
                                <h5 class="plant-title">TSPL</h5>
                                <a class="textContent" id="TSPLTotalProgressText">NA</a>
                                <div id="TSPLTotalProgress" class="progress"></div><div class="badge-container">
                                    <span></span><div id="TSPL1Badge" class="badge"></div>
                                    <span></span><div id="TSPL2Badge" class="badge"></div>     
                                    <span></span><div id="TSPL3Badge" class="badge"></div>    
                                    <br>
                                    <span></span><div class="badge capacity" style="font-size: 8px; width: 25px;">660</div>
                                    <span></span><div class="badge capacity" style="font-size: 8px; width: 25px;">660</div>
                                    <span></span><div class="badge capacity" style="font-size: 8px; width: 25px;">660</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Total Punjab Thermal -->
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">Total Punjab Thermal
                            <a style="float:right;" class="textContent" id="PunjabThermalTotalText">NA</a>
                            <div id="PunjabThermalProgress" class="progress" style="width: auto; height: 15px;"></div> 
                        </div>                    
                    </div>
                </div>

                <!-- Hydro Plants -->
                <div class="col-12 col-lg-9">
                    <div class="card">
                        <div class="card-header">PSPCL Hydro
                            <a style="float:right;" class="textContent" id="PunjabHydroTotalText">NA</a>
                            <div id="PunjabHydroTotalProgress" class="progress" style="width: auto; height: 15px;"></div> 
                        </div>  
                        <div class="card-body">
                            <div class="row-align" style="align-items: baseline;">
                                <h5 class="plant-title">RSD</h5>
                                <a class="textContent" id="RSDTotalProgressText">NA</a>
                                <div id="RSDTotalProgress" class="progress"></div><div class="badge-container">
                                    <span></span><div id="RSD1Badge" class="badge"></div>
                                    <span></span><div id="RSD2Badge" class="badge"></div>
                                    <span></span><div id="RSD3Badge" class="badge"></div>
                                    <span></span><div id="RSD4Badge" class="badge"></div>
                                    <br>
                                    <span></span><div class="badge capacity" style="font-size: 8px; width: 25px;">150</div>
                                    <span></span><div class="badge capacity" style="font-size: 8px; width: 25px;">150</div>
                                    <span></span><div class="badge capacity" style="font-size: 8px; width: 25px;">150</div>
                                    <span></span><div class="badge capacity" style="font-size: 8px; width: 25px;">150</div>
                                </div>
                            </div>
                            <hr style="margin: 0px; border-width: 1px; ">
                            <div class="row-align" style="align-items: baseline;">
                                <h5 class="plant-title">UBDC-1</h5>
                                <a class="textContent" id="UBDC1TotalProgressText">NA</a>
                                <div id="UBDC1TotalProgress" class="progress"></div><div class="badge-container">
                                    <span></span><div id="UBDC1_1Badge" class="badge"></div>
                                    <span></span><div id="UBDC1_2Badge" class="badge"></div>   
                                    <br>
                                    <span></span><div class="badge capacity" style="font-size: 8px; width: 15px;">15</div>
                                    <span></span><div class="badge capacity" style="font-size: 8px; width: 15px;">15.45</div>
                                </div>
                            </div>                        
                            <hr style="margin: 0px; border-width: 1px; ">
                            <div class="row-align" style="align-items: baseline;">
                                <h5 class="plant-title">UBDC-2</h5>
                                <a class="textContent" id="UBDC2TotalProgressText">NA</a>
                                <div id="UBDC2TotalProgress" class="progress"></div><div class="badge-container">
                                    <span></span><div id="UBDC2_1Badge" class="badge"></div>
                                    <span></span><div id="UBDC2_2Badge" class="badge"></div>        
                                    <br>
                                    <span></span><div class="badge capacity" style="font-size: 8px; width: 15px;">15</div>
                                    <span></span><div class="badge capacity" style="font-size: 8px; width: 15px;">15.45</div>                        
                                </div>
                            </div>
                            <hr style="margin: 0px; border-width: 1px; ">
                            <div class="row-align" style="align-items: baseline;">
                                <h5 class="plant-title">UBDC-3</h5>
                                <a class="textContent" id="UBDC3TotalProgressText">NA</a>
                                <div id="UBDC3TotalProgress" class="progress"></div><div class="badge-container">
                                    <span></span><div id="UBDC3_1Badge" class="badge"></div>
                                    <span></span><div id="UBDC3_2Badge" class="badge"></div>     
                                    <br>
                                    <span></span><div class="badge capacity" style="font-size: 8px; width: 15px;">15</div>
                                    <span></span><div class="badge capacity" style="font-size: 8px; width: 15px;">15.45</div>                           
                                </div>
                            </div>
                            <hr style="margin: 0px; border-width: 1px; ">
                            <div class="row-align" style="align-items: baseline;">
                                <h5 class="plant-title">MHP-1</h5>
                                <a class="textContent" id="MHP1TotalProgressText">NA</a>
                                <div id="MHP1TotalProgress" class="progress"></div><div class="badge-container">
                                    <span></span><div id="MHP1_1Badge" class="badge"></div>
                                    <span></span><div id="MHP1_2Badge" class="badge"></div>
                                    <span></span><div id="MHP1_3Badge" class="badge"></div>       
                                    <br>
                                    <span></span><div class="badge capacity" style="font-size: 8px; width: 20px;">15</div>
                                    <span></span><div class="badge capacity" style="font-size: 8px; width: 20px;">15</div>
                                    <span></span><div class="badge capacity" style="font-size: 8px; width: 20px;">15</div>                         
                                </div>
                            </div>
                            <hr style="margin: 0px; border-width: 1px; ">
                            <div class="row-align" style="align-items: baseline;">
                                <h5 class="plant-title">MHP-2</h5>
                                <a class="textContent" id="MHP2TotalProgressText">NA</a>
                                <div id="MHP2TotalProgress" class="progress"></div><div class="badge-container">
                                    <span></span><div id="MHP2_1Badge" class="badge"></div>
                                    <span></span><div id="MHP2_2Badge" class="badge"></div>
                                    <span></span><div id="MHP2_3Badge" class="badge"></div>   
                                    <br>
                                    <span></span><div class="badge capacity" style="font-size: 8px; width: 20px;">15</div>
                                    <span></span><div class="badge capacity" style="font-size: 8px; width: 20px;">15</div>
                                    <span></span><div class="badge capacity" style="font-size: 8px; width: 20px;">15</div>                                
                                </div>
                            </div>
                            <hr style="margin: 0px; border-width: 1px; ">
                            <div class="row-align" style="align-items: baseline;">
                                <h5 class="plant-title">MHP-3</h5>
                                <a class="textContent" id="MHP3TotalProgressText">NA</a>
                                <div id="MHP3TotalProgress" class="progress"></div><div class="badge-container">
                                    <span></span><div id="MHP3_1Badge" class="badge"></div>
                                    <span></span><div id="MHP3_2Badge" class="badge"></div>
                                    <span></span><div id="MHP3_3Badge" class="badge"></div>          
                                    <br>
                                    <div class="badge capacity" style="font-size: 8px; width: 18px;">19.5</div>
                                    <div class="badge capacity" style="font-size: 8px;width: 18px;">19.5</div>
                                    <div class="badge capacity" style="font-size: 8px;width: 18px; ">19.5</div>                         
                                </div>
                            </div>
                            <hr style="margin: 0px; border-width: 1px; ">
                            <div class="row-align" style="align-items: baseline;">
                                <h5 class="plant-title">MHP-4</h5>
                                <a class="textContent" id="MHP4TotalProgressText">NA</a>
                                <div id="MHP4TotalProgress" class="progress"></div><div class="badge-container">
                                    <span></span><div id="MHP4_1Badge" class="badge"></div>
                                    <span></span><div id="MHP4_2Badge" class="badge"></div>
                                    <span></span><div id="MHP4_3Badge" class="badge"></div>      
                                    <br>
                                    <div class="badge capacity" style="font-size: 8px; width: 18px;">19.5</div>
                                    <div class="badge capacity" style="font-size: 8px;width: 18px;">19.5</div>
                                    <div class="badge capacity" style="font-size: 8px; width: 18px;">19.5</div>   
                                </div>
                            </div>
                            <hr style="margin: 0px; border-width: 1px; ">
                            <div class="row-align" style="align-items: baseline;">
                                <h5 class="plant-title">MHP-5</h5>
                                <a class="textContent" id="MHP5TotalProgressText">NA</a>
                                <div id="MHP5TotalProgress" class="progress"></div><div class="badge-container">
                                    <span></span><div id="MHP5_1Badge" class="badge" ></div>
                                    <span></span><div id="MHP5_2Badge" class="badge"></div>   
                                    <br>
                                    <span></span><div class="badge capacity" style="font-size: 8px; width: 15px;">9</div>
                                    <span></span><div class="badge capacity" style="font-size: 8px; width: 10px;">9</div>
                                </div>
                            </div>
                            <hr style="margin: 0px; border-width: 1px; ">
                            <div class="row-align" style="align-items: baseline;">
                                <h5 class="plant-title">ASHP-1</h5>
                                <a class="textContent" id="ASHP1TotalProgressText">NA</a>
                                <div id="ASHP1TotalProgress" class="progress"></div><div class="badge-container">
                                    <span></span><div id="ASHP1_1Badge" class="badge"></div>
                                    <span></span><div id="ASHP1_2Badge" class="badge"></div>   
                                    <br>
                                    <div class="badge capacity" style="font-size: 8px; width: 18px;">33.5</div>
                                    <div class="badge capacity" style="font-size: 8px; width: 18px;">33.5</div>
                                </div>
                            </div>
                            <hr style="margin: 0px; border-width: 1px; ">
                            <div class="row-align" style="align-items: baseline;">
                                <h5 class="plant-title">ASHP-2</h5>
                                <a class="textContent" id="ASHP2TotalProgressText">NA</a>
                                <div id="ASHP2TotalProgress" class="progress"></div><div class="badge-container">
                                    <span></span><div id="ASHP2_1Badge" class="badge"></div>
                                    <span></span><div id="ASHP2_2Badge" class="badge"></div>        
                                    <br>
                                    <div class="badge capacity" style="font-size: 8px; width: 18px;">33.5</div>
                                    <div class="badge capacity" style="font-size: 8px; width: 18px;">33.5</div>
                                </div>
                            </div>
                            <hr style="margin: 0px; border-width: 1px; ">
                            <div class="row-align" style="align-items: baseline;">
                                <h5 class="plant-title">SHANAN</h5>
                                <a class="textContent" id="SHANANTotalProgressText">NA</a>
                                <div id="SHANANTotalProgress" class="progress"></div><div class="badge-container">
                                    <span></span><div id="SHANAN1Badge" class="badge"></div>
                                    <span></span><div id="SHANAN2Badge" class="badge"></div>
                                    <span></span><div id="SHANAN3Badge" class="badge"></div>
                                    <span></span><div id="SHANAN4Badge" class="badge"></div>
                                    <span></span><div id="SHANAN5Badge" class="badge"></div>
                                    <br>
                                    <div class="badge capacity" style="font-size: 8px; width: 18px;">15</div>
                                    <div class="badge capacity" style="font-size: 8px; width: 15px;">15</div>
                                    <div class="badge capacity" style="font-size: 8px; width: 15px;">15</div>
                                    <div class="badge capacity" style="font-size: 8px; width: 20px;">15</div>
                                    <div class="badge capacity" style="font-size: 8px; width: 28px;">50</div>
                                </div>
                            </div>                         
                        </div>
                    </div>
                </div>

                <!-- RES Section -->
                <div class="col-12 col-lg-3">
                    <div class="card">
                        <div class="card-body" style="background-color: #f2e03f;">
                            <p class="RESText">Solar RES: <span class="badge-success badge" id="solarRes"></span> MW</p>
                            <p class="RESText">Non Solar RES: <span class="badge-success badge" id="nonSolarRes"></span> MW</p>
                            <p class="RESText">Total RES: <span class="badge-primary badge" id="resTotal"></span> MW</p>                    
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('main-content').innerHTML = punjabGenerationHTML;
    
    // Initialize the Punjab Generation data updates
    initializePunjabGeneration();
}

// Punjab Generation utility functions
function setBadge(elementId, value) {
    const badge = document.getElementById(elementId);
    if (badge) {
        console.log(`Setting badge ${elementId} to value ${value}`);
        if (value > 0) {
            badge.textContent = value;
            badge.classList.add('badge-success');
            badge.classList.remove('badge-danger');
        } else {
            badge.textContent = '00';
            badge.classList.add('badge-danger');
            badge.classList.remove('badge-success');
        }
    } else {
        console.log(`Badge element ${elementId} not found`);
    }
}

function setProgress(elementId, value, maxValue) {
    const progressBar = document.getElementById(elementId);
    if (progressBar) {
        const percentage = (value / maxValue) * 100;
        progressBar.innerHTML = `<div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: ${percentage}%;">${Math.round(percentage)}%</div>`;
    } else {
        console.log(`Progress bar element ${elementId} not found`);
    }
}

function updateDynamicText(elementId, value, maxValue) {
    const dynamicTextElement = document.getElementById(elementId);
    if (dynamicTextElement) {
        dynamicTextElement.textContent = `${Math.round(value)} / ${maxValue} MW`;
    } else {
        console.log(`Element with id "${elementId}" not found.`);
    }
}

function updatePbGenData() {
    console.log("Fetching Punjab generation data...");
    var xmlhttp = new XMLHttpRequest();
    var url = "https://sldcapi.pstcl.org/wsDataService.asmx/pbGenData2"; 
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            try {
                var myArr = JSON.parse(this.responseText);
                console.log("Punjab generation data received:", myArr);
                updatePbGenData1(myArr);
                
                // Ensure gross generation is specifically updated
                setTimeout(() => {
                    const grossGenElement = document.getElementById("grossGen");
                    if (grossGenElement && myArr.grossGeneration && myArr.grossGeneration.value) {
                        grossGenElement.innerHTML = Math.round(myArr.grossGeneration.value) + " MW";
                        grossGenElement.style.backgroundColor = "#007bff";
                        grossGenElement.style.color = "white";
                        grossGenElement.classList.add("badge-primary");
                        console.log("Force updated gross generation:", myArr.grossGeneration.value);
                    }
                }, 200);
                
            } catch (error) {
                console.error("Error parsing Punjab generation data:", error);
            }
        } else if (this.status != 200 && this.readyState == 4) {
            console.log("Punjab generation API error - Ready state: " + this.readyState + " Status: " + this.status);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function updatePbGenData1(data) {
    // GGSSTP
    setBadge("GGSSTP3Badge", Math.round(data.thermalGGSSTPRopar3.value));
    setBadge("GGSSTP4Badge", Math.round(data.thermalGGSSTPRopar4.value));
    setBadge("GGSSTP5Badge", Math.round(data.thermalGGSSTPRopar5.value));
    setBadge("GGSSTP6Badge", Math.round(data.thermalGGSSTPRopar6.value));
    setProgress("GGSSTPTotalProgress", data.totalGGSSTPRopar.value, 840);
    updateDynamicText("GGSSTPTotalProgressText", data.totalGGSSTPRopar.value, 840);

    // GHTP
    setBadge("GHTP1Badge", Math.round(data.thermalGHTPLehraMohabbat1.value));
    setBadge("GHTP2Badge", Math.round(data.thermalGHTPLehraMohabbat2.value));
    setBadge("GHTP3Badge", Math.round(data.thermalGHTPLehraMohabbat3.value));
    setBadge("GHTP4Badge", Math.round(data.thermalGHTPLehraMohabbat4.value));
    setProgress("GHTPTotalProgress", data.totalGHTPLehraMohabbat.value, 920);
    updateDynamicText("GHTPTotalProgressText", data.totalGHTPLehraMohabbat.value, 920);

    // GATP
    setBadge("GATP1Badge", data.ippGVK1.value);
    setBadge("GATP2Badge", data.ippGVK2.value);
    setProgress("GATPTotalProgress", data.totalIppGVK.value, 540);
    updateDynamicText("GATPTotalProgressText", data.totalIppGVK.value, 540);

    // Total PSPCL Thermal
    const totalPSPCLThermal = data.totalGGSSTPRopar.value + data.totalGHTPLehraMohabbat.value + data.totalIppGVK.value;
    setProgress("PSPCLTotalProgress", totalPSPCLThermal, 2300);
    updateDynamicText("PSPCLThermalText", data.totalThermal.value, 2300);

    // NPL
    setBadge("NPL1Badge", Math.round(data.ippRajpura1.value));
    setBadge("NPL2Badge", Math.round(data.ippRajpura2.value));
    setProgress("NPLTotalProgress", data.totalIppRajpura.value, 1400);
    updateDynamicText("NPLTotalProgressText", data.totalIppRajpura.value, 1400);

    // TSPL
    setBadge("TSPL1Badge", data.ippTalwandiSabo1.value);
    setBadge("TSPL2Badge", data.ippTalwandiSabo2.value);
    setBadge("TSPL3Badge", data.ippTalwandiSabo3.value);
    setProgress("TSPLTotalProgress", data.totalIppTalwandiSabo.value, 1980);
    updateDynamicText("TSPLTotalProgressText", data.totalIppTalwandiSabo.value, 1980);

    // Total IPPs
    setProgress("IPPsTotalProgress", data.totalIpp.value, 3380);
    updateDynamicText("IPPsTotalText", data.totalIpp.value, 3380);
    
    // Total Punjab Thermal
    const totalPunjabThermal = totalPSPCLThermal + data.totalIpp.value;
    setProgress("PunjabThermalProgress", totalPunjabThermal, 5680);
    updateDynamicText("PunjabThermalTotalText", totalPunjabThermal, 5680);

    // HYDRO PLANTS
    
    // RSD
    setBadge("RSD1Badge", Math.round(data.hydroRSD1.value));
    setBadge("RSD2Badge", Math.round(data.hydroRSD2.value));
    setBadge("RSD3Badge", Math.round(data.hydroRSD3.value));
    setBadge("RSD4Badge", Math.round(data.hydroRSD4.value));
    setProgress("RSDTotalProgress", data.totalRSD.value, 600);
    updateDynamicText("RSDTotalProgressText", data.totalRSD.value, 600);

    // UBDC-1
    setBadge("UBDC1_1Badge", Math.round(data.hydroRSDUBDC1_1.value));
    setBadge("UBDC1_2Badge", Math.round(data.hydroRSDUBDC1_2.value));
    setProgress("UBDC1TotalProgress", data.totalUBDC1.value, 30.45);
    updateDynamicText("UBDC1TotalProgressText", data.totalUBDC1.value, 30.45);

    // UBDC-2
    setBadge("UBDC2_1Badge", Math.round(data.hydroRSDUBDC2_1.value));
    setBadge("UBDC2_2Badge", Math.round(data.hydroRSDUBDC2_2.value));
    setProgress("UBDC2TotalProgress", data.totalUBDC2.value, 30.45);
    updateDynamicText("UBDC2TotalProgressText", data.totalUBDC2.value, 30.45);

    // UBDC-3
    setBadge("UBDC3_1Badge", Math.round(data.hydroRSDUBDC3_1.value));
    setBadge("UBDC3_2Badge", Math.round(data.hydroRSDUBDC3_2.value));
    setProgress("UBDC3TotalProgress", data.totalUBDC3.value, 30.45);
    updateDynamicText("UBDC3TotalProgressText", data.totalUBDC3.value, 30.45);

    // MHP-1
    setBadge("MHP1_1Badge", Math.round(data.hydroRSDMHP1_1.value));
    setBadge("MHP1_2Badge", Math.round(data.hydroRSDMHP1_2.value));
    setBadge("MHP1_3Badge", Math.round(data.hydroRSDMHP1_3.value));
    setProgress("MHP1TotalProgress", data.totalMHP1.value, 45);
    updateDynamicText("MHP1TotalProgressText", data.totalMHP1.value, 45);

    // MHP-2
    setBadge("MHP2_1Badge", Math.round(data.hydroRSDMHP2_1.value));
    setBadge("MHP2_2Badge", Math.round(data.hydroRSDMHP2_2.value));
    setBadge("MHP2_3Badge", Math.round(data.hydroRSDMHP2_3.value));
    setProgress("MHP2TotalProgress", data.totalMHP2.value, 45);
    updateDynamicText("MHP2TotalProgressText", data.totalMHP2.value, 45);

    // MHP-3
    setBadge("MHP3_1Badge", Math.round(data.hydroRSDMHP3_1.value));
    setBadge("MHP3_2Badge", Math.round(data.hydroRSDMHP3_2.value));
    setBadge("MHP3_3Badge", Math.round(data.hydroRSDMHP3_3.value));
    setProgress("MHP3TotalProgress", data.totalMHP3.value, 58.5);
    updateDynamicText("MHP3TotalProgressText", data.totalMHP3.value, 58.5);

    // MHP-4
    setBadge("MHP4_1Badge", Math.round(data.hydroRSDMHP4_1.value));
    setBadge("MHP4_2Badge", Math.round(data.hydroRSDMHP4_2.value));
    setBadge("MHP4_3Badge", Math.round(data.hydroRSDMHP4_3.value));
    setProgress("MHP4TotalProgress", data.totalMHP4.value, 58.5);
    updateDynamicText("MHP4TotalProgressText", data.totalMHP4.value, 58.5);

    // MHP-5
    setBadge("MHP5_1Badge", Math.round(data.hydroRSDMHP5_1.value));
    setBadge("MHP5_2Badge", Math.round(data.hydroRSDMHP5_2.value));
    setProgress("MHP5TotalProgress", data.totalMHP5.value, 18);
    updateDynamicText("MHP5TotalProgressText", data.totalMHP5.value, 18);

    // ASHP-1
    setBadge("ASHP1_1Badge", Math.round(data.hydroRSDASHP1_1.value));
    setBadge("ASHP1_2Badge", Math.round(data.hydroRSDASHP1_2.value));
    setProgress("ASHP1TotalProgress", data.totalASHP1.value, 67);
    updateDynamicText("ASHP1TotalProgressText", data.totalASHP1.value, 67);

    // ASHP-2
    setBadge("ASHP2_1Badge", Math.round(data.hydroRSDASHP2_1.value));
    setBadge("ASHP2_2Badge", Math.round(data.hydroRSDASHP2_2.value));
    setProgress("ASHP2TotalProgress", data.totalASHP2.value, 67);
    updateDynamicText("ASHP2TotalProgressText", data.totalASHP2.value, 67);

    // SHANAN
    setBadge("SHANAN1Badge", Math.round(data.hydroShanan1.value));
    setBadge("SHANAN2Badge", Math.round(data.hydroShanan2.value));
    setBadge("SHANAN3Badge", Math.round(data.hydroShanan3.value));
    setBadge("SHANAN4Badge", Math.round(data.hydroShanan4.value));
    setBadge("SHANAN5Badge", Math.round(data.hydroShanan5.value));
    setProgress("SHANANTotalProgress", data.totalShanan.value, 110);
    updateDynamicText("SHANANTotalProgressText", data.totalShanan.value, 110);

    // Total Hydro
    setProgress("PunjabHydroTotalProgress", data.totalHydro.value, 1093.35);
    updateDynamicText("PunjabHydroTotalText", data.totalHydro.value, 1093.35);

    // RES
    document.getElementById("solarRes").innerHTML = Math.round(data.resSolar.value);
    document.getElementById("nonSolarRes").innerHTML = Math.round(data.resNonSolar.value);
    document.getElementById("resTotal").innerHTML = Math.round(data.totalResGeneration.value);

    // GROSS GENERATION
    const grossGenElement = document.getElementById("grossGen");
    if (grossGenElement && data.grossGeneration && data.grossGeneration.value) {
        console.log("Updating gross generation with value:", data.grossGeneration.value);
        grossGenElement.innerHTML = Math.round(data.grossGeneration.value) + " MW";
        grossGenElement.style.fontSize = "14px";
        grossGenElement.style.fontWeight = "bold";
        grossGenElement.style.backgroundColor = "#007bff";
        grossGenElement.style.color = "white";
        grossGenElement.classList.add("badge-primary");
    } else {
        console.log("grossGen element not found or data missing!", {
            element: !!grossGenElement,
            grossGeneration: data.grossGeneration,
            value: data.grossGeneration ? data.grossGeneration.value : 'undefined'
        });
        
        // Fallback: try to update after a short delay
        setTimeout(() => {
            const retryElement = document.getElementById("grossGen");
            if (retryElement && data.grossGeneration && data.grossGeneration.value) {
                retryElement.innerHTML = Math.round(data.grossGeneration.value) + " MW";
                retryElement.style.backgroundColor = "#007bff";
                retryElement.style.color = "white";
                retryElement.classList.add("badge-primary");
                console.log("Gross generation updated on retry:", data.grossGeneration.value);
            }
        }, 500);
    }
}

function updateDynamicData() {
    var xmlhttp = new XMLHttpRequest();
    var url = "https://sldcapi.pstcl.org/wsDataService.asmx/dynamicData"; 
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var myArr = JSON.parse(this.responseText);
            myFunction(myArr);
        } else if (this.status != 200) {
            console.log("Ready state" + this.readyState + "  Status:" + this.status);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function updatePbGrossData() {
    var xmlhttp = new XMLHttpRequest();
    var url = "https://sldcapi.pstcl.org/wsDataService.asmx/pbGenData2"; 
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var myArr = JSON.parse(this.responseText);
            insertPbGrossData(myArr);
        } else if (this.status != 200) {
            console.log("Ready state" + this.readyState + "  Status:" + this.status);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function insertPbGrossData(arr) {
    console.log("insertPbGrossData called with:", arr);
    if (arr == null) {
        console.log("Array is null, retrying...");
        setTimeout(() => updatePbGrossData(), 2000);
    } else if (arr.grossGeneration == null) {
        console.log("grossGeneration is null, retrying...");
        setTimeout(() => updatePbGrossData(), 2000);
    } else {
        const grossGenElement = document.getElementById("grossGen");
        if (grossGenElement && arr.grossGeneration.value !== undefined) {
            const grossValue = Math.round(arr.grossGeneration.value);
            grossGenElement.innerHTML = grossValue + " MW";
            grossGenElement.style.fontSize = "14px";
            grossGenElement.style.fontWeight = "bold";
            grossGenElement.style.backgroundColor = "#007bff";
            grossGenElement.style.color = "white";
            grossGenElement.classList.add("badge-primary");
            console.log("Successfully updated gross generation:", grossValue);
        } else {
            console.log("Failed to update gross generation:", {
                element: !!grossGenElement,
                value: arr.grossGeneration ? arr.grossGeneration.value : 'undefined'
            });
        }
    }
}

function myFunction(arr) {
    if (arr.updateDate != "" && arr.updateDate != null) {
        document.getElementById("updateDate").innerHTML = arr.updateDate;
        document.getElementById("frequencyHz").innerHTML = arr.frequencyHz;
        document.getElementById("frequencyHzUnit").innerHTML = "Hz";
        document.getElementById("drawalMW").innerHTML = Math.round(arr.drawalMW) + " MW";
        document.getElementById("scheduleMW").innerHTML = Math.round(arr.scheduleMW) + " MW";
        document.getElementById("odUD").innerHTML = Math.round(arr.odUD) + " MW";
        document.getElementById("loadMW").innerHTML = Math.round(arr.loadMW) + " MW";
    } else {
        updateDynamicData();
    }
}

// Global variables to store interval IDs
let punjabGenUpdateInterval;
let punjabDynamicUpdateInterval;

function initializePunjabGeneration() {
    // Clear any existing intervals
    if (punjabGenUpdateInterval) {
        clearInterval(punjabGenUpdateInterval);
    }
    if (punjabDynamicUpdateInterval) {
        clearInterval(punjabDynamicUpdateInterval);
    }
    
    console.log("Initializing Punjab Generation dashboard...");
    
    // Add a small delay to ensure DOM is ready
    setTimeout(() => {
        // Initialize data updates
        updatePbGenData();
        updateDynamicData();
        
        // Specifically update gross generation after a short delay
        setTimeout(() => {
            updatePbGrossData();
        }, 1000);
        
        // Set up periodic updates
        punjabGenUpdateInterval = setInterval(updatePbGenData, 60000); // Refresh every 60 seconds
        punjabDynamicUpdateInterval = setInterval(updateDynamicData, 60000); // Refresh every 60 seconds
    }, 100);
}

// Function to stop Punjab Generation updates when switching to other pages
function stopPunjabGenerationUpdates() {
    if (punjabGenUpdateInterval) {
        clearInterval(punjabGenUpdateInterval);
        punjabGenUpdateInterval = null;
    }
    if (punjabDynamicUpdateInterval) {
        clearInterval(punjabDynamicUpdateInterval);
        punjabDynamicUpdateInterval = null;
    }
}
