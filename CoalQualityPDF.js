// CoalQuality PDF Generation Module
// This file provides PDF export functionality for Coal Quality & Cost Analysis

console.log('CoalQuality PDF module loaded successfully');

// Check availability of required libraries
function QCCheckLibraries() {
    return {
        pdf: typeof window.jspdf !== 'undefined',
        excel: typeof XLSX !== 'undefined',
        canvas: typeof html2canvas !== 'undefined'
    };
}

// Main PDF Export Function
function QCExportToPDF() {
    try {
        // Check library availability
        const libs = QCCheckLibraries();
        if (!libs.pdf) {
            alert('PDF export library not loaded. Please ensure jsPDF is included.');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4'); // Portrait orientation
        
        // Get current data
        const processedData = QCGetProcessedData();
        const visibleColumns = QCGetVisibleColumns();
        
        // Debug: Log visible columns
        console.log('PDF Export - Visible Columns:', visibleColumns.map(col => `${col.header} (index: ${col.index})`));
        
        if (!processedData || processedData.length === 0) {
            alert('No data to export. Please select a valid date range.');
            return;
        }
        
        // PDF settings
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 10;
        const startY = 30;
        
        // Title
        const startMonth = document.getElementById('QCStartMonth').value;
        const endMonth = document.getElementById('QCEndMonth').value;
        const startDisplay = formatMonthForDisplay(startMonth);
        const endDisplay = formatMonthForDisplay(endMonth);
        
        let periodText = '';
        if (startDisplay === endDisplay) {
            periodText = `during ${startDisplay}`;
        } else {
            periodText = `from ${startDisplay} to ${endDisplay}`;
        }
        
        const title = `Coal Quality & Cost Analysis Report ${periodText}`;
        
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(title, pageWidth / 2, 20, { align: 'center' });
        
        // Prepare table data
        const headers = visibleColumns.map(col => col.header);
        const rows = processedData.map(row => {
            return visibleColumns.map(col => {
                let value = row[col.index] || '';
                
                // Format specific columns
                if (col.index === 1) { // Plant name
                    value = shortenPlantName(value);
                } else if (col.index >= 15) { // Calculated columns
                    const coalCost = parseFloat(row[12]) || 0;
                    const railwayFreight = parseFloat(row[13]) || 0;
                    const gcv = parseFloat(row[11]) || 1;
                    const shr = getWeightedAverageSHRForPlant(row[1] || 'PSPCL');
                    
                    switch (col.index) {
                        case 15: // Landed Cost Rs/MT
                            value = (coalCost + railwayFreight).toFixed(0);
                            break;
                        case 16: // Landed Cost Rs/Mcal
                            const landedCostPerMT = coalCost + railwayFreight;
                            value = gcv > 0 ? (landedCostPerMT / gcv).toFixed(4) : '0.0000';
                            break;
                        case 17: // Per Unit Cost
                            const landedCostPerMcal = gcv > 0 ? (coalCost + railwayFreight) / gcv : 0;
                            value = (shr * landedCostPerMcal / 1000).toFixed(3);
                            break;
                    }
                } else if (col.index >= 3 && col.index <= 14 && !isNaN(parseFloat(value))) {
                    // Format numbers
                    if (col.index === 3 || col.index === 4) { // Qty columns
                        value = parseFloat(value).toFixed(4);
                    } else if (col.index === 5) { // Rakes
                        value = Math.round(parseFloat(value)).toString();
                    } else if (col.index === 11 || col.index === 12 || col.index === 13) { // GCV, Coal Cost, Railway Freight
                        value = Math.round(parseFloat(value)).toString();
                    } else {
                        value = parseFloat(value).toFixed(2);
                    }
                }
                
                return value.toString();
            }).filter((val, index) => visibleColumns[index]); // Remove any undefined columns
        });
        
        // Add total row if multiple rows exist
        if (processedData.length > 1) {
            const totalRow = QCCalculateTotalRow(processedData, 'Grand Total', visibleColumns);
            if (totalRow) {
                const totalRowData = visibleColumns.map(col => {
                    if (col.index === 1) {
                        return 'Grand Total';
                    } else if (col.index === 2) {
                        return '';
                    } else if (col.index <= 14) {
                        const val = parseFloat(totalRow[col.index]);
                        if (!isNaN(val)) {
                            if (col.index === 3 || col.index === 4) {
                                return val.toFixed(4);
                            } else if (col.index === 5) {
                                return Math.round(val).toString();
                            } else if (col.index === 11 || col.index === 12 || col.index === 13) {
                                return Math.round(val).toString();
                            } else {
                                return val.toFixed(2);
                            }
                        }
                        return '';
                    } else {
                        // Calculate extended columns for total
                        const coalCost = parseFloat(totalRow[12]) || 0;
                        const railwayFreight = parseFloat(totalRow[13]) || 0;
                        const gcv = parseFloat(totalRow[11]) || 1;
                        const shr = getWeightedAverageSHRForPlant('PSPCL');
                        
                        switch (col.index) {
                            case 15:
                                return (coalCost + railwayFreight).toFixed(0);
                            case 16:
                                const landedCostPerMT = coalCost + railwayFreight;
                                return gcv > 0 ? (landedCostPerMT / gcv).toFixed(4) : '0.0000';
                            case 17:
                                const landedCostPerMcal = gcv > 0 ? (coalCost + railwayFreight) / gcv : 0;
                                return (shr * landedCostPerMcal / 1000).toFixed(3);
                            default:
                                return '';
                        }
                    }
                }).filter((val, index) => visibleColumns[index]); // Ensure total row matches visible columns
                rows.push(totalRowData);
            }
        }
        
        // Use autoTable plugin if available
        if (doc.autoTable) {
            // Generate dynamic column styles based on visible columns only
            const columnStyles = {};
            const totalAvailableWidth = pageWidth - 10; // 5mm margin on each side
            let totalAssignedWidth = 0;
            
            // First pass: assign optimal widths for each column type
            const optimalWidths = visibleColumns.map((col, index) => {
                let width;
                if (col.header.includes('Plant Name')) {
                    width = 16; // Reduced from 20
                } else if (col.header.includes('Coal Company')) {
                    width = 14; // Reduced from 18
                } else if (col.header.includes('Date')) {
                    width = 12; // Reduced from 15
                } else if (col.header.includes('Qty') && col.header.includes('Lakh')) {
                    width = 10; // Reduced from 12
                } else if (col.header.includes('Cost') || col.header.includes('Freight')) {
                    width = 12; // Reduced from 15
                } else if (col.header.includes('Landed Cost')) {
                    width = 12; // Reduced from 14
                } else if (col.header.includes('Per Unit Cost')) {
                    width = 11; // Reduced from 13
                } else if (col.header.includes('GCV')) {
                    width = 10; // Reduced from 12
                } else if (col.header.includes('%')) {
                    width = 8; // Reduced from 10
                } else if (col.header.includes('Rakes') || col.header.includes('Distance')) {
                    width = 8; // Reduced from 10
                } else {
                    width = 10; // Reduced from 12 - Default width
                }
                return width;
            });
            
            // Calculate total optimal width
            const totalOptimalWidth = optimalWidths.reduce((sum, width) => sum + width, 0);
            
            // If total optimal width exceeds available width, scale down proportionally
            const scaleFactor = totalOptimalWidth > totalAvailableWidth ? 
                totalAvailableWidth / totalOptimalWidth : 1;
            
            // Assign final widths
            visibleColumns.forEach((col, index) => {
                const finalWidth = Math.max(optimalWidths[index] * scaleFactor, 8); // Minimum 8mm
                columnStyles[index] = { cellWidth: finalWidth };
                totalAssignedWidth += finalWidth;
            });
            
            console.log('PDF Column Widths:', columnStyles);
            console.log('Total Assigned Width:', totalAssignedWidth, 'Available Width:', totalAvailableWidth);
            
            doc.autoTable({
                head: [headers],
                body: rows,
                startY: startY,
                margin: { left: 3, right: 3 }, // Further reduced margins
                styles: {
                    fontSize: 5, // Increased from 4 to 5
                    cellPadding: 0.3, // Reduced from 0.5 to 0.3
                    overflow: 'linebreak',
                    halign: 'center',
                    lineWidth: 0.1,
                    lineColor: [200, 200, 200]
                },
                headStyles: {
                    fillColor: [102, 126, 234], // Purple color to match theme
                    textColor: 255,
                    fontStyle: 'bold',
                    fontSize: 6, // Increased from 5 to 6
                    cellPadding: 0.4
                },
                alternateRowStyles: {
                    fillColor: [248, 249, 255]
                },
                tableLineColor: [150, 150, 150],
                tableLineWidth: 0.1,
                columnStyles: columnStyles, // Use dynamic column styles
                didDrawPage: function (data) {
                    // Store the final Y position after main table
                    window.mainTableEndY = data.cursor.y;
                }
            });
            
            // Add summary table on same page if there's space
            const summaryData = QCGetSummaryData();
            if (summaryData && summaryData.length > 0) {
                let summaryStartY = window.mainTableEndY + 10; // Reduced gap from 15 to 10
                
                // Check if summary table will fit on current page
                const estimatedSummaryHeight = (summaryData.length + 1) * 8 + 25; // More accurate estimate
                
                if (summaryStartY + estimatedSummaryHeight > pageHeight - 20) {
                    doc.addPage(); // Add new page if no space
                    summaryStartY = 30;
                }
                
                doc.setFontSize(11); // Reduced from 12
                doc.setFont(undefined, 'bold');
                doc.text('Summary - Station Heat Rate (SHR) Details', pageWidth / 2, summaryStartY - 5, { align: 'center' });
                
                const summaryHeaders = ['Parameter', 'Value', 'Unit'];
                const summaryRows = summaryData.map(item => [item.parameter || '', item.value || '', item.unit || '']);
                
                console.log('Summary Data for PDF:', summaryData);
                console.log('Summary Rows:', summaryRows);
                
                doc.autoTable({
                    head: [summaryHeaders],
                    body: summaryRows,
                    startY: summaryStartY,
                    margin: { left: 15, right: 15 }, // Adjusted margins
                    styles: {
                        fontSize: 8, // Reduced from 9
                        cellPadding: 1.5, // Reduced from 2
                        halign: 'center',
                        lineWidth: 0.1,
                        lineColor: [200, 200, 200]
                    },
                    headStyles: {
                        fillColor: [102, 126, 234],
                        textColor: 255,
                        fontStyle: 'bold',
                        fontSize: 9
                    },
                    columnStyles: {
                        0: { cellWidth: 70, halign: 'left' },  // Parameter - left aligned
                        1: { cellWidth: 35, halign: 'center' },  // Value - center aligned
                        2: { cellWidth: 35, halign: 'center' }   // Unit - center aligned
                    },
                    tableLineColor: [150, 150, 150],
                    tableLineWidth: 0.1,
                    pageBreak: 'avoid' // Try to avoid page breaks within summary table
                });
            }
        } else {
            // Fallback to basic table if autoTable is not available
            let currentY = startY;
            const rowHeight = 6;
            const colWidth = (pageWidth - 2 * margin) / headers.length;
            
            // Draw headers
            doc.setFontSize(8);
            doc.setFont(undefined, 'bold');
            headers.forEach((header, i) => {
                doc.rect(margin + i * colWidth, currentY, colWidth, rowHeight);
                doc.text(header, margin + i * colWidth + 2, currentY + 4);
            });
            currentY += rowHeight;
            
            // Draw data rows
            doc.setFont(undefined, 'normal');
            rows.forEach(row => {
                row.forEach((cell, i) => {
                    doc.rect(margin + i * colWidth, currentY, colWidth, rowHeight);
                    doc.text(cell, margin + i * colWidth + 2, currentY + 4);
                });
                currentY += rowHeight;
                
                // Check if we need a new page
                if (currentY > pageHeight - 20) {
                    doc.addPage();
                    currentY = 20;
                }
            });
        }
        
        // Add footer to all pages
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 5, pageHeight - 10);
            doc.text(`Page ${i} of ${pageCount}`, pageWidth - 40, pageHeight - 10);
        }
        
        // Save the PDF
        const filename = `Coal_Quality_Analysis_${startDisplay}_to_${endDisplay}.pdf`.replace(/[^a-zA-Z0-9_-]/g, '_');
        doc.save(filename);
        
    } catch (error) {
        console.error('PDF export error:', error);
        alert(`Error generating PDF: ${error.message}`);
    }
}

