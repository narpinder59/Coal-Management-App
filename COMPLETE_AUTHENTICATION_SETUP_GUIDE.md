# Complete Authentication Setup Guide
## Coal Management App - Login System Implementation

### 🚀 Overview
This guide provides step-by-step instructions to set up the complete authentication system for your Coal Management App with:
- Google Sheets backend for user management
- EmailJS for OTP verification (FREE - up to 200 emails/month)
- Admin approval workflow
- Session management
- Secure login protection

---

## 📋 Prerequisites
- Google Account
- EmailJS Account (free)
- GitHub Pages hosting (or any web hosting)
- Basic understanding of Google Sheets

---

## 🗂️ Files Created/Modified

### ✅ NEW FILES CREATED:
1. **`login.html`** - Complete authentication interface
2. **`google-apps-script.js`** - Backend API for Google Apps Script
3. **`COMPLETE_AUTHENTICATION_SETUP_GUIDE.md`** - This setup guide

### ✅ MODIFIED FILES:
1. **`index.html`** - Added authentication protection
2. **`components/navbar.html`** - Added user info display and logout

---

## 🔧 STEP 1: Google Sheets Setup

### 1.1 Create Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it: **"Coal App Users"**
4. Note the **Sheet ID** from URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`

### 1.2 Set Up Headers
In Row 1, add these headers:
```
A1: email
B1: name  
C1: mobile
D1: status
E1: registrationDate
F1: lastLogin
G1: adminNotes
```

### 1.3 Add Sample Admin User
In Row 2, add:
```
A2: admin@coalapp.com
B2: Admin User
C2: 9999999999
D2: approved
E2: 2025-01-30
F2: 2025-01-30
G2: System Administrator
```

---

## 🔧 STEP 2: Google Apps Script Setup

### 2.1 Create Apps Script Project
1. Go to [Google Apps Script](https://script.google.com)
2. Click **"New Project"**
3. Name it: **"Coal App Authentication API"**

### 2.2 Copy Backend Code
1. Delete default code in `Code.gs`
2. Copy ALL content from `google-apps-script.js` file
3. Paste into `Code.gs`

### 2.3 Configure Sheet ID
Replace `YOUR_SHEET_ID_HERE` with your actual Sheet ID:
```javascript
const SHEET_ID = 'your_actual_sheet_id_here';
```

### 2.4 Deploy as Web App
1. Click **"Deploy"** → **"New Deployment"**
2. Choose type: **"Web app"**
3. Description: **"Coal App Authentication API"**
4. Execute as: **"Me"**
5. Who has access: **"Anyone"**
6. Click **"Deploy"**
7. **COPY THE WEB APP URL** - you'll need this!

### 2.5 Authorize Permissions
1. Click **"Authorize access"**
2. Choose your Google account
3. Click **"Advanced"** → **"Go to project (unsafe)"**
4. Click **"Allow"**

---

## 🔧 STEP 3: EmailJS Setup (FREE OTP Service)

### 3.1 Create EmailJS Account
1. Go to [EmailJS](https://www.emailjs.com)
2. Sign up for FREE account
3. Verify your email

### 3.2 Create Email Service
1. Go to **Email Services**
2. Click **"Add New Service"**
3. **IMPORTANT**: Choose **"EmailJS"** (NOT Gmail) to avoid scope issues
4. If you want Gmail integration:
   - Choose **"Gmail"**
   - Click **"Connect Account"**
   - Follow OAuth flow completely
   - Grant ALL requested permissions
   - If you get scope errors, try these alternatives:
     - Use **"EmailJS"** service instead (recommended)
     - Or use **"Outlook"** or **"Yahoo"** services
5. **Note the Service ID**

**🚨 Gmail API Scope Error Fix:**
If you get "412 Gmail_API: Request had insufficient authentication scopes":
- Delete the Gmail service
- Recreate it and ensure you grant ALL permissions during OAuth
- OR switch to EmailJS default service (easier and more reliable)

### 3.3 Create Email Template
1. Go to **Email Templates**
2. Click **"Create New Template"**
3. Set Template Name: **"Coal App OTP"**
4. Template content:
```
Subject: Coal Management App - OTP Verification

Hello {{to_name}},

Your OTP for Coal Management App login is: {{otp_code}}

This OTP is valid for 10 minutes.

Best regards,
Coal Management Team
```
5. **Note the Template ID**

### 3.4 Get Public Key
1. Go to **Account** → **"General"**
2. Copy your **Public Key**

---

## 🔧 STEP 4: Configure Login System

### 4.1 Update login.html
Open `login.html` and update these values around line 400-410:

```javascript
// EmailJS Configuration
emailjs.init('YOUR_PUBLIC_KEY_HERE'); // Replace with your EmailJS public key

// In sendOTP function, update:
const templateParams = {
    to_email: email,
    to_name: name,
    otp_code: otp
};

emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
```

Replace:
- `YOUR_PUBLIC_KEY_HERE` with your EmailJS Public Key
- `YOUR_SERVICE_ID` with your EmailJS Service ID  
- `YOUR_TEMPLATE_ID` with your EmailJS Template ID

### 4.2 Update API URL
In `login.html`, find line with `const API_URL` and replace:
```javascript
const API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
```

---

## 🔧 STEP 5: Test the System

### 5.1 Upload Files
Upload all files to your GitHub Pages or web hosting:
- `index.html` (modified)
- `login.html` (new)
- `components/navbar.html` (modified)
- All other existing files

### 5.2 Test Registration
1. Visit your site URL
2. Should redirect to `login.html`
3. Click **"Create New Account"**
4. Fill registration form
5. Check if OTP email is received
6. Complete registration

### 5.3 Test Admin Approval
1. Go to your Google Sheet
2. Find new user in pending status
3. Change status from `pending` to `approved`
4. User can now login

### 5.4 Test Login
1. Try logging in with approved account
2. Should redirect to main dashboard
3. Check if user info appears in navbar
4. Test logout functionality

---

## 🔒 SECURITY FEATURES

### ✅ Implemented Security:
- **Session Management**: 24-hour auto-logout
- **OTP Verification**: 10-minute expiry
- **Admin Approval**: Manual user approval required
- **Input Validation**: Email, mobile number validation
- **Rate Limiting**: Prevents spam registrations
- **Secure Storage**: Local session storage

### ✅ User Status System:
- **pending**: New registrations (cannot login)
- **approved**: Can login to system
- **suspended**: Temporarily blocked
- **rejected**: Permanently blocked

---

## 🎯 Admin Management

### Managing Users via Google Sheets:
1. **Approve Users**: Change status to `approved`
2. **Suspend Users**: Change status to `suspended`
3. **Add Notes**: Use `adminNotes` column
4. **View Activity**: Check `lastLogin` column
5. **Bulk Actions**: Select multiple rows

### Admin Dashboard Features:
- View all registered users
- Approve/reject pending registrations
- Monitor login activity
- Add admin notes
- Export user data

---

## � QUICK FIX: Gmail API Scope Error

### Problem: "412 Gmail_API: Request had insufficient authentication scopes"

### ⚡ FASTEST SOLUTION:
1. **Go to EmailJS Dashboard**
2. **Email Services** → Delete your Gmail service
3. **Add New Service** → Choose **"EmailJS"** (not Gmail)
4. **Copy the new Service ID**
5. **Update your login.html**:
   ```javascript
   const EMAILJS_SERVICE_ID = 'your_new_emailjs_service_id';
   ```
6. **Test the email template again**

### 🎯 Alternative Solutions:
- **Option 1**: Use EmailJS built-in service (recommended - no OAuth issues)
- **Option 2**: Use Outlook/Yahoo instead of Gmail
- **Option 3**: Re-authenticate Gmail with full permissions

**EmailJS built-in service works perfectly for OTP emails and is more reliable than Gmail integration.**

---

## �🚨 Troubleshooting

### Common Issues:

**1. OTP Not Received / Gmail API Scope Error:**
- **If you get "412 Gmail_API: Request had insufficient authentication scopes":**
  - Go to EmailJS → Email Services
  - Delete your Gmail service
  - Add **"EmailJS"** service instead (built-in, no OAuth needed)
  - Update your Service ID in login.html
  - Test again
- Check EmailJS service status
- Verify template configuration
- Check spam folder
- Ensure correct email format
- Try using EmailJS default service instead of Gmail

**2. Google Sheets Error:**
- Verify Sheet ID is correct
- Check Apps Script permissions
- Ensure web app is deployed
- Test API URL directly

**3. Login Redirect Issues:**
- Clear browser cache
- Check console for errors
- Verify session storage
- Test in incognito mode

**4. Authentication Not Working:**
- Check if files are uploaded correctly
- Verify API URL configuration
- Test with admin account first
- Check network requests in DevTools

---

## 📧 Support

### Free Resources Used:
- **Google Sheets**: Free (up to 5 million cells)
- **Google Apps Script**: Free (6 minutes runtime/execution)
- **EmailJS**: Free (200 emails/month)
- **GitHub Pages**: Free hosting

### Getting Help:
- Check browser console for errors
- Test each component separately
- Use Google Sheets to monitor user data
- EmailJS dashboard shows delivery status

---

## 🎉 Congratulations!

Your Coal Management App now has:
- ✅ Secure login system
- ✅ User registration with OTP
- ✅ Admin approval workflow  
- ✅ Session management
- ✅ Professional UI
- ✅ Mobile responsive design
- ✅ Free hosting and backend

**Next Steps:**
1. Test all functionality thoroughly
2. Add more admin users if needed
3. Customize email templates
4. Monitor user registrations
5. Consider upgrading EmailJS for higher limits

---

## 📞 Contact Information

Need help? Check:
1. Browser developer console for errors
2. Google Apps Script execution logs
3. EmailJS dashboard for email delivery
4. Google Sheets for user data

**Your authentication system is now ready for production! 🚀**