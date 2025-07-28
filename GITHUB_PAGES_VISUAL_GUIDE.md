# 🎯 GitHub Pages Setup - Visual Guide

## Step-by-Step with Screenshots Location Guide

### After you upload your files to GitHub repository:

## 1. **Find the Settings Tab**
```
Your Repository Page Layout:
┌─────────────────────────────────────────────────────────────┐
│  [your-username] / coal-management-app                     │
├─────────────────────────────────────────────────────────────┤
│  📁 Code    📊 Issues    🔧 Pull requests   🔒 Security     │
│  📈 Insights    ⚙️ Settings  ← CLICK HERE                  │
└─────────────────────────────────────────────────────────────┘
```

**Location**: Top of your repository page, in the horizontal menu bar
**Look for**: ⚙️ **Settings** tab (usually the last tab on the right)

---

## 2. **Find Pages in Settings Menu**
After clicking Settings, you'll see a left sidebar menu:

```
Settings Sidebar Menu:
┌─────────────────────────┐
│ General                 │
│ Access                  │
│ Code and automation     │
│ ├── Branches           │
│ ├── Tags               │
│ ├── Actions            │
│ ├── Webhooks           │
│ ├── Environments       │
│ ├── Pages              │ ← CLICK HERE
│ ├── Deployments        │
│ Security                │
│ Integrations            │
│ Archives                │
└─────────────────────────┘
```

**Location**: Left sidebar, under "Code and automation" section
**Look for**: 📄 **Pages** (about halfway down the sidebar)

---

## 3. **GitHub Pages Configuration**
After clicking "Pages", you'll see the Pages settings:

```
GitHub Pages Settings:
┌─────────────────────────────────────────────────────────────┐
│ Pages                                                       │
│                                                             │
│ Source                                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Deploy from a branch           ▼                        │ │ ← CLICK DROPDOWN
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Branch                                                      │
│ ┌─────────────────┐  ┌─────────────────────────────────────┐ │
│ │ main           ▼│  │ / (root)                          ▼│ │ ← SELECT "main"
│ └─────────────────┘  └─────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────┐                                         │
│ │     Save        │                                         │ ← CLICK SAVE
│ └─────────────────┘                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. **Visual Landmarks to Look For**

### On Main Repository Page:
- **URL looks like**: `https://github.com/[username]/coal-management-app`
- **Find**: Horizontal tab menu with "Code", "Issues", "Pull requests", "Settings"
- **Settings**: Usually has a gear ⚙️ icon next to it

### In Settings Page:
- **URL changes to**: `https://github.com/[username]/coal-management-app/settings`
- **Find**: Left sidebar with various options
- **Pages**: Under "Code and automation" section

### After Enabling Pages:
- **Success message**: "Your site is published at https://[username].github.io/coal-management-app/"
- **Green checkmark**: ✅ indicating Pages is active

---

## 🔍 **Can't Find Settings?**

### Common Issues:

1. **Not the Repository Owner?**
   - Only repository owners can access Settings
   - Make sure you're logged into the correct GitHub account

2. **Repository is Private?**
   - GitHub Pages requires a Public repository for free accounts
   - Go to Settings → General → Danger Zone → Change visibility → Public

3. **Wrong Page?**
   - Make sure you're on YOUR repository page
   - URL should show your username: `github.com/[YOUR-USERNAME]/coal-management-app`

---

## 🚨 **Quick Troubleshooting**

### If you don't see Settings tab:
1. **Refresh the page**
2. **Make sure you're logged in**
3. **Check if you're the repository owner**
4. **Try opening in incognito/private mode**

### If you don't see Pages in sidebar:
1. **Scroll down** - it might be below the fold
2. **Make sure repository is Public**
3. **Wait a few minutes** after creating repository

---

## 📱 **Alternative: Direct URL Method**

If you can't find the Pages settings through navigation:

1. **Go directly to**: `https://github.com/[YOUR-USERNAME]/coal-management-app/settings/pages`
2. **Replace** `[YOUR-USERNAME]` with your actual GitHub username
3. **This takes you straight to Pages settings**

---

## ✅ **Success Confirmation**

You'll know it worked when you see:
- Green banner saying "Your site is published at..."
- Your app URL displayed
- Status shows "Active" with a green dot

**Your final app URL will be**:
`https://[YOUR-USERNAME].github.io/coal-management-app/`

**Wait 5-10 minutes** for the site to become available!
