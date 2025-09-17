// Google Apps Script for Coal Management App Authentication System
// Deploy this as a Web App in Google Apps Script Console

// Configuration - Update this with your actual Google Sheet ID
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // Replace with your Google Sheet ID
const SHEET_NAME = 'Sheet1'; // Default sheet name (change if needed)

/**
 * Main function to handle all API requests with CORS support
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    // Log the request for debugging
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
          
      case 'getAllUsers':
        result = getAllUsers();
        break;
          
      case 'updateUserStatus':
        result = updateUserStatus(data.mobile, data.status);
        break;
          
      default:
        result = {success: false, message: 'Invalid action'};
    }
    
    // Return with CORS headers
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
  } catch (error) {
    console.error('Error in doPost:', error);
    const errorResult = {success: false, message: 'Server error: ' + error.message};
    return ContentService
      .createTextOutput(JSON.stringify(errorResult))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
/**
 * Handle OPTIONS requests for CORS preflight
 */
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * Handle GET requests (for testing)
 */
function doGet(e) {
  const html = `
    <h2>Coal Management App Authentication API</h2>
    <p>API is running successfully!</p>
    <p>Sheet ID: ${SHEET_ID}</p>
    <p>Current Time: ${new Date().toISOString()}</p>
    <p>Available endpoints:</p>
    <ul>
      <li>POST: register</li>
      <li>POST: authenticate</li>
      <li>POST: checkStatus</li>
      <li>POST: getAllUsers</li>
      <li>POST: updateUserStatus</li>
    </ul>
  `;
  
  return HtmlService.createHtmlOutput(html);
}

/**
 * Register a new user
 */
function registerUser(userData) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    // Validate required fields
    if (!userData.name || !userData.mobile || !userData.email || !userData.password) {
      return {
        success: false,
        message: 'Missing required fields'
      };
    }
    
    // Check if user already exists by mobile
    const existingUser = findUserByMobile(userData.mobile);
    if (existingUser) {
      return {
        success: false,
        message: 'User with this mobile number already exists'
      };
    }
    
    // Check if email already exists
    const existingEmail = findUserByEmail(userData.email);
    if (existingEmail) {
      return {
        success: false,
        message: 'User with this email already exists'
      };
    }
    
    // Hash the password (simple encoding for demo - use proper hashing in production)
    const hashedPassword = Utilities.base64Encode(userData.password + 'COAL_SALT');
    
    // Add user to sheet
    const timestamp = new Date().toISOString();
    const rowData = [
      timestamp,                    // A: Timestamp
      userData.name,               // B: Name
      userData.mobile,             // C: Mobile
      userData.email,              // D: Email
      userData.company || '',      // E: Company
      userData.purpose || '',      // F: Purpose
      'pending',                   // G: Status
      hashedPassword,              // H: Password
      userData.emailVerified || true, // I: Email Verified
      '',                          // J: Last Login
      userData.timestamp || timestamp // K: Registration Date
    ];
    
    sheet.appendRow(rowData);
    
    // Log successful registration
    console.log('User registered successfully:', userData.name, userData.mobile);
    
    return {
      success: true,
      message: 'User registered successfully'
    };
    
  } catch (error) {
    console.error('Error in registerUser:', error);
    return {
      success: false,
      message: 'Registration failed: ' + error.toString()
    };
  }
}

/**
 * Authenticate user login
 */
function authenticateUser(mobile, password) {
  try {
    const user = findUserByMobile(mobile);
    
    if (!user) {
      console.log('Authentication failed: User not found for mobile:', mobile);
      return {
        success: false,
        message: 'User not found'
      };
    }
    
    // Verify password
    const hashedPassword = Utilities.base64Encode(password + 'COAL_SALT');
    if (user.password !== hashedPassword) {
      console.log('Authentication failed: Invalid password for mobile:', mobile);
      return {
        success: false,
        message: 'Invalid password'
      };
    }
    
    // Update last login
    updateLastLogin(mobile);
    
    console.log('Authentication successful for user:', user.name, mobile);
    
    return {
      success: true,
      status: user.status,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      company: user.company
    };
    
  } catch (error) {
    console.error('Error in authenticateUser:', error);
    return {
      success: false,
      message: 'Authentication failed: ' + error.toString()
    };
  }
}

