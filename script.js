// Senior Living Cost Calculator JavaScript

class SeniorLivingCalculator {
    constructor() {
        this.currentCosts = {};
        this.seniorCosts = {};
        this.sunscapePricing = {
            assisted: 3950,
            memory: 5250
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupInputValidation();
        this.loadSavedData();
    }

    setupEventListeners() {
        // Calculate button
        document.getElementById('calculateBtn').addEventListener('click', () => {
            this.calculateComparison();
        });

        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetCalculator();
        });

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportResults();
        });

        // Facility type selector
        document.getElementById('facilityType').addEventListener('change', (e) => {
            this.updateSunscapePricing(e.target.value);
        });

        // Real-time total updates
        this.setupRealTimeUpdates();
    }

    setupInputValidation() {
        const inputs = document.querySelectorAll('input[type="number"]:not([readonly])');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.validateInput(e.target);
                this.saveData();
            });

            input.addEventListener('blur', (e) => {
                this.formatInput(e.target);
            });
        });
    }

    setupRealTimeUpdates() {
        const currentInputs = [
            'housing', 'utilities', 'food', 'healthcare', 
            'transportation', 'maintenance', 'insurance', 
            'entertainment', 'other'
        ];

        currentInputs.forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                this.updateCurrentTotal();
            });
        });

        // Senior total updates when base cost changes
        document.getElementById('seniorHousing').addEventListener('input', () => {
            this.updateSeniorTotal();
        });
    }

    validateInput(input) {
        const value = parseFloat(input.value) || 0;
        
        if (value < 0) {
            input.value = 0;
            input.classList.add('invalid');
            setTimeout(() => input.classList.remove('invalid'), 2000);
        } else if (value > 0) {
            input.classList.add('valid');
            setTimeout(() => input.classList.remove('valid'), 2000);
        }
    }

    formatInput(input) {
        const value = parseFloat(input.value) || 0;
        input.value = value.toFixed(2);
    }

    updateCurrentTotal() {
        const categories = [
            'housing', 'utilities', 'food', 'healthcare', 
            'transportation', 'maintenance', 'insurance', 
            'entertainment', 'other'
        ];

        let total = 0;
        categories.forEach(category => {
            const value = parseFloat(document.getElementById(category).value) || 0;
            total += value;
            this.currentCosts[category] = value;
        });

        document.getElementById('currentTotal').textContent = this.formatCurrency(total);
    }

    updateSeniorTotal() {
        const baseCost = parseFloat(document.getElementById('seniorHousing').value) || 0;
        const total = baseCost; // All other costs are included in Sunscape pricing
        
        this.seniorCosts = {
            seniorHousing: baseCost,
            seniorMeals: 0, // Included
            seniorHealthcare: 0, // Included
            seniorActivities: 0, // Included
            seniorTransportation: 0, // Included
            seniorUtilities: 0, // Included
            seniorOther: 0 // Included
        };

        document.getElementById('seniorTotal').textContent = this.formatCurrency(total);
    }

    updateSunscapePricing(selectedType) {
        const baseCostInput = document.getElementById('seniorHousing');
        
        if (selectedType && this.sunscapePricing[selectedType]) {
            const baseCost = this.sunscapePricing[selectedType];
            baseCostInput.value = baseCost.toFixed(2);
            this.updateSeniorTotal();
            
            // Show success message
            const careType = selectedType === 'assisted' ? 'Assisted Living' : 'Memory Care (Valeo™)';
            this.showAlert(`Perfect! ${careType} pricing applied: ${this.formatCurrency(baseCost)}/month`, 'success');
        } else {
            baseCostInput.value = '';
            this.updateSeniorTotal();
        }
        
        this.saveData();
    }

    calculateComparison() {
        const currentTotal = this.getCurrentTotal();
        const seniorTotal = this.getSeniorTotal();

        if (currentTotal === 0 && seniorTotal === 0) {
            this.showAlert('Please enter some costs to see your comparison.', 'warning');
            return;
        }

        if (seniorTotal === 0) {
            this.showAlert('Please select your Sunscape care level to see the comparison.', 'warning');
            return;
        }

        const difference = seniorTotal - currentTotal;
        const percentageDiff = currentTotal > 0 ? (difference / currentTotal) * 100 : 0;

        this.displayResults(currentTotal, seniorTotal, difference, percentageDiff);
        this.showComparisonSection();
    }

    displayResults(currentTotal, seniorTotal, difference, percentageDiff) {
        // Update comparison cards
        document.getElementById('currentAmount').textContent = this.formatCurrency(currentTotal);
        document.getElementById('seniorAmount').textContent = this.formatCurrency(seniorTotal);
        document.getElementById('differenceAmount').textContent = this.formatCurrency(Math.abs(difference));

        // Calculate percentages
        const total = currentTotal + seniorTotal;
        const currentPercentage = total > 0 ? (currentTotal / total) * 100 : 0;
        const seniorPercentage = total > 0 ? (seniorTotal / total) * 100 : 0;

        document.getElementById('currentPercentage').textContent = `${currentPercentage.toFixed(1)}%`;
        document.getElementById('seniorPercentage').textContent = `${seniorPercentage.toFixed(1)}%`;
        document.getElementById('differencePercentage').textContent = `${Math.abs(percentageDiff).toFixed(1)}%`;

        // Populate current living cost breakdown
        this.populateCurrentBreakdown();

        // Update annual breakdown
        const currentAnnual = currentTotal * 12;
        const seniorAnnual = seniorTotal * 12;
        const annualSavings = currentAnnual - seniorAnnual;

        document.getElementById('currentAnnual').textContent = this.formatCurrency(currentAnnual);
        document.getElementById('seniorAnnual').textContent = this.formatCurrency(seniorAnnual);
        document.getElementById('annualSavings').textContent = this.formatCurrency(Math.abs(annualSavings));

        // Update savings message
        this.updateSavingsMessage(difference, percentageDiff, annualSavings);

        // Show export button
        document.getElementById('exportBtn').style.display = 'flex';
    }

    populateCurrentBreakdown() {
        const breakdownContainer = document.getElementById('currentBreakdown');
        breakdownContainer.innerHTML = '';

        const categories = [
            { id: 'housing', label: 'Housing' },
            { id: 'utilities', label: 'Utilities' },
            { id: 'food', label: 'Food & Groceries' },
            { id: 'healthcare', label: 'Healthcare' },
            { id: 'transportation', label: 'Transportation' },
            { id: 'maintenance', label: 'Maintenance' },
            { id: 'insurance', label: 'Insurance' },
            { id: 'entertainment', label: 'Entertainment' },
            { id: 'other', label: 'Other Expenses' }
        ];

        categories.forEach(category => {
            const value = parseFloat(document.getElementById(category.id).value) || 0;
            if (value > 0) {
                const item = document.createElement('div');
                item.className = 'cost-item';
                item.innerHTML = `
                    <span class="item-name">${category.label}</span>
                    <span class="item-amount">${this.formatCurrency(value)}</span>
                `;
                breakdownContainer.appendChild(item);
            }
        });
    }

    updateSavingsMessage(difference, percentageDiff, annualSavings) {
        const messageElement = document.getElementById('savingsMessage');
        let message = '';
        let className = '';

        if (difference < 0) {
            // Sunscape is cheaper
            message = `Excellent! Sunscape Boca Raton could save you ${this.formatCurrency(Math.abs(difference))} every month (${Math.abs(percentageDiff).toFixed(1)}% less than your current costs). That's ${this.formatCurrency(Math.abs(annualSavings))} in annual savings! Experience luxury senior living while saving money.`;
            className = 'positive';
        } else if (difference > 0) {
            // Sunscape is more expensive
            message = `Sunscape Boca Raton would cost ${this.formatCurrency(difference)} more per month (${percentageDiff.toFixed(1)}% more than your current costs). That's ${this.formatCurrency(annualSavings)} more annually. Remember to consider the premium value of luxury amenities, gourmet dining, concierge services, and the beautiful Boca Raton location.`;
            className = 'negative';
        } else {
            // Costs are the same
            message = 'Your costs would be about the same! Experience luxury senior living with premium amenities, gourmet dining, and exceptional care in beautiful Boca Raton at Sunscape.';
            className = 'neutral';
        }

        messageElement.textContent = message;
        messageElement.className = `savings-message ${className}`;
    }

    showComparisonSection() {
        const comparisonSection = document.getElementById('comparisonSection');
        comparisonSection.style.display = 'block';
        comparisonSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    getCurrentTotal() {
        const categories = [
            'housing', 'utilities', 'food', 'healthcare', 
            'transportation', 'maintenance', 'insurance', 
            'entertainment', 'other'
        ];

        return categories.reduce((total, category) => {
            return total + (parseFloat(document.getElementById(category).value) || 0);
        }, 0);
    }

    getSeniorTotal() {
        return parseFloat(document.getElementById('seniorHousing').value) || 0;
    }

    resetCalculator() {
        if (confirm('Are you sure you want to start over? This will clear all your data.')) {
            // Reset all input fields
            const inputs = document.querySelectorAll('input[type="number"]');
            inputs.forEach(input => {
                input.value = '';
            });

            // Reset facility type
            document.getElementById('facilityType').value = '';

            // Reset totals
            document.getElementById('currentTotal').textContent = '$0.00';
            document.getElementById('seniorTotal').textContent = '$0.00';

            // Hide comparison section
            document.getElementById('comparisonSection').style.display = 'none';
            document.getElementById('exportBtn').style.display = 'none';

            // Clear saved data
            this.clearSavedData();

            this.showAlert('All done! Your calculator is ready for a fresh start.', 'info');
        }
    }

    exportResults() {
        const currentTotal = this.getCurrentTotal();
        const seniorTotal = this.getSeniorTotal();
        const difference = seniorTotal - currentTotal;

        const data = {
            timestamp: new Date().toLocaleString(),
            currentCosts: this.currentCosts,
            sunscapeCosts: {
                baseCost: seniorTotal,
                includedServices: [
                    'Gourmet Meals & Dining',
                    'Healthcare Services',
                    'Luxury Activities & Programs',
                    'Concierge Transportation',
                    'All Utilities',
                    'Housekeeping & Maintenance',
                    '24/7 Care Support'
                ]
            },
            totals: {
                current: currentTotal,
                sunscape: seniorTotal,
                difference: difference,
                annual: {
                    current: currentTotal * 12,
                    sunscape: seniorTotal * 12,
                    savings: (currentTotal - seniorTotal) * 12
                }
            },
            facilityType: document.getElementById('facilityType').value
        };

        const filename = `sunscape-boca-raton-cost-comparison-${new Date().toISOString().split('T')[0]}.json`;
        this.downloadJSON(data, filename);
    }

    downloadJSON(data, filename) {
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showAlert('Perfect! Your results have been saved to your computer.', 'success');
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    }

    showAlert(message, type = 'info') {
        // Create alert element
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <div class="alert-content">
                <i class="fas ${this.getAlertIcon(type)}"></i>
                <span>${message}</span>
                <button class="alert-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Style the alert
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getAlertColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 1000;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        `;

        // Add to page
        document.body.appendChild(alert);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove();
            }
        }, 5000);
    }

    getAlertIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    getAlertColor(type) {
        const colors = {
            success: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
            error: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
            warning: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
            info: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)'
        };
        return colors[type] || colors.info;
    }

    saveData() {
        const data = {
            currentCosts: this.currentCosts,
            seniorCosts: this.seniorCosts,
            facilityType: document.getElementById('facilityType').value,
            timestamp: new Date().toISOString()
        };

        try {
            localStorage.setItem('sunscapeCalculatorData', JSON.stringify(data));
        } catch (e) {
            console.warn('Could not save data to localStorage:', e);
        }
    }

    loadSavedData() {
        try {
            const saved = localStorage.getItem('sunscapeCalculatorData');
            if (saved) {
                const data = JSON.parse(saved);
                
                // Load current costs
                if (data.currentCosts) {
                    Object.keys(data.currentCosts).forEach(category => {
                        const element = document.getElementById(category);
                        if (element) {
                            element.value = data.currentCosts[category].toFixed(2);
                        }
                    });
                }

                // Load senior costs
                if (data.seniorCosts && data.seniorCosts.seniorHousing) {
                    document.getElementById('seniorHousing').value = data.seniorCosts.seniorHousing.toFixed(2);
                }

                // Load facility type
                if (data.facilityType) {
                    document.getElementById('facilityType').value = data.facilityType;
                }

                // Update totals
                this.updateCurrentTotal();
                this.updateSeniorTotal();
            }
        } catch (e) {
            console.warn('Could not load saved data:', e);
        }
    }

    clearSavedData() {
        try {
            localStorage.removeItem('sunscapeCalculatorData');
        } catch (e) {
            console.warn('Could not clear saved data:', e);
        }
    }
}

// Initialize the calculator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SeniorLivingCalculator();
});

// Add CSS for alert animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .alert-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .alert-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        margin-left: auto;
        opacity: 0.7;
        transition: opacity 0.3s ease;
    }
    
    .alert-close:hover {
        opacity: 1;
    }
`;
document.head.appendChild(style); 