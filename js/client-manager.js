/**
 * Client Manager Module
 * Handles client data, quote history, and client interactions
 */

// Store for active clients and quotes
let clients = [];
let quotes = [];

// Initialize client manager
function initClientManager() {
    // Load data from Firebase if logged in
    if (auth.currentUser) {
        loadClientsFromFirebase();
        loadQuotesFromFirebase();
    } else {
        // Load from localStorage as fallback
        loadClientsFromLocalStorage();
        loadQuotesFromLocalStorage();
    }
    
    // Set up event listeners
    setupClientManagerListeners();
}

// Set up event listeners for client-related actions
function setupClientManagerListeners() {
    // Save quote button
    const saveQuoteBtn = document.getElementById('save-quote');
    if (saveQuoteBtn) {
        saveQuoteBtn.addEventListener('click', saveCurrentQuote);
    }
    
    // Export PDF button
    const exportPdfBtn = document.getElementById('export-pdf');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', () => {
            if (typeof window.pdfGenerator !== 'undefined') {
                window.pdfGenerator.generateQuotePDF();
            } else {
                utils.showNotification('PDF generator not available', 'error');
            }
        });
    }
    
    // Email client button
    const emailClientBtn = document.getElementById('email-client');
    if (emailClientBtn) {
        emailClientBtn.addEventListener('click', emailQuoteToClient);
    }
    
    // Apply discount button
    const applyDiscountBtn = document.getElementById('apply-discount');
    if (applyDiscountBtn) {
        applyDiscountBtn.addEventListener('click', () => window.calculator.applyDiscount());
    }
}

// Save the current quote
function saveCurrentQuote() {
    if (!window.currentQuote) {
        utils.showNotification('No quote to save', 'error');
        return;
    }
    
    // Get client info
    const clientName = document.getElementById('client-name').value;
    const clientEmail = document.getElementById('client-email').value;
    const clientCompany = document.getElementById('client-company').value;
    const projectName = document.getElementById('project-name').value;
    
    if (!clientName || clientName.trim() === '') {
        utils.showNotification('Please enter a client name', 'error');
        return;
    }
    
    // Check if client exists, create if not
    let clientId = findOrCreateClient(clientName, clientEmail, clientCompany);
    
    // Create quote object
    const quote = {
        id: utils.generateUniqueId(),
        clientId,
        projectName: projectName || 'Untitled Project',
        date: new Date(),
        type: window.currentQuote.type,
        details: window.currentQuote.details,
        subtotal: window.currentQuote.subtotal,
        total: window.currentQuote.total,
        discount: window.currentQuote.discount || null,
        currency: document.getElementById('currency').value,
        status: 'pending',
        notes: {
            client: document.getElementById('client-notes').value || '',
            internal: document.getElementById('internal-notes').value || ''
        }
    };
    
    // Save quote
    quotes.push(quote);
    saveQuotesToStorage();
    
    // Provide feedback
    utils.showNotification('Quote saved successfully', 'success');
    
    // Show quote history section
    showQuoteHistory();
}

// Find existing client or create new one
function findOrCreateClient(name, email, company) {
    // Check if client exists
    const existingClient = clients.find(client => 
        client.email === email && email !== '' || 
        client.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existingClient) {
        // Update client info if needed
        if (company && company !== existingClient.company) {
            existingClient.company = company;
            saveClientsToStorage();
        }
        return existingClient.id;
    }
    
    // Create new client
    const newClient = {
        id: utils.generateUniqueId(),
        name,
        email: email || '',
        company: company || '',
        created: new Date(),
        notes: ''
    };
    
    clients.push(newClient);
    saveClientsToStorage();
    
    return newClient.id;
}

