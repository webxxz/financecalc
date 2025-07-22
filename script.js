function calculateEMI() {
    const loanAmount = parseFloat(document.getElementById('loanAmount').value);
    const interestRate = parseFloat(document.getElementById('interestRate').value);
    let loanTenure = parseFloat(document.getElementById('loanTenure').value);
    const tenureUnit = document.getElementById('tenureUnit').value;

    if (isNaN(loanAmount) || isNaN(interestRate) || isNaN(loanTenure) || loanAmount <= 0 || interestRate < 0 || loanTenure <= 0) {
        alert('Please enter valid positive numbers for all fields.');
        return;
    }

    // Convert annual interest rate to monthly and percentage to decimal
    const monthlyInterestRate = (interestRate / 12) / 100;

    // Convert tenure to months if in years
    let numberOfMonths;
    if (tenureUnit === 'years') {
        numberOfMonths = loanTenure * 12;
    } else {
        numberOfMonths = loanTenure;
    }

    let emi;
    if (monthlyInterestRate === 0) {
        emi = loanAmount / numberOfMonths;
    } else {
        emi = loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfMonths) / (Math.pow(1 + monthlyInterestRate, numberOfMonths) - 1);
    }

    const totalPayment = emi * numberOfMonths;
    const totalInterest = totalPayment - loanAmount;

    document.getElementById('monthlyEMI').textContent = `₹ ${emi.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('totalInterest').textContent = `₹ ${totalInterest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('totalPayment').textContent = `₹ ${totalPayment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
