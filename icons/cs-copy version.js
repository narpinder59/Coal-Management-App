/**
 * Coal Scenario Calculator - Mobile Responsive Transposed Layout
 * Calculates closing coal stock during the month based on inputs
 * Features: Transposed table (months as columns), dynamic columns, PDF generation
 */

// DOM Elements
const coalTableBody = document.querySelector('#tbody');
const coalAddRowBtn = document.getElementById('addRowBtn');
const coalClearValuesBtn = document.getElementById('clearValuesBtn');
const clearSourceValuesBtn = document.getElementById('clearSourceValuesBtn');
const copyQuantityCheckbox = document.getElementById('copyQuantityCheckbox');
const coalSourceTableBody = document.querySelector('#coalSourcesTableBody');
const coalSourcesTableBody = document.getElementById('coalSourcesTableBody');
const copyTotalsButton = document.getElementById('copyTotalsButton');

// Global Variables for Transposed Layout
let monthColumns = [];
let currentMonthCount = 0;
let currentSourceCount = 5; // Track number of source columns (default 5)
let isRecalculating = false;
let originalNegativeStockDate = null;

// Parameter definitions for transposed table
const tableParameters = [
    { key: 'capacity', label: 'Generation Capacity (MW)', type: 'number', editable: true },
    { key: 'plf', label: 'PLF (%)', type: 'number', editable: true, max: 100 },
    { key: 'unitsGenerated', label: 'Units Generated (MUs)', type: 'calculated', editable: false },
    { key: 'scc', label: 'Specific Coal Consumption (kg/kWh)', type: 'number', editable: true },
    { key: 'coalConsumption', label: 'Coal Requirement (MT)', type: 'calculated', editable: false },
    { key: 'coalAvailable', label: 'Coal Available (MT)', type: 'number', editable: true },
    { key: 'openingStock', label: 'Opening Coal Stock (MT)', type: 'number', editable: true },
    { key: 'closingStock', label: 'Closing Coal Stock (MT)', type: 'calculated', editable: false },
    { key: 'stockInDays', label: 'Closing Coal Stock (Days)', type: 'calculated', editable: false }
];

// Mobile-responsive Input Styles Configuration
const inputStyles = {
    width: '80px',
    fontSize: '11px',
    fontWeight: 'bold',
    backgroundColor: 'lightgreen',
    color: 'black',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '4px',
    margin: '2px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    minWidth: '60px'
};

const calculatedCellStyles = {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: '#f8f9fa',
    padding: '4px',
    textAlign: 'center',
    minWidth: '60px'
};

// Utility Functions
function getMonthName(monthNumber) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
}

function getMonthNumberFromName(monthName) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const index = months.findIndex(month => month.toLowerCase() === monthName.toLowerCase());
    return index === -1 ? -1 : index + 1;
}

function getNextMonth(currentMonth) {
    return currentMonth % 12 + 1;
}

function navigateVertically(currentInput, isShiftKey) {
    const tbody = document.querySelector('#tbody');
    if (!tbody) return;
    
    const currentCell = currentInput.closest('td');
    const currentRow = currentCell.closest('tr');
    const currentRowIndex = Array.from(tbody.children).indexOf(currentRow);
    const currentCellIndex = Array.from(currentRow.children).indexOf(currentCell);
    
    let targetRowIndex;
    let targetInput = null;
    
    if (isShiftKey) {
        // Move up
        targetRowIndex = currentRowIndex - 1;
        
        // Search for input field going upward
        while (targetRowIndex >= 0 && !targetInput) {
            const targetRow = tbody.children[targetRowIndex];
            const targetCell = targetRow.children[currentCellIndex];
            targetInput = targetCell?.querySelector('input');
            
            if (!targetInput) {
                targetRowIndex--;
            }
        }
        
        // If no input found in current column, move to previous column
        if (!targetInput && targetRowIndex < 0) {
            const previousColumnIndex = currentCellIndex - 1;
            if (previousColumnIndex > 0) { // Don't go to parameter label column
                // Start from bottom of previous column
                for (let rowIndex = tbody.children.length - 1; rowIndex >= 0; rowIndex--) {
                    const targetRow = tbody.children[rowIndex];
                    const targetCell = targetRow.children[previousColumnIndex];
                    const possibleInput = targetCell?.querySelector('input');
                    if (possibleInput) {
                        targetInput = possibleInput;
                        break;
                    }
                }
            }
        }
    } else {
        // Move down
        targetRowIndex = currentRowIndex + 1;
        
        // Search for input field going downward
        while (targetRowIndex < tbody.children.length && !targetInput) {
            const targetRow = tbody.children[targetRowIndex];
            const targetCell = targetRow.children[currentCellIndex];
            targetInput = targetCell?.querySelector('input');
            
            if (!targetInput) {
                targetRowIndex++;
            }
        }
        
        // If no input found in current column, move to next column
        if (!targetInput && targetRowIndex >= tbody.children.length) {
            const nextColumnIndex = currentCellIndex + 1;
            if (nextColumnIndex < currentRow.children.length - 1) { // Don't go to action column
                // Start from top of next column
                for (let rowIndex = 0; rowIndex < tbody.children.length; rowIndex++) {
                    const targetRow = tbody.children[rowIndex];
                    const targetCell = targetRow.children[nextColumnIndex];
                    const possibleInput = targetCell?.querySelector('input');
                    if (possibleInput) {
                        targetInput = possibleInput;
                        break;
                    }
                }
            }
        }
    }
    
    // Focus the found input
    if (targetInput) {
        targetInput.focus();
    }
}

function getNumericCellValue(cell) {
    if (!cell) return 0;
    const textContent = cell.textContent || cell.value || '0';
    return parseFloat(textContent.replace(/,/g, '').trim()) || 0;
}

// Transposed Table Creation Functions
function createTransposedTable() {
    const table = document.getElementById('Table1');
    if (!table) return;

    // Clear existing table
    table.innerHTML = '';
    
    // Create table structure
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    const tfoot = document.createElement('tfoot');
    
    table.appendChild(thead);
    table.appendChild(tbody);
    table.appendChild(tfoot);
    
    // Set table ID for reference
    tbody.id = 'tbody';
    
    // Initialize with current month if no months are set
    if (monthColumns.length === 0) {
        const currentMonth = getCurrentMonth();
        monthColumns = [currentMonth];
        currentMonthCount = 1;
    }
    
    buildTransposedTable();
}

function getCurrentMonth() {
    return new Date().getMonth() + 1; // 1-12
}

function buildTransposedTable() {
    const table = document.getElementById('Table1');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    const tfoot = table.querySelector('tfoot');
    
    // Clear existing content
    thead.innerHTML = '';
    tbody.innerHTML = '';
    tfoot.innerHTML = '';
    
    // Build header row
    buildHeaderRow(thead);
    
    // Build parameter rows
    buildParameterRows(tbody);
    
    // Build footer row
    buildFooterRow(tfoot);
    
    // Enable dynamic copy functionality
    setTimeout(() => {
        enableDynamicCopy();
    }, 50);
}

function buildHeaderRow(thead) {
    const headerRow = document.createElement('tr');
    
    // Parameter column header
    const paramHeader = document.createElement('th');
    paramHeader.textContent = 'Parameter';
    paramHeader.style.minWidth = '150px';
    paramHeader.style.position = 'sticky';
    paramHeader.style.left = '0';
    paramHeader.style.backgroundColor = '#f8f9fa';
    paramHeader.style.zIndex = '10';
    headerRow.appendChild(paramHeader);
    
    // Month column headers
    monthColumns.forEach((month, index) => {
        const monthHeader = document.createElement('th');
        monthHeader.style.minWidth = '120px';
        monthHeader.style.textAlign = 'center';
        monthHeader.style.backgroundColor = '#5f879e';
        monthHeader.style.color = 'white';
        monthHeader.style.padding = '8px';
        
        if (index === 0) {
            // First month header with dropdown
            const headerContainer = document.createElement('div');
            headerContainer.style.display = 'flex';
            headerContainer.style.flexDirection = 'column';
            headerContainer.style.alignItems = 'center';
            headerContainer.style.gap = '4px';
            
            const monthSelect = document.createElement('select');
            monthSelect.className = 'form-select form-select-sm';
            monthSelect.style.backgroundColor = 'white';
            monthSelect.style.color = 'black';
            monthSelect.style.fontSize = '11px';
            monthSelect.style.border = 'none';
            monthSelect.style.borderRadius = '4px';
            monthSelect.style.padding = '2px 4px';
            monthSelect.style.minWidth = '90px';
            
            // Add month options
            for (let i = 1; i <= 12; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = getMonthName(i);
                if (i === month) {
                    option.selected = true;
                }
                monthSelect.appendChild(option);
            }
            
            monthSelect.addEventListener('change', (e) => {
                const newMonth = parseInt(e.target.value);
                updateFirstMonth(newMonth);
            });
            
            headerContainer.appendChild(monthSelect);
            monthHeader.appendChild(headerContainer);
        } else {
            // Regular month headers with remove button
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '×';
            removeBtn.className = 'btn btn-sm btn-outline-light ms-1';
            removeBtn.style.fontSize = '12px';
            removeBtn.style.padding = '0 4px';
            removeBtn.onclick = () => removeMonth(index);
            
            const headerContainer = document.createElement('div');
            headerContainer.style.display = 'flex';
            headerContainer.style.alignItems = 'center';
            headerContainer.style.justifyContent = 'center';
            headerContainer.appendChild(document.createTextNode(getMonthName(month)));
            headerContainer.appendChild(removeBtn);
            
            monthHeader.appendChild(headerContainer);
        }
        
        headerRow.appendChild(monthHeader);
    });
    
    // Total column header
    const totalHeader = document.createElement('th');
    totalHeader.textContent = 'Total';
    totalHeader.style.minWidth = '120px';
    totalHeader.style.textAlign = 'center';
    totalHeader.style.backgroundColor = '#28a745';
    totalHeader.style.color = 'white';
    totalHeader.style.fontWeight = 'bold';
    totalHeader.style.padding = '8px';
    headerRow.appendChild(totalHeader);
    
    thead.appendChild(headerRow);
}

