/**
 * Calculator Module
 * Handles all pricing calculation logic for web, design, and video projects
 */

// Exchange rates (will be updated by API)
let exchangeRates = {
    'INR': 1,
    'USD': 82, // Default fallback: 1 USD = 82 INR (approx)
    'CAD': 60  // Default fallback: 1 CAD = 60 INR (approx)
};

// Rate multipliers for different client types
let clientMultipliers = {
    'startup': 0.8,    // Reduced rates for startups/small businesses
    'standard': 1.0,   // Standard rates (default)
    'corporate': 1.3,  // Premium rates for corporate clients
    'enterprise': 1.5  // Enterprise level pricing
};

// Base rates for web development in INR
let webBaseRates = {
    'landing': 3000,
    'business': 6000,
    'advanced': 10000,
    'catalog': 12000,
    'ecommerce': 18000
};

// Feature costs for web development in INR
let webFeatureCosts = {
    'contactForm': 500,
    'gallery': 1000,
    'responsive': 1500,
    'slideshow': 1200,
    'map': 800,
    'seo': 1500,
    'social': 1000,
    'analytics': 800,
    'firebase': 3500,
    'fireAuth': 2500
};

// Base rates for design projects in INR
let designBaseRates = {
    'logo': 5000,
    'branding': 12000,
    'social': 3000,
    'banner': 2500,
    'print': 4000,
    'packaging': 8000
};

// Additional feature costs for design in INR
let designFeatureCosts = {
    'sourceFiles': 1000,
    'variations': 2000,
    'socialSizes': 1500,
    'printReady': 1000
};

// Base rates for video production in INR
let videoBaseRates = {
    'explainer': 15000,
    'promo': 12000,
    'social': 8000,
    'tutorial': 10000,
    'testimonial': 7000,
    'corporate': 20000
};

// Video feature costs in INR
let videoFeatureCosts = {
    'scriptwriting': 3000,
    'voiceover': 4000,
    'music': 2000,
    'animation': 5000,
    'captions': 1500,
    'multiple-formats': 2500
};

// Video duration multipliers
let videoDurationMultipliers = {
    'short': 1.0,       // 30-60 seconds
    'medium': 1.5,      // 1-3 minutes
    'long': 2.0,        // 3-5 minutes
    'extended': 2.5     // 5+ minutes
};

// Maintenance costs in INR
let maintenanceCosts = {
    'basic': 500,
    'standard': 1000
};

// Function to fetch latest exchange rates
async function fetchExchangeRates() {
    try {
        const response = await fetch('https://open.er-api.com/v6/latest/INR');
        const data = await response.json();
        
        if (data && data.rates) {
            // The API gives rates from INR to other currencies, but we need the inverse
            exchangeRates.USD = 1 / data.rates.USD;
            exchangeRates.CAD = 1 / data.rates.CAD;
            
            // Update the status
            const statusElement = document.createElement('div');
            statusElement.className = 'exchange-status';
            statusElement.innerHTML = `<small>✓ Exchange rates updated: 1 USD = ₹${Math.round(exchangeRates.USD)}, 1 CAD = ₹${Math.round(exchangeRates.CAD)}</small>`;
            
            // Remove any existing status
            document.querySelectorAll('.exchange-status').forEach(el => el.remove());
            
            // Add new status after currency selector
            document.querySelector('.currency-toggle').appendChild(statusElement);
            
            utils.showNotification('Exchange rates updated successfully', 'success');
            return true;
        }
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        // Create error status element
        const statusElement = document.createElement('div');
        statusElement.className = 'exchange-status';
        statusElement.innerHTML = `<small style="color:red;">Using fallback exchange rates. Could not connect to exchange rate API.</small>`;
        
        // Remove any existing status
        document.querySelectorAll('.exchange-status').forEach(el => el.remove());
        
        // Add new status after currency selector
        document.querySelector('.currency-toggle').appendChild(statusElement);
        
        utils.showNotification('Failed to update exchange rates. Using fallback values.', 'error');
        return false;
    }
}

