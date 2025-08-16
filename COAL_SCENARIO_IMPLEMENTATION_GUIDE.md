# Coal Scenario Calculator Implementation Guide

## 🚀 Successfully Implemented Features

### ✅ **Complete Integration**
The Coal Scenario Calculator has been successfully integrated into the Mobile App with the following components:

### 📁 **Files Modified/Created**

1. **`CoalScenario.js`** (Created)
   - Standalone mobile-responsive calculator module
   - Transposed table layout (months as columns)
   - All calculation logic and PDF generation

2. **`index.html`** (Modified)
   - Added CoalScenario.js script reference
   - Now loads the calculator module with other scripts

3. **`utils.js`** (Modified)
   - Added `showCalculatorsPage()` function
   - Added `showCoalScenarioCalculator()` function
   - Added calculator menu event listeners
   - Complete UI generation for calculator interface

4. **`components/navbar.html`** (Modified)
   - Added "Calculators" dropdown menu
   - Added "Coal Scenario Calculator" menu item

## 🎯 **How to Access the Calculator**

### **Method 1: Via Calculators Page**
1. Click "🧮 Calculators" in the sidebar menu
2. View the calculators overview page
3. Click "Open Calculator" on the Coal Scenario Calculator card

### **Method 2: Direct Access**
1. Click "🧮 Calculators" in the sidebar menu
2. Click "🔥 Coal Scenario Calculator" in the submenu

## 📱 **Mobile-Responsive Features**

### **Transposed Layout Benefits:**
- **Traditional Layout**: Months displayed vertically (rows)
- **New Layout**: Months displayed horizontally (columns)
- **Mobile Advantage**: Better horizontal scrolling experience
- **Sticky Labels**: Parameter names stay visible while scrolling

## 🧮 **Calculator Features**

### **Core Functionality:**
1. **Dynamic Month Management**
   - Add/remove months with "+" and "×" buttons
   - Automatic month progression (Jan → Feb → Mar...)
   - Year auto-increment after December

2. **Real-time Calculations**
   - Units Generated = Capacity × PLF × Days in Month ÷ 1000
   - Coal Consumption = Units Generated × SCC × 10
   - Closing Stock = Opening Stock + Coal Available - Coal Consumption
   - Stock in Days = Closing Stock ÷ (Coal Consumption ÷ 30)

3. **Smart Features**
   - Auto-copy values from previous month (checkbox)
   - Negative stock warnings with detailed analysis
   - Input validation and number formatting
   - Professional PDF export

4. **Coal Sources Management**
   - Separate table for coal availability sources
   - Copy totals to main calculation table
   - Individual source tracking (Source 1-5)

## 🎨 **User Interface**

### **Responsive Design:**
- Bootstrap 5 styling
- Card-based layout
- Mobile-optimized input fields
- Professional color scheme
- Touch-friendly buttons

### **Visual Indicators:**
- Red text for negative values
- Sticky parameter labels
- Clear section headers
- Progress indicators

## 📊 **Data Structure**

### **Main Table Parameters:**
```javascript
- Month (auto-generated)
- Generation Capacity (MW)
- PLF (%)
- Units Generated (MUs) - calculated
- Specific Coal Consumption (kg/kWh)
- Coal Requirement (MT) - calculated
- Coal Available (MT)
- Opening Coal Stock (MT)
- Closing Coal Stock (MT) - calculated
- Closing Coal Stock (Days) - calculated
```

## 🔧 **Technical Implementation**

### **Key Functions:**
- `createTransposedTable()` - Builds mobile-optimized table
- `addMonth()` - Adds new month column
- `recalculateColumn()` - Updates calculations for specific month
- `generatePDFForCoalScenario()` - Exports professional PDF
- `checkForNegativeClosingStock()` - Warns about stock issues

### **Event Handling:**
- Input validation on all numeric fields
- Real-time calculation updates
- Checkbox-triggered auto-copy functionality
- Mobile-responsive touch events

## 📋 **Usage Instructions**

### **Basic Workflow:**
1. Enter power plant name and stock maintenance days
2. Add months using the "+ Month" button
3. Fill in generation capacity and PLF for each month
4. Enter SCC (Specific Coal Consumption)
5. Add coal availability data
6. Review calculations and warnings
7. Export PDF report if needed

### **Tips for Best Results:**
- Enable "Auto Copy Values" for consistent data entry
- Use the coal sources table for detailed availability tracking
- Check negative stock warnings for planning insights
- Add comments for context in reports

## 🚨 **Warnings & Alerts**

The calculator provides intelligent warnings:
- **Stock Exhaustion Date**: When coal will run out
- **Additional Coal Required**: Daily/monthly requirements to avoid stockout
- **Stock Building Requirements**: Coal needed for desired inventory levels

## 📈 **Future Enhancements**

Ready for expansion:
- Additional calculator types (quality, cost analysis)
- Data persistence and saving
- Excel import/export
- Advanced reporting features
- Multi-plant comparison tools

## 🐛 **Troubleshooting**

### **Common Issues:**
1. **Calculator not loading**: Check browser console for JavaScript errors
2. **Menu not responding**: Ensure all scripts are loaded properly
3. **PDF not generating**: Verify jsPDF library is loaded
4. **Mobile issues**: Test responsive design on actual devices

### **Browser Compatibility:**
- Chrome/Edge: Full support
- Firefox: Full support  
- Safari: Full support
- Mobile browsers: Optimized experience

## 📞 **Support**

The implementation is complete and ready to use. All functions are properly integrated into the existing mobile app architecture with proper error handling and user feedback.

---

**✅ Implementation Status: COMPLETE**  
**🎯 Ready for Production Use**  
**📱 Mobile-Optimized**  
**🔧 Fully Functional**