function buildParameterRows(tbody) {
    tableParameters.forEach((param, paramIndex) => {
        const row = document.createElement('tr');
        
        // Parameter label cell (sticky)
        const labelCell = document.createElement('td');
        labelCell.textContent = param.label;
        labelCell.style.fontWeight = 'bold';
        labelCell.style.backgroundColor = '#f8f9fa';
        labelCell.style.position = 'sticky';
        labelCell.style.left = '0';
        labelCell.style.zIndex = '5';
        labelCell.style.borderRight = '2px solid #dee2e6';
        row.appendChild(labelCell);
        
        // Month data cells
        monthColumns.forEach((month, monthIndex) => {
            const dataCell = createDataCell(param, monthIndex, paramIndex);
            row.appendChild(dataCell);
        });
        
        // Total cell - only for Units Generated, Coal Requirement, and Coal Available
        const totalCell = document.createElement('td');
        totalCell.style.textAlign = 'center';
        totalCell.style.fontWeight = 'bold';
        totalCell.style.backgroundColor = '#f8f9fa';
        totalCell.style.border = '1px solid #dee2e6';
        totalCell.style.padding = '8px';
        totalCell.id = `total-${param.key}`;
        
        if (param.key === 'unitsGenerated' || param.key === 'coalConsumption' || param.key === 'coalAvailable') {
            totalCell.textContent = '0.00';
            totalCell.style.backgroundColor = '#e7f3ff';
            totalCell.style.color = '#0066cc';
        } else {
            totalCell.textContent = '-';
            totalCell.style.color = '#6c757d';
        }
        
        row.appendChild(totalCell);
        
        tbody.appendChild(row);
    });
}

function createDataCell(param, monthIndex, paramIndex) {
    const cell = document.createElement('td');
    cell.style.textAlign = 'center';
    cell.style.minWidth = '100px';
    cell.style.verticalAlign = 'middle';
    cell.style.padding = '8px';
    
    if (param.editable) {
        // Create input for editable cells
        const input = document.createElement('input');
        input.type = param.type;
        input.className = 'form-control form-control-sm';
        
        // Apply mobile-responsive styles with center alignment
        Object.assign(input.style, inputStyles);
        input.style.textAlign = 'center';
        input.style.margin = '0 auto';
        input.style.display = 'block';
        
        // Set tabindex for vertical tab navigation
        const tabIndex = (monthIndex * tableParameters.length) + paramIndex + 1;
        input.tabIndex = tabIndex;
        
        // Set attributes
        if (param.key === 'plf') {
            input.max = 100;
            input.min = 0;
        }
        if (param.type === 'number') {
            input.step = '0.01';
            input.min = 0;
        }
        
        // Add event listeners
        input.addEventListener('keypress', (e) => {
            // Allow only numbers, decimal point, backspace, delete, tab, escape, enter
            if (!/[0-9]/.test(e.key) && e.key !== '.' && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'Escape' && e.key !== 'Enter') {
                e.preventDefault();
            }
            // Prevent multiple decimal points
            if (e.key === '.' && input.value.includes('.')) {
                e.preventDefault();
            }
        });
        
        input.addEventListener('input', () => {
            // Remove any non-numeric characters except decimal point
            input.value = input.value.replace(/[^0-9.]/g, '');
            
            // Ensure only one decimal point
            const parts = input.value.split('.');
            if (parts.length > 2) {
                input.value = parts[0] + '.' + parts.slice(1).join('');
            }
            
            // Specific validations
            if (param.key === 'plf' && parseFloat(input.value) > 100) {
                input.value = 100;
            }
            if (parseFloat(input.value) < 0) {
                input.value = 0;
            }
            recalculateColumn(monthIndex);
        });
        
        input.addEventListener('blur', () => {
            updateTotals();
            checkForNegativeClosingStock();
        });
        
        // Add keydown event for custom tab navigation
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                navigateVertically(input, e.shiftKey);
            }
        });
        
        cell.appendChild(input);
    } else if (param.type === 'calculated') {
        // Create span for calculated cells
        const span = document.createElement('span');
        span.textContent = '0.00';
        Object.assign(span.style, calculatedCellStyles);
        span.className = `calculated-${param.key}`;
        cell.appendChild(span);
    }
    
    return cell;
}

function buildFooterRow(tfoot) {
    // No total row needed - totals are now in the Total column
    // Clear any existing footer content
    tfoot.innerHTML = '';
}

// Month Management Functions
function updateFirstMonth(newMonth) {
    console.log('Updating first month to:', newMonth);
    
    // Preserve current values before updating
    const currentValues = preserveTableValues();
    
    // Update all months starting from the new month
    const numMonths = monthColumns.length;
    monthColumns = [];
    
    let currentMonth = newMonth;
    for (let i = 0; i < numMonths; i++) {
        monthColumns.push(currentMonth);
        currentMonth = getNextMonth(currentMonth);
    }
    
    // Rebuild the table
    buildTransposedTable();
    
    // Restore the preserved values
    restoreTableValues(currentValues);
    
    // Update coal sources table
    updateCoalSourcesTable();
    
    // Recalculate all columns
    recalculateAllColumns();
    updateTotal();
    updateTotals2();
}

function preserveTableValues() {
    const tbody = document.querySelector('#tbody');
    if (!tbody) return {};
    
    const values = {};
    
    tableParameters.forEach((param, paramIndex) => {
        if (!param.editable) return;
        
        const row = tbody.children[paramIndex];
        if (!row) return;
        
        values[param.key] = [];
        
        for (let monthIndex = 0; monthIndex < monthColumns.length; monthIndex++) {
            const cell = row.children[monthIndex + 1]; // +1 for parameter label
            const input = cell?.querySelector('input');
            if (input) {
                values[param.key][monthIndex] = input.value;
            }
        }
    });
    
    return values;
}

function restoreTableValues(values) {
    const tbody = document.querySelector('#tbody');
    if (!tbody || !values) return;
    
    tableParameters.forEach((param, paramIndex) => {
        if (!param.editable || !values[param.key]) return;
        
        const row = tbody.children[paramIndex];
        if (!row) return;
        
        for (let monthIndex = 0; monthIndex < monthColumns.length && monthIndex < values[param.key].length; monthIndex++) {
            const cell = row.children[monthIndex + 1]; // +1 for parameter label
            const input = cell?.querySelector('input');
            if (input && values[param.key][monthIndex] !== undefined) {
                input.value = values[param.key][monthIndex];
            }
        }
    });
}

function updateCoalSourcesTable() {
    const coalSourcesTableBody = document.getElementById('coalSourcesTableBody');
    if (!coalSourcesTableBody) return;
    
    // Clear existing rows
    coalSourcesTableBody.innerHTML = '';
    
    // Add rows for each month
    monthColumns.forEach(month => {
        addMonthToCoalSources(getMonthName(month));
    });
}

function addMonth() {
    // Preserve current values before adding new month
    const currentValues = preserveTableValues();
    
    const lastMonth = monthColumns[monthColumns.length - 1];
    const nextMonth = getNextMonth(lastMonth);
    monthColumns.push(nextMonth);
    currentMonthCount++;
    
    buildTransposedTable();
    
    // Restore preserved values
    restoreTableValues(currentValues);
    
    // Add month to coal sources
    addMonthToCoalSources(getMonthName(nextMonth));
    
    // Check if autofill is enabled and apply it after table rebuild
    setTimeout(() => {
        const copyQuantityCheckbox = document.getElementById('copyQuantityCheckbox');
        if (copyQuantityCheckbox && copyQuantityCheckbox.checked) {
            console.log('Autofill is checked - applying autofill after adding new month');
            // Use the same logic as autofill checkbox to copy from FIRST column to ALL subsequent columns
            const tbody = document.querySelector('#tbody');
            if (tbody && monthColumns.length > 1) {
                console.log('Copying values from first column to all subsequent columns including new month');
                const rows = tbody.querySelectorAll('tr');
                rows.forEach((row, paramIndex) => {
                    const param = tableParameters[paramIndex];
                    if (!param || !param.editable) return;
                    
                    // Skip opening stock as it should be calculated from previous month's closing stock
                    if (param.key === 'openingStock') {
                        console.log('Skipping opening stock from autofill - it will be calculated from closing stock');
                        return;
                    }
                    
                    const cells = row.querySelectorAll('td');
                    const firstInput = cells[1]?.querySelector('input'); // First data column (index 1)
                    
                    if (firstInput) {
                        // Copy value from first column to all subsequent columns
                        const valueToCopy = firstInput.value || '';
                        console.log(`Copying value "${valueToCopy}" for parameter ${param.key} from first column to all subsequent columns`);
                        
                        // Copy to all subsequent columns (starting from index 2)
                        for (let i = 2; i <= monthColumns.length; i++) {
                            const targetInput = cells[i]?.querySelector('input');
                            if (targetInput) {
                                targetInput.value = valueToCopy;
                                console.log(`Set value "${valueToCopy}" to column ${i} for ${param.key}`);
                            }
                        }
                    }
                });
                
                // Trigger recalculation after copying values
                console.log('Recalculating all columns after autofill');
                recalculateAllColumns();
            }
        } else {
            // Just recalculate if autofill is not checked
            recalculateAllColumns();
        }
        updateTotals();
    }, 100); // Small delay to ensure DOM is fully updated
}

