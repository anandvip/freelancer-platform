/**
 * Enhanced Team Manager Module
 * Handles team member collaboration, skill tracking, and revenue sharing calculations
 * with support for international teams
 */

// Store for team members
let teamMembers = [];

// Store for skill categories
const skillCategories = [
    'webDevelopment', 'design', 'videoProduction', 
    'marketing', 'seo', 'contentWriting', 'projectManagement'
];

// Store for skill levels
const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];

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
    
    // Log initialization
    if (typeof logEvent === 'function') {
        logEvent('TeamManager:Init', 'Team manager initialized');
    }
}

// Set up event listeners for team-related actions
function setupTeamManagerListeners() {
    // Add team member button
    const addTeamBtn = document.getElementById('add-team-member');
    if (addTeamBtn) {
        addTeamBtn.addEventListener('click', showAddTeamMemberModal);
    }
    
    // Calculate revenue sharing button
    const calcSharesBtn = document.getElementById('calculate-revenue-sharing');
    if (calcSharesBtn) {
        calcSharesBtn.addEventListener('click', showRevenueSharingCalculator);
    }
    
    // Save team member button
    const saveTeamBtn = document.getElementById('save-team-member');
    if (saveTeamBtn) {
        saveTeamBtn.addEventListener('click', saveTeamMember);
    }
    
    // Calculate shares button
    const calculateBtn = document.getElementById('calculate-shares');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateShares);
    }
    
    // View team button (in menu or elsewhere)
    const viewTeamBtn = document.getElementById('view-team');
    if (viewTeamBtn) {
        viewTeamBtn.addEventListener('click', showTeamManager);
    }
}

// Load team from localStorage
function loadTeamFromLocalStorage() {
    try {
        const savedTeam = JSON.parse(localStorage.getItem('freelancer_team'));
        if (savedTeam && Array.isArray(savedTeam)) {
            teamMembers = savedTeam;
            
            if (typeof logEvent === 'function') {
                logEvent('TeamManager:Load', `Loaded ${teamMembers.length} team members from localStorage`);
            }
        }
    } catch (e) {
        console.warn('Could not load team from localStorage', e);
    }
}

