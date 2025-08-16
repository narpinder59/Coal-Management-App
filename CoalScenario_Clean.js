// Clean Coal Scenario Calculator - No checkboxes, no console.log, simplified code

// Global variables
let monthColumns = [1, 2, 3]; // January, February, March by default
let currentMonthCount = 3;
let currentSourceCount = 3;
let isRecalculating = false;

// Table parameters configuration
const tableParameters = [
    { key: 'capacity', label: 'Installed Capacity (MW)', type: 'editable', editable: true },
    { key: 'plf', label: 'PLF (%)', type: 'editable', editable: true },
    { key: 'unitsGenerated', label: 'Units Generated (MU)', type: 'calculated', editable: false },
    { key: 'scc', label: 'SCC (kg/kWh)', type: 'editable', editable: true },
    { key: 'coalConsumption', label: 'Coal Consumption (MT)', type: 'calculated', editable: false },
    { key: 'openingStock', label: 'Opening Stock (MT)', type: 'editable', editable: true },
    { key: 'coalAvailable', label: 'Coal Available (MT)', type: 'editable', editable: true },
    { key: 'closingStock', label: 'Closing Stock (MT)', type: 'calculated', editable: false },
    { key: 'stockInDays', label: 'Stock in Days', type: 'calculated', editable: false }
];

// DOM elements
const coalAddRowBtn = document.getElementById('addRowBtn');
const coalClearValuesBtn = document.getElementById('clearValuesBtn');
const clearSourceValuesBtn = document.getElementById('clearSourceValuesBtn');
const copyTotalsButton = document.getElementById('copyTotalsButton');
const coalSourceTableBody = document.querySelector('#coalSourcesTableBody');
const coalSourcesTableBody = document.getElementById('coalSourcesTableBody');

// Month management functions
function getMonthName(monthNumber) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthNumber - 1] || 'Unknown';
}

function getNextMonth(currentMonth) {
    return currentMonth === 12 ? 1 : currentMonth + 1;
}

function getCurrentMonth() {
    return new Date().getMonth() + 1;
}

// Table creation functions
function createTransposedTable() {
    const table = document.getElementById('Table1');
    if (!table) return;

    table.innerHTML = '';
    buildTransposedTable();
}

function buildTransposedTable() {
    const table = document.getElementById('Table1');
    if (!table) return;

    const thead = table.querySelector('thead') || table.appendChild(document.createElement('thead'));
    const tbody = table.querySelector('tbody') || table.appendChild(document.createElement('tbody'));
    const tfoot = table.querySelector('tfoot') || table.appendChild(document.createElement('tfoot'));

    tbody.id = 'tbody';
    
    buildHeaderRow(thead);
    buildParameterRows(tbody);
    buildFooterRow(tfoot);
}

function buildHeaderRow(thead) {
    thead.innerHTML = '';
    const headerRow = document.createElement('tr');
    
    // Parameter column header
    const paramHeader = document.createElement('th');
    paramHeader.textContent = 'Parameter';
    paramHeader.style.minWidth = '200px';
    headerRow.appendChild(paramHeader);
    
    // Month column headers
    let year = new Date().getFullYear();
    monthColumns.forEach((month, index) => {
        const monthHeader = document.createElement('th');
        monthHeader.textContent = `${getMonthName(month)}-${year}`;
        monthHeader.style.minWidth = '120px';
        
        // Add remove button for months after the first one
        if (index > 0) {
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '×';
            removeBtn.className = 'btn btn-sm btn-danger ms-2';
            removeBtn.onclick = () => removeMonth(index);
            monthHeader.appendChild(removeBtn);
        }
        
        headerRow.appendChild(monthHeader);
        
        if (getMonthName(month) === 'December') {
            year++;
        }
    });
    
    // Total column header
    const totalHeader = document.createElement('th');
    totalHeader.textContent = 'Total';
    totalHeader.style.minWidth = '120px';
    headerRow.appendChild(totalHeader);
    
    thead.appendChild(headerRow);
}

