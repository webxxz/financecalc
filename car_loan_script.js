function calculateCarLoanEMI() {
    const loanAmount = parseFloat(document.getElementById('carLoanAmount').value);
    const interestRate = parseFloat(document.getElementById('carInterestRate').value);
    let loanTenure = parseFloat(document.getElementById('carLoanTenure').value);
    const tenureUnit = document.getElementById('carTenureUnit').value;

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

    document.getElementById('carMonthlyEMI').textContent = `₹ ${emi.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('carTotalInterest').textContent = `₹ ${totalInterest.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('carTotalPayment').textContent = `₹ ${totalPayment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