// Calculate web development price
function calculateWebPrice() {
    // Get client info
    updateClientSummary();
    
    // Base rates for different website types
    const siteType = document.getElementById('siteType').value;
    let basePrice = webBaseRates[siteType];
    
    // Get client profile multiplier
    const clientProfile = document.getElementById('clientProfile').value;
    const profileMultiplier = clientMultipliers[clientProfile];
    
    // Adjust for number of pages (only for multi-page sites)
    const pages = parseInt(document.getElementById('pages').value);
    let pagePrice = 0;
    
    if (siteType !== 'landing') {
        const basePagesIncluded = siteType === 'business' ? 3 : (siteType === 'advanced' ? 6 : 5);
        if (pages > basePagesIncluded) {
            pagePrice = (pages - basePagesIncluded) * 800;
        }
    }
    
    // Calculate features cost
    let featuresPrice = 0;
    const breakdownItems = [];
    
    // Add base price to breakdown
    breakdownItems.push({
        name: `Base Price (${siteType === 'landing' ? 'Landing Page' : 
               siteType === 'business' ? 'Basic Business Site' :
               siteType === 'advanced' ? 'Advanced Business Site' :
               siteType === 'catalog' ? 'Product Catalog' : 'Simple E-commerce'})`,
        price: basePrice
    });
    
    // Add page price if any
    if (pagePrice > 0) {
        breakdownItems.push({
            name: `Additional Pages (${pages - (siteType === 'business' ? 3 : (siteType === 'advanced' ? 6 : 5))})`,
            price: pagePrice
        });
    }
    
    // Backend complexity adjustment
    const backendComplexity = document.getElementById('backendComplexity').value;
    let backendPrice = 0;
    
    if (backendComplexity === 'basic') {
        backendPrice = 2000;
        breakdownItems.push({
            name: 'Basic Backend Integration',
            price: backendPrice
        });
    } else if (backendComplexity === 'medium') {
        backendPrice = 5000;
        breakdownItems.push({
            name: 'Medium Backend Integration',
            price: backendPrice
        });
    } else if (backendComplexity === 'complex') {
        backendPrice = 10000;
        breakdownItems.push({
            name: 'Complex Backend Integration',
            price: backendPrice
        });
    }
    
    // Calculate features
    for (const feature in webFeatureCosts) {
        if (document.getElementById(feature) && document.getElementById(feature).checked) {
            featuresPrice += webFeatureCosts[feature];
            breakdownItems.push({
                name: document.querySelector(`label[for="${feature}"]`).textContent,
                price: webFeatureCosts[feature]
            });
        }
    }
    
    // Design complexity adjustment
    const complexity = document.getElementById('complexity').value;
    let complexityMultiplier = 1;
    
    if (complexity === 'simple') {
        complexityMultiplier = 0.8;
    } else if (complexity === 'complex') {
        complexityMultiplier = 1.3;
    }
    
    // Timeline adjustment
    const timeline = document.getElementById('timeline').value;
    let timelineMultiplier = 1;
    
    if (timeline === 'rush') {
        timelineMultiplier = 1.2;
        breakdownItems.push({
            name: 'Rush Delivery (1-2 weeks)',
            price: `+20% (${utils.formatCurrency(Math.round((basePrice + pagePrice + featuresPrice + backendPrice) * 0.2))})`
        });
    } else if (timeline === 'urgent') {
        timelineMultiplier = 1.35;
        breakdownItems.push({
            name: 'Urgent Delivery (Less than 1 week)',
            price: `+35% (${utils.formatCurrency(Math.round((basePrice + pagePrice + featuresPrice + backendPrice) * 0.35))})`
        });
    }
    
    // Maintenance package
    const maintenance = document.getElementById('maintenance').value;
    let maintenanceRecurring = '';
    
    if (maintenance === 'basic') {
        maintenanceRecurring = ` + ${utils.formatCurrency(maintenanceCosts.basic)}/month`;
        breakdownItems.push({
            name: 'Basic Maintenance Package',
            price: `${utils.formatCurrency(maintenanceCosts.basic)}/month`
        });
    } else if (maintenance === 'standard') {
        maintenanceRecurring = ` + ${utils.formatCurrency(maintenanceCosts.standard)}/month`;
        breakdownItems.push({
            name: 'Standard Maintenance Package',
            price: `${utils.formatCurrency(maintenanceCosts.standard)}/month`
        });
    }
    
    // Add client profile adjustment
    if (clientProfile !== 'standard') {
        const profileAdjustmentText = clientProfile === 'startup' ? 'Startup/Small Business Discount' : 
                                     clientProfile === 'corporate' ? 'Corporate Client Premium' : 
                                     'Enterprise Client Premium';
        
        const percentageText = clientProfile === 'startup' ? '-20%' : 
                              clientProfile === 'corporate' ? '+30%' : 
                              '+50%';
        
        breakdownItems.push({
            name: profileAdjustmentText,
            price: percentageText
        });
    }
    
    // Calculate final price
    const subtotal = basePrice + pagePrice + featuresPrice + backendPrice;
    const total = Math.round(subtotal * complexityMultiplier * timelineMultiplier * profileMultiplier);
    
    // Store current calculation for saving later
    window.currentQuote = {
        type: 'web',
        details: {
            siteType,
            pages,
            features: getSelectedFeatures('web'),
            complexity,
            backendComplexity,
            timeline,
            maintenance,
            clientProfile
        },
        subtotal,
        total,
        maintenanceRecurring: maintenance !== 'none' ? maintenanceCosts[maintenance] : 0
    };
    
    // Display the result
    document.getElementById('totalPrice').textContent = `${utils.formatCurrency(total)}${maintenanceRecurring}`;
    document.getElementById('resultDescription').textContent = 'This estimate includes the base website development with all requested features.';
    
    // Show take-home amount in INR if currency is not INR
    const currency = document.getElementById('currency').value;
    if (currency !== 'INR') {
        const takeHomeAmount = utils.calculateTakeHome(total, currency);
        document.getElementById('takeHomePrice').textContent = `Take-home amount: ₹${takeHomeAmount.toLocaleString()}`;
        document.getElementById('takeHomePrice').style.display = 'block';
    } else {
        document.getElementById('takeHomePrice').style.display = 'none';
    }
    
    document.getElementById('resultArea').style.display = 'block';
    
    // Generate price breakdown
    generateBreakdown(breakdownItems, total, complexity, complexityMultiplier, maintenanceRecurring);
}