function removeMonth(monthIndex) {
    if (monthColumns.length <= 1) {
        alert('Cannot remove the last month');
        return;
    }
    
    const confirmation = confirm('Are you sure you want to remove this month?');
    if (confirmation) {
        // Preserve values from remaining months
        const currentValues = preserveTableValues();
        
        const monthName = getMonthName(monthColumns[monthIndex]);
        
        // Remove the month data from preserved values first
        Object.keys(currentValues).forEach(paramKey => {
            if (currentValues[paramKey] && Array.isArray(currentValues[paramKey])) {
                currentValues[paramKey].splice(monthIndex, 1);
            }
        });
        
        // Rebuild month sequence properly
        const firstMonth = monthColumns[0]; // Keep the starting month
        const newLength = monthColumns.length - 1; // One less month
        
        // Rebuild the month columns with proper sequence
        monthColumns = [];
        let currentMonth = firstMonth;
        for (let i = 0; i < newLength; i++) {
            monthColumns.push(currentMonth);
            currentMonth = getNextMonth(currentMonth);
        }
        currentMonthCount = newLength;
        
        buildTransposedTable();
        
        // Restore the remaining values
        restoreTableValues(currentValues);
        
        // Update coal sources table with new sequence
        updateCoalSourcesTable();
        
        recalculateAllColumns();
        updateTotals();
    }
}

function copyValuesFromPreviousColumn() {
    if (monthColumns.length < 2) return;
    
    const tbody = document.querySelector('#tbody');
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach((row, paramIndex) => {
        const param = tableParameters[paramIndex];
        if (!param.editable) return;
        
        // Skip opening stock as it should be calculated from previous month's closing stock
        if (param.key === 'openingStock') {
            console.log('Skipping opening stock from previous column copy - it will be calculated from closing stock');
            return;
        }
        
        const cells = row.querySelectorAll('td');
        const lastColumnIndex = monthColumns.length - 1;
        const previousColumnIndex = lastColumnIndex - 1;
        
        const previousInput = cells[previousColumnIndex + 1]?.querySelector('input');
        const currentInput = cells[lastColumnIndex + 1]?.querySelector('input');
        
        if (previousInput && currentInput) {
            currentInput.value = previousInput.value;
        }
    });
    
    // Trigger recalculation for the new column
    recalculateColumn(monthColumns.length - 1);
}

// Dynamic copy function for auto-copy checkbox
function enableDynamicCopy() {
    const tbody = document.querySelector('#tbody');
    if (!tbody) return;
    
    // Add event listeners to all input fields for dynamic copying
    const inputs = tbody.querySelectorAll('input');
    inputs.forEach((input, index) => {
        input.addEventListener('input', function() {
            const copyQuantityCheckbox = document.getElementById('copyQuantityCheckbox');
            if (copyQuantityCheckbox && copyQuantityCheckbox.checked) {
                copyValueToSubsequentColumns(input);
            }
        });
    });
}

function setupAutofillCheckbox() {
    // Wait for DOM to be ready and find the checkbox
    setTimeout(() => {
        const copyQuantityCheckbox = document.getElementById('copyQuantityCheckbox');
        console.log('Setting up autofill checkbox:', copyQuantityCheckbox);
        
        if (copyQuantityCheckbox) {
            // Remove any existing listeners to prevent duplicates
            copyQuantityCheckbox.removeEventListener('change', handleAutofillChange);
            
            // Add the event listener
            copyQuantityCheckbox.addEventListener('change', handleAutofillChange);
            console.log('Autofill checkbox event listener added');
            
            // Also check current state and apply if checked
            if (copyQuantityCheckbox.checked) {
                console.log('Checkbox is already checked, applying autofill immediately');
                handleAutofillChange({ target: copyQuantityCheckbox });
            }
        } else {
            console.warn('Autofill checkbox not found, retrying in 500ms');
            // Retry after a longer delay
            setTimeout(() => {
                setupAutofillCheckbox();
            }, 500);
        }
    }, 100);
}

// Debug function to show checkbox separation
function debugCheckboxSeparation() {
    console.log('=== CHECKBOX SEPARATION DEBUG ===');
    
    // Find ALL checkboxes in the document
    const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    console.log(`Found ${allCheckboxes.length} total checkboxes:`);
    
    allCheckboxes.forEach((checkbox, index) => {
        console.log(`${index + 1}. ID: "${checkbox.id}", Text: "${checkbox.parentElement?.textContent?.trim() || 'No text'}", Checked: ${checkbox.checked}`);
    });
    
    console.log('\n--- EXPECTED SETUP ---');
    console.log('You mentioned having TWO tables with separate checkboxes:');
    console.log('1. MAIN TABLE (months in columns) - should have its own autofill checkbox');
    console.log('2. COAL SOURCES TABLE (months in rows) - should have its own auto-copy checkbox');
    
    // Current checkbox being used
    const copyQuantityCheckbox = document.getElementById('copyQuantityCheckbox');
    console.log('\n--- CURRENT USAGE ---');
    console.log('copyQuantityCheckbox:', copyQuantityCheckbox);
    console.log('Currently being used for BOTH tables (this might be the issue)');
    
    console.log('\n--- SUGGESTION ---');
    console.log('If you have separate checkboxes, please share their IDs so I can fix the code to use the correct ones.');
    console.log('If you only have one checkbox but need two separate behaviors, we can implement conditional logic.');
    
    console.log('=== END CHECKBOX DEBUG ===');
}

// Make debug function available globally
window.debugCheckboxSeparation = debugCheckboxSeparation;

function handleAutofillChange(event) {
    console.log('Autofill checkbox changed:', event.target.checked);
    
    if (event.target.checked) {
        // Copy first column values to all subsequent columns immediately
        const tbody = document.querySelector('#tbody');
        if (tbody && monthColumns.length > 1) {
            console.log('Copying ALL values from first column to subsequent columns (excluding opening stock)');
            const rows = tbody.querySelectorAll('tr');
            rows.forEach((row, paramIndex) => {
                const param = tableParameters[paramIndex];
                if (!param || !param.editable) return;
                
                // Skip opening stock as it should be calculated from previous month's closing stock
                if (param.key === 'openingStock') {
                    console.log('Skipping opening stock from autofill - it will be calculated from closing stock');
                    return;
                }
                
                const cells = row.querySelectorAll('td');
                const firstInput = cells[1]?.querySelector('input'); // First data column (index 1)
                
                if (firstInput) {
                    // Copy value regardless of whether it's empty or has a value
                    const valueToCopy = firstInput.value || '';
                    console.log(`Copying value "${valueToCopy}" for parameter ${param.key} from first column to all subsequent columns`);
                    
                    // Copy to all subsequent columns (starting from index 2)
                    for (let i = 2; i <= monthColumns.length; i++) {
                        const targetInput = cells[i]?.querySelector('input');
                        if (targetInput) {
                            targetInput.value = valueToCopy;
                            console.log(`Set value "${valueToCopy}" to column ${i} for ${param.key}`);
                        }
                    }
                }
            });
            
            // Trigger recalculation for all columns
            console.log('Recalculating all columns after autofill');
            recalculateAllColumns();
        } else {
            console.log('Not enough months or tbody not found for autofill');
        }
    }
}

function copyValueToSubsequentColumns(sourceInput) {
    const sourceCell = sourceInput.closest('td');
    const sourceRow = sourceCell.closest('tr');
    const sourceCellIndex = Array.from(sourceRow.children).indexOf(sourceCell);
    
    // Only copy if the source is from the first month column (index 1, since 0 is parameter label)
    if (sourceCellIndex === 1) {
        // Get the parameter index to check if it's opening stock
        const tbody = document.querySelector('#tbody');
        const rowIndex = Array.from(tbody.children).indexOf(sourceRow);
        const param = tableParameters[rowIndex];
        
        // Skip opening stock as it should be calculated from previous month's closing stock
        if (param && param.key === 'openingStock') {
            console.log('Skipping opening stock from real-time autofill - it will be calculated from closing stock');
            return;
        }
        
        console.log('Copying value from first column to subsequent columns:', sourceInput.value);
        // Copy to all subsequent columns in the same row
        for (let columnIndex = 2; columnIndex <= monthColumns.length; columnIndex++) {
            const targetCell = sourceRow.children[columnIndex];
            const targetInput = targetCell?.querySelector('input');
            
            if (targetInput) {
                targetInput.value = sourceInput.value;
                // Trigger recalculation for each updated column
                const monthIndex = columnIndex - 1; // -1 for parameter label column
                if (monthIndex >= 0 && monthIndex < monthColumns.length) {
                    recalculateColumn(monthIndex);
                }
            }
        }
    }
}

