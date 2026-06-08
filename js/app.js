/**
 * app.js - Main application controller
 * Manages DOM interactions, UI updates, and orchestrates the password analyzer
 */

document.addEventListener('DOMContentLoaded', () => {
    
    const passwordInput = document.getElementById('passwordInput');
    const toggleBtn = document.getElementById('togglePasswordBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    const statsGrid = document.getElementById('statsGrid');
    const chartContainer = document.getElementById('chartContainer');
    const breachWarning = document.getElementById('breachWarning');
    const alternativesDiv = document.getElementById('alternatives');
    const alternativesList = document.getElementById('alternativesList');
    
    const lengthStat = document.getElementById('lengthStat');
    const entropyStat = document.getElementById('entropyStat');
    const crackTimeStat = document.getElementById('crackTimeStat');
    const breachedCountEl = document.getElementById('breachedCount');
    
    let entropyChart = null;
    
    function initChart() {
        const ctx = document.getElementById('entropyChart').getContext('2d');
        entropyChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Entropy', 'Remaining'],
                datasets: [{
                    data: [0, 100],
                    backgroundColor: ['#302b63', '#e0e0e0'],
                    borderWidth: 0,
                    cutout: '70%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            }
        });
    }
    
    function updateEntropyChart(entropyBits) {
        if (!entropyChart) initChart();
        const percent = Math.min((entropyBits / 128) * 100, 100);
        entropyChart.data.datasets[0].data = [percent, 100 - percent];
        
        let color = '#f44336';
        if (percent >= 60) color = '#4caf50';
        else if (percent >= 40) color = '#ff9800';
        entropyChart.data.datasets[0].backgroundColor[0] = color;
        entropyChart.update();
    }
    
    function updateCriteriaUI(criteria) {
        const mappings = {
            critLength: 'length',
            critLower: 'lower',
            critUpper: 'upper',
            critDigit: 'digit',
            critSpecial: 'special',
            critPattern: 'noPattern'
        };
        
        const labels = {
            critLength: 'At least 8 characters',
            critLower: 'Contains lowercase letters',
            critUpper: 'Contains uppercase letters',
            critDigit: 'Contains numbers',
            critSpecial: 'Contains special characters (!@#$%)',
            critPattern: 'No common patterns (123, abc, qwerty)'
        };
        
        for (const [elementId, criteriaKey] of Object.entries(mappings)) {
            const el = document.getElementById(elementId);
            if (el && criteria[criteriaKey] !== undefined) {
                const isValid = criteria[criteriaKey];
                el.innerHTML = `${isValid ? '✅' : '❌'} ${labels[elementId]}`;
                el.className = isValid ? 'valid' : 'invalid';
            }
        }
    }
    
    function showBreachWarning(message) {
        breachWarning.style.display = 'block';
        document.getElementById('breachMessage').innerHTML = message;
    }
    
    function hideBreachWarning() {
        breachWarning.style.display = 'none';
    }
    
    function displayAlternatives(alternatives) {
        if (!alternatives || alternatives.length === 0) {
            alternativesDiv.style.display = 'none';
            return;
        }
        
        alternativesDiv.style.display = 'block';
        alternativesList.innerHTML = alternatives.map(alt => `
            <div class="alternative-item">
                <span class="alternative-password">${escapeHtml(alt.password)}</span>
                <span style="font-size: 11px; color: ${alt.entropy >= 60 ? '#4caf50' : '#ff9800'}">
                    🔐 ${alt.entropy.toFixed(0)} bits (${alt.length} chars)
                </span>
                <button class="use-btn" data-password="${escapeHtml(alt.password)}">
                    Use This →
                </button>
            </div>
        `).join('');
        
        document.querySelectorAll('.use-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const pwd = btn.getAttribute('data-password');
                passwordInput.value = pwd;
                analyzePassword();
                passwordInput.focus();
            });
        });
    }
    
    function escapeHtml(str) {
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
    
    async function analyzePassword() {
        const password = passwordInput.value;
        
        if (!password || !BreachDB.isReady()) {
            if (!password) {
                strengthFill.style.width = '0%';
                strengthText.innerHTML = '⚠️ Enter a password to analyze';
                statsGrid.style.display = 'none';
                chartContainer.style.display = 'none';
                breachWarning.style.display = 'none';
                alternativesDiv.style.display = 'none';
            }
            return;
        }
        
        statsGrid.style.display = 'grid';
        chartContainer.style.display = 'block';
        
        const criteriaResult = PasswordStrength.evaluateCriteria(password);
        updateCriteriaUI(criteriaResult.criteria);
        
        const isBreached = BreachDB.isBreached(password);
        const strength = PasswordStrength.calculateFinalStrength(criteriaResult, isBreached);
        const entropy = PasswordStrength.calculateEntropy(password);
        
        strengthFill.style.width = `${Math.min(strength.score, 100)}%`;
        strengthFill.style.background = strength.color;
        strengthText.innerHTML = `Strength: ${strength.label} (${Math.round(strength.score)}/100)`;
        strengthText.style.color = strength.color;
        
        lengthStat.innerText = password.length;
        entropyStat.innerText = entropy.bits;
        crackTimeStat.innerText = entropy.crackTime;
        breachedCountEl.innerText = BreachDB.getCount().toLocaleString();
        
        updateEntropyChart(entropy.total);
        
        if (isBreached) {
            showBreachWarning('❌ This password appears in the xato-net breach database! This password has been leaked in real data breaches. DO NOT USE.');
        } else {
            hideBreachWarning();
        }
        
        if (strength.score < 75 || isBreached) {
            const alternatives = PasswordStrength.generateAlternatives(password, criteriaResult.criteria);
            displayAlternatives(alternatives);
        } else {
            alternativesDiv.style.display = 'none';
        }
    }
    
    function clearPassword() {
        passwordInput.value = '';
        passwordInput.type = 'password';
        strengthFill.style.width = '0%';
        strengthText.innerHTML = 'Enter a password to begin';
        statsGrid.style.display = 'none';
        chartContainer.style.display = 'none';
        breachWarning.style.display = 'none';
        alternativesDiv.style.display = 'none';
        
        const defaultItems = ['critLength', 'critLower', 'critUpper', 'critDigit', 'critSpecial', 'critPattern'];
        defaultItems.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.innerHTML = el.innerHTML.replace('✅', '❌');
                el.className = 'invalid';
            }
        });
    }
    
    function togglePasswordVisibility() {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        toggleBtn.textContent = type === 'password' ? '👁️' : '🙈';
    }
    
    BreachDB.onStatus((status) => {
        const dbStatusDiv = document.getElementById('dbStatus');
        
        switch(status.status) {
            case 'loading':
                dbStatusDiv.className = 'status-banner loading';
                dbStatusDiv.innerHTML = `<span class="spinner"></span> ${status.message}`;
                break;
            case 'success':
                dbStatusDiv.className = 'status-banner success';
                dbStatusDiv.innerHTML = `✅ ${status.message}`;
                breachedCountEl.innerText = status.count?.toLocaleString() || '0';
                break;
            case 'warning':
                dbStatusDiv.className = 'status-banner error';
                dbStatusDiv.innerHTML = `⚠️ ${status.message}`;
                break;
            case 'error':
                dbStatusDiv.className = 'status-banner error';
                dbStatusDiv.innerHTML = `❌ ${status.message}`;
                break;
        }
    });
    
    BreachDB.load((percent) => {
        const dbStatusDiv = document.getElementById('dbStatus');
        dbStatusDiv.innerHTML = `<span class="spinner"></span> Loading... ${Math.round(percent)}%`;
    });
    
    analyzeBtn.addEventListener('click', analyzePassword);
    clearBtn.addEventListener('click', clearPassword);
    toggleBtn.addEventListener('click', togglePasswordVisibility);
    
    passwordInput.addEventListener('input', _.debounce(() => {
        analyzePassword();
    }, 500));
});