// Calculate design price
function calculateDesignPrice() {
    // Get client info
    updateClientSummary();
    
    // Get design type and base price
    const designType = document.getElementById('designType').value;
    let basePrice = designBaseRates[designType];
    
    // Get client profile multiplier
    const clientProfile = document.getElementById('designClientProfile').value;
    const profileMultiplier = clientMultipliers[clientProfile];
    
    // Initialize breakdown items array
    const breakdownItems = [];
    
    // Add base price to breakdown
    breakdownItems.push({
        name: `Base Price (${designType === 'logo' ? 'Logo Design' : 
               designType === 'branding' ? 'Brand Identity Package' :
               designType === 'social' ? 'Social Media Graphics' :
               designType === 'banner' ? 'Website Banner/Header' :
               designType === 'print' ? 'Print Materials' : 'Product Packaging'})`,
        price: basePrice
    });
    
    // Design complexity adjustment
    const designComplexity = document.getElementById('designComplexity').value;
    let complexityMultiplier = 1;
    
    if (designComplexity === 'basic') {
        complexityMultiplier = 0.8;
    } else if (designComplexity === 'premium') {
        complexityMultiplier = 1.5;
        breakdownItems.push({
            name: 'Premium Design Complexity',
            price: `+50% (${utils.formatCurrency(Math.round(basePrice * 0.5))})`
        });
    }
    
    // Revisions adjustment
    const revisions = document.getElementById('revisions').value;
    let revisionMultiplier = 1;
    
    if (revisions === 'unlimited') {
        revisionMultiplier = 1.3;
        breakdownItems.push({
            name: 'Unlimited Revisions',
            price: `+30% (${utils.formatCurrency(Math.round(basePrice * 0.3))})`
        });
    }
    
    // Timeline adjustment
    const designTimeline = document.getElementById('designTimeline').value;
    let timelineMultiplier = 1;
    
    if (designTimeline === 'rush') {
        timelineMultiplier = 1.2;
        breakdownItems.push({
            name: 'Rush Delivery (2-4 days)',
            price: `+20% (${utils.formatCurrency(Math.round(basePrice * 0.2))})`
        });
    } else if (designTimeline === 'urgent') {
        timelineMultiplier = 1.35;
        breakdownItems.push({
            name: 'Urgent Delivery (24-48 hours)',
            price: `+35% (${utils.formatCurrency(Math.round(basePrice * 0.35))})`
        });
    }
    
    // Additional deliverables
    let additionalPrice = 0;
    
    for (const feature in designFeatureCosts) {
        if (document.getElementById(feature) && document.getElementById(feature).checked) {
            additionalPrice += designFeatureCosts[feature];
            breakdownItems.push({
                name: document.querySelector(`label[for="${feature}"]`).textContent,
                price: designFeatureCosts[feature]
            });
        }
    }
    
    // AI assistance discount
    const aiAssisted = document.getElementById('aiAssisted').value;
    let aiDiscount = 0;
    
    if (aiAssisted === 'partial') {
        aiDiscount = 0.15;
        breakdownItems.push({
            name: 'Partial AI Assistance Discount',
            price: `-15% (${utils.formatCurrency(Math.round(basePrice * 0.15))})`
        });
    } else if (aiAssisted === 'heavy') {
        aiDiscount = 0.3;
        breakdownItems.push({
            name: 'Heavy AI Assistance Discount',
            price: `-30% (${utils.formatCurrency(Math.round(basePrice * 0.3))})`
        });
    }
    
    // Add client profile adjustment
    if (clientProfile !== 'standard') {
        const profileAdjustmentText = clientProfile === 'startup' ? 'Startup/Small Business Discount' : 
                                     clientProfile === 'corporate' ? 'Corporate Client Premium' : 
                                     'Enterprise Client Premium';
        
        const percentageText = clientProfile === 'startup' ? '-20%' : 
                              clientProfile === 'corporate' ? '+30%' : 
                              '+50%';
        
        breakdownItems.push({
            name: profileAdjustmentText,
            price: percentageText
        });
    }
    
    // Calculate final price
    const subtotal = basePrice + additionalPrice;
    const total = Math.round(subtotal * complexityMultiplier * revisionMultiplier * timelineMultiplier * (1 - aiDiscount) * profileMultiplier);
    
    // Store current calculation for saving later
    window.currentQuote = {
        type: 'design',
        details: {
            designType,
            designComplexity,
            revisions,
            designTimeline,
            features: getSelectedFeatures('design'),
            aiAssisted,
            clientProfile
        },
        subtotal,
        total
    };
    
    // Display the result
    document.getElementById('totalPrice').textContent = utils.formatCurrency(total);
    document.getElementById('resultDescription').textContent = 'This estimate includes the design work with all requested deliverables.';
    
    // Show take-home amount in INR if currency is not INR
    const currency = document.getElementById('currency').value;
    if (currency !== 'INR') {
        const takeHomeAmount = utils.calculateTakeHome(total, currency);
        document.getElementById('takeHomePrice').textContent = `Take-home amount: ₹${takeHomeAmount.toLocaleString()}`;
        document.getElementById('takeHomePrice').style.display = 'block';
    } else {
        document.getElementById('takeHomePrice').style.display = 'none';
    }
    
    document.getElementById('resultArea').style.display = 'block';
    
    // Generate price breakdown
    generateBreakdown(breakdownItems, total, designComplexity, complexityMultiplier, '');
}

