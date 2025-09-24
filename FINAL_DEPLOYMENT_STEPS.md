# 🚀 FINAL DEPLOYMENT STEPS

## Step 1: Update Google Apps Script

1. Go to https://script.google.com/
2. Open your existing project (the one with the web app URL)
3. **Replace the entire Code.gs content** with the updated `google-apps-script-auth.js` file from your workspace
4. **CRITICAL**: Click "Deploy" → "Manage Deployments" → Edit the existing deployment
5. Change "Version" to "New Version" 
6. Add description: "Fixed CORS and dummy OTP issues"
7. Click "Deploy"
8. **IMPORTANT**: Use the SAME web app URL (don't create a new one)

## Step 2: Verify Google Sheet Setup

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1g5MLKqJUzMqFu9sua4AP9SsPK-FAMZ-wvICAPpjLM9s/
2. Make sure the sheet name is exactly **"Users"** (not "Coal App Login")
3. Verify columns: A=Mobile, B=Name, C=Email, D=Password, E=Status, F=OTP, G=RegisteredAt, H=OTPExpiry

## Step 3: Test the Fixed System

### Test Registration:
1. Open your GitHub Pages site
2. Click "Register New User"
3. Fill in form with a REAL email address you can check
4. Submit registration
5. **Check your email** (including spam folder) for OTP
6. **Check Google Sheet** - you should see the user data

### Verify OTP:
1. Enter the REAL OTP from your email (not 123456)
2. Submit verification
3. **Check Google Sheet** - Status should change to "OTP_VERIFIED"

### Test Login:
1. Wait for admin approval (manually change Status to "APPROVED" in sheet)
2. Try logging in with mobile number and password
3. Should redirect to main dashboard

## Step 4: Enable Gmail API (if OTP emails still not working)

1. Go to Google Apps Script project
2. Click "Services" (+ icon)
3. Add "Gmail API" → Save
4. Re-deploy the script

## 🔍 Debugging Tips

- Check browser console (F12) for error messages
- Check Google Apps Script logs: Script Editor → "Executions"
- Check Google Sheet for new data after each registration
- Verify email delivery (check spam folder)

## ✅ Success Indicators

- Registration data appears in Google Sheet immediately
- Real random OTP sent to email (not 123456)  
- OTP verification updates Status in Google Sheet
- Login only works after Status = "APPROVED"

## 🆘 If Still Not Working

1. Check Google Apps Script execution logs for errors
2. Verify the web app is deployed as "Anyone can access"
3. Make sure Gmail API is enabled in the script
4. Check if corporate firewall is blocking requests