/**
 * Coal Management App - Google Apps Script Backend
 * With Email OTP Verification System
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
    var requestData = {};
    
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
        available_actions: ['register', 'verify-email', 'complete-registration', 'login']
      });
    }
    
    // Route to appropriate handler
    var result;
    switch (requestData.action) {
      case 'register':
        result = handleRegistration(requestData);
        break;
      case 'verify-email':
        result = verifyEmailOTP(requestData.email, requestData.otp);
        break;
      case 'complete-registration':
        result = completeRegistration(requestData.email);
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
      var jsonpResponse = requestData.callback + '(' + JSON.stringify(result) + ');';
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
 * Generate and send OTP for email verification
 */
function generateAndSendOTP(email, name) {
  try {
    // Generate 6-digit OTP
    var otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP temporarily (using PropertiesService)
    var otpKey = 'otp_' + email.replace(/[^a-zA-Z0-9]/g, '_');
    PropertiesService.getScriptProperties().setProperty(otpKey, otp);
    
    // Set expiration (10 minutes from now)
    var expirationKey = 'exp_' + email.replace(/[^a-zA-Z0-9]/g, '_');
    var expirationTime = new Date().getTime() + (10 * 60 * 1000); // 10 minutes
    PropertiesService.getScriptProperties().setProperty(expirationKey, expirationTime.toString());
    
    // Email subject and body
    var subject = 'Coal Management App - Email Verification Code';
    var htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #2c3e50, #3498db); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🔥 Coal Management System</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Email Verification Required</p>
        </div>
        
        <div style="padding: 30px; background: white; margin: 0;">
          <h2 style="color: #2c3e50; margin-top: 0;">Hello ${name},</h2>
          <p style="color: #555; line-height: 1.6;">Thank you for registering with Coal Management App. Please verify your email address to complete your registration.</p>
          
          <div style="background: #f8f9fa; border: 3px solid #3498db; border-radius: 15px; padding: 25px; text-align: center; margin: 25px 0;">
            <h3 style="color: #2c3e50; margin: 0 0 10px 0;">Your Verification Code:</h3>
            <div style="font-size: 36px; font-weight: bold; color: #3498db; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</div>
            <p style="margin: 15px 0 0 0; color: #7f8c8d; font-size: 14px;">Valid for 10 minutes</p>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;"><strong>⚠️ Important:</strong></p>
            <ul style="margin: 10px 0 0 0; color: #856404;">
              <li>This code will expire in 10 minutes</li>
              <li>Enter this code in the verification form</li>
              <li>Do not share this code with anyone</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #7f8c8d;">Having trouble? Contact our support team</p>
          </div>
        </div>
        
        <div style="background: #ecf0f1; padding: 20px; text-align: center; border-top: 1px solid #bdc3c7;">
          <p style="margin: 0; color: #7f8c8d; font-size: 12px;">
            This is an automated email from Coal Management System.<br>
            Please do not reply to this email.
          </p>
        </div>
      </div>
    `;
    
    // Send email using Gmail API
    GmailApp.sendEmail(email, subject, '', {
      htmlBody: htmlBody,
      name: 'Coal Management System'
    });
    
    console.log('OTP sent to email:', email, 'OTP:', otp); // Remove OTP from logs in production
    return {
      success: true,
      message: 'Verification code sent to your email',
      email: email
    };
    
  } catch (error) {
    console.error('Error sending OTP:', error);
    return {
      success: false,
      message: 'Failed to send verification email: ' + error.message
    };
  }
}

/**
 * Verify OTP entered by user
 */
function verifyEmailOTP(email, userOtp) {
  try {
    console.log('Verifying OTP for email:', email);
    
    var otpKey = 'otp_' + email.replace(/[^a-zA-Z0-9]/g, '_');
    var expirationKey = 'exp_' + email.replace(/[^a-zA-Z0-9]/g, '_');
    
    // Get stored OTP and expiration
    var storedOtp = PropertiesService.getScriptProperties().getProperty(otpKey);
    var expirationTime = PropertiesService.getScriptProperties().getProperty(expirationKey);
    
    console.log('Stored OTP:', storedOtp, 'User OTP:', userOtp);
    
    if (!storedOtp || !expirationTime) {
      return {
        success: false,
        message: 'No verification code found. Please request a new one.'
      };
    }
    
    // Check if expired
    if (new Date().getTime() > parseInt(expirationTime)) {
      // Clean up expired OTP
      PropertiesService.getScriptProperties().deleteProperty(otpKey);
      PropertiesService.getScriptProperties().deleteProperty(expirationKey);
      
      return {
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      };
    }
    
    // Verify OTP
    if (storedOtp === userOtp.toString()) {
      // Clean up used OTP
      PropertiesService.getScriptProperties().deleteProperty(otpKey);
      PropertiesService.getScriptProperties().deleteProperty(expirationKey);
      
      return {
        success: true,
        message: 'Email verified successfully!'
      };
    } else {
      return {
        success: false,
        message: 'Invalid verification code. Please try again.'
      };
    }
    
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return {
      success: false,
      message: 'Verification failed: ' + error.message
    };
  }
}

/**
 * Handle user registration (Step 1: Send OTP)
 */
function handleRegistration(data) {
  try {
    console.log('=== REGISTRATION HANDLER ===');
    console.log('Registration data:', data);
    
    // Validate required fields
    var requiredFields = ['name', 'mobile', 'email', 'company', 'purpose', 'password'];
    for (var i = 0; i < requiredFields.length; i++) {
      var field = requiredFields[i];
      if (!data[field] || data[field].toString().trim() === '') {
        return {
          success: false,
          message: 'Missing required field: ' + field
        };
      }
    }
    
    // Open spreadsheet and check for existing users
    var sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    var existingData = sheet.getDataRange().getValues();
    
    for (var i = 1; i < existingData.length; i++) {
      if (existingData[i][1] && existingData[i][1].toString() === data.mobile.toString()) {
        return {
          success: false,
          message: 'Mobile number already registered'
        };
      }
      if (existingData[i][2] && existingData[i][2].toString().toLowerCase() === data.email.toString().toLowerCase()) {
        return {
          success: false,
          message: 'Email address already registered'
        };
      }
    }
    
    // Store user data temporarily for after verification
    var userDataKey = 'userdata_' + data.email.replace(/[^a-zA-Z0-9]/g, '_');
    PropertiesService.getScriptProperties().setProperty(userDataKey, JSON.stringify(data));
    
    // Send OTP for email verification
    var otpResult = generateAndSendOTP(data.email, data.name);
    
    if (otpResult.success) {
      return {
        success: true,
        message: 'Verification code sent to your email. Please check your inbox.',
        step: 'email-verification',
        email: data.email
      };
    } else {
      return otpResult;
    }
    
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'Registration failed: ' + error.message
    };
  }
}

/**
 * Complete registration after email verification
 */
function completeRegistration(email) {
  try {
    console.log('=== COMPLETING REGISTRATION ===');
    
    // Get stored user data
    var userDataKey = 'userdata_' + email.replace(/[^a-zA-Z0-9]/g, '_');
    var storedDataStr = PropertiesService.getScriptProperties().getProperty(userDataKey);
    
    if (!storedDataStr) {
      return {
        success: false,
        message: 'Registration session expired. Please start over.'
      };
    }
    
    var userData = JSON.parse(storedDataStr);
    
    // Add to Google Sheet
    var sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    var currentDate = new Date().toISOString().split('T')[0];
    var rowData = [
      userData.name,           // Column A: Name
      userData.mobile,         // Column B: Mobile
      userData.email,          // Column C: Email (verified)
      userData.company,        // Column D: Company
      userData.purpose,        // Column E: Purpose
      currentDate,             // Column F: Registration Date
      '',                      // Column G: Last Login
      'Pending',               // Column H: Status
      userData.password        // Column I: Password
    ];
    
    sheet.appendRow(rowData);
    
    // Clean up temporary data
    PropertiesService.getScriptProperties().deleteProperty(userDataKey);
    
    console.log('User registered successfully with verified email:', userData.name);
    
    return {
      success: true,
      message: 'Registration completed successfully! Your account is pending admin approval.',
      user: {
        name: userData.name,
        mobile: userData.mobile,
        email: userData.email,
        status: 'Pending'
      }
    };
    
  } catch (error) {
    console.error('Complete registration error:', error);
    return {
      success: false,
      message: 'Registration completion failed: ' + error.message
    };
  }
}

/**
 * Handle user login (unchanged)
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
    var sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    var allData = sheet.getDataRange().getValues();
    
    console.log('Searching for user with mobile:', data.mobile);
    
    // Find user
    for (var i = 1; i < allData.length; i++) {
      var row = allData[i];
      
      if (row[1] && row[1].toString() === data.mobile.toString()) {
        console.log('Found user:', row[0]);
        
        // Check password (Column I)
        if (row[8] && row[8].toString() === data.password.toString()) {
          // Check approval status (Column H)
          var status = row[7] ? row[7].toString().trim() : 'Pending';
          
          console.log('Password correct. Status check:', status);
          
          if (status === 'Approved') {
            // Update last login (Column G)
            var currentDate = new Date().toISOString().split('T')[0];
            sheet.getRange(i + 1, 7).setValue(currentDate);
            
            console.log('Login successful for:', row[0]);
            return {
              success: true,
              message: 'Login successful',
              status: 'approved',
              name: row[0],
              email: row[2],
              company: row[3],
              mobile: row[1],
              purpose: row[4],
              lastLogin: currentDate
            };
          } else {
            console.log('Status not approved:', status);
            return {
              success: false,
              message: 'Account pending approval. Please contact admin.',
              status: status
            };
          }
        } else {
          console.log('Password mismatch');
          return {
            success: false,
            message: 'Invalid password'
          };
        }
      }
    }
    
    console.log('Mobile number not found');
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
 * Create properly formatted response with basic CORS
 */
function createResponse(data) {
  var output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  
  try {
    output.setHeader('Access-Control-Allow-Origin', '*');
  } catch (e) {
    console.log('setHeader not available, basic response only');
  }
  
  return output;
}

/**
 * Test function to verify deployment
 */
function testDeployment() {
  console.log('Testing deployment...');
  
  return {
    deploymentTest: 'success',
    timestamp: new Date().toISOString(),
    message: 'Deployment test completed'
  };
}