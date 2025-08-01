/**
 * Device Detection and Responsive Utilities
 * Handles device-specific optimizations for better UX across different devices
 */

class DeviceManager {
    constructor() {
        this.deviceInfo = this.detectDevice();
        this.init();
    }

    detectDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        const platform = navigator.platform.toLowerCase();
        const vendor = navigator.vendor.toLowerCase();
        
        const info = {
            isMobile: this.isMobile(),
            isTablet: this.isTablet(),
            isDesktop: this.isDesktop(),
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio || 1,
            browser: this.getBrowser(),
            os: this.getOS(),
            device: this.getDeviceType(),
            orientation: this.getOrientation()
        };

        // Specific device detection
        if (userAgent.includes('pixel')) {
            info.isPixel = true;
            info.deviceName = 'Google Pixel';
        } else if (userAgent.includes('oneplus') || userAgent.includes('one plus')) {
            info.isOnePlus = true;
            info.deviceName = 'OnePlus';
        } else if (userAgent.includes('samsung')) {
            info.isSamsung = true;
            info.deviceName = 'Samsung';
        }

        return info;
    }

    isMobile() {
        const userAgent = navigator.userAgent.toLowerCase();
        const mobileKeywords = ['mobile', 'android', 'iphone', 'ipod', 'blackberry', 'windows phone'];
        return mobileKeywords.some(keyword => userAgent.includes(keyword)) || window.innerWidth <= 768;
    }

    isTablet() {
        const userAgent = navigator.userAgent.toLowerCase();
        const tabletKeywords = ['ipad', 'tablet', 'kindle'];
        return tabletKeywords.some(keyword => userAgent.includes(keyword)) || 
               (window.innerWidth > 768 && window.innerWidth <= 1024 && this.isTouchDevice());
    }

    isDesktop() {
        return !this.isMobile() && !this.isTablet();
    }

    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    getBrowser() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('chrome')) return 'chrome';
        if (userAgent.includes('firefox')) return 'firefox';
        if (userAgent.includes('safari')) return 'safari';
        if (userAgent.includes('edge')) return 'edge';
        if (userAgent.includes('opera')) return 'opera';
        return 'unknown';
    }

    getOS() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('android')) return 'android';
        if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';
        if (userAgent.includes('windows')) return 'windows';
        if (userAgent.includes('mac')) return 'macos';
        if (userAgent.includes('linux')) return 'linux';
        return 'unknown';
    }

    getDeviceType() {
        if (this.isMobile()) return 'mobile';
        if (this.isTablet()) return 'tablet';
        return 'desktop';
    }

    getOrientation() {
        return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    }

    init() {
        this.applyDeviceClasses();
        this.setupResponsiveHandlers();
        this.applyDeviceSpecificCSS();
        this.logDeviceInfo();
    }

    applyDeviceClasses() {
        const body = document.body;
        const info = this.deviceInfo;

        // Remove existing device classes
        body.classList.remove('device-mobile', 'device-tablet', 'device-desktop', 
                            'device-pixel', 'device-oneplus', 'device-samsung',
                            'orientation-portrait', 'orientation-landscape');

        // Add device type classes
        body.classList.add(`device-${info.device}`);
        body.classList.add(`orientation-${info.orientation}`);
        body.classList.add(`browser-${info.browser}`);
        body.classList.add(`os-${info.os}`);

        // Add specific device classes
        if (info.isPixel) body.classList.add('device-pixel');
        if (info.isOnePlus) body.classList.add('device-oneplus');
        if (info.isSamsung) body.classList.add('device-samsung');

        // Add screen size classes
        if (info.screenWidth <= 576) body.classList.add('screen-xs');
        else if (info.screenWidth <= 768) body.classList.add('screen-sm');
        else if (info.screenWidth <= 992) body.classList.add('screen-md');
        else if (info.screenWidth <= 1200) body.classList.add('screen-lg');
        else body.classList.add('screen-xl');
    }

    applyDeviceSpecificCSS() {
        const style = document.createElement('style');
        style.id = 'device-specific-css';
        
        let css = `
            /* OnePlus specific fixes */
            .device-oneplus .card {
                margin-bottom: 0.75rem !important;
                padding: 0.75rem !important;
            }
            
            .device-oneplus .container-fluid {
                padding-left: 0.5rem !important;
                padding-right: 0.5rem !important;
            }
            
            .device-oneplus .badge-container {
                flex-wrap: wrap !important;
                gap: 0.25rem !important;
            }
            
            .device-oneplus .badge {
                font-size: 0.7rem !important;
                padding: 0.25rem 0.5rem !important;
            }
            
            /* Pixel specific optimizations */
            .device-pixel .card {
                margin-bottom: 1rem !important;
            }
            
            /* General mobile optimizations */
            .device-mobile .card-body {
                padding: 0.75rem !important;
            }
            
            .device-mobile .row-align {
                flex-direction: column !important;
                align-items: flex-start !important;
            }
            
            .device-mobile .badge-container {
                width: 100% !important;
                justify-content: space-between !important;
            }
            
            /* Landscape mode adjustments */
            .orientation-landscape.device-mobile .card {
                margin-bottom: 0.5rem !important;
            }
            
            /* High DPI screen adjustments */
            @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
                .card {
                    border-width: 0.5px !important;
                }
            }
            
            /* Very small screens (like older OnePlus models) */
            .screen-xs .card {
                margin-bottom: 0.5rem !important;
                font-size: 0.8rem !important;
            }
            
            .screen-xs .badge {
                font-size: 0.65rem !important;
                padding: 0.2rem 0.4rem !important;
            }
        `;

        style.textContent = css;
        document.head.appendChild(style);
    }

    setupResponsiveHandlers() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.deviceInfo = this.detectDevice();
                this.applyDeviceClasses();
                this.handleOrientationChange();
            }, 100);
        });

        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.deviceInfo = this.detectDevice();
                this.applyDeviceClasses();
                this.handleOrientationChange();
            }, 500);
        });
    }

    handleOrientationChange() {
        // Force layout recalculation
        document.body.style.display = 'none';
        document.body.offsetHeight; // Trigger reflow
        document.body.style.display = '';
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('deviceOrientationChanged', {
            detail: this.deviceInfo
        }));
    }

    logDeviceInfo() {
        console.log('Device Detection:', this.deviceInfo);
        console.log(`Running on: ${this.deviceInfo.deviceName || this.deviceInfo.device} - ${this.deviceInfo.os} - ${this.deviceInfo.browser}`);
        console.log(`Screen: ${this.deviceInfo.screenWidth}x${this.deviceInfo.screenHeight} (${this.deviceInfo.orientation})`);
    }

    // Utility methods for other scripts
    static getInstance() {
        if (!window.deviceManager) {
            window.deviceManager = new DeviceManager();
        }
        return window.deviceManager;
    }

    static isMobile() {
        return DeviceManager.getInstance().deviceInfo.isMobile;
    }

    static isTablet() {
        return DeviceManager.getInstance().deviceInfo.isTablet;
    }

    static isDesktop() {
        return DeviceManager.getInstance().deviceInfo.isDesktop;
    }

    static getDeviceInfo() {
        return DeviceManager.getInstance().deviceInfo;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.deviceManager = new DeviceManager();
    });
} else {
    window.deviceManager = new DeviceManager();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeviceManager;
}
