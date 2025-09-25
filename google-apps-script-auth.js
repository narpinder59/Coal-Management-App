// Google Apps Script for Coal App Login
// Sheet ID: 1g5MLKqJUzMqFu9sua4AP9SsPK-FAMZ-wvICAPpjLM9s
// Workbook Name: Coal App Login
// Sheet Name: Users

const SHEET_ID = '1g5MLKqJUzMqFu9sua4AP9SsPK-FAMZ-wvICAPpjLM9s';
const SHEET_NAME = 'Users'; // Updated to match your actual sheet name

/**
 * Helper function to get or create the sheet
 */
function getOrCreateSheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      console.log('Sheet not found, checking for alternatives...');
      
      // Try common variations
      const possibleNames = ['Users', 'Sheet1', 'Users', 'Login', 'Data'];
      const allSheets = spreadsheet.getSheets();
      
      for (let possibleName of possibleNames) {
        sheet = spreadsheet.getSheetByName(possibleName);
        if (sheet) {
          console.log('Found sheet with name:', possibleName);
          break;
        }
      }
      
      // If still not found, create new sheet
      if (!sheet) {
        console.log('Creating new sheet:', SHEET_NAME);
        sheet = spreadsheet.insertSheet(SHEET_NAME);
        
        // Add headers
        sheet.getRange(1, 1, 1, 9).setValues([[
          'Name', 'Mobile', 'Email', 'Company', 'RegistrationDate', 
          'LastLogin', 'Status', 'Password', 'OTPStatus'
        ]]);
        
        // Format headers
        sheet.getRange(1, 1, 1, 9).setFontWeight('bold');
        sheet.getRange(1, 1, 1, 9).setBackground('#e8f4f8');
      }
    }
    
    return sheet;
  } catch (error) {
    console.error('Error getting/creating sheet:', error);
    throw error;
  }
}

/**
 * Handle POST requests (Main entry point)
 */
function doPost(e) {
  try {
    // Add CORS headers for web requests
    const response = handleRequest(e);
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Error in doPost:', error);
    return addCorsHeaders(createResponse({success: false, message: 'Server error: ' + error.message}));
  }
}

/**
 * Handle GET requests (for testing and CORS bypass)
 */
function doGet(e) {
  try {
    // Add CORS headers for web requests  
    const response = handleGetRequest(e);
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Error in doGet:', error);
    return addCorsHeaders(createResponse({success: false, message: 'GET error: ' + error.message}));
  }
}

/**
 * Add CORS headers to response
 */
function addCorsHeaders(response) {
  // For JSON responses, we can't add headers directly
  // But we can include CORS info in the response
  return response;
}

/**
 * Handle the actual request processing
 */
function handleRequest(e) {
  if (!e || !e.postData) {
    return createResponse({success: false, message: 'No data received'});
  }
  
  let data;
  
  try {
    // Check if it's form data or JSON data
    const contentType = e.postData.type;
    const contents = e.postData.contents;
    
    console.log('Content Type:', contentType);
    console.log('Raw Contents:', contents);
    
    if (contentType === 'application/x-www-form-urlencoded') {
      // Handle form submission data
      console.log('Parsing form data...');
      data = {};
      const pairs = contents.split('&');
      pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        if (key && value) {
          data[decodeURIComponent(key)] = decodeURIComponent(value);
        }
      });
    } else {
      // Handle JSON data
      console.log('Parsing JSON data...');
      data = JSON.parse(contents);
    }
    
    console.log('Parsed data:', data);
    
  } catch (parseError) {
    console.error('Parse error:', parseError.message);
    return createResponse({
      success: false, 
      message: 'Data parsing error: ' + parseError.message + '. Raw data: ' + e.postData.contents.substring(0, 100)
    });
  }
  
  if (!data.action) {
    return createResponse({success: false, message: 'No action specified in data: ' + JSON.stringify(data)});
  }
  
  console.log('Processing action:', data.action, 'with data:', data);
  
  switch(data.action) {
    case 'register':
      return createResponse(registerUser(data));
    case 'send-otp':
      return createResponse(sendOTP(data));
    case 'verify-otp':
      return createResponse(verifyOTP(data));
    case 'login':
      return createResponse(loginUser(data));
    default:
      return createResponse({success: false, message: 'Invalid action: ' + data.action});
  }
}

