# 🚀 Complete Login & OTP Implementation Guide

## 📋 Overview
This guide will help you implement a complete authentication system with:
- ✅ User Registration with validation
- ✅ Email OTP verification
- ✅ Admin approval workflow
- ✅ Secure login system
- ✅ Session management

---

## 🗂️ Files Created/Modified

### 1. **google-apps-script-auth.js** 
- Complete backend API for Google Sheets
- Handles registration, OTP sending, verification, and login
- Email sending using Gmail API

### 2. **login.html**
- Beautiful responsive login interface
- Registration form with validation
- OTP verification screen
- Success confirmation

### 3. **index.html** (Modified)
- Added authentication check
- Session validation
- User info display
- Logout functionality

---

## 🚀 Step-by-Step Implementation

### **STEP 1: Setup Google Apps Script**

1. **Go to Google Apps Script**:
   ```
   https://script.google.com/
   ```

2. **Create New Project**:
   - Click "New Project"
   - Name it "Coal App Authentication"

3. **Replace Code**:
   - Delete all default code
   - Copy ALL content from `google-apps-script-auth.js`
   - Paste in the Google Apps Script editor

4. **Enable Gmail API**:
   - In Apps Script, click "Services" (+ icon)
   - Add "Gmail API"
   - Click "Add"

5. **Deploy as Web App**:
   - Click "Deploy" → "New Deployment"
   - Type: "Web app"
   - Execute as: "Me (your-email@gmail.com)"
   - Who has access: "Anyone"
   - Click "Deploy"
   - **COPY THE WEB APP URL** (you'll need this!)

6. **Test the Deployment**:
   - Open the Web App URL in browser
   - Should show "✅ Status: Running"

### **STEP 2: Update login.html**

1. **Open login.html**

2. **Update Google Apps Script URL**:
   - Find line with `GOOGLE_APPS_SCRIPT_URL`
   - Replace with your actual Web App URL:
   ```javascript
   const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_ACTUAL_SCRIPT_ID/exec';
   ```

### **STEP 3: Prepare Google Sheet**

1. **Open Your Google Sheet**:
   ```
   https://docs.google.com/spreadsheets/d/1g5MLKqJUzMqFu9sua4AP9SsPK-FAMZ-wvICAPpjLM9s/edit
   ```

2. **Verify Column Headers** (Row 1):
   ```
   A: Name
   B: Mobile
   C: Email
   D: Company
   E: RegistrationDate
   F: LastLogin
   G: Status
   H: Password
   I: OTPStatus
   ```

3. **Set Data Validation for Status Column (G)**:
   - Select column G
   - Data → Data validation
   - Criteria: List of items: `Pending,Approved,Rejected`
   - Click "Done"

4. **Set Data Validation for OTPStatus Column (I)**:
   - Select column I
   - Data → Data validation
   - Criteria: List of items: `Not Verified,Verified`
   - Click "Done"

5. **Hide Password Column (Optional)**:
   - Right-click on column H
   - Select "Hide column"

### **STEP 4: Test the System**

#### **Test 1: Registration Flow**
1. Open `login.html` in browser
2. Click "Create Account"
3. Fill registration form with valid data
4. Click "Register & Verify Email"
5. **Expected Result**: 
   - Should show OTP verification screen
   - Check your email for OTP
   - Check Google Sheet for new row

#### **Test 2: OTP Verification**
1. Get OTP from email
2. Enter 6-digit OTP
3. Click "Verify & Complete Registration"
4. **Expected Result**:
   - Should show success screen
   - Google Sheet should show "Verified" in OTPStatus column

#### **Test 3: Admin Approval**
1. Open Google Sheet
2. Find the test user row
3. Change Status from "Pending" to "Approved"
4. Save the sheet

#### **Test 4: Login**
1. Go back to login screen
2. Enter mobile number and password
3. Click "Login to Dashboard"
4. **Expected Result**:
   - Should redirect to main app (index.html)
   - Should show user's name and company

### **STEP 5: Production Deployment**

1. **Upload Files to Web Server**:
   - `login.html` (entry point)
   - `index.html` (modified with auth)
   - All your existing app files

2. **Set Default Page**:
   - Most users should land on `login.html` first
   - Authenticated users get redirected to `index.html`

---

## 🎯 User Flow Summary

### **New User Registration:**
```
1. User fills registration form
2. System saves to Google Sheet (Status: Pending, OTPStatus: Not Verified)
3. System sends OTP to user's email
4. User enters OTP from email
5. System verifies OTP → Updates OTPStatus to "Verified"
6. Admin manually changes Status to "Approved"
7. User can now login
```

### **Returning User Login:**
```
1. User enters mobile + password
2. System checks: OTPStatus = "Verified" AND Status = "Approved"
3. If valid → Login successful → Redirect to main app
4. Session valid for 8 hours
```

---

## 📊 Google Sheet Structure After Implementation

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| **Name** | **Mobile** | **Email** | **Company** | **RegDate** | **LastLogin** | **Status** | **Password** | **OTPStatus** |
| John Doe | 9876543210 | john@email.com | ABC Corp | 2025-09-24 | 2025-09-24 | Approved | pass123 | Verified |

**Status Values:**
- `Pending` - Waiting for admin approval
- `Approved` - Can login to system
- `Rejected` - Access denied

**OTPStatus Values:**
- `Not Verified` - Email not verified yet
- `Verified` - Email OTP verified

---

## 🔧 Troubleshooting

### **"OTP not sending"**
- Check Gmail API is enabled in Google Apps Script
- Verify email address is valid
- Check spam/junk folder

### **"Registration not saving"**
- Check Google Sheet ID in the script
- Ensure Web App has "Anyone" access
- Verify sheet column headers match exactly

### **"Login fails for approved user"**
- Check both Status = "Approved" AND OTPStatus = "Verified"
- Verify mobile number and password match exactly
- Check for extra spaces in sheet data

### **"CORS errors in console"**
- Normal behavior - system has fallback methods
- Should still work despite console warnings

---

## ✅ Final Checklist

- [ ] Google Apps Script created and deployed
- [ ] Gmail API enabled in Apps Script
- [ ] Web App URL updated in login.html
- [ ] Google Sheet has correct column headers
- [ ] Data validation set for Status and OTPStatus columns
- [ ] Registration test successful
- [ ] OTP email received and verified
- [ ] Admin approval process tested
- [ ] Login test successful
- [ ] Main app shows authenticated user info
- [ ] Session management working

---

## 🎉 Success Criteria

When everything is working correctly:

1. **New users** can register → receive OTP → verify email → wait for approval → login
2. **Admins** can see new registrations in Google Sheet and approve them
3. **Approved users** can login and access the main application
4. **Sessions** are managed properly with automatic logout after 8 hours
5. **Security** is maintained with password protection and email verification

Your Coal Management App now has a complete, professional authentication system! 🚀