// Excel Export Function
function QCExportToExcel() {
    try {
        // Check library availability
        const libs = QCCheckLibraries();
        if (!libs.excel) {
            alert('Excel export library not loaded. Please ensure SheetJS is included.');
            return;
        }
        
        const processedData = QCGetProcessedData();
        const visibleColumns = QCGetVisibleColumns();
        
        if (!processedData || processedData.length === 0) {
            alert('No data to export. Please select a valid date range.');
            return;
        }
        
        // Prepare workbook
        const wb = XLSX.utils.book_new();
        
        // Main data sheet
        const headers = visibleColumns.map(col => col.header);
        const wsData = [headers];
        
        // Add data rows
        processedData.forEach(row => {
            const rowData = visibleColumns.map(col => {
                let value = row[col.index] || '';
                
                // Handle calculated columns
                if (col.index >= 15) {
                    const coalCost = parseFloat(row[12]) || 0;
                    const railwayFreight = parseFloat(row[13]) || 0;
                    const gcv = parseFloat(row[11]) || 1;
                    const shr = getWeightedAverageSHRForPlant(row[1] || 'PSPCL');
                    
                    switch (col.index) {
                        case 15:
                            value = coalCost + railwayFreight;
                            break;
                        case 16:
                            const landedCostPerMT = coalCost + railwayFreight;
                            value = gcv > 0 ? landedCostPerMT / gcv : 0;
                            break;
                        case 17:
                            const landedCostPerMcal = gcv > 0 ? (coalCost + railwayFreight) / gcv : 0;
                            value = shr * landedCostPerMcal / 1000;
                            break;
                    }
                } else if (col.index === 1) {
                    value = shortenPlantName(value);
                }
                
                return value;
            });
            wsData.push(rowData);
        });
        
        // Add total row
        if (processedData.length > 1) {
            const totalRow = QCCalculateTotalRow(processedData, 'Grand Total', visibleColumns);
            if (totalRow) {
                const totalRowData = visibleColumns.map(col => {
                    if (col.index === 1) return 'Grand Total';
                    if (col.index === 2) return '';
                    if (col.index <= 14) return totalRow[col.index] || '';
                    
                    // Calculate extended columns for total
                    const coalCost = parseFloat(totalRow[12]) || 0;
                    const railwayFreight = parseFloat(totalRow[13]) || 0;
                    const gcv = parseFloat(totalRow[11]) || 1;
                    const shr = getWeightedAverageSHRForPlant('PSPCL');
                    
                    switch (col.index) {
                        case 15: return coalCost + railwayFreight;
                        case 16: return gcv > 0 ? (coalCost + railwayFreight) / gcv : 0;
                        case 17: return shr * (gcv > 0 ? (coalCost + railwayFreight) / gcv : 0) / 1000;
                        default: return '';
                    }
                });
                wsData.push(totalRowData);
            }
        }
        
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Coal Quality Analysis');
        
        // Add summary sheet if available
        const summaryData = QCGetSummaryData();
        if (summaryData && summaryData.length > 0) {
            const summaryWsData = [['Parameter', 'Value', 'Unit']];
            summaryData.forEach(item => {
                summaryWsData.push([item.parameter, item.value, item.unit]);
            });
            
            const summaryWs = XLSX.utils.aoa_to_sheet(summaryWsData);
            XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
        }
        
        // Save the file
        const startMonth = document.getElementById('QCStartMonth').value;
        const endMonth = document.getElementById('QCEndMonth').value;
        const startDisplay = formatMonthForDisplay(startMonth);
        const endDisplay = formatMonthForDisplay(endMonth);
        const filename = `Coal_Quality_Analysis_${startDisplay}_to_${endDisplay}.xlsx`.replace(/[^a-zA-Z0-9_-]/g, '_');
        
        XLSX.writeFile(wb, filename);
        
    } catch (error) {
        console.error('Excel export error:', error);
        alert(`Error generating Excel file: ${error.message}`);
    }
}

// Print Report Function
function QCPrintReport() {
    try {
        // Open print dialog for the current page
        window.print();
    } catch (error) {
        console.error('Print error:', error);
        alert(`Error printing report: ${error.message}`);
    }
}