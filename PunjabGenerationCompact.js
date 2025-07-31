// Punjab Generation Dashboard - Original PbGen 1.0 Style
function showPunjabGenerationCompact() {
    const punjabGenerationCompactHTML = `
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

        .card {margin-bottom: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); position: relative; z-index: 1; }
        .card-header { background-color: #343a40;color: #fff; padding: 3px 8px; position: relative; z-index: 2; }
        
        .card-body { background-color: #fff; padding: 3px 8px; position: relative; z-index: 3; }
        .card-body .textContent {float:right; font-size: 10px;font-family: Verdana, Geneva, Tahoma, sans-serif; font-weight: bold; margin-right: 2px; width: 100px;}
        .card-body .RESText {float: inline-start; font-size: 10px;font-family: Verdana, Geneva, Tahoma, sans-serif; font-weight: bold; margin-right: 15px; }
        .card-body .p {font-size: 10px};
        .card-footer {background-color: #f8f9fa;border-top: 1px solid #dee2e6; }
        .badge-danger { background-color: red; }
        .badge-success { background-color: rgb(8, 176, 8);}
        .badge-primary { background-color: #007bff !important; color: white !important; }
        .container {
            max-width: 100%;
            padding-left: 5px;
            padding-right: 5px;
        }
        .row {
            margin-left: -2px;
            margin-right: -2px;
        }
        .col-md-6, .col-md-12, .col-md-3 {
            padding-left: 2px;
            padding-right: 2px;
        }
        .progress-wrapper {
            position: relative;
            height: 20px;
            margin-top: 2px;
            margin-right: 2px;
            width: 100%;
            z-index: 1000;
        }
        .progress {
            height: 3px;
            border-radius: 10px;
            background-color: #e9ecef;
            margin-top: 12px;
            width: 100%;
        }
        .progress-bar {
            height: 3px;
            transition: width 1s ease-in-out;
            border-radius: 10px;
            background-color: #28a745;
        }
        .custom-tooltip {
            position: absolute;
            top: -25px;
            transform: translateX(-50%);
            background-color: #fff;
            color: #000;
            border: 1px solid #ccc;
            padding: 3px 8px;
            font-size: 0.7rem;
            border-radius: 4px;
            white-space: nowrap;
            opacity: 1;
            transition: left 1s ease-in-out;
            z-index: 9999;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .custom-tooltip::after {
            content: "";
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-width: 4px;
            border-style: solid;
            border-color: #fff transparent transparent transparent;
        }
        .card-body {font-size: 10px;}
        .row-align {display: flex; align-items: flex-start; margin-bottom: 5px; margin-top: 3px; }
        .plant-title {font-size: 12px; color: #0d6efd; font-weight: bold ; width: 80px; margin-right: 5px; margin-top: 1px;}
        .plant-info {font-size: 9px; color: #6c757d; margin-left: 0px; margin-top: 0px;}
        .percentage-badge {
            background-color: #17a2b8;
            color: white;
            padding: 8px 6px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: bold;
            margin-right: 10px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .badge {margin: 0 0.5px; font-size: 10px;}
        .badge-container {
            display: flex;
            flex-direction: column;
            gap: 1px;
            margin-right: 10px;
        }
        .layout-container {
            display: flex;
            align-items: flex-start;
            gap: 10px;
        }
        .badge-row {
            display: flex;
            gap: 1px;
        }
        .badge-container .capacity{font-size: 8px; margin-top: 2px; margin-left: 0px; margin-right: 0.5px; background-color: #6c757d; color: white;}
        .power-display {
            font-size: 10px;
            font-weight: bold;
            color: #495057;
            margin-left: 10px;
            text-decoration: none;
        }
        .textContent {
            text-decoration: none !important;
        }
        </style>

        <div class="container">
        <h5 class="animate-charcter">Punjab Power Generation Dashboard</h5>
        <div class="col-md-6">
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
                            <span id="frequencyHz" style="font-size: 2.5rem; color: #0d6efd; "></span>
                            <span id="frequencyHzUnit" style="font-size: 1.0rem; color: #0d6efd; "></span>
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
                        <td style="vertical-align: middle;"><div class="badge badge-primary" style="font-weight: bold; background-color: #007bff !important;" id="grossGen"></div></td>
                    </tr>
                </table>
                
                </div>
            </div>  
        </div>
        </div>
        <div class="row">
            <!-- PSPCL Thermal Plants -->
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header PSPCL">PSPCL
                        <span class="percentage-badge" id="PSPCLThermalPercentage" style="float:right; margin-left: 3px; height: 20px; font-size: 10px; padding: 2px 6px;">0%</span>
                        <span style="float:right;" class="textContent" id="PSPCLThermalText">NA</span>
                    </div>
                    <div class="card-body">

                        <div class="row-align" style="align-items: flex-start;">
                            <div style="display: flex; flex-direction: column;">
                                <h5 class="plant-title">GGSSTP</h5>
                                <div class="plant-info" id="GGSSTPTotalProgressText">NA</div>
                            </div>
                            <div class="layout-container">
                                <span class="percentage-badge" id="GGSSTPPercentage">0%</span>
                                <div class="badge-container">
                                    <div class="badge-row">
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="GGSSTP3Badge" class="badge"></div>
                                            <div class="badge capacity">210</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="GGSSTP4Badge" class="badge"></div>
                                            <div class="badge capacity">210</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="GGSSTP5Badge" class="badge"></div>
                                            <div class="badge capacity">210</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="GGSSTP6Badge" class="badge"></div>
                                            <div class="badge capacity">210</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr style="margin: 0px; border-width: 1px; ">
                        <div class="row-align"style="align-items: flex-start;">
                            <div style="display: flex; flex-direction: column;">
                                <h5 class="plant-title">GHTP</h5>
                                <div class="plant-info" id="GHTPTotalProgressText">NA</div>
                            </div>
                            <div class="layout-container">
                                <span class="percentage-badge" id="GHTPPercentage">0%</span>
                                <div class="badge-container">
                                    <div class="badge-row">
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="GHTP1Badge" class="badge"></div>
                                            <div class="badge capacity">210</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="GHTP2Badge" class="badge"></div>
                                            <div class="badge capacity">210</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="GHTP3Badge" class="badge"></div>
                                            <div class="badge capacity">250</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="GHTP4Badge" class="badge"></div>
                                            <div class="badge capacity">250</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr style="margin: 0px; border-width: 1px; ">

                        <div class="row-align"style="align-items: flex-start;">
                            <div style="display: flex; flex-direction: column;">
                                <h5 class="plant-title">GATP</h5>
                                <div class="plant-info" id="GATPTotalProgressText">NA</div>
                            </div>
                            <div class="layout-container">
                                <span class="percentage-badge" id="GATPPercentage">0%</span>
                                <div class="badge-container">
                                    <div class="badge-row">
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="GATP1Badge" class="badge"></div>
                                            <div class="badge capacity">270</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="GATP2Badge" class="badge"></div>
                                            <div class="badge capacity">270</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>                                                   
                            </div>
                        </div>                       
                    </div>
               
           

            <!-- IPPs -->
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">IPPs
                        <span class="percentage-badge" id="IPPsPercentage" style="float:right; margin-left: 3px; height: 20px; font-size: 10px; padding: 2px 6px;">0%</span>
                        <span style="float:right;" class="textContent" id="IPPsTotalText">NA</span>
                    </div>
                    <div class="card-body">

                        <div class="row-align"style="align-items: flex-start;">
                            <div class="d-flex flex-column mr-3">
                                <h5 class="plant-title">NPL</h5>
                                <span class="plant-info" id="NPLTotalProgressText">NA</span>
                            </div>
                            <div class="layout-container">
                                <div class="percentage-badge" id="NPLPercentage">NA</div>
                                <div class="badge-container">
                                    <div class="badge-row">
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="NPL1Badge" class="badge"></div>
                                            <div class="badge capacity">700</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="NPL2Badge" class="badge"></div>
                                            <div class="badge capacity">700</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr style="margin: 0px; border-width: 1px; ">

                        <div class="row-align"style="align-items: flex-start;">
                            <div class="d-flex flex-column mr-3">
                                <h5 class="plant-title">TSPL</h5>
                                <span class="plant-info" id="TSPLTotalProgressText">NA</span>
                            </div>
                            <div class="layout-container">
                                <div class="percentage-badge" id="TSPLPercentage">NA</div>
                                <div class="badge-container">
                                    <div class="badge-row">
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="TSPL1Badge" class="badge"></div>
                                            <div class="badge capacity">660</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="TSPL2Badge" class="badge"></div>
                                            <div class="badge capacity">660</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="TSPL3Badge" class="badge"></div>
                                            <div class="badge capacity">660</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                       
                        
                    </div>
                </div>
            </div>

            <!-- Total Punjab Thermal -->
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">Punjab Thermal
                        <span class="percentage-badge" id="PunjabThermalPercentage" style="float:right; margin-left: 3px; height: 20px; font-size: 10px; padding: 2px 6px;">0%</span>
                        <span style="float:right;" class="textContent" id="PunjabThermalTotalText">NA</span>
                    </div>                    
                </div>
            </div>

            <!-- Hydro Plants -->
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">PSPCL Hydro
                        <span class="percentage-badge" id="PunjabHydroPercentage" style="float:right; margin-left: 3px; height: 20px; font-size: 10px; padding: 2px 6px;">0%</span>
                        <span style="float:right;" class="textContent" id="PunjabHydroTotalText">NA</span>
                    </div>  
                    <div class="card-body">

                        <div class="row-align"style="align-items: flex-start;">
                            <div class="d-flex flex-column mr-3">
                                <h5 class="plant-title">RSD</h5>
                                <span class="plant-info" id="RSDTotalProgressText">NA</span>
                            </div>
                            <div class="layout-container">
                                <div class="percentage-badge" id="RSDPercentage">NA</div>
                                <div class="badge-container">
                                    <div class="badge-row">
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="RSD1Badge" class="badge"></div>
                                            <div class="badge capacity">150</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="RSD2Badge" class="badge"></div>
                                            <div class="badge capacity">150</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="RSD3Badge" class="badge"></div>
                                            <div class="badge capacity">150</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="RSD4Badge" class="badge"></div>
                                            <div class="badge capacity">150</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr style="margin: 0px; border-width: 1px; ">

                        <div class="row-align"style="align-items: flex-start;">
                            <div class="d-flex flex-column mr-3">
                                <h5 class="plant-title">UBDC-1</h5>
                                <span class="plant-info" id="UBDC1TotalProgressText">NA</span>
                            </div>
                            <div class="layout-container">
                                <div class="percentage-badge" id="UBDC1Percentage">NA</div>
                                <div class="badge-container">
                                    <div class="badge-row">
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="UBDC1_1Badge" class="badge"></div>
                                            <div class="badge capacity">15</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="UBDC1_2Badge" class="badge"></div>
                                            <div class="badge capacity">15.45</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr style="margin: 0px; border-width: 1px; ">

                        <div class="row-align" style="align-items: flex-start;">
                            <div class="d-flex flex-column mr-3">
                                <h5 class="plant-title">UBDC-2</h5>
                                <span class="plant-info" id="UBDC2TotalProgressText">NA</span>
                            </div>
                            <div class="layout-container">
                                <div class="percentage-badge" id="UBDC2Percentage">NA</div>
                                <div class="badge-container">
                                    <div class="badge-row">
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="UBDC2_1Badge" class="badge"></div>
                                            <div class="badge capacity">15</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="UBDC2_2Badge" class="badge"></div>
                                            <div class="badge capacity">15.45</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr style="margin: 0px; border-width: 1px; ">

                        <div class="row-align" style="align-items: flex-start;">
                            <div class="d-flex flex-column mr-3">
                                <h5 class="plant-title">UBDC-3</h5>
                                <span class="plant-info" id="UBDC3TotalProgressText">NA</span>
                            </div>
                            <div class="layout-container">
                                <div class="percentage-badge" id="UBDC3Percentage">NA</div>
                                <div class="badge-container">
                                    <div class="badge-row">
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="UBDC3_1Badge" class="badge"></div>
                                            <div class="badge capacity">15</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="UBDC3_2Badge" class="badge"></div>
                                            <div class="badge capacity">15.45</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr style="margin: 0px; border-width: 1px; ">

                        <div class="row-align" style="align-items: flex-start;">
                            <div class="d-flex flex-column mr-3">
                                <h5 class="plant-title">MHP-1</h5>
                                <span class="plant-info" id="MHP1TotalProgressText">NA</span>
                            </div>
                            <div class="layout-container">
                                <div class="percentage-badge" id="MHP1Percentage">NA</div>
                                <div class="badge-container">
                                    <div class="badge-row">
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="MHP1_1Badge" class="badge"></div>
                                            <div class="badge capacity">15</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="MHP1_2Badge" class="badge"></div>
                                            <div class="badge capacity">15</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="MHP1_3Badge" class="badge"></div>
                                            <div class="badge capacity">15</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr style="margin: 0px; border-width: 1px; ">

                        <div class="row-align" style="align-items: flex-start;">
                            <div class="d-flex flex-column mr-3">
                                <h5 class="plant-title">MHP-2</h5>
                                <span class="plant-info" id="MHP2TotalProgressText">NA</span>
                            </div>
                            <div class="layout-container">
                                <div class="percentage-badge" id="MHP2Percentage">NA</div>
                                <div class="badge-container">
                                    <div class="badge-row">
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="MHP2_1Badge" class="badge"></div>
                                            <div class="badge capacity">15</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="MHP2_2Badge" class="badge"></div>
                                            <div class="badge capacity">15</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="MHP2_3Badge" class="badge"></div>
                                            <div class="badge capacity">15</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr style="margin: 0px; border-width: 1px; ">

                        <div class="row-align" style="align-items: flex-start;">
                            <div class="d-flex flex-column mr-3">
                                <h5 class="plant-title">MHP-3</h5>
                                <span class="plant-info" id="MHP3TotalProgressText">NA</span>
                            </div>
                            <div class="layout-container">
                                <div class="percentage-badge" id="MHP3Percentage">NA</div>
                                <div class="badge-container">
                                    <div class="badge-row">
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="MHP3_1Badge" class="badge"></div>
                                            <div class="badge capacity">19.5</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="MHP3_2Badge" class="badge"></div>
                                            <div class="badge capacity">19.5</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="MHP3_3Badge" class="badge"></div>
                                            <div class="badge capacity">19.5</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr style="margin: 0px; border-width: 1px; ">

                        <div class="row-align" style="align-items: flex-start;">
                            <div class="d-flex flex-column mr-3">
                                <h5 class="plant-title">MHP-4</h5>
                                <span class="plant-info" id="MHP4TotalProgressText">NA</span>
                            </div>
                            <div class="layout-container">
                                <div class="percentage-badge" id="MHP4Percentage">NA</div>
                                <div class="badge-container">
                                    <div class="badge-row">
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="MHP4_1Badge" class="badge"></div>
                                            <div class="badge capacity">19.5</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="MHP4_2Badge" class="badge"></div>
                                            <div class="badge capacity">19.5</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="MHP4_3Badge" class="badge"></div>
                                            <div class="badge capacity">19.5</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr style="margin: 0px; border-width: 1px; ">

                        <div class="row-align" style="align-items: flex-start;">
                            <div class="d-flex flex-column mr-3">
                                <h5 class="plant-title">MHP-5</h5>
                                <span class="plant-info" id="MHP5TotalProgressText">NA</span>
                            </div>
                            <div class="layout-container">
                                <div class="percentage-badge" id="MHP5Percentage">NA</div>
                                <div class="badge-container">
                                    <div class="badge-row">
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="MHP5_1Badge" class="badge"></div>
                                            <div class="badge capacity">9</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="MHP5_2Badge" class="badge"></div>
                                            <div class="badge capacity">9</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr style="margin: 0px; border-width: 1px; ">

                        <div class="row-align" style="align-items: flex-start;">
                            <div class="d-flex flex-column mr-3">
                                <h5 class="plant-title">ASHP-1</h5>
                                <span class="plant-info" id="ASHP1TotalProgressText">NA</span>
                            </div>
                            <div class="layout-container">
                                <div class="percentage-badge" id="ASHP1Percentage">NA</div>
                                <div class="badge-container">
                                    <div class="badge-row">
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="ASHP1_1Badge" class="badge"></div>
                                            <div class="badge capacity">33.5</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="ASHP1_2Badge" class="badge"></div>
                                            <div class="badge capacity">33.5</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr style="margin: 0px; border-width: 1px; ">

                        <div class="row-align" style="align-items: flex-start;">
                            <div class="d-flex flex-column mr-3">
                                <h5 class="plant-title">ASHP-2</h5>
                                <span class="plant-info" id="ASHP2TotalProgressText">NA</span>
                            </div>
                            <div class="layout-container">
                                <div class="percentage-badge" id="ASHP2Percentage">NA</div>
                                <div class="badge-container">
                                    <div class="badge-row">
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="ASHP2_1Badge" class="badge"></div>
                                            <div class="badge capacity">33.5</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="ASHP2_2Badge" class="badge"></div>
                                            <div class="badge capacity">33.5</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr style="margin: 0px; border-width: 1px; ">

                        <div class="row-align"style="align-items: flex-start;">
                            <div class="d-flex flex-column mr-3">
                                <h5 class="plant-title">SHANAN</h5>
                                <span class="plant-info" id="SHANANTotalProgressText">NA</span>
                            </div>
                            <div class="layout-container">
                                <div class="percentage-badge" id="SHANANPercentage">NA</div>
                                <div class="badge-container">
                                    <div class="badge-row">
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="SHANAN1Badge" class="badge"></div>
                                            <div class="badge capacity">15</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="SHANAN2Badge" class="badge"></div>
                                            <div class="badge capacity">15</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="SHANAN3Badge" class="badge"></div>
                                            <div class="badge capacity">15</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="SHANAN4Badge" class="badge"></div>
                                            <div class="badge capacity">15</div>
                                        </div>
                                        <div style="display: flex; flex-direction: column; align-items: center; margin-right: 2px;">
                                            <div id="SHANAN5Badge" class="badge"></div>
                                            <div class="badge capacity">50</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>                         
                          
                    </div>
                    
                </div>
                <div class="col-md-3">
                <div class="card">
                    <div class="card-body" style="background-color: #f2e03f;">
                        <p class="RESText">Solar RES: <span class="badge-success badge" id="solarRes"></span> MW</p>
                        <p class="RESText">Non Solar RES: <span class="badge-success badge" id="nonSolarRes"></span> MW</p>
                        <p class="RESText">Total RES: <span class="badge-primary badge" id="resTotal"></span> MW</p>                    
                    </div>
                </div>   </div>
            </div>  

        </div>
    </div>
    `;

    document.getElementById('main-content').innerHTML = punjabGenerationCompactHTML;
    
    // Initialize the Punjab Generation dashboard
    initializePunjabGenerationCompact();
}

