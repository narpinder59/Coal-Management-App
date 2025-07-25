// Pachhwara OB Production Dashboard
let PachhwaraDashboardData = [];
let PachhwaraDashboardHeaders = [];
let obChart = null;
let coalChart = null;
let stockChart = null;
let plantRakesChart = null;

// Fetch headers from Google Sheets
async function fetchPachhwaraDashboardHeaders() {
    try {
        const SHEET_ID = '1cFngrabiTY-RMGDrw2eRn7Nn8LEY0IZyD0-QJT7UqTI';
        const SHEET_NAME = 'Pachhwara-Prod&Desp';
        const RANGE = 'A1:W1';
        const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&range=${RANGE}`;

        const res = await fetch(SHEET_URL);
        const text = await res.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        const table = json.table;
        PachhwaraDashboardHeaders = table.rows[0].c.map(cell => cell ? cell.v : "");
        console.log("Headers loaded:", PachhwaraDashboardHeaders);
    } catch (error) {
        console.error("Error fetching headers:", error);
    }
}

// Fetch data from Google Sheets
async function fetchPachhwaraDashboardData() {
    try {
        const SHEET_ID = '1cFngrabiTY-RMGDrw2eRn7Nn8LEY0IZyD0-QJT7UqTI';
        const SHEET_NAME = 'Pachhwara-Prod&Desp';
        const RANGE = 'A3:W1000'; // Start from row 3 to skip headers
        const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&range=${RANGE}`;

        const res = await fetch(SHEET_URL);
        const text = await res.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        const table = json.table;
        
        PachhwaraDashboardData = table.rows
            .filter(row => row.c && row.c[0] && row.c[0].v)
            .map(row => row.c.map(cell => cell ? cell.v : ""));
        
        console.log("Data loaded:", PachhwaraDashboardData.length, "rows");
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Parse date from dd/mm/yyyy format
function parseDMY(str) {
    if (!str) return new Date();
    
    if (str instanceof Date) return str;
    
    if (typeof str === "string") {
        // Handle dd/mm/yyyy format
        if (str.includes('/')) {
            const [d, m, y] = str.split('/').map(Number);
            return new Date(y, m - 1, d);
        }
        // Handle Google Sheets Date format
        if (str.indexOf("Date(") !== -1) {
            const match = str.match(/Date\((\d{4}),\s*(\d{1,2}),\s*(\d{1,2})\)/);
            if (match) {
                const year = parseInt(match[1]);
                const month = parseInt(match[2]);
                const day = parseInt(match[3]);
                return new Date(year, month, day);
            }
        }
        return new Date(str);
    }
    
    return new Date();
}

// Format date for display
function formatDate(str) {
    const date = parseDMY(str);
    if (isNaN(date.getTime())) return str;
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Get data for specific duration
function getOBDataForDuration(days) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    return PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate >= startDate && rowDate <= endDate;
    }).sort((a, b) => parseDMY(a[0]) - parseDMY(b[0]));
}

// Calculate summary statistics
function calculateOBSummary(days) {
    const data = getOBDataForDuration(days);
    let totalActual = 0;
    let totalTarget = 0;
    let count = 0;
    
    data.forEach(row => {
        const actual = Number(row[10]) || 0; // OB Actual Production
        const target = Number(row[9]) || 0; // OB Production Target
        totalActual += actual;
        totalTarget += target;
        count++;
    });
    
    const avgActual = count > 0 ? (totalActual / count).toFixed(2) : 0;
    const avgTarget = count > 0 ? (totalTarget / count).toFixed(2) : 0;
    const achievement = totalTarget > 0 ? ((totalActual / totalTarget) * 100).toFixed(1) : 0;
    
    return {
        totalActual,
        totalTarget,
        avgActual,
        avgTarget,
        achievement,
        count
    };
}

// Get today's data
function getTodayOBData() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1); // Get yesterday's date
    const todayData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate.toDateString() === yesterday.toDateString();
    });
    
    let totalActual = 0;
    let totalTarget = 0;
    
    todayData.forEach(row => {
        totalActual += Number(row[10]) || 0; // OB Actual Production
        totalTarget += Number(row[9]) || 0; // OB Production Target
    });
    
    const avgActual = todayData.length > 0 ? (totalActual / todayData.length).toFixed(2) : 0;
    const avgTarget = todayData.length > 0 ? (totalTarget / todayData.length).toFixed(2) : 0;
    const achievement = totalTarget > 0 ? ((totalActual / totalTarget) * 100).toFixed(1) : 0;
    
    return { totalActual, totalTarget, avgActual, avgTarget, achievement };
}

// Get current month's data
function getCurrentMonthOBData() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const monthData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate.getMonth() === currentMonth && rowDate.getFullYear() === currentYear;
    });
    
    let totalActual = 0;
    let totalTarget = 0;
    
    monthData.forEach(row => {
        totalActual += Number(row[10]) || 0; // OB Actual Production
        totalTarget += Number(row[9]) || 0; // OB Production Target
    });
    
    const avgActual = monthData.length > 0 ? (totalActual / monthData.length).toFixed(2) : 0;
    const avgTarget = monthData.length > 0 ? (totalTarget / monthData.length).toFixed(2) : 0;
    const achievement = totalTarget > 0 ? ((totalActual / totalTarget) * 100).toFixed(1) : 0;
    
    return { totalActual, totalTarget, avgActual, avgTarget, achievement };
}

// Get current financial year's data
function getCurrentFYOBData() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-based
    
    // Financial year starts from April (month 3 in 0-based)
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyStartDate = new Date(fyStartYear, 3, 1); // April 1st
    const fyEndDate = new Date(fyStartYear + 1, 2, 31); // March 31st
    
    const fyData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate >= fyStartDate && rowDate <= fyEndDate;
    });
    
    let totalActual = 0;
    let totalTarget = 0;
    
    fyData.forEach(row => {
        totalActual += Number(row[10]) || 0; // OB Actual Production
        totalTarget += Number(row[9]) || 0; // OB Production Target
    });
    
    const avgActual = fyData.length > 0 ? (totalActual / fyData.length).toFixed(2) : 0;
    const avgTarget = fyData.length > 0 ? (totalTarget / fyData.length).toFixed(2) : 0;
    const achievement = totalTarget > 0 ? ((totalActual / totalTarget) * 100).toFixed(1) : 0;
    
    return { totalActual, totalTarget, avgActual, avgTarget, achievement };
}

// Get today's coal data
function getTodayCoalData() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1); // Get yesterday's date
    const todayData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate.toDateString() === yesterday.toDateString();
    });
    
    let totalActual = 0;
    let totalTarget = 0;
    
    todayData.forEach(row => {
        totalActual += Number(row[3]) || 0; // Coal Actual Production
        totalTarget += Number(row[2]) || 0; // Coal Production Target
    });
    
    const avgActual = todayData.length > 0 ? (totalActual / todayData.length).toFixed(2) : 0;
    const avgTarget = todayData.length > 0 ? (totalTarget / todayData.length).toFixed(2) : 0;
    const achievement = totalTarget > 0 ? ((totalActual / totalTarget) * 100).toFixed(1) : 0;
    
    return { totalActual, totalTarget, avgActual, avgTarget, achievement };
}

// Get current month's coal data
function getCurrentMonthCoalData() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const monthData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate.getMonth() === currentMonth && rowDate.getFullYear() === currentYear;
    });
    
    let totalActual = 0;
    let totalTarget = 0;
    
    monthData.forEach(row => {
        totalActual += Number(row[3]) || 0; // Coal Actual Production
        totalTarget += Number(row[2]) || 0; // Coal Production Target
    });
    
    const avgActual = monthData.length > 0 ? (totalActual / monthData.length).toFixed(2) : 0;
    const avgTarget = monthData.length > 0 ? (totalTarget / monthData.length).toFixed(2) : 0;
    const achievement = totalTarget > 0 ? ((totalActual / totalTarget) * 100).toFixed(1) : 0;
    
    return { totalActual, totalTarget, avgActual, avgTarget, achievement };
}

// Get current financial year's coal data
function getCurrentFYCoalData() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-based
    
    // Financial year starts from April (month 3 in 0-based)
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyStartDate = new Date(fyStartYear, 3, 1); // April 1st
    const fyEndDate = new Date(fyStartYear + 1, 2, 31); // March 31st
    
    const fyData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate >= fyStartDate && rowDate <= fyEndDate;
    });
    
    let totalActual = 0;
    let totalTarget = 0;
    
    fyData.forEach(row => {
        totalActual += Number(row[3]) || 0; // Coal Actual Production
        totalTarget += Number(row[2]) || 0; // Coal Production Target
    });
    
    const avgActual = fyData.length > 0 ? (totalActual / fyData.length).toFixed(2) : 0;
    const avgTarget = fyData.length > 0 ? (totalTarget / fyData.length).toFixed(2) : 0;
    const achievement = totalTarget > 0 ? ((totalActual / totalTarget) * 100).toFixed(1) : 0;
    
    return { totalActual, totalTarget, avgActual, avgTarget, achievement };
}

// Update OB summary table
function updateOBSummary() {
    const todayData = getTodayOBData();
    const monthData = getCurrentMonthOBData();
    const fyData = getCurrentFYOBData();
    
    // Get current date info
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayFormatted = yesterday.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const currentMonthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyLabel = `${fyStartYear}-${(fyStartYear + 1).toString().slice(-2)}`;
    
    document.getElementById('obSummaryData').innerHTML = `
        <thead class="table-light">
            <tr>
                <th style="width: 40%; font-size: 12px; padding: 8px 12px;">Metrics</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${yesterdayFormatted}</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${currentMonthName}</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${fyLabel}</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Total Target</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(todayData.totalTarget)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(monthData.totalTarget)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(fyData.totalTarget)}</td>
            </tr>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Total Production</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(todayData.totalActual)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(monthData.totalActual)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(fyData.totalActual)}</td>
            </tr>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Average Target</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(parseFloat(todayData.avgTarget))}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(parseFloat(monthData.avgTarget))}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(parseFloat(fyData.avgTarget))}</td>
            </tr>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Average Production</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(parseFloat(todayData.avgActual))}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(parseFloat(monthData.avgActual))}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(parseFloat(fyData.avgActual))}</td>
            </tr>
            <tr class="table-warning">
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Overall Percentage</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;"><span class="${todayData.achievement >= 100 ? 'text-success' : 'text-danger'}">${Math.round(parseFloat(todayData.achievement))}%</span></td>
                <td class="text-center" style="font-size: 11px; padding: 6px;"><span class="${monthData.achievement >= 100 ? 'text-success' : 'text-danger'}">${Math.round(parseFloat(monthData.achievement))}%</span></td>
                <td class="text-center" style="font-size: 11px; padding: 6px;"><span class="${fyData.achievement >= 100 ? 'text-success' : 'text-danger'}">${Math.round(parseFloat(fyData.achievement))}%</span></td>
            </tr>
        </tbody>
    `;
}

// Get today's dispatch data
function getTodayDispatchData() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1); // Get yesterday's date
    const todayData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate.toDateString() === yesterday.toDateString();
    });
    
    let roadDispatch = 0;
    let railDispatch = 0;
    let rakesDispatch = 0;
    
    todayData.forEach(row => {
        roadDispatch += Number(row[7]) || 0; // Road Dispatch (MT)
        railDispatch += Number(row[15]) || 0; // Rail Despatch (MT)
        rakesDispatch += Number(row[20]) || 0; // Rakes despatch (Rakes)
    });
    
    return { roadDispatch, railDispatch, rakesDispatch };
}

