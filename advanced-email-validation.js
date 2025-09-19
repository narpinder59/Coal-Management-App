/**
 * Advanced Email Validation Functions
 * Add these to your login.html for comprehensive email checking
 */

// Check if email domain exists (requires external API)
async function validateEmailDomain(email) {
    try {
        const domain = email.split('@')[1];
        
        // Use a free email validation API (example: Hunter.io, EmailValidator, etc.)
        // Note: Most require API keys for production use
        
        // Simple DNS check approach (limited but works for basic validation)
        const response = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
        const data = await response.json();
        
        return data.Answer && data.Answer.length > 0;
    } catch (error) {
        console.log('Domain validation failed:', error);
        return true; // Allow if validation service fails
    }
}

// Comprehensive email validation function
async function validateEmailAddress(email) {
    console.log('Validating email:', email);
    
    // 1. Format validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) {
        return {
            valid: false,
            message: 'Invalid email format'
        };
    }
    
    // 2. Check for suspicious patterns
    const suspiciousPatterns = [
        /test@test\.com/i,
        /example@example\.com/i,
        /fake@fake\.com/i,
        /temp@temp\.com/i,
        /dummy@dummy\.com/i,
        /nomail@nomail\.com/i,
        /^[0-9]+@/i, // Numbers only in local part
        /\+.*\+/i    // Multiple + signs
    ];
    
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(email));
    if (isSuspicious) {
        return {
            valid: false,
            message: 'Please provide a valid business email address'
        };
    }
    
    // 3. Domain validation
    const domain = email.split('@')[1].toLowerCase();
    
    // Common typos in popular domains
    const domainTypos = {
        'gmai.com': 'gmail.com',
        'gmial.com': 'gmail.com',
        'yahooo.com': 'yahoo.com',
        'outlok.com': 'outlook.com',
        'hotmial.com': 'hotmail.com'
    };
    
    if (domainTypos[domain]) {
        return {
            valid: false,
            message: `Did you mean ${email.replace(domain, domainTypos[domain])}?`,
            suggestion: email.replace(domain, domainTypos[domain])
        };
    }
    
    // 4. Check if domain has MX record (optional - requires API)
    // const domainExists = await validateEmailDomain(email);
    // if (!domainExists) {
    //     return {
    //         valid: false,
    //         message: 'Email domain does not exist'
    //     };
    // }
    
    // 5. Business domain check (optional)
    const commonBusinessDomains = [
        'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
        'company.com', 'organization.org', 'business.in',
        'corp.com', 'enterprise.com'
    ];
    
    return {
        valid: true,
        message: 'Email appears valid',
        isBusinessDomain: !['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'].includes(domain)
    };
}

// Real-time email validation (as user types)
function setupEmailValidation() {
    const emailInput = document.getElementById('registerEmail');
    let validationTimeout;
    
    emailInput.addEventListener('input', function() {
        clearTimeout(validationTimeout);
        
        // Remove any existing validation messages
        const existingMsg = emailInput.parentNode.querySelector('.email-validation-msg');
        if (existingMsg) {
            existingMsg.remove();
        }
        
        // Validate after user stops typing for 500ms
        validationTimeout = setTimeout(async () => {
            const email = emailInput.value.trim();
            if (!email) return;
            
            const validation = await validateEmailAddress(email);
            
            // Create validation message element
            const msgDiv = document.createElement('div');
            msgDiv.className = 'email-validation-msg';
            msgDiv.style.cssText = `
                font-size: 12px;
                margin-top: 5px;
                padding: 5px 8px;
                border-radius: 4px;
            `;
            
            if (validation.valid) {
                msgDiv.style.backgroundColor = '#d4edda';
                msgDiv.style.color = '#155724';
                msgDiv.innerHTML = `✅ ${validation.message}`;
                
                if (!validation.isBusinessDomain) {
                    msgDiv.innerHTML += ' (Personal email)';
                }
            } else {
                msgDiv.style.backgroundColor = '#f8d7da';
                msgDiv.style.color = '#721c24';
                msgDiv.innerHTML = `❌ ${validation.message}`;
                
                if (validation.suggestion) {
                    msgDiv.innerHTML += `<br>Suggestion: <strong>${validation.suggestion}</strong>`;
                }
            }
            
            emailInput.parentNode.appendChild(msgDiv);
        }, 500);
    });
}