function buildParameterRows(tbody) {
    tbody.innerHTML = '';
    
    tableParameters.forEach((param, paramIndex) => {
        const row = document.createElement('tr');
        
        // Parameter label cell
        const labelCell = document.createElement('td');
        labelCell.textContent = param.label;
        labelCell.style.fontWeight = 'bold';
        labelCell.style.backgroundColor = '#f8f9fa';
        row.appendChild(labelCell);
        
        // Month data cells
        monthColumns.forEach((month, monthIndex) => {
            const cell = createDataCell(param, monthIndex, paramIndex);
            row.appendChild(cell);
        });
        
        // Total cell
        const totalCell = document.createElement('td');
        totalCell.id = `total-${param.key}`;
        totalCell.style.fontWeight = 'bold';
        totalCell.style.backgroundColor = '#e9ecef';
        totalCell.style.textAlign = 'center';
        totalCell.textContent = '0.00';
        row.appendChild(totalCell);
        
        tbody.appendChild(row);
    });
}

function createDataCell(param, monthIndex, paramIndex) {
    const cell = document.createElement('td');
    cell.style.textAlign = 'center';
    cell.style.padding = '8px';
    
    if (param.editable) {
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.step = '0.01';
        input.className = 'form-control form-control-sm';
        input.style.textAlign = 'center';
        input.placeholder = '0';
        
        input.addEventListener('input', () => {
            recalculateColumn(monthIndex);
        });
        
        cell.appendChild(input);
    } else {
        const span = document.createElement('span');
        span.textContent = '0.00';
        span.style.fontWeight = 'bold';
        cell.appendChild(span);
    }
    
    return cell;
}

function buildFooterRow(tfoot) {
    tfoot.innerHTML = '';
}

// Month management
function addMonth() {
    const currentValues = preserveTableValues();
    
    const lastMonth = monthColumns[monthColumns.length - 1];
    const nextMonth = getNextMonth(lastMonth);
    monthColumns.push(nextMonth);
    currentMonthCount++;
    
    buildTransposedTable();
    restoreTableValues(currentValues);
    addMonthToCoalSources(getMonthName(nextMonth));
    recalculateAllColumns();
}

function removeMonth(monthIndex) {
    if (monthColumns.length <= 1) return;
    
    const confirmation = confirm('Are you sure you want to remove this month?');
    if (confirmation) {
        monthColumns.splice(monthIndex, 1);
        currentMonthCount--;
        buildTransposedTable();
        updateCoalSourcesTable();
        recalculateAllColumns();
    }
}

function preserveTableValues() {
    const tbody = document.querySelector('#tbody');
    if (!tbody) return {};
    
    const values = {};
    
    tableParameters.forEach((param, paramIndex) => {
        values[param.key] = [];
        const row = tbody.children[paramIndex];
        if (row) {
            for (let monthIndex = 0; monthIndex < monthColumns.length; monthIndex++) {
                const cell = row.children[monthIndex + 1];
                const input = cell?.querySelector('input');
                values[param.key][monthIndex] = input ? input.value : '';
            }
        }
    });
    
    return values;
}

function restoreTableValues(values) {
    const tbody = document.querySelector('#tbody');
    if (!tbody || !values) return;
    
    tableParameters.forEach((param, paramIndex) => {
        if (values[param.key]) {
            const row = tbody.children[paramIndex];
            if (row) {
                for (let monthIndex = 0; monthIndex < Math.min(monthColumns.length, values[param.key].length); monthIndex++) {
                    const cell = row.children[monthIndex + 1];
                    const input = cell?.querySelector('input');
                    if (input && values[param.key][monthIndex]) {
                        input.value = values[param.key][monthIndex];
                    }
                }
            }
        }
    });
}

// Coal Sources Table Management
function updateCoalSourcesTable() {
    const coalSourcesTableBody = document.getElementById('coalSourcesTableBody');
    if (!coalSourcesTableBody) return;
    
    coalSourcesTableBody.innerHTML = '';
    
    monthColumns.forEach(month => {
        addMonthToCoalSources(getMonthName(month));
    });
}

