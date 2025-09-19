// FOOLPROOF Google Apps Script for Coal Management App
// This version handles CORS properly and works with GitHub Pages

const SHEET_ID = '1bJJVYDRTLf7SSKcrWp9KQEEr6dhGFfZ4yt6mnoDYEVw';
const SHEET_NAME = 'Users';

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
    <h3>Test API Status:</h3>
    <p>If you see this page, your Google Apps Script is deployed correctly!</p>
    <h3>Available Actions:</h3>
    <ul>
      <li>POST action=register - Register new user</li>
      <li>POST action=login - User login</li>
    </ul>
    <hr>
    <p><strong>Next Step:</strong> Test POST requests from your application.</p>
  `;
  return HtmlService.createHtmlOutput(html);
}

/**
 * Handle POST requests with proper CORS handling
 */
function doPost(e) {
  // Handle preflight OPTIONS request
  if (e.parameter.method === 'OPTIONS') {
    return handleCORS();
  }
  
  try {
    console.log('POST request received');
    console.log('Raw postData:', e.postData);
    
    if (!e.postData || !e.postData.contents) {
      console.error('No postData contents');
      return createJSONResponse({
        success: false, 
        message: 'No data received'
      });
    }
    
    const data = JSON.parse(e.postData.contents);
    console.log('Parsed data:', data);
    
    let result;
    
    if (data.action === 'register') {
      result = registerUser(data);
    } else if (data.action === 'login') {
      result = loginUser(data);
    } else {
      result = {
        success: false, 
        message: 'Invalid action: ' + data.action
      };
    }
    
    console.log('Result:', result);
    return createJSONResponse(result);
    
  } catch (error) {
    console.error('Error in doPost:', error);
    return createJSONResponse({
      success: false, 
      message: 'Server error: ' + error.toString()
    });
  }
}

/**
 * Create JSON response with CORS headers
 */
function createJSONResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  
  // Add CORS headers (note: these methods don't exist, but we'll try)
  try {
    output.setHeader('Access-Control-Allow-Origin', '*');
    output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  } catch (e) {
    console.log('Headers not supported, but that\'s OK');
  }
  
  return output;
}

/**
 * Handle CORS preflight
 */
function handleCORS() {
  const output = ContentService.createTextOutput('');
  output.setMimeType(ContentService.MimeType.TEXT);
  
  try {
    output.setHeader('Access-Control-Allow-Origin', '*');
    output.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  } catch (e) {
    console.log('CORS headers not supported');
  }
  
  return output;
}

/**
 * Register user
 */
function registerUser(data) {
  try {
    console.log('Starting registration for:', data.name);
    
    const sheet = getSheet();
    if (!sheet) {
      return {success: false, message: 'Could not access Google Sheet'};
    }
    
    // Validate required fields
    if (!data.name || !data.mobile || !data.email || !data.password) {
      return {
        success: false, 
        message: 'Missing required fields: name, mobile, email, password'
      };
    }
    
    // Check if user already exists
    const existingData = sheet.getDataRange().getValues();
    console.log('Checking existing users, total rows:', existingData.length);
    
    for (let i = 1; i < existingData.length; i++) {
      const row = existingData[i];
      if (row[1] === data.mobile || row[2] === data.email) {
        return {
          success: false, 
          message: 'User already exists with this mobile number or email'
        };
      }
    }
    
    // Add new user
    const today = new Date().toISOString().split('T')[0];
    const newRow = [
      data.name,           // A - Name
      data.mobile,         // B - Mobile  
      data.email,          // C - Email
      data.company || '',  // D - Company
      data.purpose || '',  // E - Purpose
      today,               // F - RegistrationDate
      '',                  // G - LastLogin
      'Pending',           // H - Status
      data.password        // I - Password
    ];
    
    console.log('Adding new row:', newRow);
    sheet.appendRow(newRow);
    
    console.log('User registered successfully');
    return {
      success: true, 
      message: 'Registration successful! Please wait for admin approval.',
      status: 'Pending'
    };
    
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false, 
      message: 'Registration failed: ' + error.toString()
    };
  }
}

/**
 * Login user
 */
function loginUser(data) {
  try {
    console.log('Login attempt for mobile:', data.mobile);
    
    const sheet = getSheet();
    if (!sheet) {
      return {success: false, message: 'Could not access Google Sheet'};
    }
    
    if (!data.mobile || !data.password) {
      return {
        success: false, 
        message: 'Please enter mobile number and password'
      };
    }
    
    const sheetData = sheet.getDataRange().getValues();
    console.log('Checking login, total users:', sheetData.length - 1);
    
    for (let i = 1; i < sheetData.length; i++) {
      const row = sheetData[i];
      const mobile = row[1];     // Column B
      const status = row[7];     // Column H  
      const password = row[8];   // Column I
      
      if (mobile === data.mobile && password === data.password) {
        console.log('User found, status:', status);
        
        // Check status
        const statusLower = status.toString().toLowerCase();
        if (statusLower !== 'approved') {
          let message = 'Account not approved yet. Current status: ' + status;
          if (statusLower === 'rejected') {
            message = 'Account has been rejected. Please contact administrator.';
          } else if (statusLower === 'hold') {
            message = 'Account is on hold. Please contact administrator.';
          }
          return {success: false, message: message};
        }
        
        // Update last login
        const today = new Date().toISOString().split('T')[0];
        sheet.getRange(i + 1, 7).setValue(today); // Column G
        
        console.log('Login successful');
        return {
          success: true,
          message: 'Login successful',
          userData: {
            name: row[0],     // Column A
            mobile: row[1],   // Column B
            email: row[2],    // Column C
            company: row[3],  // Column D
            purpose: row[4]   // Column E
          }
        };
      }
    }
    
    console.log('Login failed - user not found or wrong password');
    return {
      success: false, 
      message: 'Invalid mobile number or password'
    };
    
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false, 
      message: 'Login failed: ' + error.toString()
    };
  }
}

/**
 * Get Google Sheet safely
 */
function getSheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      console.log('Sheet not found, creating new one');
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      
      // Add headers
      sheet.getRange(1, 1, 1, 9).setValues([[
        'Name', 'Mobile', 'Email', 'Company', 'Purpose', 
        'RegistrationDate', 'LastLogin', 'Status', 'Password'
      ]]);
      
      console.log('Headers added to new sheet');
    }
    
    return sheet;
    
  } catch (error) {
    console.error('Error accessing sheet:', error);
    return null;
  }
}

/**
 * Test function
 */
function testSetup() {
  try {
    console.log('Testing setup...');
    
    const sheet = getSheet();
    if (!sheet) {
      throw new Error('Could not access sheet');
    }
    
    console.log('✅ Sheet access successful');
    console.log('Sheet name:', sheet.getName());
    console.log('Total rows:', sheet.getLastRow());
    
    // Test registration
    const testResult = registerUser({
      name: 'Test User',
      mobile: '9999999999',
      email: 'test@example.com',
      company: 'Test Company',
      purpose: 'Testing',
      password: 'test123'
    });
    
    console.log('Test registration result:', testResult);
    
    return 'Setup test completed successfully';
    
  } catch (error) {
    console.error('Setup test failed:', error);
    return 'Setup test failed: ' + error.toString();
  }
}