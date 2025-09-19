// Simple Google Apps Script for Coal Management App
// Your Sheet ID: 1bJJVYDRTLf7SSKcrWp9KQEEr6dhGFfZ4yt6mnoDYEVw
// Sheet Name: Users

const SHEET_ID = '1bJJVYDRTLf7SSKcrWp9KQEEr6dhGFfZ4yt6mnoDYEVw';
const SHEET_NAME = 'Users';

/**
 * Handle POST requests
 */
function doPost(e) {
  try {
    if (!e || !e.postData) {
      return createResponse({success: false, message: 'No data received'});
    }
    
    const data = JSON.parse(e.postData.contents);
    console.log('Request:', data);
    
    if (data.action === 'register') {
      return createResponse(registerUser(data));
    } else if (data.action === 'login') {
      return createResponse(loginUser(data));
    }
    
    return createResponse({success: false, message: 'Invalid action'});
    
  } catch (error) {
    console.error('Error:', error);
    return createResponse({success: false, message: 'Server error: ' + error.message});
  }
}

/**
 * Handle GET requests (for testing)
 */
function doGet(e) {
  const html = `
    <h2>Coal Management App - Simple Authentication API</h2>
    <p>✅ Status: Running</p>
    <p>🕒 Time: ${new Date()}</p>
    <p>📊 Sheet ID: ${SHEET_ID}</p>
    <p>📋 Sheet Name: ${SHEET_NAME}</p>
    <hr>
    <h3>Available Actions:</h3>
    <ul>
      <li>POST /register - Register new user</li>
      <li>POST /login - User login</li>
    </ul>
  `;
  return HtmlService.createHtmlOutput(html);
}

/**
 * Create JSON response
 */
function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Register new user
 */
function registerUser(data) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    // Validate required fields
    if (!data.name || !data.mobile || !data.email || !data.password) {
      return {success: false, message: 'Please fill all required fields'};
    }
    
    // Check if user already exists (by mobile or email)
    const existingData = sheet.getDataRange().getValues();
    for (let i = 1; i < existingData.length; i++) {
      if (existingData[i][1] === data.mobile || existingData[i][2] === data.email) {
        return {success: false, message: 'User already exists with this mobile number or email'};
      }
    }
    
    // Add new user to sheet
    // Columns: A=Name, B=Mobile, C=Email, D=Company, E=Purpose, F=RegistrationDate, G=LastLogin, H=Status
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    sheet.appendRow([
      data.name,           // A - Name
      data.mobile,         // B - Mobile  
      data.email,          // C - Email
      data.company || '',  // D - Company
      data.purpose || '',  // E - Purpose
      today,               // F - RegistrationDate
      '',                  // G - LastLogin (empty initially)
      'Pending'            // H - Status (default Pending)
    ]);
    
    // Also save password in a hidden column (I) for login verification
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 9).setValue(data.password); // Column I - Password (hidden)
    
    return {
      success: true, 
      message: 'Registration successful! Please wait for admin approval.',
      status: 'Pending'
    };
    
  } catch (error) {
    console.error('Registration error:', error);
    return {success: false, message: 'Registration failed: ' + error.message};
  }
}

/**
 * User login
 */
function loginUser(data) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!data.mobile || !data.password) {
      return {success: false, message: 'Please enter mobile number and password'};
    }
    
    // Find user by mobile number
    const sheetData = sheet.getDataRange().getValues();
    
    for (let i = 1; i < sheetData.length; i++) {
      const row = sheetData[i];
      const mobile = row[1];     // Column B - Mobile
      const status = row[7];     // Column H - Status  
      const password = sheet.getRange(i + 1, 9).getValue(); // Column I - Password
      
      if (mobile === data.mobile && password === data.password) {
        // Check status
        if (status !== 'Approved' && status !== 'approved') {
          let message = 'Account not approved yet. Please wait for admin approval.';
          if (status === 'Rejected' || status === 'rejected') {
            message = 'Account has been rejected. Please contact administrator.';
          } else if (status === 'Hold' || status === 'hold') {
            message = 'Account is on hold. Please contact administrator.';
          }
          return {success: false, message: message};
        }
        
        // Update last login date
        const today = new Date().toISOString().split('T')[0];
        sheet.getRange(i + 1, 7).setValue(today); // Column G - LastLogin
        
        return {
          success: true,
          message: 'Login successful',
          userData: {
            name: row[0],     // Column A - Name
            mobile: row[1],   // Column B - Mobile
            email: row[2],    // Column C - Email
            company: row[3],  // Column D - Company
            purpose: row[4]   // Column E - Purpose
          }
        };
      }
    }
    
    return {success: false, message: 'Invalid mobile number or password'};
    
  } catch (error) {
    console.error('Login error:', error);
    return {success: false, message: 'Login failed: ' + error.message};
  }
}

/**
 * Test function - run this to verify setup
 */
function testSetup() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    console.log('✅ Sheet access successful');
    console.log('Sheet name:', sheet.getName());
    console.log('Total rows:', sheet.getLastRow());
    
    // Test registration
    const testUser = {
      name: 'Test User',
      mobile: '9999999999',
      email: 'test@example.com',
      company: 'Test Company',
      purpose: 'Testing',
      password: 'test123'
    };
    
    const regResult = registerUser(testUser);
    console.log('Registration test:', regResult);
    
    return 'Setup test completed successfully';
  } catch (error) {
    console.error('Setup test failed:', error);
    return 'Setup test failed: ' + error.message;
  }
}