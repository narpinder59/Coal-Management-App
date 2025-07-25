# Quick Installation Guide

## 🚀 Three Ways to Create Your Android App

### Method 1: PWA (Progressive Web App) - EASIEST & FASTEST
**No installation required! Works immediately!**

1. **Host your website**: Upload all your files to a web server (GitHub Pages, Netlify, etc.)
2. **Access on Android**: Open your website in Chrome on Android
3. **Install**: Tap the menu → "Add to Home Screen" or "Install App"
4. **Done!**: Your app will appear on the home screen like a native app

**Advantages**: 
- ✅ Works offline (cached)
- ✅ No APK needed
- ✅ Auto-updates
- ✅ Installable from browser

---

### Method 2: Apache Cordova - TRADITIONAL APK
**Creates a real APK file**

**Prerequisites**:
1. Install Node.js from [nodejs.org](https://nodejs.org/)
2. Install Android Studio from [developer.android.com](https://developer.android.com/studio)
3. Install Java JDK

**Steps**:
1. Open Command Prompt as Administrator
2. Run the batch file: `build-apk.bat`
3. Wait for the build to complete
4. Your APK will be in: `CoalApp\platforms\android\app\build\outputs\apk\debug\app-debug.apk`

---

### Method 3: Online APK Builders - NO CODING
**Use online services to convert your web app**

**Recommended Services**:
1. **AppsGeyser** (appsgeysers.com) - Free
2. **Appy Pie** (appypie.com) - Free tier available
3. **PhoneGap Build** (build.phonegap.com) - Adobe service

**Steps**:
1. Zip all your files
2. Upload to the service
3. Configure app settings
4. Download generated APK

---

## 📱 Installation on Android Device

### For APK files:
1. Enable "Unknown Sources" in Android Settings → Security
2. Transfer APK to your phone
3. Tap the APK file to install

### For PWA:
1. Open your website in Chrome
2. Look for "Add to Home Screen" notification
3. Or tap Chrome menu → "Add to Home Screen"

---

## 🛠️ Files Created for You

- `APK_CREATION_GUIDE.md` - Detailed guide
- `build-apk.bat` - Automated build script
- `config.xml` - Cordova configuration
- `manifest.json` - PWA configuration
- `sw.js` - Service worker for offline functionality
- `index-mobile.html` - Mobile-optimized version

---

## 🎯 Recommendation

**Start with PWA (Method 1)** - it's the easiest and works great for most cases. Your users can install it directly from their browser without needing an APK file or Google Play Store.

If you need advanced device features later, then consider Cordova (Method 2).