// Calculate video production price
function calculateVideoPrice() {
    // Get client info
    updateClientSummary();
    
    // Get video type and base price
    const videoType = document.getElementById('videoType').value;
    let basePrice = videoBaseRates[videoType];
    
    // Get client profile multiplier
    const clientProfile = document.getElementById('videoClientProfile').value;
    const profileMultiplier = clientMultipliers[clientProfile];
    
    // Initialize breakdown items array
    const breakdownItems = [];
    
    // Add base price to breakdown
    breakdownItems.push({
        name: `Base Price (${videoType === 'explainer' ? 'Explainer Video' : 
               videoType === 'promo' ? 'Promotional Video' :
               videoType === 'social' ? 'Social Media Video' :
               videoType === 'tutorial' ? 'Tutorial/How-To' :
               videoType === 'testimonial' ? 'Testimonial/Interview' : 'Corporate Video'})`,
        price: basePrice
    });
    
    // Video duration adjustment
    const videoDuration = document.getElementById('videoDuration').value;
    const durationMultiplier = videoDurationMultipliers[videoDuration];
    
    if (videoDuration !== 'short') {
        const durationLabel = videoDuration === 'medium' ? 'Medium Duration (1-3 minutes)' :
                              videoDuration === 'long' ? 'Long Duration (3-5 minutes)' :
                              'Extended Duration (5+ minutes)';
        
        const durationPercentage = (durationMultiplier - 1) * 100;
        
        breakdownItems.push({
            name: durationLabel,
            price: `+${durationPercentage}% (${utils.formatCurrency(Math.round(basePrice * (durationMultiplier - 1)))})`
        });
    }
    
    // Video complexity adjustment
    const videoComplexity = document.getElementById('videoComplexity').value;
    let complexityMultiplier = 1;
    
    if (videoComplexity === 'basic') {
        complexityMultiplier = 0.8;
    } else if (videoComplexity === 'premium') {
        complexityMultiplier = 1.5;
        breakdownItems.push({
            name: 'Premium Production Complexity',
            price: `+50% (${utils.formatCurrency(Math.round(basePrice * 0.5))})`
        });
    }
    
    // Additional features
    let additionalPrice = 0;
    
    for (const feature in videoFeatureCosts) {
        if (document.getElementById(feature) && document.getElementById(feature).checked) {
            additionalPrice += videoFeatureCosts[feature];
            breakdownItems.push({
                name: document.querySelector(`label[for="${feature}"]`).textContent,
                price: videoFeatureCosts[feature]
            });
        }
    }
    
    // Timeline adjustment
    const videoTimeline = document.getElementById('videoTimeline').value;
    let timelineMultiplier = 1;
    
    if (videoTimeline === 'rush') {
        timelineMultiplier = 1.25;
        breakdownItems.push({
            name: 'Rush Delivery (3-5 days)',
            price: `+25% (${utils.formatCurrency(Math.round(basePrice * 0.25))})`
        });
    } else if (videoTimeline === 'urgent') {
        timelineMultiplier = 1.5;
        breakdownItems.push({
            name: 'Urgent Delivery (1-2 days)',
            price: `+50% (${utils.formatCurrency(Math.round(basePrice * 0.5))})`
        });
    }
    
    // Revisions adjustment
    const videoRevisions = document.getElementById('videoRevisions').value;
    let revisionMultiplier = 1;
    
    if (videoRevisions === 'unlimited') {
        revisionMultiplier = 1.4;
        breakdownItems.push({
            name: 'Unlimited Revisions',
            price: `+40% (${utils.formatCurrency(Math.round(basePrice * 0.4))})`
        });
    }
    
    // Add client profile adjustment
    if (clientProfile !== 'standard') {
        const profileAdjustmentText = clientProfile === 'startup' ? 'Startup/Small Business Discount' : 
                                     clientProfile === 'corporate' ? 'Corporate Client Premium' : 
                                     'Enterprise Client Premium';
        
        const percentageText = clientProfile === 'startup' ? '-20%' : 
                              clientProfile === 'corporate' ? '+30%' : 
                              '+50%';
        
        breakdownItems.push({
            name: profileAdjustmentText,
            price: percentageText
        });
    }
    
    // Calculate final price
    const subtotal = basePrice + additionalPrice;
    const total = Math.round(subtotal * durationMultiplier * complexityMultiplier * timelineMultiplier * revisionMultiplier * profileMultiplier);
    
    // Store current calculation for saving later
    window.currentQuote = {
        type: 'video',
        details: {
            videoType,
            videoDuration,
            videoComplexity,
            features: getSelectedFeatures('video'),
            videoTimeline,
            videoRevisions,
            clientProfile
        },
        subtotal,
        total
    };
    
    // Display the result
    document.getElementById('totalPrice').textContent = utils.formatCurrency(total);
    document.getElementById('resultDescription').textContent = 'This estimate includes the video production with all requested features.';
    
    // Show take-home amount in INR if currency is not INR
    const currency = document.getElementById('currency').value;
    if (currency !== 'INR') {
        const takeHomeAmount = utils.calculateTakeHome(total, currency);
        document.getElementById('takeHomePrice').textContent = `Take-home amount: ₹${takeHomeAmount.toLocaleString()}`;
        document.getElementById('takeHomePrice').style.display = 'block';
    } else {
        document.getElementById('takeHomePrice').style.display = 'none';
    }
    
    document.getElementById('resultArea').style.display = 'block';
    
    // Generate price breakdown
    generateBreakdown(breakdownItems, total, videoComplexity, complexityMultiplier, '');
}

