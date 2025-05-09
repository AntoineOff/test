// Game state
let gameState = {
    // Resources
    credits: 0,
    blueprints: 0,
    
    // Production lines
    productionLines: {
        sedan: {
            unlocked: true,
            level: 1,
            count: 0,
            baseOutput: 1,
            currentOutput: 1,
            baseProfit: 10,
            currentProfit: 10,
            upgradeCost: 100,
            progress: 0,
            productionTime: 5000, // in milliseconds
            automated: false
        },
        suv: {
            unlocked: false,
            level: 1,
            count: 0,
            baseOutput: 2,
            currentOutput: 2,
            baseProfit: 25,
            currentProfit: 25,
            upgradeCost: 500,
            progress: 0,
            productionTime: 8000,
            automated: false,
            unlockCost: 1000
        },
        electric: {
            unlocked: false,
            level: 1,
            count: 0,
            baseOutput: 3,
            currentOutput: 3,
            baseProfit: 50,
            currentProfit: 50,
            upgradeCost: 2000,
            progress: 0,
            productionTime: 12000,
            automated: false,
            unlockCost: 5000
        },
        sports: {
            unlocked: false,
            level: 1,
            count: 0,
            baseOutput: 5,
            currentOutput: 5,
            baseProfit: 100,
            currentProfit: 100,
            upgradeCost: 5000,
            progress: 0,
            productionTime: 20000,
            automated: false,
            unlockCost: 10000
        }
    },
    
    // Foremen
    foremen: {
        'production-expert': {
            hired: false,
            name: 'Production Expert',
            bonus: 'Speed +15%',
            cost: 500,
            effect: function() {
                applySpeedBonus(0.15);
            }
        },
        'cost-optimizer': {
            hired: false,
            name: 'Cost Optimizer',
            bonus: 'Upgrade cost -10%',
            cost: 750,
            effect: function() {
                applyUpgradeCostReduction(0.1);
            }
        },
        'master-engineer': {
            hired: false,
            name: 'Master Engineer',
            bonus: 'Profit +25%',
            cost: 50,
            isPremium: true,
            effect: function() {
                applyProfitBonus(0.25);
            }
        }
    },
    
    // Research
    research: {
        'automation': {
            completed: false,
            name: 'Advanced Automation',
            effect: 'Production speed +25%',
            cost: 1000
        },
        'materials': {
            completed: false,
            name: 'Lightweight Materials',
            effect: 'Profit +15%',
            cost: 1500
        },
        'eco': {
            completed: false,
            name: 'Eco-Friendly Tech',
            effect: 'Electric Car production +50%',
            cost: 2000
        }
    },
    
    // Active boosts
    activeBoosts: [],
    
    // Settings
    settings: {
        sound: true,
        music: true,
        notifications: true
    },
    
    // Game metrics
    lastSave: Date.now(),
    totalPlayTime: 0,
    offlineTime: 0
};

// Production timers
let productionIntervals = {};

