// Pachhwara OB Production Dashboard
let PachhwaraDashboardData = [];
let PachhwaraDashboardHeaders = [];
let obChart = null;
let coalChart = null;
let strippingRatioChart = null;
let stockChart = null;
let plantRakesChart = null;

// Helper function to format numbers with commas
function formatNumber(value, decimals = 2) {
    if (value === null || value === undefined || isNaN(value)) return '0';
    if (decimals === 0) {
        return Math.round(Number(value)).toLocaleString();
    }
    return Number(value).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

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
        // PERMANENT SOLUTION: Use open-ended range to automatically fetch ALL data
        // A3:W (no row limit) will fetch from row 3 to the last row with data
        const RANGE = 'A3:W'; // Auto-expands as new data is added daily
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

// Get financial year from a date
function getFYFromDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-based
    return month >= 3 ? year : year - 1; // FY starts from April (month 3)
}

// Get all available financial years from data dynamically
function getAvailableFinancialYears() {
    if (!PachhwaraDashboardData || PachhwaraDashboardData.length === 0) {
        return [];
    }
    
    const fySet = new Set();
    
    PachhwaraDashboardData.forEach(row => {
        const rowDate = parseDMY(row[0]);
        if (rowDate && !isNaN(rowDate.getTime())) {
            const fy = getFYFromDate(rowDate);
            fySet.add(fy);
        }
    });
    
    // Convert to array and sort in descending order (latest first)
    return Array.from(fySet).sort((a, b) => b - a);
}

// Get date range for the entire dataset
function getDataDateRange() {
    if (!PachhwaraDashboardData || PachhwaraDashboardData.length === 0) {
        return { startDate: new Date(), endDate: new Date() };
    }
    
    let minDate = new Date();
    let maxDate = new Date(0);
    
    PachhwaraDashboardData.forEach(row => {
        const rowDate = parseDMY(row[0]);
        if (rowDate && !isNaN(rowDate.getTime())) {
            if (rowDate < minDate) minDate = rowDate;
            if (rowDate > maxDate) maxDate = rowDate;
        }
    });
    
    return { startDate: minDate, endDate: maxDate };
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
    const selectedDateStr = getSelectedDate();
    const selectedDateObj = new Date(selectedDateStr);
    
    const todayData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate.toDateString() === selectedDateObj.toDateString();
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
    const selectedDateStr = getSelectedDate();
    const selectedDateObj = new Date(selectedDateStr);
    const currentMonth = selectedDateObj.getMonth();
    const currentYear = selectedDateObj.getFullYear();
    
    const monthData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate.getMonth() === currentMonth && 
               rowDate.getFullYear() === currentYear &&
               rowDate <= selectedDateObj; // Only include dates up to selected date
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
    const selectedDateStr = getSelectedDate();
    const selectedDateObj = new Date(selectedDateStr);
    const currentYear = selectedDateObj.getFullYear();
    const currentMonth = selectedDateObj.getMonth(); // 0-based
    
    // Financial year starts from April (month 3 in 0-based)
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyStartDate = new Date(fyStartYear, 3, 1); // April 1st
    const fyEndDate = new Date(fyStartYear + 1, 2, 31); // March 31st
    
    const fyData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate >= fyStartDate && 
               rowDate <= fyEndDate &&
               rowDate <= selectedDateObj; // Only include dates up to selected date
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
    const selectedDateStr = getSelectedDate();
    const selectedDateObj = new Date(selectedDateStr);
    
    const todayData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate.toDateString() === selectedDateObj.toDateString();
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
    const selectedDateStr = getSelectedDate();
    const selectedDateObj = new Date(selectedDateStr);
    const currentMonth = selectedDateObj.getMonth();
    const currentYear = selectedDateObj.getFullYear();
    
    const monthData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate.getMonth() === currentMonth && 
               rowDate.getFullYear() === currentYear &&
               rowDate <= selectedDateObj; // Only include dates up to selected date
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
    const selectedDateStr = getSelectedDate();
    const selectedDateObj = new Date(selectedDateStr);
    const currentYear = selectedDateObj.getFullYear();
    const currentMonth = selectedDateObj.getMonth(); // 0-based
    
    // Financial year starts from April (month 3 in 0-based)
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyStartDate = new Date(fyStartYear, 3, 1); // April 1st
    const fyEndDate = new Date(fyStartYear + 1, 2, 31); // March 31st
    
    const fyData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate >= fyStartDate && 
               rowDate <= fyEndDate &&
               rowDate <= selectedDateObj; // Only include dates up to selected date
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

// Get today's stripping ratio data
function getTodayStrippingRatioData() {
    const selectedDateStr = getSelectedDate();
    const selectedDateObj = new Date(selectedDateStr);
    const selectedDateData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]); // Date column
        return rowDate.toDateString() === selectedDateObj.toDateString();
    });
    
    let totalOBActual = 0;
    let totalCoalActual = 0;
    
    selectedDateData.forEach(row => {
        totalOBActual += Number(row[10]) || 0; // OB Actual Production
        totalCoalActual += Number(row[3]) || 0; // Coal Actual Production
    });
    
    const strippingRatio = totalCoalActual > 0 ? (totalOBActual / totalCoalActual) : 0;
    
    return { totalOBActual, totalCoalActual, strippingRatio };
}

// Get current month's stripping ratio data
function getCurrentMonthStrippingRatioData() {
    const selectedDateStr = getSelectedDate();
    const selectedDateObj = new Date(selectedDateStr);
    const currentMonth = selectedDateObj.getMonth();
    const currentYear = selectedDateObj.getFullYear();
    
    // Filter data for current month up to selected date
    const monthData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate.getMonth() === currentMonth && 
               rowDate.getFullYear() === currentYear &&
               rowDate <= selectedDateObj;
    });
    
    let totalOBActual = 0;
    let totalCoalActual = 0;
    
    monthData.forEach(row => {
        totalOBActual += Number(row[10]) || 0; // OB Actual Production
        totalCoalActual += Number(row[3]) || 0; // Coal Actual Production
    });
    
    const strippingRatio = totalCoalActual > 0 ? (totalOBActual / totalCoalActual) : 0;
    
    return { totalOBActual, totalCoalActual, strippingRatio };
}

// Get current financial year's stripping ratio data
function getCurrentFYStrippingRatioData() {
    const selectedDateStr = getSelectedDate();
    const selectedDateObj = new Date(selectedDateStr);
    const currentMonth = selectedDateObj.getMonth();
    const currentYear = selectedDateObj.getFullYear();
    
    // Determine FY start date
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyStartDate = new Date(fyStartYear, 3, 1); // April 1st (month 3 in 0-based)
    
    // Filter data for FY up to selected date
    const fyData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate >= fyStartDate && rowDate <= selectedDateObj;
    });
    
    let totalOBActual = 0;
    let totalCoalActual = 0;
    
    fyData.forEach(row => {
        totalOBActual += Number(row[10]) || 0; // OB Actual Production
        totalCoalActual += Number(row[3]) || 0; // Coal Actual Production
    });
    
    const strippingRatio = totalCoalActual > 0 ? (totalOBActual / totalCoalActual) : 0;
    
    return { totalOBActual, totalCoalActual, strippingRatio };
}

// Get stripping ratio data for specific FY
function getFYStrippingRatioData(fyStartYear) {
    const fyStartDate = new Date(fyStartYear, 3, 1); // April 1st (month 3 in 0-based)
    const fyEndDate = new Date(fyStartYear + 1, 2, 31); // March 31st (month 2 in 0-based)
    
    // Check if this is current FY dynamically
    const currentFY = getFYFromDate(new Date());
    const isCurrentFY = fyStartYear === currentFY;
    const endDate = isCurrentFY ? new Date() : fyEndDate;
    
    const fyData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate >= fyStartDate && rowDate <= endDate;
    });
    
    let totalOBActual = 0;
    let totalCoalActual = 0;
    
    fyData.forEach(row => {
        totalOBActual += Number(row[10]) || 0; // OB Actual Production
        totalCoalActual += Number(row[3]) || 0; // Coal Actual Production
    });
    
    const strippingRatio = totalCoalActual > 0 ? (totalOBActual / totalCoalActual) : 0;
    
    return { totalOBActual, totalCoalActual, strippingRatio, fyYear: `${fyStartYear}-${(fyStartYear + 1).toString().substr(-2)}` };
}

// Get cumulative stripping ratio data from earliest available date to current date
function getCumulativeStrippingRatioData() {
    const { startDate, endDate } = getDataDateRange();
    
    const cumulativeData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate >= startDate && rowDate <= new Date(); // Up to current date
    });
    
    let totalOBActual = 0;
    let totalCoalActual = 0;
    
    cumulativeData.forEach(row => {
        totalOBActual += Number(row[10]) || 0; // OB Actual Production
        totalCoalActual += Number(row[3]) || 0; // Coal Actual Production
    });
    
    const strippingRatio = totalCoalActual > 0 ? (totalOBActual / totalCoalActual) : 0;
    
    // Create dynamic label based on actual date range
    const startFY = getFYFromDate(startDate);
    const currentFY = getFYFromDate(new Date());
    const label = startFY === currentFY ? 
        `${startFY}-${(startFY + 1).toString().substr(-2)} (Up to Date)` :
        `${startFY}-${(currentFY + 1).toString().substr(-2)} (Up to Date)`;
    
    return { totalOBActual, totalCoalActual, strippingRatio, label };
}

