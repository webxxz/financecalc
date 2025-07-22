function calculateHomeLoanEligibility() {
    const monthlyIncome = parseFloat(document.getElementById('monthlyIncome').value);
    const existingEMIs = parseFloat(document.getElementById('existingEMIs').value);
    const applicantAge = parseInt(document.getElementById('applicantAge').value);
    const city = document.getElementById('city').value;

    if (isNaN(monthlyIncome) || isNaN(existingEMIs) || isNaN(applicantAge) || monthlyIncome <= 0 || existingEMIs < 0 || applicantAge <= 0) {
        alert('Please enter valid positive numbers for Monthly Income, Existing EMIs, and Age.');
        return;
    }

    // Assume 50% of net salary can go towards EMI
    const maxAffordableEMI = (monthlyIncome * 0.50) - existingEMIs;

    if (maxAffordableEMI <= 0) {
        document.getElementById('eligibleLoanAmount').textContent = `₹ 0 (Not eligible based on current income and EMIs)`;
        return;
    }

    // Indicative Home Loan Interest Rate (e.g., 8.5% p.a.) and Tenure (e.g., 20 years)
    const indicativeAnnualInterestRate = 8.5; // % p.a.
    const indicativeLoanTenureYears = 20; // Years

    const monthlyInterestRate = (indicativeAnnualInterestRate / 12) / 100;
    const numberOfMonths = indicativeLoanTenureYears * 12;

    let eligibleLoanAmount;
    if (monthlyInterestRate === 0) {
        eligibleLoanAmount = maxAffordableEMI * numberOfMonths;
    } else {
        // P = EMI * [(1+R)^N-1] / [R * (1+R)^N]
        eligibleLoanAmount = maxAffordableEMI * (Math.pow(1 + monthlyInterestRate, numberOfMonths) - 1) / (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfMonths));
    }

    document.getElementById('eligibleLoanAmount').textContent = `₹ ${eligibleLoanAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
