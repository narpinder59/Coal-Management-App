// Simple Date Format Fix - DD/MM/YYYY Display
// This ensures all date inputs show DD/MM/YYYY format without interfering with navigation

(function() {
    'use strict';
    
    // Configuration
    const DATE_FORMAT_CONFIG = {
        enabled: true,
        format: 'DD/MM/YYYY',
        placeholder: 'DD/MM/YYYY'
    };

    // Only run if enabled
    if (!DATE_FORMAT_CONFIG.enabled) return;

    // Initialize when DOM is ready
    function initDateFormatting() {
        // Process existing date inputs
        processDateInputs();
        
        // Watch for new date inputs (for dynamic content)
        if (window.MutationObserver) {
            const observer = new MutationObserver(function(mutations) {
                let hasNewDateInputs = false;
                
                mutations.forEach(function(mutation) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Element node
                            if (node.tagName === 'INPUT' && node.type === 'date') {
                                hasNewDateInputs = true;
                            } else if (node.querySelectorAll) {
                                const dateInputs = node.querySelectorAll('input[type="date"]');
                                if (dateInputs.length > 0) {
                                    hasNewDateInputs = true;
                                }
                            }
                        }
                    });
                });
                
                // Process new date inputs with a small delay to avoid interference
                if (hasNewDateInputs) {
                    setTimeout(processDateInputs, 100);
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    function processDateInputs() {
        const dateInputs = document.querySelectorAll('input[type="date"]:not([data-date-converted])');
        
        dateInputs.forEach(function(input) {
            convertDateInput(input);
        });
    }

    function convertDateInput(originalInput) {
        // Mark as converted to avoid reprocessing
        originalInput.setAttribute('data-date-converted', 'true');
        
        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'date-wrapper d-inline-block position-relative';
        wrapper.style.width = originalInput.style.width || 'auto';
        
        // Create display input (text)
        const displayInput = document.createElement('input');
        displayInput.type = 'text';
        displayInput.className = originalInput.className;
        displayInput.placeholder = DATE_FORMAT_CONFIG.placeholder;
        displayInput.style.paddingRight = '30px';
        displayInput.setAttribute('data-date-display', 'true');
        
        // Copy important attributes
        const attributesToCopy = ['id', 'name', 'required', 'disabled', 'readonly'];
        attributesToCopy.forEach(function(attr) {
            if (originalInput.hasAttribute(attr)) {
                displayInput.setAttribute(attr, originalInput.getAttribute(attr));
            }
        });
        
        // Hide original input but keep it for value storage
        originalInput.type = 'hidden';
        originalInput.style.display = 'none';
        
        // Add calendar icon
        const icon = document.createElement('i');
        icon.className = 'bi bi-calendar3';
        icon.style.cssText = 'position: absolute; right: 8px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #6c757d;';
        
        // Set initial value if exists
        if (originalInput.value) {
            displayInput.value = formatDateForDisplay(originalInput.value);
        }
        
        // Insert wrapper
        originalInput.parentNode.insertBefore(wrapper, originalInput);
        wrapper.appendChild(displayInput);
        wrapper.appendChild(originalInput);
        wrapper.appendChild(icon);
        
        // Add event handlers
        addEventHandlers(displayInput, originalInput);
    }

    function addEventHandlers(displayInput, hiddenInput) {
        // Format input as user types
        displayInput.addEventListener('input', function(e) {
            const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
            let formatted = '';
            
            if (value.length > 0) {
                if (value.length <= 2) {
                    formatted = value;
                } else if (value.length <= 4) {
                    formatted = value.substring(0, 2) + '/' + value.substring(2);
                } else {
                    formatted = value.substring(0, 2) + '/' + value.substring(2, 4) + '/' + value.substring(4, 8);
                }
            }
            
            displayInput.value = formatted;
            
            // Update hidden input if valid date
            if (isValidDate(formatted)) {
                hiddenInput.value = convertToISO(formatted);
                // Trigger change event for existing code
                const event = new Event('change', { bubbles: true });
                hiddenInput.dispatchEvent(event);
            } else {
                hiddenInput.value = '';
            }
        });
        
        // Validation on blur
        displayInput.addEventListener('blur', function() {
            const value = displayInput.value;
            if (value && !isValidDate(value)) {
                displayInput.style.borderColor = '#dc3545';
            } else {
                displayInput.style.borderColor = '';
            }
        });
        
        // Clear validation on focus
        displayInput.addEventListener('focus', function() {
            displayInput.style.borderColor = '';
        });
    }

    function isValidDate(dateString) {
        const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = dateString.match(regex);
        
        if (!match) return false;
        
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);
        
        if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) {
            return false;
        }
        
        const date = new Date(year, month - 1, day);
        return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    }

    function convertToISO(dateString) {
        const parts = dateString.split('/');
        return parts[2] + '-' + parts[1].padStart(2, '0') + '-' + parts[0].padStart(2, '0');
    }

    function formatDateForDisplay(isoString) {
        if (!isoString) return '';
        const parts = isoString.split('-');
        if (parts.length !== 3) return '';
        return parts[2] + '/' + parts[1] + '/' + parts[0];
    }

    // Add CSS
    const style = document.createElement('style');
    style.textContent = `
        .date-wrapper input[data-date-display="true"]:focus {
            outline: none;
            border-color: #86b7fe;
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }
    `;
    document.head.appendChild(style);

    // Initialize based on document state
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDateFormatting);
    } else {
        // DOM already loaded, initialize immediately
        setTimeout(initDateFormatting, 50);
    }

    // Expose utility functions for manual use if needed
    window.DateFormatUtils = {
        processDateInputs: processDateInputs,
        formatDateForDisplay: formatDateForDisplay,
        convertToISO: convertToISO,
        isValidDate: isValidDate
    };

})();