// DOM Elements
const dom = {
    resources: {
        credits: document.getElementById('credits'),
        blueprints: document.getElementById('blueprints')
    },
    productionLines: {
        sedan: {
            level: document.getElementById('sedan-level'),
            output: document.getElementById('sedan-output'),
            count: document.getElementById('sedan-count'),
            profit: document.getElementById('sedan-profit'),
            progress: document.getElementById('sedan-progress'),
            produceBtn: document.getElementById('sedan-produce'),
            upgradeBtn: document.getElementById('sedan-upgrade'),
            upgradeCost: document.getElementById('sedan-upgrade-cost')
        },
        suv: {
            line: document.getElementById('suv-line'),
            unlock: document.getElementById('suv-unlock')
        },
        electric: {
            line: document.getElementById('electric-line'),
            unlock: document.getElementById('electric-unlock')
        },
        sports: {
            line: document.getElementById('sports-line'),
            unlock: document.getElementById('sports-unlock')
        }
    },
    tabs: {
        factory: document.getElementById('factory'),
        research: document.getElementById('research'),
        contracts: document.getElementById('contracts'),
        market: document.getElementById('market'),
        union: document.getElementById('union')
    },
    navButtons: document.querySelectorAll('.nav-btn'),
    hireBtns: document.querySelectorAll('.hire-btn'),
    boostBtns: document.querySelectorAll('.boost-btn'),
    marketTabs: document.querySelectorAll('.market-tab'),
    exchangeAmount: document.getElementById('exchange-amount'),
    exchangeResult: document.getElementById('exchange-result'),
    exchangeBtn: document.getElementById('exchange-btn'),
    notifications: document.getElementById('notifications'),
    settings: {
        modal: document.getElementById('settings-modal'),
        btn: document.getElementById('settings-btn'),
        closeBtn: document.querySelector('.close-modal'),
        soundToggle: document.getElementById('sound-toggle'),
        musicToggle: document.getElementById('music-toggle'),
        notificationsToggle: document.getElementById('notifications-toggle'),
        saveBtn: document.getElementById('save-game'),
        loadBtn: document.getElementById('load-game'),
        resetBtn: document.getElementById('reset-game')
    }
};

// Initialize the game
function initGame() {
    // Load saved game if available
    loadGame();
    
    // Update all UI elements with current game state
    updateAllUI();
    
    // Set up event listeners
    setupEventListeners();
    
    // Start production timers for automated lines
    startAutomatedProduction();
    
    // Process offline progress if applicable
    processOfflineProgress();
}

// Update all UI elements
function updateAllUI() {
    // Update resources
    updateResources();
    
    // Update production lines
    for (const lineId in gameState.productionLines) {
        updateProductionLineUI(lineId);
    }
}

// Update resources display
function updateResources() {
    dom.resources.credits.textContent = formatNumber(gameState.credits);
    dom.resources.blueprints.textContent = formatNumber(gameState.blueprints);
}

// Update a specific production line's UI
function updateProductionLineUI(lineId) {
    const line = gameState.productionLines[lineId];
    
    // For unlocked lines
    if (line.unlocked) {
        // Handle specific line UI updates
        if (lineId === 'sedan') {
            // Update sedan line UI elements
            dom.productionLines.sedan.level.textContent = line.level;
            dom.productionLines.sedan.output.textContent = formatNumber(line.currentOutput);
            dom.productionLines.sedan.count.textContent = formatNumber(line.count);
            dom.productionLines.sedan.profit.textContent = formatNumber(line.currentProfit);
            dom.productionLines.sedan.upgradeCost.textContent = formatNumber(line.upgradeCost);
        } else {
            // For other lines that might be unlocked later
            // This would be expanded when those lines are implemented
        }
    } else {
        // Update unlock costs for locked lines
        if (lineId === 'suv') {
            dom.productionLines.suv.unlock.textContent = formatNumber(line.unlockCost);
        } else if (lineId === 'electric') {
            dom.productionLines.electric.unlock.textContent = formatNumber(line.unlockCost);
        } else if (lineId === 'sports') {
            dom.productionLines.sports.unlock.textContent = formatNumber(line.unlockCost);
        }
    }
}