// Get current month's dispatch data
function getCurrentMonthDispatchData() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const monthData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate.getMonth() === currentMonth && rowDate.getFullYear() === currentYear;
    });
    
    let roadDispatch = 0;
    let railDispatch = 0;
    let rakesDispatch = 0;
    
    monthData.forEach(row => {
        roadDispatch += Number(row[7]) || 0; // Road Dispatch (MT)
        railDispatch += Number(row[15]) || 0; // Rail Despatch (MT)
        rakesDispatch += Number(row[20]) || 0; // Rakes despatch (Rakes)
    });
    
    return { roadDispatch, railDispatch, rakesDispatch };
}

// Get current financial year's dispatch data
function getCurrentFYDispatchData() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-based
    
    // Financial year starts from April (month 3 in 0-based)
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyStartDate = new Date(fyStartYear, 3, 1); // April 1st
    const fyEndDate = new Date(fyStartYear + 1, 2, 31); // March 31st
    
    const fyData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate >= fyStartDate && rowDate <= fyEndDate;
    });
    
    let roadDispatch = 0;
    let railDispatch = 0;
    let rakesDispatch = 0;
    
    fyData.forEach(row => {
        roadDispatch += Number(row[7]) || 0; // Road Dispatch (MT)
        railDispatch += Number(row[15]) || 0; // Rail Despatch (MT)
        rakesDispatch += Number(row[20]) || 0; // Rakes despatch (Rakes)
    });
    
    return { roadDispatch, railDispatch, rakesDispatch };
}

// Update Coal summary table
function updateCoalSummary() {
    const todayData = getTodayCoalData();
    const monthData = getCurrentMonthCoalData();
    const fyData = getCurrentFYCoalData();
    
    // Get current date info
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayFormatted = yesterday.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const currentMonthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyLabel = `${fyStartYear}-${(fyStartYear + 1).toString().slice(-2)}`;
    
    document.getElementById('coalSummaryData').innerHTML = `
        <thead class="table-light">
            <tr>
                <th style="width: 40%; font-size: 12px; padding: 8px 12px;">Metrics</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${yesterdayFormatted}</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${currentMonthName}</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${fyLabel}</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Total Target</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(todayData.totalTarget)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(monthData.totalTarget)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(fyData.totalTarget)}</td>
            </tr>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Total Production</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(todayData.totalActual)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(monthData.totalActual)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(fyData.totalActual)}</td>
            </tr>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Average Target</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(parseFloat(todayData.avgTarget))}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(parseFloat(monthData.avgTarget))}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(parseFloat(fyData.avgTarget))}</td>
            </tr>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Average Production</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(parseFloat(todayData.avgActual))}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(parseFloat(monthData.avgActual))}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(parseFloat(fyData.avgActual))}</td>
            </tr>
            <tr class="table-warning">
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Overall Percentage</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;"><span class="${todayData.achievement >= 100 ? 'text-success' : 'text-danger'}">${Math.round(parseFloat(todayData.achievement))}%</span></td>
                <td class="text-center" style="font-size: 11px; padding: 6px;"><span class="${monthData.achievement >= 100 ? 'text-success' : 'text-danger'}">${Math.round(parseFloat(monthData.achievement))}%</span></td>
                <td class="text-center" style="font-size: 11px; padding: 6px;"><span class="${fyData.achievement >= 100 ? 'text-success' : 'text-danger'}">${Math.round(parseFloat(fyData.achievement))}%</span></td>
            </tr>
        </tbody>
    `;
}

// Toggle card expansion
function toggleOBCard() {
    const content = document.getElementById('obExpandableContent');
    const arrow = document.getElementById('obToggleArrow').querySelector('i');
    const isExpanded = content.style.display === 'block';
    
    content.style.display = isExpanded ? 'none' : 'block';
    arrow.className = isExpanded ? 'bi bi-chevron-down' : 'bi bi-chevron-up';
    
    if (!isExpanded && !obChart) {
        updateOBChart();
    }
}

// Toggle coal card expansion
function toggleCoalCard() {
    const content = document.getElementById('coalExpandableContent');
    const arrow = document.getElementById('coalToggleArrow').querySelector('i');
    const isExpanded = content.style.display === 'block';
    
    content.style.display = isExpanded ? 'none' : 'block';
    arrow.className = isExpanded ? 'bi bi-chevron-down' : 'bi bi-chevron-up';
    
    if (!isExpanded && !coalChart) {
        updateCoalChart();
    }
}

// Update data without toggling card
function updateOBDataOnly() {
    updateOBSummary();
    updateOBChart();
}

// Handle radio button changes without propagation
function handleDurationChange(event) {
    updateOBSummary();
    updateOBChart();
}

// Handle coal radio button changes without propagation
function handleCoalDurationChange(event) {
    updateCoalSummary();
    updateCoalChart();
}

// Get today's dispatch data
function getTodayDispatchData() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1); // Get yesterday's date
    const todayData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate.toDateString() === yesterday.toDateString();
    });
    
    let roadDispatch = 0;
    let railDispatch = 0;
    let rakesDispatch = 0;
    
    todayData.forEach(row => {
        roadDispatch += Number(row[7]) || 0; // Road Dispatch (MT)
        railDispatch += Number(row[15]) || 0; // Rail Despatch (MT)
        rakesDispatch += Number(row[20]) || 0; // Rakes despatch (Rakes)
    });
    
    return { roadDispatch, railDispatch, rakesDispatch };
}

// Get current month's dispatch data
function getCurrentMonthDispatchData() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const monthData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate.getMonth() === currentMonth && rowDate.getFullYear() === currentYear;
    });
    
    let roadDispatch = 0;
    let railDispatch = 0;
    let rakesDispatch = 0;
    
    monthData.forEach(row => {
        roadDispatch += Number(row[7]) || 0; // Road Dispatch (MT)
        railDispatch += Number(row[15]) || 0; // Rail Despatch (MT)
        rakesDispatch += Number(row[20]) || 0; // Rakes despatch (Rakes)
    });
    
    return { roadDispatch, railDispatch, rakesDispatch };
}

// Get current financial year's dispatch data
function getCurrentFYDispatchData() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-based
    
    // Financial year starts from April (month 3 in 0-based)
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyStartDate = new Date(fyStartYear, 3, 1); // April 1st
    const fyEndDate = new Date(fyStartYear + 1, 2, 31); // March 31st
    
    const fyData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate >= fyStartDate && rowDate <= fyEndDate;
    });
    
    let roadDispatch = 0;
    let railDispatch = 0;
    let rakesDispatch = 0;
    
    fyData.forEach(row => {
        roadDispatch += Number(row[7]) || 0; // Road Dispatch (MT)
        railDispatch += Number(row[15]) || 0; // Rail Despatch (MT)
        rakesDispatch += Number(row[20]) || 0; // Rakes despatch (Rakes)
    });
    
    return { roadDispatch, railDispatch, rakesDispatch };
}

// Update Dispatch summary table
function updateDispatchSummary() {
    const todayData = getTodayDispatchData();
    const monthData = getCurrentMonthDispatchData();
    const fyData = getCurrentFYDispatchData();
    
    // Calculate averages for month and FY
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get count of days for averages
    const monthDaysCount = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate.getMonth() === currentMonth && rowDate.getFullYear() === currentYear;
    }).length;
    
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyStartDate = new Date(fyStartYear, 3, 1);
    const fyEndDate = new Date(fyStartYear + 1, 2, 31);
    
    const fyDaysCount = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate >= fyStartDate && rowDate <= fyEndDate;
    }).length;
    
    // Calculate averages with specific decimal formatting
    const monthAvgRoad = monthDaysCount > 0 ? Math.round(monthData.roadDispatch / monthDaysCount).toString() : '0';
    const monthAvgRail = monthDaysCount > 0 ? Math.round(monthData.railDispatch / monthDaysCount).toString() : '0';
    const monthAvgRakes = monthDaysCount > 0 ? (monthData.rakesDispatch / monthDaysCount).toFixed(2) : '0.00';
    
    const fyAvgRoad = fyDaysCount > 0 ? Math.round(fyData.roadDispatch / fyDaysCount).toString() : '0';
    const fyAvgRail = fyDaysCount > 0 ? Math.round(fyData.railDispatch / fyDaysCount).toString() : '0';
    const fyAvgRakes = fyDaysCount > 0 ? (fyData.rakesDispatch / fyDaysCount).toFixed(2) : '0.00';
    
    // Get current date info
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayFormatted = yesterday.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const currentMonthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const fyLabel = `${fyStartYear}-${(fyStartYear + 1).toString().slice(-2)}`;
    
    document.getElementById('dispatchSummaryData').innerHTML = `
        <thead class="table-light">
            <tr>
                <th style="width: 40%; font-size: 12px; padding: 8px 12px;">Metrics</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${yesterdayFormatted}</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${currentMonthName}</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${fyLabel}</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Road Dispatch (MT)</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(todayData.roadDispatch)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(monthData.roadDispatch)}<br><small class="text-muted">(${monthAvgRoad})</small></td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(fyData.roadDispatch)}<br><small class="text-muted">(${fyAvgRoad})</small></td>
            </tr>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Rail Despatch (MT)</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(todayData.railDispatch)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(monthData.railDispatch)}<br><small class="text-muted">(${monthAvgRail})</small></td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(fyData.railDispatch)}<br><small class="text-muted">(${fyAvgRail})</small></td>
            </tr>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Rakes Despatch (Rakes)</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(todayData.rakesDispatch)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(monthData.rakesDispatch)}<br><small class="text-muted">(${monthAvgRakes})</small></td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(fyData.rakesDispatch)}<br><small class="text-muted">(${fyAvgRakes})</small></td>
            </tr>
        </tbody>
    `;
}

// Export dispatch card as high-quality PDF
async function exportDispatchToPDF() {
    const { jsPDF } = window.jspdf;
    const html2canvas = window.html2canvas;
    
    if (!jsPDF || !html2canvas) {
        alert('Export libraries not loaded. Please refresh the page and try again.');
        return;
    }
    
    try {
        const cardElement = document.getElementById('dispatchCard');
        const canvas = await html2canvas(cardElement, {
            scale: 4, // Increased scale for higher quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: cardElement.offsetWidth,
            height: cardElement.offsetHeight,
            dpi: 300, // High DPI for crisp text and graphics
            letterRendering: true, // Better text rendering
            logging: false, // Disable logging for cleaner console
            imageTimeout: 30000, // Longer timeout for complex content
            removeContainer: true // Clean up temporary elements
        });
        
        // Use higher quality image format
        const imgData = canvas.toDataURL('image/png', 1.0); // Maximum quality PNG
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 190;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 10;
        
        // Add image with compression settings for quality preservation
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight, '', 'MEDIUM');
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight, '', 'MEDIUM');
            heightLeft -= pageHeight;
        }
        
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        pdf.save(`Dispatch_Dashboard_${dateStr}.pdf`);
    } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Error exporting PDF. Please try again.');
    }
}

