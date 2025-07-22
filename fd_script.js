function calculateFD() {
    const principalAmount = parseFloat(document.getElementById('principalAmount').value);
    const interestRate = parseFloat(document.getElementById('fdInterestRate').value);
    let duration = parseFloat(document.getElementById('fdDuration').value);
    const durationUnit = document.getElementById('fdDurationUnit').value;
    const compoundingFrequency = parseFloat(document.getElementById('compoundingFrequency').value);

    if (isNaN(principalAmount) || isNaN(interestRate) || isNaN(duration) || principalAmount <= 0 || interestRate < 0 || duration <= 0) {
        alert('Please enter valid positive numbers for all fields.');
        return;
    }

    // Convert duration to years if in months
    let timeInYears;
    if (durationUnit === 'months') {
        timeInYears = duration / 12;
    } else {
        timeInYears = duration;
    }

    // Convert annual interest rate to decimal
    const annualInterestRateDecimal = interestRate / 100;

    // A = P(1 + r/n)^(nt)
    const maturityAmount = principalAmount * Math.pow((1 + annualInterestRateDecimal / compoundingFrequency), (compoundingFrequency * timeInYears));
    const totalInterestEarned = maturityAmount - principalAmount;

    document.getElementById('maturityAmount').textContent = `₹ ${maturityAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('totalInterestEarned').textContent = `₹ ${totalInterestEarned.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