/**
 * Handle GET requests
 */
function handleGetRequest(e) {
  // Handle login via GET (CORS bypass)
  if (e.parameter && e.parameter.action === 'login') {
    const result = loginUser({
      mobile: e.parameter.mobile,
      password: e.parameter.password
    });
    
    // Handle JSONP callback
    if (e.parameter.callback) {
      return ContentService
        .createTextOutput(`${e.parameter.callback}(${JSON.stringify(result)})`)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    return createResponse(result);
  }
  
  // API Status page
  const html = `
    <h2>Coal Management App - Authentication API</h2>
    <p>✅ Status: Running</p>
    <p>🕒 Time: ${new Date()}</p>
    <p>📊 Sheet ID: ${SHEET_ID}</p>
    <p>📋 Sheet Name: ${SHEET_NAME}</p>
    <hr>
    <h3>Available Actions:</h3>
    <ul>
      <li>POST /register - Register new user</li>
      <li>POST /send-otp - Send OTP to email</li>
      <li>POST /verify-otp - Verify OTP</li>
      <li>POST /login - User login</li>
      <li>GET /?action=login&mobile=XXX&password=XXX - Login via GET</li>
    </ul>
    <h3>Recent Activity:</h3>
    <p>Last request: ${new Date()}</p>
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
 * Register new user (Step 1)
 */
function registerUser(data) {
  try {
    const sheet = getOrCreateSheet();
    
    // Validate required fields
    if (!data.name || !data.mobile || !data.email || !data.password) {
      return {success: false, message: 'Please fill all required fields'};
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return {success: false, message: 'Please enter a valid email address'};
    }
    
    // Validate mobile number
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(data.mobile)) {
      return {success: false, message: 'Please enter a valid 10-digit mobile number'};
    }
    
    // Check if user already exists
    const existingData = sheet.getDataRange().getValues();
    for (let i = 1; i < existingData.length; i++) {
      if (existingData[i][1] === data.mobile || existingData[i][2] === data.email) {
        return {success: false, message: 'User already exists with this mobile number or email'};
      }
    }
    
    // Add new user to sheet
    const today = new Date().toISOString().split('T')[0];
    
    sheet.appendRow([
      data.name,           // A - Name
      data.mobile,         // B - Mobile
      data.email,          // C - Email
      data.company || '',  // D - Company
      today,               // E - RegistrationDate
      '',                  // F - LastLogin (empty initially)
      'Pending',           // G - Status (Pending until admin approval)
      data.password,       // H - Password
      'Not Verified'       // I - OTPStatus
    ]);
    
    return {
      success: true,
      message: 'Registration successful! Please verify your email with OTP.',
      step: 'otp-verification',
      email: data.email,
      mobile: data.mobile
    };
    
  } catch (error) {
    console.error('Registration error:', error);
    return {success: false, message: 'Registration failed: ' + error.message};
  }
}

/**
 * Send OTP to email (Step 2)
 */
function sendOTP(data) {
  try {
    console.log('🚀 sendOTP called with data:', data);
    
    if (!data.email) {
      console.log('❌ No email provided in data');
      return {success: false, message: 'Email is required'};
    }
    
    console.log('📧 Email found:', data.email);
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔑 Generated OTP:', otp);
    
    // Store OTP temporarily (expires in 10 minutes)
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10);
    
    console.log('💾 Storing OTP in properties...');
    PropertiesService.getScriptProperties().setProperties({
      [`otp_${data.email}`]: otp,
      [`otp_expiry_${data.email}`]: expiry.getTime().toString()
    });
    console.log('✅ OTP stored in properties');
    
    // Send OTP email
    console.log('📤 Calling sendOTPEmail function...');
    const emailSent = sendOTPEmail(data.email, otp, data.name || 'User');
    console.log('📬 Email sending result:', emailSent);
    
    if (emailSent) {
      console.log('✅ OTP email sent successfully');
      return {
        success: true,
        message: 'OTP sent to your email successfully!',
        step: 'verify-otp'
      };
    } else {
      console.log('❌ Failed to send OTP email');
      return {success: false, message: 'Failed to send OTP. Please try again.'};
    }
    
  } catch (error) {
    console.error('❌ Send OTP error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return {success: false, message: 'Failed to send OTP: ' + error.message};
  }
}

/**
 * Verify OTP (Step 3)
 */
function verifyOTP(data) {
  try {
    if (!data.email || !data.otp) {
      return {success: false, message: 'Email and OTP are required'};
    }
    
    // Get stored OTP and expiry
    const properties = PropertiesService.getScriptProperties();
    const storedOTP = properties.getProperty(`otp_${data.email}`);
    const expiryTime = properties.getProperty(`otp_expiry_${data.email}`);
    
    if (!storedOTP || !expiryTime) {
      return {success: false, message: 'OTP not found. Please request a new OTP.'};
    }
    
    // Check if OTP expired
    if (new Date().getTime() > parseInt(expiryTime)) {
      // Clean up expired OTP
      properties.deleteProperty(`otp_${data.email}`);
      properties.deleteProperty(`otp_expiry_${data.email}`);
      return {success: false, message: 'OTP expired. Please request a new OTP.'};
    }
    
    // Verify OTP
    if (data.otp !== storedOTP) {
      return {success: false, message: 'Invalid OTP. Please check and try again.'};
    }
    
    // Update OTP status in sheet
    const sheet = getOrCreateSheet();
    const sheetData = sheet.getDataRange().getValues();
    
    for (let i = 1; i < sheetData.length; i++) {
      if (sheetData[i][2] === data.email) { // Column C - Email
        sheet.getRange(i + 1, 9).setValue('Verified'); // Column I - OTPStatus
        break;
      }
    }
    
    // Clean up used OTP
    properties.deleteProperty(`otp_${data.email}`);
    properties.deleteProperty(`otp_expiry_${data.email}`);
    
    return {
      success: true,
      message: 'Email verified successfully! Please wait for admin approval to login.',
      step: 'registration-complete'
    };
    
  } catch (error) {
    console.error('Verify OTP error:', error);
    return {success: false, message: 'OTP verification failed: ' + error.message};
  }
}

/**
 * User login (Step 4)
 */
function loginUser(data) {
  try {
    console.log('🔐 loginUser called with data:', data);
    
    if (!data.mobile || !data.password) {
      console.log('❌ Missing mobile or password');
      return {success: false, message: 'Mobile number and password are required'};
    }
    
    console.log('📋 Getting sheet data...');
    const sheet = getOrCreateSheet();
    const sheetData = sheet.getDataRange().getValues();
    console.log('📊 Found', sheetData.length - 1, 'users in sheet');
    
    console.log('🔍 Looking for mobile:', data.mobile, 'password:', data.password);
    
    // Find user by mobile number
    for (let i = 1; i < sheetData.length; i++) {
      const row = sheetData[i];
      const mobile = row[1];    // Column B - Mobile
      const password = row[7];  // Column H - Password
      const status = row[6];    // Column G - Status
      const otpStatus = row[8]; // Column I - OTPStatus
      
      console.log(`🔍 Row ${i}: Mobile="${mobile}", Password="${password}", Status="${status}", OTPStatus="${otpStatus}"`);
      
      if (mobile == data.mobile) { // Use == instead of === to handle type differences
        console.log('📱 Mobile number match found!');
        
        if (password == data.password) { // Use == instead of === to handle type differences
          console.log('🔑 Password match found!');
          
          // Check OTP verification
          if (otpStatus !== 'Verified') {
            console.log('❌ OTP not verified:', otpStatus);
            return {
              success: false,
              message: 'Please verify your email first before logging in.'
            };
          }
          
          // Check approval status
          if (status !== 'Approved') {
            console.log('❌ Account not approved:', status);
            let message = 'Your account is pending admin approval.';
            if (status === 'Rejected') {
              message = 'Your account has been rejected. Please contact administrator.';
            }
            return {success: false, message: message};
          }
          
          console.log('✅ Login successful for user:', row[0]);
          
          // Update last login
          const today = new Date().toISOString().split('T')[0];
          sheet.getRange(i + 1, 6).setValue(today); // Column F - LastLogin
          
          return {
            success: true,
            message: 'Login successful!',
            status: 'approved',
            userData: {
              name: row[0],      // Column A - Name
              mobile: row[1],    // Column B - Mobile
              email: row[2],     // Column C - Email
              company: row[3]    // Column D - Company
            }
          };
        } else {
          console.log('❌ Password mismatch. Expected:', password, 'Got:', data.password);
        }
      } else {
        // Only log first few for debugging without spam
        if (i <= 3) {
          console.log('❌ Mobile mismatch. Expected:', mobile, 'Got:', data.mobile);
        }
      }
    }
    
    console.log('❌ No matching user found');
    return {success: false, message: 'Invalid mobile number or password'};
    
  } catch (error) {
    console.error('Login error:', error);
    return {success: false, message: 'Login failed: ' + error.message};
  }
}

/**
 * Send OTP email using Gmail API
 */
function sendOTPEmail(email, otp, name) {
  try {
    console.log('📧 Attempting to send email to:', email);
    console.log('🔑 OTP:', otp);
    console.log('👤 Name:', name);
    
    const subject = 'Coal Management App - Email Verification OTP';
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Coal Management App</h2>
        <h3 style="color: #3498db;">Email Verification</h3>
        
        <p>Dear ${name},</p>
        
        <p>Thank you for registering with Coal Management App. To complete your registration, please use the following One-Time Password (OTP):</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h1 style="color: #2c3e50; letter-spacing: 3px; font-size: 32px; margin: 0;">${otp}</h1>
        </div>
        
        <p><strong>Important:</strong></p>
        <ul>
          <li>This OTP is valid for 10 minutes only</li>
          <li>Do not share this OTP with anyone</li>
          <li>If you didn't request this, please ignore this email</li>
        </ul>
        
        <p>After verifying your email, please wait for admin approval to access the application.</p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #7f8c8d; font-size: 12px;">
          This is an automated email. Please do not reply to this email.<br>
          Coal Management App - Professional Fuel Management System
        </p>
      </div>
    `;
    
    console.log('📤 Sending email via GmailApp...');
    GmailApp.sendEmail(email, subject, '', {htmlBody: htmlBody});
    console.log('✅ Email sent successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Email sending error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    // Try alternative method with MailApp
    try {
      console.log('🔄 Trying MailApp as fallback...');
      MailApp.sendEmail({
        to: email,
        subject: subject,
        htmlBody: htmlBody
      });
      console.log('✅ Email sent via MailApp successfully!');
      return true;
    } catch (mailError) {
      console.error('❌ MailApp also failed:', mailError);
      return false;
    }
  }
}

/**
 * Test function - run this to verify setup
 */
function testSetup() {
  try {
    console.log('🔍 Testing Google Sheet access...');
    
    // First, let's see what sheets are available
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    console.log('✅ Spreadsheet opened successfully');
    console.log('📊 Spreadsheet name:', spreadsheet.getName());
    
    const allSheets = spreadsheet.getSheets();
    console.log('📋 Available sheets:', allSheets.map(s => s.getName()));
    
    // Try to get the specific sheet
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      console.log('❌ Sheet "' + SHEET_NAME + '" not found');
      console.log('🔧 Attempting to create the sheet...');
      
      // Create the sheet if it doesn't exist
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      
      // Add headers
      sheet.getRange(1, 1, 1, 9).setValues([[
        'Name', 'Mobile', 'Email', 'Company', 'RegistrationDate', 
        'LastLogin', 'Status', 'Password', 'OTPStatus'
      ]]);
      
      // Format headers
      sheet.getRange(1, 1, 1, 9).setFontWeight('bold');
      sheet.getRange(1, 1, 1, 9).setBackground('#e8f4f8');
      
      console.log('✅ Sheet created with headers');
    }
    
    console.log('✅ Sheet access successful');
    console.log('Sheet name:', sheet.getName());
    console.log('Total rows:', sheet.getLastRow());
    console.log('Total columns:', sheet.getLastColumn());
    
    // Test data validation
    if (sheet.getLastRow() === 1) {
      console.log('ℹ️ Sheet is empty (only headers)');
    } else {
      console.log('📊 Sample data from row 2:');
      const sampleRow = sheet.getRange(2, 1, 1, 9).getValues()[0];
      console.log('Sample row:', sampleRow);
    }
    
    // Test email sending capability
    console.log('🧪 Testing email capability...');
    try {
      // Test basic email sending (to yourself)
      const testEmail = Session.getActiveUser().getEmail();
      console.log('📧 Your email:', testEmail);
      
      if (testEmail) {
        console.log('✅ Email capability available');
        console.log('📝 You can test email sending by running testEmailSending() function');
      } else {
        console.log('⚠️ Cannot determine your email address');
      }
    } catch (emailError) {
      console.log('❌ Email test error:', emailError.message);
    }
    
    return '✅ Setup test completed successfully - Sheet is ready!';
  } catch (error) {
    console.error('❌ Setup test failed:', error);
    return '❌ Setup test failed: ' + error.message;
  }
}

