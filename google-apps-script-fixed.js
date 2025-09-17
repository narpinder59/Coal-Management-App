// Google Apps Script for Coal Management App Authentication System
// Deploy this as a Web App in Google Apps Script Console

// Configuration - Update this with your actual Google Sheet ID
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // Replace with your actual Google Sheet ID
const SHEET_NAME = 'Sheet1'; // Default sheet name

/**
 * Handle all HTTP requests with proper error handling
 */
function doPost(e) {
  try {
    // Check if postData exists (won't exist when testing from editor)
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService
        .createTextOutput(JSON.stringify({success: false, message: 'No POST data received'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    console.log('API Request:', action, data);
    
    let result;
    switch(action) {
      case 'register':
        result = registerUser(data.userData);
        break;
      case 'authenticate':
        result = authenticateUser(data.mobile, data.password);
        break;
      case 'checkStatus':
        result = checkUserStatus(data.mobile);
        break;
      default:
        result = {success: false, message: 'Invalid action'};
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService
      .createTextOutput(JSON.stringify({success: false, message: 'Server error: ' + error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests for testing
 */
function doGet(e) {
  // Test the sheet connection
  try {
    const sheet = getOrCreateSheet();
    const rowCount = sheet.getLastRow();
    
    const html = `
      <h2>Coal Management App Authentication API</h2>
      <p>✅ API Status: Running</p>
      <p>✅ Sheet Connection: Success</p>
      <p>📊 Users in sheet: ${rowCount - 1}</p>
      <p>🕒 Time: ${new Date().toISOString()}</p>
      <p>📋 Available endpoints:</p>
      <ul>
        <li>POST /register - Register new user</li>
        <li>POST /authenticate - Login user</li>
        <li>POST /checkStatus - Check user status</li>
      </ul>
      <hr>
      <h3>Test Registration:</h3>
      <p>Send POST request with this data:</p>
      <pre>{
  "action": "register",
  "userData": {
    "name": "Test User",
    "email": "test@example.com",
    "mobile": "9876543210",
    "password": "test123",
    "company": "Test Company",
    "purpose": "Testing"
  }
}</pre>
    `;
    
    return HtmlService.createHtmlOutput(html);
    
  } catch (error) {
    const errorHtml = `
      <h2>Coal Management App Authentication API</h2>
      <p>❌ Error: ${error.message}</p>
      <p>Please check your SHEET_ID configuration</p>
    `;
    return HtmlService.createHtmlOutput(errorHtml);
  }
}

/**
 * Remove the createCORSResponse function as setHeader doesn't exist
 * Google Apps Script handles CORS automatically for web apps
 */

/**
 * Test function - Run this to test your setup
 */
function testSetup() {
  try {
    console.log('Testing Google Apps Script setup...');
    
    // Test 1: Check if we can access the sheet
    const sheet = getOrCreateSheet();
    console.log('✅ Sheet access successful');
    console.log('Sheet name:', sheet.getName());
    console.log('Rows in sheet:', sheet.getLastRow());
    
    // Test 2: Test user registration
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      mobile: '9876543210',
      password: 'test123',
      company: 'Test Company',
      purpose: 'Testing'
    };
    
    const registerResult = registerUser(testUser);
    console.log('✅ Registration test result:', registerResult);
    
    // Test 3: Test authentication
    const authResult = authenticateUser('9999999999', 'admin123');
    console.log('✅ Authentication test result:', authResult);
    
    console.log('🎉 All tests completed successfully!');
    return 'Setup test completed successfully';
    
  } catch (error) {
    console.error('❌ Setup test failed:', error);
    return 'Setup test failed: ' + error.message;
  }
}

/**
 * Register a new user
 */
function registerUser(userData) {
  try {
    const sheet = getOrCreateSheet();
    
    // Validate required fields
    if (!userData.name || !userData.mobile || !userData.email || !userData.password) {
      return { success: false, message: 'Missing required fields' };
    }
    
    // Check if user already exists
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userData.email || data[i][2] === userData.mobile) {
        return { success: false, message: 'User already exists with this email or mobile number' };
      }
    }
    
    // Add new user
    const now = new Date().toISOString().split('T')[0];
    sheet.appendRow([
      userData.email,
      userData.name,
      userData.mobile,
      'pending', // status
      now, // registrationDate
      '', // lastLogin
      userData.company || '',
      userData.purpose || '',
      userData.password // In production, hash this password
    ]);
    
    return { 
      success: true, 
      message: 'Registration successful. Please wait for admin approval.',
      status: 'pending'
    };
    
  } catch (error) {
    console.error('Error in registerUser:', error);
    return { success: false, message: 'Registration failed: ' + error.message };
  }
}

/**
 * Authenticate user login
 */
function authenticateUser(mobile, password) {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    
    // Find user by mobile
    for (let i = 1; i < data.length; i++) {
      if (data[i][2] === mobile && data[i][8] === password) {
        const status = data[i][3];
        
        if (status !== 'approved') {
          return { 
            success: false, 
            message: status === 'pending' ? 'Account pending approval' : 'Account suspended'
          };
        }
        
        // Update last login
        sheet.getRange(i + 1, 6).setValue(new Date().toISOString().split('T')[0]);
        
        return {
          success: true,
          message: 'Login successful',
          userData: {
            name: data[i][1],
            email: data[i][0],
            mobile: data[i][2],
            company: data[i][6],
            purpose: data[i][7]
          }
        };
      }
    }
    
    return { success: false, message: 'Invalid mobile number or password' };
    
  } catch (error) {
    console.error('Error in authenticateUser:', error);
    return { success: false, message: 'Authentication failed: ' + error.message };
  }
}

/**
 * Check user status
 */
function checkUserStatus(mobile) {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][2] === mobile) {
        return {
          success: true,
          status: data[i][3],
          userData: {
            name: data[i][1],
            email: data[i][0],
            mobile: data[i][2]
          }
        };
      }
    }
    
    return { success: false, message: 'User not found' };
    
  } catch (error) {
    console.error('Error in checkUserStatus:', error);
    return { success: false, message: 'Status check failed: ' + error.message };
  }
}

/**
 * Get or create the users sheet
 */
function getOrCreateSheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      // Add headers
      sheet.getRange(1, 1, 1, 9).setValues([[
        'email', 'name', 'mobile', 'status', 'registrationDate', 
        'lastLogin', 'company', 'purpose', 'password'
      ]]);
      
      // Add sample admin user
      sheet.appendRow([
        'admin@coalapp.com',
        'Admin User', 
        '9999999999',
        'approved',
        new Date().toISOString().split('T')[0],
        '',
        'Coal Management',
        'Administrator',
        'admin123'
      ]);
    }
    
    return sheet;
    
  } catch (error) {
    console.error('Error in getOrCreateSheet:', error);
    throw new Error('Failed to access Google Sheet: ' + error.message);
  }
}