// Set up all event listeners
function setupEventListeners() {
    // Tab navigation
    dom.navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Production buttons
    dom.productionLines.sedan.produceBtn.addEventListener('click', () => {
        startProduction('sedan');
    });
    
    dom.productionLines.sedan.upgradeBtn.addEventListener('click', () => {
        upgradeProductionLine('sedan');
    });
    
    // Hire foremen buttons
    dom.hireBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const foremanId = btn.getAttribute('data-foreman');
            const cost = parseInt(btn.getAttribute('data-cost'));
            hireForeman(foremanId, cost);
        });
    });
    
    // Boost buttons
    dom.boostBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const boostType = btn.getAttribute('data-boost');
            const duration = parseInt(btn.getAttribute('data-duration'));
            const cost = btn.getAttribute('data-cost');
            
            if (cost) {
                // Premium boost
                activateBoost(boostType, duration, parseInt(cost));
            } else {
                // Ad boost (simulated)
                showNotification('Ad would play here. Activating boost...', 'info');
                setTimeout(() => {
                    activateBoost(boostType, duration);
                }, 1000);
            }
        });
    });
    
    // Market tabs
    dom.marketTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const marketId = tab.getAttribute('data-market');
            switchMarketTab(marketId);
        });
    });
    
    // Exchange rate preview
    if (dom.exchangeAmount) {
        dom.exchangeAmount.addEventListener('input', updateExchangePreview);
    }
    
    // Exchange button
    if (dom.exchangeBtn) {
        dom.exchangeBtn.addEventListener('click', executeExchange);
    }
    
    // Settings modal
    dom.settings.btn.addEventListener('click', () => {
        dom.settings.modal.style.display = 'flex';
    });
    
    dom.settings.closeBtn.addEventListener('click', () => {
        dom.settings.modal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === dom.settings.modal) {
            dom.settings.modal.style.display = 'none';
        }
    });
    
    // Settings toggles
    dom.settings.soundToggle.addEventListener('change', (e) => {
        gameState.settings.sound = e.target.checked;
        saveGame();
    });
    
    dom.settings.musicToggle.addEventListener('change', (e) => {
        gameState.settings.music = e.target.checked;
        saveGame();
    });
    
    dom.settings.notificationsToggle.addEventListener('change', (e) => {
        gameState.settings.notifications = e.target.checked;
        saveGame();
    });
    
    // Save/Load/Reset buttons
    dom.settings.saveBtn.addEventListener('click', () => {
        saveGame();
        showNotification('Game saved successfully!', 'success');
    });
    
    dom.settings.loadBtn.addEventListener('click', () => {
        if (loadGame()) {
            showNotification('Game loaded successfully!', 'success');
            updateAllUI();
        } else {
            showNotification('No saved game found.', 'error');
        }
    });
    
    dom.settings.resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset your game? All progress will be lost!')) {
            localStorage.removeItem('autoForgeEmpireSave');
            location.reload();
        }
    });
}

// Switch between tabs
function switchTab(tabId) {
    // Hide all tabs
    for (const id in dom.tabs) {
        dom.tabs[id].classList.remove('active');
    }
    
    // Show selected tab
    document.getElementById(tabId).classList.add('active');
    
    // Update nav buttons
    dom.navButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        }
    });
}

// Switch between market tabs
function switchMarketTab(marketId) {
    // Hide all market content
    document.querySelectorAll('.market-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show selected market content
    document.getElementById(marketId).classList.add('active');
    
    // Update market tab buttons
    dom.marketTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-market') === marketId) {
            tab.classList.add('active');
        }
    });
}

// Start production on a line
function startProduction(lineId) {
    const line = gameState.productionLines[lineId];
    
    // If already producing, do nothing
    if (line.progress > 0) return;
    
    // Start production
    line.progress = 0.1; // Start progress
    updateProductionProgress(lineId);
    
    // Create interval to update progress
    const interval = setInterval(() => {
        line.progress += (100 / (line.productionTime / 100)); // Increment based on production time
        
        updateProductionProgress(lineId);
        
        // Check if production is complete
        if (line.progress >= 100) {
            clearInterval(interval);
            completeProduction(lineId);
        }
    }, 100);
    
    // Store interval ID
    productionIntervals[lineId] = interval;
}

// Update production progress bar
function updateProductionProgress(lineId) {
    const line = gameState.productionLines[lineId];
    const progressBar = document.getElementById(`${lineId}-progress`);
    
    if (progressBar) {
        progressBar.style.width = `${line.progress}%`;
    }
}

// Complete production on a line
function completeProduction(lineId) {
    const line = gameState.productionLines[lineId];
    
    // Add vehicles to inventory
    line.count += line.currentOutput;
    
    // Add credits
    const profit = line.currentOutput * line.currentProfit;
    gameState.credits += profit;
    
    // Reset progress
    line.progress = 0;
    updateProductionProgress(lineId);
    
    // Update UI
    updateProductionLineUI(lineId);
    updateResources();
    
    // Show notification
    showNotification(`Produced ${line.currentOutput} ${lineId}s for ${formatNumber(profit)} credits!`, 'success');
    
    // If automated, start next production
    if (line.automated) {
        setTimeout(() => {
            startProduction(lineId);
        }, 500);
    }
    
    // Save game
    saveGame();
}

