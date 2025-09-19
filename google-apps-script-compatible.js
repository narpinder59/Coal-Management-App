/**
 * Coal Management App - Google Apps Script Backend
 * Compatible with all Google Apps Script versions
 */

// Configuration
const SHEET_ID = '1bJJVYDRTLf7SSKcrWp9KQEEr6dhGFfZ4yt6mnoDYEVw';

/**
 * Handle all HTTP requests (GET and POST)
 */
function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  return handleRequest(e);
}

/**
 * Main request handler with CORS support
 */
function handleRequest(e) {
  try {
    console.log('=== REQUEST RECEIVED ===');
    console.log('Request data:', e);
    
    // Parse request data
    let requestData = {};
    
    if (e && e.postData) {
      try {
        requestData = JSON.parse(e.postData.contents);
        console.log('Parsed POST data:', requestData);
      } catch (parseError) {
        console.log('JSON parse failed, trying form data');
        requestData = e.parameter || {};
      }
    } else if (e && e.parameter) {
      requestData = e.parameter;
      console.log('Using GET parameters:', requestData);
    }
    
    // Default test response
    if (!requestData.action) {
      console.log('No action specified, returning test response');
      return createResponse({
        success: true,
        message: 'Google Apps Script is working! CORS enabled.',
        timestamp: new Date().toISOString(),
        available_actions: ['register', 'login']
      });
    }
    
    // Route to appropriate handler
    let result;
    switch (requestData.action) {
      case 'register':
        result = handleRegistration(requestData);
        break;
      case 'login':
        result = handleLogin(requestData);
        break;
      default:
        result = {
          success: false,
          message: 'Unknown action: ' + requestData.action
        };
    }
    
    console.log('Final result:', result);
    
    // Handle JSONP callback for CORS fallback
    if (requestData.callback) {
      console.log('Returning JSONP response with callback:', requestData.callback);
      const jsonpResponse = requestData.callback + '(' + JSON.stringify(result) + ');';
      return ContentService
        .createTextOutput(jsonpResponse)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    return createResponse(result);
    
  } catch (error) {
    console.error('Request handler error:', error);
    return createResponse({
      success: false,
      message: 'Server error: ' + error.message,
      error: error.toString()
    });
  }
}

/**
 * Handle user registration
 */
function handleRegistration(data) {
  try {
    console.log('=== REGISTRATION HANDLER ===');
    console.log('Registration data:', data);
    
    // Validate required fields
    const requiredFields = ['name', 'mobile', 'email', 'company', 'purpose', 'password'];
    for (var i = 0; i < requiredFields.length; i++) {
      var field = requiredFields[i];
      if (!data[field] || data[field].toString().trim() === '') {
        return {
          success: false,
          message: 'Missing required field: ' + field
        };
      }
    }
    
    // Open spreadsheet
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    console.log('Opened spreadsheet successfully');
    
    // Check if mobile number already exists
    const existingData = sheet.getDataRange().getValues();
    for (var i = 1; i < existingData.length; i++) {
      if (existingData[i][1] && existingData[i][1].toString() === data.mobile.toString()) {
        return {
          success: false,
          message: 'Mobile number already registered'
        };
      }
    }
    
    // Prepare row data
    const currentDate = new Date().toISOString().split('T')[0];
    const rowData = [
      data.name,           // Column A: Name
      data.mobile,         // Column B: Mobile
      data.email,          // Column C: Email
      data.company,        // Column D: Company
      data.purpose,        // Column E: Purpose
      currentDate,         // Column F: Registration Date
      '',                  // Column G: Last Login (empty initially)
      'Pending',           // Column H: Status (Pending approval)
      data.password        // Column I: Password
    ];
    
    // Add to sheet
    sheet.appendRow(rowData);
    console.log('User registered successfully:', data.name);
    
    return {
      success: true,
      message: 'Registration successful! Please wait for admin approval.',
      user: {
        name: data.name,
        mobile: data.mobile,
        email: data.email,
        status: 'Pending'
      }
    };
    
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'Registration failed: ' + error.message
    };
  }
}

/**
 * Handle user login
 */
function handleLogin(data) {
  try {
    console.log('=== LOGIN HANDLER ===');
    console.log('Login attempt for mobile:', data.mobile);
    
    // Validate required fields
    if (!data.mobile || !data.password) {
      return {
        success: false,
        message: 'Mobile number and password are required'
      };
    }
    
    // Open spreadsheet
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    const allData = sheet.getDataRange().getValues();
    
    // Find user
    for (var i = 1; i < allData.length; i++) {
      const row = allData[i];
      
      if (row[1] && row[1].toString() === data.mobile.toString()) {
        // Check password (Column I)
        if (row[8] && row[8].toString() === data.password.toString()) {
          // Check approval status (Column H)
          const status = row[7] ? row[7].toString() : 'Pending';
          
          if (status === 'Approved') {
            // Update last login (Column G)
            const currentDate = new Date().toISOString().split('T')[0];
            sheet.getRange(i + 1, 7).setValue(currentDate);
            
            console.log('Login successful for:', row[0]);
            return {
              success: true,
              message: 'Login successful',
              status: status,
              name: row[0],
              email: row[2],
              company: row[3],
              mobile: row[1],
              purpose: row[4],
              lastLogin: currentDate,
              user: {
                name: row[0],
                mobile: row[1],
                email: row[2],
                company: row[3],
                purpose: row[4],
                lastLogin: currentDate,
                status: status
              }
            };
          } else {
            return {
              success: false,
              message: 'Account pending approval. Please contact admin.',
              status: status
            };
          }
        } else {
          return {
            success: false,
            message: 'Invalid password'
          };
        }
      }
    }
    
    return {
      success: false,
      message: 'Mobile number not found'
    };
    
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Login failed: ' + error.message
    };
  }
}

/**
 * Create properly formatted response (Compatible version)
 */
function createResponse(data) {
  // Simple response without setHeaders for compatibility
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function to verify deployment
 */
function testDeployment() {
  console.log('Testing deployment...');
  
  // Test registration
  const testUser = {
    action: 'register',
    name: 'Test User',
    mobile: '9999999999',
    email: 'test@example.com',
    company: 'Test Company',
    purpose: 'Testing',
    password: 'test123'
  };
  
  const regResult = handleRegistration(testUser);
  console.log('Registration test result:', regResult);
  
  return {
    deploymentTest: 'success',
    registrationTest: regResult,
    timestamp: new Date().toISOString()
  };
}