// Original PbGen 1.0 utility functions
function setBadge(elementId, value) {
    const badge = document.getElementById(elementId);
    if (badge) {
        console.log(`Setting badge ${elementId} to value ${value}`);
        // Handle null/undefined values
        const safeValue = (value !== null && value !== undefined && !isNaN(value)) ? Math.round(value) : 0;
        
        if (safeValue > 0) {
            badge.textContent = safeValue;
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
    // Progress bars have been removed - this function now does nothing
    // but is kept for compatibility with existing code
    console.log(`Progress bar ${elementId} removed - displaying data in badges only`);
}

function updateDynamicText(elementId, value, maxValue) {
    const dynamicTextElement = document.getElementById(elementId);
    if (dynamicTextElement) {
        // Handle null/undefined values
        const safeValue = (value !== null && value !== undefined && !isNaN(value)) ? value : 0;
        const safeMaxValue = (maxValue !== null && maxValue !== undefined && !isNaN(maxValue)) ? maxValue : 0;
        
        dynamicTextElement.textContent = `${Math.round(safeValue)} / ${safeMaxValue} MW`;
    } else {
        console.log('Element with id "' + elementId + '" not found.');
    }
}

function updatePercentage(elementId, value, maxValue) {
    const percentageElement = document.getElementById(elementId);
    if (percentageElement) {
        // Handle null/undefined values
        const safeValue = (value !== null && value !== undefined && !isNaN(value)) ? value : 0;
        const safeMaxValue = (maxValue !== null && maxValue !== undefined && !isNaN(maxValue) && maxValue > 0) ? maxValue : 1;
        
        const percentage = Math.round((safeValue / safeMaxValue) * 100);
        percentageElement.textContent = `${percentage}%`;
        
        // Color coding based on percentage
        if (percentage < 40) {
            percentageElement.style.backgroundColor = '#dc3545'; // Red
        } else if (percentage < 75) {
            percentageElement.style.backgroundColor = '#ffc107'; // Yellow
            percentageElement.style.color = '#000'; // Black text for yellow background
        } else {
            percentageElement.style.backgroundColor = '#28a745'; // Green
            percentageElement.style.color = '#fff'; // White text
        }
    } else {
        console.log('Percentage element with id "' + elementId + '" not found.');
    }
}

function updatePbGenData() {
    var xmlhttp = new XMLHttpRequest();
    var url = "https://sldcapi.pstcl.org/wsDataService.asmx/pbGenData2"; 
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var myArr = JSON.parse(this.responseText);
            updatePbGenData1(myArr);
        } else if (this.status != 200) {
            console.log("Ready state" + this.readyState + "  Status:" + this.status);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function updatePbGenData1(data) {
    console.log("Received data:", data); // Debug log
    
    // Test with sample data first
    console.log("Testing progress bars with sample data...");
    setProgress("GGSSTPTotalProgress", 500, 840);
    setProgress("GHTPTotalProgress", 600, 920);
    setProgress("PSPCLTotalProgress", 1500, 2300);
    
    if (!data) {
        console.error("No data received");
        return;
    }
    
    // GGSSTP
    if (data.thermalGGSSTPRopar3) setBadge("GGSSTP3Badge", Math.round(data.thermalGGSSTPRopar3.value));
    if (data.thermalGGSSTPRopar4) setBadge("GGSSTP4Badge", Math.round(data.thermalGGSSTPRopar4.value));
    if (data.thermalGGSSTPRopar5) setBadge("GGSSTP5Badge", Math.round(data.thermalGGSSTPRopar5.value));
    if (data.thermalGGSSTPRopar6) setBadge("GGSSTP6Badge", Math.round(data.thermalGGSSTPRopar6.value));
    if (data.totalGGSSTPRopar) {
        setProgress("GGSSTPTotalProgress", data.totalGGSSTPRopar.value, 840);
        updateDynamicText("GGSSTPTotalProgressText", data.totalGGSSTPRopar.value, 840);
        updatePercentage("GGSSTPPercentage", data.totalGGSSTPRopar.value, 840);
    }

    // GHTP
    if (data.thermalGHTPLehraMohabbat1) setBadge("GHTP1Badge", Math.round(data.thermalGHTPLehraMohabbat1.value));
    if (data.thermalGHTPLehraMohabbat2) setBadge("GHTP2Badge", Math.round(data.thermalGHTPLehraMohabbat2.value));
    if (data.thermalGHTPLehraMohabbat3) setBadge("GHTP3Badge", Math.round(data.thermalGHTPLehraMohabbat3.value));
    if (data.thermalGHTPLehraMohabbat4) setBadge("GHTP4Badge", Math.round(data.thermalGHTPLehraMohabbat4.value));
    if (data.totalGHTPLehraMohabbat) {
        setProgress("GHTPTotalProgress", data.totalGHTPLehraMohabbat.value, 920);
        updateDynamicText("GHTPTotalProgressText", data.totalGHTPLehraMohabbat.value, 920);
        updatePercentage("GHTPPercentage", data.totalGHTPLehraMohabbat.value, 920);
    }

    // GATP
    if (data.ippGVK1) setBadge("GATP1Badge", data.ippGVK1.value);
    if (data.ippGVK2) setBadge("GATP2Badge", data.ippGVK2.value);
    if (data.totalIppGVK) {
        setProgress("GATPTotalProgress", data.totalIppGVK.value, 540);
        updateDynamicText("GATPTotalProgressText", data.totalIppGVK.value, 540);
        updatePercentage("GATPPercentage", data.totalIppGVK.value, 540);
    }

    // Total PSPCL Thermal
    if (data.totalGGSSTPRopar && data.totalGHTPLehraMohabbat && data.totalIppGVK) {
        const totalPSPCLThermal = data.totalGGSSTPRopar.value + data.totalGHTPLehraMohabbat.value + data.totalIppGVK.value;
        setProgress("PSPCLTotalProgress", totalPSPCLThermal, 2300);
        updateDynamicText("PSPCLThermalText", totalPSPCLThermal, 2300);
        updatePercentage("PSPCLThermalPercentage", totalPSPCLThermal, 2300);
    }

    // NPL
    if (data.ippRajpura1) setBadge("NPL1Badge", Math.round(data.ippRajpura1.value));
    if (data.ippRajpura2) setBadge("NPL2Badge", Math.round(data.ippRajpura2.value));
    if (data.totalIppRajpura) {
        setProgress("NPLTotalProgress", data.totalIppRajpura.value, 1400);
        updateDynamicText("NPLTotalProgressText", data.totalIppRajpura.value, 1400);
        updatePercentage("NPLPercentage", data.totalIppRajpura.value, 1400);
    }

    // TSPL
    if (data.ippTalwandiSabo1) setBadge("TSPL1Badge", data.ippTalwandiSabo1.value);
    if (data.ippTalwandiSabo2) setBadge("TSPL2Badge", data.ippTalwandiSabo2.value);
    if (data.ippTalwandiSabo3) setBadge("TSPL3Badge", data.ippTalwandiSabo3.value);
    if (data.totalIppTalwandiSabo) {
        setProgress("TSPLTotalProgress", data.totalIppTalwandiSabo.value, 1980);
        updateDynamicText("TSPLTotalProgressText", data.totalIppTalwandiSabo.value, 1980);
        updatePercentage("TSPLPercentage", data.totalIppTalwandiSabo.value, 1980);
    }

    // Total IPPs
    if (data.totalIpp) {
        setProgress("IPPsTotalProgress", data.totalIpp.value, 3380);
        updateDynamicText("IPPsTotalText", data.totalIpp.value, 3380);
        updatePercentage("IPPsPercentage", data.totalIpp.value, 3380);
    }
   
    // Total Punjab Thermal
    if (data.totalGGSSTPRopar && data.totalGHTPLehraMohabbat && data.totalIppGVK && data.totalIpp) {
        const totalPSPCLThermal = data.totalGGSSTPRopar.value + data.totalGHTPLehraMohabbat.value + data.totalIppGVK.value;
        const totalPunjabThermal = totalPSPCLThermal + data.totalIpp.value;
        setProgress("PunjabThermalProgress", totalPunjabThermal, 5680);
        updateDynamicText("PunjabThermalTotalText", totalPunjabThermal, 5680);
        updatePercentage("PunjabThermalPercentage", totalPunjabThermal, 5680);
    }

    //HYDRO PLANTS
    console.log("Processing hydro plants data...");

    // RSD
    if (data.hydroRSD1) setBadge("RSD1Badge", Math.round(data.hydroRSD1.value));
    if (data.hydroRSD2) setBadge("RSD2Badge", Math.round(data.hydroRSD2.value));
    if (data.hydroRSD3) setBadge("RSD3Badge", Math.round(data.hydroRSD3.value));
    if (data.hydroRSD4) setBadge("RSD4Badge", Math.round(data.hydroRSD4.value));
    if (data.totalRSD) {
        setProgress("RSDTotalProgress", data.totalRSD.value, 600);
        updateDynamicText("RSDTotalProgressText", data.totalRSD.value, 600);
        updatePercentage("RSDPercentage", data.totalRSD.value, 600);
        console.log("RSD Total:", data.totalRSD.value);
    }

    // UBDC-1
    if (data.hydroRSDUBDC1_1) setBadge("UBDC1_1Badge", Math.round(data.hydroRSDUBDC1_1.value));
    if (data.hydroRSDUBDC1_2) setBadge("UBDC1_2Badge", Math.round(data.hydroRSDUBDC1_2.value));
    if (data.totalUBDC1) {
        setProgress("UBDC1TotalProgress", data.totalUBDC1.value, 30.45);
        updateDynamicText("UBDC1TotalProgressText", data.totalUBDC1.value, 30.45);
        updatePercentage("UBDC1Percentage", data.totalUBDC1.value, 30.45);
    }

    // UBDC-2
    if (data.hydroRSDUBDC2_1) setBadge("UBDC2_1Badge", Math.round(data.hydroRSDUBDC2_1.value));
    if (data.hydroRSDUBDC2_2) setBadge("UBDC2_2Badge", Math.round(data.hydroRSDUBDC2_2.value));
    if (data.totalUBDC2) {
        setProgress("UBDC2TotalProgress", data.totalUBDC2.value, 30.45);
        updateDynamicText("UBDC2TotalProgressText", data.totalUBDC2.value, 30.45);
        updatePercentage("UBDC2Percentage", data.totalUBDC2.value, 30.45);
    }

    // UBDC-3
    if (data.hydroRSDUBDC3_1) setBadge("UBDC3_1Badge", Math.round(data.hydroRSDUBDC3_1.value));
    if (data.hydroRSDUBDC3_2) setBadge("UBDC3_2Badge", Math.round(data.hydroRSDUBDC3_2.value));
    if (data.totalUBDC3) {
        setProgress("UBDC3TotalProgress", data.totalUBDC3.value, 30.45);
        updateDynamicText("UBDC3TotalProgressText", data.totalUBDC3.value, 30.45);
        updatePercentage("UBDC3Percentage", data.totalUBDC3.value, 30.45);
    }

    // MHP-1
    if (data.hydroRSDMHP1_1) setBadge("MHP1_1Badge", Math.round(data.hydroRSDMHP1_1.value));
    if (data.hydroRSDMHP1_2) setBadge("MHP1_2Badge", Math.round(data.hydroRSDMHP1_2.value));
    if (data.hydroRSDMHP1_3) setBadge("MHP1_3Badge", Math.round(data.hydroRSDMHP1_3.value));
    if (data.totalMHP1) {
        setProgress("MHP1TotalProgress", data.totalMHP1.value, 45);
        updateDynamicText("MHP1TotalProgressText", data.totalMHP1.value, 45);
        updatePercentage("MHP1Percentage", data.totalMHP1.value, 45);
    }

    // MHP-2
    if (data.hydroRSDMHP2_1) setBadge("MHP2_1Badge", Math.round(data.hydroRSDMHP2_1.value));
    if (data.hydroRSDMHP2_2) setBadge("MHP2_2Badge", Math.round(data.hydroRSDMHP2_2.value));
    if (data.hydroRSDMHP2_3) setBadge("MHP2_3Badge", Math.round(data.hydroRSDMHP2_3.value));
    if (data.totalMHP2) {
        setProgress("MHP2TotalProgress", data.totalMHP2.value, 45);
        updateDynamicText("MHP2TotalProgressText", data.totalMHP2.value, 45);
        updatePercentage("MHP2Percentage", data.totalMHP2.value, 45);
    }

    // MHP-3
    if (data.hydroRSDMHP3_1) setBadge("MHP3_1Badge", Math.round(data.hydroRSDMHP3_1.value));
    if (data.hydroRSDMHP3_2) setBadge("MHP3_2Badge", Math.round(data.hydroRSDMHP3_2.value));
    if (data.hydroRSDMHP3_3) setBadge("MHP3_3Badge", Math.round(data.hydroRSDMHP3_3.value));
    if (data.totalMHP3) {
        setProgress("MHP3TotalProgress", data.totalMHP3.value, 58.5);
        updateDynamicText("MHP3TotalProgressText", data.totalMHP3.value, 58.5);
        updatePercentage("MHP3Percentage", data.totalMHP3.value, 58.5);
    }

    // MHP-4
    if (data.hydroRSDMHP4_1) setBadge("MHP4_1Badge", Math.round(data.hydroRSDMHP4_1.value));
    if (data.hydroRSDMHP4_2) setBadge("MHP4_2Badge", Math.round(data.hydroRSDMHP4_2.value));
    if (data.hydroRSDMHP4_3) setBadge("MHP4_3Badge", Math.round(data.hydroRSDMHP4_3.value));
    if (data.totalMHP4) {
        setProgress("MHP4TotalProgress", data.totalMHP4.value, 58.5);
        updateDynamicText("MHP4TotalProgressText", data.totalMHP4.value, 58.5);
        updatePercentage("MHP4Percentage", data.totalMHP4.value, 58.5);
    }

    // MHP-5
    if (data.hydroRSDMHP5_1) setBadge("MHP5_1Badge", Math.round(data.hydroRSDMHP5_1.value));
    if (data.hydroRSDMHP5_2) setBadge("MHP5_2Badge", Math.round(data.hydroRSDMHP5_2.value));
    if (data.totalMHP5) {
        setProgress("MHP5TotalProgress", data.totalMHP5.value, 18);
        updateDynamicText("MHP5TotalProgressText", data.totalMHP5.value, 18);
        updatePercentage("MHP5Percentage", data.totalMHP5.value, 18);
    }

    // ASHP-1
    if (data.hydroRSDASHP1_1) setBadge("ASHP1_1Badge", Math.round(data.hydroRSDASHP1_1.value));
    if (data.hydroRSDASHP1_2) setBadge("ASHP1_2Badge", Math.round(data.hydroRSDASHP1_2.value));
    if (data.totalASHP1) {
        setProgress("ASHP1TotalProgress", data.totalASHP1.value, 67);
        updateDynamicText("ASHP1TotalProgressText", data.totalASHP1.value, 67);
        updatePercentage("ASHP1Percentage", data.totalASHP1.value, 67);
    }

    // ASHP-2
    if (data.hydroRSDASHP2_1) setBadge("ASHP2_1Badge", Math.round(data.hydroRSDASHP2_1.value));
    if (data.hydroRSDASHP2_2) setBadge("ASHP2_2Badge", Math.round(data.hydroRSDASHP2_2.value));
    if (data.totalASHP2) {
        setProgress("ASHP2TotalProgress", data.totalASHP2.value, 67);
        updateDynamicText("ASHP2TotalProgressText", data.totalASHP2.value, 67);
        updatePercentage("ASHP2Percentage", data.totalASHP2.value, 67);
    }

    // SHANAN
    if (data.hydroShanan1) setBadge("SHANAN1Badge", Math.round(data.hydroShanan1.value));
    if (data.hydroShanan2) setBadge("SHANAN2Badge", Math.round(data.hydroShanan2.value));
    if (data.hydroShanan3) setBadge("SHANAN3Badge", Math.round(data.hydroShanan3.value));
    if (data.hydroShanan4) setBadge("SHANAN4Badge", Math.round(data.hydroShanan4.value));
    if (data.hydroShanan5) setBadge("SHANAN5Badge", Math.round(data.hydroShanan5.value));
    if (data.totalShanan) {
        setProgress("SHANANTotalProgress", data.totalShanan.value, 110);
        updateDynamicText("SHANANTotalProgressText", data.totalShanan.value, 110);
        updatePercentage("SHANANPercentage", data.totalShanan.value, 110);
    }

    // Total Hydro
    if (data.totalHydro) {
        setProgress("PunjabHydroTotalProgress", data.totalHydro.value, 1093.35);
        updateDynamicText("PunjabHydroTotalText", data.totalHydro.value, 1093.35);
        updatePercentage("PunjabHydroPercentage", data.totalHydro.value, 1093.35);
    }

    //RES
    console.log("RES Data - Solar:", data.resSolar?.value, "Non-Solar:", data.resNonSolar?.value, "Total:", data.totalResGeneration?.value);
    const solarResElement = document.getElementById("solarRes");
    const nonSolarResElement = document.getElementById("nonSolarRes");
    const resTotalElement = document.getElementById("resTotal");
    
    if (solarResElement && data.resSolar) solarResElement.innerHTML = Math.round(data.resSolar.value);
    if (nonSolarResElement && data.resNonSolar) nonSolarResElement.innerHTML = Math.round(data.resNonSolar.value);
    if (resTotalElement && data.totalResGeneration) resTotalElement.innerHTML = Math.round(data.totalResGeneration.value);

    //GROSS GENERATION
    const grossGenElement = document.getElementById("grossGen");
    if (grossGenElement && data.grossGeneration) grossGenElement.innerHTML = Math.round(data.grossGeneration.value) + " MW";
}

function updateDynamicData() {
    updatePbGrossData();
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
    if (arr == null) {
        updatePbGrossData();
    } else if (arr.grossGeneration == null) {
        updatePbGrossData();
    } else {
        document.getElementById("grossGen").innerHTML =
        Math.round(arr.grossGeneration.value) + " MW";
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

// Global variables for dashboard
let compactPunjabGenUpdateInterval;

function initializePunjabGenerationCompact() {
    console.log("Initializing Punjab Generation dashboard with original PbGen 1.0 styling...");
    
    // Clear any existing intervals
    if (compactPunjabGenUpdateInterval) {
        clearInterval(compactPunjabGenUpdateInterval);
    }
    
    // Show loading indicator
    showLoadingIndicator();
    
    // Initial data load with original functions
    updatePbGenData();
    updateDynamicData();
    
    // Set up auto-refresh every 10 seconds
    compactPunjabGenUpdateInterval = setInterval(() => {
        updatePbGenData();
        updateDynamicData();
    }, 10000);
    
    // Hide loading indicator after initial load
    setTimeout(hideLoadingIndicator, 2000);
    
    console.log("Punjab Generation dashboard initialized with original styling");
}

function showLoadingIndicator() {
    console.log("Loading Punjab Generation data...");
    document.getElementById("updateDate").textContent = "Loading...";
}

function hideLoadingIndicator() {
    console.log("Punjab Generation data loaded successfully");
}

// Function to stop Compact Punjab Generation updates
function stopPunjabGenerationCompactUpdates() {
    if (compactPunjabGenUpdateInterval) {
        clearInterval(compactPunjabGenUpdateInterval);
        compactPunjabGenUpdateInterval = null;
    }
    console.log("Compact Punjab Generation updates stopped");
}

