// Analyze your fallback configuration
const fs = require('fs');

console.log('=== ANALYZING YOUR DASHBOARD CONFIGURATION ===');

// Read your Dashboard-DailyCoalPosition.js file
const dashboardCode = fs.readFileSync('Dashboard-DailyCoalPosition.js', 'utf8');

// Extract and display the fallback configuration
console.log('\n=== FALLBACK PLANT MAPPINGS ===');
const plantMappingsRegex = /plantMappings = \{[\s\S]*?\};/;
const plantMappingsMatch = dashboardCode.match(plantMappingsRegex);
if (plantMappingsMatch) {
    console.log(plantMappingsMatch[0]);
}

console.log('\n=== FALLBACK COAL COMPANIES ===');
const coalCompaniesRegex = /coalCompanies = \[[\s\S]*?\];/;
const coalCompaniesMatch = dashboardCode.match(coalCompaniesRegex);
if (coalCompaniesMatch) {
    console.log(coalCompaniesMatch[0]);
}

console.log('\n=== FALLBACK COLUMN STRUCTURE ===');
const columnStructureRegex = /columnStructure = \[[\s\S]*?\];/;
const columnStructureMatch = dashboardCode.match(columnStructureRegex);
if (columnStructureMatch) {
    const columnStructure = columnStructureMatch[0];
    
    // Parse the column structure and display it in a readable format
    const lines = columnStructure.split('\n');
    let tableSection = '';
    
    lines.forEach((line, index) => {
        if (line.includes('// Table 1')) {
            tableSection = 'TABLE 1 - RAKES LOADED';
            console.log(`\n=== ${tableSection} ===`);
        } else if (line.includes('// Table 2')) {
            tableSection = 'TABLE 2 - RAKES RECEIVED/PIPELINE';
            console.log(`\n=== ${tableSection} ===`);
        } else if (line.includes('// Table 3')) {
            tableSection = 'TABLE 3 - COAL STOCK';
            console.log(`\n=== ${tableSection} ===`);
        }
        
        if (line.trim().startsWith('{index:')) {
            // Extract the configuration details
            const indexMatch = line.match(/index:\s*(\d+)/);
            const typeMatch = line.match(/type:\s*'([^']+)'/);
            const companyMatch = line.match(/company:\s*'([^']+)'/);
            const plantMatch = line.match(/plant:\s*'([^']+)'/);
            const tableMatch = line.match(/table:\s*(\d+)/);
            
            const index = indexMatch ? indexMatch[1] : 'Unknown';
            const type = typeMatch ? typeMatch[1] : 'Unknown';
            const company = companyMatch ? companyMatch[1] : 'N/A';
            const plant = plantMatch ? plantMatch[1] : 'Unknown';
            const table = tableMatch ? tableMatch[1] : 'Unknown';
            
            if (table === '1') {
                console.log(`Column ${index}: ${company} -> Plant ${plant} (${type})`);
            } else if (table === '2') {
                console.log(`Column ${index}: Plant ${plant} -> ${type}`);
            } else if (table === '3') {
                console.log(`Column ${index}: Plant ${plant} -> ${type}`);
            }
        }
    });
}

console.log('\n=== SUMMARY ===');
console.log('This shows your current fallback configuration that gets used when');
console.log('the Dashboard-Config sheet cannot be accessed. This is the structure');
console.log('your code expects to find in the Google Sheet.');
