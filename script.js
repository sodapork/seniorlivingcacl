// Senior Living Cost Calculator JavaScript

class SeniorLivingCalculator {
    constructor() {
        this.currentCosts = {};
        this.seniorCosts = {};
        this.estimates = {
            independent: { min: 2000, max: 4000, avg: 3000 },
            assisted: { min: 3500, max: 6000, avg: 4750 },
            memory: { min: 4500, max: 7500, avg: 6000 },
            nursing: { min: 7000, max: 10000, avg: 8500 },
            ccrc: { min: 3000, max: 8000, avg: 5500 }
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
            this.updateFacilityType(e.target.value);
        });

        // Quick estimate buttons
        document.querySelectorAll('.btn-estimate').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                this.applyEstimate(type);
            });
        });

        // Real-time total updates
        this.setupRealTimeUpdates();
    }

    setupInputValidation() {
        const inputs = document.querySelectorAll('input[type="number"]');
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

        const seniorInputs = [
            'seniorHousing', 'seniorMeals', 'seniorHealthcare',
            'seniorActivities', 'seniorTransportation', 
            'seniorUtilities', 'seniorOther'
        ];

        currentInputs.forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                this.updateCurrentTotal();
            });
        });

        seniorInputs.forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                this.updateSeniorTotal();
            });
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
        const categories = [
            'seniorHousing', 'seniorMeals', 'seniorHealthcare',
            'seniorActivities', 'seniorTransportation', 
            'seniorUtilities', 'seniorOther'
        ];

        let total = 0;
        categories.forEach(category => {
            const value = parseFloat(document.getElementById(category).value) || 0;
            total += value;
            this.seniorCosts[category] = value;
        });

        document.getElementById('seniorTotal').textContent = this.formatCurrency(total);
    }

    calculateComparison() {
        const currentTotal = this.getCurrentTotal();
        const seniorTotal = this.getSeniorTotal();

        if (currentTotal === 0 && seniorTotal === 0) {
            this.showAlert('Please enter some costs to see your comparison.', 'warning');
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

    updateSavingsMessage(difference, percentageDiff, annualSavings) {
        const messageElement = document.getElementById('savingsMessage');
        let message = '';
        let className = '';

        if (difference < 0) {
            // Senior living is cheaper
            message = `Great news! Senior living could save you ${this.formatCurrency(Math.abs(difference))} every month (${Math.abs(percentageDiff).toFixed(1)}% less than your current costs). That's ${this.formatCurrency(Math.abs(annualSavings))} in annual savings!`;
            className = 'positive';
        } else if (difference > 0) {
            // Senior living is more expensive
            message = `Senior living would cost ${this.formatCurrency(difference)} more per month (${percentageDiff.toFixed(1)}% more than your current costs). That's ${this.formatCurrency(annualSavings)} more annually. Remember to consider the value of included services and amenities.`;
            className = 'negative';
        } else {
            // Costs are the same
            message = 'Your costs would be about the same! Consider the value of convenience, included services, and the community lifestyle when making your decision.';
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
        const categories = [
            'seniorHousing', 'seniorMeals', 'seniorHealthcare',
            'seniorActivities', 'seniorTransportation', 
            'seniorUtilities', 'seniorOther'
        ];

        return categories.reduce((total, category) => {
            return total + (parseFloat(document.getElementById(category).value) || 0);
        }, 0);
    }

    applyEstimate(type) {
        const estimate = this.estimates[type];
        if (!estimate) return;

        // Set facility type
        document.getElementById('facilityType').value = type;

        // Apply average estimate to base cost
        document.getElementById('seniorHousing').value = estimate.avg.toFixed(2);

        // Apply typical breakdown for the facility type
        this.applyTypicalBreakdown(type);

        // Update totals
        this.updateSeniorTotal();

        // Show success message
        this.showAlert(`Great! I've filled in typical ${type} living costs for you: ${this.formatCurrency(estimate.avg)}/month`, 'success');
    }

    applyTypicalBreakdown(type) {
        const breakdowns = {
            independent: {
                seniorMeals: 400,
                seniorHealthcare: 200,
                seniorActivities: 150,
                seniorTransportation: 100,
                seniorUtilities: 300,
                seniorOther: 200
            },
            assisted: {
                seniorMeals: 600,
                seniorHealthcare: 800,
                seniorActivities: 200,
                seniorTransportation: 150,
                seniorUtilities: 400,
                seniorOther: 300
            },
            memory: {
                seniorMeals: 700,
                seniorHealthcare: 1200,
                seniorActivities: 300,
                seniorTransportation: 200,
                seniorUtilities: 500,
                seniorOther: 400
            },
            nursing: {
                seniorMeals: 800,
                seniorHealthcare: 2000,
                seniorActivities: 150,
                seniorTransportation: 100,
                seniorUtilities: 600,
                seniorOther: 500
            },
            ccrc: {
                seniorMeals: 500,
                seniorHealthcare: 400,
                seniorActivities: 250,
                seniorTransportation: 120,
                seniorUtilities: 350,
                seniorOther: 250
            }
        };

        const breakdown = breakdowns[type];
        if (breakdown) {
            Object.keys(breakdown).forEach(field => {
                document.getElementById(field).value = breakdown[field].toFixed(2);
            });
        }
    }

    updateFacilityType(type) {
        // Update any facility-specific logic here
        console.log(`Facility type changed to: ${type}`);
    }

    resetCalculator() {
        if (confirm('Are you sure you want to start over? This will clear all your data.')) {
            // Reset all input fields
            const inputs = document.querySelectorAll('input[type="number"]');
            inputs.forEach(input => {
                input.value = '';
            });

            // Reset facility type
            document.getElementById('facilityType').value = 'independent';

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
            seniorCosts: this.seniorCosts,
            totals: {
                current: currentTotal,
                senior: seniorTotal,
                difference: difference,
                annual: {
                    current: currentTotal * 12,
                    senior: seniorTotal * 12,
                    savings: (currentTotal - seniorTotal) * 12
                }
            },
            facilityType: document.getElementById('facilityType').value
        };

        const filename = `senior-living-cost-comparison-${new Date().toISOString().split('T')[0]}.json`;
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
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    showAlert(message, type = 'info') {
        // Create alert element
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
        `;

        // Set background color based on type
        const colors = {
            success: '#48bb78',
            error: '#f56565',
            warning: '#ed8936',
            info: '#4299e1'
        };
        alert.style.backgroundColor = colors[type] || colors.info;

        // Add to page
        document.body.appendChild(alert);

        // Remove after 4 seconds
        setTimeout(() => {
            alert.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.parentNode.removeChild(alert);
                }
            }, 300);
        }, 4000);
    }

    saveData() {
        const data = {
            currentCosts: {},
            seniorCosts: {},
            facilityType: document.getElementById('facilityType').value
        };

        // Save current costs
        ['housing', 'utilities', 'food', 'healthcare', 'transportation', 'maintenance', 'insurance', 'entertainment', 'other'].forEach(id => {
            const value = document.getElementById(id).value;
            if (value) data.currentCosts[id] = value;
        });

        // Save senior costs
        ['seniorHousing', 'seniorMeals', 'seniorHealthcare', 'seniorActivities', 'seniorTransportation', 'seniorUtilities', 'seniorOther'].forEach(id => {
            const value = document.getElementById(id).value;
            if (value) data.seniorCosts[id] = value;
        });

        localStorage.setItem('seniorLivingCalculator', JSON.stringify(data));
    }

    loadSavedData() {
        const saved = localStorage.getItem('seniorLivingCalculator');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                
                // Load current costs
                Object.keys(data.currentCosts).forEach(id => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.value = data.currentCosts[id];
                    }
                });

                // Load senior costs
                Object.keys(data.seniorCosts).forEach(id => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.value = data.seniorCosts[id];
                    }
                });

                // Load facility type
                if (data.facilityType) {
                    document.getElementById('facilityType').value = data.facilityType;
                }

                // Update totals
                this.updateCurrentTotal();
                this.updateSeniorTotal();

            } catch (e) {
                console.error('Error loading saved data:', e);
            }
        }
    }

    clearSavedData() {
        localStorage.removeItem('seniorLivingCalculator');
    }
}

// Add CSS animations for alerts
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SeniorLivingCalculator();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                document.getElementById('calculateBtn').click();
                break;
            case 'r':
                e.preventDefault();
                document.getElementById('resetBtn').click();
                break;
            case 'e':
                e.preventDefault();
                const exportBtn = document.getElementById('exportBtn');
                if (exportBtn.style.display !== 'none') {
                    exportBtn.click();
                }
                break;
        }
    }
}); 