// Upgrade a production line
function upgradeProductionLine(lineId) {
    const line = gameState.productionLines[lineId];
    
    // Check if player has enough credits
    if (gameState.credits < line.upgradeCost) {
        showNotification('Not enough credits to upgrade!', 'error');
        return;
    }
    
    // Deduct credits
    gameState.credits -= line.upgradeCost;
    
    // Upgrade the line
    line.level++;
    line.currentOutput = Math.floor(line.baseOutput * (1 + (line.level - 1) * 0.2));
    line.currentProfit = Math.floor(line.baseProfit * (1 + (line.level - 1) * 0.15));
    line.upgradeCost = Math.floor(line.upgradeCost * 1.5);
    
    // Reduce production time as level increases (up to 50% reduction)
    const speedMultiplier = Math.max(0.5, 1 - (line.level - 1) * 0.05);
    line.productionTime = Math.floor(line.productionTime * speedMultiplier);
    
    // Update UI
    updateProductionLineUI(lineId);
    updateResources();
    
    // Show notification
    showNotification(`${capitalizeFirstLetter(lineId)} production upgraded to level ${line.level}!`, 'success');
    
    // Save game
    saveGame();
}

// Hire a foreman
function hireForeman(foremanId, cost) {
    const foreman = gameState.foremen[foremanId];
    
    // Check if already hired
    if (foreman.hired) {
        showNotification(`${foreman.name} is already hired!`, 'info');
        return;
    }
    
    // Check if player can afford it
    if (foreman.isPremium) {
        if (gameState.blueprints < cost) {
            showNotification('Not enough blueprints!', 'error');
            return;
        }
        gameState.blueprints -= cost;
    } else {
        if (gameState.credits < cost) {
            showNotification('Not enough credits!', 'error');
            return;
        }
        gameState.credits -= cost;
    }
    
    // Hire foreman
    foreman.hired = true;
    
    // Apply foreman's effect
    foreman.effect();
    
    // Update UI
    updateResources();
    
    // Disable button
    const button = document.querySelector(`[data-foreman="${foremanId}"]`);
    if (button) {
        button.disabled = true;
        button.textContent = 'Hired';
    }
    
    // Show notification
    showNotification(`${foreman.name} hired! ${foreman.bonus} applied.`, 'success');
    
    // Save game
    saveGame();
}

// Apply speed bonus from foremen or research
function applySpeedBonus(bonusPercentage) {
    for (const lineId in gameState.productionLines) {
        const line = gameState.productionLines[lineId];
        line.productionTime = Math.floor(line.productionTime / (1 + bonusPercentage));
    }
}

// Apply profit bonus from foremen or research
function applyProfitBonus(bonusPercentage) {
    for (const lineId in gameState.productionLines) {
        const line = gameState.productionLines[lineId];
        line.currentProfit = Math.floor(line.currentProfit * (1 + bonusPercentage));
        updateProductionLineUI(lineId);
    }
}

// Apply upgrade cost reduction from foremen
function applyUpgradeCostReduction(reductionPercentage) {
    for (const lineId in gameState.productionLines) {
        const line = gameState.productionLines[lineId];
        line.upgradeCost = Math.floor(line.upgradeCost * (1 - reductionPercentage));
        updateProductionLineUI(lineId);
    }
}

