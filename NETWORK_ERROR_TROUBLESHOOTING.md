# 🚨 NETWORK ERROR TROUBLESHOOTING GUIDE
## "Network error occurred" during OTP verification

### 📊 **STEP 1: Check Browser Console (CRITICAL)**

1. **Open your GitHub Pages site**
2. **Press F12** to open Developer Tools
3. **Go to Console tab**
4. **Test connection** by running this in console:
   ```javascript
   fetch('https://script.google.com/macros/s/AKfycbwtgVB7koUdakeP0XcCLBahfNlXZsR55RMhxywjw2aexB6GKkTpoLihPQ849LusscH6/exec')
   .then(response => console.log('Status:', response.status, 'OK:', response.ok))
   .catch(error => console.error('Error:', error));
   ```

### 📋 **STEP 2: Verify Google Apps Script Deployment**

#### ✅ **Check Your Apps Script:**
1. **Go to your Google Apps Script project**
2. **Click "Deploy" → "Manage Deployments"**
3. **Verify deployment is ACTIVE**
4. **Check the web app URL matches in login.html**

#### ⚠️ **Common Issues:**
- **Wrong URL**: Deployment URL doesn't match in login.html
- **Not deployed**: Script saved but not deployed as web app
- **Wrong permissions**: "Execute as: Me" and "Who has access: Anyone"

### 🔧 **STEP 3: Test Apps Script Directly**

#### **Method 1: Test in Browser**
1. **Copy your Apps Script URL**
2. **Paste in new browser tab**
3. **Should show**: "Coal Management App Authentication API" page
4. **If error**: Apps Script has issues

#### **Method 2: Test in Apps Script Editor**
1. **Go to Apps Script project**
2. **Run the `testSetup()` function**
3. **Check execution log for errors**

### 📝 **STEP 4: Common Error Solutions**

#### **CORS Error:**
```
Access to fetch at 'script.google.com' blocked by CORS policy
```
**Solution:** Apps Script not deployed correctly. Redeploy as web app.

#### **404 Error:**
```
Failed to load resource: the server responded with a status of 404
```
**Solution:** Wrong URL in login.html. Check deployment URL.

#### **403 Error:**
```
Failed to load resource: the server responded with a status of 403
```
**Solution:** Apps Script permissions issue. Set "Who has access: Anyone"

#### **Sheet Access Error:**
```
Exception: You do not have permission to call SpreadsheetApp.openById
```
**Solution:** Wrong Sheet ID or sheet not accessible.

### 🎯 **STEP 5: Quick Fix Checklist**

#### ✅ **Verify These Settings:**

**In Google Apps Script:**
- [ ] Code from `google-apps-script-fixed.js` is copied
- [ ] SHEET_ID is updated with your actual Sheet ID
- [ ] `testSetup()` function runs without errors
- [ ] Deployed as Web App with "Execute as: Me"
- [ ] "Who has access: Anyone"

**In login.html:**
- [ ] GOOGLE_SHEETS_URL matches your deployment URL
- [ ] URL ends with `/exec`
- [ ] No extra characters or spaces in URL

**In Google Sheets:**
- [ ] Sheet exists and is accessible
- [ ] Headers are in row 1
- [ ] Sample admin user exists

### 🚀 **STEP 6: Test Registration Flow**

1. **Open browser console (F12)**
2. **Go through registration process**
3. **Watch console for detailed error messages**
4. **Check what specific error occurs:**
   - Network timeout
   - CORS error  
   - HTTP status error
   - JSON parsing error

### 📧 **STEP 7: Manual Test**

**Test with curl or Postman:**
```bash
curl -X POST "YOUR_APPS_SCRIPT_URL" \
-H "Content-Type: application/json" \
-d '{
  "action": "register",
  "userData": {
    "name": "Test User",
    "email": "test@example.com", 
    "mobile": "9876543210",
    "password": "test123"
  }
}'
```

### 🎯 **Expected Console Output (Success):**
```
Submitting registration to: https://script.google.com/macros/s/.../exec
User data: {name: "Test User", email: "test@example.com", ...}
Response status: 200
Response ok: true
Response text: {"success":true,"message":"Registration successful..."}
Parsed result: {success: true, message: "Registration successful..."}
```

### 🚨 **Expected Console Output (Error):**
```
Registration API error: TypeError: Failed to fetch
Error details: {message: "Failed to fetch", url: "..."}
```

### 📞 **Need More Help?**

**If still getting network error:**
1. **Copy the exact error from console**
2. **Check Apps Script execution logs**
3. **Verify Sheet ID is correct**
4. **Test Apps Script URL directly in browser**
5. **Try incognito mode to rule out extensions**

**Your registration should work after fixing the deployment! 🎉**