// Update OB summary table
function updateOBSummary() {
    const todayData = getTodayOBData();
    const monthData = getCurrentMonthOBData();
    const fyData = getCurrentFYOBData();
    
    // Get current date info
    const selectedDateStr = getSelectedDate();
    const selectedDateObj = new Date(selectedDateStr);
    const selectedDateFormatted = selectedDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const currentMonthName = selectedDateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const currentYear = selectedDateObj.getFullYear();
    const currentMonth = selectedDateObj.getMonth();
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyLabel = `${fyStartYear}-${(fyStartYear + 1).toString().slice(-2)}`;
    
    document.getElementById('obSummaryData').innerHTML = `
        <thead class="table-light">
            <tr>
                <th style="width: 40%; font-size: 12px; padding: 8px 12px;">Metrics</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${selectedDateFormatted}</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${currentMonthName} (Up to Date)</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${fyLabel} (Up to Date)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Total Target</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(todayData.totalTarget, 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(monthData.totalTarget, 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(fyData.totalTarget, 0)}</td>
            </tr>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Total Production</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(todayData.totalActual, 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(monthData.totalActual, 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(fyData.totalActual, 0)}</td>
            </tr>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Average Target</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(parseFloat(todayData.avgTarget), 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(parseFloat(monthData.avgTarget), 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(parseFloat(fyData.avgTarget), 0)}</td>
            </tr>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Average Production</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(parseFloat(todayData.avgActual), 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(parseFloat(monthData.avgActual), 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(parseFloat(fyData.avgActual), 0)}</td>
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
    const selectedDateStr = getSelectedDate();
    const selectedDateObj = new Date(selectedDateStr);
    
    const todayData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate.toDateString() === selectedDateObj.toDateString();
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
    const selectedDateStr = getSelectedDate();
    const selectedDateObj = new Date(selectedDateStr);
    const currentMonth = selectedDateObj.getMonth();
    const currentYear = selectedDateObj.getFullYear();
    
    const monthData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate.getMonth() === currentMonth && 
               rowDate.getFullYear() === currentYear &&
               rowDate <= selectedDateObj; // Only include dates up to selected date
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
    const selectedDateStr = getSelectedDate();
    const selectedDateObj = new Date(selectedDateStr);
    const currentYear = selectedDateObj.getFullYear();
    const currentMonth = selectedDateObj.getMonth(); // 0-based
    
    // Financial year starts from April (month 3 in 0-based)
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyStartDate = new Date(fyStartYear, 3, 1); // April 1st
    const fyEndDate = new Date(fyStartYear + 1, 2, 31); // March 31st
    
    const fyData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate >= fyStartDate && 
               rowDate <= fyEndDate &&
               rowDate <= selectedDateObj; // Only include dates up to selected date
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
    const selectedDateStr = getSelectedDate();
    const selectedDateObj = new Date(selectedDateStr);
    const selectedDateFormatted = selectedDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const currentMonthName = selectedDateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const currentYear = selectedDateObj.getFullYear();
    const currentMonth = selectedDateObj.getMonth();
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyLabel = `${fyStartYear}-${(fyStartYear + 1).toString().slice(-2)}`;
    
    document.getElementById('coalSummaryData').innerHTML = `
        <thead class="table-light">
            <tr>
                <th style="width: 40%; font-size: 12px; padding: 8px 12px;">Metrics</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${selectedDateFormatted}</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${currentMonthName} (Up to Date)</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${fyLabel} (Up to Date)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Total Target</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(todayData.totalTarget, 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(monthData.totalTarget, 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(fyData.totalTarget, 0)}</td>
            </tr>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Total Production</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(todayData.totalActual, 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(monthData.totalActual, 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(fyData.totalActual, 0)}</td>
            </tr>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Average Target</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(parseFloat(todayData.avgTarget), 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(parseFloat(monthData.avgTarget), 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(parseFloat(fyData.avgTarget), 0)}</td>
            </tr>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Average Production</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(parseFloat(todayData.avgActual), 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(parseFloat(monthData.avgActual), 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(parseFloat(fyData.avgActual), 0)}</td>
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

// Update Stripping Ratio summary table
function updateStrippingRatioSummary() {
    const todayData = getTodayStrippingRatioData();
    const monthData = getCurrentMonthStrippingRatioData();
    const fyData = getCurrentFYStrippingRatioData();
    
    // Get current date info
    const selectedDateStr = getSelectedDate();
    const selectedDateObj = new Date(selectedDateStr);
    const selectedDateFormatted = selectedDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const currentMonthName = selectedDateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const currentYear = selectedDateObj.getFullYear();
    const currentMonth = selectedDateObj.getMonth();
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyLabel = `${fyStartYear}-${(fyStartYear + 1).toString().slice(-2)}`;
    
    document.getElementById('strippingRatioSummaryData').innerHTML = `
        <thead class="table-light">
            <tr>
                <th style="width: 40%; font-size: 12px; padding: 8px 12px;">Metrics</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${selectedDateFormatted}</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${currentMonthName} (Up to Date)</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${fyLabel} (Up to Date)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">OB Production (MT)</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(todayData.totalOBActual, 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(monthData.totalOBActual, 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(fyData.totalOBActual, 0)}</td>
            </tr>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Coal Production (MT)</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(todayData.totalCoalActual, 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(monthData.totalCoalActual, 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(fyData.totalCoalActual, 0)}</td>
            </tr>
            <tr class="table-info">
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Stripping Ratio</td>
                <td class="text-center" style="font-size: 11px; padding: 6px; font-weight: 600;">${todayData.strippingRatio.toFixed(2)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px; font-weight: 600;">${monthData.strippingRatio.toFixed(2)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px; font-weight: 600;">${fyData.strippingRatio.toFixed(2)}</td>
            </tr>
        </tbody>
    `;

    // Add FY comparison table - Dynamic generation based on available data
    const availableFYs = getAvailableFinancialYears();
    const cumulativeData = getCumulativeStrippingRatioData();
    const currentFY = getFYFromDate(new Date());
    
    // Generate FY data for all available years
    const fyDataMap = {};
    availableFYs.forEach(fy => {
        fyDataMap[fy] = getFYStrippingRatioData(fy);
    });

    // Generate dynamic table rows
    let fyTableRows = '';
    availableFYs.forEach((fy, index) => {
        const fyData = fyDataMap[fy];
        const isCurrentFY = fy === currentFY;
        const fyLabel = `${fy}-${(fy + 1).toString().substr(-2)}${isCurrentFY ? ' (Up to Date)' : ''}`;
        const rowClass = isCurrentFY ? 'table-warning' : '';
        const bgStyle = isCurrentFY ? 'background-color: #fff3cd !important;' : '';
        const fontWeight = isCurrentFY ? '700' : '600';
        
        fyTableRows += `
            <tr class="${rowClass}" style="${bgStyle}">
                <td style="font-weight: ${fontWeight}; font-size: 11px; padding: 6px 12px;">${fyLabel}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px; font-weight: 600;">${formatNumber(fyData.totalOBActual, 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px; font-weight: 600;">${formatNumber(fyData.totalCoalActual, 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px; font-weight: ${fontWeight};">${fyData.strippingRatio.toFixed(2)}</td>
            </tr>`;
    });
    
    // Add cumulative row if data spans multiple FYs
    if (availableFYs.length > 1) {
        fyTableRows += `
            <tr class="table-success" style="background-color: #d1edff !important;">
                <td style="font-weight: 700; font-size: 11px; padding: 6px 12px;">${cumulativeData.label}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px; font-weight: 600;">${formatNumber(cumulativeData.totalOBActual, 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px; font-weight: 600;">${formatNumber(cumulativeData.totalCoalActual, 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px; font-weight: 700;">${cumulativeData.strippingRatio.toFixed(2)}</td>
            </tr>`;
    }

    document.getElementById('strippingRatioFYData').innerHTML = `
        <thead class="table-light">
            <tr>
                <th style="width: 30%; font-size: 12px; padding: 8px 12px;">Financial Year</th>
                <th style="width: 25%; text-align: center; font-size: 12px; padding: 8px 6px;">OB Production (MT)</th>
                <th style="width: 25%; text-align: center; font-size: 12px; padding: 8px 6px;">Coal Production (MT)</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">Stripping Ratio</th>
            </tr>
        </thead>
        <tbody>
            ${fyTableRows}
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

// Toggle stripping ratio card expansion
function toggleStrippingRatioCard() {
    const content = document.getElementById('strippingRatioExpandableContent');
    const arrow = document.getElementById('strippingRatioToggleArrow').querySelector('i');
    const isExpanded = content.style.display === 'block';
    
    content.style.display = isExpanded ? 'none' : 'block';
    arrow.className = isExpanded ? 'bi bi-chevron-down' : 'bi bi-chevron-up';
    
    if (!isExpanded && !strippingRatioChart) {
        updateStrippingRatioChart();
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

// Handle stripping ratio duration changes
function handleStrippingRatioDurationChange(event) {
    updateStrippingRatioSummary();
    updateStrippingRatioChart();
}

// Update Dispatch summary table
function updateDispatchSummary() {
    const todayData = getTodayDispatchData();
    const monthData = getCurrentMonthDispatchData();
    const fyData = getCurrentFYDispatchData();
    
    // Calculate averages for month and FY
    const selectedDateStr = getSelectedDate();
    const selectedDateObj = new Date(selectedDateStr);
    const currentMonth = selectedDateObj.getMonth();
    const currentYear = selectedDateObj.getFullYear();
    
    // Get month start date for cumulative calculation
    const monthStartDate = new Date(currentYear, currentMonth, 1);
    
    // Get count of days for averages (up to selected date)
    const monthDaysCount = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate >= monthStartDate && rowDate <= selectedDateObj;
    }).length;
    
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyStartDate = new Date(fyStartYear, 3, 1);
    const fyEndDate = new Date(fyStartYear + 1, 2, 31);
    
    const fyDaysCount = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate >= fyStartDate && rowDate <= selectedDateObj;
    }).length;
    
    // Calculate averages with specific decimal formatting
    const monthAvgRoad = monthDaysCount > 0 ? Math.round(monthData.roadDispatch / monthDaysCount).toString() : '0';
    const monthAvgRail = monthDaysCount > 0 ? Math.round(monthData.railDispatch / monthDaysCount).toString() : '0';
    const monthAvgRakes = monthDaysCount > 0 ? (monthData.rakesDispatch / monthDaysCount).toFixed(2) : '0.00';
    
    const fyAvgRoad = fyDaysCount > 0 ? Math.round(fyData.roadDispatch / fyDaysCount).toString() : '0';
    const fyAvgRail = fyDaysCount > 0 ? Math.round(fyData.railDispatch / fyDaysCount).toString() : '0';
    const fyAvgRakes = fyDaysCount > 0 ? (fyData.rakesDispatch / fyDaysCount).toFixed(2) : '0.00';
    
    // Get current date info
    const selectedDateFormatted = selectedDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const currentMonthName = selectedDateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const fyLabel = `${fyStartYear}-${(fyStartYear + 1).toString().slice(-2)}`;
    
    document.getElementById('dispatchSummaryData').innerHTML = `
        <thead class="table-light">
            <tr>
                <th style="width: 40%; font-size: 12px; padding: 8px 12px;">Metrics</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${selectedDateFormatted}</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${currentMonthName} (Up to Date)</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${fyLabel} (Up to Date)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Road Dispatch (MT)</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(todayData.roadDispatch, 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(monthData.roadDispatch, 0)}<br><small class="text-muted">(${formatNumber(parseFloat(monthAvgRoad), 0)})</small></td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(fyData.roadDispatch, 0)}<br><small class="text-muted">(${formatNumber(parseFloat(fyAvgRoad), 0)})</small></td>
            </tr>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Rail Despatch (MT)</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(todayData.railDispatch, 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(monthData.railDispatch, 0)}<br><small class="text-muted">(${formatNumber(parseFloat(monthAvgRail), 0)})</small></td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(fyData.railDispatch, 0)}<br><small class="text-muted">(${formatNumber(parseFloat(fyAvgRail), 0)})</small></td>
            </tr>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Rakes Despatch (Rakes)</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(todayData.rakesDispatch, 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(monthData.rakesDispatch, 0)}<br><small class="text-muted">(${monthAvgRakes})</small></td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(fyData.rakesDispatch, 0)}<br><small class="text-muted">(${fyAvgRakes})</small></td>
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
    const selectedDateStr = getSelectedDate();
    const selectedDateObj = new Date(selectedDateStr);
    
    const todayData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate.toDateString() === selectedDateObj.toDateString();
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
    const selectedDateStr = getSelectedDate();
    const selectedDateObj = new Date(selectedDateStr);
    const currentMonth = selectedDateObj.getMonth();
    const currentYear = selectedDateObj.getFullYear();
    
    const monthData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate.getMonth() === currentMonth && 
               rowDate.getFullYear() === currentYear &&
               rowDate <= selectedDateObj; // Only include dates up to selected date
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
    const selectedDateStr = getSelectedDate();
    const selectedDateObj = new Date(selectedDateStr);
    const currentYear = selectedDateObj.getFullYear();
    const currentMonth = selectedDateObj.getMonth(); // 0-based
    
    // Financial year starts from April (month 3 in 0-based)
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyStartDate = new Date(fyStartYear, 3, 1); // April 1st
    const fyEndDate = new Date(fyStartYear + 1, 2, 31); // March 31st
    
    const fyData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate >= fyStartDate && 
               rowDate <= fyEndDate &&
               rowDate <= selectedDateObj; // Only include dates up to selected date
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
    const selectedDateStr = getSelectedDate();
    const selectedDateObj = new Date(selectedDateStr);
    const selectedDateFormatted = selectedDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const currentMonthName = selectedDateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const currentYear = selectedDateObj.getFullYear();
    const currentMonth = selectedDateObj.getMonth();
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyLabel = `${fyStartYear}-${(fyStartYear + 1).toString().slice(-2)}`;
    
    document.getElementById('stockSummaryData').innerHTML = `
        <thead class="table-light">
            <tr>
                <th style="width: 40%; font-size: 12px; padding: 8px 12px;">Stock Type</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${selectedDateFormatted}</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${currentMonthName} (Up to Date)</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${fyLabel} (Up to Date)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Mine End Closing Stock</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(todayData.mineEndStock, 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(monthData.mineEndStock, 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(fyData.mineEndStock, 0)}</td>
            </tr>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Railway Siding Closing Stock</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(todayData.railwaySidingStock, 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(monthData.railwaySidingStock, 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(fyData.railwaySidingStock, 0)}</td>
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
                        pointRadius: 2,
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
    const selectedDateStr = getSelectedDate();
    const selectedDateObj = new Date(selectedDateStr);
    const todayData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate.toDateString() === selectedDateObj.toDateString();
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
    const selectedDateStr = getSelectedDate();
    const selectedDateObj = new Date(selectedDateStr);
    const currentMonth = selectedDateObj.getMonth();
    const currentYear = selectedDateObj.getFullYear();
    
    const monthData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate.getMonth() === currentMonth && 
               rowDate.getFullYear() === currentYear &&
               rowDate <= selectedDateObj; // Only include dates up to selected date
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
    const selectedDateStr = getSelectedDate();
    const selectedDateObj = new Date(selectedDateStr);
    const currentYear = selectedDateObj.getFullYear();
    const currentMonth = selectedDateObj.getMonth(); // 0-based
    
    // Financial year starts from April (month 3 in 0-based)
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyStartDate = new Date(fyStartYear, 3, 1); // April 1st
    const fyEndDate = new Date(fyStartYear + 1, 2, 31); // March 31st
    
    const fyData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate >= fyStartDate && 
               rowDate <= fyEndDate &&
               rowDate <= selectedDateObj; // Only include dates up to selected date
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
    const selectedDateStr = getSelectedDate();
    const selectedDateObj = new Date(selectedDateStr);
    const selectedDateFormatted = selectedDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const currentMonthName = selectedDateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const fyLabel = `${fyStartYear}-${(fyStartYear + 1).toString().slice(-2)}`;
    
    document.getElementById('plantRakesSummaryData').innerHTML = `
        <thead class="table-light">
            <tr>
                <th style="width: 40%; font-size: 12px; padding: 8px 12px;">Plant</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${selectedDateFormatted}</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${currentMonthName} (Avg)</th>
                <th style="width: 20%; text-align: center; font-size: 12px; padding: 8px 6px;">${fyLabel}  (Avg)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">GGSSTP</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(todayData.ggsstpRakes, 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(monthData.ggsstpRakes, 0)}<br><small class="text-muted">(${monthAvgGGSSTP})</small></td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(fyData.ggsstpRakes, 0)}<br><small class="text-muted">(${fyAvgGGSSTP})</small></td>
            </tr>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">GHTP</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(todayData.ghtpRakes, 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(monthData.ghtpRakes, 0)}<br><small class="text-muted">(${monthAvgGHTP})</small></td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(fyData.ghtpRakes, 0)}<br><small class="text-muted">(${fyAvgGHTP})</small></td>
            </tr>
            <tr>
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">GATP</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(todayData.gatpRakes, 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(monthData.gatpRakes, 0)}<br><small class="text-muted">(${monthAvgGATP})</small></td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(fyData.gatpRakes, 0)}<br><small class="text-muted">(${fyAvgGATP})</small></td>
            </tr>
            <tr class="table-info">
                <td style="font-weight: 600; font-size: 11px; padding: 6px 12px;">Total</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(todayData.totalRakes, 0)}</td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(monthData.totalRakes, 0)}<br><small class="text-muted">(${monthAvgTotal})</small></td>
                <td class="text-center" style="font-size: 11px; padding: 6px;">${formatNumber(fyData.totalRakes, 0)}<br><small class="text-muted">(${fyAvgTotal})</small></td>
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
        
        // Get selected date for the title
        const selectedDateStr = getSelectedDate();
        const selectedDateObj = new Date(selectedDateStr);
        const selectedDateFormatted = selectedDateObj.toLocaleDateString('en-GB', { 
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
                    Date: ${selectedDateFormatted}
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
                
                <!-- Stripping Ratio Summary -->
                <div style="border: 1px solid #dee2e6; border-radius: 8px; padding: 12px;">
                    <h4 style="color: #2c3e50; font-size: 14px; margin: 0 0 10px 0; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                        Stripping Ratio Analysis
                    </h4>
                    <div id="pdfStrippingRatioSummary" style="font-size: 10px;"></div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <!-- Dispatch Summary -->
                <div style="border: 1px solid #dee2e6; border-radius: 8px; padding: 12px;">
                    <h4 style="color: #2c3e50; font-size: 14px; margin: 0 0 10px 0; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                        Dispatch Summary
                    </h4>
                    <div id="pdfDispatchSummary" style="font-size: 10px;"></div>
                </div>
                
                <!-- Plant Rakes Summary -->
                <div style="border: 1px solid #dee2e6; border-radius: 8px; padding: 12px;">
                    <h4 style="color: #2c3e50; font-size: 14px; margin: 0 0 10px 0; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                        Plant-wise Rakes Dispatch
                    </h4>
                    <div id="pdfPlantRakesSummary" style="font-size: 10px;"></div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                <!-- FY Summary (full width) -->
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
        document.getElementById('pdfStrippingRatioSummary').innerHTML = generatePDFTableContent('strippingRatioSummaryData');
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
        pdf.save(`Daily_Progress_Report_${selectedDateFormatted.replace(/\//g, '-')}_${dateStr}.pdf`);
        
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
        const selectedDateStr = getSelectedDate();
        const selectedDateObj = new Date(selectedDateStr);
        const selectedDateFormatted = selectedDateObj.toLocaleDateString('en-GB', { 
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
                    Date: ${selectedDateFormatted}
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
                        Stripping Ratio Analysis
                    </h4>
                    <div id="jpgStrippingRatioSummary" style="font-size: 10px;"></div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <div style="border: 1px solid #dee2e6; border-radius: 8px; padding: 12px;">
                    <h4 style="color: #2c3e50; font-size: 14px; margin: 0 0 10px 0; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                        Dispatch Summary
                    </h4>
                    <div id="jpgDispatchSummary" style="font-size: 10px;"></div>
                </div>
                <div style="border: 1px solid #dee2e6; border-radius: 8px; padding: 12px;">
                    <h4 style="color: #2c3e50; font-size: 14px; margin: 0 0 10px 0; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                        Plant-wise Rakes Dispatch
                    </h4>
                    <div id="jpgPlantRakesSummary" style="font-size: 10px;"></div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
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
        document.getElementById('jpgStrippingRatioSummary').innerHTML = generatePDFTableContent('strippingRatioSummaryData');
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
            a.download = `Daily_Progress_Report_${selectedDateFormatted.replace(/\//g, '-')}_${dateStr}.jpg`;
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

// Export OB card as high-quality PDF
async function exportOBToPDF() {
    const { jsPDF } = window.jspdf;
    const html2canvas = window.html2canvas;
    
    if (!jsPDF || !html2canvas) {
        alert('Export libraries not loaded. Please refresh the page and try again.');
        return;
    }
    
    try {
        const cardElement = document.getElementById('obCard');
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

// Export OB card as high-quality JPG
async function exportOBToJPG() {
    const html2canvas = window.html2canvas;
    
    if (!html2canvas) {
        alert('Export library not loaded. Please refresh the page and try again.');
        return;
    }
    
    try {
        const cardElement = document.getElementById('obCard');
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

// Export Coal card as high-quality PDF
async function exportCoalToPDF() {
    const { jsPDF } = window.jspdf;
    const html2canvas = window.html2canvas;
    
    if (!jsPDF || !html2canvas) {
        alert('Export libraries not loaded. Please refresh the page and try again.');
        return;
    }
    
    try {
        const cardElement = document.getElementById('coalCard');
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
        pdf.save(`Coal_Production_Dashboard_${dateStr}.pdf`);
    } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Error exporting PDF. Please try again.');
    }
}

// Export Coal card as high-quality JPG
async function exportCoalToJPG() {
    const html2canvas = window.html2canvas;
    
    if (!html2canvas) {
        alert('Export library not loaded. Please refresh the page and try again.');
        return;
    }
    
    try {
        const cardElement = document.getElementById('coalCard');
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
            a.download = `Coal_Production_Dashboard_${dateStr}.jpg`;
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

// Export Stripping Ratio card as high-quality PDF
async function exportStrippingRatioToPDF() {
    const html2canvas = window.html2canvas;
    const { jsPDF } = window.jspdf;
    
    if (!html2canvas || !jsPDF) {
        alert('Export libraries not loaded. Please refresh the page and try again.');
        return;
    }
    
    try {
        const cardElement = document.getElementById('strippingRatioCard');
        const canvas = await html2canvas(cardElement, {
            scale: 3, // High quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: cardElement.offsetWidth,
            height: cardElement.offsetHeight
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 30;
        
        // Add title
        pdf.setFontSize(16);
        pdf.setTextColor(44, 62, 80); // Dark blue
        pdf.text('Pachhwara Coal Mine - Stripping Ratio Analysis', pdfWidth / 2, 20, { align: 'center' });
        
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        pdf.save(`Stripping_Ratio_Dashboard_${dateStr}.pdf`);
    } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Error exporting PDF. Please try again.');
    }
}

// Export Stripping Ratio card as high-quality JPG
async function exportStrippingRatioToJPG() {
    const html2canvas = window.html2canvas;
    
    if (!html2canvas) {
        alert('Export library not loaded. Please refresh the page and try again.');
        return;
    }
    
    try {
        const cardElement = document.getElementById('strippingRatioCard');
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
            a.download = `Stripping_Ratio_Dashboard_${dateStr}.jpg`;
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

// Export Daily Report as high-quality JPG with comprehensive data
async function exportDailyReportToJPG() {
    const html2canvas = window.html2canvas;
    
    if (!html2canvas) {
        alert('Export library not loaded. Please refresh the page and try again.');
        return;
    }
    
    try {
        // Create a temporary container for the daily report
        const reportContainer = document.createElement('div');
        reportContainer.style.cssText = `
            position: absolute;
            top: -10000px;
            left: -10000px;
            width: 794px;
            background: white;
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;
        
        // Get selected date for the report
        const selectedDateStr = getSelectedDate();
        const selectedDateObj = new Date(selectedDateStr);
        const selectedDateFormatted = selectedDateObj.toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
        
        // Calculate date ranges for comprehensive data
        const month = selectedDateObj.getMonth();
        const year = selectedDateObj.getFullYear();
        const monthStart = new Date(year, month, 1);
        const monthUpToDate = selectedDateObj;
        
        // Financial year calculation (April to March)
        let fyStart;
        if (month >= 3) { // April onwards (month 3 = April, 0-indexed)
            fyStart = new Date(year, 3, 1); // April 1st of current year
        } else {
            fyStart = new Date(year - 1, 3, 1); // April 1st of previous year
        }
        const fyUpToDate = selectedDateObj;
        
        // Get all the data needed for the report
        const selectedDateData = {
            ob: getTodayOBData(),
            coal: getTodayCoalData(),
            dispatch: getTodayDispatchData(),
            stock: getTodayStockData(),
            plantRakes: getTodayPlantRakesData()
        };
        
        // Get cumulative data for month up to selected date
        const monthData = {
            ob: getOBDataUpToDate(monthStart, monthUpToDate),
            coal: getCoalDataUpToDate(monthStart, monthUpToDate),
            dispatch: getDispatchDataUpToDate(monthStart, monthUpToDate),
            plantRakes: getPlantRakesDataUpToDate(monthStart, monthUpToDate)
        };
        
        // Get cumulative data for FY up to selected date
        const fyData = {
            ob: getOBDataUpToDate(fyStart, fyUpToDate),
            coal: getCoalDataUpToDate(fyStart, fyUpToDate),
            dispatch: getDispatchDataUpToDate(fyStart, fyUpToDate),
            plantRakes: getPlantRakesDataUpToDate(fyStart, fyUpToDate)
        };
        
        // Stock level indicators
        const getMineEndStockStatus = (stock) => {
            if (stock < 100000) return { text: 'Very Low Stock', color: '#e74c3c', bgColor: '#fadbd8' };
            if (stock < 200000) return { text: 'Low Stock', color: '#f39c12', bgColor: '#fef9e7' };
            return { text: 'Stock Available', color: '#27ae60', bgColor: '#d5f4e6' };
        };
        
        const getRailwayStockStatus = (stock) => {
            if (stock < 50000) return { text: 'Very Low Stock', color: '#e74c3c', bgColor: '#fadbd8' };
            if (stock < 100000) return { text: 'Low Stock', color: '#f39c12', bgColor: '#fef9e7' };
            return { text: 'Stock Available', color: '#27ae60', bgColor: '#d5f4e6' };
        };
        
        const mineEndStockStatus = getMineEndStockStatus(selectedDateData.stock.mineEndStock);
        const railwayStockStatus = getRailwayStockStatus(selectedDateData.stock.railwaySidingStock);
        
        // Format date range labels
        const monthLabel = monthStart.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) + ' up to ' + selectedDateFormatted;
        const fyLabel = 'FY ' + (fyStart.getFullYear()) + '-' + (fyStart.getFullYear() + 1).toString().substr(-2) + ' up to ' + selectedDateFormatted;
        
        // Create the comprehensive daily report content
        reportContainer.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2c3e50; padding-bottom: 12px;">
                <h1 style="color: #2c3e50; margin: 0; font-size: 24px; font-weight: 700;">
                    PROGRESS REPORT OF PACHHWARA CENTRAL COAL MINE
                </h1>
                <h3 style="color: #7f8c8d; margin: 8px 0 0 0; font-size: 16px; font-weight: 500;">
                    Date: ${selectedDateFormatted}
                </h3>
            </div>
            
            <!-- OB Production Table -->
            <div style="margin-bottom: 20px;">
                <h3 style="background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; padding: 8px; margin: 0 0 10px 0; font-size: 14px; font-weight: 600; text-align: center; border-radius: 6px;">
                    <i class="bi bi-bar-chart-fill" style="margin-right: 6px;"></i>OB PRODUCTION ANALYSIS
                </h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; box-shadow: 0 1px 6px rgba(0,0,0,0.1);">
                    <thead>
                        <tr style="background: linear-gradient(135deg, #34495e, #2c3e50); color: white;">
                            <th style="padding: 6px; font-size: 11px; font-weight: 600; text-align: left; border: 1px solid #34495e;">PERIOD</th>
                            <th style="padding: 6px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #34495e;">TARGET (MT)</th>
                            <th style="padding: 6px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #34495e;">ACTUAL (MT)</th>
                            <th style="padding: 6px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #34495e;">ACHIEVEMENT (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="background-color: #ffffff;">
                            <td style="padding: 4px; font-size: 10px; font-weight: 600; border: 1px solid #bdc3c7;">${selectedDateFormatted}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(selectedDateData.ob.totalTarget, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7; ${selectedDateData.ob.totalActual >= selectedDateData.ob.totalTarget ? 'background-color: #d5f4e6; color: #27ae60;' : 'background-color: #fadbd8; color: #e74c3c;'}">${formatNumber(selectedDateData.ob.totalActual, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7; font-weight: 600; ${parseFloat(selectedDateData.ob.achievement) >= 100 ? 'color: #27ae60;' : 'color: #e74c3c;'}">${Math.round(parseFloat(selectedDateData.ob.achievement))}%</td>
                        </tr>
                        <tr style="background-color: #f8f9fa;">
                            <td style="padding: 4px; font-size: 10px; font-weight: 600; border: 1px solid #bdc3c7;">${monthLabel}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(monthData.ob.totalTarget, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7; ${monthData.ob.totalActual >= monthData.ob.totalTarget ? 'background-color: #d5f4e6; color: #27ae60;' : 'background-color: #fadbd8; color: #e74c3c;'}">${formatNumber(monthData.ob.totalActual, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7; font-weight: 600; ${parseFloat(monthData.ob.achievement) >= 100 ? 'color: #27ae60;' : 'color: #e74c3c;'}">${Math.round(parseFloat(monthData.ob.achievement))}%</td>
                        </tr>
                        <tr style="background-color: #ffffff;">
                            <td style="padding: 4px; font-size: 10px; font-weight: 600; border: 1px solid #bdc3c7;">${fyLabel}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(fyData.ob.totalTarget, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7; ${fyData.ob.totalActual >= fyData.ob.totalTarget ? 'background-color: #d5f4e6; color: #27ae60;' : 'background-color: #fadbd8; color: #e74c3c;'}">${formatNumber(fyData.ob.totalActual, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7; font-weight: 600; ${parseFloat(fyData.ob.achievement) >= 100 ? 'color: #27ae60;' : 'color: #e74c3c;'}">${Math.round(parseFloat(fyData.ob.achievement))}%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Coal Production Table -->
            <div style="margin-bottom: 20px;">
                <h3 style="background: linear-gradient(135deg, #6f4e37, #5d4037); color: white; padding: 8px; margin: 0 0 10px 0; font-size: 14px; font-weight: 600; text-align: center; border-radius: 6px;">
                    <i class="bi bi-minecart-loaded" style="margin-right: 6px;"></i>COAL PRODUCTION ANALYSIS
                </h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; box-shadow: 0 1px 6px rgba(0,0,0,0.1);">
                    <thead>
                        <tr style="background: linear-gradient(135deg, #34495e, #2c3e50); color: white;">
                            <th style="padding: 6px; font-size: 11px; font-weight: 600; text-align: left; border: 1px solid #34495e;">PERIOD</th>
                            <th style="padding: 6px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #34495e;">TARGET (MT)</th>
                            <th style="padding: 6px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #34495e;">ACTUAL (MT)</th>
                            <th style="padding: 6px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #34495e;">ACHIEVEMENT (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="background-color: #ffffff;">
                            <td style="padding: 4px; font-size: 10px; font-weight: 600; border: 1px solid #bdc3c7;">${selectedDateFormatted}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(selectedDateData.coal.totalTarget, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7; ${selectedDateData.coal.totalActual >= selectedDateData.coal.totalTarget ? 'background-color: #d5f4e6; color: #27ae60;' : 'background-color: #fadbd8; color: #e74c3c;'}">${formatNumber(selectedDateData.coal.totalActual, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7; font-weight: 600; ${parseFloat(selectedDateData.coal.achievement) >= 100 ? 'color: #27ae60;' : 'color: #e74c3c;'}">${Math.round(parseFloat(selectedDateData.coal.achievement))}%</td>
                        </tr>
                        <tr style="background-color: #f8f9fa;">
                            <td style="padding: 4px; font-size: 10px; font-weight: 600; border: 1px solid #bdc3c7;">${monthLabel}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(monthData.coal.totalTarget, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7; ${monthData.coal.totalActual >= monthData.coal.totalTarget ? 'background-color: #d5f4e6; color: #27ae60;' : 'background-color: #fadbd8; color: #e74c3c;'}">${formatNumber(monthData.coal.totalActual, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7; font-weight: 600; ${parseFloat(monthData.coal.achievement) >= 100 ? 'color: #27ae60;' : 'color: #e74c3c;'}">${Math.round(parseFloat(monthData.coal.achievement))}%</td>
                        </tr>
                        <tr style="background-color: #ffffff;">
                            <td style="padding: 4px; font-size: 10px; font-weight: 600; border: 1px solid #bdc3c7;">${fyLabel}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(fyData.coal.totalTarget, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7; ${fyData.coal.totalActual >= fyData.coal.totalTarget ? 'background-color: #d5f4e6; color: #27ae60;' : 'background-color: #fadbd8; color: #e74c3c;'}">${formatNumber(fyData.coal.totalActual, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7; font-weight: 600; ${parseFloat(fyData.coal.achievement) >= 100 ? 'color: #27ae60;' : 'color: #e74c3c;'}">${Math.round(parseFloat(fyData.coal.achievement))}%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Stripping Ratio Analysis Table -->
            <div style="margin-bottom: 20px;">
                <h3 style="background: linear-gradient(135deg, #8e44ad, #9b59b6); color: white; padding: 8px; margin: 0 0 10px 0; font-size: 14px; font-weight: 600; text-align: center; border-radius: 6px;">
                    <i class="bi bi-speedometer2" style="margin-right: 6px;"></i>STRIPPING RATIO ANALYSIS
                </h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; box-shadow: 0 1px 6px rgba(0,0,0,0.1);">
                    <thead>
                        <tr style="background: linear-gradient(135deg, #34495e, #2c3e50); color: white;">
                            <th style="padding: 6px; font-size: 11px; font-weight: 600; text-align: left; border: 1px solid #34495e;">PERIOD</th>
                            <th style="padding: 6px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #34495e;">OB PRODUCTION (MT)</th>
                            <th style="padding: 6px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #34495e;">COAL PRODUCTION (MT)</th>
                            <th style="padding: 6px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #34495e;">STRIPPING RATIO</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="background-color: #ffffff;">
                            <td style="padding: 4px; font-size: 10px; font-weight: 600; border: 1px solid #bdc3c7;">${selectedDateFormatted}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(selectedDateData.ob.totalActual, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(selectedDateData.coal.totalActual, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7; font-weight: 600; color: #8e44ad;">${selectedDateData.coal.totalActual > 0 ? (selectedDateData.ob.totalActual / selectedDateData.coal.totalActual).toFixed(2) : '0.00'}</td>
                        </tr>
                        <tr style="background-color: #f8f9fa;">
                            <td style="padding: 4px; font-size: 10px; font-weight: 600; border: 1px solid #bdc3c7;">${monthLabel}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(monthData.ob.totalActual, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(monthData.coal.totalActual, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7; font-weight: 600; color: #8e44ad;">${monthData.coal.totalActual > 0 ? (monthData.ob.totalActual / monthData.coal.totalActual).toFixed(2) : '0.00'}</td>
                        </tr>
                        <tr style="background-color: #ffffff;">
                            <td style="padding: 4px; font-size: 10px; font-weight: 600; border: 1px solid #bdc3c7;">${fyLabel}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(fyData.ob.totalActual, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(fyData.coal.totalActual, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7; font-weight: 600; color: #8e44ad;">${fyData.coal.totalActual > 0 ? (fyData.ob.totalActual / fyData.coal.totalActual).toFixed(2) : '0.00'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Dispatch Summary Table -->
            <div style="margin-bottom: 20px;">
                <h3 style="background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 8px; margin: 0 0 10px 0; font-size: 14px; font-weight: 600; text-align: center; border-radius: 6px;">
                    <i class="bi bi-truck" style="margin-right: 6px;"></i>DISPATCH SUMMARY ANALYSIS
                </h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; box-shadow: 0 1px 6px rgba(0,0,0,0.1);">
                    <thead>
                        <tr style="background: linear-gradient(135deg, #34495e, #2c3e50); color: white;">
                            <th style="padding: 6px; font-size: 11px; font-weight: 600; text-align: left; border: 1px solid #34495e;">PERIOD</th>
                            <th style="padding: 6px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #34495e;">ROAD (MT)</th>
                            <th style="padding: 6px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #34495e;">RAIL (MT)</th>
                            <th style="padding: 6px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #34495e;">TOTAL RAKES</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="background-color: #ffffff;">
                            <td style="padding: 4px; font-size: 10px; font-weight: 600; border: 1px solid #bdc3c7;">${selectedDateFormatted}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(selectedDateData.dispatch.roadDispatch, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(selectedDateData.dispatch.railDispatch, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(selectedDateData.dispatch.rakesDispatch, 0)}</td>
                        </tr>
                        <tr style="background-color: #f8f9fa;">
                            <td style="padding: 4px; font-size: 10px; font-weight: 600; border: 1px solid #bdc3c7;">${monthLabel}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(monthData.dispatch.roadDispatch, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(monthData.dispatch.railDispatch, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(monthData.dispatch.rakesDispatch, 0)}</td>
                        </tr>
                        <tr style="background-color: #ffffff;">
                            <td style="padding: 4px; font-size: 10px; font-weight: 600; border: 1px solid #bdc3c7;">${fyLabel}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(fyData.dispatch.roadDispatch, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(fyData.dispatch.railDispatch, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(fyData.dispatch.rakesDispatch, 0)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Stock Summary -->
            <div style="margin-bottom: 20px;">
                <h3 style="background: linear-gradient(135deg, #17a2b8, #138496); color: white; padding: 8px; margin: 0 0 10px 0; font-size: 14px; font-weight: 600; text-align: center; border-radius: 6px;">
                    <i class="bi bi-box-seam-fill" style="margin-right: 6px;"></i>CURRENT STOCK STATUS
                </h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; box-shadow: 0 1px 6px rgba(0,0,0,0.1);">
                    <thead>
                        <tr style="background: linear-gradient(135deg, #34495e, #2c3e50); color: white;">
                            <th style="padding: 6px; font-size: 11px; font-weight: 600; text-align: left; border: 1px solid #34495e;">STOCK TYPE</th>
                            <th style="padding: 6px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #34495e;">QUANTITY (MT)</th>
                            <th style="padding: 6px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #34495e;">STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="background-color: #ffffff;">
                            <td style="padding: 5px; font-size: 10px; font-weight: 600; border: 1px solid #bdc3c7;">Mine End Stock</td>
                            <td style="padding: 5px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(selectedDateData.stock.mineEndStock, 0)}</td>
                            <td style="padding: 5px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7; background-color: ${mineEndStockStatus.bgColor}; color: ${mineEndStockStatus.color}; font-weight: 600;">${mineEndStockStatus.text}</td>
                        </tr>
                        <tr style="background-color: #f8f9fa;">
                            <td style="padding: 5px; font-size: 10px; font-weight: 600; border: 1px solid #bdc3c7;">Railway Siding Stock</td>
                            <td style="padding: 5px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(selectedDateData.stock.railwaySidingStock, 0)}</td>
                            <td style="padding: 5px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7; background-color: ${railwayStockStatus.bgColor}; color: ${railwayStockStatus.color}; font-weight: 600;">${railwayStockStatus.text}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Plant-wise Rakes Dispatch Table -->
            <div style="margin-bottom: 20px;">
                <h3 style="background: linear-gradient(135deg, #28a745, #218838); color: white; padding: 8px; margin: 0 0 10px 0; font-size: 14px; font-weight: 600; text-align: center; border-radius: 6px;">
                    <i class="bi bi-train-freight-front" style="margin-right: 6px;"></i>PLANT-WISE RAKES DISPATCH ANALYSIS
                </h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; box-shadow: 0 1px 6px rgba(0,0,0,0.1);">
                    <thead>
                        <tr style="background: linear-gradient(135deg, #34495e, #2c3e50); color: white;">
                            <th style="padding: 6px; font-size: 11px; font-weight: 600; text-align: left; border: 1px solid #34495e;">PERIOD</th>
                            <th style="padding: 6px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #34495e;">GGSSTP</th>
                            <th style="padding: 6px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #34495e;">GHTP</th>
                            <th style="padding: 6px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #34495e;">GATP</th>
                            <th style="padding: 6px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #34495e;">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="background-color: #ffffff;">
                            <td style="padding: 4px; font-size: 10px; font-weight: 600; border: 1px solid #bdc3c7;">${selectedDateFormatted}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(selectedDateData.plantRakes.ggsstpRakes, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(selectedDateData.plantRakes.ghtpRakes, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(selectedDateData.plantRakes.gatpRakes, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7; font-weight: 600;">${formatNumber(selectedDateData.plantRakes.totalRakes, 0)}</td>
                        </tr>
                        <tr style="background-color: #f8f9fa;">
                            <td style="padding: 4px; font-size: 10px; font-weight: 600; border: 1px solid #bdc3c7;">${monthLabel}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(monthData.plantRakes.ggsstpRakes, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(monthData.plantRakes.ghtpRakes, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(monthData.plantRakes.gatpRakes, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7; font-weight: 600;">${formatNumber(monthData.plantRakes.totalRakes, 0)}</td>
                        </tr>
                        <tr style="background-color: #ffffff;">
                            <td style="padding: 4px; font-size: 10px; font-weight: 600; border: 1px solid #bdc3c7;">${fyLabel}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(fyData.plantRakes.ggsstpRakes, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(fyData.plantRakes.ghtpRakes, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(fyData.plantRakes.gatpRakes, 0)}</td>
                            <td style="padding: 4px; font-size: 10px; text-align: center; border: 1px solid #bdc3c7; font-weight: 600;">${formatNumber(fyData.plantRakes.totalRakes, 0)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Financial Year Comparison Section -->
            ${(() => {
                const allFYData = getAllFinancialYearsData();
                if (allFYData.length === 0) return '';
                
                return `
                    <!-- Coal Dispatch - All Financial Years -->
                    <div style="margin-bottom: 15px;">
                        <h3 style="background: linear-gradient(135deg, #9b59b6, #8e44ad); color: white; padding: 6px; margin: 0 0 8px 0; font-size: 12px; font-weight: 600; text-align: center; border-radius: 4px;">
                            <i class="bi bi-minecart-loaded" style="margin-right: 4px;"></i>COAL PRODUCTION & DISPATCH - ALL FINANCIAL YEARS
                        </h3>
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; box-shadow: 0 1px 6px rgba(0,0,0,0.1);">
                            <thead>
                                <tr style="background: linear-gradient(135deg, #34495e, #2c3e50); color: white;">
                                    <th style="padding: 3px; font-size: 9px; font-weight: 600; text-align: center; border: 1px solid #34495e;">FINANCIAL YEAR</th>
                                    <th style="padding: 3px; font-size: 9px; font-weight: 600; text-align: center; border: 1px solid #34495e;">PRODUCTION TARGET (MT)</th>
                                    <th style="padding: 3px; font-size: 9px; font-weight: 600; text-align: center; border: 1px solid #34495e;">ACTUAL PRODUCTION (MT)</th>
                                    <th style="padding: 3px; font-size: 9px; font-weight: 600; text-align: center; border: 1px solid #34495e;">ACHIEVEMENT (%)</th>
                                    <th style="padding: 3px; font-size: 9px; font-weight: 600; text-align: center; border: 1px solid #34495e;">ROAD DISPATCH (MT)</th>
                                    <th style="padding: 3px; font-size: 9px; font-weight: 600; text-align: center; border: 1px solid #34495e;">RAIL DISPATCH (MT)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${allFYData.map((fy, index) => `
                                    <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
                                        <td style="padding: 2px; font-size: 8px; font-weight: 600; text-align: center; border: 1px solid #bdc3c7;">FY ${fy.fyLabel}</td>
                                        <td style="padding: 2px; font-size: 8px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(fy.coalTarget, 0)}</td>
                                        <td style="padding: 2px; font-size: 8px; text-align: center; border: 1px solid #bdc3c7; ${fy.coalActual >= fy.coalTarget ? 'background-color: #d5f4e6; color: #27ae60;' : 'background-color: #fadbd8; color: #e74c3c;'}">${formatNumber(fy.coalActual, 0)}</td>
                                        <td style="padding: 2px; font-size: 8px; text-align: center; border: 1px solid #bdc3c7; font-weight: 600; ${fy.coalAchievement >= 100 ? 'color: #27ae60;' : 'color: #e74c3c;'}">${Math.round(fy.coalAchievement)}%</td>
                                        <td style="padding: 2px; font-size: 8px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(fy.roadDispatch, 0)}</td>
                                        <td style="padding: 2px; font-size: 8px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(fy.railDispatch, 0)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Rakes Dispatch - All Financial Years -->
                    <div style="margin-bottom: 15px;">
                        <h3 style="background: linear-gradient(135deg, #f39c12, #e67e22); color: white; padding: 6px; margin: 0 0 8px 0; font-size: 12px; font-weight: 600; text-align: center; border-radius: 4px;">
                            <i class="bi bi-train-freight-front" style="margin-right: 4px;"></i>RAKES DISPATCH - ALL FINANCIAL YEARS
                        </h3>
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; box-shadow: 0 1px 6px rgba(0,0,0,0.1);">
                            <thead>
                                <tr style="background: linear-gradient(135deg, #34495e, #2c3e50); color: white;">
                                    <th style="padding: 3px; font-size: 9px; font-weight: 600; text-align: center; border: 1px solid #34495e;">FINANCIAL YEAR</th>
                                    <th style="padding: 3px; font-size: 9px; font-weight: 600; text-align: center; border: 1px solid #34495e;">GGSSTP</th>
                                    <th style="padding: 3px; font-size: 9px; font-weight: 600; text-align: center; border: 1px solid #34495e;">GHTP</th>
                                    <th style="padding: 3px; font-size: 9px; font-weight: 600; text-align: center; border: 1px solid #34495e;">GATP</th>
                                    <th style="padding: 3px; font-size: 9px; font-weight: 600; text-align: center; border: 1px solid #34495e;">TOTAL RAKES</th>
                                    <th style="padding: 3px; font-size: 9px; font-weight: 600; text-align: center; border: 1px solid #34495e;">AVG PER DAY</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${allFYData.map((fy, index) => `
                                    <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
                                        <td style="padding: 2px; font-size: 8px; font-weight: 600; text-align: center; border: 1px solid #bdc3c7;">FY ${fy.fyLabel}</td>
                                        <td style="padding: 2px; font-size: 8px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(fy.ggsstpRakes, 0)}</td>
                                        <td style="padding: 2px; font-size: 8px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(fy.ghtpRakes, 0)}</td>
                                        <td style="padding: 2px; font-size: 8px; text-align: center; border: 1px solid #bdc3c7;">${formatNumber(fy.gatpRakes, 0)}</td>
                                        <td style="padding: 2px; font-size: 8px; text-align: center; border: 1px solid #bdc3c7; font-weight: 600; background-color: #e8f4f8;">${formatNumber(fy.totalRakes, 0)}</td>
                                        <td style="padding: 2px; font-size: 8px; text-align: center; border: 1px solid #bdc3c7; font-style: italic;">${formatNumber(fy.totalRakes / 365, 1)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            })()}
            
            <div style="margin-top: 15px; padding: 10px; background: linear-gradient(135deg, #ecf0f1, #d5dbdb); border-left: 3px solid #3498db; border-radius: 3px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 10px; color: #2c3e50;">
                        <strong>Report Generated:</strong> ${new Date().toLocaleString('en-GB')}
                    </div>
                    <div style="font-size: 10px; color: #2c3e50; text-align: right;">
                        <strong>Pachwara Central Coal Mine Dashboard</strong><br>
                        <em>Progress Analysis System</em>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(reportContainer);
        
        // Generate high-quality A4 image
        const canvas = await html2canvas(reportContainer, {
            scale: 3, // High quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 794, // A4 width
            height: reportContainer.scrollHeight,
            dpi: 300, // High DPI for professional quality
            letterRendering: true, // Better text rendering
            logging: false, // Disable logging for cleaner console
            imageTimeout: 30000, // Longer timeout for complex content
            removeContainer: true // Clean up temporary elements
        });
        
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            
            a.href = url;
            a.download = `Comprehensive_Report_Pachwara_${selectedDateFormatted.replace(/\//g, '-')}_${dateStr}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/jpeg', 0.98); // Maximum quality JPEG
        
        // Remove temporary container
        document.body.removeChild(reportContainer);
        
    } catch (error) {
        console.error('Error exporting Comprehensive Daily Report:', error);
        alert('Error exporting Comprehensive Daily Report. Please try again.');
    }
}

// Export Daily Report as Black & White JPG (Ink-saving for printing)
async function exportDailyReportToJPG_BW() {
    const html2canvas = window.html2canvas;
    
    if (!html2canvas) {
        alert('Export library not loaded. Please refresh the page and try again.');
        return;
    }
    
    try {
        // Create a temporary container for the BW daily report
        const reportContainer = document.createElement('div');
        reportContainer.style.cssText = `
            position: absolute;
            top: -10000px;
            left: -10000px;
            width: 794px;
            background: white;
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;
        
        // Get selected date for the report
        const selectedDateStr = getSelectedDate();
        const selectedDateObj = new Date(selectedDateStr);
        const selectedDateFormatted = selectedDateObj.toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
        
        // Calculate date ranges for comprehensive data
        const month = selectedDateObj.getMonth();
        const year = selectedDateObj.getFullYear();
        const monthStart = new Date(year, month, 1);
        const monthUpToDate = selectedDateObj;
        
        // Financial year calculation (April to March)
        let fyStart;
        if (month >= 3) { // April onwards (month 3 = April, 0-indexed)
            fyStart = new Date(year, 3, 1); // April 1st of current year
        } else {
            fyStart = new Date(year - 1, 3, 1); // April 1st of previous year
        }
        const fyUpToDate = selectedDateObj;
        
        // Get all the data needed for the report
        const selectedDateData = {
            ob: getTodayOBData(),
            coal: getTodayCoalData(),
            dispatch: getTodayDispatchData(),
            stock: getTodayStockData(),
            plantRakes: getTodayPlantRakesData()
        };
        
        // Get cumulative data for month up to selected date
        const monthData = {
            ob: getOBDataUpToDate(monthStart, monthUpToDate),
            coal: getCoalDataUpToDate(monthStart, monthUpToDate),
            dispatch: getDispatchDataUpToDate(monthStart, monthUpToDate),
            plantRakes: getPlantRakesDataUpToDate(monthStart, monthUpToDate)
        };
        
        // Get cumulative data for FY up to selected date
        const fyData = {
            ob: getOBDataUpToDate(fyStart, fyUpToDate),
            coal: getCoalDataUpToDate(fyStart, fyUpToDate),
            dispatch: getDispatchDataUpToDate(fyStart, fyUpToDate),
            plantRakes: getPlantRakesDataUpToDate(fyStart, fyUpToDate)
        };
        
        // Stock level indicators (BW version - no colors)
        const getMineEndStockStatus = (stock) => {
            if (stock < 100000) return { text: 'Very Low Stock' };
            if (stock < 200000) return { text: 'Low Stock' };
            return { text: 'Stock Available' };
        };
        
        const getRailwayStockStatus = (stock) => {
            if (stock < 50000) return { text: 'Very Low Stock' };
            if (stock < 100000) return { text: 'Low Stock' };
            return { text: 'Stock Available' };
        };
        
        const mineEndStockStatus = getMineEndStockStatus(selectedDateData.stock.mineEndStock);
        const railwayStockStatus = getRailwayStockStatus(selectedDateData.stock.railwaySidingStock);
        
        // Format date range labels
        const monthLabel = monthStart.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) + ' up to ' + selectedDateFormatted;
        const fyLabel = 'FY ' + (fyStart.getFullYear()) + '-' + (fyStart.getFullYear() + 1).toString().substr(-2) + ' up to ' + selectedDateFormatted;
        
        // Create the BW daily report content
        reportContainer.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000000; padding-bottom: 12px;">
                <h1 style="color: #000000; margin: 0; font-size: 24px; font-weight: 700;">
                    PROGRESS REPORT OF PACHHWARA CENTRAL COAL MINE
                </h1>
                <h3 style="color: #000000; margin: 8px 0 0 0; font-size: 16px; font-weight: 500;">
                    Date: ${selectedDateFormatted}
                </h3>
            </div>
            
            <!-- OB Production Table (BW) -->
            <div style="margin-bottom: 20px;">
                <h3 style="color: #000000; margin: 0 0 10px 0; font-size: 14px; font-weight: 600; text-align: left;">
                    1. OB PRODUCTION ANALYSIS
                </h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                    <thead>
                        <tr style="border: 1px solid #cccccc;">
                            <th style="padding: 3px; font-size: 11px; font-weight: 600; text-align: left; border: 1px solid #cccccc; color: #000000;">PERIOD</th>
                            <th style="padding: 3px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">TARGET (MT)</th>
                            <th style="padding: 3px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">ACTUAL (MT)</th>
                            <th style="padding: 3px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">ACHIEVEMENT (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 2px; font-size: 10px; font-weight: 600; border: 1px solid #cccccc; color: #000000;">${selectedDateFormatted}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(selectedDateData.ob.totalTarget, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(selectedDateData.ob.totalActual, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; font-weight: 600; color: #000000;">${Math.round(parseFloat(selectedDateData.ob.achievement))}%</td>
                        </tr>
                        <tr>
                            <td style="padding: 2px; font-size: 10px; font-weight: 600; border: 1px solid #cccccc; color: #000000;">${monthLabel}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(monthData.ob.totalTarget, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(monthData.ob.totalActual, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; font-weight: 600; color: #000000;">${Math.round(parseFloat(monthData.ob.achievement))}%</td>
                        </tr>
                        <tr>
                            <td style="padding: 2px; font-size: 10px; font-weight: 600; border: 1px solid #cccccc; color: #000000;">${fyLabel}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(fyData.ob.totalTarget, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(fyData.ob.totalActual, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; font-weight: 600; color: #000000;">${Math.round(parseFloat(fyData.ob.achievement))}%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Coal Production Table (BW) -->
            <div style="margin-bottom: 20px;">
                <h3 style="color: #000000; margin: 0 0 10px 0; font-size: 14px; font-weight: 600; text-align: left;">
                    2. COAL PRODUCTION ANALYSIS
                </h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                    <thead>
                        <tr style="border: 1px solid #cccccc;">
                            <th style="padding: 3px; font-size: 11px; font-weight: 600; text-align: left; border: 1px solid #cccccc; color: #000000;">PERIOD</th>
                            <th style="padding: 3px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">TARGET (MT)</th>
                            <th style="padding: 3px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">ACTUAL (MT)</th>
                            <th style="padding: 3px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">ACHIEVEMENT (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 2px; font-size: 10px; font-weight: 600; border: 1px solid #cccccc; color: #000000;">${selectedDateFormatted}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(selectedDateData.coal.totalTarget, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(selectedDateData.coal.totalActual, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; font-weight: 600; color: #000000;">${Math.round(parseFloat(selectedDateData.coal.achievement))}%</td>
                        </tr>
                        <tr>
                            <td style="padding: 2px; font-size: 10px; font-weight: 600; border: 1px solid #cccccc; color: #000000;">${monthLabel}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(monthData.coal.totalTarget, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(monthData.coal.totalActual, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; font-weight: 600; color: #000000;">${Math.round(parseFloat(monthData.coal.achievement))}%</td>
                        </tr>
                        <tr>
                            <td style="padding: 2px; font-size: 10px; font-weight: 600; border: 1px solid #cccccc; color: #000000;">${fyLabel}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(fyData.coal.totalTarget, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(fyData.coal.totalActual, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; font-weight: 600; color: #000000;">${Math.round(parseFloat(fyData.coal.achievement))}%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Stripping Ratio Analysis Table (BW) -->
            <div style="margin-bottom: 20px;">
                <h3 style="color: #000000; margin: 0 0 10px 0; font-size: 14px; font-weight: 600; text-align: left;">
                    3. STRIPPING RATIO ANALYSIS
                </h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                    <thead>
                        <tr style="border: 1px solid #cccccc;">
                            <th style="padding: 3px; font-size: 11px; font-weight: 600; text-align: left; border: 1px solid #cccccc; color: #000000;">PERIOD</th>
                            <th style="padding: 3px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">OB PRODUCTION (MT)</th>
                            <th style="padding: 3px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">COAL PRODUCTION (MT)</th>
                            <th style="padding: 3px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">STRIPPING RATIO</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 2px; font-size: 10px; font-weight: 600; border: 1px solid #cccccc; color: #000000;">${selectedDateFormatted}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(selectedDateData.ob.totalActual, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(selectedDateData.coal.totalActual, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; font-weight: 600; color: #000000;">${selectedDateData.coal.totalActual > 0 ? (selectedDateData.ob.totalActual / selectedDateData.coal.totalActual).toFixed(2) : '0.00'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 2px; font-size: 10px; font-weight: 600; border: 1px solid #cccccc; color: #000000;">${monthLabel}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(monthData.ob.totalActual, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(monthData.coal.totalActual, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; font-weight: 600; color: #000000;">${monthData.coal.totalActual > 0 ? (monthData.ob.totalActual / monthData.coal.totalActual).toFixed(2) : '0.00'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 2px; font-size: 10px; font-weight: 600; border: 1px solid #cccccc; color: #000000;">${fyLabel}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(fyData.ob.totalActual, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(fyData.coal.totalActual, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; font-weight: 600; color: #000000;">${fyData.coal.totalActual > 0 ? (fyData.ob.totalActual / fyData.coal.totalActual).toFixed(2) : '0.00'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Dispatch Summary Table (BW) -->
            <div style="margin-bottom: 20px;">
                <h3 style="color: #000000; margin: 0 0 10px 0; font-size: 14px; font-weight: 600; text-align: left;">
                    4. DISPATCH SUMMARY ANALYSIS
                </h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                    <thead>
                        <tr style="border: 1px solid #cccccc;">
                            <th style="padding: 3px; font-size: 11px; font-weight: 600; text-align: left; border: 1px solid #cccccc; color: #000000;">PERIOD</th>
                            <th style="padding: 3px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">ROAD (MT)</th>
                            <th style="padding: 3px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">RAIL (MT)</th>
                            <th style="padding: 3px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">TOTAL RAKES</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 2px; font-size: 10px; font-weight: 600; border: 1px solid #cccccc; color: #000000;">${selectedDateFormatted}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(selectedDateData.dispatch.roadDispatch, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(selectedDateData.dispatch.railDispatch, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(selectedDateData.dispatch.rakesDispatch, 0)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 2px; font-size: 10px; font-weight: 600; border: 1px solid #cccccc; color: #000000;">${monthLabel}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(monthData.dispatch.roadDispatch, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(monthData.dispatch.railDispatch, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(monthData.dispatch.rakesDispatch, 0)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 2px; font-size: 10px; font-weight: 600; border: 1px solid #cccccc; color: #000000;">${fyLabel}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(fyData.dispatch.roadDispatch, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(fyData.dispatch.railDispatch, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(fyData.dispatch.rakesDispatch, 0)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Stock Summary (BW) -->
            <div style="margin-bottom: 20px;">
                <h3 style="color: #000000; margin: 0 0 10px 0; font-size: 14px; font-weight: 600; text-align: left;">
                    5. CURRENT STOCK STATUS
                </h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                    <thead>
                        <tr style="border: 1px solid #cccccc;">
                            <th style="padding: 3px; font-size: 11px; font-weight: 600; text-align: left; border: 1px solid #cccccc; color: #000000;">STOCK TYPE</th>
                            <th style="padding: 3px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">QUANTITY (MT)</th>
                            <th style="padding: 3px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 2px; font-size: 10px; font-weight: 600; border: 1px solid #cccccc; color: #000000;">Mine End Stock</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(selectedDateData.stock.mineEndStock, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; font-weight: 600; color: #000000;">${mineEndStockStatus.text}</td>
                        </tr>
                        <tr>
                            <td style="padding: 2px; font-size: 10px; font-weight: 600; border: 1px solid #cccccc; color: #000000;">Railway Siding Stock</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(selectedDateData.stock.railwaySidingStock, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; font-weight: 600; color: #000000;">${railwayStockStatus.text}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Plant-wise Rakes Dispatch Table (BW) -->
            <div style="margin-bottom: 20px;">
                <h3 style="color: #000000; margin: 0 0 10px 0; font-size: 14px; font-weight: 600; text-align: left;">
                    6. PLANT-WISE RAKES DISPATCH ANALYSIS
                </h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                    <thead>
                        <tr style="border: 1px solid #cccccc;">
                            <th style="padding: 3px; font-size: 11px; font-weight: 600; text-align: left; border: 1px solid #cccccc; color: #000000;">PERIOD</th>
                            <th style="padding: 3px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">GGSSTP</th>
                            <th style="padding: 3px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">GHTP</th>
                            <th style="padding: 3px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">GATP</th>
                            <th style="padding: 3px; font-size: 11px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 2px; font-size: 10px; font-weight: 600; border: 1px solid #cccccc; color: #000000;">${selectedDateFormatted}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(selectedDateData.plantRakes.ggsstpRakes, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(selectedDateData.plantRakes.ghtpRakes, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(selectedDateData.plantRakes.gatpRakes, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; font-weight: 600; color: #000000;">${formatNumber(selectedDateData.plantRakes.totalRakes, 0)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 2px; font-size: 10px; font-weight: 600; border: 1px solid #cccccc; color: #000000;">${monthLabel}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(monthData.plantRakes.ggsstpRakes, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(monthData.plantRakes.ghtpRakes, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(monthData.plantRakes.gatpRakes, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; font-weight: 600; color: #000000;">${formatNumber(monthData.plantRakes.totalRakes, 0)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 2px; font-size: 10px; font-weight: 600; border: 1px solid #cccccc; color: #000000;">${fyLabel}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(fyData.plantRakes.ggsstpRakes, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(fyData.plantRakes.ghtpRakes, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(fyData.plantRakes.gatpRakes, 0)}</td>
                            <td style="padding: 2px; font-size: 10px; text-align: center; border: 1px solid #cccccc; font-weight: 600; color: #000000;">${formatNumber(fyData.plantRakes.totalRakes, 0)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Financial Year Comparison Section (BW) -->
            ${(() => {
                const allFYData = getAllFinancialYearsData();
                if (allFYData.length === 0) return '';
                
                return `
                    <!-- Coal Dispatch - All Financial Years (BW) -->
                    <div style="margin-bottom: 15px;">
                        <h3 style="color: #000000; margin: 0 0 8px 0; font-size: 12px; font-weight: 600; text-align: left;">
                            7. COAL PRODUCTION & DISPATCH - ALL FINANCIAL YEARS
                        </h3>
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                            <thead>
                                <tr style="border: 1px solid #cccccc;">
                                    <th style="padding: 2px; font-size: 9px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">FINANCIAL YEAR</th>
                                    <th style="padding: 2px; font-size: 9px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">PRODUCTION TARGET (MT)</th>
                                    <th style="padding: 2px; font-size: 9px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">ACTUAL PRODUCTION (MT)</th>
                                    <th style="padding: 2px; font-size: 9px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">ACHIEVEMENT (%)</th>
                                    <th style="padding: 2px; font-size: 9px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">ROAD DISPATCH (MT)</th>
                                    <th style="padding: 2px; font-size: 9px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">RAIL DISPATCH (MT)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${allFYData.map((fy, index) => `
                                    <tr>
                                        <td style="padding: 1px; font-size: 8px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">FY ${fy.fyLabel}</td>
                                        <td style="padding: 1px; font-size: 8px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(fy.coalTarget, 0)}</td>
                                        <td style="padding: 1px; font-size: 8px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(fy.coalActual, 0)}</td>
                                        <td style="padding: 1px; font-size: 8px; text-align: center; border: 1px solid #cccccc; font-weight: 600; color: #000000;">${Math.round(fy.coalAchievement)}%</td>
                                        <td style="padding: 1px; font-size: 8px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(fy.roadDispatch, 0)}</td>
                                        <td style="padding: 1px; font-size: 8px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(fy.railDispatch, 0)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Rakes Dispatch - All Financial Years (BW) -->
                    <div style="margin-bottom: 15px;">
                        <h3 style="color: #000000; margin: 0 0 8px 0; font-size: 12px; font-weight: 600; text-align: left;">
                            8. RAKES DISPATCH - ALL FINANCIAL YEARS
                        </h3>
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
                            <thead>
                                <tr style="border: 1px solid #cccccc;">
                                    <th style="padding: 2px; font-size: 9px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">FINANCIAL YEAR</th>
                                    <th style="padding: 2px; font-size: 9px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">GGSSTP</th>
                                    <th style="padding: 2px; font-size: 9px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">GHTP</th>
                                    <th style="padding: 2px; font-size: 9px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">GATP</th>
                                    <th style="padding: 2px; font-size: 9px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">TOTAL RAKES</th>
                                    <th style="padding: 2px; font-size: 9px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">AVG PER DAY</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${allFYData.map((fy, index) => `
                                    <tr>
                                        <td style="padding: 1px; font-size: 8px; font-weight: 600; text-align: center; border: 1px solid #cccccc; color: #000000;">FY ${fy.fyLabel}</td>
                                        <td style="padding: 1px; font-size: 8px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(fy.ggsstpRakes, 0)}</td>
                                        <td style="padding: 1px; font-size: 8px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(fy.ghtpRakes, 0)}</td>
                                        <td style="padding: 1px; font-size: 8px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(fy.gatpRakes, 0)}</td>
                                        <td style="padding: 1px; font-size: 8px; text-align: center; border: 1px solid #cccccc; font-weight: 600; color: #000000;">${formatNumber(fy.totalRakes, 0)}</td>
                                        <td style="padding: 1px; font-size: 8px; text-align: center; border: 1px solid #cccccc; color: #000000;">${formatNumber(fy.totalRakes / 365, 1)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            })()}
            
        `;
        
        document.body.appendChild(reportContainer);
        
        // Generate high-quality A4 image
        const canvas = await html2canvas(reportContainer, {
            scale: 3, // High quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 794, // A4 width
            height: reportContainer.scrollHeight,
            dpi: 300, // High DPI for professional quality
            letterRendering: true, // Better text rendering
            logging: false, // Disable logging for cleaner console
            imageTimeout: 30000, // Longer timeout for complex content
            removeContainer: true // Clean up temporary elements
        });
        
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            
            a.href = url;
            a.download = `Daily_Report_BW_Pachwara_${selectedDateFormatted.replace(/\//g, '-')}_${dateStr}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/jpeg', 0.98); // Maximum quality JPEG
        
        // Remove temporary container
        document.body.removeChild(reportContainer);
        
    } catch (error) {
        console.error('Error exporting BW Daily Report:', error);
        alert('Error exporting BW Daily Report. Please try again.');
    }
}

// Helper functions for comprehensive export data calculation
function getOBDataUpToDate(startDate, endDate) {
    const filteredData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate >= startDate && rowDate <= endDate;
    });
    
    let totalTarget = 0;
    let totalActual = 0;
    
    filteredData.forEach(row => {
        totalTarget += Number(row[9]) || 0; // OB Production Target (Column J)
        totalActual += Number(row[10]) || 0; // OB Actual Production (Column K)
    });
    
    const achievement = totalTarget > 0 ? ((totalActual / totalTarget) * 100).toFixed(2) : '0.00';
    const avgTarget = filteredData.length > 0 ? (totalTarget / filteredData.length).toFixed(0) : '0';
    const avgActual = filteredData.length > 0 ? (totalActual / filteredData.length).toFixed(0) : '0';
    
    return { totalTarget, totalActual, achievement, avgTarget, avgActual };
}

function getCoalDataUpToDate(startDate, endDate) {
    const filteredData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate >= startDate && rowDate <= endDate;
    });
    
    let totalTarget = 0;
    let totalActual = 0;
    
    filteredData.forEach(row => {
        totalTarget += Number(row[2]) || 0; // Coal Production Target (Column C)
        totalActual += Number(row[3]) || 0; // Coal Actual Production (Column D)
    });
    
    const achievement = totalTarget > 0 ? ((totalActual / totalTarget) * 100).toFixed(2) : '0.00';
    const avgTarget = filteredData.length > 0 ? (totalTarget / filteredData.length).toFixed(0) : '0';
    const avgActual = filteredData.length > 0 ? (totalActual / filteredData.length).toFixed(0) : '0';
    
    return { totalTarget, totalActual, achievement, avgTarget, avgActual };
}

function getDispatchDataUpToDate(startDate, endDate) {
    const filteredData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate >= startDate && rowDate <= endDate;
    });
    
    let roadDispatch = 0;
    let railDispatch = 0;
    let rakesDispatch = 0;
    
    filteredData.forEach(row => {
        roadDispatch += Number(row[7]) || 0; // Road Dispatch (MT)
        railDispatch += Number(row[15]) || 0; // Rail Despatch (MT)
        rakesDispatch += Number(row[20]) || 0; // Rakes despatch (Rakes)
    });
    
    return { roadDispatch, railDispatch, rakesDispatch };
}

function getPlantRakesDataUpToDate(startDate, endDate) {
    const filteredData = PachhwaraDashboardData.filter(row => {
        const rowDate = parseDMY(row[0]);
        return rowDate >= startDate && rowDate <= endDate;
    });
    
    let ggsstpRakes = 0;
    let ghtpRakes = 0;
    let gatpRakes = 0;
    
    filteredData.forEach(row => {
        ggsstpRakes += Number(row[17]) || 0; // GGSSTP Rakes
        ghtpRakes += Number(row[18]) || 0; // GHTP Rakes
        gatpRakes += Number(row[19]) || 0; // GATP Rakes
    });
    
    const totalRakes = ggsstpRakes + ghtpRakes + gatpRakes;
    
    return { ggsstpRakes, ghtpRakes, gatpRakes, totalRakes };
}

// Helper function to get all available financial years data
function getAllFinancialYearsData() {
    // Get all unique years from the data
    const allYears = new Set();
    PachhwaraDashboardData.forEach(row => {
        const rowDate = parseDMY(row[0]);
        if (rowDate) {
            allYears.add(rowDate.getFullYear());
        }
    });
    
    const sortedYears = Array.from(allYears).sort((a, b) => a - b);
    const fyData = [];
    
    // Generate financial year data for each year
    sortedYears.forEach(year => {
        // Check if we have data for FY starting this year (April onwards)
        const fyStart = new Date(year, 3, 1); // April 1st
        const fyEnd = new Date(year + 1, 2, 31); // March 31st next year
        
        const fyDataset = PachhwaraDashboardData.filter(row => {
            const rowDate = parseDMY(row[0]);
            return rowDate >= fyStart && rowDate <= fyEnd;
        });
        
        if (fyDataset.length > 0) {
            // Calculate coal production and dispatch data
            let coalTarget = 0;
            let coalActual = 0;
            let roadDispatch = 0;
            let railDispatch = 0;
            let totalRakes = 0;
            let ggsstpRakes = 0;
            let ghtpRakes = 0;
            let gatpRakes = 0;
            
            fyDataset.forEach(row => {
                coalTarget += Number(row[2]) || 0; // Coal Production Target
                coalActual += Number(row[3]) || 0; // Coal Actual Production
                roadDispatch += Number(row[7]) || 0; // Road Dispatch
                railDispatch += Number(row[15]) || 0; // Rail Despatch
                totalRakes += Number(row[20]) || 0; // Total Rakes
                ggsstpRakes += Number(row[17]) || 0; // GGSSTP Rakes
                ghtpRakes += Number(row[18]) || 0; // GHTP Rakes
                gatpRakes += Number(row[19]) || 0; // GATP Rakes
            });
            
            const coalAchievement = coalTarget > 0 ? ((coalActual / coalTarget) * 100) : 0;
            
            fyData.push({
                fyLabel: `${year}-${(year + 1).toString().substr(-2)}`,
                fyStartYear: year,
                coalTarget,
                coalActual,
                coalAchievement,
                roadDispatch,
                railDispatch,
                totalRakes,
                ggsstpRakes,
                ghtpRakes,
                gatpRakes,
                totalDispatch: roadDispatch + railDispatch
            });
        }
    });
    
    return fyData.sort((a, b) => a.fyStartYear - b.fyStartYear);
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

// Get stripping ratio data for specified duration
function getStrippingRatioDataForDuration(days) {
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

// Update Stripping Ratio Chart
function updateStrippingRatioChart() {
    const durationRadios = document.querySelectorAll('input[name="strippingRatioDuration"]');
    let selectedDuration = 7;
    
    durationRadios.forEach(radio => {
        if (radio.checked) {
            selectedDuration = parseInt(radio.value);
        }
    });
    
    const data = getStrippingRatioDataForDuration(selectedDuration);
    
    const labels = data.map(row => formatDate(row[0]));
    
    // Calculate stripping ratios for each day
    const strippingRatioData = data.map(row => {
        const obActual = Number(row[10]) || 0;
        const coalActual = Number(row[3]) || 0;
        return coalActual > 0 ? (obActual / coalActual) : 0;
    });
    
    // Show only every nth label to avoid overcrowding
    const labelStep = Math.max(1, Math.floor(labels.length / 10));
    const displayLabels = labels.map((label, index) => 
        index % labelStep === 0 ? label : ''
    );

    const ctx = document.getElementById('strippingRatioDataChart').getContext('2d');
    
    if (strippingRatioChart) {
        strippingRatioChart.data.labels = displayLabels;
        strippingRatioChart.data.datasets[0].data = strippingRatioData;
        strippingRatioChart.update();
    } else {
        strippingRatioChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: displayLabels,
                datasets: [{
                    label: 'Stripping Ratio',
                    data: strippingRatioData,
                    borderColor: '#8e44ad',
                    backgroundColor: 'rgba(142, 68, 173, 0.1)',
                    borderWidth: 1.5,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#f7f3f8ff',
                    pointBorderColor: '#3b1c48ff',
                    pointBorderWidth: 1.5,
                    pointRadius: 1,
                    pointHoverRadius: 5,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Stripping Ratio Trend (Last ${selectedDuration} Days)`,
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#2c3e50'
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#8e44ad',
                        borderWidth: 1,
                        callbacks: {
                            afterLabel: function(context) {
                                const ratio = context.parsed.y;
                                return `Percentage: ${(ratio * 100).toFixed(1)}%`;
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
                            font: {
                                size: 10
                            }
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Stripping Ratio',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                        beginAtZero: true,
                        ticks: {
                            font: {
                                size: 10
                            },
                            callback: function(value) {
                                return value.toFixed(2);
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

// Update both summary and chart
function updateOBData() {
    updateOBSummary();
    updateOBChart();
}

// Initialize the dashboard
function showPachhwaraDashboard() {
    document.getElementById('main-content').innerHTML = `
        <div class="container py-4">
            <div class="row justify-content-center">
                <div class="col-lg-10">
                    <!-- Header Card -->
                    <div class="card custom-card mb-4" id="headerCard" style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); border: none;">
                        <div class="card-body" style="padding: 15px;">
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="text-center flex-grow-1">
                                    <h2 class="card-title mb-2" style="color: white; font-weight: 700; font-size: 24px; margin: 0;">
                                        Daily Progress Report of Pachwara Central Coal Mine
                                    </h2>
                                </div>
                                <div>
                                    <!-- Export Report Options -->
                                    <div class="btn-group" role="group" aria-label="Export Options">
                                        <button type="button" class="btn btn-outline-light btn-sm" 
                                                onclick="exportDailyReportToJPG();" 
                                                title="Export Colorful Daily Report (Full Color)">
                                            <i class="bi bi-file-earmark-image" style="color: #17a2b8;"></i>
                                        </button>
                                        <button type="button" class="btn btn-outline-light btn-sm" 
                                                onclick="exportDailyReportToJPG_BW();" 
                                                title="Export Black & White Daily Report (Ink Saving)">
                                            <i class="bi bi-file-earmark-image" style="color: #000000;"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
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
                                    Coal Stock Summary
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
                    <div class="card custom-card mb-4" id="obCard">
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
                        </div>
                        
                        <div class="text-center mb-3">
                            <button type="button" class="btn btn-link toggle-arrow p-0" id="obToggleArrow" onclick="toggleOBCard()" style="font-size: 18px; text-decoration: none;">
                                <i class="bi bi-chevron-down" style="color: #007bff;"></i>
                            </button>
                        </div>
                        
                        <div id="obExpandableContent" style="display: none;">
                            <div class="card-body pt-0">
                                <div class="mb-3">
                                    <div class="btn-group btn-group-sm" role="group" style="font-size: 12px;">
                                        <input type="radio" class="btn-check" name="duration" id="duration7" value="7" checked onchange="handleDurationChange(event)">
                                        <label class="btn btn-outline-primary" for="duration7" style="padding: 4px 12px; font-size: 11px;">7 Days</label>
                                        
                                        <input type="radio" class="btn-check" name="duration" id="duration15" value="15" onchange="handleDurationChange(event)">
                                        <label class="btn btn-outline-primary" for="duration15" style="padding: 4px 12px; font-size: 11px;">15 Days</label>
                                        
                                        <input type="radio" class="btn-check" name="duration" id="duration30" value="30" onchange="handleDurationChange(event)">
                                        <label class="btn btn-outline-primary" for="duration30" style="padding: 4px 12px; font-size: 11px;">1 Month</label>
                                        
                                        <input type="radio" class="btn-check" name="duration" id="duration60" value="60" onchange="handleDurationChange(event)">
                                        <label class="btn btn-outline-primary" for="duration60" style="padding: 4px 12px; font-size: 11px;">2 Months</label>
                                        
                                        <input type="radio" class="btn-check" name="duration" id="duration90" value="90" onchange="handleDurationChange(event)">
                                        <label class="btn btn-outline-primary" for="duration90" style="padding: 4px 12px; font-size: 11px;">3 Months</label>
                                        
                                        <input type="radio" class="btn-check" name="duration" id="duration180" value="180" onchange="handleDurationChange(event)">
                                        <label class="btn btn-outline-primary" for="duration180" style="padding: 4px 12px; font-size: 11px;">6 Months</label>
                                        
                                        <input type="radio" class="btn-check" name="duration" id="duration365" value="365" onchange="handleDurationChange(event)">
                                        <label class="btn btn-outline-primary" for="duration365" style="padding: 4px 12px; font-size: 11px;">1 Year</label>
                                    </div>
                                    
                                    <div class="float-end">
                                        <button class="btn btn-outline-danger btn-sm me-2" onclick="exportOBToPDF()" title="Export as PDF">
                                            <i class="bi bi-file-earmark-pdf"></i>
                                        </button>
                                        <button class="btn btn-outline-success btn-sm" onclick="exportOBToJPG()" title="Export as JPG">
                                            <i class="bi bi-file-earmark-image"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <div style="height: 300px; position: relative;">
                                    <canvas id="obDataChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Coal Production Card -->
                    <div class="card custom-card" id="coalCard">
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
                        </div>
                        
                        <div class="text-center mb-3">
                            <button type="button" class="btn btn-link toggle-arrow p-0" id="coalToggleArrow" onclick="toggleCoalCard()" style="font-size: 18px; text-decoration: none;">
                                <i class="bi bi-chevron-down" style="color: #007bff;"></i>
                            </button>
                        </div>
                        
                        <div id="coalExpandableContent" style="display: none;">
                            <div class="card-body pt-0">
                                <div class="mb-3">
                                    <div class="btn-group btn-group-sm" role="group" style="font-size: 12px;">
                                        <input type="radio" class="btn-check" name="coalDuration" id="coalDuration7" value="7" checked onchange="handleCoalDurationChange(event)">
                                        <label class="btn btn-outline-primary" for="coalDuration7" style="padding: 4px 12px; font-size: 11px;">7 Days</label>
                                        
                                        <input type="radio" class="btn-check" name="coalDuration" id="coalDuration15" value="15" onchange="handleCoalDurationChange(event)">
                                        <label class="btn btn-outline-primary" for="coalDuration15" style="padding: 4px 12px; font-size: 11px;">15 Days</label>
                                        
                                        <input type="radio" class="btn-check" name="coalDuration" id="coalDuration30" value="30" onchange="handleCoalDurationChange(event)">
                                        <label class="btn btn-outline-primary" for="coalDuration30" style="padding: 4px 12px; font-size: 11px;">1 Month</label>
                                        
                                        <input type="radio" class="btn-check" name="coalDuration" id="coalDuration60" value="60" onchange="handleCoalDurationChange(event)">
                                        <label class="btn btn-outline-primary" for="coalDuration60" style="padding: 4px 12px; font-size: 11px;">2 Months</label>
                                        
                                        <input type="radio" class="btn-check" name="coalDuration" id="coalDuration90" value="90" onchange="handleCoalDurationChange(event)">
                                        <label class="btn btn-outline-primary" for="coalDuration90" style="padding: 4px 12px; font-size: 11px;">3 Months</label>
                                        
                                        <input type="radio" class="btn-check" name="coalDuration" id="coalDuration180" value="180" onchange="handleCoalDurationChange(event)">
                                        <label class="btn btn-outline-primary" for="coalDuration180" style="padding: 4px 12px; font-size: 11px;">6 Months</label>
                                        
                                        <input type="radio" class="btn-check" name="coalDuration" id="coalDuration365" value="365" onchange="handleCoalDurationChange(event)">
                                        <label class="btn btn-outline-primary" for="coalDuration365" style="padding: 4px 12px; font-size: 11px;">1 Year</label>
                                    </div>
                                    
                                    <div class="float-end">
                                        <button class="btn btn-outline-danger btn-sm me-2" onclick="exportCoalToPDF()" title="Export as PDF">
                                            <i class="bi bi-file-earmark-pdf"></i>
                                        </button>
                                        <button class="btn btn-outline-success btn-sm" onclick="exportCoalToJPG()" title="Export as JPG">
                                            <i class="bi bi-file-earmark-image"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <div style="height: 300px; position: relative;">
                                    <canvas id="coalDataChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Stripping Ratio Card -->
                    <div class="card custom-card mt-4" id="strippingRatioCard">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="card-title mb-0" style="color: #2c3e50; font-weight: 600;">
                                    <i class="bi bi-graph-up-arrow" style="color: #8e44ad;"></i>
                                    Stripping Ratio Analysis
                                </h5>
                                <small class="text-muted" style="font-size: 11px; font-weight: 500;">OB/Coal Prod Ratio</small>
                            </div>
                            
                            <table class="table table-sm table-striped mb-0" id="strippingRatioSummaryData" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                <tbody>
                                    <tr><td colspan="4" class="text-center">Loading data...</td></tr>
                                </tbody>
                            </table>
                            
                            <div class="mt-3">
                                <h6 class="mb-2" style="font-size: 12px; font-weight: 600; color: #495057;">
                                    <i class="bi bi-calendar3" style="color: #8e44ad;"></i>
                                    Financial Year Comparison
                                </h6>
                                <table class="table table-sm table-striped mb-0" id="strippingRatioFYData" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                    <tbody>
                                        <tr><td colspan="4" class="text-center">Loading data...</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        <div class="text-center mb-3">
                            <button type="button" class="btn btn-link toggle-arrow p-0" id="strippingRatioToggleArrow" onclick="toggleStrippingRatioCard()" style="font-size: 18px; text-decoration: none;">
                                <i class="bi bi-chevron-down" style="color: #007bff;"></i>
                            </button>
                        </div>
                        
                        <div id="strippingRatioExpandableContent" style="display: none;">
                            <div class="card-body pt-0">
                                <div class="mb-3">
                                    <div class="btn-group btn-group-sm" role="group" style="font-size: 12px;">
                                        <input type="radio" class="btn-check" name="strippingRatioDuration" id="strippingRatioDuration7" value="7" checked onchange="handleStrippingRatioDurationChange(event)">
                                        <label class="btn btn-outline-primary" for="strippingRatioDuration7" style="padding: 4px 12px; font-size: 11px;">7 Days</label>
                                        
                                        <input type="radio" class="btn-check" name="strippingRatioDuration" id="strippingRatioDuration15" value="15" onchange="handleStrippingRatioDurationChange(event)">
                                        <label class="btn btn-outline-primary" for="strippingRatioDuration15" style="padding: 4px 12px; font-size: 11px;">15 Days</label>
                                        
                                        <input type="radio" class="btn-check" name="strippingRatioDuration" id="strippingRatioDuration30" value="30" onchange="handleStrippingRatioDurationChange(event)">
                                        <label class="btn btn-outline-primary" for="strippingRatioDuration30" style="padding: 4px 12px; font-size: 11px;">1 Month</label>
                                        
                                        <input type="radio" class="btn-check" name="strippingRatioDuration" id="strippingRatioDuration60" value="60" onchange="handleStrippingRatioDurationChange(event)">
                                        <label class="btn btn-outline-primary" for="strippingRatioDuration60" style="padding: 4px 12px; font-size: 11px;">2 Months</label>
                                        
                                        <input type="radio" class="btn-check" name="strippingRatioDuration" id="strippingRatioDuration90" value="90" onchange="handleStrippingRatioDurationChange(event)">
                                        <label class="btn btn-outline-primary" for="strippingRatioDuration90" style="padding: 4px 12px; font-size: 11px;">3 Months</label>
                                        
                                        <input type="radio" class="btn-check" name="strippingRatioDuration" id="strippingRatioDuration180" value="180" onchange="handleStrippingRatioDurationChange(event)">
                                        <label class="btn btn-outline-primary" for="strippingRatioDuration180" style="padding: 4px 12px; font-size: 11px;">6 Months</label>
                                        
                                        <input type="radio" class="btn-check" name="strippingRatioDuration" id="strippingRatioDuration365" value="365" onchange="handleStrippingRatioDurationChange(event)">
                                        <label class="btn btn-outline-primary" for="strippingRatioDuration365" style="padding: 4px 12px; font-size: 11px;">1 Year</label>
                                    </div>
                                    
                                    <div class="float-end">
                                        <button class="btn btn-outline-danger btn-sm me-2" onclick="exportStrippingRatioToPDF()" title="Export as PDF">
                                            <i class="bi bi-file-earmark-pdf"></i>
                                        </button>
                                        <button class="btn btn-outline-success btn-sm" onclick="exportStrippingRatioToJPG()" title="Export as JPG">
                                            <i class="bi bi-file-earmark-image"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <div style="height: 300px; position: relative;">
                                    <canvas id="strippingRatioDataChart"></canvas>
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
        
        <!-- Floating Date Picker Widget -->
        <div id="floatingDatePicker" style="
            position: fixed;
            top: 50%;
            right: 20px;
            transform: translateY(-50%);
            z-index: 1050;
            background: linear-gradient(135deg, #007bff, #0056b3);
            border-radius: 50px;
            box-shadow: 0 8px 25px rgba(0,123,255,0.3);
            transition: all 0.3s ease;
            cursor: pointer;
        ">
            <!-- Collapsed State - Calendar Icon -->
            <div id="datePickerCollapsed" style="
                width: 50px;
                height: 50px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 20px;
                border-radius: 50px;
                transition: all 0.3s ease;
            " onclick="toggleFloatingDatePicker()">
                <i class="bi bi-calendar3"></i>
            </div>
            
            <!-- Expanded State - Date Controls -->
            <div id="datePickerExpanded" style="
                display: none;
                background: white;
                border-radius: 25px;
                padding: 15px 20px;
                min-width: 280px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.15);
                border: 2px solid #007bff;
            ">
                <div style="text-align: center; margin-bottom: 12px;">
                    <strong style="color: #007bff; font-size: 14px;">Select Date</strong>
                </div>
                <div class="d-flex align-items-center justify-content-between">
                    <button type="button" class="btn btn-outline-primary btn-sm" 
                            onclick="changeDate(-1)" 
                            style="width: 35px; height: 35px; border-radius: 50%; padding: 0;">
                        <i class="bi bi-chevron-left"></i>
                    </button>
                    <input type="date" class="form-control form-control-sm mx-2" 
                           id="pachhwaraDatePicker" 
                           style="text-align: center; font-weight: 500;"
                           onchange="handleDateChange()">
                    <button type="button" class="btn btn-outline-primary btn-sm" 
                            onclick="changeDate(1)" 
                            style="width: 35px; height: 35px; border-radius: 50%; padding: 0;">
                        <i class="bi bi-chevron-right"></i>
                    </button>
                </div>
                <div style="text-align: center; margin-top: 10px;">
                    <button type="button" class="btn btn-link btn-sm text-muted" 
                            onclick="toggleFloatingDatePicker()" 
                            style="text-decoration: none; font-size: 12px;">
                        Close
                    </button>
                </div>
            </div>
        </div>
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
            // Initialize date picker first
            initializeDatePicker();
            
            // Then load data for the selected date
            updateStockSummary();
            updateOBSummary();
            updateCoalSummary();
            updateStrippingRatioSummary();
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
window.exportOBToPDF = exportOBToPDF;
window.exportOBToJPG = exportOBToJPG;
window.exportCoalToPDF = exportCoalToPDF;
window.exportCoalToJPG = exportCoalToJPG;
window.toggleStrippingRatioCard = toggleStrippingRatioCard;
window.handleStrippingRatioDurationChange = handleStrippingRatioDurationChange;
window.exportStrippingRatioToPDF = exportStrippingRatioToPDF;
window.exportStrippingRatioToJPG = exportStrippingRatioToJPG;
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
window.exportDailyReportToJPG = exportDailyReportToJPG;
window.exportDailyReportToJPG_BW = exportDailyReportToJPG_BW;
window.showPachhwaraDashboard = showPachhwaraDashboard;

// Global variable to store selected date
let selectedDate = null;

// Initialize date picker with yesterday's date
function initializeDatePicker() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    selectedDate = yesterday.toISOString().split('T')[0];
    
    const datePicker = document.getElementById('pachhwaraDatePicker');
    if (datePicker) {
        datePicker.value = selectedDate;
    }
}

// Handle date change from date picker
function handleDateChange() {
    const datePicker = document.getElementById('pachhwaraDatePicker');
    if (datePicker) {
        selectedDate = datePicker.value;
        refreshAllDashboardData();
    }
}

// Change date by days (for prev/next buttons)
function changeDate(days) {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + days);
    selectedDate = currentDate.toISOString().split('T')[0];
    
    const datePicker = document.getElementById('pachhwaraDatePicker');
    if (datePicker) {
        datePicker.value = selectedDate;
    }
    
    refreshAllDashboardData();
}

// Toggle floating date picker visibility
function toggleFloatingDatePicker() {
    const collapsed = document.getElementById('datePickerCollapsed');
    const expanded = document.getElementById('datePickerExpanded');
    const container = document.getElementById('floatingDatePicker');
    
    if (expanded.style.display === 'none') {
        // Show expanded state
        collapsed.style.display = 'none';
        expanded.style.display = 'block';
        container.style.borderRadius = '25px';
        container.style.width = 'auto';
    } else {
        // Show collapsed state
        collapsed.style.display = 'flex';
        expanded.style.display = 'none';
        container.style.borderRadius = '50px';
        container.style.width = '50px';
    }
}

// Get selected date or default to yesterday
function getSelectedDate() {
    if (!selectedDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        selectedDate = yesterday.toISOString().split('T')[0];
    }
    return selectedDate;
}

// Refresh all dashboard data based on selected date
function refreshAllDashboardData() {
    try {
        updateStockSummary();
        updateOBSummary();
        updateCoalSummary();
        updateStrippingRatioSummary();
        updateDispatchSummary();
        updatePlantRakesSummary();
        updateFYDispatchSummary();
        
        // Update charts if they are visible
        if (document.getElementById('stockExpandableContent').style.display !== 'none') {
            updateStockChart();
        }
        if (document.getElementById('obExpandableContent').style.display !== 'none') {
            updateOBChart();
        }
        if (document.getElementById('coalExpandableContent').style.display !== 'none') {
            updateCoalChart();
        }
        if (document.getElementById('plantRakesExpandableContent').style.display !== 'none') {
            updatePlantRakesChart();
        }
        
        console.log(`Dashboard data refreshed for date: ${selectedDate}`);
    } catch (error) {
        console.error('Error refreshing dashboard data:', error);
    }
}

// Make date functions globally available
window.initializeDatePicker = initializeDatePicker;
window.handleDateChange = handleDateChange;
window.changeDate = changeDate;
window.getSelectedDate = getSelectedDate;
window.refreshAllDashboardData = refreshAllDashboardData;
window.toggleFloatingDatePicker = toggleFloatingDatePicker;