// Activate a production boost
function activateBoost(boostType, duration, cost = 0) {
    // Check if player can afford premium boost
    if (cost > 0) {
        if (gameState.blueprints < cost) {
            showNotification('Not enough blueprints!', 'error');
            return;
        }
        gameState.blueprints -= cost;
        updateResources();
    }
    
    // Parse boost multiplier
    const multiplier = parseInt(boostType.replace('x', ''));
    
    // Create boost object
    const boost = {
        type: boostType,
        multiplier: multiplier,
        endTime: Date.now() + (duration * 1000)
    };
    
    // Add to active boosts
    gameState.activeBoosts.push(boost);
    
    // Apply boost effect
    applyActiveBoosts();
    
    // Show notification
    const durationMinutes = Math.floor(duration / 60);
    const durationSeconds = duration % 60;
    let durationText = '';
    
    if (durationMinutes > 0) {
        durationText += `${durationMinutes} minute${durationMinutes > 1 ? 's' : ''}`;
    }
    if (durationSeconds > 0) {
        if (durationText.length > 0) durationText += ' and ';
        durationText += `${durationSeconds} second${durationSeconds > 1 ? 's' : ''}`;
    }

showNotification(`${boostType} production boost active for ${durationText}!`, 'boost');
    
    // Set timeout to remove boost when it expires
    setTimeout(() => {
        removeExpiredBoosts();
    }, duration * 1000);
    
    // Save game
    saveGame();
}

// Apply effects from all active boosts
function applyActiveBoosts() {
    // First, reset all production rates to their base values
    for (const lineId in gameState.productionLines) {
        const line = gameState.productionLines[lineId];
        // Reset to the value based on level and other permanent bonuses
        // but without temporary boosts
        line.currentOutput = Math.floor(line.baseOutput * (1 + (line.level - 1) * 0.2));
    }
    
    // Then apply active boosts
    let maxMultiplier = 1;
    
    // Find the highest multiplier from active boosts
    gameState.activeBoosts.forEach(boost => {
        if (boost.multiplier > maxMultiplier) {
            maxMultiplier = boost.multiplier;
        }
    });
    
    // Apply the highest multiplier to all production lines
    if (maxMultiplier > 1) {
        for (const lineId in gameState.productionLines) {
            const line = gameState.productionLines[lineId];
            line.currentOutput = Math.floor(line.currentOutput * maxMultiplier);
            updateProductionLineUI(lineId);
        }
    }
}

// Remove expired boosts
function removeExpiredBoosts() {
    const now = Date.now();
    const previousLength = gameState.activeBoosts.length;
    
    // Filter out expired boosts
    gameState.activeBoosts = gameState.activeBoosts.filter(boost => boost.endTime > now);
    
    // If any boosts were removed, reapply remaining boosts
    if (previousLength !== gameState.activeBoosts.length) {
        applyActiveBoosts();
        
        // Show notification if all boosts expired
        if (gameState.activeBoosts.length === 0) {
            showNotification('All production boosts have expired.', 'info');
        }
        
        // Save game
        saveGame();
    }
}

// Update exchange preview
function updateExchangePreview() {
    const amount = parseInt(dom.exchangeAmount.value);
    const exchangeRate = 100; // 1000 credits = 10 blueprints
    
    if (isNaN(amount) || amount < 1000) {
        dom.exchangeResult.textContent = '0';
        return;
    }
    
    const blueprints = Math.floor(amount / exchangeRate);
    dom.exchangeResult.textContent = blueprints;
}

// Execute currency exchange
function executeExchange() {
    const amount = parseInt(dom.exchangeAmount.value);
    const exchangeRate = 100; // 1000 credits = 10 blueprints
    
    if (isNaN(amount) || amount < 1000) {
        showNotification('Minimum exchange amount is 1000 credits.', 'error');
        return;
    }
    
    if (gameState.credits < amount) {
        showNotification('Not enough credits!', 'error');
        return;
    }
    
    const blueprints = Math.floor(amount / exchangeRate);
    
    // Exchange currencies
    gameState.credits -= amount;
    gameState.blueprints += blueprints;
    
    // Update UI
    updateResources();
    
    // Show notification
    showNotification(`Exchanged ${formatNumber(amount)} credits for ${blueprints} blueprints.`, 'success');
    
    // Save game
    saveGame();
}

