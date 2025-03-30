/**
 * Utility Functions
 * General-purpose helper functions used throughout the application
 */

// Format currency based on selected currency
function formatCurrency(amount, currencyCode) {
    // If no currency specified, get from UI
    if (!currencyCode) {
        currencyCode = document.getElementById('currency').value;
    }
    
    // Get converted amount based on exchange rates
    const convertedAmount = Math.round(amount / exchangeRates[currencyCode]);
    
    switch(currencyCode) {
        case 'INR':
            return `₹${convertedAmount.toLocaleString()}`;
        case 'USD':
            return `$${convertedAmount.toLocaleString()}`;
        case 'CAD':
            return `C$${convertedAmount.toLocaleString()}`;
        default:
            return `₹${amount.toLocaleString()}`;
    }
}

// Calculate take-home amount in INR
function calculateTakeHome(amount, currency) {
    if (currency === 'INR') {
        return amount;
    } else {
        return Math.round(amount * exchangeRates[currency]);
    }
}

// Format date in a user-friendly way
function formatDate(date) {
    if (!date) date = new Date();
    
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleDateString('en-US', options);
}

// Generate a unique ID for quotes, clients, etc.
function generateUniqueId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Show a modal dialog
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

// Hide a modal dialog
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Display a notification/toast message
function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
        
        // Add styles if not already defined in CSS
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 10px 20px;
                border-radius: 4px;
                color: white;
                font-weight: bold;
                z-index: 1000;
                transform: translateY(100px);
                transition: transform 0.3s ease-out;
            }
            .notification.show {
                transform: translateY(0);
            }
            .notification.info { background-color: #3498db; }
            .notification.success { background-color: #27ae60; }
            .notification.error { background-color: #e74c3c; }
            .notification.warning { background-color: #f39c12; }
        `;
        document.head.appendChild(style);
    }
    
    // Set message and type
    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    // Show the notification
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Debounce function to limit how often a function is called
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Validate email format
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

// Get current date in YYYY-MM-DD format for inputs
function getCurrentDateFormatted() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Export utils to global scope
window.utils = {
    formatCurrency,
    calculateTakeHome,
    formatDate,
    generateUniqueId,
    showModal,
    hideModal,
    showNotification,
    debounce,
    isValidEmail,
    getCurrentDateFormatted
};