// Calculation Functions for Transposed Layout
function recalculateColumn(monthIndex) {
    const tbody = document.querySelector('#tbody');
    if (!tbody) return;
    
    const columnData = getColumnData(monthIndex);
    
    // Calculate Units Generated
    const unitsGenerated = calculateUnitsGenerated(
        columnData.capacity, 
        columnData.plf, 
        monthColumns[monthIndex]
    );
    
    // Calculate Coal Consumption
    const coalConsumption = calculateCoalConsumption(
        unitsGenerated,
        columnData.scc
    );
    
    // For closing stock calculation, we need to ensure we have the most current opening stock
    // especially if this is being called as part of a sequence
    let openingStockValue = columnData.openingStock;
    
    // If this is not the first column and we're not in a bulk recalculation,
    // get fresh opening stock data
    if (monthIndex > 0 && !isRecalculating) {
        const freshColumnData = getColumnData(monthIndex);
        openingStockValue = freshColumnData.openingStock;
    }
    
    // Calculate Closing Stock with current opening stock
    const closingStock = calculateClosingStock(
        columnData.coalAvailable,
        openingStockValue,
        coalConsumption
    );
    
    // Calculate Stock in Days
    const stockInDays = coalConsumption > 0 ? (closingStock / (coalConsumption / 30)) : 0;
    
    // Update calculated cells
    updateCalculatedCell('unitsGenerated', monthIndex, unitsGenerated);
    updateCalculatedCell('coalConsumption', monthIndex, coalConsumption);
    updateCalculatedCell('closingStock', monthIndex, closingStock);
    updateCalculatedCell('stockInDays', monthIndex, stockInDays);
    
    // Update opening stock of next month (if exists)
    if (monthIndex < monthColumns.length - 1) {
        updateOpeningStock(monthIndex + 1, closingStock);
    }
}

