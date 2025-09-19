/**
 * Enhanced Google Apps Script with Email Verification
 * Add this to your existing google-apps-script-cors-simple.js
 */

/**
 * Generate and send OTP for email verification
 */
function generateAndSendOTP(email, name) {
  try {
    // Generate 6-digit OTP
    var otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP temporarily (you can use PropertiesService for this)
    var otpKey = 'otp_' + email.replace(/[^a-zA-Z0-9]/g, '_');
    PropertiesService.getScriptProperties().setProperty(otpKey, otp);
    
    // Set expiration (5 minutes from now)
    var expirationKey = 'exp_' + email.replace(/[^a-zA-Z0-9]/g, '_');
    var expirationTime = new Date().getTime() + (5 * 60 * 1000); // 5 minutes
    PropertiesService.getScriptProperties().setProperty(expirationKey, expirationTime.toString());
    
    // Email subject and body
    var subject = 'Coal Management App - Email Verification';
    var htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2c3e50, #3498db); color: white; padding: 30px; text-align: center;">
          <h1>🔥 Coal Management System</h1>
          <p>Email Verification Required</p>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2>Hello ${name},</h2>
          <p>Thank you for registering with Coal Management App. Please verify your email address to complete your registration.</p>
          
          <div style="background: white; border: 2px solid #3498db; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
            <h3>Your Verification Code:</h3>
            <div style="font-size: 32px; font-weight: bold; color: #2c3e50; letter-spacing: 5px;">${otp}</div>
          </div>
          
          <p><strong>Important:</strong></p>
          <ul>
            <li>This code will expire in 5 minutes</li>
            <li>Enter this code in the verification form</li>
            <li>Do not share this code with anyone</li>
          </ul>
          
          <p>If you didn't request this verification, please ignore this email.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e1e5e9;">
          <p style="color: #7f8c8d; font-size: 12px;">
            This is an automated email from Coal Management System. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;
    
    // Send email
    GmailApp.sendEmail(email, subject, '', {
      htmlBody: htmlBody,
      name: 'Coal Management System'
    });
    
    console.log('OTP sent to email:', email);
    return {
      success: true,
      message: 'Verification code sent to your email',
      otp: otp // Remove this in production for security
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
    var otpKey = 'otp_' + email.replace(/[^a-zA-Z0-9]/g, '_');
    var expirationKey = 'exp_' + email.replace(/[^a-zA-Z0-9]/g, '_');
    
    // Get stored OTP and expiration
    var storedOtp = PropertiesService.getScriptProperties().getProperty(otpKey);
    var expirationTime = PropertiesService.getScriptProperties().getProperty(expirationKey);
    
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
 * Modified registration handler with email verification
 */
function handleRegistrationWithEmailVerification(data) {
  try {
    console.log('=== REGISTRATION WITH EMAIL VERIFICATION ===');
    
    // If this is OTP verification step
    if (data.action === 'verify-email') {
      return verifyEmailOTP(data.email, data.otp);
    }
    
    // If this is initial registration step
    if (data.action === 'register') {
      // First validate all fields (same as before)
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
      
      // Check if mobile/email already exists
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
      
      // Send OTP for email verification
      var otpResult = generateAndSendOTP(data.email, data.name);
      
      if (otpResult.success) {
        // Store user data temporarily for after verification
        var userDataKey = 'userdata_' + data.email.replace(/[^a-zA-Z0-9]/g, '_');
        PropertiesService.getScriptProperties().setProperty(userDataKey, JSON.stringify(data));
        
        return {
          success: true,
          message: 'Verification code sent to your email. Please check your inbox.',
          step: 'email-verification',
          email: data.email
        };
      } else {
        return otpResult;
      }
    }
    
    // If this is final registration after email verification
    if (data.action === 'complete-registration') {
      // Get stored user data
      var userDataKey = 'userdata_' + data.email.replace(/[^a-zA-Z0-9]/g, '_');
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
        userData.email,          // Column C: Email
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
    }
    
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'Registration failed: ' + error.message
    };
  }
}