// Generate price breakdown
function generateBreakdown(breakdownItems, total, complexity, complexityMultiplier, recurringFees) {
    const breakdownContainer = document.getElementById('priceBreakdown');
    breakdownContainer.innerHTML = '';
    
    breakdownItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'breakdown-item';
        div.innerHTML = `<span>${item.name}</span><span>${typeof item.price === 'number' ? utils.formatCurrency(item.price) : item.price}</span>`;
        breakdownContainer.appendChild(div);
    });
    
    // Add complexity adjustment if basic
    if (complexity === 'basic') {
        const div = document.createElement('div');
        div.className = 'breakdown-item';
        div.innerHTML = `<span>Simple Design/Complexity Discount</span><span>-20%</span>`;
        breakdownContainer.appendChild(div);
    }
    
    // Add total
    const totalDiv = document.createElement('div');
    totalDiv.className = 'breakdown-item';
    totalDiv.innerHTML = `<span>TOTAL</span><span>${utils.formatCurrency(total)}${recurringFees || ''}</span>`;
    breakdownContainer.appendChild(totalDiv);
}

// Update client info in the result summary
function updateClientSummary() {
    // Get client info
    const clientName = document.getElementById('client-name').value || 'Client';
    const projectName = document.getElementById('project-name').value || 'Untitled Project';
    
    // Update summary
    document.getElementById('summary-client-name').textContent = clientName;
    document.getElementById('summary-project-name').textContent = projectName;
    document.getElementById('summary-date').textContent = utils.formatDate(new Date());
}