// Export dispatch card as high-quality JPG
async function exportDispatchToJPG() {
    const html2canvas = window.html2canvas;
    
    if (!html2canvas) {
        alert('Export library not loaded. Please refresh the page and try again.');
        return;
    }
    
    try {
        const cardElement = document.getElementById('dispatchCard');
        const canvas = await html2canvas(cardElement, {
            scale: 3, // High quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: cardElement.offsetWidth,
            height: cardElement.offsetHeight
        });
        
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            
            a.href = url;
            a.download = `Dispatch_Dashboard_${dateStr}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/jpeg', 0.95); // High quality JPEG
    } catch (error) {
        console.error('Error exporting JPG:', error);
        alert('Error exporting JPG. Please try again.');
    }
}

// Get today's stock data
function getTodayStockData() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1); // Get yesterday's date
    const todayData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate.toDateString() === yesterday.toDateString();
    });
    
    let mineEndStock = 0;
    let railwaySidingStock = 0;
    
    todayData.forEach(row => {
        mineEndStock += Number(row[8]) || 0; // Mine End Closing Stock (MT)
        railwaySidingStock += Number(row[22]) || 0; // Railway siding closing stock (MT)
    });
    
    return { mineEndStock, railwaySidingStock };
}

// Get current month's stock data
function getCurrentMonthStockData() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const monthData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate.getMonth() === currentMonth && rowDate.getFullYear() === currentYear;
    });
    
    let mineEndStock = 0;
    let railwaySidingStock = 0;
    let count = 0;
    
    monthData.forEach(row => {
        mineEndStock += Number(row[8]) || 0; // Mine End Closing Stock (MT)
        railwaySidingStock += Number(row[22]) || 0; // Railway siding closing stock (MT)
        count++;
    });
    
    // Get average for month
    const avgMineEndStock = count > 0 ? mineEndStock / count : 0;
    const avgRailwaySidingStock = count > 0 ? railwaySidingStock / count : 0;
    
    return { mineEndStock: avgMineEndStock, railwaySidingStock: avgRailwaySidingStock };
}

// Get current financial year's stock data
function getCurrentFYStockData() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-based
    
    // Financial year starts from April (month 3 in 0-based)
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyStartDate = new Date(fyStartYear, 3, 1); // April 1st
    const fyEndDate = new Date(fyStartYear + 1, 2, 31); // March 31st
    
    const fyData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate >= fyStartDate && rowDate <= fyEndDate;
    });
    
    let mineEndStock = 0;
    let railwaySidingStock = 0;
    let count = 0;
    
    fyData.forEach(row => {
        mineEndStock += Number(row[8]) || 0; // Mine End Closing Stock (MT)
        railwaySidingStock += Number(row[22]) || 0; // Railway siding closing stock (MT)
        count++;
    });
    
    // Get average for financial year
    const avgMineEndStock = count > 0 ? mineEndStock / count : 0;
    const avgRailwaySidingStock = count > 0 ? railwaySidingStock / count : 0;
    
    return { mineEndStock: avgMineEndStock, railwaySidingStock: avgRailwaySidingStock };
}

// Update Stock summary table
function updateStockSummary() {
    const todayData = getTodayStockData();
    const monthData = getCurrentMonthStockData();
    const fyData = getCurrentFYStockData();
    
    // Get current date info
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayFormatted = yesterday.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const currentMonthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyLabel = `${fyStartYear}-${(fyStartYear + 1).toString().slice(-2)}`;
    
    document.getElementById('stockSummaryData').innerHTML = `
        <thead class="table-light">
            <tr>
                <th style="width: 40%; font-size: 12px; padding: 8px 12px;">Stock Type</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${yesterdayFormatted}</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${currentMonthName} (Avg)</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${fyLabel} (Avg)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Mine End Closing Stock (MT)</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(todayData.mineEndStock)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(monthData.mineEndStock)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(fyData.mineEndStock)}</td>
            </tr>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Railway Siding Closing Stock (MT)</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(todayData.railwaySidingStock)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(monthData.railwaySidingStock)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(fyData.railwaySidingStock)}</td>
            </tr>
        </tbody>
    `;
}

// Toggle stock card expansion
function toggleStockCard() {
    const content = document.getElementById('stockExpandableContent');
    const arrow = document.getElementById('stockToggleArrow').querySelector('i');
    const isExpanded = content.style.display === 'block';
    
    content.style.display = isExpanded ? 'none' : 'block';
    arrow.className = isExpanded ? 'bi bi-chevron-down' : 'bi bi-chevron-up';
    
    if (!isExpanded && !stockChart) {
        updateStockChart();
    }
}

// Get stock data for specific duration
function getStockDataForDuration(days) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    return PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate >= startDate && rowDate <= endDate;
    }).sort((a, b) => parseDMY(a[0]) - parseDMY(b[0]));
}

// Update Stock chart
function updateStockChart() {
    const selectedDays = parseInt(document.querySelector('input[name="stockDuration"]:checked').value);
    const data = getStockDataForDuration(selectedDays);
    
    const labels = data.map(row => formatDate(row[0]));
    const mineEndData = data.map(row => Number(row[8]) || 0); // Mine End Closing Stock (Column 8)
    const railwaySidingData = data.map(row => Number(row[22]) || 0); // Railway siding closing stock (Column 22)
    
    // Show only every nth label to avoid overcrowding
    const labelStep = Math.max(1, Math.floor(labels.length / 10));
    const displayLabels = labels.map((label, index) => 
        index % labelStep === 0 ? label : ''
    );
    
    if (stockChart) {
        stockChart.data.labels = displayLabels;
        stockChart.data.datasets[0].data = mineEndData;
        stockChart.data.datasets[1].data = railwaySidingData;
        stockChart.update();
    } else {
        const ctx = document.getElementById('stockDataChart').getContext('2d');
        stockChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: displayLabels,
                datasets: [
                    {
                        label: 'Mine End Closing Stock',
                        data: mineEndData,
                        borderColor: '#17a2b8',
                        backgroundColor: 'rgba(23, 162, 184, 0.1)',
                        tension: 0.3,
                        fill: false,
                        pointRadius: 1,
                        pointHoverRadius: 3,
                        borderWidth: 1.5
                    },
                    {
                        label: 'Railway Siding Closing Stock',
                        data: railwaySidingData,
                        borderColor: '#6f42c1',
                        backgroundColor: 'rgba(111, 66, 193, 0.1)',
                        tension: 0.3,
                        fill: false,
                        pointRadius: 1,
                        pointHoverRadius: 5,
                        borderWidth: 1.5
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
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} MT`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Date',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            maxRotation: 45,
                            font: {
                                size: 10
                            }
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Stock (MT)',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                        beginAtZero: true,
                        ticks: {
                            font: {
                                size: 10
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }
}

// Handle stock radio button changes without propagation
function handleStockDurationChange(event) {
    updateStockChart();
}

// Export stock card as high-quality PDF
async function exportStockToPDF() {
    const { jsPDF } = window.jspdf;
    const html2canvas = window.html2canvas;
    
    if (!jsPDF || !html2canvas) {
        alert('Export libraries not loaded. Please refresh the page and try again.');
        return;
    }
    
    try {
        const cardElement = document.getElementById('stockCard');
        const canvas = await html2canvas(cardElement, {
            scale: 4, // Increased scale for higher quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: cardElement.offsetWidth,
            height: cardElement.offsetHeight,
            dpi: 300, // High DPI for crisp text and graphics
            letterRendering: true, // Better text rendering
            logging: false, // Disable logging for cleaner console
            imageTimeout: 30000, // Longer timeout for complex content
            removeContainer: true // Clean up temporary elements
        });
        
        // Use higher quality image format
        const imgData = canvas.toDataURL('image/png', 1.0); // Maximum quality PNG
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 190;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 10;
        
        // Add image with compression settings for quality preservation
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight, '', 'MEDIUM');
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight, '', 'MEDIUM');
            heightLeft -= pageHeight;
        }
        
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        pdf.save(`Stock_Dashboard_${dateStr}.pdf`);
    } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Error exporting PDF. Please try again.');
    }
}

