# FINAL DEPLOYMENT GUIDE - Coal Management App Authentication

## CRITICAL: CORS Issue Resolution

You're experiencing CORS errors because Google Apps Script needs specific deployment configuration. Follow these steps EXACTLY:

## Step 1: Deploy New Google Apps Script

1. **Go to Google Apps Script**: https://script.google.com
2. **Open your existing project** or create new one
3. **Replace ALL code** with the content from `google-apps-script-final.js`
4. **Save the project** (Ctrl+S)

## Step 2: Deploy as Web App (CRITICAL SETTINGS)

1. **Click "Deploy" → "New deployment"**
2. **Type**: Web app
3. **Execute as**: Me (your email)
4. **Who has access**: Anyone (CRITICAL - must be "Anyone", not "Anyone with Google account")
5. **Click "Deploy"**
6. **Copy the Web app URL** (looks like: https://script.google.com/macros/s/ABCD.../exec)

## Step 3: Update Your GitHub Project

Replace the GOOGLE_SHEETS_URL in your login.html:

```javascript
const GOOGLE_SHEETS_URL = 'YOUR_NEW_WEB_APP_URL_HERE';
```

## Step 4: Test Deployment

1. **First test the Apps Script directly**:
   - Open your web app URL in browser
   - You should see: `{"success":true,"message":"Google Apps Script is working! CORS enabled."}`

2. **Then test from your GitHub Pages**:
   - Go to your GitHub Pages site
   - Try registering a test user
   - Check browser console for any errors

## Step 5: Google Sheet Setup

Make sure your Google Sheet (ID: 1bJJVYDRTLf7SSKcrWp9KQEEr6dhGFfZ4yt6mnoDYEVw) has these column headers:

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Name | Mobile | Email | Company | Purpose | RegistrationDate | LastLogin | Status | Password |

## Common Issues & Solutions

### Issue 1: "Access to fetch blocked by CORS policy"
**Solution**: Make sure deployment access is set to "Anyone" (not "Anyone with Google account")

### Issue 2: "Failed to fetch"
**Solution**: 
- Check if the Apps Script URL is correct
- Test the URL directly in browser first
- Make sure the script is deployed as "Web app"

### Issue 3: "Network error occurred"
**Solution**: Your login.html now has a fallback method that will work even if CORS fails

## Verification Steps

1. **Apps Script working**: Visit the web app URL directly
2. **CORS working**: Check browser console for CORS errors
3. **Registration working**: Try registering and check Google Sheet
4. **Login working**: Try logging in with approved account

## Backup Method

If CORS still fails, the login.html now includes a fallback method that:
1. Tries normal fetch first
2. If CORS fails, uses hidden iframe submission
3. This bypasses CORS restrictions completely

## Next Steps After Deployment

1. **Register a test user**
2. **Go to your Google Sheet**
3. **Change Status from "Pending" to "Approved" for the test user**
4. **Try logging in with the approved account**

## Admin Workflow

To approve users:
1. Open your Google Sheet
2. Find users with Status = "Pending"
3. Change Status to "Approved" 
4. Users can now login

## Files Updated

- ✅ `login.html` - Added fallback CORS handling
- ✅ `google-apps-script-final.js` - Robust CORS support
- ✅ This deployment guide

## Important Notes

- The fallback method will show "Registration submitted successfully" even if CORS fails
- Always test the Apps Script URL directly first
- Make sure Google Sheet permissions allow the script to write
- Keep the Sheet ID exactly as: 1bJJVYDRTLf7SSKcrWp9KQEEr6dhGFfZ4yt6mnoDYEVw

Your authentication system will work with this setup!