// Get currently selected features for the active service
function getSelectedFeatures(serviceType) {
    const features = [];
    
    if (serviceType === 'web') {
        for (const feature in webFeatureCosts) {
            if (document.getElementById(feature) && document.getElementById(feature).checked) {
                features.push(feature);
            }
        }
    } else if (serviceType === 'design') {
        for (const feature in designFeatureCosts) {
            if (document.getElementById(feature) && document.getElementById(feature).checked) {
                features.push(feature);
            }
        }
    } else if (serviceType === 'video') {
        for (const feature in videoFeatureCosts) {
            if (document.getElementById(feature) && document.getElementById(feature).checked) {
                features.push(feature);
            }
        }
    }
    
    return features;
}

// Apply discount to current quote
function applyDiscount() {
    if (!window.currentQuote) return;
    
    // Get discount details
    const discountAmount = parseFloat(document.getElementById('discount-amount').value);
    const discountType = document.getElementById('discount-type').value;
    
    if (!discountAmount || isNaN(discountAmount) || discountAmount <= 0) {
        utils.showNotification('Please enter a valid discount amount', 'error');
        return;
    }
    
    // Calculate new total
    let newTotal = window.currentQuote.total;
    
    if (discountType === 'percentage') {
        if (discountAmount > 100) {
            utils.showNotification('Percentage discount cannot exceed 100%', 'error');
            return;
        }
        newTotal = Math.round(newTotal * (1 - discountAmount / 100));
    } else { // fixed amount
        if (discountAmount >= newTotal) {
            utils.showNotification('Discount cannot exceed the total amount', 'error');
            return;
        }
        newTotal = newTotal - discountAmount;
    }
    
    // Update the display
    const currency = document.getElementById('currency').value;
    document.getElementById('totalPrice').textContent = utils.formatCurrency(newTotal);
    
    // Add discount to breakdown
    const breakdownContainer = document.getElementById('priceBreakdown');
    
    // Check if discount is already in the breakdown
    const existingDiscount = Array.from(breakdownContainer.querySelectorAll('.breakdown-item')).find(
        item => item.firstChild.textContent.includes('Discount')
    );
    
    if (existingDiscount) {
        existingDiscount.remove();
    }
    
    // Add new discount line before the total
    const discountDiv = document.createElement('div');
    discountDiv.className = 'breakdown-item';
    
    const discountText = discountType === 'percentage' ? 
        `Custom Discount (${discountAmount}%)` : 
        'Custom Discount (Fixed Amount)';
    
    const discountValue = discountType === 'percentage' ? 
        `-${discountAmount}%` : 
        `-${utils.formatCurrency(discountAmount)}`;
    
    discountDiv.innerHTML = `<span>${discountText}</span><span>${discountValue}</span>`;
    
    // Insert before the last item (which is the total)
    breakdownContainer.insertBefore(discountDiv, breakdownContainer.lastChild);
    
    // Update take-home amount
    if (currency !== 'INR') {
        const takeHomeAmount = utils.calculateTakeHome(newTotal, currency);
        document.getElementById('takeHomePrice').textContent = `Take-home amount: ₹${takeHomeAmount.toLocaleString()}`;
    }
    
    // Store the discounted amount
    window.currentQuote.originalTotal = window.currentQuote.total;
    window.currentQuote.total = newTotal;
    window.currentQuote.discount = {
        type: discountType,
        amount: discountAmount
    };
    
    utils.showNotification('Discount applied successfully', 'success');
}

