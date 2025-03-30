/**
 * PDF Generator Module
 * Handles generating PDF quotes for clients
 * 
 * Note: This implementation uses a lightweight approach without requiring additional libraries.
 * For production use, you might want to add jsPDF or similar for more advanced PDF generation.
 */

// Initialize PDF generator
function initPDFGenerator() {
    // This would normally set up any PDF generation libraries
    console.log('PDF Generator initialized');
}

// Generate a PDF quote from the current quote
function generateQuotePDF() {
    if (!window.currentQuote) {
        utils.showNotification('No quote available to export as PDF', 'error');
        return;
    }
    
    // Get client and project info
    const clientName = document.getElementById('client-name').value || 'Client';
    const clientEmail = document.getElementById('client-email').value || '';
    const clientCompany = document.getElementById('client-company').value || '';
    const projectName = document.getElementById('project-name').value || 'Untitled Project';
    const quoteDate = document.getElementById('summary-date').textContent || utils.formatDate(new Date());
    
    // Get quote details
    const quoteType = window.currentQuote.type;
    const quoteTotal = document.getElementById('totalPrice').textContent;
    const breakdownItems = getBreakdownItems();
    const clientNotes = document.getElementById('client-notes').value || '';
    
    // Create a printable HTML representation of the quote
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
        utils.showNotification('Pop-up blocked. Please allow pop-ups and try again.', 'error');
        return;
    }
    
    // Set the HTML content of the new window
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Quote for ${clientName} - ${projectName}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                
                .quote-header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                
                .quote-header h1 {
                    color: #2c3e50;
                    margin-bottom: 10px;
                }
                
                .company-info {
                    text-align: left;
                    margin-bottom: 30px;
                }
                
                .client-info {
                    text-align: right;
                    margin-bottom: 30px;
                }
                
                .info-container {
                    display: flex;
                    justify-content: space-between;
                }
                
                .quote-details {
                    margin-bottom: 30px;
                }
                
                .quote-details h2 {
                    color: #2c3e50;
                    border-bottom: 2px solid #3498db;
                    padding-bottom: 5px;
                    margin-bottom: 15px;
                }
                
                .quote-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px dashed #ddd;
                }
                
                .quote-total {
                    display: flex;
                    justify-content: space-between;
                    padding: 15px 0;
                    border-top: 2px solid #2c3e50;
                    font-weight: bold;
                    font-size: 1.2em;
                    margin-top: 10px;
                }
                
                .quote-notes {
                    margin-top: 30px;
                    border: 1px solid #ddd;
                    padding: 15px;
                    background-color: #f9f9f9;
                }
                
                .quote-footer {
                    margin-top: 50px;
                    text-align: center;
                    font-size: 0.9em;
                    color: #7f8c8d;
                }
                
                @media print {
                    body {
                        padding: 0;
                    }
                    
                    .no-print {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="quote-header">
                <h1>QUOTE</h1>
                <p>Reference: Q-${Date.now().toString().slice(-6)}</p>
            </div>
            
            <div class="info-container">
                <div class="company-info">
                    <h3>From:</h3>
                    <p>Your Company Name</p>
                    <p>Kurukshetra Town</p>
                    <p>Email: your.email@example.com</p>
                    <p>Phone: +91 1234567890</p>
                </div>
                
                <div class="client-info">
                    <h3>To:</h3>
                    <p>${clientName}</p>
                    ${clientCompany ? `<p>${clientCompany}</p>` : ''}
                    ${clientEmail ? `<p>Email: ${clientEmail}</p>` : ''}
                </div>
            </div>
            
            <div class="quote-details">
                <h2>Project Details</h2>
                <p><strong>Project Name:</strong> ${projectName}</p>
                <p><strong>Date:</strong> ${quoteDate}</p>
                <p><strong>Service Type:</strong> ${getServiceTypeName(quoteType)}</p>
            </div>
            
            <div class="quote-details">
                <h2>Quote Breakdown</h2>
                ${breakdownItems.map(item => `
                    <div class="quote-item">
                        <span>${item.name}</span>
                        <span>${item.value}</span>
                    </div>
                `).join('')}
                
                <div class="quote-total">
                    <span>TOTAL</span>
                    <span>${quoteTotal}</span>
                </div>
            </div>
            
            ${clientNotes ? `
                <div class="quote-notes">
                    <h3>Notes:</h3>
                    <p>${clientNotes.replace(/\n/g, '<br>')}</p>
                </div>
            ` : ''}
            
            <div class="quote-details">
                <h2>Terms & Conditions</h2>
                <ul>
                    <li>This quote is valid for 30 days from the date of issue.</li>
                    <li>50% advance payment is required to begin the project.</li>
                    <li>Remaining payment is due upon project completion.</li>
                    <li>Project timeline will be agreed upon after initial consultation.</li>
                    <li>Changes beyond the scope defined in this quote may incur additional charges.</li>
                </ul>
            </div>
            
            <div class="quote-footer">
                <p>Thank you for your business!</p>
            </div>
            
            <div class="no-print" style="margin-top: 30px; text-align: center;">
                <button onclick="window.print();" style="padding: 10px 20px; background-color: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">Print/Save as PDF</button>
            </div>
        </body>
        </html>
    `);
    
    // Close the document for writing
    printWindow.document.close();
    
    utils.showNotification('Quote exported successfully. Print or save as PDF from the new window.', 'success');
}

// Get breakdown items from the current view
function getBreakdownItems() {
    const items = [];
    const breakdownDiv = document.getElementById('priceBreakdown');
    
    if (!breakdownDiv) return items;
    
    const itemDivs = breakdownDiv.querySelectorAll('.breakdown-item');
    
    itemDivs.forEach(div => {
        const spans = div.querySelectorAll('span');
        if (spans.length >= 2) {
            items.push({
                name: spans[0].textContent,
                value: spans[1].textContent
            });
        }
    });
    
    return items;
}

// Get friendly name for service type
function getServiceTypeName(type) {
    switch (type) {
        case 'web':
            return 'Web Development';
        case 'design':
            return 'Graphic Design';
        case 'video':
            return 'Video Production';
        default:
            return 'Professional Services';
    }
}

// Export PDF generator functions to global scope
window.pdfGenerator = {
    initPDFGenerator,
    generateQuotePDF
};