// Start automated production for applicable lines
function startAutomatedProduction() {
    for (const lineId in gameState.productionLines) {
        const line = gameState.productionLines[lineId];
        
        if (line.unlocked && line.automated) {
            startProduction(lineId);
        }
    }
}

// Process offline progress
function processOfflineProgress() {
    const now = Date.now();
    const offlineTime = now - gameState.lastSave;
    
    // Only process if offline for more than 1 minute
    if (offlineTime < 60000) return;
    
    let totalEarnings = 0;
    let productionReport = '';
    
    // Calculate offline earnings for each production line
    for (const lineId in gameState.productionLines) {
        const line = gameState.productionLines[lineId];
        
        if (line.unlocked && line.automated) {
            // Calculate how many items would be produced while offline
            // Account for production time and 50% efficiency when offline
            const cycles = (offlineTime * 0.5) / line.productionTime;
            const produced = Math.floor(cycles * line.currentOutput);
            const earnings = produced * line.currentProfit;
            
            // Add to totals
            line.count += produced;
            totalEarnings += earnings;
            
            // Add to report
            if (produced > 0) {
                productionReport += `${formatNumber(produced)} ${capitalizeFirstLetter(lineId)}s produced for ${formatNumber(earnings)} credits.\n`;
            }
        }
    }
    
    // Add credits earned
    if (totalEarnings > 0) {
        gameState.credits += totalEarnings;
        
        // Show offline progress notification
        const offlineMinutes = Math.floor(offlineTime / 60000);
        const offlineHours = Math.floor(offlineMinutes / 60);
        
        let timeAway = '';
        if (offlineHours > 0) {
            timeAway = `${offlineHours} hour${offlineHours > 1 ? 's' : ''} and ${offlineMinutes % 60} minute${offlineMinutes % 60 !== 1 ? 's' : ''}`;
        } else {
            timeAway = `${offlineMinutes} minute${offlineMinutes !== 1 ? 's' : ''}`;
        }
        
        const message = `Welcome back! While you were away for ${timeAway}:\n${productionReport}\nTotal earnings: ${formatNumber(totalEarnings)} credits.`;
        
        // Use a timeout to show this after the game has loaded
        setTimeout(() => {
            alert(message);
        }, 500);
        
        // Update UI
        updateAllUI();
    }
    
    // Update last save time
    gameState.lastSave = now;
}

// Format large numbers
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    } else {
        return num.toString();
    }
}

// Capitalize first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Show notification
function showNotification(message, type = 'info') {
    // If notifications are disabled in settings, don't show
    if (!gameState.settings.notifications) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    dom.notifications.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            try {
                dom.notifications.removeChild(notification);
            } catch (e) {
                // Notification may have been removed already
            }
        }, 500);
    }, 4500);
}

// Save game to localStorage
function saveGame() {
    // Update last save time
    gameState.lastSave = Date.now();
    
    // Convert game state to JSON string
    const saveData = JSON.stringify(gameState);
    
    // Save to localStorage
    try {
        localStorage.setItem('autoForgeEmpireSave', saveData);
        return true;
    } catch (e) {
        console.error('Failed to save game: ', e);
        return false;
    }
}

// Load game from localStorage
function loadGame() {
    const saveData = localStorage.getItem('autoForgeEmpireSave');
    
    if (!saveData) return false;
    
    try {
        // Parse save data
        const loadedState = JSON.parse(saveData);
        
        // Update game state with loaded data
        // We use this approach to ensure new properties added later aren't lost
        for (const key in loadedState) {
            if (key in gameState) {
                // Special handling for nested objects
                if (typeof gameState[key] === 'object' && !Array.isArray(gameState[key])) {
                    for (const subKey in loadedState[key]) {
                        // Only copy if the property exists in the current game state
                        if (subKey in gameState[key]) {
                            gameState[key][subKey] = loadedState[key][subKey];
                        }
                    }
                } else {
                    gameState[key] = loadedState[key];
                }
            }
        }
        
        return true;
    } catch (e) {
        console.error('Failed to load game: ', e);
        return false;
    }
}

