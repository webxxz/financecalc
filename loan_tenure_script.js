function calculateLoanTenure() {
    const loanAmount = parseFloat(document.getElementById('loanAmountTenure').value);
    const emi = parseFloat(document.getElementById('emiTenure').value);
    const annualInterestRate = parseFloat(document.getElementById('interestRateTenure').value);

    if (isNaN(loanAmount) || isNaN(emi) || isNaN(annualInterestRate) || loanAmount <= 0 || emi <= 0 || annualInterestRate < 0) {
        alert('Please enter valid positive numbers for all fields.');
        return;
    }

    const monthlyInterestRate = (annualInterestRate / 12) / 100;

    // Check for impossible scenarios (EMI too low)
    if (emi < (loanAmount * monthlyInterestRate) && monthlyInterestRate > 0) {
        document.getElementById('estimatedTenure').textContent = `EMI is too low for this loan amount and interest rate.`;
        return;
    }

    let numberOfMonths;

    if (monthlyInterestRate === 0) {
        numberOfMonths = loanAmount / emi;
    } else {
        // N = -log(1 - P * R / EMI) / log(1 + R)
        const numerator = Math.log(emi / (emi - loanAmount * monthlyInterestRate));
        const denominator = Math.log(1 + monthlyInterestRate);
        numberOfMonths = numerator / denominator;
    }

    if (isNaN(numberOfMonths) || !isFinite(numberOfMonths) || numberOfMonths <= 0) {
        document.getElementById('estimatedTenure').textContent = `Cannot calculate tenure with given inputs.`;
        return;
    }

    const years = Math.floor(numberOfMonths / 12);
    const months = Math.round(numberOfMonths % 12);

    document.getElementById('estimatedTenure').textContent = `${Math.round(numberOfMonths).toLocaleString('en-IN')} Months (${years} Years and ${months} Months)`;
}
