// Date Format Utility - Forces DD/MM/YYYY format for all date inputs
// This script ensures consistent date display regardless of user's locale settings

class DateFormatter {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupDateInputs());
        } else {
            this.setupDateInputs();
        }
    }

    setupDateInputs() {
        // Find all date inputs and convert them to text inputs with date formatting
        const dateInputs = document.querySelectorAll('input[type="date"]');
        
        dateInputs.forEach(input => {
            this.convertDateInput(input);
        });

        // Set up observer for dynamically added date inputs
        this.observeNewDateInputs();
    }

    convertDateInput(input) {
        // Skip if already converted
        if (input.hasAttribute('data-date-formatted')) {
            return;
        }

        // Create wrapper div
        const wrapper = document.createElement('div');
        wrapper.className = 'date-input-wrapper position-relative';
        wrapper.style.display = 'inline-block';
        wrapper.style.width = input.style.width || 'auto';

        // Create text input for display
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.className = input.className;
        textInput.placeholder = 'DD/MM/YYYY';
        textInput.style.width = '100%';
        textInput.setAttribute('data-date-formatted', 'true');

        // Create hidden date input for actual value storage
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'date';
        hiddenInput.style.display = 'none';
        hiddenInput.id = input.id;
        hiddenInput.name = input.name;

        // Copy attributes
        Array.from(input.attributes).forEach(attr => {
            if (attr.name !== 'type' && attr.name !== 'id' && attr.name !== 'name') {
                textInput.setAttribute(attr.name, attr.value);
            }
        });

        // Set initial value if exists
        if (input.value) {
            const formattedDate = this.formatDateToDisplay(input.value);
            textInput.value = formattedDate;
            hiddenInput.value = input.value;
        }

        // Add calendar icon
        const calendarIcon = document.createElement('i');
        calendarIcon.className = 'bi bi-calendar3';
        calendarIcon.style.position = 'absolute';
        calendarIcon.style.right = '8px';
        calendarIcon.style.top = '50%';
        calendarIcon.style.transform = 'translateY(-50%)';
        calendarIcon.style.pointerEvents = 'none';
        calendarIcon.style.color = '#6c757d';

        // Replace original input
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(textInput);
        wrapper.appendChild(hiddenInput);
        wrapper.appendChild(calendarIcon);
        input.remove();

        // Add event listeners
        this.addEventListeners(textInput, hiddenInput);
    }

    addEventListeners(textInput, hiddenInput) {
        let isUpdating = false;

        // Format input as user types
        textInput.addEventListener('input', (e) => {
            if (isUpdating) return;
            isUpdating = true;

            let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
            let formattedValue = '';

            // Format as DD/MM/YYYY
            if (value.length > 0) {
                if (value.length <= 2) {
                    formattedValue = value;
                } else if (value.length <= 4) {
                    formattedValue = value.substring(0, 2) + '/' + value.substring(2);
                } else {
                    formattedValue = value.substring(0, 2) + '/' + value.substring(2, 4) + '/' + value.substring(4, 8);
                }
            }

            textInput.value = formattedValue;

            // Update hidden input with ISO format
            if (this.isValidDate(formattedValue)) {
                const isoDate = this.convertToISO(formattedValue);
                hiddenInput.value = isoDate;
                
                // Trigger change event on hidden input
                hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
                hiddenInput.value = '';
            }

            isUpdating = false;
        });

        // Handle blur event for validation
        textInput.addEventListener('blur', (e) => {
            const value = e.target.value;
            if (value && !this.isValidDate(value)) {
                textInput.classList.add('is-invalid');
                // Show error message
                this.showError(textInput, 'Please enter a valid date in DD/MM/YYYY format');
            } else {
                textInput.classList.remove('is-invalid');
                this.hideError(textInput);
            }
        });

        // Handle focus event
        textInput.addEventListener('focus', (e) => {
            textInput.classList.remove('is-invalid');
            this.hideError(textInput);
        });
    }

    isValidDate(dateString) {
        const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = dateString.match(regex);
        
        if (!match) return false;

        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);

        // Basic validation
        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;
        if (year < 1900 || year > 2100) return false;

        // Create date object and check if it's valid
        const date = new Date(year, month - 1, day);
        return date.getFullYear() === year && 
               date.getMonth() === month - 1 && 
               date.getDate() === day;
    }

    convertToISO(dateString) {
        const parts = dateString.split('/');
        if (parts.length !== 3) return '';
        
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        
        return `${year}-${month}-${day}`;
    }

    formatDateToDisplay(isoString) {
        if (!isoString) return '';
        
        const parts = isoString.split('-');
        if (parts.length !== 3) return '';
        
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    showError(input, message) {
        // Remove existing error
        this.hideError(input);
        
        const error = document.createElement('div');
        error.className = 'invalid-feedback d-block';
        error.style.fontSize = '0.8rem';
        error.textContent = message;
        error.setAttribute('data-error-for', 'date-input');
        
        input.parentNode.appendChild(error);
    }

    hideError(input) {
        const existingError = input.parentNode.querySelector('[data-error-for="date-input"]');
        if (existingError) {
            existingError.remove();
        }
    }

    observeNewDateInputs() {
        // Watch for dynamically added date inputs
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        // Check if the node itself is a date input
                        if (node.tagName === 'INPUT' && node.type === 'date') {
                            this.convertDateInput(node);
                        }
                        // Check for date inputs within the node
                        const dateInputs = node.querySelectorAll && node.querySelectorAll('input[type="date"]');
                        if (dateInputs) {
                            dateInputs.forEach(input => this.convertDateInput(input));
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Helper method to get value from formatted date input
    static getValue(inputId) {
        const hiddenInput = document.querySelector(`input[type="date"][id="${inputId}"]`);
        return hiddenInput ? hiddenInput.value : '';
    }

    // Helper method to set value for formatted date input  
    static setValue(inputId, isoDate) {
        const hiddenInput = document.querySelector(`input[type="date"][id="${inputId}"]`);
        const textInput = document.querySelector(`input[data-date-formatted="true"][id="${inputId}"]`);
        
        if (hiddenInput && textInput) {
            hiddenInput.value = isoDate;
            textInput.value = new DateFormatter().formatDateToDisplay(isoDate);
        }
    }
}

// Initialize date formatter when script loads
const dateFormatter = new DateFormatter();

// Add CSS for better styling
const style = document.createElement('style');
style.textContent = `
    .date-input-wrapper {
        position: relative;
        display: inline-block;
    }
    
    .date-input-wrapper input[data-date-formatted="true"] {
        padding-right: 30px;
    }
    
    .date-input-wrapper .bi-calendar3 {
        font-size: 0.9rem;
    }
    
    .date-input-wrapper input[data-date-formatted="true"]:focus {
        outline: none;
        border-color: #86b7fe;
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }
    
    .date-input-wrapper input.is-invalid {
        border-color: #dc3545;
    }
    
    .date-input-wrapper input.is-invalid:focus {
        border-color: #dc3545;
        box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
    }
`;
document.head.appendChild(style);

// Export for global use
window.DateFormatter = DateFormatter;
