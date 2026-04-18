from math import pow

from app.schemas.calculators import CarLoanRequest
from app.schemas.common import StandardResponse


def calculate_car_loan(data: CarLoanRequest) -> StandardResponse:
    car_price = data.car_price
    down_payment = data.down_payment
    loan_amount = max(car_price - down_payment, 0)
    monthly_rate = data.annual_interest_rate / 1200
    tenure_months = data.tenure_months

    if loan_amount == 0:
        monthly_emi = 0.0
        total_payment = 0.0
        total_interest_paid = 0.0
    elif monthly_rate == 0:
        monthly_emi = loan_amount / tenure_months
        total_payment = monthly_emi * tenure_months
        total_interest_paid = 0.0
    else:
        monthly_emi = loan_amount * monthly_rate * pow(1 + monthly_rate, tenure_months) / (pow(1 + monthly_rate, tenure_months) - 1)
        total_payment = monthly_emi * tenure_months
        total_interest_paid = total_payment - loan_amount

    down_payment_percentage = (down_payment / car_price * 100) if car_price > 0 else 0.0

    return StandardResponse(
        result={
            "loan_amount": round(loan_amount, 2),
            "monthly_emi": round(monthly_emi, 2),
            "total_payment": round(total_payment, 2),
            "total_interest_paid": round(total_interest_paid, 2),
            "down_payment_percentage": round(down_payment_percentage, 2),
        },
        summary=(
            f"For a ₹{car_price:,.2f} car with ₹{down_payment:,.2f} down payment at {data.annual_interest_rate:.2f}%, "
            f"your EMI is ₹{monthly_emi:,.2f} for {tenure_months} months."
        ),
        insights=[
            "A down payment around 20% can reduce both EMI burden and total interest outgo.",
            "Compare shorter vs longer tenure options: shorter tenure raises EMI but lowers total interest.",
            "Remember to budget for insurance, registration, and maintenance beyond EMI costs.",
        ],
    )