// Show quote history section
function showQuoteHistory() {
    const historySection = document.getElementById('quote-history');
    const quotesList = document.getElementById('quotes-list');
    
    // Show the section
    historySection.style.display = 'block';
    
    // Clear previous quotes
    quotesList.innerHTML = '';
    
    // Sort quotes by date (newest first)
    const sortedQuotes = [...quotes].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Display quotes
    if (sortedQuotes.length === 0) {
        quotesList.innerHTML = '<p>No saved quotes found.</p>';
        return;
    }
    
    sortedQuotes.forEach(quote => {
        const client = clients.find(c => c.id === quote.clientId) || { name: 'Unknown Client' };
        
        const quoteDiv = document.createElement('div');
        quoteDiv.className = 'quote-item';
        quoteDiv.innerHTML = `
            <div class="quote-info">
                <div><strong>${quote.projectName}</strong> for ${client.name}</div>
                <div>${utils.formatDate(new Date(quote.date))} - ${utils.formatCurrency(quote.total, quote.currency)}
                    <span class="quote-status status-${quote.status}">${quote.status.toUpperCase()}</span>
                </div>
            </div>
            <div class="quote-actions">
                <button class="mini-button view-quote" data-id="${quote.id}">View</button>
                <button class="mini-button edit-quote" data-id="${quote.id}">Edit</button>
                <button class="mini-button delete-quote" data-id="${quote.id}">Delete</button>
            </div>
        `;
        
        quotesList.appendChild(quoteDiv);
    });
    
    // Add event listeners to buttons
    quotesList.querySelectorAll('.view-quote').forEach(button => {
        button.addEventListener('click', () => viewQuote(button.getAttribute('data-id')));
    });
    
    quotesList.querySelectorAll('.edit-quote').forEach(button => {
        button.addEventListener('click', () => editQuote(button.getAttribute('data-id')));
    });
    
    quotesList.querySelectorAll('.delete-quote').forEach(button => {
        button.addEventListener('click', () => deleteQuote(button.getAttribute('data-id')));
    });
}

// View a saved quote
function viewQuote(quoteId) {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) {
        utils.showNotification('Quote not found', 'error');
        return;
    }
    
    // Load quote details into view
    loadQuoteIntoView(quote);
}

// Edit a saved quote
function editQuote(quoteId) {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) {
        utils.showNotification('Quote not found', 'error');
        return;
    }
    
    // Load quote details into editor
    loadQuoteIntoEditor(quote);
}

// Load a quote into the viewer
function loadQuoteIntoView(quote) {
    // Set current quote
    window.currentQuote = {
        type: quote.type,
        details: quote.details,
        subtotal: quote.subtotal,
        total: quote.total,
        discount: quote.discount
    };
    
    // Get client info
    const client = clients.find(c => c.id === quote.clientId) || { 
        name: 'Unknown Client',
        company: '',
        email: ''
    };
    
    // Update client info fields
    document.getElementById('client-name').value = client.name;
    document.getElementById('client-email').value = client.email || '';
    document.getElementById('client-company').value = client.company || '';
    document.getElementById('project-name').value = quote.projectName;
    
    // Update summary
    document.getElementById('summary-client-name').textContent = client.name;
    document.getElementById('summary-project-name').textContent = quote.projectName;
    document.getElementById('summary-date').textContent = utils.formatDate(new Date(quote.date));
    
    // Set currency
    document.getElementById('currency').value = quote.currency;
    
    // Update price display
    document.getElementById('totalPrice').textContent = utils.formatCurrency(quote.total, quote.currency);
    
    // Show take-home amount if needed
    if (quote.currency !== 'INR') {
        const takeHomeAmount = utils.calculateTakeHome(quote.total, quote.currency);
        document.getElementById('takeHomePrice').textContent = `Take-home amount: ₹${takeHomeAmount.toLocaleString()}`;
        document.getElementById('takeHomePrice').style.display = 'block';
    } else {
        document.getElementById('takeHomePrice').style.display = 'none';
    }
    
    // Set notes
    document.getElementById('client-notes').value = quote.notes?.client || '';
    document.getElementById('internal-notes').value = quote.notes?.internal || '';
    
    // Select correct tab
    const tabButton = document.querySelector(`.tab-button[data-tab="${quote.type}"]`);
    if (tabButton) {
        tabButton.click();
    }
    
    // Show result area
    document.getElementById('resultArea').style.display = 'block';
    
    // Generate breakdown
    generateQuoteBreakdown(quote);
}