function addMonthToCoalSources(monthName) {
    const coalSourcesTableBody = document.getElementById('coalSourcesTableBody');
    if (!coalSourcesTableBody) return;
    
    const newRow = document.createElement('tr');
    
    const monthCell = document.createElement('td');
    monthCell.textContent = monthName;
    newRow.appendChild(monthCell);
    
    for (let i = 0; i < currentSourceCount; i++) {
        const coalSourceCell = document.createElement('td');
        coalSourceCell.contentEditable = true;
        coalSourceCell.textContent = '';
        coalSourceCell.addEventListener('input', restrictToNumbers);
        coalSourceCell.addEventListener('blur', updateCoalSourceTotals);
        newRow.appendChild(coalSourceCell);
    }
    
    const totalCell = document.createElement('td');
    totalCell.textContent = '0.00';
    totalCell.style.fontWeight = 'bold';
    totalCell.style.backgroundColor = '#f8f9fa';
    newRow.appendChild(totalCell);
    
    coalSourcesTableBody.appendChild(newRow);
}

function addSourceColumn() {
    currentSourceCount++;
    const sourceNumber = currentSourceCount;
    
    const coalSourcesTable = document.querySelector('#coalSourcesTableBody').parentElement;
    if (!coalSourcesTable) return;
    
    const headerRow = coalSourcesTable.querySelector('thead tr');
    if (headerRow) {
        const totalHeader = headerRow.querySelector('th:last-child');
        if (totalHeader) {
            const newSourceHeader = document.createElement('th');
            newSourceHeader.textContent = `Source ${sourceNumber}`;
            newSourceHeader.contentEditable = true;
            headerRow.insertBefore(newSourceHeader, totalHeader);
        }
    }
    
    const coalSourcesTableBody = document.getElementById('coalSourcesTableBody');
    if (coalSourcesTableBody) {
        const rows = coalSourcesTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const totalCell = row.querySelector('td:last-child');
            if (totalCell) {
                const newSourceCell = document.createElement('td');
                newSourceCell.contentEditable = true;
                newSourceCell.textContent = '';
                newSourceCell.addEventListener('input', restrictToNumbers);
                newSourceCell.addEventListener('blur', updateCoalSourceTotals);
                row.insertBefore(newSourceCell, totalCell);
            }
        });
    }
    
    updateCoalSourceTotals();
}