function getColumnData(monthIndex) {
    const tbody = document.querySelector('#tbody');
    const data = {};
    
    tableParameters.forEach((param, paramIndex) => {
        const row = tbody.children[paramIndex];
        const cell = row.children[monthIndex + 1]; // +1 for parameter label column
        
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
        
        // Add color coding for closing stock
        if (paramKey === 'closingStock') {
            if (value < 0) {
                span.style.color = 'red';
                span.style.fontWeight = 'bold';
            } else {
                span.style.color = '#333';
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
        // Force DOM update by triggering input event
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

function updateOpeningStockDirectly(monthIndex, closingStock) {
    const tbody = document.querySelector('#tbody');
    const openingStockParamIndex = tableParameters.findIndex(p => p.key === 'openingStock');
    if (openingStockParamIndex === -1) return;
    
    const row = tbody.children[openingStockParamIndex];
    const cell = row.children[monthIndex + 1];
    const input = cell.querySelector('input');
    
    if (input) {
        input.value = closingStock.toFixed(2);
        // Don't trigger events during bulk calculation
    }
}

function recalculateAllColumns() {
    isRecalculating = true;
    
    // Sequential calculation to ensure proper opening stock propagation
    for (let i = 0; i < monthColumns.length; i++) {
        recalculateColumn(i);
        
        // For subsequent columns, ensure they read fresh opening stock
        if (i > 0) {
            // Force a fresh read of opening stock for next columns by updating their calculation
            const tbody = document.querySelector('#tbody');
            const openingStockParamIndex = tableParameters.findIndex(p => p.key === 'openingStock');
            if (openingStockParamIndex !== -1) {
                const row = tbody.children[openingStockParamIndex];
                const cell = row.children[i + 1];
                const input = cell?.querySelector('input');
                if (input) {
                    // Re-read and recalculate with fresh opening stock
                    const columnData = getColumnData(i);
                    const unitsGenerated = calculateUnitsGenerated(
                        columnData.capacity, 
                        columnData.plf, 
                        monthColumns[i]
                    );
                    const coalConsumption = calculateCoalConsumption(unitsGenerated, columnData.scc);
                    const closingStock = calculateClosingStock(
                        columnData.coalAvailable,
                        columnData.openingStock,
                        coalConsumption
                    );
                    const stockInDays = coalConsumption > 0 ? (closingStock / (coalConsumption / 30)) : 0;
                    
                    updateCalculatedCell('closingStock', i, closingStock);
                    updateCalculatedCell('stockInDays', i, stockInDays);
                    
                    // Update opening stock for next month
                    if (i < monthColumns.length - 1) {
                        updateOpeningStockDirectly(i + 1, closingStock);
                    }
                }
            }
        }
    }
    
    isRecalculating = false;
    updateTotals(); // Update the total column
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
        
        // Update total display
        const totalElement = document.getElementById(`total-${paramKey}`);
        if (totalElement) {
            totalElement.textContent = total.toFixed(2);
        }
    });
}

// Negative Stock Calculation Functions (Updated for Transposed Layout)
function calculateNegativeStockDate(month, openingStock, coalUnitsGenerated, coalScc, coalAvailable) {
    if (openingStock < 0) {
        return null;
    }

    const daysInMonth = new Date(new Date().getFullYear(), month, 0).getDate();
    const coalRequirementPerDay = (coalUnitsGenerated * coalScc * 10) / daysInMonth;
    const coalAvailablePerDay = coalAvailable / daysInMonth;

    for (let day = 1; day <= daysInMonth; day++) {
        const closingStockDateCheck = openingStock + (coalAvailablePerDay - coalRequirementPerDay);
        openingStock = closingStockDateCheck;

        if (closingStockDateCheck < 0) {
            const negativeStockDate = new Date(new Date().getFullYear(), month - 1, day);         
            originalNegativeStockDate = negativeStockDate;
            return originalNegativeStockDate;
        }
    }

    return null;
}

function checkForNegativeClosingStock() {
    let negativeStockDetected = false;
    let negativeStockDate = null;
    let addCoalReqToAviodNegaStock = 0;
    let addCoalReqPerMonthToAviodNegaStock = 0;
    let addCoalReqToBuildTenDaysStockperday = 0;
    let addCoalReqToBuildTenDaysStockpermonth = 0;

    // Check each month column for negative closing stock
    for (let monthIndex = 0; monthIndex < monthColumns.length; monthIndex++) {
        const columnData = getColumnData(monthIndex);
        const month = monthColumns[monthIndex];
        
        if (columnData.closingStock < 0) {
            negativeStockDetected = true;
            
            const daysInMonth = new Date(new Date().getFullYear(), month, 0).getDate();
            const daysToMaintainStock = parseInt(document.getElementById('daysToMaintainStock')?.value, 10) || 10;
            
            addCoalReqToAviodNegaStock = ((columnData.coalConsumption - columnData.coalAvailable - columnData.openingStock) / daysInMonth) * 30 / (monthColumns.length * daysInMonth);
            addCoalReqPerMonthToAviodNegaStock = addCoalReqToAviodNegaStock * daysInMonth;
            
            if (monthColumns.length > 0) {
                const lastMonthData = getColumnData(monthColumns.length - 1);
                addCoalReqToBuildTenDaysStockperday = (((lastMonthData.coalConsumption / daysInMonth * daysToMaintainStock) - columnData.closingStock) / monthColumns.length) / daysInMonth;
                addCoalReqToBuildTenDaysStockpermonth = (((lastMonthData.coalConsumption / daysInMonth * daysToMaintainStock) - columnData.closingStock) / monthColumns.length);
            }
            
            const date = calculateNegativeStockDate(month, columnData.openingStock, columnData.unitsGenerated, columnData.scc, columnData.coalAvailable);
            
            if (date) {
                negativeStockDate = date.toDateString();
                break; // Stop at first negative stock found
            }
        }
    }

    const closingStockWarning = document.getElementById('closingStockWarning');
    if (closingStockWarning) {
        if (negativeStockDetected) {
            closingStockWarning.style.display = 'block';
            const daysToMaintainStock = document.getElementById('daysToMaintainStock');
            closingStockWarning.textContent = `Warning: Coal Stock shall exhaust on: ${negativeStockDate}. 
            Additional coal required to avoid stock out at plant shall be ${addCoalReqToAviodNegaStock.toFixed(2)} MT per day (i.e. ${addCoalReqPerMonthToAviodNegaStock.toFixed(2)} MT per month). Further, to build up coal stock inventory of ${daysToMaintainStock?.value || 10} days coal at month end, about ${addCoalReqToBuildTenDaysStockperday.toFixed(2)} MT per day coal (i.e. ${addCoalReqToBuildTenDaysStockpermonth.toFixed(2)} MT per month) shall be required.`;
        } else {
            closingStockWarning.style.display = 'none';
            closingStockWarning.textContent = '';
        }
    }
}

function getNegativeStockDate() {
    for (let monthIndex = 0; monthIndex < monthColumns.length; monthIndex++) {
        const columnData = getColumnData(monthIndex);
        const month = monthColumns[monthIndex];
        
        if (columnData.closingStock < 0) {
            const date = calculateNegativeStockDate(month, columnData.openingStock, columnData.unitsGenerated, columnData.scc, columnData.coalAvailable);
            if (date) {
                return date.toDateString();
            }
        }
    }
    return null;
}

// Clear Functions (Updated for Transposed Layout)
function clearValuesInCoalTableBody() {
    const tbody = document.querySelector('#tbody');
    if (!tbody) return;
    
    const inputs = tbody.querySelectorAll('input');
    inputs.forEach(input => {
        input.value = '';
    });

    recalculateAllColumns();
    checkForNegativeClosingStock();
}

// Copy Functions (Updated for Transposed Layout)
function copyValuesFromPreviousRow() {
    // This function is now handled by copyValuesFromPreviousColumn
    copyValuesFromPreviousColumn();
}

// Coal Sources Table Management (Updated to work with transposed layout)
function addMonthToCoalSources(monthName) {
    console.log('Attempting to add month to coal sources:', monthName);
    const coalSourcesTableBody = document.getElementById('coalSourcesTableBody');
    console.log('Coal sources table body found:', coalSourcesTableBody);
    
    if (!coalSourcesTableBody) {
        console.error('Coal sources table body not found!');
        return;
    }
    
    const newRow = document.createElement('tr');
    
    const monthCell = document.createElement('td');
    monthCell.textContent = monthName;
    newRow.appendChild(monthCell);
    
    // Create cells for all current source columns
    for (let i = 0; i < currentSourceCount; i++) {
        const coalSourceCell = document.createElement('td');
        coalSourceCell.contentEditable = true;
        coalSourceCell.textContent = '';
        coalSourceCell.addEventListener('input', restrictToNumbers);
        coalSourceCell.addEventListener('blur', updateTotal);
        
        // Add auto-copy functionality
        coalSourceCell.addEventListener('input', function() {
            handleCoalSourceCellInput(this);
        });
        
        newRow.appendChild(coalSourceCell);
    }
    
    const totalCell = document.createElement('td');
    totalCell.textContent = '0.00';
    totalCell.style.fontWeight = 'bold';
    totalCell.style.backgroundColor = '#f8f9fa';
    newRow.appendChild(totalCell);
    
    coalSourcesTableBody.appendChild(newRow);
    console.log('Successfully added row to coal sources table');
    
    // Try auto-copy using multiple approaches
    console.log('=== AUTO-COPY DEBUG START ===');
    
    // Approach 1: Use dedicated function
    setTimeout(() => {
        const success = autoKeyCopyValuesIfEnabled();
        if (!success) {
            console.log('Dedicated function failed, trying manual approach...');
            
            // Approach 2: Manual check with detailed debugging
            const checkbox2 = document.getElementById('copyQuantityCheckbox');
            
            console.log('Manual check - copyQuantityCheckbox:', checkbox2, 'checked:', checkbox2?.checked);
            
            const activeCheckbox = checkbox2?.checked ? checkbox2 : null;
            
            if (activeCheckbox) {
                console.log('Found active checkbox:', activeCheckbox.id);
                const rows = coalSourcesTableBody.querySelectorAll('tr');
                
                if (rows.length >= 2) {
                    const newRow = rows[rows.length - 1];
                    const prevRow = rows[rows.length - 2];
                    
                    console.log('Manual copy attempt between rows...');
                    let manualCopyCount = 0;
                    
                    for (let col = 1; col <= currentSourceCount; col++) {
                        const newCell = newRow.children[col];
                        const prevCell = prevRow.children[col];
                        
                        if (newCell && prevCell) {
                            const prevVal = prevCell.textContent.trim();
                            if (prevVal && prevVal !== '0') {
                                newCell.textContent = prevVal;
                                manualCopyCount++;
                                console.log(`Manual copy: "${prevVal}" to column ${col}`);
                            }
                        }
                    }
                    
                    if (manualCopyCount > 0) {
                        updateTotal();
                        console.log(`✅ Manual copy successful: ${manualCopyCount} values copied`);
                    } else {
                        console.log('❌ Manual copy: no values to copy');
                    }
                }
            } else {
                console.log('❌ No active auto-copy checkbox found');
            }
        } else {
            console.log('✅ Dedicated function succeeded');
        }
        console.log('=== AUTO-COPY DEBUG END ===');
    }, 100);
}

// Function to add auto-copy functionality to existing coal source cells
function addAutoCopyToExistingCells() {
    console.log('🔄 Adding auto-copy functionality to existing coal source cells...');
    
    const coalSourcesTableBody = document.querySelector('#coalSourcesTable tbody');
    if (!coalSourcesTableBody) {
        console.log('❌ Coal sources table body not found');
        return;
    }
    
    // Get all existing input cells in the coal sources table
    const existingInputs = coalSourcesTableBody.querySelectorAll('input[type="number"]');
    console.log(`📋 Found ${existingInputs.length} existing input cells`);
    
    existingInputs.forEach((input, index) => {
        // Remove any existing event listeners first
        input.removeEventListener('input', handleCoalSourceCellInput);
        // Add the auto-copy event listener
        input.addEventListener('input', handleCoalSourceCellInput);
        console.log(`✅ Added auto-copy to input ${index + 1}/${existingInputs.length}`);
    });
    
    console.log('🎯 Auto-copy functionality added to all existing coal source cells');
}

// Function to handle auto-copy when values are entered in coal sources table
function handleCoalSourceCellInput(cellOrEvent) {
    // Handle both direct cell reference and event object
    let cell;
    if (cellOrEvent.target) {
        // This is an event object, get the target element
        cell = cellOrEvent.target;
    } else {
        // This is a direct cell reference
        cell = cellOrEvent;
    }
    
    // Check if auto-copy is enabled
    const autoCopyCheckbox = document.getElementById('copyQuantityCheckbox');
    if (!autoCopyCheckbox || !autoCopyCheckbox.checked) {
        return; // Auto-copy not enabled
    }
    
    let value;
    if (cell.tagName === 'INPUT') {
        value = cell.value.trim();
    } else {
        value = cell.textContent.trim();
    }
    
    if (!value || value === '0') {
        return; // No value to copy
    }
    
    // Find the current row and column
    const currentRow = cell.parentElement;
    const currentTable = currentRow.closest('tbody');
    const allRows = Array.from(currentTable.querySelectorAll('tr'));
    const currentRowIndex = allRows.indexOf(currentRow);
    const currentCells = Array.from(currentRow.children);
    const currentColumnIndex = currentCells.indexOf(cell.parentElement);
    
    console.log(`Auto-copying value "${value}" from row ${currentRowIndex}, column ${currentColumnIndex}`);
    
    // Copy to all subsequent rows in the same column
    for (let i = currentRowIndex + 1; i < allRows.length; i++) {
        const targetRow = allRows[i];
        const targetCell = targetRow.children[currentColumnIndex];
        
        if (targetCell) {
            // Check if target cell has an input element
            const targetInput = targetCell.querySelector('input[type="number"]');
            if (targetInput) {
                // Only copy if the target input is empty or has default value
                const currentTargetValue = targetInput.value.trim();
                if (!currentTargetValue || currentTargetValue === '0') {
                    targetInput.value = value;
                    console.log(`Auto-copied "${value}" to input in row ${i}, column ${currentColumnIndex}`);
                    
                    // Trigger update for the target input
                    targetInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
            } else if (targetCell.contentEditable) {
                // Handle contentEditable cells (for backward compatibility)
                const currentTargetValue = targetCell.textContent.trim();
                if (!currentTargetValue || currentTargetValue === '0') {
                    targetCell.textContent = value;
                    console.log(`Auto-copied "${value}" to contentEditable cell in row ${i}, column ${currentColumnIndex}`);
                    
                    // Trigger update for the target cell
                    targetCell.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
        }
    }
    
    // Update totals after auto-copy
    setTimeout(() => {
        updateTotal();
    }, 50);
}

// Dedicated function for auto-copying values from previous row
function autoKeyCopyValuesIfEnabled() {
    // Use only the copyQuantityCheckbox from the coal sources header
    const checkbox = document.getElementById('copyQuantityCheckbox');
    
    console.log('Auto-copy function called, checkbox found:', checkbox);
    console.log('Checkbox ID:', checkbox?.id);
    console.log('Checkbox checked status:', checkbox?.checked);
    
    if (!checkbox || !checkbox.checked) {
        console.log('Auto-copy not enabled or checkbox not found');
        return false;
    }
    
    const coalSourcesTableBody = document.getElementById('coalSourcesTableBody');
    if (!coalSourcesTableBody) {
        console.log('Coal sources table body not found');
        return false;
    }
    
    const rows = coalSourcesTableBody.querySelectorAll('tr');
    console.log('Found rows in sources table:', rows.length);
    
    if (rows.length < 2) {
        console.log('Not enough rows for auto-copy');
        return false;
    }
    
    const currentRow = rows[rows.length - 1]; // Last row (just added)
    const previousRow = rows[rows.length - 2]; // Previous row
    
    let valuesCopied = 0;
    
    console.log('Attempting to copy from row', rows.length - 2, 'to row', rows.length - 1);
    console.log('Current source count:', currentSourceCount);
    
    // Copy values from previous row to current row
    for (let j = 1; j <= currentSourceCount; j++) {
        const currentCell = currentRow.children[j];
        const previousCell = previousRow.children[j];
        
        if (currentCell && previousCell) {
            const previousValue = previousCell.textContent.trim();
            const currentValue = currentCell.textContent.trim();
            
            console.log(`Column ${j}: Previous="${previousValue}", Current="${currentValue}"`);
            
            if (previousValue !== '' && previousValue !== '0' && currentValue === '') {
                currentCell.textContent = previousValue;
                valuesCopied++;
                console.log(`✅ Auto-copied "${previousValue}" to column ${j}`);
            } else {
                console.log(`⏭️ Skipped column ${j} - no value to copy or cell already has value`);
            }
        } else {
            console.log(`❌ Column ${j}: cells not found`);
        }
    }
    
    if (valuesCopied > 0) {
        console.log(`🎉 Auto-copy completed: ${valuesCopied} values copied`);
        updateTotal();
        return true;
    } else {
        console.log('⚠️ No values were copied (previous row was empty or current row already has values)');
        return false;
    }
}

// Debug function to test auto-copy manually
function debugAutoCopy() {
    console.log('=== MANUAL AUTO-COPY DEBUG ===');
    
    // Check all possible checkboxes
    const checkboxes = [
        { id: 'copyQuantityCheckbox', element: document.getElementById('copyQuantityCheckbox') },
    ];
    
    console.log('All checkboxes:');
    checkboxes.forEach(cb => {
        console.log(`- ${cb.id}: exists=${!!cb.element}, checked=${cb.element?.checked}`);
    });
    
    // Check table structure
    const coalSourcesTableBody = document.getElementById('coalSourcesTableBody');
    console.log('Coal sources table body found:', !!coalSourcesTableBody);
    
    if (coalSourcesTableBody) {
        const rows = coalSourcesTableBody.querySelectorAll('tr');
        console.log('Rows in sources table:', rows.length);
        
        if (rows.length >= 2) {
            const lastRow = rows[rows.length - 1];
            const prevRow = rows[rows.length - 2];
            
            console.log('Last row cells:', lastRow.children.length);
            console.log('Previous row cells:', prevRow.children.length);
            
            for (let i = 1; i <= Math.min(currentSourceCount, 5); i++) {
                const prevCell = prevRow.children[i];
                const lastCell = lastRow.children[i];
                console.log(`Column ${i}: prev="${prevCell?.textContent}", last="${lastCell?.textContent}"`);
            }
        }
    }
    
    console.log('Current source count:', currentSourceCount);
    console.log('=== END DEBUG ===');
}

// Function to make existing source column headers editable
function makeExistingSourceHeadersEditable() {
    console.log('Making existing source headers editable...');
    
    // Try multiple ways to find the coal sources table
    let coalSourcesTable = document.querySelector('#Table2');
    
    if (!coalSourcesTable) {
        // Alternative search
        coalSourcesTable = document.querySelector('table');
        console.log('Fallback: Found table element:', !!coalSourcesTable);
    }
    
    if (!coalSourcesTable) {
        // Last resort - find by tbody id
        const tbody = document.getElementById('coalSourcesTableBody');
        if (tbody) {
            coalSourcesTable = tbody.closest('table');
        }
    }
    
    if (!coalSourcesTable) {
        console.log('Coal sources table not found');
        return;
    }
    
    console.log('Found coal sources table:', coalSourcesTable);
    
    const headerRow = coalSourcesTable.querySelector('thead tr');
    
    if (!headerRow) {
        console.log('Header row not found');
        return;
    }
    
    console.log('Found header row with', headerRow.children.length, 'columns');
    
    const headers = headerRow.querySelectorAll('th');
    
    headers.forEach((header, index) => {
        const headerText = header.textContent.toLowerCase();
        console.log(`Header ${index}: "${header.textContent}" (contentEditable: ${header.contentEditable})`);
        
        // Check if this is a source header (contains "source" but not "month" or "total")
        if (headerText.includes('source') && 
            !headerText.includes('month') && 
            !headerText.includes('total')) {
            
            // Ensure header is editable
            if (header.contentEditable !== 'true') {
                header.contentEditable = true;
                console.log(`Made header "${header.textContent}" editable`);
            }
            
            // Check if edit icon exists
            const existingIcon = header.querySelector('.editable-icon');
            if (!existingIcon) {
                const editIcon = document.createElement('i');
                editIcon.className = 'bi bi-pencil-square editable-icon';
                header.appendChild(document.createTextNode(' '));
                header.appendChild(editIcon);
                console.log(`Added edit icon to header "${header.textContent}"`);
            } else {
                console.log(`Header "${header.textContent}" already has edit icon`);
            }
        }
    });
    
    console.log('Finished processing source headers');
}

// Function to add a new source column to the coal sources table
function addSourceColumn() {
    currentSourceCount++;
    const sourceNumber = currentSourceCount;
    
    // Find the coal sources table
    const coalSourcesTable = document.querySelector('#coalSourcesTableBody').parentElement;
    if (!coalSourcesTable) {
        console.error('Coal sources table not found');
        return;
    }
    
    // Update table header
    const headerRow = coalSourcesTable.querySelector('thead tr');
    if (headerRow) {
        // Find the Total column and insert before it
        const totalHeader = headerRow.querySelector('th:last-child');
        if (totalHeader) {
            const newSourceHeader = document.createElement('th');
            newSourceHeader.textContent = `Source${sourceNumber} `;
            newSourceHeader.contentEditable = true;
            
            // Add the edit icon like existing headers
            const editIcon = document.createElement('i');
            editIcon.className = 'bi bi-pencil-square editable-icon';
            newSourceHeader.appendChild(editIcon);
            
            headerRow.insertBefore(newSourceHeader, totalHeader);
        }
    }
    
    // Update all existing rows in tbody
    const coalSourcesTableBody = document.getElementById('coalSourcesTableBody');
    if (coalSourcesTableBody) {
        const rows = coalSourcesTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const totalCell = row.querySelector('td:last-child');
            if (totalCell) {
                const newSourceCell = document.createElement('td');
                newSourceCell.contentEditable = true;
                newSourceCell.textContent = '';
                newSourceCell.setAttribute('oninput', 'updateTotal()');
                newSourceCell.addEventListener('input', restrictToNumbers);
                newSourceCell.addEventListener('blur', updateTotal);
                row.insertBefore(newSourceCell, totalCell);
            }
        });
    }
    
    // Update total row if it exists
    const totalRow = document.getElementById('totalRow');
    if (totalRow) {
        const totalRowLastCell = totalRow.querySelector('td:last-child');
        if (totalRowLastCell) {
            const newTotalCell = document.createElement('td');
            newTotalCell.textContent = '';
            newTotalCell.contentEditable = false;
            totalRow.insertBefore(newTotalCell, totalRowLastCell);
        }
    }
    
    // Recalculate totals
    updateTotal();
    
    console.log(`Added Source ${sourceNumber} column to coal sources table`);
}

function removeMonthFromCoalSources(monthName) {
    const coalSourcesTableBody = document.getElementById('coalSourcesTableBody');
    if (!coalSourcesTableBody) return;
    
    const rows = coalSourcesTableBody.querySelectorAll('tr');
    rows.forEach((row) => {
        const monthCell = row.querySelector('td:first-child');
        if (monthCell && monthCell.textContent === monthName) {
            row.remove();
        }
    });
    updateTotal();
}

function restrictToNumbers(event) {
    const input = event.target;
    let value = input.textContent;
    
    // Remove any non-numeric characters except decimal point
    value = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Remove negative values
    if (value !== '' && parseFloat(value) < 0) {
        value = '0';
    }
    
    // Update the content only if it changed
    if (input.textContent !== value) {
        input.textContent = value;
        
        // Restore cursor position to the end
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(input);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

function updateTotal() {
    const coalSourcesTableBody = document.getElementById('coalSourcesTableBody');
    if (!coalSourcesTableBody) return;
    
    const rows = coalSourcesTableBody.querySelectorAll('tr');
    rows.forEach((row) => {
        let total = 0;
        const cells = row.querySelectorAll('td');
        
        // Calculate row total from all source columns (1 to currentSourceCount)
        for (let i = 1; i <= currentSourceCount; i++) {
            const cell = cells[i];
            if (cell) {
                const value = parseFloat(cell.textContent) || 0;
                total += value;
            }
        }
        
        // Update the total cell (last cell in the row)
        const totalCell = cells[cells.length - 1];
        if (totalCell) {
            totalCell.textContent = total.toFixed(2);
        }
    });
    
    // Also update column totals
    updateTotals2();
}

function updateTotals2() {
    const coalSourcesTableBody = document.getElementById('coalSourcesTableBody');
    if (!coalSourcesTableBody) return;
    
    const rows = coalSourcesTableBody.querySelectorAll('tr');
    const columnTotals = new Array(currentSourceCount + 1).fill(0); // +1 for grand total

    // Calculate column totals
    rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        for (let i = 1; i <= currentSourceCount + 1; i++) { // All source columns + total column
            const cell = cells[i];
            if (cell) {
                const value = parseFloat(cell.textContent) || 0;
                columnTotals[i - 1] += value;
            }
        }
    });

    // Update the total row
    const totalRow = document.getElementById('totalRow');
    if (totalRow) {
        for (let i = 0; i < currentSourceCount + 1; i++) {
            if (totalRow.cells[i + 1]) { // Skip the first cell (month column)
                totalRow.cells[i + 1].textContent = columnTotals[i].toFixed(2);
            }
        }
    } else {
        console.warn('Total row not found in coal sources table');
    }
}

function copyCoalAvailabilityToFirstTable() {
    console.log('=== COPY COAL AVAILABILITY TO MAIN TABLE ===');
    
    const coalSourcesTableBody = document.getElementById('coalSourcesTableBody');
    const tbody = document.querySelector('#tbody');
    
    if (!coalSourcesTableBody || !tbody) {
        console.error('Coal sources table body or main table body not found');
        return;
    }
    
    const sourceRows = coalSourcesTableBody.querySelectorAll('tr');
    const coalAvailableParamIndex = tableParameters.findIndex(p => p.key === 'coalAvailable');
    
    if (coalAvailableParamIndex === -1) {
        console.error('Coal Available parameter not found');
        return;
    }
    
    const coalAvailableRow = tbody.children[coalAvailableParamIndex];
    
    if (!coalAvailableRow) {
        console.error('Coal Available row not found in main table');
        return;
    }
    
    console.log(`Found ${sourceRows.length} source rows and ${monthColumns.length} month columns`);
    console.log('Month columns:', monthColumns.map(m => getMonthName(m)));
    
    // For each month, calculate the total from all sources and copy to main table
    monthColumns.forEach((month, monthIndex) => {
        const monthName = getMonthName(month);
        let monthTotal = 0;
        
        console.log(`Processing month ${monthIndex}: ${monthName}`);
        
        // Find the row in coal sources table that matches this month
        let matchingRow = null;
        sourceRows.forEach((row, rowIndex) => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 0) {
                const rowMonthName = cells[0].textContent.trim();
                console.log(`Checking row ${rowIndex}: "${rowMonthName}" vs "${monthName}"`);
                if (rowMonthName.toLowerCase() === monthName.toLowerCase()) {
                    matchingRow = row;
                    console.log(`✅ Found matching row for ${monthName}`);
                }
            }
        });
        
        if (matchingRow) {
            // Get the total cell (last cell in the row)
            const cells = matchingRow.querySelectorAll('td');
            const totalCell = cells[cells.length - 1];
            if (totalCell) {
                monthTotal = parseFloat(totalCell.textContent) || 0;
                console.log(`Month ${monthName} total: ${monthTotal}`);
            }
        } else {
            console.warn(`No matching row found for month: ${monthName}`);
        }
        
        // Copy to main table
        const targetCellIndex = monthIndex + 1; // +1 to skip parameter label column
        const targetCell = coalAvailableRow.children[targetCellIndex];
        
        if (targetCell) {
            const input = targetCell.querySelector('input');
            if (input) {
                input.value = monthTotal.toFixed(2);
                console.log(`✅ Copied ${monthTotal.toFixed(2)} to ${monthName} in main table`);
                
                // Trigger input event to update calculations
                input.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
                console.warn(`❌ Input field not found in target cell for ${monthName}`);
            }
        } else {
            console.warn(`❌ Target cell not found for month ${monthName} at index ${targetCellIndex}`);
        }
    });
    
    // Force recalculation after a short delay
    setTimeout(() => {
        console.log('Triggering recalculation...');
        recalculateAllColumns();
        updateTotals();
        checkForNegativeClosingStock();
        console.log('Copy and recalculation completed');
    }, 100);
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

    updateTotal();
    updateTotals2();
}

// PDF Generation Function (Updated for Transposed Layout)
function generatePDFForCoalScenario() {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
    });

    let yPosition = 15;
    let firstMonthName = '';
    let lastMonthName = '';

    if (monthColumns.length > 0) {
        firstMonthName = getMonthName(monthColumns[0]);
        lastMonthName = getMonthName(monthColumns[monthColumns.length - 1]);
    }

    function generateTransposedTableContent(title) {
        const tbody = document.querySelector('#tbody');
        if (!tbody) return;

        let year = new Date().getFullYear();
        
        // Create header row
        const headerRow = ['Parameter'];
        monthColumns.forEach(month => {
            headerRow.push(`${getMonthName(month)}-${year}`);
            if (getMonthName(month) === 'December') {
                year++;
            }
        });

        const content = [headerRow];

        // Add parameter rows
        tableParameters.forEach(param => {
            const row = [param.label];
            
            for (let monthIndex = 0; monthIndex < monthColumns.length; monthIndex++) {
                const columnData = getColumnData(monthIndex);
                const value = columnData[param.key] || 0;
                row.push(typeof value === 'number' ? value.toFixed(2) : value);
            }
            
            content.push(row);
        });

        // Add total row
        const totalRow = ['TOTAL'];
        const totalsToShow = ['unitsGenerated', 'coalConsumption', 'coalAvailable'];
        
        for (let monthIndex = 0; monthIndex < monthColumns.length; monthIndex++) {
            let monthTotal = 0;
            totalsToShow.forEach(paramKey => {
                const columnData = getColumnData(monthIndex);
                monthTotal += columnData[paramKey] || 0;
            });
            totalRow.push(monthTotal.toFixed(2));
        }
        content.push(totalRow);

        const tableStyles = {
            theme: 'grid',
            headStyles: { align: 'center', fillColor: [95, 135, 158] },
            bodyStyles: { align: 'center' },
            styles: {
                lineColor: [0, 0, 0],
                lineWidth: 0.2,
                fontSize: 9
            },
        };

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
            ...tableStyles,
            margin: { top: 20 },
            columnStyles: {
                0: { halign: 'left', cellWidth: 40 }
            }
        });

        const headingStyle = {
            fontSize: 14,
            textColor: [0, 0, 0],
        };
        doc.setFontSize(headingStyle.fontSize);
        doc.setTextColor(headingStyle.textColor[0], headingStyle.textColor[1], headingStyle.textColor[2]);
        doc.text(15, yPosition - 5, title);
        yPosition = doc.autoTable.previous.finalY + 20;
    }

    function generateCoalSourcesTable(title) {
        const coalSourcesTableBody = document.getElementById('coalSourcesTableBody');
        if (!coalSourcesTableBody) return;

        let year = new Date().getFullYear();
        const headerRow = ['Source'];
        monthColumns.forEach(month => {
            headerRow.push(`${getMonthName(month)}-${year}`);
            if (getMonthName(month) === 'December') {
                year++;
            }
        });

        const content = [headerRow];
        const rows = coalSourcesTableBody.querySelectorAll('tr');
        
        // Add source rows (transpose the sources table data)
        for (let sourceIndex = 1; sourceIndex <= 5; sourceIndex++) {
            const sourceRow = [`Source${sourceIndex}`];
            
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                const sourceCell = cells[sourceIndex];
                sourceRow.push(sourceCell ? sourceCell.textContent : '0');
            });
            
            content.push(sourceRow);
        }

        // Add total row
        const totalRow = ['TOTAL'];
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const totalCell = cells[cells.length - 1];
            totalRow.push(totalCell ? totalCell.textContent : '0');
        });
        content.push(totalRow);

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
            margin: { top: 20 },
            columnStyles: {
                0: { halign: 'left', cellWidth: 40 }
            }
        });

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(15, yPosition - 5, title);
        yPosition = doc.autoTable.previous.finalY + 20;
    }

    const powerplantName = document.getElementById('powerplantName')?.value || 'Power Plant';
    const year = new Date().getFullYear();
    const firstmonthforpdf = `${firstMonthName}-${year}`;
    const lastmonthforpdf = `${lastMonthName}-${year}`;

    if (firstMonthName === lastMonthName) {
        generateTransposedTableContent(`Coal Scenario at ${powerplantName} during ${firstmonthforpdf} shall be as under:`);
        generateCoalSourcesTable(`Envisaged Coal Availability at ${powerplantName} during ${firstmonthforpdf} is under:`);
    } else {
        generateTransposedTableContent(`Coal Scenario at ${powerplantName} from ${firstmonthforpdf} to ${lastmonthforpdf} shall be as under:`);
        generateCoalSourcesTable(`Envisaged Coal Availability at ${powerplantName} from ${firstmonthforpdf} to ${lastmonthforpdf} is under:`);
    }

    const warningText = getNegativeStockDate();
    const comments = document.querySelector("#coalScenarioComments textarea")?.value;

    if (warningText) {
        doc.setFontSize(14);
        doc.setTextColor(255, 0, 0);
        doc.text(15, yPosition - 5, `Coal Stock at ${powerplantName} will exhaust on: ${warningText}`);
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        yPosition += 20;

        if (comments) {
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.setFontStyle('italic');
            doc.text(15, yPosition - 5, `Comments: ${comments}`);
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
        }
    }

    doc.save('CoalScenario.pdf');
}