// Load a quote into the editor
function loadQuoteIntoEditor(quote) {
    // First load into view
    loadQuoteIntoView(quote);
    
    // Then set all form fields based on quote.details
    if (quote.type === 'web') {
        setWebFormValues(quote.details);
    } else if (quote.type === 'design') {
        setDesignFormValues(quote.details);
    } else if (quote.type === 'video') {
        setVideoFormValues(quote.details);
    }
    
    // Set discount if any
    if (quote.discount) {
        document.getElementById('discount-amount').value = quote.discount.amount;
        document.getElementById('discount-type').value = quote.discount.type;
    }
    
    utils.showNotification('Quote loaded for editing. Make changes and save again.', 'info');
}

// Set web form values based on quote details
function setWebFormValues(details) {
    // Set basic fields
    if (details.siteType) document.getElementById('siteType').value = details.siteType;
    if (details.pages) document.getElementById('pages').value = details.pages;
    if (details.complexity) document.getElementById('complexity').value = details.complexity;
    if (details.backendComplexity) document.getElementById('backendComplexity').value = details.backendComplexity;
    if (details.timeline) document.getElementById('timeline').value = details.timeline;
    if (details.maintenance) document.getElementById('maintenance').value = details.maintenance;
    if (details.clientProfile) document.getElementById('clientProfile').value = details.clientProfile;
    
    // Uncheck all features first
    for (const feature in window.calculator.webFeatureCosts) {
        const checkbox = document.getElementById(feature);
        if (checkbox) checkbox.checked = false;
    }
    
    // Check selected features
    if (details.features) {
        details.features.forEach(feature => {
            const checkbox = document.getElementById(feature);
            if (checkbox) checkbox.checked = true;
        });
    }
}

// Set design form values based on quote details
function setDesignFormValues(details) {
    // Set basic fields
    if (details.designType) document.getElementById('designType').value = details.designType;
    if (details.designComplexity) document.getElementById('designComplexity').value = details.designComplexity;
    if (details.revisions) document.getElementById('revisions').value = details.revisions;
    if (details.designTimeline) document.getElementById('designTimeline').value = details.designTimeline;
    if (details.aiAssisted) document.getElementById('aiAssisted').value = details.aiAssisted;
    if (details.clientProfile) document.getElementById('designClientProfile').value = details.clientProfile;
    
    // Uncheck all features first
    for (const feature in window.calculator.designFeatureCosts) {
        const checkbox = document.getElementById(feature);
        if (checkbox) checkbox.checked = false;
    }
    
    // Check selected features
    if (details.features) {
        details.features.forEach(feature => {
            const checkbox = document.getElementById(feature);
            if (checkbox) checkbox.checked = true;
        });
    }
}

// Set video form values based on quote details
function setVideoFormValues(details) {
    // Set basic fields
    if (details.videoType) document.getElementById('videoType').value = details.videoType;
    if (details.videoDuration) document.getElementById('videoDuration').value = details.videoDuration;
    if (details.videoComplexity) document.getElementById('videoComplexity').value = details.videoComplexity;
    if (details.videoTimeline) document.getElementById('videoTimeline').value = details.videoTimeline;
    if (details.videoRevisions) document.getElementById('videoRevisions').value = details.videoRevisions;
    if (details.clientProfile) document.getElementById('videoClientProfile').value = details.clientProfile;
    
    // Uncheck all features first
    for (const feature in window.calculator.videoFeatureCosts) {
        const checkbox = document.getElementById(feature);
        if (checkbox) checkbox.checked = false;
    }
    
    // Check selected features
    if (details.features) {
        details.features.forEach(feature => {
            const checkbox = document.getElementById(feature);
            if (checkbox) checkbox.checked = true;
        });
    }
}

