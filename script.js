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
  