/**
 * Check user approval status
 */
function checkUserStatus(mobile) {
  try {
    const user = findUserByMobile(mobile);
    
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }
    
    return {
      success: true,
      status: user.status,
      name: user.name,
      email: user.email
    };
    
  } catch (error) {
    console.error('Error in checkUserStatus:', error);
    return {
      success: false,
      message: 'Status check failed: ' + error.toString()
    };
  }
}

/**
 * Find user by mobile number
 */
function findUserByMobile(mobile) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      if (data[i][2] === mobile) { // Mobile number is in column C (index 2)
        return {
          row: i + 1,
          timestamp: data[i][0],
          name: data[i][1],
          mobile: data[i][2],
          email: data[i][3],
          company: data[i][4],
          purpose: data[i][5],
          status: data[i][6],
          password: data[i][7],
          emailVerified: data[i][8],
          lastLogin: data[i][9],
          registrationDate: data[i][10]
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error in findUserByMobile:', error);
    return null;
  }
}

/**
 * Find user by email
 */
function findUserByEmail(email) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      if (data[i][3] === email) { // Email is in column D (index 3)
        return {
          row: i + 1,
          mobile: data[i][2],
          email: data[i][3],
          name: data[i][1]
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error in findUserByEmail:', error);
    return null;
  }
}

/**
 * Update last login timestamp
 */
function updateLastLogin(mobile) {
  try {
    const user = findUserByMobile(mobile);
    if (user) {
      const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
      const timestamp = new Date().toISOString();
      sheet.getRange(user.row, 10).setValue(timestamp); // Column J (index 9) for last login
      console.log('Last login updated for user:', mobile);
    }
  } catch (error) {
    console.error('Error in updateLastLogin:', error);
  }
}

/**
 * Initialize the Google Sheet with headers (run this once)
 */
function initializeSheet() {
  try {
    let sheet;
    
    // Try to get existing sheet or create new one
    try {
      sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    } catch (e) {
      // If sheet doesn't exist, create it
      const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
      sheet = spreadsheet.insertSheet(SHEET_NAME);
    }
    
    // Clear existing data and add headers
    sheet.clear();
    const headers = [
      'Timestamp',
      'Name',
      'Mobile',
      'Email',
      'Company',
      'Purpose',
      'Status',
      'Password',
      'Email Verified',
      'Last Login',
      'Registration Date'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format headers
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#2c3e50');
    headerRange.setFontColor('white');
    headerRange.setHorizontalAlignment('center');
    
    // Set column widths
    sheet.setColumnWidth(1, 180); // Timestamp
    sheet.setColumnWidth(2, 200); // Name
    sheet.setColumnWidth(3, 130); // Mobile
    sheet.setColumnWidth(4, 250); // Email
    sheet.setColumnWidth(5, 200); // Company
    sheet.setColumnWidth(6, 300); // Purpose
    sheet.setColumnWidth(7, 100); // Status
    sheet.setColumnWidth(8, 150); // Password (hash)
    sheet.setColumnWidth(9, 120); // Email Verified
    sheet.setColumnWidth(10, 180); // Last Login
    sheet.setColumnWidth(11, 180); // Registration Date
    
    // Add data validation for Status column
    const statusRange = sheet.getRange(2, 7, 1000, 1); // Status column
    const statusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['pending', 'approved', 'rejected'])
      .setAllowInvalid(false)
      .setHelpText('Select: pending, approved, or rejected')
      .build();
    statusRange.setDataValidation(statusRule);
    
    // Freeze header row
    sheet.setFrozenRows(1);
    
    console.log('Sheet initialized successfully');
    return {
      success: true,
      message: 'Sheet initialized successfully',
      sheetName: SHEET_NAME,
      headers: headers
    };
    
  } catch (error) {
    console.error('Error initializing sheet:', error);
    return {
      success: false,
      message: 'Error initializing sheet: ' + error.toString()
    };
  }
}

