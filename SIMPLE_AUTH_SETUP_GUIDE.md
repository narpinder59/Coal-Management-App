# 🚀 SIMPLE AUTHENTICATION SETUP GUIDE
## Direct Registration & Login with Google Sheets

### 📊 **Your Google Sheet Setup:**
- **Sheet ID:** `1bJJVYDRTLf7SSKcrWp9KQEEr6dhGFfZ4yt6mnoDYEVw`
- **Sheet Name:** `Users`
- **Columns A-H:** Name, Mobile, Email, Company, Purpose, RegistrationDate, LastLogin, Status
- **Column I:** Password (hidden column for login verification)

---

## 🔧 **STEP 1: Update Google Apps Script**

### **1.1 Replace Your Apps Script Code:**
1. **Go to:** [Google Apps Script](https://script.google.com)
2. **Open your project**
3. **Delete ALL existing code**
4. **Copy ALL code from `google-apps-script-simple.js`**
5. **Save the project**

### **1.2 Test the Setup:**
1. **Run the `testSetup()` function** in Apps Script editor
2. **Check execution log** - should show "Setup test completed successfully"

### **1.3 Deploy as Web App:**
1. **Click "Deploy" → "New Deployment"**
2. **Type:** Web app
3. **Description:** Coal App Simple Auth
4. **Execute as:** Me
5. **Who has access:** Anyone
6. **Click "Deploy"**
7. **COPY THE NEW WEB APP URL**

---

## 🔧 **STEP 2: Update login.html**

### **2.1 Update API URL:**
In `login.html`, find line ~533 and replace:
```javascript
const GOOGLE_SHEETS_URL = 'YOUR_NEW_DEPLOYMENT_URL_HERE';
```

### **2.2 Upload to GitHub:**
- Upload updated `login.html` to your GitHub repository
- Test from GitHub Pages URL (not localhost)

---

## 📋 **STEP 3: Test the System**

### **3.1 Test Registration:**
1. **Go to your GitHub Pages URL**
2. **Fill registration form**
3. **Submit - should show success message**
4. **Check Google Sheet** - new user should appear with "Pending" status

### **3.2 Test Admin Approval:**
1. **Open your Google Sheet**
2. **Find the new user row**
3. **Change Status column (H) from "Pending" to "Approved"**

### **3.3 Test Login:**
1. **Go to login form**
2. **Enter mobile number and password**
3. **Should login successfully and redirect to dashboard**

---

## 🎯 **How It Works:**

### **Registration Flow:**
1. **User fills form** → Data sent to Google Apps Script
2. **Apps Script adds row** to Google Sheet with Status = "Pending"
3. **User sees success message** → "Wait for admin approval"

### **Admin Approval Flow:**
1. **Admin opens Google Sheet**
2. **Reviews new registrations** (Status = "Pending")
3. **Changes Status to:**
   - **"Approved"** → User can login
   - **"Rejected"** → User cannot login (rejected message)
   - **"Hold"** → User cannot login (on hold message)

### **Login Flow:**
1. **User enters mobile + password** → Apps Script checks Google Sheet
2. **Finds user by mobile** → Verifies password
3. **Checks Status column:**
   - **"Approved"** → Login successful, updates LastLogin
   - **"Pending"** → "Wait for approval" message
   - **"Rejected"** → "Account rejected" message
   - **"Hold"** → "Account on hold" message

---

## 📊 **Google Sheet Structure:**

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| **Name** | **Mobile** | **Email** | **Company** | **Purpose** | **RegistrationDate** | **LastLogin** | **Status** | **Password** |
| John Doe | 9876543210 | john@example.com | ABC Corp | Testing | 2025-09-19 | 2025-09-19 | Approved | secret123 |

---

## ✅ **Admin Management:**

### **Status Options:**
- **"Approved"** or **"approved"** → User can login
- **"Pending"** → Default status, cannot login
- **"Rejected"** or **"rejected"** → Permanently blocked
- **"Hold"** or **"hold"** → Temporarily blocked

### **Admin Tasks:**
1. **Review new registrations** regularly
2. **Change Status** to approve/reject users
3. **Monitor LastLogin** to see user activity
4. **Add notes** in unused columns if needed

---

## 🚨 **Troubleshooting:**

### **If Registration Fails:**
1. **Check browser console** for error messages
2. **Verify Apps Script URL** is correct in login.html
3. **Test Apps Script URL** directly in browser
4. **Run testSetup()** in Apps Script editor

### **If Login Fails:**
1. **Check user Status** in Google Sheet
2. **Verify mobile number** and password are correct
3. **Ensure Status is "Approved"** (case-sensitive)

### **Common Issues:**
- **Wrong URL** → Update GOOGLE_SHEETS_URL in login.html
- **Case sensitivity** → Status must be exactly "Approved"
- **Sheet access** → Ensure Apps Script can access your sheet

---

## 🎉 **Success Indicators:**

✅ **Registration working:** New users appear in Google Sheet  
✅ **Admin approval working:** Changing status affects login  
✅ **Login working:** Approved users can access dashboard  
✅ **Status tracking:** LastLogin updates on successful login  

**Your simple authentication system is now ready! 🚀**