# 🚨 IMMEDIATE FIX - Registration & OTP Issues

## ✅ **Current Configuration Confirmed:**
- **Google Sheet ID**: 1g5MLKqJUzMqFu9sua4AP9SsPK-FAMZ-wvICAPpjLM9s
- **Workbook Name**: Coal App Login  
- **Sheet Name**: Users
- **Web App URL**: https://script.google.com/macros/s/AKfycbyN4gRMp2iqsZ-aGRsskNWDagmrVaF1T_GYVbZJSu7Rzulv7VMRb4dnMHxqprLE2h2L/exec

## 🔧 **FIXES APPLIED:**

### 1. **Google Apps Script Updated**
- ✅ Fixed sheet name from "Coal App Login" to "Users"  
- ✅ Enhanced error handling and logging
- ✅ Better sheet detection and creation

### 2. **HTML Registration Enhanced**
- ✅ Improved CORS fallback handling
- ✅ Better error messages and debugging
- ✅ Enhanced form submission fallback
- ✅ Automatic retry mechanisms

### 3. **Registration Flow Fixed**
- ✅ Better separation of registration and OTP steps
- ✅ Enhanced fallback methods for CORS issues
- ✅ Improved error handling and user feedback

---

## 🚀 **IMMEDIATE ACTION REQUIRED:**

### **STEP 1: Update Your Google Apps Script**

1. **Go to your Google Apps Script editor**:
   ```
   https://script.google.com/macros/s/AKfycbyN4gRMp2iqsZ-aGRsskNWDagmrVaF1T_GYVbZJSu7Rzulv7VMRb4dnMHxqprLE2h2L/edit
   ```

2. **Replace ALL code** with the updated `google-apps-script-auth.js`
   - The key fix: Sheet name is now "Users" (not "Coal App Login")
   - Enhanced error handling and logging

3. **Save** the project (Ctrl+S)

4. **Re-deploy Web App**:
   - Deploy → Manage Deployments → Edit → New Version → Deploy

### **STEP 2: Test the Fixed System**

1. **Test Google Apps Script directly**:
   - In Apps Script editor, run `testSetup` function
   - Should show: "✅ Sheet access successful" 
   - Should find your "Users" sheet

2. **Test Registration Flow**:
   - Open `login.html` in browser
   - Try registration with valid details
   - Check browser console (F12) for detailed logs
   - Should proceed to OTP screen even with CORS errors

3. **Check Google Sheet**:
   - New registration should appear as new row in "Users" sheet
   - Status should be "Pending", OTPStatus should be "Not Verified"

---

## 🎯 **Expected Results After Fix:**

### **Registration Process:**
```
1. User fills form → ✅ Form validates
2. Call registration API → ❌ CORS error (expected)
3. Use form fallback → ✅ Data saved to Google Sheet  
4. Call send-otp API → ❌ CORS error (expected)
5. Use form fallback → ✅ OTP sent to email
6. Show OTP screen → ✅ User can enter OTP
```

### **Google Sheet Updates:**
```
After Registration: New row added with Status="Pending", OTPStatus="Not Verified"
After OTP Verify: OTPStatus changed to "Verified"
After Admin Approval: Status changed to "Approved"
```

---

## 🔍 **Debugging Steps:**

### **If Registration Still Fails:**

1. **Check Console Logs**:
   - Open browser console (F12)
   - Look for: "📝 Starting registration process..."
   - Check what response is received

2. **Verify Google Apps Script**:
   - Run `testSetup` in Apps Script editor
   - Should confirm "Users" sheet is accessible
   - Run `debugSheetStructure` to see all sheets

3. **Check Google Sheet Directly**:
   - Open: https://docs.google.com/spreadsheets/d/1g5MLKqJUzMqFu9sua4AP9SsPK-FAMZ-wvICAPpjLM9s/edit
   - Confirm "Users" sheet exists with proper headers

### **If OTP Still Not Received:**

1. **Check Gmail API**:
   - In Google Apps Script: Services → Gmail API (should be added)
   - Run `testEmailSending` function in Apps Script

2. **Check Email Settings**:
   - Look in spam/junk folder
   - Try different email address
   - Verify your Google account can send emails

3. **Test Direct Email**:
   - In Apps Script editor, run:
   ```javascript
   function quickEmailTest() {
     GmailApp.sendEmail('your-email@gmail.com', 'Test', 'This is a test email');
   }
   ```

---

## ⚡ **Quick Test Commands:**

### **In Browser Console (on login.html page):**
```javascript
// Test registration API directly
callAPI('register', {
  name: 'Test User',
  mobile: '9876543210', 
  email: 'test@gmail.com',
  company: 'Test Co',
  password: 'test123'
}).then(console.log);

// Test OTP sending
callAPI('send-otp', {
  email: 'test@gmail.com',
  name: 'Test User'
}).then(console.log);
```

### **In Google Apps Script Editor:**
```javascript
// Test sheet access
testSetup()

// Test email capability  
testEmailSending()

// Debug sheet structure
debugSheetStructure()
```

---

## ✅ **Success Indicators:**

After implementing these fixes, you should see:

1. **Registration**: Form submits → OTP screen appears → Check spam folder for OTP email
2. **Google Sheet**: New row appears with your registration data
3. **Console**: Detailed logs showing fallback methods working
4. **OTP**: Email received (check spam) → OTP verification works
5. **Admin Flow**: Change Status to "Approved" → User can login

The CORS errors in console are **EXPECTED** - the fallback methods handle them automatically.

**Try the registration again after updating your Google Apps Script code!** 🚀