// Run game every second to check for expired boosts and save game
setInterval(() => {
    removeExpiredBoosts();
    
    // Auto-save every minute
    const now = Date.now();
    if (now - gameState.lastSave >= 60000) {
        saveGame();
    }
}, 1000);

// Start the game
document.addEventListener('DOMContentLoaded', initGame);

// Add auto-save on page unload
window.addEventListener('beforeunload', saveGame);

// Unlock production lines when criteria are met
function checkUnlocks() {
    // Check SUV line
    if (!gameState.productionLines.suv.unlocked && 
        gameState.credits >= gameState.productionLines.suv.unlockCost) {
        // Show notification that SUV line can be unlocked
        showNotification('SUV Production Line is now available to unlock!', 'unlock');
    }
    
    // Check Electric line
    if (!gameState.productionLines.electric.unlocked && 
        gameState.credits >= gameState.productionLines.electric.unlockCost) {
        // Show notification that Electric line can be unlocked
        showNotification('Electric Car Production Line is now available to unlock!', 'unlock');
    }
    
    // Check Sports line
    if (!gameState.productionLines.sports.unlocked && 
        gameState.credits >= gameState.productionLines.sports.unlockCost) {
        // Show notification that Sports line can be unlocked
        showNotification('Sports Car Production Line is now available to unlock!', 'unlock');
    }
}

// Function to unlock a production line
function unlockProductionLine(lineId) {
    const line = gameState.productionLines[lineId];
    
    // Check if already unlocked
    if (line.unlocked) return;
    
    // Check if player can afford it
    if (gameState.credits < line.unlockCost) {
        showNotification(`Not enough credits to unlock ${capitalizeFirstLetter(lineId)} Production!`, 'error');
        return;
    }
    
    // Deduct credits
    gameState.credits -= line.unlockCost;
    
    // Unlock the line
    line.unlocked = true;
    
    // Update UI
    updateResources();
    
    // Create DOM elements for the new production line
    createProductionLineUI(lineId);
    
    // Show notification
    showNotification(`${capitalizeFirstLetter(lineId)} Production Line unlocked!`, 'success');
    
    // Save game
    saveGame();
}

// Create UI elements for a newly unlocked production line
function createProductionLineUI(lineId) {
    const line = gameState.productionLines[lineId];
    const lineElement = dom.productionLines[lineId].line;
    
    // Remove locked overlay
    lineElement.classList.remove('locked');
    
    // Create new UI elements similar to sedan line
    lineElement.innerHTML = `
        <div class="line-header">
            <h3>${capitalizeFirstLetter(lineId)} Production</h3>
            <div class="line-status">
                <span class="level">Level <span id="${lineId}-level">1</span></span>
                <span class="output">Output: <span id="${lineId}-output">${line.currentOutput}</span>/s</span>
            </div>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" id="${lineId}-progress"></div>
        </div>
        <div class="line-actions">
            <button class="action-btn" id="${lineId}-produce">Produce ${capitalizeFirstLetter(lineId)}</button>
            <button class="action-btn upgrade-btn" id="${lineId}-upgrade">
                Upgrade <span id="${lineId}-upgrade-cost">${line.upgradeCost}</span> <i class="fas fa-coins"></i>
            </button>
        </div>
        <div class="production-stats">
            <div class="stat">
                <i class="fas fa-car"></i> ${capitalizeFirstLetter(lineId)}s: <span id="${lineId}-count">0</span>
            </div>
            <div class="stat">
                <i class="fas fa-dollar-sign"></i> Profit: <span id="${lineId}-profit">${line.currentProfit}</span>/each
            </div>
        </div>
    `;
    
    // Update DOM references
    dom.productionLines[lineId].level = document.getElementById(`${lineId}-level`);
    dom.productionLines[lineId].output = document.getElementById(`${lineId}-output`);
    dom.productionLines[lineId].count = document.getElementById(`${lineId}-count`);
    dom.productionLines[lineId].profit = document.getElementById(`${lineId}-profit`);
    dom.productionLines[lineId].progress = document.getElementById(`${lineId}-progress`);
    dom.productionLines[lineId].produceBtn = document.getElementById(`${lineId}-produce`);
    dom.productionLines[lineId].upgradeBtn = document.getElementById(`${lineId}-upgrade`);
    dom.productionLines[lineId].upgradeCost = document.getElementById(`${lineId}-upgrade-cost`);
    
    // Add event listeners
    dom.productionLines[lineId].produceBtn.addEventListener('click', () => {
        startProduction(lineId);
    });
    
    dom.productionLines[lineId].upgradeBtn.addEventListener('click', () => {
        upgradeProductionLine(lineId);
    });
}