// Save team to localStorage
function saveTeamToLocalStorage() {
    try {
        localStorage.setItem('freelancer_team', JSON.stringify(teamMembers));
        
        if (typeof logEvent === 'function') {
            logEvent('TeamManager:Save', `Saved ${teamMembers.length} team members to localStorage`);
        }
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
                
                if (typeof utils !== 'undefined' && typeof utils.showNotification === 'function') {
                    utils.showNotification('Team data loaded', 'success');
                }
                
                if (typeof logEvent === 'function') {
                    logEvent('TeamManager:Load', `Loaded ${teamMembers.length} team members from Firebase`);
                }
                
                // Show team members if the section is visible
                displayTeamMembers();
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
        .then(() => {
            if (typeof logEvent === 'function') {
                logEvent('TeamManager:Save', `Saved ${teamMembers.length} team members to Firebase`);
            }
        })
        .catch(error => {
            console.error('Error saving team to Firebase:', error);
            
            if (typeof utils !== 'undefined' && typeof utils.showNotification === 'function') {
                utils.showNotification('Failed to save team data', 'error');
            }
        });
}

// Show the team manager interface
function showTeamManager() {
    const teamSection = document.getElementById('team-manager');
    if (teamSection) {
        teamSection.style.display = 'block';
        
        // Display team members
        displayTeamMembers();
        
        if (typeof logEvent === 'function') {
            logEvent('TeamManager:Show', 'Team manager interface displayed');
        }
    }
}

// Show the add team member modal
function showAddTeamMemberModal() {
    const modal = document.getElementById('team-member-modal');
    if (modal) {
        // Clear the form
        document.getElementById('team-modal-title').textContent = 'Add Team Member';
        document.getElementById('team-member-id').value = '';
        document.getElementById('team-member-name').value = '';
        document.getElementById('team-member-email').value = '';
        document.getElementById('team-member-country').value = '';
        document.getElementById('team-member-timezone').value = '';
        document.getElementById('team-member-role').value = 'developer';
        document.getElementById('team-member-rate').value = '500';
        document.getElementById('team-member-share').value = '10';
        
        // Clear skills
        const skillsContainer = document.getElementById('team-member-skills');
        if (skillsContainer) {
            skillsContainer.innerHTML = '';
            
            // Add skill inputs
            skillCategories.forEach(category => {
                const skillRow = document.createElement('div');
                skillRow.className = 'skill-row';
                
                const skillLabel = document.createElement('label');
                skillLabel.textContent = formatSkillCategory(category) + ':';
                
                const skillSelect = document.createElement('select');
                skillSelect.id = `skill-${category}`;
                skillSelect.name = `skill-${category}`;
                
                // Add options for each skill level
                skillSelect.innerHTML = `
                    <option value="">None</option>
                    ${skillLevels.map(level => 
                        `<option value="${level}">${formatSkillLevel(level)}</option>`
                    ).join('')}
                `;
                
                skillRow.appendChild(skillLabel);
                skillRow.appendChild(skillSelect);
                
                skillsContainer.appendChild(skillRow);
            });
        }
        
        modal.style.display = 'block';
        
        if (typeof logEvent === 'function') {
            logEvent('TeamManager:Modal', 'Add team member modal displayed');
        }
    }
}

// Format skill category for display
function formatSkillCategory(category) {
    return category
        .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
        .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
}

// Format skill level for display
function formatSkillLevel(level) {
    switch (level) {
        case 'beginner': return 'Beginner';
        case 'intermediate': return 'Intermediate';
        case 'advanced': return 'Advanced';
        case 'expert': return 'Expert';
        default: return level;
    }
}

// Save the team member from the modal
function saveTeamMember() {
    const id = document.getElementById('team-member-id').value;
    const name = document.getElementById('team-member-name').value;
    const email = document.getElementById('team-member-email').value;
    const country = document.getElementById('team-member-country').value;
    const timezone = document.getElementById('team-member-timezone').value;
    const role = document.getElementById('team-member-role').value;
    const rate = document.getElementById('team-member-rate').value;
    const share = document.getElementById('team-member-share').value;
    
    // Validate inputs
    if (!name || name.trim() === '') {
        if (typeof utils !== 'undefined' && typeof utils.showNotification === 'function') {
            utils.showNotification('Team member name is required', 'error');
        } else {
            alert('Team member name is required');
        }
        return false;
    }
    
    if (email && !isValidEmail(email)) {
        if (typeof utils !== 'undefined' && typeof utils.showNotification === 'function') {
            utils.showNotification('Please enter a valid email address', 'error');
        } else {
            alert('Please enter a valid email address');
        }
        return false;
    }
    
    if (isNaN(rate) || parseFloat(rate) <= 0) {
        if (typeof utils !== 'undefined' && typeof utils.showNotification === 'function') {
            utils.showNotification('Please enter a valid hourly rate', 'error');
        } else {
            alert('Please enter a valid hourly rate');
        }
        return false;
    }
    
    if (isNaN(share) || parseFloat(share) <= 0 || parseFloat(share) > 100) {
        if (typeof utils !== 'undefined' && typeof utils.showNotification === 'function') {
            utils.showNotification('Please enter a valid share percentage (1-100)', 'error');
        } else {
            alert('Please enter a valid share percentage (1-100)');
        }
        return false;
    }
    
    // Collect skills
    const skills = {};
    skillCategories.forEach(category => {
        const skillSelect = document.getElementById(`skill-${category}`);
        if (skillSelect && skillSelect.value) {
            skills[category] = skillSelect.value;
        }
    });
    
    // Create or update team member
    if (id) {
        // Update existing team member
        updateTeamMember(id, {
            name,
            email,
            country,
            timezone,
            role,
            rate: parseFloat(rate),
            sharePercentage: parseFloat(share),
            skills,
            updated: new Date()
        });
    } else {
        // Create new team member object
        const newMember = {
            id: generateUniqueId(),
            name,
            email: email || '',
            country: country || '',
            timezone: timezone || '',
            role,
            rate: parseFloat(rate),
            sharePercentage: parseFloat(share),
            skills,
            created: new Date(),
            updated: new Date(),
            active: true,
            projectsCompleted: 0,
            totalEarnings: 0
        };
        
        // Add to team members array
        teamMembers.push(newMember);
        
        // Save team
        saveTeamToStorage();
        
        if (typeof utils !== 'undefined' && typeof utils.showNotification === 'function') {
            utils.showNotification(`Team member ${name} added successfully`, 'success');
        } else {
            alert(`Team member ${name} added successfully`);
        }
        
        if (typeof logEvent === 'function') {
            logEvent('TeamManager:Add', `Added team member: ${name} (${role})`);
        }
    }
    
    // Close modal
    document.getElementById('team-member-modal').style.display = 'none';
    
    // Refresh team members display
    displayTeamMembers();
    
    return true;
}

// Update an existing team member
function updateTeamMember(id, updates) {
    // Find the team member
    const memberIndex = teamMembers.findIndex(m => m.id === id);
    
    if (memberIndex === -1) {
        if (typeof utils !== 'undefined' && typeof utils.showNotification === 'function') {
            utils.showNotification('Team member not found', 'error');
        } else {
            alert('Team member not found');
        }
        return false;
    }
    
    // Validate email if provided
    if (updates.email && !isValidEmail(updates.email)) {
        if (typeof utils !== 'undefined' && typeof utils.showNotification === 'function') {
            utils.showNotification('Please enter a valid email address', 'error');
        } else {
            alert('Please enter a valid email address');
        }
        return false;
    }
    
    // Validate rate if provided
    if (updates.rate && (isNaN(updates.rate) || parseFloat(updates.rate) <= 0)) {
        if (typeof utils !== 'undefined' && typeof utils.showNotification === 'function') {
            utils.showNotification('Please enter a valid hourly rate', 'error');
        } else {
            alert('Please enter a valid hourly rate');
        }
        return false;
    }
    
    // Validate share percentage if provided
    if (updates.sharePercentage && (isNaN(updates.sharePercentage) || parseFloat(updates.sharePercentage) <= 0 || parseFloat(updates.sharePercentage) > 100)) {
        if (typeof utils !== 'undefined' && typeof utils.showNotification === 'function') {
            utils.showNotification('Please enter a valid share percentage (1-100)', 'error');
        } else {
            alert('Please enter a valid share percentage (1-100)');
        }
        return false;
    }
    
    // Update the team member
    Object.assign(teamMembers[memberIndex], updates);
    
    // Save team
    saveTeamToStorage();
    
    if (typeof utils !== 'undefined' && typeof utils.showNotification === 'function') {
        utils.showNotification(`Team member ${teamMembers[memberIndex].name} updated successfully`, 'success');
    } else {
        alert(`Team member ${teamMembers[memberIndex].name} updated successfully`);
    }
    
    if (typeof logEvent === 'function') {
        logEvent('TeamManager:Update', `Updated team member: ${teamMembers[memberIndex].name}`);
    }
    
    return true;
}

// Remove a team member
function removeTeamMember(id) {
    // Find the team member
    const memberIndex = teamMembers.findIndex(m => m.id === id);
    
    if (memberIndex === -1) {
        if (typeof utils !== 'undefined' && typeof utils.showNotification === 'function') {
            utils.showNotification('Team member not found', 'error');
        } else {
            alert('Team member not found');
        }
        return false;
    }
    
    // Confirm removal
    const memberName = teamMembers[memberIndex].name;
    if (!confirm(`Are you sure you want to remove team member ${memberName}?`)) {
        return false;
    }
    
    if (typeof logEvent === 'function') {
        logEvent('TeamManager:Remove', `Removed team member: ${memberName}`);
    }
    
    // Remove the team member
    teamMembers.splice(memberIndex, 1);
    
    // Save team
    saveTeamToStorage();
    
    if (typeof utils !== 'undefined' && typeof utils.showNotification === 'function') {
        utils.showNotification(`Team member ${memberName} removed successfully`, 'success');
    } else {
        alert(`Team member ${memberName} removed successfully`);
    }
    
    return true;
}

// Toggle team member active status
function toggleTeamMemberStatus(id) {
    // Find the team member
    const memberIndex = teamMembers.findIndex(m => m.id === id);
    
    if (memberIndex === -1) {
        if (typeof utils !== 'undefined' && typeof utils.showNotification === 'function') {
            utils.showNotification('Team member not found', 'error');
        } else {
            alert('Team member not found');
        }
        return false;
    }
    
    // Toggle status
    teamMembers[memberIndex].active = !teamMembers[memberIndex].active;
    
    // Save team
    saveTeamToStorage();
    
    const status = teamMembers[memberIndex].active ? 'active' : 'inactive';
    
    if (typeof utils !== 'undefined' && typeof utils.showNotification === 'function') {
        utils.showNotification(`Team member ${teamMembers[memberIndex].name} set to ${status}`, 'success');
    } else {
        alert(`Team member ${teamMembers[memberIndex].name} set to ${status}`);
    }
    
    if (typeof logEvent === 'function') {
        logEvent('TeamManager:ToggleStatus', `${teamMembers[memberIndex].name} set to ${status}`);
    }
    
    return true;
}

// Show revenue sharing calculator
function showRevenueSharingCalculator() {
    const revenueSection = document.getElementById('revenue-sharing-results');
    if (revenueSection) {
        revenueSection.style.display = 'block';
        
        // Show team manager if it's hidden
        document.getElementById('team-manager').style.display = 'block';
        
        if (typeof logEvent === 'function') {
            logEvent('TeamManager:ShowRevenue', 'Revenue sharing calculator displayed');
        }
    }
}

// Calculate revenue sharing for a project
function calculateShares() {
    const projectTotal = parseFloat(document.getElementById('project-total').value);
    const currency = document.getElementById('project-currency') ? 
                     document.getElementById('project-currency').value : 'INR';
    
    if (!projectTotal || isNaN(projectTotal) || projectTotal <= 0) {
        if (typeof utils !== 'undefined' && typeof utils.showNotification === 'function') {
            utils.showNotification('Please enter a valid project total', 'error');
        } else {
            alert('Please enter a valid project total');
        }
        return null;
    }
    
    // Convert to INR if needed
    let totalInr = projectTotal;
    if (currency !== 'INR' && typeof window.calculator !== 'undefined' && typeof window.calculator.exchangeRates !== 'undefined') {
        const exchangeRates = window.calculator.exchangeRates;
        totalInr = Math.round(projectTotal * exchangeRates[currency]);
    }
    
    if (teamMembers.length === 0) {
        if (typeof utils !== 'undefined' && typeof utils.showNotification === 'function') {
            utils.showNotification('No team members found. Please add team members first.', 'error');
        } else {
            alert('No team members found. Please add team members first.');
        }
        return null;
    }
    
    // Calculate total share percentage for active members only
    const activeMembers = teamMembers.filter(member => member.active);
    
    if (activeMembers.length === 0) {
        if (typeof utils !== 'undefined' && typeof utils.showNotification === 'function') {
            utils.showNotification('No active team members found. Please activate team members first.', 'error');
        } else {
            alert('No active team members found. Please activate team members first.');
        }
        return null;
    }
    
    const totalSharePercentage = activeMembers.reduce((total, member) => total + member.sharePercentage, 0);
    
    // Check if total share percentage exceeds 100%
    if (totalSharePercentage > 100) {
        if (typeof utils !== 'undefined' && typeof utils.showNotification === 'function') {
            utils.showNotification('Total share percentage exceeds 100%. Please adjust team member shares.', 'error');
        } else {
            alert('Total share percentage exceeds 100%. Please adjust team member shares.');
        }
        return null;
    }
    
    // Calculate shares for active members only
    const shares = activeMembers.map(member => {
        const amount = (member.sharePercentage / 100) * totalInr;
        
        // Calculate local equivalent if international team member
        let localEquivalent = null;
        if (member.country && member.country !== 'India' && currency !== 'INR') {
            if (typeof window.calculator !== 'undefined' && typeof window.calculator.exchangeRates !== 'undefined') {
                const memberAmount = (member.sharePercentage / 100) * projectTotal;
                localEquivalent = {
                    currency,
                    amount: Math.round(memberAmount)
                };
            }
        }
        
        return {
            id: member.id,
            name: member.name,
            role: member.role,
            country: member.country,
            percentage: member.sharePercentage,
            amount: Math.round(amount),
            localEquivalent
        };
    });
    
    // Calculate company share (if any)
    const companySharePercentage = 100 - totalSharePercentage;
    if (companySharePercentage > 0) {
        const companyAmount = (companySharePercentage / 100) * totalInr;
        shares.push({
            id: 'company',
            name: 'Company',
            role: 'Business',
            percentage: companySharePercentage,
            amount: Math.round(companyAmount)
        });
    }
    
    if (typeof logEvent === 'function') {
        logEvent('TeamManager:CalculateShares', `Calculated revenue sharing for ${currency}${projectTotal} (₹${totalInr}) among ${activeMembers.length} members`);
    }
    
    // Display shares breakdown
    displaySharesBreakdown(shares, currency, projectTotal, totalInr);
    
    return shares;
}

// Display shares breakdown
function displaySharesBreakdown(shares, currency, projectTotal, totalInr) {
    const container = document.getElementById('shares-breakdown');
    
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // Add project total header
    const totalHeader = document.createElement('div');
    totalHeader.className = 'share-header';
    
    if (currency !== 'INR') {
        totalHeader.innerHTML = `
            <p><strong>Project Total:</strong> ${currency}${projectTotal.toLocaleString()} (₹${totalInr.toLocaleString()})</p>
        `;
    } else {
        totalHeader.innerHTML = `
            <p><strong>Project Total:</strong> ₹${totalInr.toLocaleString()}</p>
        `;
    }
    
    container.appendChild(totalHeader);
    
    // Add each share
    shares.forEach(share => {
        const div = document.createElement('div');
        div.className = 'share-item';
        
        let shareText = `
            <span>${share.name} (${share.role}) - ${share.percentage}%</span>
            <span>₹${share.amount.toLocaleString()}</span>
        `;
        
        // Add local equivalent if available
        if (share.localEquivalent) {
            shareText = `
                <div>
                    <span>${share.name} (${share.role}, ${share.country}) - ${share.percentage}%</span>
                    <div class="share-details">
                        <span>₹${share.amount.toLocaleString()}</span>
                        <span class="local-equivalent">(${share.localEquivalent.currency}${share.localEquivalent.amount.toLocaleString()} local equivalent)</span>
                    </div>
                </div>
            `;
        }
        
        div.innerHTML = shareText;
        
        container.appendChild(div);
    });
}

// Find team members with specific skills
function findTeamMembersWithSkills(skillRequirements) {
    // Example: skillRequirements = { webDevelopment: 'advanced', design: 'intermediate' }
    const matches = teamMembers.filter(member => {
        if (!member.active) return false;
        
        // Check if member has all required skills at or above the specified level
        return Object.entries(skillRequirements).every(([skill, requiredLevel]) => {
            const memberSkillLevel = member.skills && member.skills[skill];
            if (!memberSkillLevel) return false;
            
            // Compare skill levels
            return compareSkillLevels(memberSkillLevel, requiredLevel) >= 0;
        });
    });
    
    return matches;
}

// Compare skill levels (returns negative if a < b, 0 if equal, positive if a > b)
function compareSkillLevels(a, b) {
    const levels = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    return levels[a] - levels[b];
}

// Get team members in a specific time zone range
function getTeamMembersInTimeZoneRange(targetTimeZone, rangeHours = 3) {
    // Convert time zones to numbers for comparison
    const targetHours = parseTimeZone(targetTimeZone);
    
    if (targetHours === null) return [];
    
    return teamMembers.filter(member => {
        if (!member.active || !member.timezone) return false;
        
        const memberHours = parseTimeZone(member.timezone);
        if (memberHours === null) return false;
        
        // Calculate absolute difference, handling day wrapping
        let diff = Math.abs(targetHours - memberHours);
        if (diff > 12) diff = 24 - diff;
        
        return diff <= rangeHours;
    });
}

// Parse time zone string to hours (e.g., "GMT+5:30" => 5.5)
function parseTimeZone(timezone) {
    if (!timezone) return null;
    
    // Try standard format like "GMT+5:30" or "UTC-7"
    const match = timezone.match(/^(GMT|UTC)([+-])(\d+)(?::(\d+))?$/);
    if (match) {
        const hours = parseInt(match[3]);
        const minutes = match[4] ? parseInt(match[4]) : 0;
        const sign = match[2] === '+' ? 1 : -1;
        
        return sign * (hours + minutes / 60);
    }
    
    // Try numeric format like "+5.5" or "-7"
    const numMatch = timezone.match(/^([+-])?(\d+)(?:\.(\d+))?$/);
    if (numMatch) {
        const hours = parseInt(numMatch[2]);
        const fraction = numMatch[3] ? parseInt(numMatch[3]) / Math.pow(10, numMatch[3].length) : 0;
        const sign = numMatch[1] === '-' ? -1 : 1;
        
        return sign * (hours + fraction);
    }
    
    return null;
}

// Record project completion for team members
function recordProjectCompletion(projectId, amount, memberContributions) {
    // memberContributions = [{ id: 'member1', amount: 1000 }, ...]
    
    // Update each team member's record
    memberContributions.forEach(contribution => {
        const memberIndex = teamMembers.findIndex(m => m.id === contribution.id);
        if (memberIndex === -1) return;
        
        // Update stats
        teamMembers[memberIndex].projectsCompleted = (teamMembers[memberIndex].projectsCompleted || 0) + 1;
        teamMembers[memberIndex].totalEarnings = (teamMembers[memberIndex].totalEarnings || 0) + contribution.amount;
        
        // Add to project history if it doesn't exist
        if (!teamMembers[memberIndex].projectHistory) {
            teamMembers[memberIndex].projectHistory = [];
        }
        
        // Add project to history
        teamMembers[memberIndex].projectHistory.push({
            projectId,
            date: new Date(),
            amount: contribution.amount
        });
    });
    
    // Save team
    saveTeamToStorage();
    
    if (typeof logEvent === 'function') {
        logEvent('TeamManager:RecordProject', `Recorded completion of project ${projectId} with ${memberContributions.length} contributors`);
    }
    
    return true;
}

// Display team members in the UI
function displayTeamMembers() {
    const container = document.getElementById('team-members-container');
    
    if (!container) return;
    
    // Show team manager section
    document.getElementById('team-manager').style.display = 'block';
    
    // Clear container
    container.innerHTML = '';
    
    if (teamMembers.length === 0) {
        container.innerHTML = '<div class="no-team-members">No team members added yet. Add your first team member to get started.</div>';
        return;
    }
    
    // Sort team members (active first, then by name)
    const sortedMembers = [...teamMembers].sort((a, b) => {
        if (a.active && !b.active) return -1;
        if (!a.active && b.active) return 1;
        return a.name.localeCompare(b.name);
    });
    
    // Add each team member
    sortedMembers.forEach(member => {
        const div = document.createElement('div');
        div.className = `team-member-item ${member.active ? 'active-member' : 'inactive-member'}`;
        
        // Generate skill badges
        let skillBadges = '';
        if (member.skills) {
            skillBadges = Object.entries(member.skills)
                .map(([skill, level]) => 
                    `<span class="skill-badge skill-${level}">${formatSkillCategory(skill)}</span>`
                )
                .join('');
        }
        
        div.innerHTML = `
            <div class="team-member-name">
                ${member.name}
                ${member.country ? `<span class="member-country">(${member.country})</span>` : ''}
                ${member.timezone ? `<span class="member-timezone">GMT ${member.timezone}</span>` : ''}
            </div>
            <div class="team-member-role">${member.role}</div>
            <div class="team-member-rate">₹${member.rate}/hr</div>
            <div class="team-member-share">${member.sharePercentage}%</div>
            <div class="team-member-actions">
                <button class="mini-button edit-team-member" data-id="${member.id}">Edit</button>
                <button class="mini-button toggle-status" data-id="${member.id}">
                    ${member.active ? 'Deactivate' : 'Activate'}
                </button>
                <button class="mini-button remove-team-member" data-id="${member.id}">Remove</button>
            </div>
            <div class="team-member-skills">
                ${skillBadges}
            </div>
            <div class="team-member-stats">
<span>Projects: ${member.projectsCompleted || 0}</span>
                <span>Total: ₹${(member.totalEarnings || 0).toLocaleString()}</span>
            </div>
        `;
        
        container.appendChild(div);
    });
    
    // Add event listeners to buttons
    container.querySelectorAll('.edit-team-member').forEach(button => {
        button.addEventListener('click', () => editTeamMember(button.getAttribute('data-id')));
    });
    
    container.querySelectorAll('.toggle-status').forEach(button => {
        button.addEventListener('click', () => toggleTeamMemberStatus(button.getAttribute('data-id')));
    });
    
    container.querySelectorAll('.remove-team-member').forEach(button => {
        button.addEventListener('click', () => {
            if (removeTeamMember(button.getAttribute('data-id'))) {
                displayTeamMembers();
            }
        });
    });
}

// Edit team member
function editTeamMember(id) {
    const memberIndex = teamMembers.findIndex(m => m.id === id);
    
    if (memberIndex === -1) {
        if (typeof utils !== 'undefined' && typeof utils.showNotification === 'function') {
            utils.showNotification('Team member not found', 'error');
        } else {
            alert('Team member not found');
        }
        return;
    }
    
    const member = teamMembers[memberIndex];
    const modal = document.getElementById('team-member-modal');
    
    if (modal) {
        // Set modal title
        document.getElementById('team-modal-title').textContent = 'Edit Team Member';
        
        // Fill form fields
        document.getElementById('team-member-id').value = member.id;
        document.getElementById('team-member-name').value = member.name;
        document.getElementById('team-member-email').value = member.email || '';
        document.getElementById('team-member-country').value = member.country || '';
        document.getElementById('team-member-timezone').value = member.timezone || '';
        document.getElementById('team-member-role').value = member.role;
        document.getElementById('team-member-rate').value = member.rate;
        document.getElementById('team-member-share').value = member.sharePercentage;
        
        // Fill skills
        const skillsContainer = document.getElementById('team-member-skills');
        if (skillsContainer) {
            skillsContainer.innerHTML = '';
            
            // Add skill inputs
            skillCategories.forEach(category => {
                const skillRow = document.createElement('div');
                skillRow.className = 'skill-row';
                
                const skillLabel = document.createElement('label');
                skillLabel.textContent = formatSkillCategory(category) + ':';
                
                const skillSelect = document.createElement('select');
                skillSelect.id = `skill-${category}`;
                skillSelect.name = `skill-${category}`;
                
                // Add options for each skill level
                skillSelect.innerHTML = `
                    <option value="">None</option>
                    ${skillLevels.map(level => 
                        `<option value="${level}" ${
                            member.skills && member.skills[category] === level ? 'selected' : ''
                        }>${formatSkillLevel(level)}</option>`
                    ).join('')}
                `;
                
                skillRow.appendChild(skillLabel);
                skillRow.appendChild(skillSelect);
                
                skillsContainer.appendChild(skillRow);
            });
        }
        
        // Show modal
        modal.style.display = 'block';
        
        if (typeof logEvent === 'function') {
            logEvent('TeamManager:EditMember', `Editing team member: ${member.name}`);
        }
    }
}

// Generate time zone options for select fields
function getTimeZoneOptions() {
    const options = [];
    
    // Generate options from UTC-12 to UTC+14
    for (let i = -12; i <= 14; i++) {
        const sign = i >= 0 ? '+' : '';
        options.push(`<option value="UTC${sign}${i}">UTC${sign}${i}</option>`);
        
        // Add half-hour offsets for some time zones
        if ([-9.5, -3.5, 3.5, 4.5, 5.5, 5.75, 6.5, 8.75, 9.5, 10.5].includes(Math.abs(i))) {
            const halfSign = i >= 0 ? '+' : '';
            const hour = Math.floor(Math.abs(i));
            const minute = (Math.abs(i) - hour) * 60;
            options.push(`<option value="UTC${halfSign}${i}">UTC${halfSign}${hour}:${minute}</option>`);
        }
    }
    
    return options.join('');
}

// Check if email is valid
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

// Generate a unique ID
function generateUniqueId() {
    return 'tm_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
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

// Get active team members only
function getActiveTeamMembers() {
    return teamMembers.filter(member => member.active);
}

// Get team members by skill
function getTeamMembersBySkill(skill, level = null) {
    return teamMembers.filter(member => {
        if (!member.active) return false;
        if (!member.skills || !member.skills[skill]) return false;
        if (level && compareSkillLevels(member.skills[skill], level) < 0) return false;
        return true;
    });
}

// Get team skills summary
function getTeamSkillsSummary() {
    const summary = {};
    
    skillCategories.forEach(category => {
        summary[category] = {
            beginner: 0,
            intermediate: 0,
            advanced: 0,
            expert: 0
        };
    });
    
    // Count skills across active team members
    teamMembers.filter(member => member.active).forEach(member => {
        if (!member.skills) return;
        
        Object.entries(member.skills).forEach(([skill, level]) => {
            if (summary[skill] && summary[skill][level]) {
                summary[skill][level]++;
            }
        });
    });
    
    return summary;
}

// Get team members time zone distribution
function getTeamTimeZoneDistribution() {
    const distribution = {};
    
    teamMembers.filter(member => member.active && member.timezone).forEach(member => {
        const timezone = member.timezone;
        distribution[timezone] = (distribution[timezone] || 0) + 1;
    });
    
    return distribution;
}

// Generate HTML for team visualization
function generateTeamVisualization() {
    let html = '<div class="team-visualization">';
    
    // Team size summary
    const activeCount = teamMembers.filter(member => member.active).length;
    const inactiveCount = teamMembers.length - activeCount;
    
    html += `
        <div class="team-summary">
            <div class="summary-item">
                <span class="summary-label">Total Team Size:</span>
                <span class="summary-value">${teamMembers.length}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Active Members:</span>
                <span class="summary-value">${activeCount}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Inactive Members:</span>
                <span class="summary-value">${inactiveCount}</span>
            </div>
        </div>
    `;
    
    // Skills distribution
    const skillsSummary = getTeamSkillsSummary();
    
    html += '<div class="skills-visualization">';
    html += '<h4>Team Skills</h4>';
    
    Object.entries(skillsSummary).forEach(([skill, levels]) => {
        const totalWithSkill = Object.values(levels).reduce((sum, count) => sum + count, 0);
        if (totalWithSkill === 0) return;
        
        html += `
            <div class="skill-row">
                <div class="skill-label">${formatSkillCategory(skill)}</div>
                <div class="skill-bars">
                    ${Object.entries(levels).map(([level, count]) => {
                        if (count === 0) return '';
                        return `
                            <div class="skill-bar-container">
                                <div class="skill-bar skill-${level}" style="width: ${count * 20}px;">
                                    <span class="skill-count">${count}</span>
                                </div>
                                <div class="skill-level">${formatSkillLevel(level)}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    });
    
    html += '</div>'; // End skills-visualization
    
    // Time zone distribution
    const timezoneDistribution = getTeamTimeZoneDistribution();
    
    if (Object.keys(timezoneDistribution).length > 0) {
        html += '<div class="timezone-visualization">';
        html += '<h4>Team Time Zones</h4>';
        html += '<div class="timezone-map">';
        
        // Create a 24-hour representation
        for (let hour = -12; hour <= 12; hour++) {
            const timeLabel = hour < 0 ? `${hour}` : `+${hour}`;
            const memberCount = Object.entries(timezoneDistribution)
                .filter(([zone]) => {
                    const zoneHour = parseTimeZone(zone);
                    return zoneHour !== null && Math.floor(zoneHour) === hour;
                })
                .reduce((sum, [_, count]) => sum + count, 0);
            
            html += `
                <div class="timezone-hour ${memberCount > 0 ? 'has-members' : ''}">
                    <div class="hour-label">UTC${timeLabel}</div>
                    <div class="hour-bar" style="height: ${memberCount * 20}px;">
                        ${memberCount > 0 ? `<span class="member-count">${memberCount}</span>` : ''}
                    </div>
                </div>
            `;
        }
        
        html += '</div>'; // End timezone-map
        html += '</div>'; // End timezone-visualization
    }
    
    // Team composition by role
    const roleDistribution = {};
    teamMembers.filter(member => member.active).forEach(member => {
        roleDistribution[member.role] = (roleDistribution[member.role] || 0) + 1;
    });
    
    if (Object.keys(roleDistribution).length > 0) {
        html += '<div class="role-visualization">';
        html += '<h4>Team Composition</h4>';
        
        Object.entries(roleDistribution).forEach(([role, count]) => {
            html += `
                <div class="role-row">
                    <div class="role-label">${role}</div>
                    <div class="role-bar" style="width: ${count * 30}px;">
                        <span class="role-count">${count}</span>
                    </div>
                </div>
            `;
        });
        
        html += '</div>'; // End role-visualization
    }
    
    html += '</div>'; // End team-visualization
    
    return html;
}

// Export team manager functions to global scope
window.teamManager = {
    initTeamManager,
    showTeamManager,
    addTeamMember: function(name, email, role, rate, sharePercentage) {
        document.getElementById('team-member-name').value = name;
        document.getElementById('team-member-email').value = email || '';
        document.getElementById('team-member-role').value = role;
        document.getElementById('team-member-rate').value = rate;
        document.getElementById('team-member-share').value = sharePercentage;
        
        return saveTeamMember();
    },
    updateTeamMember,
    removeTeamMember,
    toggleTeamMemberStatus,
    calculateRevenueSharing: calculateShares,
    getTeamMembers,
    getActiveTeamMembers,
    getTeamMembersBySkill,
    findTeamMembersWithSkills,
    getTeamMembersInTimeZoneRange,
    recordProjectCompletion,
    displayTeamMembers,
    generateTeamVisualization
};