function restrictToNumbers(event) {
    const input = event.target;
    let value = input.textContent;
    
    value = value.replace(/[^0-9.]/g, '');
    
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    if (value !== '' && parseFloat(value) < 0) {
        value = '0';
    }
    
    if (input.textContent !== value) {
        input.textContent = value;
        
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(input);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

function updateCoalSourceTotals() {
    const coalSourcesTableBody = document.getElementById('coalSourcesTableBody');
    if (!coalSourcesTableBody) return;
    
    const rows = coalSourcesTableBody.querySelectorAll('tr');
    rows.forEach((row) => {
        let total = 0;
        const cells = row.querySelectorAll('td');
        
        for (let i = 1; i <= currentSourceCount; i++) {
            const cell = cells[i];
            if (cell) {
                const value = parseFloat(cell.textContent) || 0;
                total += value;
            }
        }
        
        const totalCell = cells[cells.length - 1];
        if (totalCell) {
            totalCell.textContent = total.toFixed(2);
        }
    });
}

// Calculation functions
function recalculateColumn(monthIndex) {
    const tbody = document.querySelector('#tbody');
    if (!tbody) return;
    
    const columnData = getColumnData(monthIndex);
    
    const unitsGenerated = calculateUnitsGenerated(
        columnData.capacity, 
        columnData.plf, 
        monthColumns[monthIndex]
    );
    
    const coalConsumption = calculateCoalConsumption(
        unitsGenerated,
        columnData.scc
    );
    
    let openingStockValue = columnData.openingStock;
    if (monthIndex > 0 && !isRecalculating) {
        const freshColumnData = getColumnData(monthIndex);
        openingStockValue = freshColumnData.openingStock;
    }
    
    const closingStock = calculateClosingStock(
        columnData.coalAvailable,
        openingStockValue,
        coalConsumption
    );
    
    const stockInDays = coalConsumption > 0 ? (closingStock / (coalConsumption / 30)) : 0;
    
    updateCalculatedCell('unitsGenerated', monthIndex, unitsGenerated);
    updateCalculatedCell('coalConsumption', monthIndex, coalConsumption);
    updateCalculatedCell('closingStock', monthIndex, closingStock);
    updateCalculatedCell('stockInDays', monthIndex, stockInDays);
    
    if (monthIndex < monthColumns.length - 1) {
        updateOpeningStock(monthIndex + 1, closingStock);
    }
}

function getColumnData(monthIndex) {
    const tbody = document.querySelector('#tbody');
    const data = {};
    
    tableParameters.forEach((param, paramIndex) => {
        const row = tbody.children[paramIndex];
        const cell = row.children[monthIndex + 1];
        
        if (param.editable) {
            const input = cell.querySelector('input');
            data[param.key] = parseFloat(input?.value) || 0;
        } else if (param.type === 'calculated') {
            const span = cell.querySelector('span');
            data[param.key] = parseFloat(span?.textContent) || 0;
        }
    });
    
    return data;
}

function calculateUnitsGenerated(capacity, plf, month) {
    const daysInMonth = new Date(new Date().getFullYear(), month, 0).getDate();
    return (capacity * 24 * plf * daysInMonth) / 1000;
}

function calculateCoalConsumption(unitsGenerated, scc) {
    return unitsGenerated * scc * 10;
}

function calculateClosingStock(coalAvailable, openingStock, coalConsumption) {
    return coalAvailable + openingStock - coalConsumption;
}

function updateCalculatedCell(paramKey, monthIndex, value) {
    const tbody = document.querySelector('#tbody');
    const paramIndex = tableParameters.findIndex(p => p.key === paramKey);
    if (paramIndex === -1) return;
    
    const row = tbody.children[paramIndex];
    const cell = row.children[monthIndex + 1];
    const span = cell.querySelector('span');
    
    if (span) {
        span.textContent = value.toFixed(2);
        
        if (paramKey === 'closingStock') {
            if (value < 0) {
                span.style.color = 'red';
                span.style.fontWeight = 'bold';
            } else {
                span.style.color = 'black';
                span.style.fontWeight = 'bold';
            }
        }
    }
}

function updateOpeningStock(monthIndex, closingStock) {
    const tbody = document.querySelector('#tbody');
    const openingStockParamIndex = tableParameters.findIndex(p => p.key === 'openingStock');
    if (openingStockParamIndex === -1) return;
    
    const row = tbody.children[openingStockParamIndex];
    const cell = row.children[monthIndex + 1];
    const input = cell.querySelector('input');
    
    if (input) {
        input.value = closingStock.toFixed(2);
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

function recalculateAllColumns() {
    isRecalculating = true;
    
    for (let i = 0; i < monthColumns.length; i++) {
        recalculateColumn(i);
    }
    
    isRecalculating = false;
    updateTotals();
    checkForNegativeClosingStock();
}

function updateTotals() {
    const totalsToCalculate = ['unitsGenerated', 'coalConsumption', 'coalAvailable'];
    
    totalsToCalculate.forEach(paramKey => {
        const paramIndex = tableParameters.findIndex(p => p.key === paramKey);
        if (paramIndex === -1) return;
        
        let total = 0;
        for (let monthIndex = 0; monthIndex < monthColumns.length; monthIndex++) {
            const columnData = getColumnData(monthIndex);
            total += columnData[paramKey] || 0;
        }
        
        const totalElement = document.getElementById(`total-${paramKey}`);
        if (totalElement) {
            totalElement.textContent = total.toFixed(2);
        }
    });
}

function checkForNegativeClosingStock() {
    let negativeStockDetected = false;
    let negativeStockDate = null;
    
    for (let monthIndex = 0; monthIndex < monthColumns.length; monthIndex++) {
        const columnData = getColumnData(monthIndex);
        const month = monthColumns[monthIndex];
        
        if (columnData.closingStock < 0) {
            negativeStockDetected = true;
            const date = calculateNegativeStockDate(month, columnData.openingStock, columnData.unitsGenerated, columnData.scc, columnData.coalAvailable);
            if (date) {
                negativeStockDate = date.toDateString();
                break;
            }
        }
    }
    
    const closingStockWarning = document.getElementById('closingStockWarning');
    if (closingStockWarning) {
        if (negativeStockDetected) {
            closingStockWarning.style.display = 'block';
            closingStockWarning.textContent = `Warning: Coal Stock will exhaust on: ${negativeStockDate}`;
        } else {
            closingStockWarning.style.display = 'none';
            closingStockWarning.textContent = '';
        }
    }
}

function calculateNegativeStockDate(month, openingStock, coalUnitsGenerated, coalScc, coalAvailable) {
    if (openingStock < 0) return null;
    
    const daysInMonth = new Date(new Date().getFullYear(), month, 0).getDate();
    const coalRequirementPerDay = (coalUnitsGenerated * coalScc * 10) / daysInMonth;
    const coalAvailablePerDay = coalAvailable / daysInMonth;
    
    for (let day = 1; day <= daysInMonth; day++) {
        const closingStockDateCheck = openingStock + (coalAvailablePerDay - coalRequirementPerDay);
        openingStock = closingStockDateCheck;
        
        if (closingStockDateCheck < 0) {
            return new Date(new Date().getFullYear(), month - 1, day);
        }
    }
    
    return null;
}

// Copy function
function copyCoalAvailabilityToFirstTable() {
    const coalSourcesTableBody = document.getElementById('coalSourcesTableBody');
    const tbody = document.querySelector('#tbody');
    
    if (!coalSourcesTableBody || !tbody) return;
    
    const sourceRows = coalSourcesTableBody.querySelectorAll('tr');
    const coalAvailableParamIndex = tableParameters.findIndex(p => p.key === 'coalAvailable');
    
    if (coalAvailableParamIndex === -1) return;
    
    const coalAvailableRow = tbody.children[coalAvailableParamIndex];
    if (!coalAvailableRow) return;
    
    monthColumns.forEach((month, monthIndex) => {
        const monthName = getMonthName(month);
        let monthTotal = 0;
        
        let matchingRow = null;
        sourceRows.forEach((row) => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 0) {
                const rowMonthName = cells[0].textContent.trim();
                if (rowMonthName.toLowerCase() === monthName.toLowerCase()) {
                    matchingRow = row;
                }
            }
        });
        
        if (matchingRow) {
            const cells = matchingRow.querySelectorAll('td');
            const totalCell = cells[cells.length - 1];
            if (totalCell) {
                monthTotal = parseFloat(totalCell.textContent) || 0;
            }
        }
        
        const targetCellIndex = monthIndex + 1;
        const targetCell = coalAvailableRow.children[targetCellIndex];
        
        if (targetCell) {
            const input = targetCell.querySelector('input');
            if (input) {
                input.value = monthTotal.toFixed(2);
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
    });
    
    setTimeout(() => {
        recalculateAllColumns();
    }, 100);
}

// Clear functions
function clearValuesInCoalTableBody() {
    const tbody = document.querySelector('#tbody');
    if (!tbody) return;
    
    const inputs = tbody.querySelectorAll('input');
    inputs.forEach(input => {
        input.value = '';
    });
    
    recalculateAllColumns();
}

function clearValuesInTableBody(tableBody) {
    if (!tableBody) return;
    
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
        const inputCells = row.querySelectorAll('td[contenteditable="true"]');
        inputCells.forEach(cell => {
            cell.textContent = '';
        });
    });
    
    updateCoalSourceTotals();
}

// PDF Generation
function generatePDFForCoalScenario() {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
    });
    
    let yPosition = 15;
    const powerplantName = document.getElementById('powerplantName')?.value || 'Power Plant';
    
    // Generate main table
    const tbody = document.querySelector('#tbody');
    if (tbody) {
        let year = new Date().getFullYear();
        const headerRow = ['Parameter'];
        monthColumns.forEach(month => {
            headerRow.push(`${getMonthName(month)}-${year}`);
            if (getMonthName(month) === 'December') {
                year++;
            }
        });
        
        const content = [headerRow];
        
        tableParameters.forEach(param => {
            const row = [param.label];
            for (let monthIndex = 0; monthIndex < monthColumns.length; monthIndex++) {
                const columnData = getColumnData(monthIndex);
                const value = columnData[param.key] || 0;
                row.push(typeof value === 'number' ? value.toFixed(2) : value);
            }
            content.push(row);
        });
        
        doc.autoTable({
            head: [content[0]],
            body: content.slice(1),
            startY: yPosition,
            theme: 'striped',
            styles: {
                fontSize: 9,
                overflow: 'linebreak',
            },
            headStyles: { fillColor: [95, 135, 158], halign: 'center' },
            columnStyles: {
                0: { halign: 'left', cellWidth: 40 }
            }
        });
        
        doc.setFontSize(14);
        doc.text(15, yPosition - 5, `Coal Scenario at ${powerplantName}`);
        yPosition = doc.autoTable.previous.finalY + 20;
    }
    
    // Generate coal sources table
    const coalSourcesTableBody = document.getElementById('coalSourcesTableBody');
    if (coalSourcesTableBody) {
        let year = new Date().getFullYear();
        const headerRow = ['Month'];
        for (let i = 1; i <= currentSourceCount; i++) {
            headerRow.push(`Source ${i}`);
        }
        headerRow.push('Total');
        
        const content = [headerRow];
        const rows = coalSourcesTableBody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const rowData = [];
            const cells = row.querySelectorAll('td');
            cells.forEach(cell => {
                rowData.push(cell.textContent);
            });
            content.push(rowData);
        });
        
        doc.autoTable({
            head: [content[0]],
            body: content.slice(1),
            startY: yPosition,
            theme: 'striped',
            styles: {
                fontSize: 9,
                overflow: 'linebreak',
            },
            headStyles: { fillColor: [95, 135, 158], halign: 'center' },
            columnStyles: {
                0: { halign: 'left', cellWidth: 40 }
            }
        });
        
        doc.setFontSize(14);
        doc.text(15, yPosition - 5, `Coal Availability at ${powerplantName}`);
    }
    
    doc.save('CoalScenario.pdf');
}