// Check for unlocks every second
setInterval(checkUnlocks, 1000);

// Function to research a technology
function researchTechnology(techId) {
    const tech = gameState.research[techId];
    
    // Check if already researched
    if (tech.completed) {
        showNotification(`${tech.name} has already been researched!`, 'info');
        return;
    }
    
    // Check if player can afford it
    if (gameState.credits < tech.cost) {
        showNotification(`Not enough credits to research ${tech.name}!`, 'error');
        return;
    }
    
    // Deduct credits
    gameState.credits -= tech.cost;
    
    // Complete research
    tech.completed = true;
    
    // Apply research effects
    applyResearchEffects(techId);
    
    // Update UI
    updateResources();
    updateResearchUI(techId);
    
    // Show notification
    showNotification(`${tech.name} research completed! ${tech.effect} applied.`, 'success');
    
    // Save game
    saveGame();
}

// Apply effects from completed research
function applyResearchEffects(techId) {
    switch (techId) {
        case 'automation':
            // +25% production speed for all lines
            applySpeedBonus(0.25);
            break;
        case 'materials':
            // +15% profit for all vehicles
            applyProfitBonus(0.15);
            break;
        case 'eco':
            // +50% Electric Car production
            if (gameState.productionLines.electric.unlocked) {
                const line = gameState.productionLines.electric;
                line.currentOutput = Math.floor(line.currentOutput * 1.5);
                updateProductionLineUI('electric');
            }
            break;
    }
}

// Update research UI when completed
function updateResearchUI(techId) {
    const researchItem = document.getElementById(`research-${techId}`);
    
    if (researchItem) {
        researchItem.classList.remove('locked');
        researchItem.classList.add('completed');
        
        // Update the button
        const button = researchItem.querySelector('button');
        if (button) {
            button.disabled = true;
            button.textContent = 'Researched';
        }
    }
}

// Initialize research UI with buttons and event listeners
function initResearchUI() {
    // Add research buttons and event listeners to each research item
    for (const techId in gameState.research) {
        const tech = gameState.research[techId];
        const researchItem = document.getElementById(`research-${techId}`);
        
        if (researchItem) {
            // Add research button if not already present
            if (!researchItem.querySelector('button')) {
                const button = document.createElement('button');
                button.className = 'research-btn';
                button.textContent = tech.completed ? 'Researched' : 'Research';
                button.disabled = tech.completed;
                
                button.addEventListener('click', () => {
                    researchTechnology(techId);
                });
                
                researchItem.querySelector('.research-info').appendChild(button);
            }
            
            // Update research item class based on status
            if (tech.completed) {
                researchItem.classList.remove('locked');
                researchItem.classList.add('completed');
            }
        }
    }
}

// Call research UI initialization after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Init game first
    initGame();
    
    // Then init research UI
    initResearchUI();
});

// Add CSS class for completed research items
// This should be added to your styles.css file:
/*
.research-item.completed {
    background-color: rgba(0, 255, 0, 0.1);
    border-color: #00aa00;
}

.research-item.completed .research-icon {
    background-color: rgba(0, 255, 0, 0.2);
}

.research-btn {
    display: block;
    margin-top: 10px;
    padding: 5px 10px;
    background-color: #4a6fa5;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.research-btn:hover {
    background-color: #5a80b6;
}

.research-btn:disabled {
    background-color: #2c4c7c;
    opacity: 0.7;
    cursor: not-allowed;
}
*/
  
