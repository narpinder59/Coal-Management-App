# 🔧 REGISTRATION NOT WORKING - QUICK FIX GUIDE

## 🚨 Problem: Registration data not reaching Google Sheet

### 📋 Step-by-Step Troubleshooting

## **STEP 1: Check Your Google Apps Script Deployment**

1. **Go to**: https://script.google.com
2. **Open your Coal Management project**
3. **Check the code** - should be exactly like `google-apps-script-final.js`
4. **Click Deploy → Manage deployments**
5. **Verify settings**:
   - Type: **Web app**
   - Execute as: **Me (your email)**
   - Who has access: **Anyone**

## **STEP 2: Test Your Google Apps Script URL**

1. **Copy your current deployment URL**
2. **Open**: `test-registration.html` (I just created this)
3. **Paste your URL** in the configuration section
4. **Click "Test Connection"**
5. **Should show**: ✅ Connection successful

**Expected Response:**
```json
{
  "success": true,
  "message": "Google Apps Script is working! CORS enabled.",
  "available_actions": ["register", "login"]
}
```

## **STEP 3: Test Registration**

1. **In test-registration.html**
2. **Fill in test data** (or use the defaults)
3. **Click "Test Registration"**
4. **Check response** - should show success
5. **Check your Google Sheet** - should have new row

## **STEP 4: Update login.html URL**

**Find this line** in your `login.html` (around line 578):
```javascript
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/YOUR_URL_HERE/exec';
```

**Update with your correct deployment URL**

## **STEP 5: Common Issues & Solutions**

### ❌ Issue: "Access Denied" or "Forbidden"
**Solution**: 
- Redeploy your Google Apps Script
- Make sure "Who has access" is set to **Anyone**
- Get the new deployment URL

### ❌ Issue: "CORS Error" 
**Solution**: 
- Your Google Apps Script should have CORS headers (it does)
- Try the form submission method in test tool

### ❌ Issue: "Network Error"
**Solution**: 
- Double-check your deployment URL
- Make sure it ends with `/exec`
- Test in incognito mode

### ❌ Issue: "No Response"
**Solution**: 
- Check Google Apps Script logs
- Verify your Google Sheet ID is correct
- Make sure sheet has proper permissions

## **STEP 6: Verify Google Sheet Structure**

Your Google Sheet should have these columns:
- A: Name
- B: Mobile  
- C: Email
- D: Company
- E: Purpose
- F: Registration Date
- G: Last Login
- H: Status
- I: Password

## **STEP 7: Test the Complete Flow**

1. ✅ **Test tool works** → Google Apps Script is fine
2. ✅ **Data appears in sheet** → Registration is working
3. ✅ **Update login.html URL** → Website should work
4. ✅ **Test on your website** → Registration complete

## 🎯 Quick Diagnostic Commands

**Open Browser Console** (F12) and run:

```javascript
// Test your Google Apps Script directly
fetch('YOUR_GOOGLE_APPS_SCRIPT_URL_HERE')
  .then(r => r.text())
  .then(console.log)
  .catch(console.error);
```

## 🆘 If Still Not Working

1. **Check Google Apps Script logs**:
   - Go to script.google.com
   - Open your project
   - Click "Executions" in sidebar
   - Look for errors

2. **Try redeploying**:
   - Click "Deploy" → "New deployment"
   - Get fresh URL
   - Update login.html with new URL

3. **Verify permissions**:
   - Google Sheet must be accessible by your account
   - Google Apps Script must have permission to edit sheets

## 🎉 When It Works

You should see:
- ✅ New rows appearing in your Google Sheet
- ✅ Registration success message on website
- ✅ Users can login after admin approval

## 📞 Contact Points

- **Google Sheet**: https://docs.google.com/spreadsheets/d/1bJJVYDRTLf7SSKcrWp9KQEEr6dhGFfZ4yt6mnoDYEVw/edit
- **Google Apps Script**: https://script.google.com
- **Test Tool**: Open `test-registration.html` in browser

**Most common fix**: Update the Google Apps Script URL in login.html! 🔗