// Event Listeners (Updated for Transposed Layout)
function initializeCoalScenarioCalculator() {
    console.log('Initializing Coal Scenario Calculator...');
    
    // Initialize the transposed table
    createTransposedTable();
    console.log('Transposed table created. Month columns:', monthColumns);

    // Initialize coal sources table with the same first month
    if (monthColumns.length > 0) {
        console.log('Adding first month to coal sources:', getMonthName(monthColumns[0]));
        addMonthToCoalSources(getMonthName(monthColumns[0]));
    } else {
        console.warn('No month columns available for coal sources initialization');
    }

    // Setup autofill checkbox functionality
    setupAutofillCheckbox();

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

    // Update Add Month button to use new function
    if (coalAddRowBtn) {
        // Remove existing event listeners
        coalAddRowBtn.replaceWith(coalAddRowBtn.cloneNode(true));
        const newAddBtn = document.getElementById('addRowBtn');
        
        newAddBtn.addEventListener('click', () => {
            addMonth();
        });
    }

    if (copyQuantityCheckbox) {
        copyQuantityCheckbox.addEventListener('change', function () {
            if (this.checked && coalSourceTableBody) {
                // Copy logic for coal sources table
                const rows = document.querySelectorAll('#coalSourcesTableBody tr');
                for (let i = 1; i < rows.length; i++) {
                    const currentRow = rows[i];
                    const previousRow = rows[i - 1];
                    for (let j = 1; j <= currentSourceCount; j++) {
                        const currentInput = currentRow.querySelectorAll('td')[j];
                        const previousInput = previousRow.querySelectorAll('td')[j];
                        if (currentInput && previousInput) {
                            currentInput.textContent = previousInput.textContent;
                        }
                    }
                }
                updateTotal();
            }
        });
    }

    if (copyTotalsButton) {
        copyTotalsButton.addEventListener('click', copyCoalAvailabilityToFirstTable);
    }

    if (coalSourcesTableBody) {
        const cells = coalSourcesTableBody.querySelectorAll('td:not(:first-child)');
        cells.forEach((cell) => {
            cell.addEventListener('input', restrictToNumbers);
        });

        coalSourcesTableBody.addEventListener('input', (event) => {
            restrictToNumbers(event);
            updateTotal();
            checkForNegativeClosingStock();
        });
        coalSourcesTableBody.addEventListener('change', updateTotal);
    }

    const daysToMaintainStockInput = document.getElementById('daysToMaintainStock');
    if (daysToMaintainStockInput) {
        daysToMaintainStockInput.addEventListener('input', function() {
            checkForNegativeClosingStock();
        });
    }
    
    // Initialize calculations
    recalculateAllColumns();
    updateTotal();
    updateTotals2();
}