// Generate price breakdown for a saved quote
function generateQuoteBreakdown(quote) {
    const breakdownContainer = document.getElementById('priceBreakdown');
    breakdownContainer.innerHTML = '';
    
    // Base item
    let baseText = '';
    if (quote.type === 'web') {
        const siteType = quote.details.siteType;
        baseText = `Base Price (${siteType === 'landing' ? 'Landing Page' : 
                  siteType === 'business' ? 'Basic Business Site' :
                  siteType === 'advanced' ? 'Advanced Business Site' :
                  siteType === 'catalog' ? 'Product Catalog' : 'Simple E-commerce'})`;
    } else if (quote.type === 'design') {
        const designType = quote.details.designType;
        baseText = `Base Price (${designType === 'logo' ? 'Logo Design' : 
                  designType === 'branding' ? 'Brand Identity Package' :
                  designType === 'social' ? 'Social Media Graphics' :
                  designType === 'banner' ? 'Website Banner/Header' :
                  designType === 'print' ? 'Print Materials' : 'Product Packaging'})`;
    } else if (quote.type === 'video') {
        const videoType = quote.details.videoType;
        baseText = `Base Price (${videoType === 'explainer' ? 'Explainer Video' : 
                  videoType === 'promo' ? 'Promotional Video' :
                  videoType === 'social' ? 'Social Media Video' :
                  videoType === 'tutorial' ? 'Tutorial/How-To' :
                  videoType === 'testimonial' ? 'Testimonial/Interview' : 'Corporate Video'})`;
    }
    
    // Add base price item
    const baseDiv = document.createElement('div');
    baseDiv.className = 'breakdown-item';
    baseDiv.innerHTML = `<span>${baseText}</span><span>${utils.formatCurrency(quote.subtotal, quote.currency)}</span>`;
    breakdownContainer.appendChild(baseDiv);
    
    // If there's a discount
    if (quote.discount) {
        const discountDiv = document.createElement('div');
        discountDiv.className = 'breakdown-item';
        
        const discountText = quote.discount.type === 'percentage' ? 
            `Custom Discount (${quote.discount.amount}%)` : 
            'Custom Discount (Fixed Amount)';
        
        const discountValue = quote.discount.type === 'percentage' ? 
            `-${quote.discount.amount}%` : 
            `-${utils.formatCurrency(quote.discount.amount, quote.currency)}`;
        
        discountDiv.innerHTML = `<span>${discountText}</span><span>${discountValue}</span>`;
        breakdownContainer.appendChild(discountDiv);
    }
    
    // Add total
    const totalDiv = document.createElement('div');
    totalDiv.className = 'breakdown-item';
    totalDiv.innerHTML = `<span>TOTAL</span><span>${utils.formatCurrency(quote.total, quote.currency)}</span>`;
    breakdownContainer.appendChild(totalDiv);
}

// Delete a quote
function deleteQuote(quoteId) {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this quote?')) {
        return;
    }
    
    // Remove the quote
    quotes = quotes.filter(q => q.id !== quoteId);
    saveQuotesToStorage();
    
    // Refresh the list
    showQuoteHistory();
    
    utils.showNotification('Quote deleted successfully', 'success');
}

// Email a quote to a client
function emailQuoteToClient() {
    const clientEmail = document.getElementById('client-email').value;
    
    if (!clientEmail || !utils.isValidEmail(clientEmail)) {
        utils.showNotification('Please enter a valid client email', 'error');
        return;
    }
    
    if (!window.currentQuote) {
        utils.showNotification('No quote to email', 'error');
        return;
    }
    
    // In a real implementation, you'd integrate with an email API
    // For now, we'll just simulate the process
    
    utils.showNotification('Email sending feature will be implemented in a future update', 'info');
    
    // If Firebase is connected, you could use Firebase Functions to send emails
    if (auth.currentUser) {
        // Future implementation:
        // db.collection('emailQueue').add({
        //     quoteId: window.currentQuote.id,
        //     clientEmail: clientEmail,
        //     userId: auth.currentUser.uid,
        //     status: 'pending',
        //     created: firebase.firestore.FieldValue.serverTimestamp()
        // });
    }
}

// Save clients to storage
function saveClientsToStorage() {
    if (auth.currentUser) {
        // Save to Firebase
        saveClientsToFirebase();
    } else {
        // Save to localStorage as fallback
        try {
            localStorage.setItem('freelancer_clients', JSON.stringify(clients));
        } catch (e) {
            console.warn('Could not save clients to localStorage', e);
        }
    }
}

