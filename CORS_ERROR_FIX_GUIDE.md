# 🚨 CORS ERROR FIX - Google Apps Script Deployment Issue

## ❌ **Current Error:**
```
Access to fetch at 'script.google.com' blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present
```

## 🔧 **CRITICAL STEPS TO FIX:**

### **STEP 1: Verify Google Apps Script Deployment (MOST IMPORTANT)**

#### **1.1 Check Your Apps Script Project:**
1. **Go to:** [Google Apps Script](https://script.google.com)
2. **Open your project:** "Coal App Authentication API"
3. **Verify code is updated** with content from `google-apps-script-fixed.js`

#### **1.2 Update Sheet ID (CRITICAL):**
Find line 5 and update with your actual Sheet ID:
```javascript
const SHEET_ID = 'YOUR_ACTUAL_GOOGLE_SHEET_ID_HERE';
```

**How to get Sheet ID:**
- Open your Google Sheet
- Copy ID from URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`

#### **1.3 Deploy as Web App (CRITICAL):**
1. **Click "Deploy" → "New Deployment"**
2. **Type:** Web app
3. **Description:** Coal App Authentication API v2
4. **Execute as:** Me (your-email@gmail.com)
5. **Who has access:** Anyone
6. **Click "Deploy"**
7. **IMPORTANT:** Copy the NEW web app URL

### **STEP 2: Update login.html with NEW URL**

Replace line ~539 in login.html:
```javascript
const GOOGLE_SHEETS_URL = 'YOUR_NEW_WEB_APP_URL_FROM_STEP_1';
```

### **STEP 3: Test Deployment Directly**

#### **Method 1: Test in Browser**
1. **Paste your Apps Script URL in browser**
2. **Should show:** "Coal Management App Authentication API" page
3. **If error 404/403:** Deployment failed

#### **Method 2: Test in Apps Script**
1. **In Apps Script editor, run `testSetup()` function**
2. **Check execution log for errors**
3. **Should show:** "Setup test completed successfully"

---

## 🎯 **QUICK DIAGNOSIS:**

### **Test Your Current URL:**
Open this in browser: `https://script.google.com/macros/s/AKfycbwtgVB7koUdakeP0XcCLBahfNlXZsR55RMhxywjw2aexB6GKkTpoLihPQ849LusscH6/exec`

**Expected:** Shows API status page  
**If 404/403:** URL is wrong or deployment failed

---

## 🚀 **ALTERNATIVE SOLUTIONS:**

### **Option 1: Use GitHub Pages (Recommended)**
- Upload your files to GitHub Pages
- Test from `https://username.github.io/repo-name`
- GitHub Pages doesn't have CORS issues with Google Apps Script

### **Option 2: Simple GET Request Test**
Add this to your login.html for testing:
```javascript
// Test function - add this temporarily
function testGoogleScript() {
    fetch(GOOGLE_SHEETS_URL)
    .then(response => {
        console.log('Test Status:', response.status);
        return response.text();
    })
    .then(text => {
        console.log('Test Response:', text);
        alert('✅ Connection successful!');
    })
    .catch(error => {
        console.error('Test Failed:', error);
        alert('❌ Connection failed: ' + error.message);
    });
}
```

Call `testGoogleScript()` in browser console to test.

---

## 📋 **DEPLOYMENT CHECKLIST:**

### **Google Apps Script:**
- [ ] Code from `google-apps-script-fixed.js` is copied
- [ ] SHEET_ID is updated with actual Sheet ID  
- [ ] Deployed as Web App with "Execute as: Me"
- [ ] "Who has access: Anyone"
- [ ] New deployment created (not existing one updated)

### **Google Sheets:**
- [ ] Sheet exists and is accessible
- [ ] Headers in row 1: email, name, mobile, status, etc.
- [ ] You have edit access to the sheet

### **login.html:**
- [ ] GOOGLE_SHEETS_URL matches deployment URL
- [ ] URL ends with `/exec`
- [ ] No extra spaces or characters

---

## 🆘 **EMERGENCY FIX:**

If still not working, try this minimal test script in Google Apps Script:

```javascript
function doGet(e) {
  return HtmlService.createHtmlOutput('✅ Google Apps Script is working!');
}

function doPost(e) {
  return ContentService
    .createTextOutput('{"success": true, "message": "POST working"}')
    .setMimeType(ContentService.MimeType.JSON);
}
```

Deploy this simple version first to confirm deployment works.

---

## 📞 **Next Steps:**

1. **Check if your current URL works** in browser
2. **Create NEW deployment** with correct settings  
3. **Update login.html** with new URL
4. **Test from GitHub Pages** instead of localhost
5. **Run testSetup()** in Apps Script to verify functionality

**The CORS error means Google Apps Script isn't properly deployed! 🔧**