// Export stock card as high-quality JPG
async function exportStockToJPG() {
    const html2canvas = window.html2canvas;
    
    if (!html2canvas) {
        alert('Export library not loaded. Please refresh the page and try again.');
        return;
    }
    
    try {
        const cardElement = document.getElementById('stockCard');
        const canvas = await html2canvas(cardElement, {
            scale: 3, // High quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: cardElement.offsetWidth,
            height: cardElement.offsetHeight
        });
        
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            
            a.href = url;
            a.download = `Stock_Dashboard_${dateStr}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/jpeg', 0.95); // High quality JPEG
    } catch (error) {
        console.error('Error exporting JPG:', error);
        alert('Error exporting JPG. Please try again.');
    }
}

// Get today's plant rakes dispatch data
function getTodayPlantRakesData() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1); // Get yesterday's date
    const todayData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate.toDateString() === yesterday.toDateString();
    });
    
    let ggsstpRakes = 0;
    let ghtpRakes = 0;
    let gatpRakes = 0;
    let totalRakes = 0;
    
    todayData.forEach(row => {
        ggsstpRakes += Number(row[17]) || 0; // GGSSTP column index 17
        ghtpRakes += Number(row[18]) || 0; // GHTP column index 18
        gatpRakes += Number(row[19]) || 0; // GATP column index 19
        totalRakes += Number(row[20]) || 0; // Total column index 20
    });
    
    return { ggsstpRakes, ghtpRakes, gatpRakes, totalRakes };
}

// Get current month's plant rakes dispatch data
function getCurrentMonthPlantRakesData() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const monthData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate.getMonth() === currentMonth && rowDate.getFullYear() === currentYear;
    });
    
    let ggsstpRakes = 0;
    let ghtpRakes = 0;
    let gatpRakes = 0;
    let totalRakes = 0;
    
    monthData.forEach(row => {
        ggsstpRakes += Number(row[17]) || 0; // GGSSTP column index 17
        ghtpRakes += Number(row[18]) || 0; // GHTP column index 18
        gatpRakes += Number(row[19]) || 0; // GATP column index 19
        totalRakes += Number(row[20]) || 0; // Total column index 20
    });
    
    return { ggsstpRakes, ghtpRakes, gatpRakes, totalRakes };
}

// Get current financial year's plant rakes dispatch data
function getCurrentFYPlantRakesData() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-based
    
    // Financial year starts from April (month 3 in 0-based)
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyStartDate = new Date(fyStartYear, 3, 1); // April 1st
    const fyEndDate = new Date(fyStartYear + 1, 2, 31); // March 31st
    
    const fyData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate >= fyStartDate && rowDate <= fyEndDate;
    });
    
    let ggsstpRakes = 0;
    let ghtpRakes = 0;
    let gatpRakes = 0;
    let totalRakes = 0;
    
    fyData.forEach(row => {
        ggsstpRakes += Number(row[17]) || 0; // GGSSTP column index 17
        ghtpRakes += Number(row[18]) || 0; // GHTP column index 18
        gatpRakes += Number(row[19]) || 0; // GATP column index 19
        totalRakes += Number(row[20]) || 0; // Total column index 20
    });
    
    return { ggsstpRakes, ghtpRakes, gatpRakes, totalRakes };
}

// Update Plant Rakes summary table
function updatePlantRakesSummary() {
    const todayData = getTodayPlantRakesData();
    const monthData = getCurrentMonthPlantRakesData();
    const fyData = getCurrentFYPlantRakesData();
    
    // Calculate averages for month and FY
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get count of days for averages
    const monthDaysCount = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate.getMonth() === currentMonth && rowDate.getFullYear() === currentYear;
    }).length;
    
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyStartDate = new Date(fyStartYear, 3, 1);
    const fyEndDate = new Date(fyStartYear + 1, 2, 31);
    
    const fyDaysCount = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate >= fyStartDate && rowDate <= fyEndDate;
    }).length;
    
    // Calculate averages
    const monthAvgGGSSTP = monthDaysCount > 0 ? (monthData.ggsstpRakes / monthDaysCount).toFixed(2) : '0.00';
    const monthAvgGHTP = monthDaysCount > 0 ? (monthData.ghtpRakes / monthDaysCount).toFixed(2) : '0.00';
    const monthAvgGATP = monthDaysCount > 0 ? (monthData.gatpRakes / monthDaysCount).toFixed(2) : '0.00';
    const monthAvgTotal = monthDaysCount > 0 ? (monthData.totalRakes / monthDaysCount).toFixed(2) : '0.00';
    
    const fyAvgGGSSTP = fyDaysCount > 0 ? (fyData.ggsstpRakes / fyDaysCount).toFixed(2) : '0.00';
    const fyAvgGHTP = fyDaysCount > 0 ? (fyData.ghtpRakes / fyDaysCount).toFixed(2) : '0.00';
    const fyAvgGATP = fyDaysCount > 0 ? (fyData.gatpRakes / fyDaysCount).toFixed(2) : '0.00';
    const fyAvgTotal = fyDaysCount > 0 ? (fyData.totalRakes / fyDaysCount).toFixed(2) : '0.00';
    
    // Get current date info
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayFormatted = yesterday.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const currentMonthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const fyLabel = `${fyStartYear}-${(fyStartYear + 1).toString().slice(-2)}`;
    
    document.getElementById('plantRakesSummaryData').innerHTML = `
        <thead class="table-light">
            <tr>
                <th style="width: 40%; font-size: 12px; padding: 8px 12px;">Plant</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${yesterdayFormatted}</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${currentMonthName}</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${fyLabel}</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">GGSSTP</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(todayData.ggsstpRakes)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(monthData.ggsstpRakes)}<br><small class="text-muted">(${monthAvgGGSSTP})</small></td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(fyData.ggsstpRakes)}<br><small class="text-muted">(${fyAvgGGSSTP})</small></td>
            </tr>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">GHTP</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(todayData.ghtpRakes)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(monthData.ghtpRakes)}<br><small class="text-muted">(${monthAvgGHTP})</small></td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(fyData.ghtpRakes)}<br><small class="text-muted">(${fyAvgGHTP})</small></td>
            </tr>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">GATP</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(todayData.gatpRakes)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(monthData.gatpRakes)}<br><small class="text-muted">(${monthAvgGATP})</small></td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(fyData.gatpRakes)}<br><small class="text-muted">(${fyAvgGATP})</small></td>
            </tr>
            <tr class="table-info">
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Total</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(todayData.totalRakes)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(monthData.totalRakes)}<br><small class="text-muted">(${monthAvgTotal})</small></td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(fyData.totalRakes)}<br><small class="text-muted">(${fyAvgTotal})</small></td>
            </tr>
        </tbody>
    `;
}

// Update Plant Rakes date-wise table
function updatePlantRakesDateWiseTable() {
    const data = getCurrentMonthPlantRakesChartData();
    
    let tableHTML = `
        <thead class="table-light sticky-top">
            <tr>
                <th style="padding: 6px 8px;">Date</th>
                <th style="padding: 6px 8px; text-align: center;">GGSSTP</th>
                <th style="padding: 6px 8px; text-align: center;">GHTP</th>
                <th style="padding: 6px 8px; text-align: center;">GATP</th>
                <th style="padding: 6px 8px; text-align: center;">Total</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    if (data.length === 0) {
        tableHTML += `<tr><td colspan="5" class="text-center text-muted">No data available for current month</td></tr>`;
    } else {
        data.forEach(row => {
            const date = formatDate(row[0]);
            const ggsstp = Math.round(Number(row[17]) || 0);
            const ghtp = Math.round(Number(row[18]) || 0);
            const gatp = Math.round(Number(row[19]) || 0);
            const total = Math.round(Number(row[20]) || 0);
            
            tableHTML += `
                <tr>
                    <td style="padding: 4px 8px; font-weight: 500;">${date}</td>
                    <td style="padding: 4px 8px; text-align: center;">${ggsstp}</td>
                    <td style="padding: 4px 8px; text-align: center;">${ghtp}</td>
                    <td style="padding: 4px 8px; text-align: center;">${gatp}</td>
                    <td style="padding: 4px 8px; text-align: center; font-weight: 600; background-color: #f8f9fa;">${total}</td>
                </tr>
            `;
        });
        
        // Add totals row
        const totals = data.reduce((acc, row) => {
            acc.ggsstp += Number(row[17]) || 0;
            acc.ghtp += Number(row[18]) || 0;
            acc.gatp += Number(row[19]) || 0;
            acc.total += Number(row[20]) || 0;
            return acc;
        }, { ggsstp: 0, ghtp: 0, gatp: 0, total: 0 });
        
        tableHTML += `
            <tr class="table-warning" style="font-weight: 600;">
                <td style="padding: 6px 8px;">Total</td>
                <td style="padding: 6px 8px; text-align: center;">${Math.round(totals.ggsstp)}</td>
                <td style="padding: 6px 8px; text-align: center;">${Math.round(totals.ghtp)}</td>
                <td style="padding: 6px 8px; text-align: center;">${Math.round(totals.gatp)}</td>
                <td style="padding: 6px 8px; text-align: center; background-color: #ffc107;">${Math.round(totals.total)}</td>
            </tr>
        `;
    }
    
    tableHTML += `</tbody>`;
    document.getElementById('plantRakesDateWiseTable').innerHTML = tableHTML;
}

// Toggle plant rakes card expansion
function togglePlantRakesCard() {
    const content = document.getElementById('plantRakesExpandableContent');
    const arrow = document.getElementById('plantRakesToggleArrow').querySelector('i');
    const isExpanded = content.style.display === 'block';
    
    content.style.display = isExpanded ? 'none' : 'block';
    arrow.className = isExpanded ? 'bi bi-chevron-down' : 'bi bi-chevron-up';
    
    if (!isExpanded) {
        updatePlantRakesDateWiseTable();
        if (!plantRakesChart) {
            updatePlantRakesChart();
        }
    }
}

// Get current month's plant rakes data for chart (date-wise)
function getCurrentMonthPlantRakesChartData() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const monthData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate.getMonth() === currentMonth && rowDate.getFullYear() === currentYear;
    }).sort((a, b) => parseDMY(a[0]) - parseDMY(b[0]));
    
    return monthData;
}

// Update Plant Rakes chart (current month date-wise)
function updatePlantRakesChart() {
    const data = getCurrentMonthPlantRakesChartData();
    
    const labels = data.map(row => formatDate(row[0]));
    const ggsstpData = data.map(row => Number(row[17]) || 0); // GGSSTP column index 17
    const ghtpData = data.map(row => Number(row[18]) || 0); // GHTP column index 18
    const gatpData = data.map(row => Number(row[19]) || 0); // GATP column index 19
    const totalData = data.map(row => Number(row[20]) || 0); // Total column index 20
    
    // Show only every nth label to avoid overcrowding
    const labelStep = Math.max(1, Math.floor(labels.length / 10));
    const displayLabels = labels.map((label, index) => 
        index % labelStep === 0 ? label : ''
    );
    
    if (plantRakesChart) {
        plantRakesChart.data.labels = displayLabels;
        plantRakesChart.data.datasets[0].data = ggsstpData;
        plantRakesChart.data.datasets[1].data = ghtpData;
        plantRakesChart.data.datasets[2].data = gatpData;
        plantRakesChart.data.datasets[3].data = totalData;
        plantRakesChart.update();
    } else {
        const ctx = document.getElementById('plantRakesDataChart').getContext('2d');
        plantRakesChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: displayLabels,
                datasets: [
                    {
                        label: 'GGSSTP',
                        data: ggsstpData,
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        tension: 0.3,
                        fill: false,
                        pointRadius: 1,
                        pointHoverRadius: 5,
                        borderWidth: 1.5
                    },
                    {
                        label: 'GHTP',
                        data: ghtpData,
                        borderColor: '#f39c12',
                        backgroundColor: 'rgba(243, 156, 18, 0.1)',
                        tension: 0.3,
                        fill: false,
                        pointRadius: 1,
                        pointHoverRadius: 5,
                        borderWidth: 1.5
                    },
                    {
                        label: 'GATP',
                        data: gatpData,
                        borderColor: '#2ecc71',
                        backgroundColor: 'rgba(46, 204, 113, 0.1)',
                        tension: 0.3,
                        fill: false,
                        pointRadius: 1,
                        pointHoverRadius: 5,
                        borderWidth: 1.5
                    },
                    {
                        label: 'Total',
                        data: totalData,
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        tension: 0.3,
                        fill: false,
                        pointRadius: 2,
                        pointHoverRadius: 6,
                        borderWidth: 2,
                        borderDash: [5, 5]
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
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y} Rakes`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Date',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            maxRotation: 45,
                            font: {
                                size: 10
                            }
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Rakes Dispatched',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                        beginAtZero: true,
                        ticks: {
                            font: {
                                size: 10
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }
}

// Export plant rakes card as high-quality PDF
async function exportPlantRakesToPDF() {
    const { jsPDF } = window.jspdf;
    const html2canvas = window.html2canvas;
    
    if (!jsPDF || !html2canvas) {
        alert('Export libraries not loaded. Please refresh the page and try again.');
        return;
    }
    
    try {
        const cardElement = document.getElementById('plantRakesCard');
        const canvas = await html2canvas(cardElement, {
            scale: 4, // Increased scale for higher quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: cardElement.offsetWidth,
            height: cardElement.offsetHeight,
            dpi: 300, // High DPI for crisp text and graphics
            letterRendering: true, // Better text rendering
            logging: false, // Disable logging for cleaner console
            imageTimeout: 30000, // Longer timeout for complex content
            removeContainer: true // Clean up temporary elements
        });
        
        // Use higher quality image format
        const imgData = canvas.toDataURL('image/png', 1.0); // Maximum quality PNG
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 190;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 10;
        
        // Add image with compression settings for quality preservation
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight, '', 'MEDIUM');
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight, '', 'MEDIUM');
            heightLeft -= pageHeight;
        }
        
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        pdf.save(`Plant_Rakes_Dashboard_${dateStr}.pdf`);
    } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Error exporting PDF. Please try again.');
    }
}

// Export plant rakes card as high-quality JPG
async function exportPlantRakesToJPG() {
    const html2canvas = window.html2canvas;
    
    if (!html2canvas) {
        alert('Export library not loaded. Please refresh the page and try again.');
        return;
    }
    
    try {
        const cardElement = document.getElementById('plantRakesCard');
        const canvas = await html2canvas(cardElement, {
            scale: 3, // High quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: cardElement.offsetWidth,
            height: cardElement.offsetHeight
        });
        
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            
            a.href = url;
            a.download = `Plant_Rakes_Dashboard_${dateStr}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/jpeg', 0.95); // High quality JPEG
    } catch (error) {
        console.error('Error exporting JPG:', error);
        alert('Error exporting JPG. Please try again.');
    }
}

// Get all financial years available in data
function getAvailableFinancialYears() {
    const years = new Set();
    
    PachhwaraDashboardData.forEach(row => {
        const rowDate = parseDMY(row[0]);
        const year = rowDate.getFullYear();
        const month = rowDate.getMonth(); // 0-based
        
        // Financial year starts from April (month 3 in 0-based)
        const fyStartYear = month >= 3 ? year : year - 1;
        years.add(fyStartYear);
    });
    
    return Array.from(years).sort((a, b) => b - a); // Sort descending (latest first)
}

// Get dispatch data for specific financial year
function getFYDispatchData(fyStartYear) {
    const fyStartDate = new Date(fyStartYear, 3, 1); // April 1st
    const fyEndDate = new Date(fyStartYear + 1, 2, 31); // March 31st
    
    const fyData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate >= fyStartDate && rowDate <= fyEndDate;
    });
    
    let coalDispatch = 0;
    let rakesDispatch = 0;
    
    fyData.forEach(row => {
        coalDispatch += Number(row[15]) || 0; // Rail Despatch (MT) - Column 15
        rakesDispatch += Number(row[20]) || 0; // Rakes despatch (Rakes) - Column 20
    });
    
    return { coalDispatch, rakesDispatch, fyLabel: `${fyStartYear}-${(fyStartYear + 1).toString().slice(-2)}` };
}

