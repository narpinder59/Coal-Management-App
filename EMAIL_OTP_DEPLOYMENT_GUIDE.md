# 📧 EMAIL OTP VERIFICATION SYSTEM - DEPLOYMENT GUIDE

## 🎯 Complete Flow Overview

Your Coal Management App now has a **complete 6-step email OTP verification system**:

1. **User Registration** → Form submission
2. **OTP Generation** → 6-digit code sent to email
3. **Email Verification** → User enters OTP code
4. **Registration Completion** → Data saved to Google Sheet with "Verified" status
5. **Admin Approval** → Administrator approves in Google Sheet
6. **User Login** → Login with mobile number and password

## 🚀 DEPLOYMENT STEPS

### **STEP 1: Update Google Apps Script**

1. **Go to**: https://script.google.com
2. **Open your Coal Management project**
3. **Replace ALL existing code** with the content from `google-apps-script-final.js`
4. **Enable Gmail API**:
   - Click **"Services"** in left sidebar
   - Click **"+ Add a service"**
   - Select **"Gmail API"** 
   - Click **"Add"**
5. **Save the project** (Ctrl+S)

### **STEP 2: Deploy Updated Script**

1. **Click "Deploy" → "New deployment"**
2. **Settings**:
   - Type: **Web app**
   - Execute as: **Me (your email)**
   - Who has access: **Anyone** ⚠️ (CRITICAL!)
3. **Click "Deploy"**
4. **Copy the new web app URL**
5. **Update line 481 in login.html** with your new URL:
   ```javascript
   const GOOGLE_SHEETS_URL = 'YOUR_NEW_URL_HERE';
   ```

### **STEP 3: Test the System**

1. **Open your website** (narpinder59.github.io/Coal-Management-App)
2. **Click "Request Access"**
3. **Fill registration form** with a **real email address**
4. **Click "Submit Registration & Send OTP"**
5. **Check your email** for verification code
6. **Enter OTP** in the verification form
7. **Check Google Sheet** - should show new row with "Verified" status

## 📊 Google Sheet Structure (Updated)

Your Google Sheet now has these columns:
- **A**: Name
- **B**: Mobile Number  
- **C**: Email Address
- **D**: Company
- **E**: Purpose
- **F**: Registration Date
- **G**: Last Login
- **H**: Status (Pending/Approved/Rejected)
- **I**: Password
- **J**: OTP Status (Verified/Not Verified) ⭐ **NEW COLUMN**

## 🔄 Complete User Journey

### **Step 1: User Registration**
```
User fills form → Clicks "Submit Registration & Send OTP"
↓
Backend generates 6-digit OTP → Sends professional email
↓
Shows OTP input form → "Check your email for verification code"
```

### **Step 2: Email Verification**
```
User receives email with OTP → Enters code in form
↓
Backend verifies OTP → Saves to Google Sheet with "Verified" status
↓
Shows success message → "Registration completed! Wait for approval"
```

### **Step 3: Admin Approval**
```
Admin opens Google Sheet → Sees new registration with "Verified" status
↓
Admin changes Status from "Pending" to "Approved"
↓
User can now login
```

### **Step 4: User Login**
```
User enters mobile + password → Backend checks OTP verification
↓
If verified + approved → Login successful → Redirect to dashboard
↓
If not verified → "Email verification pending"
If not approved → "Pending admin approval"
```

## 📧 Email Template Features

Users receive a **professional branded email** with:
- ✅ Coal Management System branding
- ✅ Large, clear 6-digit OTP code
- ✅ 10-minute expiration notice
- ✅ Step-by-step instructions
- ✅ Professional HTML design
- ✅ What happens next explanation

## 🔐 Security Features

### **Email OTP Security:**
- ✅ **6-digit random codes** (100,000 to 999,999)
- ✅ **10-minute expiration** - automatic cleanup
- ✅ **Temporary storage** - deleted after verification
- ✅ **Single-use codes** - cannot be reused
- ✅ **Email validation** - prevents fake emails

### **Registration Security:**
- ✅ **Duplicate mobile check** - prevents multiple accounts
- ✅ **Enhanced email validation** - blocks test/fake emails
- ✅ **Password requirements** - minimum 6 characters
- ✅ **CORS protection** - secure API endpoints

## 🎯 Admin Features

### **In Google Sheet, Admin can see:**
- **Column J**: Whether email is verified or not
- **All registration details** in one row
- **Registration date** and purpose
- **Easy approval process** - just change Status to "Approved"

### **Admin Actions:**
1. **Review registration details**
2. **Verify OTP status** (should be "Verified")
3. **Change Status** from "Pending" to "Approved"
4. **User can immediately login**

## 🧪 Testing Checklist

### ✅ **Test 1: Registration Flow**
- [ ] Fill registration form
- [ ] Receive OTP email within 2 minutes
- [ ] Email has correct branding and format
- [ ] OTP code is 6 digits

### ✅ **Test 2: OTP Verification**
- [ ] Enter correct OTP → Success message
- [ ] Enter wrong OTP → Error message
- [ ] Wait 11 minutes → Expired message
- [ ] Check Google Sheet → New row with "Verified"

### ✅ **Test 3: Admin Approval**
- [ ] Open Google Sheet
- [ ] See new registration with "Verified" status
- [ ] Change Status to "Approved"
- [ ] User can login successfully

### ✅ **Test 4: Login Process**
- [ ] Before approval → "Pending admin approval"
- [ ] After approval → Login successful
- [ ] Wrong password → "Invalid password"
- [ ] Non-existent mobile → "Mobile number not found"

## 🚨 Troubleshooting

### **OTP Email Not Received:**
1. **Check spam/junk folder**
2. **Wait 2-3 minutes** for delivery
3. **Verify Gmail API is enabled** in Google Apps Script
4. **Check Google Apps Script logs** for errors

### **OTP Verification Failed:**
1. **Check code expiration** (10 minutes)
2. **Verify case sensitivity** (numbers only)
3. **Restart registration** if session expired
4. **Check browser console** for errors

### **CORS Errors:**
1. **Ensure deployment access is "Anyone"**
2. **Use correct Apps Script URL**
3. **Test direct URL** in browser first
4. **Clear browser cache**

## 📞 Support Information

- **Google Sheet**: https://docs.google.com/spreadsheets/d/1bJJVYDRTLf7SSKcrWp9KQEEr6dhGFfZ4yt6mnoDYEVw/edit
- **Google Apps Script**: https://script.google.com
- **Website**: https://narpinder59.github.io/Coal-Management-App

## 🎉 Success Indicators

**System is working correctly when:**
- ✅ Users receive OTP emails within 2 minutes
- ✅ OTP verification works smoothly  
- ✅ Google Sheet shows "Verified" status
- ✅ Admin can approve users
- ✅ Approved users can login successfully
- ✅ Email has professional Coal Management branding

Your **complete email OTP verification system** is now ready for deployment! 🚀