from dataclasses import dataclass

from fastapi import HTTPException

from app.schemas.calculators import DebtPayoffRequest
from app.schemas.common import StandardResponse


@dataclass
class Debt:
    name: str
    balance: float
    rate: float


def _minimum_payment(balance: float, annual_rate: float) -> float:
    return (balance * annual_rate / 1200) + 10


def _order_debts(debts: list[Debt], strategy: str) -> list[Debt]:
    active = [debt for debt in debts if debt.balance > 0.01]
    if strategy == "snowball":
        return sorted(active, key=lambda debt: (debt.balance, -debt.rate))
    return sorted(active, key=lambda debt: (-debt.rate, debt.balance))


def _simulate_strategy(initial_debts: list[Debt], monthly_budget: float, strategy: str) -> tuple[int, float]:
    debts = [Debt(name=debt.name, balance=debt.balance, rate=debt.rate) for debt in initial_debts]
    months = 0
    total_interest_paid = 0.0
    max_months = 1200

    while any(debt.balance > 0.01 for debt in debts) and months < max_months:
        ordered = _order_debts(debts, strategy)
        interests = {debt.name: debt.balance * debt.rate / 1200 for debt in ordered}
        minimums = {debt.name: min(_minimum_payment(debt.balance, debt.rate), debt.balance + interests[debt.name]) for debt in ordered}
        total_minimum = sum(minimums.values())

        if monthly_budget < total_minimum:
            raise HTTPException(
                status_code=400,
                detail=f"Monthly payment budget is too low for {strategy} strategy minimum payments.",
            )

        extra = monthly_budget - total_minimum
        payments = minimums.copy()

        for debt in ordered:
            if extra <= 0:
                break
            remaining_due = max((debt.balance + interests[debt.name]) - payments[debt.name], 0)
            extra_payment = min(extra, remaining_due)
            payments[debt.name] += extra_payment
            extra -= extra_payment

        for debt in debts:
            if debt.balance <= 0.01:
                continue
            interest = debt.balance * debt.rate / 1200
            payment = min(payments.get(debt.name, 0), debt.balance + interest)
            total_interest_paid += interest
            debt.balance = max(debt.balance + interest - payment, 0)

        months += 1

    if any(debt.balance > 0.01 for debt in debts):
        raise HTTPException(status_code=400, detail="Payoff horizon exceeds supported range with the current monthly budget.")

    return months, total_interest_paid


def calculate_debt_payoff(data: DebtPayoffRequest) -> StandardResponse:
    debts = [
        Debt(name=data.debt_1_name or "Debt 1", balance=data.debt_1_balance, rate=data.debt_1_rate),
        Debt(name=data.debt_2_name or "Debt 2", balance=data.debt_2_balance, rate=data.debt_2_rate),
        Debt(name=data.debt_3_name or "Debt 3", balance=data.debt_3_balance, rate=data.debt_3_rate),
    ]
    debts = [debt for debt in debts if debt.balance > 0]
    if not debts:
        raise HTTPException(status_code=400, detail="Provide at least one debt with balance greater than zero.")

    snowball_months, snowball_interest = _simulate_strategy(debts, data.monthly_payment_budget, "snowball")
    avalanche_months, avalanche_interest = _simulate_strategy(debts, data.monthly_payment_budget, "avalanche")

    avalanche_saves = snowball_interest - avalanche_interest
    months_faster = max(snowball_months - avalanche_months, 0)
    total_debt = sum(debt.balance for debt in debts)
    recommended_strategy = "avalanche" if avalanche_saves > 0 else "either"

    return StandardResponse(
        result={
            "snowball_months": snowball_months,
            "snowball_total_interest": round(snowball_interest, 2),
            "avalanche_months": avalanche_months,
            "avalanche_total_interest": round(avalanche_interest, 2),
            "avalanche_saves": round(avalanche_saves, 2),
            "recommended_strategy": recommended_strategy,
            "total_debt": round(total_debt, 2),
        },
        summary=f"Using the avalanche method saves ₹{max(avalanche_saves, 0):,.2f} and pays off {months_faster} months faster.",
        insights=[
            "Snowball builds momentum by clearing smaller balances earlier.",
            "Avalanche typically reduces total interest by targeting high-rate debt first.",
            "Higher monthly payment budgets shorten payoff time in both strategies.",
            "Compare motivation vs interest savings to choose the best strategy for you.",
        ],
    )