// Update Financial Year Dispatch Summary table
function updateFYDispatchSummary() {
    const availableYears = getAvailableFinancialYears();
    
    if (availableYears.length === 0) {
        document.getElementById('fyDispatchSummaryData').innerHTML = `
            <tbody>
                <tr><td colspan="3" class="text-center text-muted">No data available</td></tr>
            </tbody>
        `;
        return;
    }
    
    let tableHTML = `
        <thead class="table-light">
            <tr>
                <th style="width: 40%; font-size: 12px; padding: 8px 12px;">Financial Year</th>
                <th style="width: 30%; text-align: center; font-size: 12px; padding: 8px 6px;">Coal Dispatch (MT)</th>
                <th style="width: 30%; text-align: center; font-size: 12px; padding: 8px 6px;">Rakes Dispatch (Rakes)</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    let totalCoal = 0;
    let totalRakes = 0;
    
    availableYears.forEach(year => {
        const fyData = getFYDispatchData(year);
        totalCoal += fyData.coalDispatch;
        totalRakes += fyData.rakesDispatch;
        
        tableHTML += `
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">${fyData.fyLabel}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(fyData.coalDispatch).toLocaleString()}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${Math.round(fyData.rakesDispatch).toLocaleString()}</td>
            </tr>
        `;
    });
    
    // Add total row
    tableHTML += `
        <tr class="table-info" style="font-weight: 600;">
            <td style="font-size: 11px; padding: 6px 12px;">Total</td>
            <td class="text-center" style="font-size: 11px; padding: 6px; background-color: #d1ecf1;">${Math.round(totalCoal).toLocaleString()}</td>
            <td class="text-center" style="font-size: 11px; padding: 6px; background-color: #d1ecf1;">${Math.round(totalRakes).toLocaleString()}</td>
        </tr>
    `;
    
    tableHTML += `</tbody>`;
    document.getElementById('fyDispatchSummaryData').innerHTML = tableHTML;
}

// Export FY dispatch card as high-quality PDF
async function exportFYDispatchToPDF() {
    const { jsPDF } = window.jspdf;
    const html2canvas = window.html2canvas;
    
    if (!jsPDF || !html2canvas) {
        alert('Export libraries not loaded. Please refresh the page and try again.');
        return;
    }
    
    try {
        const cardElement = document.getElementById('fyDispatchCard');
        const canvas = await html2canvas(cardElement, {
            scale: 4, // Increased scale for higher quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: cardElement.offsetWidth,
            height: cardElement.offsetHeight,
            dpi: 300, // High DPI for crisp text and graphics
            letterRendering: true, // Better text rendering
            logging: false, // Disable logging for cleaner console
            imageTimeout: 30000, // Longer timeout for complex content
            removeContainer: true // Clean up temporary elements
        });
        
        // Use higher quality image format
        const imgData = canvas.toDataURL('image/png', 1.0); // Maximum quality PNG
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 190;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 10;
        
        // Add image with compression settings for quality preservation
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight, '', 'MEDIUM');
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        pdf.save(`FY_Dispatch_Dashboard_${dateStr}.pdf`);
    } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Error exporting PDF. Please try again.');
    }
}

// Export FY dispatch card as high-quality JPG
async function exportFYDispatchToJPG() {
    const html2canvas = window.html2canvas;
    
    if (!html2canvas) {
        alert('Export library not loaded. Please refresh the page and try again.');
        return;
    }
    
    try {
        const cardElement = document.getElementById('fyDispatchCard');
        const canvas = await html2canvas(cardElement, {
            scale: 3, // High quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: cardElement.offsetWidth,
            height: cardElement.offsetHeight
        });
        
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            
            a.href = url;
            a.download = `FY_Dispatch_Dashboard_${dateStr}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/jpeg', 0.95); // High quality JPEG
    } catch (error) {
        console.error('Error exporting JPG:', error);
        alert('Error exporting JPG. Please try again.');
    }
}

// Export all dashboard cards as single PDF
async function exportAllDashboardToPDF() {
    const { jsPDF } = window.jspdf;
    const html2canvas = window.html2canvas;
    
    if (!jsPDF || !html2canvas) {
        alert('Export libraries not loaded. Please refresh the page and try again.');
        return;
    }
    
    try {
        // Create a temporary container with all card data
        const dashboardContainer = document.createElement('div');
        dashboardContainer.style.cssText = `
            position: absolute;
            top: -10000px;
            left: -10000px;
            width: 800px;
            background: white;
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;
        
        // Get yesterday's date for the title
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayFormatted = yesterday.toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
        
        // Create the dashboard content
        dashboardContainer.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #007bff; padding-bottom: 15px;">
                <h2 style="color: #2c3e50; margin: 0; font-size: 20px; font-weight: 700;">
                    Daily Progress Report of Pachwara Central Coal Mine
                </h2>
                <h3 style="color: #6c757d; margin: 5px 0 0 0; font-size: 16px; font-weight: 500;">
                    Date: ${yesterdayFormatted}
                </h3>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <!-- OB Summary -->
                <div style="border: 1px solid #dee2e6; border-radius: 8px; padding: 12px;">
                    <h4 style="color: #2c3e50; font-size: 14px; margin: 0 0 10px 0; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                        OB Production Summary
                    </h4>
                    <div id="pdfOBSummary" style="font-size: 10px;"></div>
                </div>
                
                <!-- Coal Summary -->
                <div style="border: 1px solid #dee2e6; border-radius: 8px; padding: 12px;">
                    <h4 style="color: #2c3e50; font-size: 14px; margin: 0 0 10px 0; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                        Coal Production Summary
                    </h4>
                    <div id="pdfCoalSummary" style="font-size: 10px;"></div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <!-- Stock Summary -->
                <div style="border: 1px solid #dee2e6; border-radius: 8px; padding: 12px;">
                    <h4 style="color: #2c3e50; font-size: 14px; margin: 0 0 10px 0; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                        Closing Stock Summary
                    </h4>
                    <div id="pdfStockSummary" style="font-size: 10px;"></div>
                </div>
                
                <!-- Dispatch Summary -->
                <div style="border: 1px solid #dee2e6; border-radius: 8px; padding: 12px;">
                    <h4 style="color: #2c3e50; font-size: 14px; margin: 0 0 10px 0; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                        Dispatch Summary
                    </h4>
                    <div id="pdfDispatchSummary" style="font-size: 10px;"></div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <!-- Plant Rakes Summary -->
                <div style="border: 1px solid #dee2e6; border-radius: 8px; padding: 12px;">
                    <h4 style="color: #2c3e50; font-size: 14px; margin: 0 0 10px 0; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                        Plant-wise Rakes Dispatch
                    </h4>
                    <div id="pdfPlantRakesSummary" style="font-size: 10px;"></div>
                </div>
                
                <!-- FY Summary -->
                <div style="border: 1px solid #dee2e6; border-radius: 8px; padding: 12px;">
                    <h4 style="color: #2c3e50; font-size: 14px; margin: 0 0 10px 0; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                        Financial Year Summary
                    </h4>
                    <div id="pdfFYSummary" style="font-size: 10px;"></div>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; font-size: 10px; color: #6c757d; border-top: 1px solid #eee; padding-top: 10px;">
                Generated on: ${new Date().toLocaleString('en-GB')} | Pachwara Central Coal Mine Dashboard
            </div>
        `;
        
        document.body.appendChild(dashboardContainer);
        
        // Populate the data in each section
        document.getElementById('pdfOBSummary').innerHTML = generatePDFTableContent('obSummaryData');
        document.getElementById('pdfCoalSummary').innerHTML = generatePDFTableContent('coalSummaryData');
        document.getElementById('pdfStockSummary').innerHTML = generatePDFTableContent('stockSummaryData');
        document.getElementById('pdfDispatchSummary').innerHTML = generatePDFTableContent('dispatchSummaryData');
        document.getElementById('pdfPlantRakesSummary').innerHTML = generatePDFTableContent('plantRakesSummaryData');
        document.getElementById('pdfFYSummary').innerHTML = generatePDFTableContent('fyDispatchSummaryData');
        
        // Generate high-quality PDF
        const canvas = await html2canvas(dashboardContainer, {
            scale: 3, // Increased scale for much higher quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 800,
            height: 1000,
            dpi: 300, // High DPI for professional quality
            letterRendering: true, // Better text rendering
            logging: false, // Disable logging for cleaner console
            imageTimeout: 30000, // Longer timeout for complex content
            removeContainer: true // Clean up temporary elements
        });
        
        // Use maximum quality PNG
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add image with compression settings for quality preservation
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, Math.min(imgHeight, 277), '', 'MEDIUM');
        
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        pdf.save(`Daily_Progress_Report_${yesterdayFormatted.replace(/\//g, '-')}_${dateStr}.pdf`);
        
        // Remove temporary container
        document.body.removeChild(dashboardContainer);
        
    } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Error exporting PDF. Please try again.');
    }
}