/**
 * Get all users (for admin dashboard)
 */
function getAllUsers() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    const users = [];
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      users.push({
        row: i + 1,
        timestamp: data[i][0],
        name: data[i][1],
        mobile: data[i][2],
        email: data[i][3],
        company: data[i][4],
        purpose: data[i][5],
        status: data[i][6],
        emailVerified: data[i][8],
        lastLogin: data[i][9],
        registrationDate: data[i][10]
      });
    }
    
    return {
      success: true,
      users: users,
      totalUsers: users.length
    };
    
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return {
      success: false,
      message: 'Failed to fetch users: ' + error.toString()
    };
  }
}

/**
 * Update user status (approve/reject)
 */
function updateUserStatus(mobile, newStatus) {
  try {
    const validStatuses = ['pending', 'approved', 'rejected'];
    
    if (!validStatuses.includes(newStatus)) {
      return {
        success: false,
        message: 'Invalid status. Must be: pending, approved, or rejected'
      };
    }
    
    const user = findUserByMobile(mobile);
    if (user) {
      const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
      sheet.getRange(user.row, 7).setValue(newStatus); // Column G (index 6) for status
      
      console.log('User status updated:', mobile, newStatus);
      
      return {
        success: true,
        message: `User status updated to ${newStatus}`,
        user: {
          name: user.name,
          mobile: user.mobile,
          status: newStatus
        }
      };
    } else {
      return {
        success: false,
        message: 'User not found'
      };
    }
  } catch (error) {
    console.error('Error in updateUserStatus:', error);
    return {
      success: false,
      message: 'Failed to update user status: ' + error.toString()
    };
  }
}

/**
 * Test function to verify the setup
 */
function testSetup() {
  console.log('Testing Google Apps Script setup...');
  
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    console.log('✅ Sheet access successful');
    console.log('Sheet name:', sheet.getName());
    console.log('Sheet rows:', sheet.getLastRow());
    console.log('Sheet columns:', sheet.getLastColumn());
    
    return {
      success: true,
      message: 'Setup test completed successfully',
      sheetName: sheet.getName(),
      sheetId: SHEET_ID,
      rows: sheet.getLastRow(),
      columns: sheet.getLastColumn(),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Sheet access failed:', error);
    return {
      success: false,
      message: 'Sheet access failed: ' + error.toString(),
      sheetId: SHEET_ID
    };
  }
}

/**
 * Get user statistics
 */
function getUserStats() {
  try {
    const allUsers = getAllUsers();
    
    if (!allUsers.success) {
      return allUsers;
    }
    
    const users = allUsers.users;
    const stats = {
      total: users.length,
      pending: users.filter(u => u.status === 'pending').length,
      approved: users.filter(u => u.status === 'approved').length,
      rejected: users.filter(u => u.status === 'rejected').length,
      emailVerified: users.filter(u => u.emailVerified === true).length
    };
    
    return {
      success: true,
      stats: stats,
      lastUpdated: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error in getUserStats:', error);
    return {
      success: false,
      message: 'Failed to get user statistics: ' + error.toString()
    };
  }
}

/**
 * Backup function to export all user data
 */
function exportUserData() {
  try {
    const allUsers = getAllUsers();
    
    if (!allUsers.success) {
      return allUsers;
    }
    
    return {
      success: true,
      data: allUsers.users,
      exportedAt: new Date().toISOString(),
      totalRecords: allUsers.users.length
    };
    
  } catch (error) {
    console.error('Error in exportUserData:', error);
    return {
      success: false,
      message: 'Failed to export user data: ' + error.toString()
    };
  }
}