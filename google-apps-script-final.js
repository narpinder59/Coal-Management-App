/**
 * Coal Management App - Google Apps Script Backend with Email OTP Verification
 * Handles user registration with email OTP verification and authentication
 */

// Configuration
const SHEET_ID = '1bJJVYDRTLf7SSKcrWp9KQEEr6dhGFfZ4yt6mnoDYEVw';
const ALLOWED_ORIGINS = [
  'https://narpinder59.github.io',
  'https://narpinder59.github.io/Coal-Management-App',
  'http://localhost:3000',
  'http://127.0.0.1:5500',
  '*' // Allow all origins for now
];

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
 * Main request handler with comprehensive CORS support
 */
function handleRequest(e) {
  try {
    console.log('=== REQUEST RECEIVED ===');
    console.log('Request type:', e ? 'POST' : 'GET');
    console.log('Request data:', e);
    
    // Set CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
      'Content-Type': 'application/json'
    };
    
    // Handle preflight OPTIONS request
    if (e && e.parameter && e.parameter.method === 'OPTIONS') {
      console.log('Handling OPTIONS preflight request');
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'ok', message: 'CORS preflight handled' }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(corsHeaders);
    }
    
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
        message: 'Google Apps Script is working! Email OTP verification enabled.',
        timestamp: new Date().toISOString(),
        available_actions: ['register', 'verify-email', 'complete-registration', 'login']
      }, corsHeaders);
    }
    
    // Route to appropriate handler
    let result;
    switch (requestData.action) {
      case 'register':
        result = handleRegistration(requestData);
        break;
      case 'verify-email':
        result = handleEmailVerification(requestData);
        break;
      case 'complete-registration':
        result = handleRegistrationCompletion(requestData);
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
      const jsonpResponse = `${requestData.callback}(${JSON.stringify(result)});`;
      return ContentService
        .createTextOutput(jsonpResponse)
        .setMimeType(ContentService.MimeType.JAVASCRIPT)
        .setHeaders({
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/javascript'
        });
    }
    
    return createResponse(result, corsHeaders);
    
  } catch (error) {
    console.error('Request handler error:', error);
    return createResponse({
      success: false,
      message: 'Server error: ' + error.message,
      error: error.toString()
    }, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    });
  }
}

/**
 * Handle user registration - Step 1: Generate and send OTP
 */