/**
 * Test email sending function
 */
function testEmailSending() {
  try {
    const testEmail = Session.getActiveUser().getEmail();
    const testOTP = '123456';
    
    console.log('📧 Sending test email to:', testEmail);
    
    const emailSent = sendOTPEmail(testEmail, testOTP, 'Test User');
    
    if (emailSent) {
      console.log('✅ Test email sent successfully!');
      return 'Test email sent to ' + testEmail;
    } else {
      console.log('❌ Failed to send test email');
      return 'Failed to send test email';
    }
  } catch (error) {
    console.error('❌ Email sending test failed:', error);
    return 'Email test failed: ' + error.message;
  }
}

/**
 * Debug function to check sheet data for login issues
 */
function debugUserLogin() {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    
    console.log('=== LOGIN DEBUG - SHEET DATA ===');
    console.log('Total rows:', data.length);
    console.log('Headers:', data[0]);
    
    // Log each user row with detailed info
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      console.log(`User ${i}:`, {
        Name: row[0],
        Mobile: `"${row[1]}" (type: ${typeof row[1]})`, 
        Email: row[2],
        Company: row[3],
        Status: `"${row[6]}" (type: ${typeof row[6]})`,
        Password: `"${row[7]}" (type: ${typeof row[7]})`,
        OTPStatus: `"${row[8]}" (type: ${typeof row[8]})`
      });
    }
    
    return 'Check console logs for detailed user data';
  } catch (error) {
    console.error('Debug error:', error);
    return 'Debug failed: ' + error.message;
  }
}

/**
 * Debug function to check sheet structure
 */
function debugSheetStructure() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    console.log('📊 Spreadsheet ID:', SHEET_ID);
    console.log('📊 Spreadsheet name:', spreadsheet.getName());
    console.log('📊 Spreadsheet URL:', spreadsheet.getUrl());
    
    const allSheets = spreadsheet.getSheets();
    console.log('📋 Total sheets:', allSheets.length);
    
    allSheets.forEach((sheet, index) => {
      console.log(`Sheet ${index + 1}:`);
      console.log('  Name:', sheet.getName());
      console.log('  Rows:', sheet.getLastRow());
      console.log('  Columns:', sheet.getLastColumn());
      
      if (sheet.getLastRow() > 0) {
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        console.log('  Headers:', headers);
      }
    });
    
    return 'Debug completed - check logs';
  } catch (error) {
    console.error('Debug failed:', error);
    return 'Debug failed: ' + error.message;
  }
}