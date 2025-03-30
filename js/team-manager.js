/**
 * Team Manager Module
 * Handles team member collaboration and revenue sharing calculations
 */

// Store for team members
let teamMembers = [];

// Initialize team manager
function initTeamManager() {
    // Load data from Firebase if logged in
    if (auth.currentUser) {
        loadTeamFromFirebase();
    } else {
        // Load from localStorage as fallback
        loadTeamFromLocalStorage();
    }
    
    // Set up event listeners
    setupTeamManagerListeners();
}

// Set up event listeners for team-related actions
function setupTeamManagerListeners() {
    // This will be expanded when team UI elements are added
}

// Load team from localStorage
function loadTeamFromLocalStorage() {
    try {
        const savedTeam = JSON.parse(localStorage.getItem('freelancer_team'));
        if (savedTeam && Array.isArray(savedTeam)) {
            teamMembers = savedTeam;
        }
    } catch (e) {
        console.warn('Could not load team from localStorage', e);
    }
}

// Save team to localStorage
function saveTeamToLocalStorage() {
    try {
        localStorage.setItem('freelancer_team', JSON.stringify(teamMembers));
    } catch (e) {
        console.warn('Could not save team to localStorage', e);
    }
}

// Load team from Firebase
function loadTeamFromFirebase() {
    if (!auth.currentUser) return;
    
    const uid = auth.currentUser.uid;
    
    db.collection('users').doc(uid).collection('team').get()
        .then(snapshot => {
            const loadedTeam = [];
            snapshot.forEach(doc => {
                loadedTeam.push(doc.data());
            });
            
            if (loadedTeam.length > 0) {
                teamMembers = loadedTeam;
                utils.showNotification('Team data loaded', 'success');
            }
        })
        .catch(error => {
            console.error('Error loading team from Firebase:', error);
            // Fallback to localStorage
            loadTeamFromLocalStorage();
        });
}

// Save team to Firebase
function saveTeamToFirebase() {
    if (!auth.currentUser) return;
    
    const uid = auth.currentUser.uid;
    
    // Get a batch reference
    const batch = db.batch();
    
    // Get the team collection reference
    const teamRef = db.collection('users').doc(uid).collection('team');
    
    // Add each team member to the batch
    teamMembers.forEach(member => {
        batch.set(teamRef.doc(member.id), member);
    });
    
    // Commit the batch
    batch.commit()
        .catch(error => {
            console.error('Error saving team to Firebase:', error);
            utils.showNotification('Failed to save team data', 'error');
        });
}

// Add a new team member
function addTeamMember(name, email, role, rate, sharePercentage) {
    // Validate inputs
    if (!name || name.trim() === '') {
        utils.showNotification('Team member name is required', 'error');
        return false;
    }
    
    if (email && !utils.isValidEmail(email)) {
        utils.showNotification('Please enter a valid email address', 'error');
        return false;
    }
    
    if (!role || role.trim() === '') {
        utils.showNotification('Team member role is required', 'error');
        return false;
    }
    
    if (isNaN(rate) || rate <= 0) {
        utils.showNotification('Please enter a valid hourly rate', 'error');
        return false;
    }
    
    if (isNaN(sharePercentage) || sharePercentage <= 0 || sharePercentage > 100) {
        utils.showNotification('Please enter a valid share percentage (1-100)', 'error');
        return false;
    }
    
    // Create new team member object
    const newMember = {
        id: utils.generateUniqueId(),
        name,
        email: email || '',
        role,
        rate: parseFloat(rate),
        sharePercentage: parseFloat(sharePercentage),
        created: new Date()
    };
    
    // Add to team members array
    teamMembers.push(newMember);
    
    // Save team
    saveTeamToStorage();
    
    utils.showNotification(`Team member ${name} added successfully`, 'success');
    return true;
}

// Update an existing team member
function updateTeamMember(id, updates) {
    // Find the team member
    const memberIndex = teamMembers.findIndex(m => m.id === id);
    
    if (memberIndex === -1) {
        utils.showNotification('Team member not found', 'error');
        return false;
    }
    
    // Validate email if provided
    if (updates.email && !utils.isValidEmail(updates.email)) {
        utils.showNotification('Please enter a valid email address', 'error');
        return false;
    }
    
    // Validate rate if provided
    if (updates.rate && (isNaN(updates.rate) || parseFloat(updates.rate) <= 0)) {
        utils.showNotification('Please enter a valid hourly rate', 'error');
        return false;
    }
    
    // Validate share percentage if provided
    if (updates.sharePercentage && (isNaN(updates.sharePercentage) || parseFloat(updates.sharePercentage) <= 0 || parseFloat(updates.sharePercentage) > 100)) {
        utils.showNotification('Please enter a valid share percentage (1-100)', 'error');
        return false;
    }
    
    // Update the team member
    Object.assign(teamMembers[memberIndex], updates);
    
    // Save team
    saveTeamToStorage();
    
    utils.showNotification(`Team member ${teamMembers[memberIndex].name} updated successfully`, 'success');
    return true;
}

// Remove a team member
function removeTeamMember(id) {
    // Find the team member
    const memberIndex = teamMembers.findIndex(m => m.id === id);
    
    if (memberIndex === -1) {
        utils.showNotification('Team member not found', 'error');
        return false;
    }
    
    // Confirm removal
    const memberName = teamMembers[memberIndex].name;
    if (!confirm(`Are you sure you want to remove team member ${memberName}?`)) {
        return false;
    }
    
    // Remove the team member
    teamMembers.splice(memberIndex, 1);
    
    // Save team
    saveTeamToStorage();
    
    utils.showNotification(`Team member ${memberName} removed successfully`, 'success');
    return true;
}

// Calculate revenue sharing for a project
function calculateRevenueSharing(projectTotal) {
    if (!projectTotal || isNaN(projectTotal) || projectTotal <= 0) {
        utils.showNotification('Please enter a valid project total', 'error');
        return null;
    }
    
    if (teamMembers.length === 0) {
        utils.showNotification('No team members found. Please add team members first.', 'error');
        return null;
    }
    
    // Calculate total share percentage
    const totalSharePercentage = teamMembers.reduce((total, member) => total + member.sharePercentage, 0);
    
    // Check if total share percentage exceeds 100%
    if (totalSharePercentage > 100) {
        utils.showNotification('Total share percentage exceeds 100%. Please adjust team member shares.', 'error');
        return null;
    }
    
    // Calculate shares
    const shares = teamMembers.map(member => {
        const amount = (member.sharePercentage / 100) * projectTotal;
        return {
            id: member.id,
            name: member.name,
            role: member.role,
            percentage: member.sharePercentage,
            amount: Math.round(amount)
        };
    });
    
    // Calculate company share (if any)
    const companySharePercentage = 100 - totalSharePercentage;
    if (companySharePercentage > 0) {
        const companyAmount = (companySharePercentage / 100) * projectTotal;
        shares.push({
            id: 'company',
            name: 'Company',
            role: 'Business',
            percentage: companySharePercentage,
            amount: Math.round(companyAmount)
        });
    }
    
    return shares;
}

// Helper function to decide where to save team data
function saveTeamToStorage() {
    if (auth.currentUser) {
        saveTeamToFirebase();
    } else {
        saveTeamToLocalStorage();
    }
}

// Get all team members
function getTeamMembers() {
    return [...teamMembers];
}

// Export team manager functions to global scope
window.teamManager = {
    initTeamManager,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    calculateRevenueSharing,
    getTeamMembers
};
