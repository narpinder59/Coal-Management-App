# 🚀 QUICK SETUP CHECKLIST
## Coal Management App Authentication System

### ⚡ Essential Configuration Steps

## 📝 STEP 1: Google Sheets Setup
- [ ] Create Google Sheet named "Coal App Users"
- [ ] Add headers: email, name, mobile, status, registrationDate, lastLogin, adminNotes
- [ ] Add admin user: admin@coalapp.com with status "approved"
- [ ] Copy Sheet ID from URL

## 📝 STEP 2: Google Apps Script
- [ ] Create new Apps Script project
- [ ] Copy code from `google-apps-script.js`
- [ ] Update SHEET_ID with your actual Sheet ID
- [ ] Deploy as web app (Execute as: Me, Access: Anyone)
- [ ] Copy the web app URL

## 📝 STEP 3: EmailJS Setup
- [ ] Create free EmailJS account
- [ ] Add Gmail service
- [ ] Create OTP email template
- [ ] Get Service ID, Template ID, and Public Key

## 📝 STEP 4: Update Configuration Files

### 🔧 In `login.html` - Find these lines and update:

**Line 539:** Update EmailJS Public Key
```javascript
const EMAILJS_PUBLIC_KEY = 'YOUR_ACTUAL_EMAILJS_PUBLIC_KEY';
```

**Line 540:** Update EmailJS Service ID
```javascript
const EMAILJS_SERVICE_ID = 'YOUR_ACTUAL_SERVICE_ID';
```

**Line 541:** Update EmailJS Template ID
```javascript
const EMAILJS_TEMPLATE_ID = 'YOUR_ACTUAL_TEMPLATE_ID';
```

**Line 544:** Update Google Apps Script URL
```javascript
const API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
```

## 📝 STEP 5: Test System
- [ ] Upload all files to GitHub Pages
- [ ] Test user registration
- [ ] Check OTP email delivery
- [ ] Approve user in Google Sheets
- [ ] Test login process
- [ ] Verify dashboard access
- [ ] Test logout functionality

## 🎯 Configuration Values Needed:

1. **Google Sheet ID**: `1ABC...xyz` (from Sheets URL)
2. **Apps Script URL**: `https://script.google.com/macros/s/ABC.../exec`
3. **EmailJS Public Key**: `user_ABC123...`
4. **EmailJS Service ID**: `service_ABC123`
5. **EmailJS Template ID**: `template_ABC123`

## ✅ Success Indicators:
- ✅ Visiting main site redirects to login page
- ✅ Registration sends OTP email
- ✅ New users appear in Google Sheets as "pending"
- ✅ Approved users can login successfully
- ✅ Dashboard shows user info in navbar
- ✅ Logout works properly

## 🚨 Common Issues:
- **No OTP received**: Check EmailJS template and service
- **Can't login**: Ensure user status is "approved" in Sheets
- **Page not redirecting**: Clear browser cache
- **API errors**: Verify Apps Script deployment and permissions

## 📞 Need Help?
1. Check browser console (F12) for errors
2. Verify all configuration values are updated
3. Test each step individually
4. Check Google Sheets for user data

**Your authentication system is ready! 🎉**