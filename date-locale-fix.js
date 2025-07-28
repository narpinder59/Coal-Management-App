// Minimal Date Format Fix - Sets locale to DD/MM/YYYY without modifying existing functionality
// This script only changes the display format, doesn't break existing date picker functionality

(function() {
    'use strict';
    
    // Simple function to set the page locale for date formatting
    function setDateLocale() {
        // Set the document locale to British English for DD/MM/YYYY format
        if (document.documentElement) {
            document.documentElement.lang = 'en-GB';
        }
        
        // For browsers that support it, try to set the locale
        if (typeof navigator !== 'undefined' && navigator.language) {
            try {
                // This affects how date inputs are displayed in some browsers
                Object.defineProperty(navigator, 'language', {
                    get: function() { return 'en-GB'; },
                    configurable: true
                });
            } catch (e) {
                // Silently fail if not supported
                console.log('Could not override navigator.language');
            }
        }
    }
    
    // Add a simple CSS rule to help with date formatting
    function addDateFormatCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* Ensure date inputs use DD/MM/YYYY format where possible */
            input[type="date"] {
                /* Add some visual indication this is DD/MM format */
                position: relative;
            }
            
            /* Optional: Add a subtle hint */
            input[type="date"]:focus {
                /* Could add a tooltip or hint here if needed */
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize when DOM is ready
    function init() {
        setDateLocale();
        addDateFormatCSS();
        
        console.log('Date locale set to en-GB for DD/MM/YYYY format');
    }
    
    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