// Function to create and show the rate settings modal content
function showRateSettings() {
    // Get modal and container
    const modal = document.getElementById('rate-settings-modal');
    const container = document.getElementById('rate-settings-container');
    
    // Clear previous content
    container.innerHTML = '';
    
    // Create tabs for different rate categories
    const tabsDiv = document.createElement('div');
    tabsDiv.className = 'tab-buttons settings-tabs';
    tabsDiv.innerHTML = `
        <div class="tab-button active" data-settings-tab="web-rates">Web Development</div>
        <div class="tab-button" data-settings-tab="design-rates">Design</div>
        <div class="tab-button" data-settings-tab="video-rates">Video</div>
        <div class="tab-button" data-settings-tab="client-profiles">Client Profiles</div>
    `;
    container.appendChild(tabsDiv);
    
    // Create content divs for each tab
    const tabContentsDiv = document.createElement('div');
    tabContentsDiv.className = 'settings-tab-contents';
    
    // Web development rates
    const webRatesDiv = document.createElement('div');
    webRatesDiv.id = 'web-rates';
    webRatesDiv.className = 'settings-tab-content active';
    webRatesDiv.innerHTML = '<h3>Web Development Base Rates</h3>';
    
    // Create rate fields for web rates
    for (const key in webBaseRates) {
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        webRatesDiv.innerHTML += `
            <div class="settings-field">
                <label>${label}:</label>
                <input type="number" id="web-rate-${key}" value="${webBaseRates[key]}" min="500" step="500">
            </div>
        `;
    }
    
    webRatesDiv.innerHTML += '<h3>Web Feature Costs</h3>';
    
    // Create rate fields for web features
    for (const key in webFeatureCosts) {
        const el = document.querySelector(`label[for="${key}"]`);
        const label = el ? el.textContent : key.charAt(0).toUpperCase() + key.slice(1);
        webRatesDiv.innerHTML += `
            <div class="settings-field">
                <label>${label}:</label>
                <input type="number" id="web-feature-${key}" value="${webFeatureCosts[key]}" min="100" step="100">
            </div>
        `;
    }
    
    // Design rates
    const designRatesDiv = document.createElement('div');
    designRatesDiv.id = 'design-rates';
    designRatesDiv.className = 'settings-tab-content';
    designRatesDiv.innerHTML = '<h3>Design Base Rates</h3>';
    
    // Create rate fields for design rates
    for (const key in designBaseRates) {
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        designRatesDiv.innerHTML += `
            <div class="settings-field">
                <label>${label}:</label>
                <input type="number" id="design-rate-${key}" value="${designBaseRates[key]}" min="500" step="500">
            </div>
        `;
    }
    
    designRatesDiv.innerHTML += '<h3>Design Feature Costs</h3>';
    
    // Create rate fields for design features
    for (const key in designFeatureCosts) {
        const el = document.querySelector(`label[for="${key}"]`);
        const label = el ? el.textContent : key.charAt(0).toUpperCase() + key.slice(1);
        designRatesDiv.innerHTML += `
            <div class="settings-field">
                <label>${label}:</label>
                <input type="number" id="design-feature-${key}" value="${designFeatureCosts[key]}" min="100" step="100">
            </div>
        `;
    }
    
    // Video rates
    const videoRatesDiv = document.createElement('div');
    videoRatesDiv.id = 'video-rates';
    videoRatesDiv.className = 'settings-tab-content';
    videoRatesDiv.innerHTML = '<h3>Video Base Rates</h3>';
    
    // Create rate fields for video rates
    for (const key in videoBaseRates) {
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        videoRatesDiv.innerHTML += `
            <div class="settings-field">
                <label>${label}:</label>
                <input type="number" id="video-rate-${key}" value="${videoBaseRates[key]}" min="1000" step="1000">
            </div>
        `;
    }
    
    videoRatesDiv.innerHTML += '<h3>Video Feature Costs</h3>';
    
    // Create rate fields for video features
    for (const key in videoFeatureCosts) {
        const el = document.querySelector(`label[for="${key}"]`);
        const label = el ? el.textContent : key.charAt(0).toUpperCase() + key.slice(1);
        videoRatesDiv.innerHTML += `
            <div class="settings-field">
                <label>${label}:</label>
                <input type="number" id="video-feature-${key}" value="${videoFeatureCosts[key]}" min="500" step="500">
            </div>
        `;
    }
    
    // Client profiles
    const clientProfilesDiv = document.createElement('div');
    clientProfilesDiv.id = 'client-profiles';
    clientProfilesDiv.className = 'settings-tab-content';
    clientProfilesDiv.innerHTML = '<h3>Client Profile Multipliers</h3>';
    
    // Create fields for client profile multipliers
    for (const key in clientMultipliers) {
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        const percentage = Math.round((clientMultipliers[key] - 1) * 100);
        const displayValue = percentage >= 0 ? `+${percentage}%` : `${percentage}%`;
        
        clientProfilesDiv.innerHTML += `
            <div class="settings-field">
                <label>${label}:</label>
                <div class="multiplier-input">
                    <input type="range" id="profile-${key}" 
                           value="${clientMultipliers[key]}" 
                           min="0.5" max="2" step="0.05"
                           oninput="document.getElementById('profile-${key}-value').value = Math.round((this.value - 1) * 100) + '%'">
                    <input type="text" id="profile-${key}-value" value="${displayValue}" readonly>
                </div>
            </div>
        `;
    }
    
    // Append all content divs
    tabContentsDiv.appendChild(webRatesDiv);
    tabContentsDiv.appendChild(designRatesDiv);
    tabContentsDiv.appendChild(videoRatesDiv);
    tabContentsDiv.appendChild(clientProfilesDiv);
    
    container.appendChild(tabContentsDiv);
    
    // Add save button
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save Changes';
    saveButton.className = 'save-settings-button';
    saveButton.onclick = saveRateSettings;
    container.appendChild(saveButton);
    
    // Add event listeners for tabs
    tabsDiv.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all tabs
            tabsDiv.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            tabContentsDiv.querySelectorAll('.settings-tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            const tabId = this.getAttribute('data-settings-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Add CSS for settings modal
    if (!document.getElementById('settings-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'settings-modal-styles';
        style.textContent = `
            .settings-tabs {
                margin-bottom: 20px;
            }
            .settings-tab-content {
                display: none;
                max-height: 500px;
                overflow-y: auto;
                padding-right: 10px;
            }
            .settings-tab-content.active {
                display: block;
            }
            .settings-field {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
                justify-content: space-between;
            }
            .settings-field label {
                flex: 0 0 180px;
                margin-bottom: 0;
            }
            .settings-field input[type="number"] {
                width: 100px;
            }
            .multiplier-input {
                display: flex;
                align-items: center;
                flex: 1;
            }
            .multiplier-input input[type="range"] {
                flex: 1;
                margin-right: 10px;
            }
            .multiplier-input input[type="text"] {
                width: 60px;
                text-align: center;
            }
            .save-settings-button {
                margin-top: 20px;
                width: 100%;
                padding: 10px;
                background-color: var(--success-color);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Show the modal
    modal.style.display = 'block';
}

// Save rate settings
function saveRateSettings() {
    // Save web rates
    for (const key in webBaseRates) {
        const input = document.getElementById(`web-rate-${key}`);
        if (input) {
            webBaseRates[key] = parseInt(input.value);
        }
    }
    
    // Save web feature costs
    for (const key in webFeatureCosts) {
        const input = document.getElementById(`web-feature-${key}`);
        if (input) {
            webFeatureCosts[key] = parseInt(input.value);
        }
    }
    
    // Save design rates
    for (const key in designBaseRates) {
        const input = document.getElementById(`design-rate-${key}`);
        if (input) {
            designBaseRates[key] = parseInt(input.value);
        }
    }
    
    // Save design feature costs
    for (const key in designFeatureCosts) {
        const input = document.getElementById(`design-feature-${key}`);
        if (input) {
            designFeatureCosts[key] = parseInt(input.value);
        }
    }
    
    // Save video rates
    for (const key in videoBaseRates) {
        const input = document.getElementById(`video-rate-${key}`);
        if (input) {
            videoBaseRates[key] = parseInt(input.value);
        }
    }
    
    // Save video feature costs
    for (const key in videoFeatureCosts) {
        const input = document.getElementById(`video-feature-${key}`);
        if (input) {
            videoFeatureCosts[key] = parseInt(input.value);
        }
    }
    
    // Save client profile multipliers
    for (const key in clientMultipliers) {
        const input = document.getElementById(`profile-${key}`);
        if (input) {
            clientMultipliers[key] = parseFloat(input.value);
        }
    }
    
    // Save settings to local storage if available
    try {
        localStorage.setItem('rateSettings', JSON.stringify({
            webBaseRates,
            webFeatureCosts,
            designBaseRates,
            designFeatureCosts,
            videoBaseRates,
            videoFeatureCosts,
            clientMultipliers
        }));
    } catch (e) {
        console.warn('Could not save settings to local storage', e);
    }
    
    // Hide the modal
    document.getElementById('rate-settings-modal').style.display = 'none';
    
    // Show notification
    utils.showNotification('Rate settings saved successfully', 'success');
    
    // If there's an active quote, recalculate
    if (window.currentQuote && document.getElementById('resultArea').style.display !== 'none') {
        if (window.currentQuote.type === 'web') {
            calculateWebPrice();
        } else if (window.currentQuote.type === 'design') {
            calculateDesignPrice();
        } else if (window.currentQuote.type === 'video') {
            calculateVideoPrice();
        }
    }
}

// Load saved rate settings
function loadRateSettings() {
    try {
        const savedSettings = JSON.parse(localStorage.getItem('rateSettings'));
        if (savedSettings) {
            // Update all rate variables with saved values
            Object.assign(webBaseRates, savedSettings.webBaseRates);
            Object.assign(webFeatureCosts, savedSettings.webFeatureCosts);
            Object.assign(designBaseRates, savedSettings.designBaseRates);
            Object.assign(designFeatureCosts, savedSettings.designFeatureCosts);
            Object.assign(videoBaseRates, savedSettings.videoBaseRates);
            Object.assign(videoFeatureCosts, savedSettings.videoFeatureCosts);
            Object.assign(clientMultipliers, savedSettings.clientMultipliers);
            
            utils.showNotification('Loaded saved rate settings', 'info');
        }
    } catch (e) {
        console.warn('Could not load settings from local storage', e);
    }
}

// Export calculator functions to global scope
window.calculator = {
    fetchExchangeRates,
    calculateWebPrice,
    calculateDesignPrice,
    calculateVideoPrice,
    showRateSettings,
    applyDiscount,
    exchangeRates
};
