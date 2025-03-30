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
                if (typeof utils !== 'undefined' && typeof utils.showNotification === 'function') {
                    utils.showNotification('Rate settings not available', 'error');
                } else {
                    alert('Rate settings not available');
                }
            }
        });
    }
    
    // Calculate web price button
    const calculateWebBtn = document.getElementById('calculate-web-price');
    if (calculateWebBtn) {
        calculateWebBtn.addEventListener('click', function() {
            if (typeof window.calculator !== 'undefined' && typeof window.calculator.calculateWebPrice === 'function') {
                window.calculator.calculateWebPrice();
            } else {
                alert('Calculator not available');
            }
        });
    }
    
    // Calculate design price button
    const calculateDesignBtn = document.getElementById('calculate-design-price');
    if (calculateDesignBtn) {
        calculateDesignBtn.addEventListener('click', function() {
            if (typeof window.calculator !== 'undefined' && typeof window.calculator.calculateDesignPrice === 'function') {
                window.calculator.calculateDesignPrice();
            } else {
                alert('Calculator not available');
            }
        });
    }
    
    // Calculate video price button
    const calculateVideoBtn = document.getElementById('calculate-video-price');
    if (calculateVideoBtn) {
        calculateVideoBtn.addEventListener('click', function() {
            if (typeof window.calculator !== 'undefined' && typeof window.calculator.calculateVideoPrice === 'function') {
                window.calculator.calculateVideoPrice();
            } else {
                alert('Calculator not available');
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
            
            <h4>For International Clients (USA/Canada):</h4>
            <ul>
                <li>Emphasize your experience working with North American businesses</li>
                <li>Highlight your ability to work in their time zones</li>
                <li>For design work, clearly communicate the AI-assisted options and their benefits</li>
                <li>Offer package deals for recurring design needs (monthly social media graphics, etc.)</li>
                <li>Stress your Firebase expertise for creating full-stack applications with authentication</li>
            </ul>
        `;
    } else if (currency === 'USD') {
        notesSection.innerHTML = `
            <h4>For US Clients:</h4>
            <ul>
                <li>Emphasize the cost advantages compared to US-based designers/developers</li>
                <li>Highlight your experience with US clients and understanding of their business culture</li>
                <li>For designs, offer "AI-assisted" tiers as innovation rather than cost-cutting</li>
                <li>Provide clear communication about your working hours and availability</li>
                <li>Stress quality deliverables and professional communication</li>
                <li>Highlight your Firebase expertise as a cost-effective alternative to server-based backends</li>
            </ul>
        `;
    } else if (currency === 'CAD') {
        notesSection.innerHTML = `
            <h4>For Canadian Clients:</h4>
            <ul>
                <li>Emphasize value and quality at competitive rates compared to Canadian service providers</li>
                <li>Highlight your experience with Canadian businesses</li>
                <li>Offer bundled packages for recurring services</li>
                <li>Clearly communicate timeline expectations considering time zone differences</li>
                <li>Present AI-assisted options as innovative solutions that save both time and money</li>
                <li>Position your Firebase expertise as providing enterprise-level functionality at startup prices</li>
            </ul>
        `;
    }
    
    // If a calculation has been done, recalculate with the new currency
    if (document.getElementById('resultArea').style.display === 'block' && window.currentQuote) {
        if (window.currentQuote.type === 'web' && typeof window.calculator !== 'undefined' && typeof window.calculator.calculateWebPrice === 'function') {
            window.calculator.calculateWebPrice();
        } else if (window.currentQuote.type === 'design' && typeof window.calculator !== 'undefined' && typeof window.calculator.calculateDesignPrice === 'function') {
            window.calculator.calculateDesignPrice();
        } else if (window.currentQuote.type === 'video' && typeof window.calculator !== 'undefined' && typeof window.calculator.calculateVideoPrice === 'function') {
            window.calculator.calculateVideoPrice();
        }
    }
}

// Check authentication state
function checkAuthState() {
    if (typeof auth === 'undefined') return;
    
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            updateUIForSignedInUser(user);
        } else {
            // User is signed out
            updateUIForSignedOutUser();
        }
    });
}

// Update UI for signed in user
function updateUIForSignedInUser(user) {
    const userProfileEl = document.getElementById('user-profile');
    if (userProfileEl) {
        userProfileEl.innerHTML = `
            <span>Welcome, ${user.displayName || user.email}</span>
            <button id="sign-out-btn" class="mini-button">Sign Out</button>
        `;
        
        // Add sign out button listener
        const signOutBtn = document.getElementById('sign-out-btn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', () => {
                auth.signOut();
            });
        }
    }
    
    // Reload data from Firebase
    if (typeof window.clientManager !== 'undefined') {
        setTimeout(() => {
            // Allow some time for Firebase to initialize
            window.clientManager.initClientManager();
        }, 1000);
    }
}

// Update UI for signed out user
function updateUIForSignedOutUser() {
    const userProfileEl = document.getElementById('user-profile');
    if (userProfileEl) {
        userProfileEl.innerHTML = `
            <button id="sign-in-btn" class="mini-button">Sign In</button>
            <button id="register-btn" class="mini-button">Register</button>
        `;
        
        // Add sign in button listener
        const signInBtn = document.getElementById('sign-in-btn');
        if (signInBtn) {
            signInBtn.addEventListener('click', showLoginModal);
        }
        
        // Add register button listener
        const registerBtn = document.getElementById('register-btn');
        if (registerBtn) {
            registerBtn.addEventListener('click', showRegisterModal);
        }
    }
    
    // Load data from localStorage
    if (typeof window.clientManager !== 'undefined') {
        window.clientManager.initClientManager();
    }
}

// Show login modal
function showLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        // Set title and button text
        const titleEl = modal.querySelector('h2');
        if (titleEl) titleEl.textContent = 'Login';
        
        const loginButton = modal.querySelector('#login-button');
        if (loginButton) loginButton.textContent = 'Login';
        
        // Show register link
        const registerLink = modal.querySelector('#register-link');
        if (registerLink) {
            const parentEl = registerLink.parentElement;
            if (parentEl) parentEl.style.display = 'block';
            
            registerLink.addEventListener('click', function(e) {
                e.preventDefault();
                showRegisterModal();
            });
        }
        
        // Set button action
        if (loginButton) {
            loginButton.onclick = handleLogin;
        }
        
        modal.style.display = 'block';
    }
}

// Show register modal
function showRegisterModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        // Set title and button text
        const titleEl = modal.querySelector('h2');
        if (titleEl) titleEl.textContent = 'Register';
        
        const loginButton = modal.querySelector('#login-button');
        if (loginButton) loginButton.textContent = 'Register';
        
        // Hide register link
        const registerLink = modal.querySelector('#register-link');
        if (registerLink && registerLink.parentElement) {
            registerLink.parentElement.style.display = 'none';
        }
        
        // Set button action
        if (loginButton) {
            loginButton.onclick = handleRegister;
        }
        
        modal.style.display = 'block';
    }
}

// Handle login
function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }
    
    if (typeof auth !== 'undefined') {
        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                // Close modal
                document.getElementById('login-modal').style.display = 'none';
                alert('Logged in successfully');
            })
            .catch(error => {
                alert(`Login failed: ${error.message}`);
            });
    } else {
        alert('Authentication not available');
    }
}

// Handle register
function handleRegister() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    if (typeof auth !== 'undefined') {
        auth.createUserWithEmailAndPassword(email, password)
            .then(() => {
                // Close modal
                document.getElementById('login-modal').style.display = 'none';
                alert('Account created successfully');
            })
            .catch(error => {
                alert(`Registration failed: ${error.message}`);
            });
    } else {
        alert('Authentication not available');
    }
}

// Export app functions to global scope
window.app = {
    initApp,
    showLoginModal,
    showRegisterModal
};
