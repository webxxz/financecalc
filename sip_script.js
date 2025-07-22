function calculateSIP() {
    const monthlyInvestment = parseFloat(document.getElementById('monthlyInvestment').value);
    const annualReturn = parseFloat(document.getElementById('annualReturn').value);
    const durationYears = parseFloat(document.getElementById('durationYears').value);

    if (isNaN(monthlyInvestment) || isNaN(annualReturn) || isNaN(durationYears) || monthlyInvestment <= 0 || annualReturn < 0 || durationYears <= 0) {
        alert('Please enter valid positive numbers for all fields.');
        return;
    }

    // Convert annual return to monthly rate and percentage to decimal
    const monthlyRate = (annualReturn / 12) / 100;

    // Calculate total number of months
    const numberOfMonths = durationYears * 12;

    let futureValue;
    if (monthlyRate === 0) {
        futureValue = monthlyInvestment * numberOfMonths;
    } else {
        futureValue = monthlyInvestment * (Math.pow(1 + monthlyRate, numberOfMonths) - 1) / monthlyRate * (1 + monthlyRate);
    }

    const totalInvested = monthlyInvestment * numberOfMonths;
    const estimatedReturns = futureValue - totalInvested;

    document.getElementById('totalInvested').textContent = `₹ ${totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('estimatedReturns').textContent = `₹ ${estimatedReturns.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('futureValue').textContent = `₹ ${futureValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
