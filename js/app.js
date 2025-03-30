/**
 * Main Application
 * Entry point that coordinates all modules
 */

// Initialize the application
document.addEventListener('DOMContentLoaded', initApp);

// Main initialization function
function initApp() {
    // Set up tab navigation
    setupTabs();
    
    // Set up modal close buttons
    setupModals();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load rate settings
    if (typeof window.calculator !== 'undefined' && typeof window.calculator.loadRateSettings === 'function') {
        window.calculator.loadRateSettings();
    }
    
    // Initialize client manager
    if (typeof window.clientManager !== 'undefined') {
        window.clientManager.initClientManager();
    }
    
    // Fetch exchange rates
    if (typeof window.calculator !== 'undefined' && typeof window.calculator.fetchExchangeRates === 'function') {
        window.calculator.fetchExchangeRates();
    }
    
    // Check auth state
    checkAuthState();
}

// Set up tab navigation
function setupTabs() {
    // Get all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    
    // Add click event to each tab button
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the tab ID from the data-tab attribute
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all tabs
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show the corresponding tab content
            const tabContent = document.getElementById(tabId);
            if (tabContent) {
                tabContent.classList.add('active');
            }
            
            // Hide result area when switching tabs
            document.getElementById('resultArea').style.display = 'none';
        });
    });
}

// Set up modal close functionality
function setupModals() {
    // Get all close buttons
    const closeButtons = document.querySelectorAll('.close-modal');
    
    // Add click event to each close button
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Find the parent modal
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

// Set up event listeners
function setupEventListeners() {
    // Refresh exchange rates button
    const refreshRatesBtn = document.getElementById('refresh-rates');
    if (refreshRatesBtn) {
        refreshRatesBtn.addEventListener('click', function() {
            if (typeof window.calculator !== 'undefined' && typeof window.calculator.fetchExchangeRates === 'function') {
                window.calculator.fetchExchangeRates();
            }
        });
    }
    
    // Rate settings button
    const rateSettingsBtn = document.getElementById('rate-settings');
    if (rateSettingsBtn) {
        rateSettingsBtn.addEventListener('click', function() {
            if (typeof window.calculator !== 'undefined' && typeof window.calculator.showRateSettings === 'function') {
                window.calculator.showRateSettings();
            } else {
                utils.showNotification('Rate settings not available', 'error');
            }
        });
    }
    
    // Calculate web price button
    const calculateWebBtn = document.getElementById('calculate-web-price');
    if (calculateWebBtn) {
        calculateWebBtn.addEventListener('click', function() {
            if (typeof window.calculator !== 'undefined' && typeof window.calculator.calculateWebPrice === 'function') {
                window.calculator.calculateWebPrice();
            }
        });
    }
    
    // Calculate design price button
    const calculateDesignBtn = document.getElementById('calculate-design-price');
    if (calculateDesignBtn) {
        calculateDesignBtn.addEventListener('click', function() {
            if (typeof window.calculator !== 'undefined' && typeof window.calculator.calculateDesignPrice === 'function') {
                window.calculator.calculateDesignPrice();
            }
        });
    }
    
    // Calculate video price button
    const calculateVideoBtn = document.getElementById('calculate-video-price');
    if (calculateVideoBtn) {
        calculateVideoBtn.addEventListener('click', function() {
            if (typeof window.calculator !== 'undefined' && typeof window.calculator.calculateVideoPrice === 'function') {
                window.calculator.calculateVideoPrice();
            }
        });
    }
    
    // Website type change (show/hide pages input)
    const siteTypeSelect = document.getElementById('siteType');
    if (siteTypeSelect) {
        siteTypeSelect.addEventListener('change', function() {
            const pagesGroup = document.getElementById('pages').parentElement;
            if (this.value === 'landing') {
                document.getElementById('pages').value = 1;
                pagesGroup.style.display = 'none';
            } else {
                pagesGroup.style.display = 'block';
            }
        });
        
        // Initial setup
        if (siteTypeSelect.value === 'landing') {
            const pagesGroup = document.getElementById('pages').parentElement;
            if (pagesGroup) {
                pagesGroup.style.display = 'none';
            }
        }
    }
    
    // Currency change
    const currencySelect = document.getElementById('currency');
    if (currencySelect) {
        currencySelect.addEventListener('change', updateCurrencyNotes);
        
        // Initial setup
        updateCurrencyNotes();
    }
}

// Update marketing notes based on currency selection
function updateCurrencyNotes() {
    const currency = document.getElementById('currency').value;
    const notesSection = document.getElementById('marketingNotes');
    
    if (!notesSection) return;
    
    if (currency === 'INR') {
        notesSection.innerHTML = `
            <h4>For Local Clients (Kurukshetra):</h4>
            <ul>
                <li>Focus on the business benefits of having an online presence</li>
                <li>Emphasize mobile-friendly designs for reaching younger customers</li>
                <li>Offer local business package deals with simplified pricing</li>
                <li>Consider bundling web development with basic design services</li>
                <li>Highlight how Firebase authentication can create customer accounts for their business</li>
                <li>Explain how Firebase can store customer data securely without expensive database servers</li>
            </ul>
            `;
    } else if (currency === 'USD') {
        // USD currency notes
    } else if (currency === 'CAD') {
        // CAD currency notes
    }
    
    // ... remaining function code
}
