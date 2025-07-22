function calculateIncomeTax() {
    const annualIncome = parseFloat(document.getElementById('annualIncome').value);
    const age = parseInt(document.getElementById('age').value);
    const deduction80C = parseFloat(document.getElementById('deduction80C').value);
    const deduction80D = parseFloat(document.getElementById('deduction80D').value);
    const regime = document.getElementById('regime').value;

    if (isNaN(annualIncome) || isNaN(age) || isNaN(deduction80C) || isNaN(deduction80D) || annualIncome < 0 || age < 0 || deduction80C < 0 || deduction80D < 0) {
        alert('Please enter valid positive numbers for all fields.');
        return;
    }

    let taxableIncome = annualIncome;
    let incomeTax = 0;
    let surcharge = 0;
    let cess = 0;
    let totalTaxPayable = 0;

    if (regime === 'old') {
        // Apply 80C deduction (max 1.5 Lakhs)
        const actual80CDeduction = Math.min(deduction80C, 150000);
        taxableIncome = annualIncome - actual80CDeduction - deduction80D;

        if (taxableIncome < 0) taxableIncome = 0;

        if (age < 60) { // Below 60 years
            if (taxableIncome <= 250000) {
                incomeTax = 0;
            } else if (taxableIncome <= 500000) {
                incomeTax = (taxableIncome - 250000) * 0.05;
            } else if (taxableIncome <= 1000000) {
                incomeTax = 12500 + (taxableIncome - 500000) * 0.20;
            } else {
                incomeTax = 112500 + (taxableIncome - 1000000) * 0.30;
            }
        } else if (age >= 60 && age < 80) { // Senior Citizens
            if (taxableIncome <= 300000) {
                incomeTax = 0;
            } else if (taxableIncome <= 500000) {
                incomeTax = (taxableIncome - 300000) * 0.05;
            } else if (taxableIncome <= 1000000) {
                incomeTax = 10000 + (taxableIncome - 500000) * 0.20;
            } else {
                incomeTax = 110000 + (taxableIncome - 1000000) * 0.30;
            }
        } else { // Super Senior Citizens
            if (taxableIncome <= 500000) {
                incomeTax = 0;
            } else if (taxableIncome <= 1000000) {
                incomeTax = (taxableIncome - 500000) * 0.20;
            } else {
                incomeTax = 100000 + (taxableIncome - 1000000) * 0.30;
            }
        }

        // Rebate u/s 87A for Old Regime
        if (taxableIncome <= 500000) {
            incomeTax = Math.max(0, incomeTax - 12500);
        }

    } else { // New Regime
        // No deductions in new regime for simplicity, as per common understanding.
        // Standard deduction for salaried individuals is applicable in new regime from FY 2023-24, but not explicitly asked.
        // For this calculator, we'll assume no deductions for new regime unless specified.
        taxableIncome = annualIncome;

        if (taxableIncome <= 300000) {
            incomeTax = 0;
        } else if (taxableIncome <= 600000) {
            incomeTax = (taxableIncome - 300000) * 0.05;
        } else if (taxableIncome <= 900000) {
            incomeTax = 15000 + (taxableIncome - 600000) * 0.10;
        } else if (taxableIncome <= 1200000) {
            incomeTax = 45000 + (taxableIncome - 900000) * 0.15;
        } else if (taxableIncome <= 1500000) {
            incomeTax = 90000 + (taxableIncome - 1200000) * 0.20;
        } else {
            incomeTax = 150000 + (taxableIncome - 1500000) * 0.30;
        }

        // Rebate u/s 87A for New Regime
        if (taxableIncome <= 700000) {
            incomeTax = 0; // Full rebate if tax is within limit
        }
    }

    // Surcharge calculation
    if (taxableIncome > 5000000 && taxableIncome <= 10000000) {
        surcharge = incomeTax * 0.10;
    } else if (taxableIncome > 10000000 && taxableIncome <= 20000000) {
        surcharge = incomeTax * 0.15;
    } else if (taxableIncome > 20000000 && taxableIncome <= 50000000) {
        surcharge = incomeTax * 0.25;
    } else if (taxableIncome > 50000000) {
        surcharge = incomeTax * 0.37;
    }

    // Health & Education Cess
    cess = (incomeTax + surcharge) * 0.04;

    totalTaxPayable = incomeTax + surcharge + cess;

    document.getElementById('taxableIncome').textContent = `₹ ${taxableIncome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('incomeTax').textContent = `₹ ${incomeTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('surcharge').textContent = `₹ ${surcharge.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('cess').textContent = `₹ ${cess.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('totalTaxPayable').textContent = `₹ ${totalTaxPayable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