function handleRegistration(data) {
  try {
    console.log('=== REGISTRATION HANDLER ===');
    console.log('Registration data:', data);
    
    // Validate required fields
    const requiredFields = ['name', 'mobile', 'email', 'company', 'purpose', 'password'];
    for (const field of requiredFields) {
      if (!data[field] || data[field].toString().trim() === '') {
        return {
          success: false,
          message: `Missing required field: ${field}`
        };
      }
    }
    
    // Check if mobile number already exists
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    const existingData = sheet.getDataRange().getValues();
    for (let i = 1; i < existingData.length; i++) {
      if (existingData[i][1] && existingData[i][1].toString() === data.mobile.toString()) {
        return {
          success: false,
          message: 'Mobile number already registered'
        };
      }
    }
    
    // Generate and send OTP
    const otpResult = generateAndSendOTP(data.email, data.name);
    if (!otpResult.success) {
      return otpResult;
    }
    
    // Store temporary registration data
    const tempData = {
      name: data.name,
      mobile: data.mobile,
      email: data.email,
      company: data.company,
      purpose: data.purpose,
      password: data.password,
      otp: otpResult.otp,
      timestamp: new Date().getTime()
    };
    
    // Store in PropertiesService for 10 minutes
    const properties = PropertiesService.getScriptProperties();
    properties.setProperty('temp_registration_' + data.email, JSON.stringify(tempData));
    
    console.log('OTP sent successfully to:', data.email);
    
    return {
      success: true,
      step: 'email-verification',
      message: 'Verification code sent to your email address',
      email: data.email
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
 * Generate 6-digit OTP and send via Gmail
 */
function generateAndSendOTP(email, name) {
  try {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create HTML email content
    const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .otp-box { background: #f8f9fa; border: 2px dashed #3498db; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #2c3e50; letter-spacing: 5px; margin: 10px 0; }
            .footer { background: #ecf0f1; padding: 20px; text-align: center; color: #7f8c8d; font-size: 14px; }
            .button { display: inline-block; background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔥 Coal Management System</h1>
                <p>Email Verification Required</p>
            </div>
            <div class="content">
                <h2>Hello ${name}!</h2>
                <p>Thank you for registering with our Coal Management System. To complete your registration, please verify your email address using the code below:</p>
                
                <div class="otp-box">
                    <p><strong>Your Verification Code:</strong></p>
                    <div class="otp-code">${otp}</div>
                    <p><small>This code will expire in 10 minutes</small></p>
                </div>
                
                <p><strong>What happens next?</strong></p>
                <ul>
                    <li>Enter this code on the verification page</li>
                    <li>Your registration will be submitted for admin approval</li>
                    <li>You'll receive an email notification once approved</li>
                    <li>After approval, you can login to access all features</li>
                </ul>
                
                <p>If you didn't request this registration, please ignore this email.</p>
                
                <p>Best regards,<br>Coal Management System Team</p>
            </div>
            <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
                <p>Professional Fuel Management & Optimization Platform</p>
            </div>
        </div>
    </body>
    </html>`;
    
    // Send email using Gmail API
    GmailApp.sendEmail(
      email,
      '🔥 Coal Management System - Email Verification Code',
      `Your verification code is: ${otp}\n\nThis code will expire in 10 minutes.`,
      {
        htmlBody: htmlBody,
        name: 'Coal Management System'
      }
    );
    
    console.log('OTP email sent successfully to:', email);
    
    return {
      success: true,
      otp: otp,
      message: 'Verification code sent successfully'
    };
    
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      message: 'Failed to send verification email: ' + error.message
    };
  }
}

/**
 * Handle email OTP verification - Step 2
 */
function handleEmailVerification(data) {
  try {
    console.log('=== EMAIL VERIFICATION HANDLER ===');
    console.log('Verification data:', data);
    
    if (!data.email || !data.otp) {
      return {
        success: false,
        message: 'Email and OTP are required'
      };
    }
    
    // Get stored registration data
    const properties = PropertiesService.getScriptProperties();
    const tempDataStr = properties.getProperty('temp_registration_' + data.email);
    
    if (!tempDataStr) {
      return {
        success: false,
        message: 'Verification session expired. Please restart registration.'
      };
    }
    
    const tempData = JSON.parse(tempDataStr);
    
    // Check if OTP has expired (10 minutes)
    const currentTime = new Date().getTime();
    const otpAge = (currentTime - tempData.timestamp) / (1000 * 60); // in minutes
    
    if (otpAge > 10) {
      // Clean up expired data
      properties.deleteProperty('temp_registration_' + data.email);
      return {
        success: false,
        message: 'Verification code has expired. Please restart registration.'
      };
    }
    
    // Verify OTP
    if (tempData.otp !== data.otp.toString()) {
      return {
        success: false,
        message: 'Invalid verification code. Please try again.'
      };
    }
    
    console.log('OTP verified successfully for:', data.email);
    
    return {
      success: true,
      message: 'Email verified successfully'
    };
    
  } catch (error) {
    console.error('Email verification error:', error);
    return {
      success: false,
      message: 'Verification failed: ' + error.message
    };
  }
}

/**
 * Complete registration after email verification - Step 3
 */
function handleRegistrationCompletion(data) {
  try {
    console.log('=== REGISTRATION COMPLETION HANDLER ===');
    console.log('Completion data:', data);
    
    if (!data.email) {
      return {
        success: false,
        message: 'Email is required'
      };
    }
    
    // Get stored registration data
    const properties = PropertiesService.getScriptProperties();
    const tempDataStr = properties.getProperty('temp_registration_' + data.email);
    
    if (!tempDataStr) {
      return {
        success: false,
        message: 'Registration session expired. Please restart registration.'
      };
    }
    
    const tempData = JSON.parse(tempDataStr);
    
    // Open spreadsheet and add the user
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Prepare row data with OTP verification status
    const rowData = [
      tempData.name,           // Column A: Name
      tempData.mobile,         // Column B: Mobile
      tempData.email,          // Column C: Email
      tempData.company,        // Column D: Company
      tempData.purpose,        // Column E: Purpose
      currentDate,             // Column F: Registration Date
      '',                      // Column G: Last Login (empty initially)
      'Pending',               // Column H: Status (Pending approval)
      tempData.password,       // Column I: Password
      'Verified'               // Column J: OTP Status (Verified)
    ];
    
    // Add to sheet
    sheet.appendRow(rowData);
    
    // Clean up temporary data
    properties.deleteProperty('temp_registration_' + data.email);
    
    console.log('Registration completed successfully for:', tempData.name);
    
    return {
      success: true,
      message: 'Registration completed successfully! Please wait for admin approval.',
      user: {
        name: tempData.name,
        mobile: tempData.mobile,
        email: tempData.email,
        status: 'Pending',
        otpVerified: true
      }
    };
    
  } catch (error) {
    console.error('Registration completion error:', error);
    return {
      success: false,
      message: 'Registration completion failed: ' + error.message
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
    for (let i = 1; i < allData.length; i++) {
      const row = allData[i];
      
      if (row[1] && row[1].toString() === data.mobile.toString()) {
        // Check password (Column I)
        if (row[8] && row[8].toString() === data.password.toString()) {
          // Check OTP verification status (Column J)
          const otpStatus = row[9] ? row[9].toString() : 'Not Verified';
          
          if (otpStatus !== 'Verified') {
            return {
              success: false,
              message: 'Email verification is pending. Please complete email verification first.',
              status: 'email-not-verified'
            };
          }
          
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
              otpVerified: true,
              user: {
                name: row[0],
                mobile: row[1],
                email: row[2],
                company: row[3],
                purpose: row[4],
                lastLogin: currentDate,
                status: status,
                otpVerified: true
              }
            };
          } else {
            return {
              success: false,
              message: 'Account pending admin approval. Please contact administrator.',
              status: status,
              otpVerified: true
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
 * Create properly formatted response with CORS headers
 */
function createResponse(data, headers = {}) {
  const defaultHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Content-Type': 'application/json'
  };
  
  const allHeaders = { ...defaultHeaders, ...headers };
  
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(allHeaders);
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