// Save quotes to storage
function saveQuotesToStorage() {
    if (auth.currentUser) {
        // Save to Firebase
        saveQuotesToFirebase();
    } else {
        // Save to localStorage as fallback
        try {
            localStorage.setItem('freelancer_quotes', JSON.stringify(quotes));
        } catch (e) {
            console.warn('Could not save quotes to localStorage', e);
        }
    }
}

// Load clients from localStorage
function loadClientsFromLocalStorage() {
    try {
        const savedClients = JSON.parse(localStorage.getItem('freelancer_clients'));
        if (savedClients && Array.isArray(savedClients)) {
            clients = savedClients;
        }
    } catch (e) {
        console.warn('Could not load clients from localStorage', e);
    }
}

// Load quotes from localStorage
function loadQuotesFromLocalStorage() {
    try {
        const savedQuotes = JSON.parse(localStorage.getItem('freelancer_quotes'));
        if (savedQuotes && Array.isArray(savedQuotes)) {
            quotes = savedQuotes;
        }
    } catch (e) {
        console.warn('Could not load quotes from localStorage', e);
    }
}

// Save clients to Firebase
function saveClientsToFirebase() {
    if (!auth.currentUser) return;
    
    const uid = auth.currentUser.uid;
    
    // Get a batch reference
    const batch = db.batch();
    
    // Get the clients collection reference
    const clientsRef = db.collection('users').doc(uid).collection('clients');
    
    // Add each client to the batch
    clients.forEach(client => {
        batch.set(clientsRef.doc(client.id), client);
    });
    
    // Commit the batch
    batch.commit()
        .catch(error => {
            console.error('Error saving clients to Firebase:', error);
            utils.showNotification('Failed to save client data', 'error');
        });
}

// Save quotes to Firebase
function saveQuotesToFirebase() {
    if (!auth.currentUser) return;
    
    const uid = auth.currentUser.uid;
    
    // Get a batch reference
    const batch = db.batch();
    
    // Get the quotes collection reference
    const quotesRef = db.collection('users').doc(uid).collection('quotes');
    
    // Add each quote to the batch
    quotes.forEach(quote => {
        batch.set(quotesRef.doc(quote.id), quote);
    });
    
    // Commit the batch
    batch.commit()
        .catch(error => {
            console.error('Error saving quotes to Firebase:', error);
            utils.showNotification('Failed to save quote data', 'error');
        });
}

// Load clients from Firebase
function loadClientsFromFirebase() {
    if (!auth.currentUser) return;
    
    const uid = auth.currentUser.uid;
    
    db.collection('users').doc(uid).collection('clients').get()
        .then(snapshot => {
            const loadedClients = [];
            snapshot.forEach(doc => {
                loadedClients.push(doc.data());
            });
            
            if (loadedClients.length > 0) {
                clients = loadedClients;
                utils.showNotification('Client data loaded', 'success');
            }
        })
        .catch(error => {
            console.error('Error loading clients from Firebase:', error);
            utils.showNotification('Failed to load client data', 'error');
            // Fallback to localStorage
            loadClientsFromLocalStorage();
        });
}

// Load quotes from Firebase
function loadQuotesFromFirebase() {
    if (!auth.currentUser) return;
    
    const uid = auth.currentUser.uid;
    
    db.collection('users').doc(uid).collection('quotes').get()
        .then(snapshot => {
            const loadedQuotes = [];
            snapshot.forEach(doc => {
                loadedQuotes.push(doc.data());
            });
            
            if (loadedQuotes.length > 0) {
                quotes = loadedQuotes;
                utils.showNotification('Quote data loaded', 'success');
            }
        })
        .catch(error => {
            console.error('Error loading quotes from Firebase:', error);
            utils.showNotification('Failed to load quote data', 'error');
            // Fallback to localStorage
            loadQuotesFromLocalStorage();
        });
}

// Export client manager functions to global scope
window.clientManager = {
    initClientManager,
    showQuoteHistory,
    saveCurrentQuote,
    viewQuote,
    editQuote,
    deleteQuote,
    emailQuoteToClient
};