// Initialize when DOM is loaded (only if not called from utils.js)
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on a standalone page (not integrated into the main app)
    if (document.getElementById('Table1') && !document.querySelector('.container-fluid')) {
        setTimeout(() => {
            initializeCoalScenarioCalculator();
            moveAddMonthButtonToCardHeader();
        }, 100);
    }
});

// Function to move Add Month button to card header
function moveAddMonthButtonToCardHeader() {
    // Create the Add Month button for the card header
    const addMonthBtn = document.createElement('button');
    addMonthBtn.innerHTML = '<i class="bi bi-plus-circle"></i> Add Month';
    addMonthBtn.className = 'btn btn-primary btn-sm';
    addMonthBtn.onclick = addMonth;
    addMonthBtn.id = 'header-add-month-btn';
    
    // Try to find the main Coal Scenario card header
    let mainCardHeader = document.querySelector('.card-header');
    
    // If there's a specific Coal Scenario card header, use that
    const coalHeaders = document.querySelectorAll('.card-header');
    coalHeaders.forEach(header => {
        if (header.textContent.includes('Coal Scenario')) {
            mainCardHeader = header;
        }
    });
    
    if (mainCardHeader) {
        // Check if the header already has a two-row structure
        let buttonRow = mainCardHeader.querySelector('.d-flex');
        
        if (!buttonRow) {
            // Create the two-row structure without the toggle
            const headerText = mainCardHeader.innerHTML;
            mainCardHeader.innerHTML = `
                <div class="mb-2">${headerText}</div>
                <div class="d-flex flex-wrap justify-content-start align-items-center">
                    <div class="d-flex flex-wrap gap-2" id="header-buttons-container">
                    </div>
                </div>
            `;
            buttonRow = mainCardHeader.querySelector('#header-buttons-container');
        }
        
        // Add the Add Month button to the main header
        if (buttonRow) {
            buttonRow.appendChild(addMonthBtn);
        }
    } else {
        console.warn('Main card header not found. Add Month button will remain in the table.');
    }
    
    // Now add the Add Source button to the sources table card header
    addSourceButtonToSourcesCardHeader();
}

