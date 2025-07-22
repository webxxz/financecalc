function calculateLoanInterestRate() {
    const loanAmount = parseFloat(document.getElementById('loanAmountIR').value);
    const emi = parseFloat(document.getElementById('emiIR').value);
    let loanTenure = parseFloat(document.getElementById('loanTenureIR').value);
    const tenureUnit = document.getElementById('tenureUnitIR').value;

    if (isNaN(loanAmount) || isNaN(emi) || isNaN(loanTenure) || loanAmount <= 0 || emi <= 0 || loanTenure <= 0) {
        alert('Please enter valid positive numbers for all fields.');
        return;
    }

    let numberOfMonths;
    if (tenureUnit === 'years') {
        numberOfMonths = loanTenure * 12;
    } else {
        numberOfMonths = loanTenure;
    }

    // Check for impossible scenarios (EMI too low to even cover principal over tenure)
    if (emi * numberOfMonths < loanAmount) {
        document.getElementById('estimatedInterestRate').textContent = `Impossible (EMI too low)`;
        return;
    }

    // If EMI * N = P, then interest rate is 0%
    if (emi * numberOfMonths === loanAmount) {
        document.getElementById('estimatedInterestRate').textContent = `0 %`;
        return;
    }

    // Function to calculate EMI for a given monthly interest rate
    function calculateEmiForRate(principal, monthlyRate, months) {
        if (monthlyRate === 0) {
            return principal / months;
        }
        const power = Math.pow(1 + monthlyRate, months);
        return principal * monthlyRate * power / (power - 1);
    }

    let low = 0.0000001; // Start with a very small positive rate (0.00001% monthly)
    let high = 1.0;      // Max 100% monthly interest rate (very high, but safe upper bound)
    const tolerance = 0.0000001; // Tolerance for EMI difference
    const maxIterations = 1000; // Max iterations for approximation

    let monthlyInterestRate = 0;

    for (let i = 0; i < maxIterations; i++) {
        let mid = (low + high) / 2;
        let calculatedEmi = calculateEmiForRate(loanAmount, mid, numberOfMonths);

        if (Math.abs(calculatedEmi - emi) < tolerance) {
            monthlyInterestRate = mid;
            break;
        }

        if (calculatedEmi < emi) {
            low = mid; // Need a higher rate to increase EMI
        } else {
            high = mid; // Need a lower rate to decrease EMI
        }

        if (i === maxIterations - 1) {
            // If max iterations reached, use the current mid value as the best approximation
            monthlyInterestRate = mid;
        }
    }

    const annualInterestRate = monthlyInterestRate * 12 * 100; // Convert to annual percentage

    document.getElementById('estimatedInterestRate').textContent = `${annualInterestRate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`;
}