// Initialize the calculator
function initializeCoalScenarioCalculator() {
    createTransposedTable();
    
    if (monthColumns.length > 0) {
        addMonthToCoalSources(getMonthName(monthColumns[0]));
    }
    
    if (coalClearValuesBtn) {
        coalClearValuesBtn.addEventListener('click', function () {
            const confirmation = confirm('Are you sure you want to clear all values?');
            if (confirmation) {
                clearValuesInCoalTableBody();
            }
        });
    }
    
    if (clearSourceValuesBtn) {
        clearSourceValuesBtn.addEventListener('click', () => {
            const confirmation = confirm('Are you sure you want to clear all values in the source table?');
            if (confirmation) {
                clearValuesInTableBody(coalSourceTableBody);
            }
        });
    }
    
    if (coalAddRowBtn) {
        coalAddRowBtn.replaceWith(coalAddRowBtn.cloneNode(true));
        const newAddBtn = document.getElementById('addRowBtn');
        newAddBtn.addEventListener('click', () => {
            addMonth();
        });
    }
    
    if (copyTotalsButton) {
        copyTotalsButton.addEventListener('click', copyCoalAvailabilityToFirstTable);
    }
    
    if (coalSourcesTableBody) {
        coalSourcesTableBody.addEventListener('input', updateCoalSourceTotals);
    }
    
    recalculateAllColumns();
    updateCoalSourceTotals();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('Table1')) {
        setTimeout(() => {
            initializeCoalScenarioCalculator();
        }, 100);
    }
});

// Export functions for global access
window.generatePDFForCoalScenario = generatePDFForCoalScenario;
window.addMonth = addMonth;
window.clearValuesInCoalTableBody = clearValuesInCoalTableBody;
window.copyCoalAvailabilityToFirstTable = copyCoalAvailabilityToFirstTable;
window.addSourceColumn = addSourceColumn;