// Function to add the Add Source button to the sources table card header
function addSourceButtonToSourcesCardHeader() {
    // Create the Add Source button for the sources card header
    const addSourceBtn = document.createElement('button');
    addSourceBtn.innerHTML = '<i class="bi bi-plus-square"></i> Add Source';
    addSourceBtn.className = 'btn btn-success btn-sm';
    addSourceBtn.onclick = addSourceColumn;
    addSourceBtn.id = 'header-add-source-btn';
    
    // Create the Auto Copy checkbox for the sources card header
    const autoCopyContainer = document.createElement('div');
    autoCopyContainer.className = 'form-check form-check-inline form-switch ms-3';
    
    const autoCopyCheckbox = document.createElement('input');
    autoCopyCheckbox.className = 'form-check-input';
    autoCopyCheckbox.type = 'checkbox';
    autoCopyCheckbox.id = 'copyQuantityCheckbox';
    
    const autoCopyLabel = document.createElement('label');
    autoCopyLabel.className = 'form-check-label text-dark';
    autoCopyLabel.setAttribute('for', 'copyQuantityCheckbox');
    autoCopyLabel.textContent = 'Auto Copy Quantities';
    
    autoCopyContainer.appendChild(autoCopyCheckbox);
    autoCopyContainer.appendChild(autoCopyLabel);
    
    // Find the card header that contains the coal sources table
    let sourcesCardHeader = null;
    const allHeaders = document.querySelectorAll('.card-header');
    
    // Look for headers that might contain "Sources", "Coal Sources", "Availability", etc.
    allHeaders.forEach(header => {
        const headerText = header.textContent.toLowerCase();
        if (headerText.includes('sources') || 
            headerText.includes('availability') || 
            headerText.includes('coal availability') ||
            headerText.includes('source')) {
            sourcesCardHeader = header;
        }
    });
    
    // If no specific sources header found, look for the card that contains the coalSourcesTableBody
    if (!sourcesCardHeader) {
        const coalSourcesTable = document.getElementById('coalSourcesTableBody');
        if (coalSourcesTable) {
            // Traverse up to find the card header
            let parent = coalSourcesTable.parentElement;
            while (parent && !parent.classList.contains('card')) {
                parent = parent.parentElement;
            }
            if (parent) {
                sourcesCardHeader = parent.querySelector('.card-header');
            }
        }
    }
    
    if (sourcesCardHeader) {
        // Remove any existing auto-copy checkboxes first
        const existingCheckboxes = sourcesCardHeader.querySelectorAll('input[type="checkbox"]');
        existingCheckboxes.forEach(checkbox => {
            if (checkbox.id.includes('copy') || checkbox.id.includes('Copy')) {
                const container = checkbox.closest('.form-check') || checkbox.parentElement;
                if (container) {
                    container.remove();
                }
            }
        });
        
        // Check if the header already has a button container
        let buttonRow = sourcesCardHeader.querySelector('.d-flex');
        
        if (!buttonRow) {
            // Create the button structure for sources header
            const headerText = sourcesCardHeader.innerHTML;
            sourcesCardHeader.innerHTML = `
                <div class="mb-2">${headerText}</div>
                <div class="d-flex flex-wrap justify-content-between align-items-center">
                    <div class="d-flex flex-wrap gap-2" id="sources-header-buttons-container">
                    </div>
                    <div class="d-flex align-items-center" id="sources-header-controls-container">
                    </div>
                </div>
            `;
            buttonRow = sourcesCardHeader.querySelector('#sources-header-buttons-container');
        }
        
        // Add the Add Source button to the left side
        if (buttonRow) {
            buttonRow.appendChild(addSourceBtn);
        }
        
        // Add the Auto Copy checkbox to the right side
        const controlsContainer = sourcesCardHeader.querySelector('#sources-header-controls-container');
        if (controlsContainer) {
            controlsContainer.appendChild(autoCopyContainer);
        } else if (buttonRow) {
            // Fallback: add to button row if controls container not found
            buttonRow.appendChild(autoCopyContainer);
        }
        
        // Set up the event listener for the new checkbox
        autoCopyCheckbox.addEventListener('change', function () {
            console.log('Auto-copy checkbox changed:', this.checked);
            if (this.checked && coalSourceTableBody) {
                // Copy logic for coal sources table
                const rows = document.querySelectorAll('#coalSourcesTableBody tr');
                for (let i = 1; i < rows.length; i++) {
                    const currentRow = rows[i];
                    const previousRow = rows[i - 1];
                    for (let j = 1; j <= currentSourceCount; j++) {
                        const currentInput = currentRow.querySelectorAll('td')[j];
                        const previousInput = previousRow.querySelectorAll('td')[j];
                        if (currentInput && previousInput) {
                            currentInput.textContent = previousInput.textContent;
                        }
                    }
                }
                updateTotal();
            }
        });
        
        console.log('Add Source button and Auto Copy checkbox added to sources card header');
    } else {
        console.warn('Sources card header not found. Add Source button will be added to main header.');
        // Fallback: add to main header if sources header not found
        const mainButtonContainer = document.getElementById('header-buttons-container');
        if (mainButtonContainer) {
            mainButtonContainer.appendChild(addSourceBtn);
            mainButtonContainer.appendChild(autoCopyContainer);
        }
    }
}

// Function to remove existing checkbox from original location
function removeExistingCheckboxFromOriginalLocation() {
    // Find and remove the checkbox from the settings area
    const existingCheckbox = document.getElementById('copyQuantityCheckbox');
    if (existingCheckbox) {
        const container = existingCheckbox.closest('.form-check') || existingCheckbox.parentElement;
        if (container) {
            container.remove();
            console.log('Removed existing auto-copy checkbox from original location');
        }
    }
}

// Complete initialization function for external use
function initializeCoalCalculatorFully() {
    console.log('Full initialization called from external source');
    
    // Remove existing checkbox from original location first
    setTimeout(() => {
        removeExistingCheckboxFromOriginalLocation();
    }, 100);
    
    // Initialize the transposed table
    createTransposedTable();
    console.log('Transposed table created. Month columns:', monthColumns);

    // Move Add Month button to card header
    setTimeout(() => {
        moveAddMonthButtonToCardHeader();
    }, 50);

    // Wait a bit for DOM to be fully ready, then initialize coal sources and autofill
    setTimeout(() => {
        // Make existing source headers editable
        makeExistingSourceHeadersEditable();
        
        // Add auto-copy functionality to existing coal source cells
        addAutoCopyToExistingCells();
        
        if (monthColumns.length > 0) {
            console.log('Adding first month to coal sources:', getMonthName(monthColumns[0]));
            addMonthToCoalSources(getMonthName(monthColumns[0]));
        } else {
            console.warn('No month columns available for coal sources initialization');
        }
        
        // Setup autofill checkbox functionality
        setupAutofillCheckbox();
        
        // Initialize calculations
        recalculateAllColumns();
        updateTotal();
        updateTotals2();
    }, 100);
    
    // Additional call with longer delay to ensure DOM is fully loaded
    setTimeout(() => {
        console.log('Secondary call to make headers editable...');
        makeExistingSourceHeadersEditable();
    }, 500);
}

// Export functions for global access
window.generatePDFForCoalScenario = generatePDFForCoalScenario;
window.addMonth = addMonth;
window.clearValuesInCoalTableBody = clearValuesInCoalTableBody;
window.copyCoalAvailabilityToFirstTable = copyCoalAvailabilityToFirstTable;
window.createTransposedTable = createTransposedTable;
window.addMonthToCoalSources = addMonthToCoalSources;
window.addSourceColumn = addSourceColumn;
window.makeExistingSourceHeadersEditable = makeExistingSourceHeadersEditable;
window.autoKeyCopyValuesIfEnabled = autoKeyCopyValuesIfEnabled;
window.debugAutoCopy = debugAutoCopy;
window.getMonthName = getMonthName;
window.initializeCoalCalculatorFully = initializeCoalCalculatorFully;
window.updateFirstMonth = updateFirstMonth;

// Legacy function exports for backward compatibility
window.addCoalRow = addMonth;
window.recalculateAllRows = recalculateAllColumns;
