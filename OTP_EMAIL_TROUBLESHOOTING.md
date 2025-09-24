# 🚨 OTP Email Not Received - Troubleshooting Guide

## ❌ Current Issue
Your Google Apps Script is responding but **doesn't have the email OTP functionality** deployed yet.

## 🔍 Diagnosis
- ✅ Google Apps Script URL is accessible
- ❌ Script doesn't have email sending code
- ❌ Gmail API not enabled/configured
- ❌ Wrong script deployed

---

## 🚀 **IMMEDIATE FIX - Follow These Steps**

### **STEP 1: Access Your Google Apps Script**

1. **Go to your Google Apps Script editor**:
   ```
   https://script.google.com/macros/s/AKfycbyN4gRMp2iqsZ-aGRsskNWDagmrVaF1T_GYVbZJSu7Rzulv7VMRb4dnMHxqprLE2h2L/edit
   ```

2. **Check current code**: 
   - If you see basic functions or old code
   - You need to replace it with the email OTP functionality

### **STEP 2: Replace Google Apps Script Code**

1. **Delete ALL existing code** in your Google Apps Script editor

2. **Copy ALL content from**: `google-apps-script-auth.js` 

3. **Paste it** into your Google Apps Script editor

4. **Save the project** (Ctrl+S)

### **STEP 3: Enable Gmail API**

1. **In Google Apps Script editor**:
   - Click on "Services" (+ icon on the left)
   - Find "Gmail API"
   - Click "Add"

2. **If Gmail API is not available**:
   - Click on "Resources" → "Advanced Google Services"
   - Find Gmail API and turn it ON
   - Click "Google Developers Console" link
   - Enable Gmail API there too

### **STEP 4: Re-deploy Web App**

1. **In Google Apps Script**:
   - Click "Deploy" → "Manage Deployments"
   - Click "Edit" (pencil icon) next to your deployment
   - Change version to "New Version"
   - Click "Deploy"

2. **Test the deployment**:
   - Copy the Web App URL
   - Open it in browser
   - Should show: **"✅ Status: Running"** and list available actions

### **STEP 5: Test Email Function**

1. **In Google Apps Script editor**:
   - Click "Run" → Select `testSetup` function
   - Click "Run"
   - **Grant permissions** when asked
   - Check execution log for results

---

## 🔧 **Alternative: Create New Google Apps Script**

If the above doesn't work, create fresh:

### **Option A: New Script**

1. **Go to**: https://script.google.com/

2. **Create New Project**:
   - Click "New Project"
   - Name: "Coal App Auth API"

3. **Add Code**:
   - Delete default code
   - Copy ALL from `google-apps-script-auth.js`
   - Paste and save

4. **Enable Gmail API** (as above)

5. **Deploy as Web App**:
   - Execute as: "Me"
   - Who has access: "Anyone"
   - Click "Deploy"
   - **Copy NEW URL**

6. **Update login.html**:
   - Replace `GOOGLE_APPS_SCRIPT_URL` with new URL

---

## 📧 **Email Sending Troubleshooting**

### **Common Issues:**

1. **Gmail API not enabled**
   - Solution: Follow Step 3 above

2. **Insufficient permissions**
   - Solution: Run `testSetup` function and grant all permissions

3. **Email in Spam/Junk**
   - Solution: Check spam folder
   - Add your script email to contacts

4. **Gmail sending limits**
   - Free Gmail: 100 emails/day
   - Google Workspace: 1500 emails/day

### **Test Email Sending:**

1. **In Google Apps Script editor**:
   ```javascript
   function testEmail() {
     GmailApp.sendEmail(
       'your-email@gmail.com', 
       'Test Email', 
       'This is a test email from Google Apps Script'
     );
     console.log('Test email sent');
   }
   ```

2. **Run this function**:
   - Should receive test email
   - If not, Gmail API issue

---

## 🎯 **Expected Result After Fix**

### **1. Google Apps Script Status Page:**
When you open your script URL, should show:
```
Coal Management App - Authentication API
✅ Status: Running
📊 Sheet ID: 1g5MLKqJUzMqFu9sua4AP9SsPK-FAMZ-wvICAPpjLM9s

Available Actions:
• POST /register - Register new user
• POST /send-otp - Send OTP to email  
• POST /verify-otp - Verify OTP
• POST /login - User login
```

### **2. Registration Flow:**
1. User fills registration form
2. Form submits successfully  
3. OTP screen appears
4. **EMAIL RECEIVED** within 1-2 minutes
5. Email contains 6-digit OTP code

---

## 🚨 **If Still Not Working**

### **Debug Steps:**

1. **Check Google Apps Script Logs**:
   - In Apps Script editor → View → Logs
   - Look for errors during registration/OTP sending

2. **Test Direct API Call**:
   ```javascript
   // In browser console on login.html page:
   fetch('YOUR_SCRIPT_URL', {
     method: 'POST',
     headers: {'Content-Type': 'application/json'},
     body: JSON.stringify({
       action: 'send-otp',
       email: 'test@gmail.com',
       name: 'Test User'
     })
   }).then(r => r.json()).then(console.log);
   ```

3. **Check Email Settings**:
   - Try different email address
   - Check if your Gmail can send emails
   - Verify no email forwarding issues

### **Contact Information:**
If still having issues, provide:
- Google Apps Script execution logs
- Browser console errors
- Email address being used for testing
- Whether test email function works

---

## ✅ **Quick Checklist:**

- [ ] Fixed typo in GOOGLE_APPS_SCRIPT_URL (https not hhttps)
- [ ] Google Apps Script has email OTP code deployed
- [ ] Gmail API is enabled in Apps Script
- [ ] Script permissions granted for email sending
- [ ] Web app re-deployed after code changes
- [ ] Script URL returns status page (not error HTML)
- [ ] Test email function works
- [ ] Registration reaches OTP screen
- [ ] Email received within 2 minutes

**Most likely issue**: Your Google Apps Script doesn't have the email functionality code deployed yet. Follow Step 2 above to fix this!