// Export all dashboard cards as single high-quality JPG
async function exportAllDashboardToJPG() {
    const html2canvas = window.html2canvas;
    
    if (!html2canvas) {
        alert('Export library not loaded. Please refresh the page and try again.');
        return;
    }
    
    try {
        // Create a temporary container with all card data
        const dashboardContainer = document.createElement('div');
        dashboardContainer.style.cssText = `
            position: absolute;
            top: -10000px;
            left: -10000px;
            width: 800px;
            background: white;
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;
        
        // Get yesterday's date for the title
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayFormatted = yesterday.toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
        
        // Create the dashboard content (same as PDF)
        dashboardContainer.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #007bff; padding-bottom: 15px;">
                <h2 style="color: #2c3e50; margin: 0; font-size: 20px; font-weight: 700;">
                    Daily Progress Report of Pachwara Central Coal Mine
                </h2>
                <h3 style="color: #6c757d; margin: 5px 0 0 0; font-size: 16px; font-weight: 500;">
                    Date: ${yesterdayFormatted}
                </h3>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <div style="border: 1px solid #dee2e6; border-radius: 8px; padding: 12px;">
                    <h4 style="color: #2c3e50; font-size: 14px; margin: 0 0 10px 0; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                        OB Production Summary
                    </h4>
                    <div id="jpgOBSummary" style="font-size: 10px;"></div>
                </div>
                <div style="border: 1px solid #dee2e6; border-radius: 8px; padding: 12px;">
                    <h4 style="color: #2c3e50; font-size: 14px; margin: 0 0 10px 0; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                        Coal Production Summary
                    </h4>
                    <div id="jpgCoalSummary" style="font-size: 10px;"></div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <div style="border: 1px solid #dee2e6; border-radius: 8px; padding: 12px;">
                    <h4 style="color: #2c3e50; font-size: 14px; margin: 0 0 10px 0; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                        Closing Stock Summary
                    </h4>
                    <div id="jpgStockSummary" style="font-size: 10px;"></div>
                </div>
                <div style="border: 1px solid #dee2e6; border-radius: 8px; padding: 12px;">
                    <h4 style="color: #2c3e50; font-size: 14px; margin: 0 0 10px 0; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                        Dispatch Summary
                    </h4>
                    <div id="jpgDispatchSummary" style="font-size: 10px;"></div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="border: 1px solid #dee2e6; border-radius: 8px; padding: 12px;">
                    <h4 style="color: #2c3e50; font-size: 14px; margin: 0 0 10px 0; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                        Plant-wise Rakes Dispatch
                    </h4>
                    <div id="jpgPlantRakesSummary" style="font-size: 10px;"></div>
                </div>
                <div style="border: 1px solid #dee2e6; border-radius: 8px; padding: 12px;">
                    <h4 style="color: #2c3e50; font-size: 14px; margin: 0 0 10px 0; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                        Financial Year Summary
                    </h4>
                    <div id="jpgFYSummary" style="font-size: 10px;"></div>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; font-size: 10px; color: #6c757d; border-top: 1px solid #eee; padding-top: 10px;">
                Generated on: ${new Date().toLocaleString('en-GB')} | Pachwara Central Coal Mine Dashboard
            </div>
        `;
        
        document.body.appendChild(dashboardContainer);
        
        // Populate the data in each section
        document.getElementById('jpgOBSummary').innerHTML = generatePDFTableContent('obSummaryData');
        document.getElementById('jpgCoalSummary').innerHTML = generatePDFTableContent('coalSummaryData');
        document.getElementById('jpgStockSummary').innerHTML = generatePDFTableContent('stockSummaryData');
        document.getElementById('jpgDispatchSummary').innerHTML = generatePDFTableContent('dispatchSummaryData');
        document.getElementById('jpgPlantRakesSummary').innerHTML = generatePDFTableContent('plantRakesSummaryData');
        document.getElementById('jpgFYSummary').innerHTML = generatePDFTableContent('fyDispatchSummaryData');
        
        // Generate high-quality image
        const canvas = await html2canvas(dashboardContainer, {
            scale: 2.5, // High quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 800,
            height: 1000
        });
        
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            
            a.href = url;
            a.download = `Daily_Progress_Report_${yesterdayFormatted.replace(/\//g, '-')}_${dateStr}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/jpeg', 0.95); // High quality JPEG
        
        // Remove temporary container
        document.body.removeChild(dashboardContainer);
        
    } catch (error) {
        console.error('Error exporting JPG:', error);
        alert('Error exporting JPG. Please try again.');
    }
}

// Helper function to generate table content for PDF/JPG export
function generatePDFTableContent(tableId) {
    const tableElement = document.getElementById(tableId);
    if (!tableElement) return '<p>No data available</p>';
    
    const table = tableElement.cloneNode(true);
    
    // Apply compact styles for PDF
    table.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        font-size: 9px;
        margin: 0;
    `;
    
    const cells = table.querySelectorAll('td, th');
    cells.forEach(cell => {
        cell.style.cssText = `
            border: 1px solid #ddd;
            padding: 3px 4px;
            text-align: center;
            vertical-align: middle;
            font-size: 9px;
            line-height: 1.2;
        `;
    });
    
    const headers = table.querySelectorAll('th');
    headers.forEach(header => {
        header.style.backgroundColor = '#f8f9fa';
        header.style.fontWeight = '600';
    });
    
    return table.outerHTML;
}

// Export card as PDF with high quality
async function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const html2canvas = window.html2canvas;
    
    if (!jsPDF || !html2canvas) {
        alert('Export libraries not loaded. Please refresh the page and try again.');
        return;
    }
    
    try {
        const cardElement = document.querySelector('.custom-card');
        const canvas = await html2canvas(cardElement, {
            scale: 4, // Increased scale for higher quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: cardElement.offsetWidth,
            height: cardElement.offsetHeight,
            dpi: 300, // High DPI for crisp text and graphics
            letterRendering: true, // Better text rendering
            logging: false, // Disable logging for cleaner console
            imageTimeout: 30000, // Longer timeout for complex content
            removeContainer: true // Clean up temporary elements
        });
        
        // Use higher quality image format
        const imgData = canvas.toDataURL('image/png', 1.0); // Maximum quality PNG
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 190;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 10;
        
        // Add image with compression settings for quality preservation
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight, '', 'MEDIUM');
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight, '', 'MEDIUM');
            heightLeft -= pageHeight;
        }
        
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        pdf.save(`OB_Production_Dashboard_${dateStr}.pdf`);
    } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Error exporting PDF. Please try again.');
    }
}

// Export card as high-quality JPG
async function exportToJPG() {
    const html2canvas = window.html2canvas;
    
    if (!html2canvas) {
        alert('Export library not loaded. Please refresh the page and try again.');
        return;
    }
    
    try {
        const cardElement = document.querySelector('.custom-card');
        const canvas = await html2canvas(cardElement, {
            scale: 3, // High quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: cardElement.offsetWidth,
            height: cardElement.offsetHeight
        });
        
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            
            a.href = url;
            a.download = `OB_Production_Dashboard_${dateStr}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/jpeg', 0.95); // High quality JPEG
    } catch (error) {
        console.error('Error exporting JPG:', error);
        alert('Error exporting JPG. Please try again.');
    }
}

// Get coal data for specific duration
function getCoalDataForDuration(days) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    return PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate >= startDate && rowDate <= endDate;
    }).sort((a, b) => parseDMY(a[0]) - parseDMY(b[0]));
}

// Update Coal Production chart
function updateCoalChart() {
    const selectedDays = parseInt(document.querySelector('input[name="coalDuration"]:checked').value);
    const data = getCoalDataForDuration(selectedDays);
    
    const labels = data.map(row => formatDate(row[0]));
    const actualData = data.map(row => Number(row[3]) || 0); // Coal Actual Production (Column 3)
    const targetData = data.map(row => Number(row[2]) || 0); // Coal Production Target (Column 2)
    const percentageData = data.map(row => {
        const actual = Number(row[3]) || 0;
        const target = Number(row[2]) || 0;
        return target > 0 ? ((actual / target) * 100) : 0;
    });
    
    // Show only every nth label to avoid overcrowding
    const labelStep = Math.max(1, Math.floor(labels.length / 10));
    const displayLabels = labels.map((label, index) => 
        index % labelStep === 0 ? label : ''
    );
    
    if (coalChart) {
        coalChart.data.labels = displayLabels;
        coalChart.data.datasets[0].data = actualData;
        coalChart.data.datasets[1].data = targetData;
        coalChart.data.datasets[2].data = percentageData;
        coalChart.update();
    } else {
        const ctx = document.getElementById('coalDataChart').getContext('2d');
        coalChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: displayLabels,
                datasets: [
                    {
                        label: 'Coal Actual Production',
                        data: actualData,
                        borderColor: '#dc3545',
                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                        tension: 0.3,
                        fill: false,
                        pointRadius: 1,
                        pointHoverRadius: 5,
                        borderWidth: 1.5,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Coal Production Target',
                        data: targetData,
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        tension: 0.3,
                        fill: false,
                        pointRadius: 1,
                        pointHoverRadius: 5,                     
                        borderWidth: 1.5,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Achievement %',
                        data: percentageData,
                        borderColor: '#fd7e14',
                        backgroundColor: 'rgba(253, 126, 20, 0.1)',
                        tension: 0.3,
                        fill: false,
                        pointRadius: 2,
                        pointHoverRadius: 4,
                        borderWidth: 1.5,
                        yAxisID: 'y1'
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
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                if (context.datasetIndex === 2) {
                                    return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
                                }
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} MT`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Date',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            maxRotation: 45,
                            font: {
                                size: 10
                            }
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Production (MT)',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                        beginAtZero: true,
                        ticks: {
                            font: {
                                size: 10
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Achievement (%)',
                            font: {
                                size: 12,
                                weight: 'bold'
                            },
                            color: '#fd7e14'
                        },
                        beginAtZero: true,
                        max: 150,
                        ticks: {
                            font: {
                                size: 10
                            },
                            color: '#fd7e14'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }
}

// Update OB Production chart
function updateOBChart() {
    const selectedDays = parseInt(document.querySelector('input[name="duration"]:checked').value);
    const data = getOBDataForDuration(selectedDays);
    
    const labels = data.map(row => formatDate(row[0]));
    const actualData = data.map(row => Number(row[10]) || 0); // OB Actual Production (Column K)
    const targetData = data.map(row => Number(row[9]) || 0); // OB Production Target (Column J)
    const percentageData = data.map(row => {
        const actual = Number(row[10]) || 0;
        const target = Number(row[9]) || 0;
        return target > 0 ? ((actual / target) * 100) : 0;
    });
    
    // Show only every nth label to avoid overcrowding
    const labelStep = Math.max(1, Math.floor(labels.length / 10));
    const displayLabels = labels.map((label, index) => 
        index % labelStep === 0 ? label : ''
    );
    
    if (obChart) {
        obChart.data.labels = displayLabels;
        obChart.data.datasets[0].data = actualData;
        obChart.data.datasets[1].data = targetData;
        obChart.data.datasets[2].data = percentageData;
        obChart.update();
    } else {
        const ctx = document.getElementById('obDataChart').getContext('2d');
        obChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: displayLabels,
                datasets: [
                    {
                        label: 'OB Actual Production',
                        data: actualData,
                        borderColor: '#dc3545',
                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                        tension: 0.3,
                        fill: false,
                        pointRadius: 1,
                        pointHoverRadius: 5,
                        borderWidth: 1.5,
                        yAxisID: 'y'
                    },
                    {
                        label: 'OB Production Target',
                        data: targetData,
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        tension: 0.3,
                        fill: false,
                        pointRadius: 1,
                        pointHoverRadius: 5,
                        borderWidth: 1.5,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Achievement %',
                        data: percentageData,
                        borderColor: '#fd7e14',
                        backgroundColor: 'rgba(253, 126, 20, 0.1)',
                        tension: 0.3,
                        fill: false,
                        pointRadius: 2,
                        pointHoverRadius: 4,
                        borderWidth: 1.5,
                        yAxisID: 'y1'
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
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                if (context.datasetIndex === 2) {
                                    return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
                                }
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} MT`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Date',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            maxRotation: 45,
                            font: {
                                size: 10
                            }
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Production (MT)',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                        beginAtZero: true,
                        ticks: {
                            font: {
                                size: 10
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Achievement (%)',
                            font: {
                                size: 12,
                                weight: 'bold'
                            },
                            color: '#fd7e14'
                        },
                        beginAtZero: true,
                        max: 150,
                        ticks: {
                            font: {
                                size: 10
                            },
                            color: '#fd7e14'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }
}

// Update both summary and chart
function updateOBData() {
    updateOBSummary();
    updateOBChart();
}

// Initialize the dashboard
function showPachhwaraDashboard() {
    // Get yesterday's date for the header
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayFormatted = yesterday.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    });
    
    document.getElementById('main-content').innerHTML = `
        <div class="container py-4">
            <div class="row justify-content-center">
                <div class="col-lg-10">
                    <!-- Header Card -->
                    <div class="card custom-card mb-4" id="headerCard" style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); border: none;">
                        <div class="card-body text-center" style="padding: 15px;">
                            <h2 class="card-title mb-2" style="color: white; font-weight: 700; font-size: 24px; margin: 0;">
                                Daily Progress Report of Pachwara Central Coal Mine
                            </h2>
                            <h4 class="mb-0" style="color: #e3f2fd; font-weight: 500; font-size: 18px; margin: 5px 0 0 0;">
                                Date: ${yesterdayFormatted}
                            </h4>
                        </div>
                    </div>
                    
                    <!-- Export Buttons -->
                    <div class="d-flex justify-content-end mb-3">
                        <button class="btn btn-outline-danger btn-sm me-2" onclick="exportAllDashboardToPDF()" title="Export All Data as PDF" style="padding: 6px 10px;">
                            <i class="bi bi-file-earmark-pdf" style="font-size: 14px;"></i>
                        </button>
                        <button class="btn btn-outline-success btn-sm" onclick="exportAllDashboardToJPG()" title="Export All Data as High Quality JPG" style="padding: 6px 10px;">
                            <i class="bi bi-file-earmark-image" style="font-size: 14px;"></i>
                        </button>
                    </div>
                    
                    <!-- Stock Card -->
                    <div class="card custom-card mb-4" id="stockCard">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="card-title mb-0" style="color: #2c3e50; font-weight: 600;">
                                    <i class="bi bi-box-seam-fill" style="color: #17a2b8;"></i>
                                    Closing Stock Summary
                                </h5>
                                <small class="text-muted" style="font-size: 11px; font-weight: 500;">Units: MT</small>
                            </div>
                            
                            <table class="table table-sm table-striped mb-0" id="stockSummaryData" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                <tbody>
                                    <tr><td colspan="4" class="text-center">Loading data...</td></tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="text-center mb-3">
                            <button type="button" class="btn btn-link toggle-arrow p-0" id="stockToggleArrow" onclick="toggleStockCard()" style="font-size: 18px; text-decoration: none;">
                                <i class="bi bi-chevron-down" style="color: #007bff;"></i>
                            </button>
                        </div>
                        
                        <div id="stockExpandableContent" style="display: none;">
                            <div class="card-body pt-0">
                                <div class="mb-3">
                                    <div class="btn-group btn-group-sm" role="group" style="font-size: 12px;">
                                        <input type="radio" class="btn-check" name="stockDuration" id="stock7days" value="7" checked onchange="handleStockDurationChange(event)">
                                        <label class="btn btn-outline-primary" for="stock7days" style="padding: 4px 12px; font-size: 11px;">7 Days</label>
                                        
                                        <input type="radio" class="btn-check" name="stockDuration" id="stock30days" value="30" onchange="handleStockDurationChange(event)">
                                        <label class="btn btn-outline-primary" for="stock30days" style="padding: 4px 12px; font-size: 11px;">30 Days</label>
                                        
                                        <input type="radio" class="btn-check" name="stockDuration" id="stock90days" value="90" onchange="handleStockDurationChange(event)">
                                        <label class="btn btn-outline-primary" for="stock90days" style="padding: 4px 12px; font-size: 11px;">90 Days</label>
                                        
                                        <input type="radio" class="btn-check" name="stockDuration" id="stock180days" value="180" onchange="handleStockDurationChange(event)">
                                        <label class="btn btn-outline-primary" for="stock180days" style="padding: 4px 12px; font-size: 11px;">180 Days</label>
                                        
                                        <input type="radio" class="btn-check" name="stockDuration" id="stock365days" value="365" onchange="handleStockDurationChange(event)">
                                        <label class="btn btn-outline-primary" for="stock365days" style="padding: 4px 12px; font-size: 11px;">365 Days</label>
                                    </div>
                                    
                                    <div class="float-end">
                                        <button class="btn btn-outline-danger btn-sm me-2" onclick="exportStockToPDF()" title="Export as PDF">
                                            <i class="bi bi-file-earmark-pdf"></i>
                                        </button>
                                        <button class="btn btn-outline-success btn-sm" onclick="exportStockToJPG()" title="Export as JPG">
                                            <i class="bi bi-file-earmark-image"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <div style="height: 300px; position: relative;">
                                    <canvas id="stockDataChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- OB Production Card -->
                    <div class="card custom-card mb-4">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="card-title mb-0" style="color: #2c3e50; font-weight: 600;">
                                    <i class="bi bi-bar-chart-fill" style="color: #e74c3c;"></i>
                                    OB Production
                                </h5>
                                <small class="text-muted" style="font-size: 11px; font-weight: 500;">Units: MT</small>
                            </div>
                            
                            <table class="table table-sm table-striped mb-0" id="obSummaryData" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                <tbody>
                                    <tr><td colspan="4" class="text-center">Loading data...</td></tr>
                                </tbody>
                            </table>
                            
                            <!-- Toggle Arrow -->
                            <div class="text-center mt-3">
                                <button class="btn btn-link p-0 toggle-arrow" onclick="toggleOBCard()" id="obToggleArrow">
                                    <i class="bi bi-chevron-down" style="font-size: 1.2rem; color: #6c757d;"></i>
                                </button>
                            </div>
                            
                            <div id="obExpandableContent" class="card-expanded mt-4">
                                <div class="mb-4">
                                    <label class="form-label fw-bold">Select Duration:</label><br>
                                    <div class="btn-group flex-wrap" role="group" aria-label="Duration selection">
                                        <input type="radio" class="btn-check" name="duration" id="duration7" value="7" checked onchange="handleDurationChange(event)">
                                        <label class="btn btn-outline-primary btn-sm" for="duration7">7 Days</label>
                                        
                                        <input type="radio" class="btn-check" name="duration" id="duration15" value="15" onchange="handleDurationChange(event)">
                                        <label class="btn btn-outline-primary btn-sm" for="duration15">15 Days</label>
                                        
                                        <input type="radio" class="btn-check" name="duration" id="duration30" value="30" onchange="handleDurationChange(event)">
                                        <label class="btn btn-outline-primary btn-sm" for="duration30">1 Month</label>
                                        
                                        <input type="radio" class="btn-check" name="duration" id="duration60" value="60" onchange="handleDurationChange(event)">
                                        <label class="btn btn-outline-primary btn-sm" for="duration60">2 Months</label>
                                        
                                        <input type="radio" class="btn-check" name="duration" id="duration90" value="90" onchange="handleDurationChange(event)">
                                        <label class="btn btn-outline-primary btn-sm" for="duration90">3 Months</label>
                                        
                                        <input type="radio" class="btn-check" name="duration" id="duration180" value="180" onchange="handleDurationChange(event)">
                                        <label class="btn btn-outline-primary btn-sm" for="duration180">6 Months</label>
                                        
                                        <input type="radio" class="btn-check" name="duration" id="duration365" value="365" onchange="handleDurationChange(event)">
                                        <label class="btn btn-outline-primary btn-sm" for="duration365">1 Year</label>
                                    </div>
                                </div>
                                
                                <div class="chart-container mb-3">
                                    <canvas id="obDataChart"></canvas>
                                </div>
                                
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <div class="text-center flex-grow-1">
                                        <small class="text-muted">
                                            <i class="bi bi-info-circle"></i>
                                            Red: Actual Production, Green: Target, Orange: Achievement %
                                        </small>
                                    </div>
                                    <div class="export-buttons">
                                        <button class="btn btn-outline-danger btn-sm me-2" onclick="exportToPDF()" title="Export as PDF">
                                            <i class="bi bi-file-earmark-pdf"></i> PDF
                                        </button>
                                        <button class="btn btn-outline-success btn-sm" onclick="exportToJPG()" title="Export as JPG">
                                            <i class="bi bi-file-earmark-image"></i> JPG
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Coal Production Card -->
                    <div class="card custom-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="card-title mb-0" style="color: #2c3e50; font-weight: 600;">
                                    <i class="bi bi-minecart-loaded" style="color: #6f4e37;"></i>
                                    Coal Production
                                </h5>
                                <small class="text-muted" style="font-size: 11px; font-weight: 500;">Units: MT</small>
                            </div>
                            
                            <table class="table table-sm table-striped mb-0" id="coalSummaryData" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                <tbody>
                                    <tr><td colspan="4" class="text-center">Loading data...</td></tr>
                                </tbody>
                            </table>
                            
                            <!-- Toggle Arrow -->
                            <div class="text-center mt-3">
                                <button class="btn btn-link p-0 toggle-arrow" onclick="toggleCoalCard()" id="coalToggleArrow">
                                    <i class="bi bi-chevron-down" style="font-size: 1.2rem; color: #6c757d;"></i>
                                </button>
                            </div>
                            
                            <div id="coalExpandableContent" class="card-expanded mt-4">
                                <div class="mb-4">
                                    <label class="form-label fw-bold">Select Duration:</label><br>
                                    <div class="btn-group flex-wrap" role="group" aria-label="Duration selection">
                                        <input type="radio" class="btn-check" name="coalDuration" id="coalDuration7" value="7" checked onchange="handleCoalDurationChange(event)">
                                        <label class="btn btn-outline-primary btn-sm" for="coalDuration7">7 Days</label>
                                        
                                        <input type="radio" class="btn-check" name="coalDuration" id="coalDuration15" value="15" onchange="handleCoalDurationChange(event)">
                                        <label class="btn btn-outline-primary btn-sm" for="coalDuration15">15 Days</label>
                                        
                                        <input type="radio" class="btn-check" name="coalDuration" id="coalDuration30" value="30" onchange="handleCoalDurationChange(event)">
                                        <label class="btn btn-outline-primary btn-sm" for="coalDuration30">1 Month</label>
                                        
                                        <input type="radio" class="btn-check" name="coalDuration" id="coalDuration60" value="60" onchange="handleCoalDurationChange(event)">
                                        <label class="btn btn-outline-primary btn-sm" for="coalDuration60">2 Months</label>
                                        
                                        <input type="radio" class="btn-check" name="coalDuration" id="coalDuration90" value="90" onchange="handleCoalDurationChange(event)">
                                        <label class="btn btn-outline-primary btn-sm" for="coalDuration90">3 Months</label>
                                        
                                        <input type="radio" class="btn-check" name="coalDuration" id="coalDuration180" value="180" onchange="handleCoalDurationChange(event)">
                                        <label class="btn btn-outline-primary btn-sm" for="coalDuration180">6 Months</label>
                                        
                                        <input type="radio" class="btn-check" name="coalDuration" id="coalDuration365" value="365" onchange="handleCoalDurationChange(event)">
                                        <label class="btn btn-outline-primary btn-sm" for="coalDuration365">1 Year</label>
                                    </div>
                                </div>
                                
                                <div class="chart-container mb-3">
                                    <canvas id="coalDataChart"></canvas>
                                </div>
                                
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <div class="text-center flex-grow-1">
                                        <small class="text-muted">
                                            <i class="bi bi-info-circle"></i>
                                            Red: Actual Production, Green: Target, Orange: Achievement %
                                        </small>
                                    </div>
                                    <div class="export-buttons">
                                        <button class="btn btn-outline-danger btn-sm me-2" onclick="exportToPDF()" title="Export as PDF">
                                            <i class="bi bi-file-earmark-pdf"></i> PDF
                                        </button>
                                        <button class="btn btn-outline-success btn-sm" onclick="exportToJPG()" title="Export as JPG">
                                            <i class="bi bi-file-earmark-image"></i> JPG
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Dispatch Card -->
                    <div class="card custom-card mt-4" id="dispatchCard">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="card-title mb-0" style="color: #2c3e50; font-weight: 600;">
                                    <i class="bi bi-truck" style="color: #007bff;"></i>
                                    Dispatch Summary
                                </h5>
                                <div class="export-buttons">
                                    <button class="btn btn-outline-danger btn-sm me-2" onclick="exportDispatchToPDF()" title="Export as PDF">
                                        <i class="bi bi-file-earmark-pdf"></i> PDF
                                    </button>
                                    <button class="btn btn-outline-success btn-sm" onclick="exportDispatchToJPG()" title="Export as JPG">
                                        <i class="bi bi-file-earmark-image"></i> JPG
                                    </button>
                                </div>
                            </div>
                            
                            <table class="table table-sm table-striped mb-0" id="dispatchSummaryData" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                <tbody>
                                    <tr><td colspan="4" class="text-center">Loading data...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <!-- Plant Rakes Dispatch Card -->
                    <div class="card custom-card mt-4" id="plantRakesCard">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="card-title mb-0" style="color: #2c3e50; font-weight: 600;">
                                    <i class="bi bi-train-freight-front" style="color: #28a745;"></i>
                                    Plant-wise Rakes Dispatch
                                </h5>
                                <div class="export-buttons">
                                    <button class="btn btn-outline-danger btn-sm me-2" onclick="exportPlantRakesToPDF()" title="Export as PDF">
                                        <i class="bi bi-file-earmark-pdf"></i> PDF
                                    </button>
                                    <button class="btn btn-outline-success btn-sm" onclick="exportPlantRakesToJPG()" title="Export as JPG">
                                        <i class="bi bi-file-earmark-image"></i> JPG
                                    </button>
                                </div>
                            </div>
                            
                            <table class="table table-sm table-striped mb-0" id="plantRakesSummaryData" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                <tbody>
                                    <tr><td colspan="4" class="text-center">Loading data...</td></tr>
                                </tbody>
                            </table>
                            
                            <div class="text-center mt-3">
                                <button class="btn btn-sm btn-outline-primary" onclick="togglePlantRakesCard()" id="plantRakesToggleArrow">
                                    <i class="bi bi-chevron-down"></i>
                                </button>
                            </div>
                            
                            <div id="plantRakesExpandableContent" style="display: none;" class="mt-3">
                                <div class="row mb-3">
                                    <div class="col-12">
                                        <div class="btn-group w-100" role="group" style="border-radius: 8px;">
                                            <input type="radio" class="btn-check" name="plantRakesPeriod" id="plantRakesCurrentMonth" autocomplete="off" checked>
                                            <label class="btn btn-outline-primary btn-sm" for="plantRakesCurrentMonth" style="font-size: 12px; padding: 8px 12px;">Current Month</label>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Date-wise table -->
                                <div class="mb-3">
                                    <h6 class="text-muted mb-2" style="font-size: 12px; font-weight: 600;">Current Month Date-wise Dispatch</h6>
                                    <div style="max-height: 300px; overflow-y: auto;">
                                        <table class="table table-sm table-striped table-hover" id="plantRakesDateWiseTable" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11px;">
                                            <thead class="table-light sticky-top">
                                                <tr>
                                                    <th style="padding: 6px 8px;">Date</th>
                                                    <th style="padding: 6px 8px; text-align: center;">GGSSTP</th>
                                                    <th style="padding: 6px 8px; text-align: center;">GHTP</th>
                                                    <th style="padding: 6px 8px; text-align: center;">GATP</th>
                                                    <th style="padding: 6px 8px; text-align: center;">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr><td colspan="5" class="text-center">Loading data...</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                
                                <canvas id="plantRakesDataChart" style="max-height: 300px;"></canvas>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Financial Year Dispatch Summary Card -->
                    <div class="card custom-card mt-4" id="fyDispatchCard">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="card-title mb-0" style="color: #2c3e50; font-weight: 600;">
                                    <i class="bi bi-calendar-range" style="color: #6f42c1;"></i>
                                    Financial Year Dispatch Summary
                                </h5>
                                <div class="export-buttons">
                                    <button class="btn btn-outline-danger btn-sm me-2" onclick="exportFYDispatchToPDF()" title="Export as PDF">
                                        <i class="bi bi-file-earmark-pdf"></i> PDF
                                    </button>
                                    <button class="btn btn-outline-success btn-sm" onclick="exportFYDispatchToJPG()" title="Export as JPG">
                                        <i class="bi bi-file-earmark-image"></i> JPG
                                    </button>
                                </div>
                            </div>
                            
                            <table class="table table-sm table-striped mb-0" id="fyDispatchSummaryData" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                <tbody>
                                    <tr><td colspan="3" class="text-center">Loading data...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            .custom-card {
                border-radius: 12px;
                border: 1px solid #dee2e6;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                transition: box-shadow 0.3s;
                background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            }
            
            .custom-card:hover {
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
            }
            
            .toggle-arrow {
                border: none !important;
                background: none !important;
                transition: transform 0.3s ease;
            }
            
            .toggle-arrow:hover {
                transform: scale(1.1);
            }
            
            .toggle-arrow:focus {
                box-shadow: none !important;
            }
            
            .card-expanded {
                display: none;
            }
            
            .chart-container {
                position: relative;
                height: 300px;
                background: white;
                border-radius: 8px;
                padding: 15px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .form-check-inline {
                margin-right: 1rem;
                margin-bottom: 0.5rem;
            }
            
            .btn-group {
                gap: 0.25rem;
            }
            
            .btn-group .btn-sm {
                font-size: 0.75rem;
                padding: 0.25rem 0.5rem;
            }
            
            .export-buttons .btn-sm {
                font-size: 0.7rem;
                padding: 0.2rem 0.4rem;
            }
            
            .export-buttons {
                min-width: 120px;
            }
            
            .card-title {
                color: #2c3e50;
                font-weight: 600;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            
            .table {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            
            .table th {
                background-color: #f8f9fa;
                border-bottom: 2px solid #dee2e6;
                font-weight: 600;
                color: #495057;
            }
            
            .table td {
                border-top: 1px solid #e9ecef;
                color: #6c757d;
            }
            
            @media (max-width: 768px) {
                .chart-container {
                    height: 250px;
                    padding: 10px;
                }
                
                .form-check-inline {
                    display: block;
                    margin-right: 0;
                }
                
                .col-md-6 {
                    margin-bottom: 1rem;
                }
            }
        </style>
    `;

    // Load required libraries for export functionality
    if (!window.jspdf) {
        const jsPDFScript = document.createElement('script');
        jsPDFScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        document.head.appendChild(jsPDFScript);
    }
    
    if (!window.html2canvas) {
        const html2canvasScript = document.createElement('script');
        html2canvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        document.head.appendChild(html2canvasScript);
    }

    // Load data and initialize dashboard
    fetchPachhwaraDashboardHeaders().then(() => {
        fetchPachhwaraDashboardData().then(() => {
            updateStockSummary();
            updateOBSummary();
            updateCoalSummary();
            updateDispatchSummary();
            updatePlantRakesSummary();
            updateFYDispatchSummary();
            console.log("Pachhwara Dashboard initialized successfully");
        }).catch(err => {
            console.error("Error loading data:", err);
            document.getElementById('stockSummaryData').innerHTML = `
                <tbody>
                    <tr><td colspan="4" class="text-danger text-center">Error loading data: ${err.message}</td></tr>
                </tbody>
            `;
            document.getElementById('obSummaryData').innerHTML = `
                <tbody>
                    <tr><td colspan="4" class="text-danger text-center">Error loading data: ${err.message}</td></tr>
                </tbody>
            `;
            document.getElementById('coalSummaryData').innerHTML = `
                <tbody>
                    <tr><td colspan="4" class="text-danger text-center">Error loading data: ${err.message}</td></tr>
                </tbody>
            `;
            document.getElementById('dispatchSummaryData').innerHTML = `
                <tbody>
                    <tr><td colspan="4" class="text-danger text-center">Error loading data: ${err.message}</td></tr>
                </tbody>
            `;
            document.getElementById('plantRakesSummaryData').innerHTML = `
                <tbody>
                    <tr><td colspan="4" class="text-danger text-center">Error loading data: ${err.message}</td></tr>
                </tbody>
            `;
            document.getElementById('fyDispatchSummaryData').innerHTML = `
                <tbody>
                    <tr><td colspan="3" class="text-danger text-center">Error loading data: ${err.message}</td></tr>
                </tbody>
            `;
        });
    }).catch(err => {
        console.error("Error loading headers:", err);
        document.getElementById('obSummaryData').innerHTML = `
            <tbody>
                <tr><td colspan="4" class="text-danger text-center">Error loading headers: ${err.message}</td></tr>
            </tbody>
        `;
        document.getElementById('coalSummaryData').innerHTML = `
            <tbody>
                <tr><td colspan="4" class="text-danger text-center">Error loading headers: ${err.message}</td></tr>
            </tbody>
        `;
        document.getElementById('dispatchSummaryData').innerHTML = `
            <tbody>
                <tr><td colspan="4" class="text-danger text-center">Error loading headers: ${err.message}</td></tr>
            </tbody>
        `;
        document.getElementById('plantRakesSummaryData').innerHTML = `
            <tbody>
                <tr><td colspan="4" class="text-danger text-center">Error loading headers: ${err.message}</td></tr>
            </tbody>
        `;
        document.getElementById('fyDispatchSummaryData').innerHTML = `
            <tbody>
                <tr><td colspan="3" class="text-danger text-center">Error loading headers: ${err.message}</td></tr>
            </tbody>
        `;
    });
}

// Make functions globally available
window.toggleOBCard = toggleOBCard;
window.toggleCoalCard = toggleCoalCard;
window.updateOBData = updateOBData;
window.updateOBDataOnly = updateOBDataOnly;
window.handleDurationChange = handleDurationChange;
window.handleCoalDurationChange = handleCoalDurationChange;
window.handleStockDurationChange = handleStockDurationChange;
window.toggleStockCard = toggleStockCard;
window.exportToPDF = exportToPDF;
window.exportToJPG = exportToJPG;
window.exportStockToPDF = exportStockToPDF;
window.exportStockToJPG = exportStockToJPG;
window.exportDispatchToPDF = exportDispatchToPDF;
window.exportDispatchToJPG = exportDispatchToJPG;
window.togglePlantRakesCard = togglePlantRakesCard;
window.exportPlantRakesToPDF = exportPlantRakesToPDF;
window.exportPlantRakesToJPG = exportPlantRakesToJPG;
window.exportFYDispatchToPDF = exportFYDispatchToPDF;
window.exportFYDispatchToJPG = exportFYDispatchToJPG;
window.exportAllDashboardToPDF = exportAllDashboardToPDF;
window.exportAllDashboardToJPG = exportAllDashboardToJPG;
window.showPachhwaraDashboard = showPachhwaraDashboard;
